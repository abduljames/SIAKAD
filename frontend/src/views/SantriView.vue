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
        <p>Kelola data santri & kelas. Import massal lewat Excel, atau tambah satu per satu secara manual.</p>
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
      <button class="btn btn-outline" @click="bukaKelolaKelas">⚙ Kelola Kelas</button>
      <button class="btn btn-outline" @click="unduhTemplate">⬇ Template Excel</button>
      <label class="btn btn-outline" style="margin-left:auto;">
        ⬆ Import Excel
        <input type="file" accept=".xlsx" style="display:none;" @change="importExcel" />
      </label>
      <button class="btn btn-primary" @click="bukaTambahSantri">+ Tambah Santri</button>
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
            <tr><th>No</th><th>Nama</th><th>NIS</th><th>Kelas</th><th>Wali</th><th>No. HP Wali</th><th>Status</th><th style="text-align:right;">Aksi</th></tr>
          </thead>
          <tbody>
            <tr v-if="list.length === 0"><td colspan="8"><div class="empty-state"><div class="icon">🧑‍🎓</div>Belum ada data santri. Import lewat Excel atau tambah manual.</div></td></tr>
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
              <td style="text-align:right;white-space:nowrap;">
                <button class="btn btn-ghost btn-sm" @click="bukaEditSantri(s)">✏️</button>
                <button class="btn btn-ghost btn-sm" style="color:var(--danger);" @click="hapusSantri(s)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination-bar"><span>Menampilkan {{ list.length }} data</span></div>
    </div>

    <!-- Modal Kelola Kelas (CRUD) -->
    <div v-if="modalKelasOpen" class="modal-overlay" @click.self="modalKelasOpen = false">
      <div class="modal-box" style="width:440px;">
        <div class="modal-head">
          <h3>Kelola Kelas</h3>
          <button class="drawer-close" @click="modalKelasOpen = false">✕</button>
        </div>
        <div class="modal-body">
          <div style="display:flex;gap:8px;margin-bottom:16px;">
            <input v-model="formKelas.nama" placeholder="Nama kelas, contoh: 7A" @keyup.enter="simpanKelas" />
            <input v-model="formKelas.tingkat" placeholder="Tingkat (opsional)" style="max-width:140px;" @keyup.enter="simpanKelas" />
            <button class="btn btn-primary btn-sm" @click="simpanKelas">{{ editingKelas ? 'Update' : '+ Tambah' }}</button>
          </div>
          <div v-if="editingKelas" style="margin-bottom:10px;">
            <button class="btn btn-ghost btn-sm" @click="batalEditKelas">✕ Batal edit "{{ editingKelas.nama }}"</button>
          </div>
          <div style="max-height:280px;overflow-y:auto;">
            <div v-if="kelasList.length === 0" class="empty-state" style="padding:20px;">Belum ada kelas.</div>
            <div v-for="k in kelasList" :key="k.id" style="display:flex;align-items:center;justify-content:space-between;padding:9px 4px;border-bottom:1px solid var(--border);">
              <div>
                <div style="font-weight:700;font-size:13px;">{{ k.nama }}</div>
                <div v-if="k.tingkat" style="font-size:11.5px;color:var(--teks-sub);">{{ k.tingkat }}</div>
              </div>
              <div>
                <button class="btn btn-ghost btn-sm" @click="bukaEditKelas(k)">✏️</button>
                <button class="btn btn-ghost btn-sm" style="color:var(--danger);" @click="hapusKelas(k)">🗑️</button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-outline" style="flex:none;margin-left:auto;" @click="modalKelasOpen = false">Tutup</button>
        </div>
      </div>
    </div>

    <!-- Drawer Tambah Santri -->
    <div v-if="drawerSantriOpen" class="drawer-overlay" @click.self="drawerSantriOpen = false">
      <div class="drawer-panel">
        <div class="drawer-head">
          <h3>{{ editingSantri ? 'Edit Santri' : 'Tambah Santri' }}</h3>
          <button class="drawer-close" @click="drawerSantriOpen = false">✕</button>
        </div>
        <div class="drawer-body">
          <div class="form-group">
            <label>Nama <span class="req">*</span></label>
            <input v-model="formSantri.nama" placeholder="Nama lengkap santri" />
          </div>
          <div class="form-group">
            <label>NIS <span class="req">*</span></label>
            <input v-model="formSantri.nis" placeholder="Contoh: 240101" />
          </div>
          <div class="form-group">
            <label>Kelas</label>
            <select v-model="formSantri.kelasId">
              <option value="">Belum ada kelas</option>
              <option v-for="k in kelasList" :key="k.id" :value="k.id">{{ k.nama }}</option>
            </select>
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label>Jenis Kelamin</label>
              <select v-model="formSantri.jenisKelamin">
                <option value="">Pilih...</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div class="form-group">
              <label>Tanggal Lahir</label>
              <input v-model="formSantri.tanggalLahir" type="date" />
            </div>
          </div>
          <div class="form-group">
            <label>Nama Wali</label>
            <input v-model="formSantri.namaWali" placeholder="Contoh: Bapak Muhammad Fauzan" />
          </div>
          <div class="form-group">
            <label>No. HP Wali</label>
            <input v-model="formSantri.noHpWali" placeholder="Contoh: 081234567890" />
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label>Alamat</label>
            <textarea v-model="formSantri.alamat" rows="2"></textarea>
          </div>
        </div>
        <div class="drawer-foot">
          <button class="btn btn-outline" @click="drawerSantriOpen = false">Batal</button>
          <button class="btn btn-primary" @click="simpanSantri">Simpan</button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import api from '../services/api';
import { successDialog, errorDialog, confirmDialog, pesanError } from '../composables/useDialog';

const list = ref([]);
const kelasList = ref([]);
const search = ref('');
const kelasFilter = ref('');
const hasilImport = ref(null);

const modalKelasOpen = ref(false);
const formKelas = ref({ nama: '', tingkat: '' });
const editingKelas = ref(null);

const drawerSantriOpen = ref(false);
const formSantri = ref({});
const editingSantri = ref(null);

function kosongkanFormSantri() {
  formSantri.value = {
    nama: '', nis: '', kelasId: '', jenisKelamin: '', tanggalLahir: '', namaWali: '', noHpWali: '', alamat: '',
  };
}

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

function bukaKelolaKelas() {
  editingKelas.value = null;
  formKelas.value = { nama: '', tingkat: '' };
  modalKelasOpen.value = true;
}

function bukaEditKelas(k) {
  editingKelas.value = k;
  formKelas.value = { nama: k.nama, tingkat: k.tingkat || '' };
}

function batalEditKelas() {
  editingKelas.value = null;
  formKelas.value = { nama: '', tingkat: '' };
}

async function simpanKelas() {
  if (!formKelas.value.nama) return errorDialog('Nama kelas wajib diisi.');
  try {
    if (editingKelas.value) {
      await api.put(`/kelas/${editingKelas.value.id}`, formKelas.value);
    } else {
      await api.post('/kelas', formKelas.value);
    }
    const pesanSukses = editingKelas.value ? 'Kelas berhasil diperbarui.' : 'Kelas baru berhasil ditambahkan.';
    batalEditKelas();
    load();
    successDialog(pesanSukses);
  } catch (err) {
    errorDialog(pesanError(err));
  }
}

async function hapusKelas(k) {
  const yakin = await confirmDialog(`Hapus kelas "${k.nama}"? Santri yang masih memakai kelas ini tidak akan otomatis pindah.`);
  if (!yakin) return;
  try {
    await api.delete(`/kelas/${k.id}`);
    load();
  } catch (err) {
    errorDialog(pesanError(err));
  }
}

function bukaTambahSantri() {
  editingSantri.value = null;
  kosongkanFormSantri();
  drawerSantriOpen.value = true;
}

function bukaEditSantri(s) {
  editingSantri.value = s;
  formSantri.value = {
    nama: s.nama,
    nis: s.nis,
    kelasId: s.kelas?.id || '',
    jenisKelamin: s.jenisKelamin || '',
    tanggalLahir: s.tanggalLahir || '',
    namaWali: s.namaWali || '',
    noHpWali: s.noHpWali || '',
    alamat: s.alamat || '',
  };
  drawerSantriOpen.value = true;
}

async function simpanSantri() {
  if (!formSantri.value.nama || !formSantri.value.nis) {
    return errorDialog('Nama dan NIS wajib diisi.');
  }
  try {
    if (editingSantri.value) {
      await api.put(`/santri/${editingSantri.value.id}`, formSantri.value);
    } else {
      await api.post('/santri', formSantri.value);
    }
    const pesanSukses = editingSantri.value ? 'Data santri berhasil diperbarui.' : 'Data santri berhasil ditambahkan.';
    drawerSantriOpen.value = false;
    load();
    successDialog(pesanSukses);
  } catch (err) {
    errorDialog(pesanError(err));
  }
}

async function hapusSantri(s) {
  const yakin = await confirmDialog(`Hapus data santri "${s.nama}"? Tindakan ini tidak bisa dibatalkan.`);
  if (!yakin) return;
  try {
    await api.delete(`/santri/${s.id}`);
    load();
  } catch (err) {
    errorDialog(pesanError(err));
  }
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
  try {
    const res = await api.post('/santri/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    hasilImport.value = res.data;
    if (res.data.gagal === 0) {
      await successDialog(`${res.data.berhasil} data santri berhasil diimport.`);
    }
    load();
  } catch (err) {
    errorDialog(pesanError(err));
  } finally {
    e.target.value = '';
  }
}

onMounted(load);
</script>
