<template>
  <div class="doc-shell">
    <div v-if="loading" style="color:var(--teks-sub);">Memuat kwitansi...</div>
    <div v-else-if="!pembayaran" style="color:var(--danger);">Pembayaran tidak ditemukan.</div>
    <div v-else class="doc-page">
      <div class="doc-toolbar">
        <RouterLink to="/pembayaran" class="btn btn-outline">← Kembali</RouterLink>
        <button class="btn btn-primary" @click="cetak">🖨️ Cetak Kwitansi</button>
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
          <div class="nomor-label">No. Kwitansi</div>
          <div class="nomor">{{ pembayaran.noPembayaran }}</div>
          <div class="row"><span>📅</span><span>{{ formatTanggal(pembayaran.tanggalBayar) }}</span></div>
          <div class="row"><span>💳</span><span>{{ pembayaran.metode === 'Transfer' ? `${pembayaran.penyediaPengirim} → ${pembayaran.penyediaPenerima}` : 'Tunai' }}</span></div>
        </div>
      </div>

      <div class="doc-banner-slim">
        <span class="check-sm">✓</span>
        <span class="teks"><strong>Kwitansi Pembayaran</strong> — terima kasih, pembayaran Anda telah tercatat.</span>
        <span class="badge" :class="statusClass(pembayaran.tagihan?.status)">{{ pembayaran.tagihan?.status }}</span>
      </div>

      <div class="doc-grid-2">
        <div class="doc-santri-card">
          <h3>👤 Informasi Santri</h3>
          <div style="font-size:16px;font-weight:800;">{{ pembayaran.tagihan?.santri?.nama }}</div>
          <div style="font-size:12px;opacity:0.85;">NIS: {{ pembayaran.tagihan?.santri?.nis }} &middot; Kelas {{ pembayaran.tagihan?.santri?.kelas?.nama || '-' }}</div>
          <div class="baris"><div><span class="label">Wali Santri</span>{{ pembayaran.tagihan?.santri?.namaWali || '-' }} &middot; {{ pembayaran.tagihan?.santri?.noHpWali || '-' }}</div></div>
        </div>
        <div class="doc-card">
          <h3>📋 Ringkasan Pembayaran</h3>
          <div class="doc-stat-grid">
            <div class="doc-stat-box"><div class="label">Total Tagihan</div><div class="value">Rp {{ formatUang(pembayaran.tagihan?.totalTagihan) }}</div></div>
            <div class="doc-stat-box"><div class="label">Dibayar Saat Ini</div><div class="value" style="color:var(--hijau-700);">Rp {{ formatUang(pembayaran.jumlahBayar) }}</div></div>
          </div>
          <div class="doc-status-row">
            <span>Sisa Tagihan</span>
            <strong>Rp {{ formatUang(sisaTagihan) }}</strong>
          </div>
        </div>
      </div>

      <div class="doc-card" style="margin-bottom:16px;">
        <h3>🧾 Rincian Tagihan</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>No</th><th>Jenis Tagihan</th><th>Keterangan</th><th>Periode</th><th style="text-align:right;">Total</th></tr>
            </thead>
            <tbody>
              <tr v-for="(r, idx) in pembayaran.tagihan?.rincian" :key="r.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ r.jenisTagihan?.nama }}</td>
                <td>{{ r.keterangan || '-' }}</td>
                <td>{{ pembayaran.tagihan?.periode }}</td>
                <td style="text-align:right;">Rp {{ formatUang(r.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="display:flex;justify-content:space-between;padding:14px 4px 4px;border-top:1px solid var(--border);margin-top:6px;">
          <span style="font-weight:800;">TOTAL TAGIHAN</span>
          <span style="font-weight:800;font-size:16px;color:var(--hijau-700);">Rp {{ formatUang(pembayaran.tagihan?.totalTagihan) }}</span>
        </div>
      </div>

      <div class="doc-card" style="margin-bottom:16px;">
        <h3>💳 Detail Pembayaran</h3>
        <div style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-bottom:1px solid var(--border);"><span style="color:var(--teks-sub);">Metode Pembayaran</span><span>{{ pembayaran.metode }}</span></div>

        <div v-if="pembayaran.metode === 'Transfer'" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0;">
          <div class="summary-box">
            <div style="font-weight:700;font-size:11.5px;margin-bottom:6px;">📤 Pengirim</div>
            <div class="row"><span class="label">{{ pembayaran.jenisPengirim === 'Bank' ? 'Bank' : 'E-Wallet' }}</span><span>{{ ikonJenis(pembayaran.jenisPengirim) }} {{ pembayaran.penyediaPengirim }}</span></div>
            <div class="row"><span class="label">Atas Nama</span><span>{{ pembayaran.atasNamaPengirim }}</span></div>
          </div>
          <div class="summary-box">
            <div style="font-weight:700;font-size:11.5px;margin-bottom:6px;">📥 Penerima</div>
            <div class="row"><span class="label">{{ pembayaran.jenisPenerima === 'Bank' ? 'Bank' : 'E-Wallet' }}</span><span>{{ ikonJenis(pembayaran.jenisPenerima) }} {{ pembayaran.penyediaPenerima }}</span></div>
            <div class="row"><span class="label">Atas Nama</span><span>{{ pembayaran.atasNamaPenerima }}</span></div>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-bottom:1px solid var(--border);" v-if="pembayaran.catatan"><span style="color:var(--teks-sub);">Catatan</span><span>{{ pembayaran.catatan }}</span></div>
        <div style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0;"><span style="color:var(--teks-sub);">Tanggal Bayar</span><span>{{ formatTanggal(pembayaran.tanggalBayar) }}</span></div>
      </div>

      <div class="doc-card" style="margin-bottom:16px;">
        <div class="doc-ttd-row">
          <div class="doc-ttd-box">
            <div class="peran">Dibayar oleh</div>
            <div class="tempat-tanggal">{{ formatTanggal(pembayaran.tanggalBayar) }}</div>
            <div class="garis"></div>
            <div class="nama">{{ pembayaran.tagihan?.santri?.namaWali || '(...........................)' }}</div>
            <div class="ket">Wali dari {{ pembayaran.tagihan?.santri?.nama }}</div>
          </div>
          <div class="doc-ttd-box">
            <div class="peran">Diterima oleh, Bendahara</div>
            <div class="tempat-tanggal">{{ identitasPonpes.alamat.split(',').pop().trim() }}, {{ formatTanggal(pembayaran.tanggalBayar) }}</div>
            <div class="garis"></div>
            <div class="nama">(...........................)</div>
            <div class="ket">Bendahara {{ identitasPonpes.nama }}</div>
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <h4>Jazakumullahu Khairan</h4>
        <p>Semoga Allah membalas kebaikan Anda dan menjadikan pembayaran ini sebagai amal jariyah.<br />Aamiin ya Rabbal 'Alamin.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';
import { identitasPonpes } from '../utils/identitasPonpes';

const route = useRoute();
const pembayaran = ref(null);
const loading = ref(true);

function cetak() { window.print(); }

const sisaTagihan = computed(() => {
  if (!pembayaran.value?.tagihan) return 0;
  return Number(pembayaran.value.tagihan.totalTagihan) - Number(pembayaran.value.tagihan.totalTerbayar);
});
function ikonJenis(j) { return j === 'Bank' ? '🏦' : '📱'; }
function formatUang(n) { return Number(n || 0).toLocaleString('id-ID'); }
function formatTanggal(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'; }
function statusClass(s) {
  if (s === 'Lunas') return 'badge-lunas';
  if (s === 'Sebagian') return 'badge-sebagian';
  return 'badge-belumbayar';
}

onMounted(async () => {
  try {
    const res = await api.get(`/pembayaran/${route.params.id}`);
    pembayaran.value = res.data;
  } finally {
    loading.value = false;
  }
});
</script>
