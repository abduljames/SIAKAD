<template>
  <AppLayout
    title="Laporan"
    desc="Rekap detail tagihan per santri: sudah bayar, belum bayar, dan menunggak"
    :breadcrumb="[{ label: 'Home', to: '/' }, { label: 'Laporan' }, { label: 'Rekap Tagihan' }]"
  >
    <div class="toolbar">
      <div class="toolbar-field">
        <span class="toolbar-label">Jenis Tagihan</span>
        <select v-model="jenisTagihanId" @change="load">
          <option value="">Semua Jenis Tagihan</option>
          <option v-for="jt in jenisTagihanList" :key="jt.id" :value="jt.id">{{ jt.nama }}</option>
        </select>
      </div>
      <div class="toolbar-field">
        <span class="toolbar-label">Kelas</span>
        <select v-model="kelasId" @change="load">
          <option value="">Semua Kelas</option>
          <option v-for="k in kelasList" :key="k.id" :value="k.id">{{ k.nama }}</option>
        </select>
      </div>
      <button class="btn btn-outline" style="align-self:flex-end;" @click="reset">↻ Reset</button>
      <button class="btn btn-primary" style="align-self:flex-end;margin-left:auto;" @click="exportExcel">⬇ Export Excel</button>
    </div>

    <div class="stat-row" style="grid-template-columns:repeat(5,1fr);">
      <div class="stat-card">
        <div class="icon" style="background:var(--biru-100);color:#1d4ed8;">🧾</div>
        <div class="label">Total Tagihan</div>
        <div class="value">Rp {{ formatUang(summary.totalTagihan) }}</div>
      </div>
      <div class="stat-card">
        <div class="icon" style="background:var(--hijau-100);color:var(--hijau-700);">✅</div>
        <div class="label">Total Terbayar</div>
        <div class="value">Rp {{ formatUang(summary.totalTerbayar) }}</div>
      </div>
      <div class="stat-card">
        <div class="icon" style="background:var(--danger-bg);color:var(--danger);">⚠️</div>
        <div class="label">Total Tunggakan</div>
        <div class="value">Rp {{ formatUang(summary.totalTunggakan) }}</div>
      </div>
      <div class="stat-card">
        <div class="icon" style="background:var(--hijau-100);color:var(--hijau-700);">🟢</div>
        <div class="label">Santri Sudah Bayar</div>
        <div class="value">{{ summary.jumlahSudahBayar }}</div>
      </div>
      <div class="stat-card">
        <div class="icon" style="background:var(--oranye-100);color:#b45309;">🔴</div>
        <div class="label">Santri Menunggak</div>
        <div class="value">{{ summary.jumlahMenunggak }}</div>
      </div>
    </div>

    <div class="toolbar" style="padding:12px 16px;margin-bottom:0;border-radius:var(--radius) var(--radius) 0 0;border-bottom:none;">
      <div class="search-box" style="flex:1;">
        <span class="icon">🔍</span>
        <input v-model="search" placeholder="Cari nama santri / NIS..." />
      </div>
      <select v-model="statusFilterTabel">
        <option value="">Semua Status</option>
        <option value="Lunas">Sudah Bayar</option>
        <option value="Belum Bayar">Belum Bayar</option>
        <option value="Sebagian">Sebagian</option>
        <option value="Menunggak">Menunggak Saja</option>
      </select>
    </div>

    <div class="table-card" style="border-radius:0 0 var(--radius) var(--radius);">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>No</th><th>Santri</th><th>Kelas</th><th>No. Tagihan</th><th>Periode</th><th>Jatuh Tempo</th><th style="text-align:right;">Total Tagihan</th><th style="text-align:right;">Terbayar</th><th style="text-align:right;">Sisa</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr v-if="barisTerfilter.length === 0"><td colspan="10"><div class="empty-state"><div class="icon">📊</div>Tidak ada data yang cocok</div></td></tr>
            <tr v-for="b in barisTerfilter" :key="b.noTagihan">
              <td>{{ b.nis }}</td>
              <td class="person-cell">
                <div class="avatar-init" :style="{ background: warnaAvatar(b.namaSantri) }">{{ inisial(b.namaSantri) }}</div>
                <div class="nama">{{ b.namaSantri }}</div>
              </td>
              <td>{{ b.kelas }}</td>
              <td>{{ b.noTagihan }}</td>
              <td>{{ b.periode }}</td>
              <td>{{ formatTanggal(b.jatuhTempo) }}</td>
              <td style="text-align:right;">Rp {{ formatUang(b.totalTagihan) }}</td>
              <td style="text-align:right;">Rp {{ formatUang(b.totalTerbayar) }}</td>
              <td style="text-align:right;color:var(--danger);">Rp {{ formatUang(b.sisaTagihan) }}</td>
              <td>
                <span class="badge" :class="statusClass(b.status)">{{ b.status }}</span>
                <span v-if="b.menunggak" class="badge badge-belumbayar" style="margin-left:4px;">Menunggak</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination-bar"><span>Menampilkan {{ barisTerfilter.length }} dari {{ baris.length }} data</span></div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import api from '../services/api';

const baris = ref([]);
const summary = ref({ jumlahSudahBayar: 0, jumlahBelumBayar: 0, jumlahMenunggak: 0, totalTagihan: 0, totalTerbayar: 0, totalTunggakan: 0 });
const kelasList = ref([]);
const jenisTagihanList = ref([]);
const jenisTagihanId = ref('');
const kelasId = ref('');
const search = ref('');
const statusFilterTabel = ref('');

function formatUang(n) { return Number(n || 0).toLocaleString('id-ID'); }
function formatTanggal(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'; }
function statusClass(s) {
  if (s === 'Lunas') return 'badge-lunas';
  if (s === 'Sebagian') return 'badge-sebagian';
  return 'badge-belumbayar';
}
const warnaPalet = ['#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#ef4444'];
function warnaAvatar(nama) { return warnaPalet[(nama || '').charCodeAt(0) % warnaPalet.length] || warnaPalet[0]; }
function inisial(nama) { return (nama || '?').trim().split(' ').slice(0, 2).map((x) => x[0]).join('').toUpperCase(); }

const barisTerfilter = computed(() =>
  baris.value.filter((b) => {
    if (search.value && !b.namaSantri.toLowerCase().includes(search.value.toLowerCase()) && !b.nis.includes(search.value)) return false;
    if (statusFilterTabel.value === 'Menunggak') return b.menunggak;
    if (statusFilterTabel.value) return b.status === statusFilterTabel.value;
    return true;
  }),
);

async function load() {
  const [resRekap, resKelas, resJenis] = await Promise.all([
    api.get('/laporan/rekap-tagihan', { params: { jenisTagihanId: jenisTagihanId.value, kelasId: kelasId.value } }),
    api.get('/kelas'),
    api.get('/jenis-tagihan'),
  ]);
  baris.value = resRekap.data.baris;
  summary.value = resRekap.data.summary;
  kelasList.value = resKelas.data;
  jenisTagihanList.value = resJenis.data.data;
}

function reset() {
  jenisTagihanId.value = '';
  kelasId.value = '';
  search.value = '';
  statusFilterTabel.value = '';
  load();
}

async function exportExcel() {
  const res = await api.get('/laporan/rekap-tagihan/export', { params: { jenisTagihanId: jenisTagihanId.value, kelasId: kelasId.value }, responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'rekap-tagihan.xlsx';
  link.click();
  URL.revokeObjectURL(url);
}

onMounted(load);
</script>
