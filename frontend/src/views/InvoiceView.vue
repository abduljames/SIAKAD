<template>
  <div class="doc-shell">
    <div v-if="loading" style="color:var(--teks-sub);">Memuat invoice...</div>
    <div v-else-if="!tagihan" style="color:var(--danger);">Tagihan tidak ditemukan.</div>
    <div v-else class="doc-page">
      <div class="doc-toolbar">
        <RouterLink to="/tagihan" class="btn btn-outline">← Kembali</RouterLink>
        <button class="btn btn-primary" @click="cetak">🖨️ Cetak Invoice</button>
      </div>

      <div class="doc-header">
        <div class="doc-brand">
          <div class="mark">{{ identitasPonpes.logoEmoji }}</div>
          <div>
            <div class="nama">{{ identitasPonpes.nama }}</div>
            <div class="subjudul">{{ identitasPonpes.subjudul }}</div>
          </div>
        </div>
        <div class="doc-meta">
          <div class="nomor-label">No. Invoice</div>
          <div class="nomor">{{ tagihan.noTagihan }}</div>
          <div class="row"><span>📅</span><span>{{ formatTanggal(tagihan.createdAt) }}</span></div>
          <div class="row"><span>⏳</span><span>Jatuh tempo: {{ formatTanggal(tagihan.jatuhTempo) }}</span></div>
        </div>
      </div>

      <div class="doc-grid-2">
        <div class="doc-santri-card">
          <h3>👤 Informasi Santri</h3>
          <div style="font-size:16px;font-weight:800;">{{ tagihan.santri?.nama }}</div>
          <div style="font-size:12px;opacity:0.85;">NIS: {{ tagihan.santri?.nis }} &middot; Kelas {{ tagihan.santri?.kelas?.nama || '-' }}</div>
          <div class="baris"><div><span class="label">Wali Santri</span>{{ tagihan.santri?.namaWali || '-' }}</div></div>
          <div class="baris"><div><span class="label">No. HP Wali</span>{{ tagihan.santri?.noHpWali || '-' }}</div></div>
        </div>
        <div class="doc-card">
          <h3>📋 Ringkasan Invoice</h3>
          <div class="doc-stat-grid">
            <div class="doc-stat-box"><div class="label">Total Tagihan</div><div class="value">Rp {{ formatUang(tagihan.totalTagihan) }}</div></div>
            <div class="doc-stat-box"><div class="label">Sudah Dibayar</div><div class="value" style="color:var(--hijau-700);">Rp {{ formatUang(tagihan.totalTerbayar) }}</div></div>
          </div>
          <div class="doc-status-row">
            <span>Status Pembayaran</span>
            <span class="badge" :class="statusClass(tagihan.status)">{{ tagihan.status }}</span>
          </div>
        </div>
      </div>

      <div class="doc-card" style="margin-bottom:16px;">
        <h3>🧾 Rincian Tagihan</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>No</th><th>Jenis Tagihan</th><th>Keterangan</th><th style="text-align:right;">Jumlah</th><th style="text-align:right;">Diskon</th><th style="text-align:right;">Denda</th><th style="text-align:right;">Total</th></tr>
            </thead>
            <tbody>
              <tr v-for="(r, idx) in tagihan.rincian" :key="r.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ r.jenisTagihan?.nama }}</td>
                <td>{{ r.keterangan || '-' }}</td>
                <td style="text-align:right;">Rp {{ formatUang(r.jumlah) }}</td>
                <td style="text-align:right;">Rp {{ formatUang(r.diskon) }}</td>
                <td style="text-align:right;">Rp {{ formatUang(r.denda) }}</td>
                <td style="text-align:right;">Rp {{ formatUang(r.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="display:flex;justify-content:space-between;padding:14px 4px 4px;border-top:1px solid var(--border);margin-top:6px;">
          <span style="font-weight:800;">TOTAL TAGIHAN</span>
          <span style="font-weight:800;font-size:16px;color:var(--hijau-700);">Rp {{ formatUang(tagihan.totalTagihan) }}</span>
        </div>
      </div>

      <div class="doc-card" style="margin-bottom:16px;">
        <div class="doc-ttd-row">
          <div class="doc-ttd-box">
            <div class="peran">Wali Santri / Penerima Tagihan</div>
            <div class="tempat-tanggal">&nbsp;</div>
            <div class="garis"></div>
            <div class="nama">{{ tagihan.santri?.namaWali || '(...........................)' }}</div>
            <div class="ket">Wali dari {{ tagihan.santri?.nama }}</div>
          </div>
          <div class="doc-ttd-box">
            <div class="peran">Mengetahui, Bendahara</div>
            <div class="tempat-tanggal">{{ identitasPonpes.alamat.split(',').pop().trim() }}, {{ formatTanggal(tagihan.createdAt) }}</div>
            <div class="garis"></div>
            <div class="nama">(...........................)</div>
            <div class="ket">Bendahara {{ identitasPonpes.nama }}</div>
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <h4>Jazakumullahu Khairan</h4>
        <p>Mohon segera diselesaikan sebelum tanggal jatuh tempo. Terima kasih atas perhatiannya.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';
import { identitasPonpes } from '../utils/identitasPonpes';

const route = useRoute();
const tagihan = ref(null);
const loading = ref(true);

function cetak() { window.print(); }

function formatUang(n) { return Number(n || 0).toLocaleString('id-ID'); }
function formatTanggal(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'; }
function statusClass(s) {
  if (s === 'Lunas') return 'badge-lunas';
  if (s === 'Sebagian') return 'badge-sebagian';
  return 'badge-belumbayar';
}

onMounted(async () => {
  try {
    const res = await api.get(`/tagihan/${route.params.id}`);
    tagihan.value = res.data;
  } finally {
    loading.value = false;
  }
});
</script>
