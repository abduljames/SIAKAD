<template>
  <AppLayout
    title="Pembayaran Santri"
    desc="Kelola pembayaran tagihan santri"
    :breadcrumb="[{ label: 'Home', to: '/' }, { label: 'Tagihan Santri' }, { label: 'Pembayaran Santri' }]"
  >
    <div class="stat-row" style="grid-template-columns:repeat(4,1fr);">
      <div class="stat-card">
        <div class="icon" style="background:var(--biru-100);color:#1d4ed8;">🧾</div>
        <div class="label">Total Tagihan</div>
        <div class="value">Rp {{ formatUang(stats.totalTagihan) }}</div>
        <div class="sub">{{ list.length }} Pembayaran tercatat</div>
      </div>
      <div class="stat-card">
        <div class="icon" style="background:var(--indigo-100);color:#4338ca;">💳</div>
        <div class="label">Total Terbayar</div>
        <div class="value">Rp {{ formatUang(stats.totalTerbayar) }}</div>
        <div class="sub">Sudah masuk</div>
      </div>
      <div class="stat-card">
        <div class="icon" style="background:var(--oranye-100);color:#b45309;">⏰</div>
        <div class="label">Total Belum Terbayar</div>
        <div class="value">Rp {{ formatUang(stats.totalBelumTerbayar) }}</div>
        <div class="sub">Sisa tagihan</div>
      </div>
      <div class="stat-card">
        <div class="icon" style="background:var(--ungu-100);color:#6d28d9;">⚠️</div>
        <div class="label">Tunggakan</div>
        <div class="value">{{ stats.jumlahTunggakan }}</div>
        <div class="sub">Tagihan belum lunas</div>
      </div>
    </div>

    <div class="toolbar">
      <div class="toolbar-field">
        <span class="toolbar-label">Periode</span>
        <input v-model="periode" placeholder="Mei 2025" @change="load" />
      </div>
      <div class="toolbar-field" style="flex:1;min-width:180px;">
        <span class="toolbar-label">Cari Santri / NIS</span>
        <input v-model="search" placeholder="Cari nama santri..." @input="load" />
      </div>
      <button class="btn btn-outline" @click="reset" style="align-self:flex-end;">↻ Reset</button>
      <button class="btn btn-outline" style="align-self:flex-end;" @click="exportRekap">⬇ Export</button>
      <button class="btn btn-primary" style="align-self:flex-end;margin-left:auto;" @click="bukaCatat">+ Catat Pembayaran</button>
    </div>

    <div class="table-card">
      <div class="table-card-head"><h3>Daftar Pembayaran</h3></div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>No</th><th>Tanggal Bayar</th><th>No. Pembayaran</th><th>Santri</th><th>Kelas</th><th>Periode</th><th style="text-align:right;">Jumlah Bayar</th><th>Metode</th><th>Status</th><th style="text-align:right;">Aksi</th></tr>
          </thead>
          <tbody>
            <tr v-if="list.length === 0"><td colspan="10"><div class="empty-state"><div class="icon">💳</div>Belum ada pembayaran tercatat</div></td></tr>
            <tr v-for="(p, idx) in list" :key="p.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ formatTanggal(p.tanggalBayar) }}</td>
              <td>{{ p.noPembayaran }}</td>
              <td class="person-cell">
                <div class="avatar-init" :style="{ background: warnaAvatar(p.tagihan?.santri?.nama) }">{{ inisial(p.tagihan?.santri?.nama) }}</div>
                <div>
                  <div class="nama">{{ p.tagihan?.santri?.nama }}</div>
                  <div class="nis">NIS: {{ p.tagihan?.santri?.nis }}</div>
                </div>
              </td>
              <td>{{ p.tagihan?.santri?.kelas?.nama || '-' }}</td>
              <td>{{ p.tagihan?.periode }}</td>
              <td style="text-align:right;">Rp {{ formatUang(p.jumlahBayar) }}</td>
              <td>{{ labelMetode(p) }}</td>
              <td><span class="badge badge-lunas">Lunas</span></td>
              <td style="text-align:right;"><RouterLink class="btn btn-ghost btn-sm" :to="`/pembayaran/${p.id}/kwitansi`">🧾 Kwitansi</RouterLink></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination-bar"><span>Menampilkan {{ list.length }} data</span></div>
    </div>

    <div v-if="drawerOpen" class="drawer-overlay" @click.self="drawerOpen = false">
      <div class="drawer-panel">
        <div class="drawer-head">
          <h3>Catat Pembayaran</h3>
          <button class="drawer-close" @click="drawerOpen = false">✕</button>
        </div>
        <div class="drawer-body">
          <div class="form-group">
            <label>Tagihan <span class="req">*</span></label>
            <select v-model="form.tagihanId" @change="onPilihTagihan">
              <option value="">Pilih tagihan...</option>
              <option v-for="t in tagihanBelumLunas" :key="t.id" :value="t.id">{{ t.noTagihan }} - {{ t.santri?.nama }} ({{ t.periode }})</option>
            </select>
          </div>

          <div v-if="tagihanTerpilih" class="summary-box" style="margin-bottom:16px;">
            <div class="row"><span class="label">Santri</span><span>{{ tagihanTerpilih.santri?.nama }} ({{ tagihanTerpilih.santri?.kelas?.nama || '-' }})</span></div>
            <div class="row"><span class="label">Periode</span><span>{{ tagihanTerpilih.periode }}</span></div>
            <div class="row"><span class="label">Total Tagihan</span><span>Rp {{ formatUang(tagihanTerpilih.totalTagihan) }}</span></div>
            <div class="row"><span class="label">Sudah Terbayar</span><span>Rp {{ formatUang(tagihanTerpilih.totalTerbayar) }}</span></div>
            <div class="row" style="font-weight:800;color:var(--hijau-700);"><span>Sisa Tagihan</span><span>Rp {{ formatUang(sisaTagihan) }}</span></div>
          </div>

          <div class="form-group">
            <label>Tanggal Bayar <span class="req">*</span></label>
            <input v-model="form.tanggalBayar" type="date" />
          </div>
          <div class="form-group">
            <label>Jumlah Bayar (Rp) <span class="req">*</span></label>
            <input v-model.number="form.jumlahBayar" type="number" />
            <div v-if="tagihanTerpilih" class="form-hint">Sisa tagihan: Rp {{ formatUang(sisaTagihan) }}</div>
          </div>
          <div class="form-group">
            <label>Metode <span class="req">*</span></label>
            <div class="pill-select-row" style="grid-template-columns:repeat(2,1fr);">
              <div class="pill-option-sm" :class="{ selected: form.metode === 'Tunai' }" @click="pilihMetode('Tunai')">
                <span class="icon">💵</span><span class="name">Tunai</span>
              </div>
              <div class="pill-option-sm" :class="{ selected: form.metode === 'Transfer' }" @click="pilihMetode('Transfer')">
                <span class="icon">🔄</span><span class="name">Transfer</span>
              </div>
            </div>
          </div>

          <template v-if="form.metode === 'Transfer'">
            <div class="form-group">
              <label style="font-weight:800;">📤 Detail Pengirim</label>
              <div class="pill-select-row" style="grid-template-columns:repeat(2,1fr);margin-bottom:10px;">
                <div class="pill-option-sm" :class="{ selected: pengirim.jenis === 'Bank' }" @click="pilihJenis(pengirim, 'Bank')"><span class="icon">🏦</span><span class="name">Bank</span></div>
                <div class="pill-option-sm" :class="{ selected: pengirim.jenis === 'E-Wallet' }" @click="pilihJenis(pengirim, 'E-Wallet')"><span class="icon">📱</span><span class="name">E-Wallet</span></div>
              </div>
              <div class="chip-select" style="margin-bottom:10px;">
                <div v-for="opt in opsiUntuk(pengirim.jenis)" :key="opt" class="chip-option" :class="{ selected: pengirim.penyedia === opt }" @click="pilihProvider(pengirim, opt)">{{ opt }}</div>
                <div class="chip-option" :class="{ selected: pengirim.lainnya }" @click="pilihLainnya(pengirim)">✏️ Lainnya</div>
              </div>
              <input v-if="pengirim.lainnya" v-model="pengirim.penyedia" placeholder="Nama bank/e-wallet lain" style="margin-bottom:10px;" />
              <input v-model="pengirim.atasNama" placeholder="Atas nama pengirim" />
            </div>

            <div class="form-group">
              <label style="font-weight:800;">📥 Detail Penerima</label>
              <div class="pill-select-row" style="grid-template-columns:repeat(2,1fr);margin-bottom:10px;">
                <div class="pill-option-sm" :class="{ selected: penerima.jenis === 'Bank' }" @click="pilihJenis(penerima, 'Bank')"><span class="icon">🏦</span><span class="name">Bank</span></div>
                <div class="pill-option-sm" :class="{ selected: penerima.jenis === 'E-Wallet' }" @click="pilihJenis(penerima, 'E-Wallet')"><span class="icon">📱</span><span class="name">E-Wallet</span></div>
              </div>
              <div class="chip-select" style="margin-bottom:10px;">
                <div v-for="opt in opsiUntuk(penerima.jenis)" :key="opt" class="chip-option" :class="{ selected: penerima.penyedia === opt }" @click="pilihProvider(penerima, opt)">{{ opt }}</div>
                <div class="chip-option" :class="{ selected: penerima.lainnya }" @click="pilihLainnya(penerima)">✏️ Lainnya</div>
              </div>
              <input v-if="penerima.lainnya" v-model="penerima.penyedia" placeholder="Nama bank/e-wallet lain" style="margin-bottom:10px;" />
              <input v-model="penerima.atasNama" placeholder="Atas nama penerima" />
            </div>
          </template>
          <div class="form-group" style="margin-bottom:0;">
            <label>Catatan</label>
            <textarea v-model="form.catatan" rows="2" placeholder="Opsional"></textarea>
          </div>
        </div>
        <div class="drawer-foot">
          <button class="btn btn-outline" @click="drawerOpen = false">Batal</button>
          <button class="btn btn-primary" @click="simpanPembayaran">Simpan</button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppLayout from '../components/AppLayout.vue';
import api from '../services/api';
import { successDialog, errorDialog, pesanError } from '../composables/useDialog';
import { identitasPonpes } from '../utils/identitasPonpes';

const router = useRouter();

const list = ref([]);
const stats = ref({ totalTagihan: 0, totalTerbayar: 0, totalBelumTerbayar: 0, jumlahTunggakan: 0 });
const search = ref('');
const periode = ref('');
const drawerOpen = ref(false);
const tagihanBelumLunas = ref([]);
const form = ref({ tagihanId: '', tanggalBayar: new Date().toISOString().slice(0, 10), jumlahBayar: 0, metode: 'Tunai', catatan: '' });
const pengirim = ref({ jenis: 'Bank', penyedia: '', lainnya: false, atasNama: '' });
const penerima = ref({ jenis: 'Bank', penyedia: '', lainnya: false, atasNama: identitasPonpes.nama });

const daftarBank = ['BCA', 'BRI', 'BNI', 'Mandiri', 'BSI', 'CIMB Niaga'];
const daftarEwallet = ['OVO', 'GoPay', 'DANA', 'ShopeePay', 'LinkAja'];
function opsiUntuk(jenis) { return jenis === 'Bank' ? daftarBank : daftarEwallet; }

const tagihanTerpilih = computed(() => tagihanBelumLunas.value.find((t) => t.id === form.value.tagihanId) || null);
const sisaTagihan = computed(() => (tagihanTerpilih.value ? Number(tagihanTerpilih.value.totalTagihan) - Number(tagihanTerpilih.value.totalTerbayar) : 0));

function onPilihTagihan() {
  if (tagihanTerpilih.value) form.value.jumlahBayar = sisaTagihan.value;
}

function pilihMetode(m) {
  form.value.metode = m;
}

function pilihJenis(sisi, jenis) {
  sisi.jenis = jenis;
  sisi.penyedia = '';
  sisi.lainnya = false;
}

function pilihProvider(sisi, opt) {
  sisi.penyedia = opt;
  sisi.lainnya = false;
}

function pilihLainnya(sisi) {
  sisi.lainnya = true;
  sisi.penyedia = '';
}

const warnaPalet = ['#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#ef4444'];
function warnaAvatar(nama) { return warnaPalet[(nama || '').charCodeAt(0) % warnaPalet.length] || warnaPalet[0]; }
function inisial(nama) { return (nama || '?').trim().split(' ').slice(0, 2).map((x) => x[0]).join('').toUpperCase(); }
function formatUang(n) { return Number(n || 0).toLocaleString('id-ID'); }
function formatTanggal(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'; }
function ikonJenis(j) { return j === 'Bank' ? '🏦' : '📱'; }
function labelMetode(p) {
  if (p.metode !== 'Transfer' || !p.penyediaPenerima) return '💵 Tunai';
  return `${ikonJenis(p.jenisPenerima)} ${p.penyediaPenerima}`;
}

async function load() {
  const res = await api.get('/pembayaran', { params: { search: search.value, periode: periode.value } });
  list.value = res.data.data;
  stats.value = res.data.stats;
}

function reset() { search.value = ''; periode.value = ''; load(); }

async function bukaCatat() {
  const res = await api.get('/tagihan');
  tagihanBelumLunas.value = res.data.filter((t) => t.status !== 'Lunas');
  form.value = { tagihanId: '', tanggalBayar: new Date().toISOString().slice(0, 10), jumlahBayar: 0, metode: 'Tunai', catatan: '' };
  pengirim.value = { jenis: 'Bank', penyedia: '', lainnya: false, atasNama: '' };
  penerima.value = { jenis: 'Bank', penyedia: '', lainnya: false, atasNama: identitasPonpes.nama };
  drawerOpen.value = true;
}

async function simpanPembayaran() {
  if (!form.value.tagihanId || !form.value.jumlahBayar) {
    return errorDialog('Lengkapi tagihan & jumlah bayar terlebih dahulu.');
  }
  if (form.value.metode === 'Transfer') {
    if (!pengirim.value.penyedia || !pengirim.value.atasNama) {
      return errorDialog('Lengkapi detail pengirim (bank/e-wallet & atas nama).');
    }
    if (!penerima.value.penyedia) {
      return errorDialog('Lengkapi detail penerima (bank/e-wallet).');
    }
  }
  try {
    const payload = {
      ...form.value,
      ...(form.value.metode === 'Transfer'
        ? {
            jenisPengirim: pengirim.value.jenis,
            penyediaPengirim: pengirim.value.penyedia,
            atasNamaPengirim: pengirim.value.atasNama,
            jenisPenerima: penerima.value.jenis,
            penyediaPenerima: penerima.value.penyedia,
            atasNamaPenerima: penerima.value.atasNama,
          }
        : {}),
    };
    const res = await api.post('/pembayaran', payload);
    drawerOpen.value = false;
    await successDialog('Pembayaran berhasil dicatat.');
    router.push(`/pembayaran/${res.data.id}/kwitansi`);
  } catch (err) {
    errorDialog(pesanError(err));
  }
}

async function exportRekap() {
  const res = await api.get('/laporan/rekap-tagihan/export', { params: { periode: periode.value }, responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'rekap-tagihan.xlsx';
  link.click();
  URL.revokeObjectURL(url);
}

onMounted(load);
</script>
