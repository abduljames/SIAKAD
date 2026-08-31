#!/bin/bash
# Deploy SIAKAD (backend + frontend) ke VPS produksi. Jalankan dari Git Bash,
# dari folder ProyekSiakad ini: ./deploy.sh
#
# Urutannya sengaja: build image dulu -> pastikan postgres jalan -> jalankan
# migration lewat container sekali-pakai -> baru start backend beneran.
# Supaya backend TIDAK sempat crash-loop nyoba connect ke tabel yang belum
# ada (kejadian nyata waktu deploy pertama kali, 2026-08-31).
set -e

SSH_KEY=~/.ssh/id_ed25519_biznet
SERVER=MA.development@103.197.188.61
REMOTE_DIR=/opt/siakad

cd "$(dirname "$0")"

echo "==> [1/7] Packing source backend (tanpa node_modules/dist)..."
tar --exclude=node_modules --exclude=dist -czf siakad-backend.tar.gz backend

echo "==> [2/7] Upload source backend + docker-compose.prod.yml..."
scp -i "$SSH_KEY" siakad-backend.tar.gz "$SERVER:$REMOTE_DIR/"
scp -i "$SSH_KEY" docker-compose.prod.yml "$SERVER:$REMOTE_DIR/docker-compose.prod.yml"
rm -f siakad-backend.tar.gz

echo "==> [3/7] Extract & build image di server..."
ssh -i "$SSH_KEY" "$SERVER" "cd $REMOTE_DIR && rm -rf backend && tar -xzf siakad-backend.tar.gz && rm siakad-backend.tar.gz && sudo docker compose -f docker-compose.prod.yml build backend"

echo "==> [4/7] Pastikan Postgres jalan..."
ssh -i "$SSH_KEY" "$SERVER" "cd $REMOTE_DIR && sudo docker compose -f docker-compose.prod.yml up -d postgres"

echo "==> [5/7] Jalankan migration database (kalau ada yang baru)..."
ssh -i "$SSH_KEY" "$SERVER" "cd $REMOTE_DIR && sudo docker compose -f docker-compose.prod.yml run --rm backend npm run migration:run:prod"

echo "==> [6/7] Start/restart backend..."
ssh -i "$SSH_KEY" "$SERVER" "cd $REMOTE_DIR && sudo docker compose -f docker-compose.prod.yml up -d backend"

if [ "$1" = "--with-frontend" ]; then
  echo "==> [7/7] Build & upload frontend..."
  (cd frontend && npm run build)
  scp -i "$SSH_KEY" -r frontend/dist/* "$SERVER:$REMOTE_DIR/frontend-dist/"
else
  echo "==> [7/7] Lewati frontend (jalankan dengan './deploy.sh --with-frontend' kalau ada perubahan tampilan juga)"
fi

echo "==> Selesai. Log backend terbaru:"
ssh -i "$SSH_KEY" "$SERVER" "sudo docker logs siakad_backend_prod --tail 20"
