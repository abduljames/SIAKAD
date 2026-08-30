<template>
  <AppLayout
    title="Santri & Kelas"
    desc="Data master santri dan kelas"
    :breadcrumb="[{ label: 'Home', to: '/' }, { label: 'Data Master' }, { label: 'Santri & Kelas' }]"
  >
    <div class="page-intro">
      <div class="mark">🧑‍🎓</div>
      <div>
        <h2>Data Santri</h2>
        <p>Kelola data santri & kelas. Import massal lewat Excel, atau tambah kelas baru secara manual.</p>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <span class="icon">🔍</span>
        <input v-model="search" placeholder="Cari nama santri..." @input="load" />
      </div>
      <select v-model="kelasFilter" @change="load">
        <option value="">Semua Kelas</option>
        <option v-for="k in kelasList" :key="k.id" :value="k.id">{{ k.nama }}</option>
      </select>
      <button class="btn btn-outline" @click="tambahKelasCepat">+ Kelas Baru</button>
      <button class="btn btn-outline" @click="unduhTemplate">⬇ Template Excel</button>
      <label class="btn btn-primary" style="margin-left:auto;">
        ⬆ Import Excel
        <input type="file" accept=".xlsx" style="display:none;" @change="importExcel" />
      </label>
    </div>

    <div v-if="hasilImport" class="card" style="margin-bottom:16px;">
      <strong>Hasil Import:</strong> {{ hasilImport.berhasil }} berhasil, {{ hasilImport.gagal }} gagal dari {{ hasilImport.total }} baris.
      <ul v-if="hasilImport.gagal > 0" style="margin-top:8px;font-size:12.5px;color:var(--danger);">
        <li v-for="(d, i) in hasilImport.detail.filter((x) => x.status === 'Gagal')" :key="i">Baris {{ d.baris }} ({{ d.nama }}): {{ d.pesan }}</li>
      </ul>
    </div>

    <div class="table-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>No</th><th>Nama</th><th>NIS</th><th>Kelas</th><th>Wali</th><th>No. HP Wali</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr v-if="list.length === 0"><td colspan="7"><div class="empty-state"><div class="icon">🧑‍🎓</div>Belum ada data santri. Import lewat Excel dulu.</div></td></tr>
            <tr v-for="(s, idx) in list" :key="s.id">
              <td>{{ idx + 1 }}</td>
              <td class="person-cell">
                <div class="avatar-init" :style="{ background: warnaAvatar(s.nama) }">{{ inisial(s.nama) }}</div>
                <div><div class="nama">{{ s.nama }}</div></div>
              </td>
              <td>{{ s.nis }}</td>
              <td>{{ s.kelas?.nama || '-' }}</td>
              <td>{{ s.namaWali || '-' }}</td>
              <td>{{ s.noHpWali || '-' }}</td>
              <td><span class="badge" :class="s.status === 'Aktif' ? 'badge-aktif' : 'badge-nonaktif'">{{ s.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination-bar"><span>Menampilkan {{ list.length }} data</span></div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import api from '../services/api';

const list = ref([]);
const kelasList = ref([]);
const search = ref('');
const kelasFilter = ref('');
const hasilImport = ref(null);

const warnaPalet = ['#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#ef4444'];
function warnaAvatar(nama) {
  const idx = (nama || '').charCodeAt(0) % warnaPalet.length;
  return warnaPalet[idx] || warnaPalet[0];
}
function inisial(nama) {
  return (nama || '?').trim().split(' ').slice(0, 2).map((x) => x[0]).join('').toUpperCase();
}

async function load() {
  const [resSantri, resKelas] = await Promise.all([
    api.get('/santri', { params: { search: search.value, kelasId: kelasFilter.value } }),
    api.get('/kelas'),
  ]);
  list.value = resSantri.data;
  kelasList.value = resKelas.data;
}

async function tambahKelasCepat() {
  const nama = prompt('Nama kelas baru (mis. 7A):');
  if (!nama) return;
  await api.post('/kelas', { nama });
  load();
}

async function unduhTemplate() {
  const res = await api.get('/santri/template/download');
  const link = document.createElement('a');
  link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${res.data.base64}`;
  link.download = res.data.filename;
  link.click();
}

async function importExcel(e) {
  const file = e.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/santri/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  hasilImport.value = res.data;
  e.target.value = '';
  load();
}

onMounted(load);
</script>
