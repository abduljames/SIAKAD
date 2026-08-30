<template>
  <AppLayout
    title="Buat Tagihan Massal"
    desc="Buat satu jenis tagihan untuk banyak santri sekaligus"
    :breadcrumb="[{ label: 'Home', to: '/' }, { label: 'Tagihan Santri', to: '/tagihan' }, { label: 'Buat Tagihan Massal' }]"
  >
    <div class="card" style="margin-bottom:16px;">
      <div class="section-title"><span class="num">1</span> Detail Tagihan</div>
      <div class="form-grid-3" style="margin-bottom:0;">
        <div class="form-group">
          <label>Jenis Tagihan <span class="req">*</span></label>
          <select v-model="jenisTagihanId" @change="isiNominalDefault">
            <option value="">Pilih jenis tagihan...</option>
            <option v-for="jt in jenisTagihanList" :key="jt.id" :value="jt.id">{{ jt.nama }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Nominal (Rp) <span class="req">*</span></label>
          <CurrencyInput v-model="nominal" />
        </div>
        <div class="form-group">
          <label>Periode <span class="req">*</span></label>
          <input v-model="periode" placeholder="Contoh: Oktober 2026" />
        </div>
        <div class="form-group">
          <label>Tgl. Jatuh Tempo <span class="req">*</span></label>
          <input v-model="jatuhTempo" type="date" />
        </div>
        <div class="form-group" style="grid-column:span 2;">
          <label>Referensi / Keterangan</label>
          <input v-model="referensi" placeholder="Opsional" />
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom:16px;">
      <div class="section-title"><span class="num">2</span> Pilih Santri</div>
      <div class="toolbar" style="margin-bottom:12px;">
        <select v-model="kelasFilter" @change="load">
          <option value="">Semua Kelas</option>
          <option v-for="k in kelasList" :key="k.id" :value="k.id">{{ k.nama }}</option>
        </select>
        <div class="search-box" style="flex:1;">
          <span class="icon">🔍</span>
          <input v-model="search" placeholder="Cari nama santri..." />
        </div>
        <button class="btn btn-outline" @click="toggleSemua">{{ semuaTerpilih ? '☐ Batalkan Semua' : '☑ Pilih Semua' }}</button>
      </div>

      <div style="max-height:340px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius-sm);">
        <div v-if="santriTerfilter.length === 0" class="empty-state">Tidak ada santri yang cocok.</div>
        <label
          v-for="s in santriTerfilter"
          :key="s.id"
          style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--border);cursor:pointer;"
        >
          <input type="checkbox" :value="s.id" v-model="terpilih" style="width:16px;height:16px;" />
          <div class="avatar-init" :style="{ background: warnaAvatar(s.nama) }">{{ inisial(s.nama) }}</div>
          <div>
            <div style="font-weight:700;font-size:13px;">{{ s.nama }}</div>
            <div style="font-size:11.5px;color:var(--teks-sub);">NIS: {{ s.nis }} &middot; Kelas {{ s.kelas?.nama || '-' }}</div>
          </div>
        </label>
      </div>
      <div class="form-hint" style="margin-top:8px;">{{ terpilih.length }} dari {{ santriTerfilter.length }} santri dipilih.</div>
    </div>

    <div style="display:flex;gap:10px;justify-content:space-between;">
      <RouterLink to="/tagihan" class="btn btn-danger">✕ Batal</RouterLink>
      <button class="btn btn-primary" @click="simpan">✓ Buat Tagihan untuk {{ terpilih.length }} Santri</button>
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

const jenisTagihanList = ref([]);
const kelasList = ref([]);
const santriList = ref([]);

const jenisTagihanId = ref('');
const nominal = ref(0);
const periode = ref('');
const jatuhTempo = ref('');
const referensi = ref('');
const kelasFilter = ref('');
const search = ref('');
const terpilih = ref([]);

const warnaPalet = ['#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#ef4444'];
function warnaAvatar(nama) { return warnaPalet[(nama || '').charCodeAt(0) % warnaPalet.length] || warnaPalet[0]; }
function inisial(nama) { return (nama || '?').trim().split(' ').slice(0, 2).map((x) => x[0]).join('').toUpperCase(); }

const santriTerfilter = computed(() =>
  santriList.value.filter((s) => {
    if (kelasFilter.value && s.kelas?.id !== kelasFilter.value) return false;
    if (search.value && !s.nama.toLowerCase().includes(search.value.toLowerCase())) return false;
    return true;
  }),
);

const semuaTerpilih = computed(() => santriTerfilter.value.length > 0 && santriTerfilter.value.every((s) => terpilih.value.includes(s.id)));

function toggleSemua() {
  const idsTerfilter = santriTerfilter.value.map((s) => s.id);
  if (semuaTerpilih.value) {
    terpilih.value = terpilih.value.filter((id) => !idsTerfilter.includes(id));
  } else {
    terpilih.value = Array.from(new Set([...terpilih.value, ...idsTerfilter]));
  }
}

function isiNominalDefault() {
  const jt = jenisTagihanList.value.find((x) => x.id === jenisTagihanId.value);
  if (jt) nominal.value = Number(jt.nominalDefault || 0);
}

async function load() {
  const [resJenis, resKelas, resSantri] = await Promise.all([
    api.get('/jenis-tagihan'),
    api.get('/kelas'),
    api.get('/santri', { params: { kelasId: kelasFilter.value } }),
  ]);
  jenisTagihanList.value = resJenis.data.data;
  kelasList.value = resKelas.data;
  santriList.value = resSantri.data;
}

async function simpan() {
  if (!jenisTagihanId.value) return errorDialog('Pilih jenis tagihan terlebih dahulu.');
  if (!periode.value || !jatuhTempo.value) return errorDialog('Periode dan jatuh tempo wajib diisi.');
  if (!nominal.value || nominal.value <= 0) return errorDialog('Nominal tidak valid.');
  if (terpilih.value.length === 0) return errorDialog('Pilih minimal 1 santri.');

  try {
    const res = await api.post('/tagihan/massal', {
      jenisTagihanId: jenisTagihanId.value,
      periode: periode.value,
      jatuhTempo: jatuhTempo.value,
      nominal: nominal.value,
      referensi: referensi.value,
      santriIds: terpilih.value,
    });
    const { dibuat, dilewati } = res.data;
    const pesan =
      dilewati > 0
        ? `${dibuat} tagihan berhasil dibuat. ${dilewati} santri dilewati karena sudah punya tagihan ini untuk periode yang sama.`
        : `${dibuat} tagihan berhasil dibuat.`;
    await successDialog(pesan);
    router.push('/tagihan');
  } catch (err) {
    errorDialog(pesanError(err));
  }
}

onMounted(load);
</script>
