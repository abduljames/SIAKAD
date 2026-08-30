<template>
  <AppLayout
    title="Buat Tagihan Santri"
    desc="Buat tagihan baru untuk santri"
    :breadcrumb="[{ label: 'Home', to: '/' }, { label: 'Tagihan Santri', to: '/tagihan' }, { label: 'Buat Tagihan' }]"
  >
    <div class="form-layout">
      <div>
        <div class="card" style="margin-bottom:16px;">
          <div class="section-title"><span class="num">1</span> Informasi Santri</div>
          <div class="form-grid-3">
            <div class="form-group" style="margin-bottom:0;">
              <label>Santri <span class="req">*</span></label>
              <select v-model="santriId" @change="pilihSantri">
                <option value="">Pilih santri...</option>
                <option v-for="s in santriList" :key="s.id" :value="s.id">{{ s.nama }} (NIS: {{ s.nis }}) - Kelas {{ s.kelas?.nama || '-' }}</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label>Wali Santri</label>
              <input :value="santriTerpilih?.namaWali || '-'" disabled style="background:var(--bg);" />
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label>No. HP Wali Santri</label>
              <input :value="santriTerpilih?.noHpWali || '-'" disabled style="background:var(--bg);" />
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom:16px;">
          <div class="section-title"><span class="num">2</span> Detail Tagihan</div>
          <div class="form-grid-3" style="margin-bottom:16px;">
            <div class="form-group" style="margin-bottom:0;">
              <label>Periode <span class="req">*</span></label>
              <input v-model="periode" placeholder="Contoh: Mei 2025" />
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label>Tgl. Jatuh Tempo <span class="req">*</span></label>
              <input v-model="jatuhTempo" type="date" />
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label>Referensi / Keterangan</label>
              <input v-model="referensi" placeholder="Contoh: SPP Bulan Mei 2025" />
            </div>
          </div>

          <label style="font-size:12.5px;font-weight:700;display:block;margin-bottom:8px;">Rincian Tagihan</label>
          <div class="table-wrap" style="border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:10px;">
            <table>
              <thead>
                <tr><th>No</th><th>Jenis Tagihan</th><th>Keterangan</th><th style="text-align:right;">Jumlah (Rp)</th><th style="text-align:right;">Diskon (Rp)</th><th style="text-align:right;">Denda (Rp)</th><th style="text-align:right;">Total (Rp)</th><th></th></tr>
              </thead>
              <tbody>
                <tr v-for="(r, idx) in rincian" :key="idx">
                  <td>{{ idx + 1 }}</td>
                  <td style="min-width:150px;">
                    <select v-model="r.jenisTagihanId">
                      <option value="">Pilih...</option>
                      <option v-for="jt in jenisTagihanList" :key="jt.id" :value="jt.id">{{ jt.nama }}</option>
                    </select>
                  </td>
                  <td style="min-width:150px;"><input v-model="r.keterangan" placeholder="Keterangan" /></td>
                  <td style="min-width:110px;"><input v-model.number="r.jumlah" type="number" style="text-align:right;" /></td>
                  <td style="min-width:100px;"><input v-model.number="r.diskon" type="number" style="text-align:right;" /></td>
                  <td style="min-width:100px;"><input v-model.number="r.denda" type="number" style="text-align:right;" /></td>
                  <td style="text-align:right;white-space:nowrap;">Rp {{ formatUang(totalRincian(r)) }}</td>
                  <td><button class="btn btn-ghost btn-sm" @click="rincian.splice(idx, 1)">🗑️</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <button class="btn btn-outline btn-sm" @click="tambahRincian">+ Tambah Rincian</button>
        </div>

        <div class="card" style="margin-bottom:16px;">
          <div class="section-title"><span class="num">3</span> Catatan (Opsional)</div>
          <textarea v-model="catatan" rows="3" placeholder="Tulis catatan jika diperlukan..."></textarea>
        </div>

        <div style="display:flex;gap:10px;justify-content:space-between;">
          <RouterLink to="/tagihan" class="btn btn-outline">✕ Batal</RouterLink>
          <div style="display:flex;gap:10px;">
            <button class="btn btn-primary" @click="simpan">✓ Simpan & Buat Tagihan</button>
          </div>
        </div>
      </div>

      <div>
        <div class="card" style="margin-bottom:16px;">
          <h3 style="font-size:14px;margin-bottom:14px;">Ringkasan Tagihan</h3>
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px;"><span style="color:var(--teks-sub);">Total Tagihan</span><span>Rp {{ formatUang(subTotal) }}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px;"><span style="color:var(--teks-sub);">Diskon</span><span>Rp {{ formatUang(totalDiskon) }}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:12px;"><span style="color:var(--teks-sub);">Denda</span><span>Rp {{ formatUang(totalDenda) }}</span></div>
          <div style="border-top:1px solid var(--border);padding-top:12px;display:flex;justify-content:space-between;">
            <span style="font-weight:800;">Total Tagihan</span>
            <span style="font-weight:800;font-size:17px;color:var(--hijau-700);">Rp {{ formatUang(totalAkhir) }}</span>
          </div>
        </div>

        <div class="info-box" style="margin-bottom:16px;">
          ℹ️ <div>Tagihan akan tercatat dan dapat dilihat oleh santri/wali santri melalui aplikasi.</div>
        </div>

        <div class="card">
          <h3 style="font-size:13px;margin-bottom:12px;">Preview Nota</h3>
          <div class="nota-preview">
            <div class="head">
              <div class="nama-ponpes">PONDOK PESANTREN</div>
              <div class="subtitle">TAGIHAN SANTRI</div>
            </div>
            <div class="row"><span class="label">No. Tagihan</span><span>: (otomatis)</span></div>
            <div class="row"><span class="label">Tanggal</span><span>: {{ tanggalHariIni }}</span></div>
            <div class="row"><span class="label">Santri</span><span>: {{ santriTerpilih?.nama || '-' }}</span></div>
            <div class="row"><span class="label">Kelas</span><span>: {{ santriTerpilih?.kelas?.nama || '-' }}</span></div>
            <div style="border-top:1px dashed var(--border);margin:8px 0;"></div>
            <div v-for="(r, idx) in rincian" :key="idx" class="row">
              <span class="label">{{ namaJenis(r.jenisTagihanId) || '(pilih jenis)' }}</span><span>Rp {{ formatUang(totalRincian(r)) }}</span>
            </div>
            <div style="border-top:1px solid var(--border);margin:8px 0;"></div>
            <div class="row" style="font-weight:800;color:var(--hijau-700);"><span>TOTAL TAGIHAN</span><span>Rp {{ formatUang(totalAkhir) }}</span></div>
          </div>
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

const router = useRouter();
const santriList = ref([]);
const jenisTagihanList = ref([]);
const santriId = ref('');
const periode = ref('');
const jatuhTempo = ref('');
const referensi = ref('');
const catatan = ref('');
const rincian = ref([{ jenisTagihanId: '', keterangan: '', jumlah: 0, diskon: 0, denda: 0 }]);

const santriTerpilih = computed(() => santriList.value.find((s) => s.id === santriId.value) || null);
const tanggalHariIni = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

function totalRincian(r) { return Number(r.jumlah || 0) - Number(r.diskon || 0) + Number(r.denda || 0); }
function namaJenis(id) { return jenisTagihanList.value.find((jt) => jt.id === id)?.nama; }
function formatUang(n) { return Number(n || 0).toLocaleString('id-ID'); }

const subTotal = computed(() => rincian.value.reduce((t, r) => t + Number(r.jumlah || 0), 0));
const totalDiskon = computed(() => rincian.value.reduce((t, r) => t + Number(r.diskon || 0), 0));
const totalDenda = computed(() => rincian.value.reduce((t, r) => t + Number(r.denda || 0), 0));
const totalAkhir = computed(() => rincian.value.reduce((t, r) => t + totalRincian(r), 0));

function pilihSantri() {}

function tambahRincian() {
  rincian.value.push({ jenisTagihanId: '', keterangan: '', jumlah: 0, diskon: 0, denda: 0 });
}

async function load() {
  const [resSantri, resJenis] = await Promise.all([api.get('/santri'), api.get('/jenis-tagihan')]);
  santriList.value = resSantri.data;
  jenisTagihanList.value = resJenis.data.data;
}

async function simpan() {
  if (!santriId.value) return errorDialog('Pilih santri terlebih dahulu.');
  if (!periode.value || !jatuhTempo.value) return errorDialog('Periode dan jatuh tempo wajib diisi.');
  const rincianValid = rincian.value.filter((r) => r.jenisTagihanId && r.jumlah > 0);
  if (rincianValid.length === 0) return errorDialog('Isi minimal 1 rincian tagihan dengan jenis & jumlah.');

  try {
    await api.post('/tagihan', {
      santriId: santriId.value,
      periode: periode.value,
      jatuhTempo: jatuhTempo.value,
      referensi: referensi.value || catatan.value,
      rincian: rincianValid,
    });
    await successDialog('Tagihan berhasil dibuat.');
    router.push('/tagihan');
  } catch (err) {
    errorDialog(pesanError(err));
  }
}

onMounted(load);
</script>
