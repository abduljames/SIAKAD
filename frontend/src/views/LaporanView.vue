<template>
  <AppLayout
    title="Laporan"
    desc="Rekap tunggakan & pembayaran per kelas"
    :breadcrumb="[{ label: 'Home', to: '/' }, { label: 'Laporan' }, { label: 'Rekap Tagihan' }]"
  >
    <div class="toolbar">
      <div class="toolbar-field">
        <span class="toolbar-label">Periode</span>
        <input v-model="periode" placeholder="Mei 2025 (kosongkan = semua)" @change="load" />
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

    <div class="stat-row" style="grid-template-columns:repeat(3,1fr);">
      <div class="stat-card">
        <div class="icon" style="background:var(--biru-100);color:#1d4ed8;">🧾</div>
        <div class="label">Total Tagihan</div>
        <div class="value">Rp {{ formatUang(totalKeseluruhan.totalTagihan) }}</div>
      </div>
      <div class="stat-card">
        <div class="icon" style="background:var(--hijau-100);color:var(--hijau-700);">✅</div>
        <div class="label">Total Terbayar</div>
        <div class="value">Rp {{ formatUang(totalKeseluruhan.totalTerbayar) }}</div>
      </div>
      <div class="stat-card">
        <div class="icon" style="background:var(--danger-bg);color:var(--danger);">⚠️</div>
        <div class="label">Total Tunggakan</div>
        <div class="value">Rp {{ formatUang(totalKeseluruhan.totalTunggakan) }}</div>
      </div>
    </div>

    <div class="table-card">
      <div class="table-card-head"><h3>Rekap per Kelas</h3></div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Kelas</th><th style="text-align:right;">Total Tagihan</th><th style="text-align:right;">Total Terbayar</th><th style="text-align:right;">Total Tunggakan</th><th style="text-align:right;">Santri Menunggak</th></tr>
          </thead>
          <tbody>
            <tr v-if="rekap.length === 0"><td colspan="5"><div class="empty-state"><div class="icon">📊</div>Belum ada data</div></td></tr>
            <tr v-for="r in rekap" :key="r.kelas">
              <td style="font-weight:700;">{{ r.kelas }}</td>
              <td style="text-align:right;">Rp {{ formatUang(r.totalTagihan) }}</td>
              <td style="text-align:right;">Rp {{ formatUang(r.totalTerbayar) }}</td>
              <td style="text-align:right;color:var(--danger);">Rp {{ formatUang(r.totalTunggakan) }}</td>
              <td style="text-align:right;">{{ r.jumlahSantriMenunggak }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import api from '../services/api';

const rekap = ref([]);
const kelasList = ref([]);
const periode = ref('');
const kelasId = ref('');

function formatUang(n) { return Number(n || 0).toLocaleString('id-ID'); }

const totalKeseluruhan = computed(() =>
  rekap.value.reduce(
    (acc, r) => ({
      totalTagihan: acc.totalTagihan + r.totalTagihan,
      totalTerbayar: acc.totalTerbayar + r.totalTerbayar,
      totalTunggakan: acc.totalTunggakan + r.totalTunggakan,
    }),
    { totalTagihan: 0, totalTerbayar: 0, totalTunggakan: 0 },
  ),
);

async function load() {
  const [resRekap, resKelas] = await Promise.all([
    api.get('/laporan/rekap-tagihan', { params: { periode: periode.value, kelasId: kelasId.value } }),
    api.get('/kelas'),
  ]);
  rekap.value = resRekap.data;
  kelasList.value = resKelas.data;
}

function reset() { periode.value = ''; kelasId.value = ''; load(); }

async function exportExcel() {
  const res = await api.get('/laporan/rekap-tagihan/export', { params: { periode: periode.value, kelasId: kelasId.value }, responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'rekap-tagihan.xlsx';
  link.click();
  URL.revokeObjectURL(url);
}

onMounted(load);
</script>
