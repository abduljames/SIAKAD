# SIAKAD — Sistem Akademik Pondok Pesantren

Proyek terpisah dari Koperasi Digital (`c:/ProyekKoperasi`). Modul awal: Tagihan Santri, Pembayaran Santri, dan Laporan.

## Menjalankan (dev lokal)

1. Nyalakan database:
   ```
   docker compose up -d
   ```
2. Backend (port 3001):
   ```
   cd backend
   npm install
   npm run start:dev
   ```
   Akun admin default dibuat otomatis saat pertama kali jalan: **username `admin`, password `admin123`** — segera ganti sebelum dipakai produksi (belum ada halaman ganti password, ubah langsung lewat database untuk saat ini).
3. Frontend (port dipilih otomatis oleh Vite, biasanya 5174 karena Koperasi pakai 5173):
   ```
   cd frontend
   npm install
   npm run dev
   ```

## Struktur

- `backend/` — NestJS + TypeORM + PostgreSQL. Entitas utama: `AdminUser`, `Kelas`, `Santri`, `JenisTagihan`, `Tagihan` + `TagihanDetail` (rincian multi-baris per tagihan), `Pembayaran`.
- `frontend/` — Vue 3 + Vite. Desain visual baru (bukan reuse dari Koperasi), mengikuti mockup yang diberikan: badge ikon berwarna per kategori, stat card, drawer form geser dari kanan.

## Belum ada di v0 ini (sengaja disederhanakan)

- Ganti password admin lewat UI.
- Multi-role/multi-user (sengaja cuma 1 akun admin, lihat rencana awal).
- Integrasi data Santri dengan Koperasi Digital — data Santri di sini terpisah, diisi manual atau lewat import Excel sendiri.
- Deploy ke server (baru jalan di lokal untuk saat ini).
