<template>
  <AppLayout
    title="Buat Tagihan Santri"
    desc="Buat tagihan baru untuk santri"
    :breadcrumb="[{ label: 'Home', to: '/' }, { label: 'Tagihan Santri', to: '/tagihan' }, { label: 'Buat Tagihan' }]"
  >
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
              <tr><th>No</th><th>Jenis Tagihan</th><th>Keterangan</th><th style="text-align:right;">Jumlah (Rp)</th><th style="text-align:right;">Diskon (Rp)</th><th style="text-align:right;">Total (Rp)</th><th></th></tr>
            </thead>
            <tbody>
              <tr v-for="(r, idx) in rincian" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td style="min-width:150px;">
                  <select v-model="r.jenisTagihanId" @change="isiNominalDefault(r)">
                    <option value="">Pilih...</option>
                    <option v-for="jt in jenisTagihanList" :key="jt.id" :value="jt.id">{{ jt.nama }}</option>
                  </select>
                </td>
                <td style="min-width:150px;"><input v-model="r.keterangan" placeholder="Keterangan" /></td>
                <td style="min-width:110px;"><CurrencyInput v-model="r.jumlah" style="text-align:right;" /></td>
                <td style="min-width:100px;"><CurrencyInput v-model="r.diskon" style="text-align:right;" /></td>
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
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppLayout from '../components/AppLayout.vue';
import CurrencyInput from '../components/CurrencyInput.vue';
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
const rincian = ref([{ jenisTagihanId: '', keterangan: '', jumlah: 0, diskon: 0 }]);

const santriTerpilih = computed(() => santriList.value.find((s) => s.id === santriId.value) || null);

function totalRincian(r) { return Number(r.jumlah || 0) - Number(r.diskon || 0); }
function formatUang(n) { return Number(n || 0).toLocaleString('id-ID'); }

function pilihSantri() {}

function tambahRincian() {
  rincian.value.push({ jenisTagihanId: '', keterangan: '', jumlah: 0, diskon: 0 });
}

function isiNominalDefault(r) {
  const jt = jenisTagihanList.value.find((x) => x.id === r.jenisTagihanId);
  if (jt) r.jumlah = Number(jt.nominalDefault || 0);
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
