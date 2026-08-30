<template>
  <AppLayout
    title="Jenis Tagihan"
    desc="Kelola jenis tagihan yang tersedia untuk santri"
    :breadcrumb="[{ label: 'Home', to: '/' }, { label: 'Tagihan Santri' }, { label: 'Jenis Tagihan' }]"
  >
    <div style="display:grid;grid-template-columns:1fr 260px;gap:16px;margin-bottom:16px;align-items:stretch;">
      <div class="page-intro" style="margin-bottom:0;">
        <div class="mark">🏷️</div>
        <div>
          <h2>Jenis Tagihan</h2>
          <p>Kelola semua jenis tagihan yang dapat dikenakan kepada santri. Jenis tagihan ini akan digunakan saat membuat tagihan.</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="icon" style="background:var(--hijau-100);color:var(--hijau-700);">📋</div>
        <div class="label">Total Jenis Tagihan</div>
        <div class="value" style="color:var(--hijau-700);">{{ total }}</div>
        <div class="sub">Jenis Tagihan Aktif</div>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <span class="icon">🔍</span>
        <input v-model="search" placeholder="Cari jenis tagihan..." @input="load" />
      </div>
      <select v-model="statusFilter" @change="load">
        <option value="">Semua Status</option>
        <option value="Aktif">Aktif</option>
        <option value="Nonaktif">Nonaktif</option>
      </select>
      <button class="btn btn-outline" @click="reset">↻ Reset</button>
      <button class="btn btn-primary" style="margin-left:auto;" @click="bukaTambah">+ Tambah Jenis Tagihan</button>
    </div>

    <div class="table-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Jenis Tagihan</th>
              <th>Kode Tagihan</th>
              <th>Sifat</th>
              <th>Status</th>
              <th style="text-align:right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="list.length === 0"><td colspan="6"><div class="empty-state"><div class="icon">🏷️</div>Belum ada jenis tagihan</div></td></tr>
            <tr v-for="(jt, idx) in list" :key="jt.id">
              <td>{{ idx + 1 }}</td>
              <td>
                <div class="row-icon-name">
                  <div class="row-icon" :style="{ background: ikonUntuk(jt).bg, color: ikonUntuk(jt).fg }">{{ ikonUntuk(jt).icon }}</div>
                  <div>
                    <div class="nama">{{ jt.nama }}</div>
                    <div class="desc">{{ jt.deskripsi }}</div>
                  </div>
                </div>
              </td>
              <td>{{ jt.kode }}</td>
              <td><span class="badge" :class="'badge-' + jt.sifat.toLowerCase()">{{ jt.sifat }}</span></td>
              <td><span class="badge" :class="jt.status === 'Aktif' ? 'badge-aktif' : 'badge-nonaktif'"><span class="badge-dot" :style="{ background: jt.status === 'Aktif' ? 'var(--hijau-700)' : 'var(--teks-muted)' }"></span>{{ jt.status }}</span></td>
              <td style="text-align:right;position:relative;">
                <button class="btn btn-ghost btn-sm" @click="menuAksiId = menuAksiId === jt.id ? null : jt.id">⋮</button>
                <div v-if="menuAksiId === jt.id" style="position:absolute;right:16px;top:36px;background:#fff;border:1px solid var(--border);border-radius:10px;box-shadow:var(--shadow);z-index:5;min-width:110px;">
                  <button class="btn btn-ghost btn-sm" style="width:100%;justify-content:flex-start;border:none;" @click="bukaEdit(jt)">✏️ Edit</button>
                  <button class="btn btn-ghost btn-sm" style="width:100%;justify-content:flex-start;border:none;color:var(--danger);" @click="hapus(jt)">🗑️ Hapus</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination-bar">
        <span>Menampilkan 1 - {{ list.length }} dari {{ total }} data</span>
      </div>
    </div>

    <!-- Drawer Tambah/Edit -->
    <div v-if="drawerOpen" class="drawer-overlay" @click.self="drawerOpen = false">
      <div class="drawer-panel">
        <div class="drawer-head">
          <h3>{{ editing ? 'Edit Jenis Tagihan' : 'Tambah Jenis Tagihan' }}</h3>
          <button class="drawer-close" @click="drawerOpen = false">✕</button>
        </div>
        <div class="drawer-body">
          <div class="form-group">
            <label>Nama Jenis Tagihan <span class="req">*</span></label>
            <input v-model="form.nama" placeholder="Contoh: Kegiatan Tahunan" />
          </div>
          <div class="form-group">
            <label>Kode Tagihan <span class="req">*</span></label>
            <input v-model="form.kode" placeholder="Contoh: KGT" />
          </div>
          <div class="form-group">
            <label>Deskripsi</label>
            <textarea v-model="form.deskripsi" rows="3" placeholder="Jelaskan jenis tagihan ini..."></textarea>
          </div>
          <div class="form-group">
            <label>Sifat Tagihan <span class="req">*</span></label>
            <div class="pill-select">
              <div
                v-for="opt in sifatOptions"
                :key="opt.value"
                class="pill-option"
                :class="[form.sifat === opt.value ? 'selected tone-' + opt.value.toLowerCase() : '']"
                @click="form.sifat = opt.value"
              >
                <span style="font-size:18px;">{{ opt.icon }}</span>
                <div>
                  <div class="name">{{ opt.value }}</div>
                  <div class="desc">{{ opt.desc }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>Status <span class="req">*</span></label>
            <select v-model="form.status">
              <option value="Aktif">🟢 Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
          <div class="form-group">
            <label>Urutan</label>
            <input v-model.number="form.urutan" type="number" />
            <div class="form-hint">Semakin kecil angka, semakin di atas.</div>
          </div>
        </div>
        <div class="drawer-foot">
          <button class="btn btn-outline" @click="drawerOpen = false">Batal</button>
          <button class="btn btn-primary" @click="simpan">Simpan</button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import api from '../services/api';

const list = ref([]);
const total = ref(0);
const search = ref('');
const statusFilter = ref('');
const menuAksiId = ref(null);
const drawerOpen = ref(false);
const editing = ref(null);

const paletteIkon = [
  { bg: 'var(--biru-100)', fg: '#1d4ed8', icon: '🎓' },
  { bg: 'var(--oranye-100)', fg: '#b45309', icon: '🍴' },
  { bg: 'var(--ungu-100)', fg: '#6d28d9', icon: '🏢' },
  { bg: 'var(--indigo-100)', fg: '#4338ca', icon: '👕' },
  { bg: 'var(--pink-100)', fg: '#be185d', icon: '📖' },
  { bg: 'var(--teal-100)', fg: '#0f766e', icon: '🩺' },
  { bg: 'var(--kuning-100)', fg: '#a16207', icon: '⋯' },
];
function ikonUntuk(jt) {
  return paletteIkon[(jt.id - 1) % paletteIkon.length];
}

const sifatOptions = [
  { value: 'Bulanan', desc: 'Ditagihkan setiap bulan', icon: '📅' },
  { value: 'Sekali', desc: 'Ditagihkan satu kali', icon: '1️⃣' },
  { value: 'Insidental', desc: 'Ditagihkan sewaktu-waktu', icon: '⚡' },
];

const form = ref({ nama: '', kode: '', deskripsi: '', sifat: 'Bulanan', status: 'Aktif', urutan: 0 });

async function load() {
  const res = await api.get('/jenis-tagihan', { params: { search: search.value, status: statusFilter.value } });
  list.value = res.data.data;
  total.value = res.data.total;
}

function reset() {
  search.value = '';
  statusFilter.value = '';
  load();
}

function bukaTambah() {
  editing.value = null;
  form.value = { nama: '', kode: '', deskripsi: '', sifat: 'Bulanan', status: 'Aktif', urutan: list.value.length + 1 };
  drawerOpen.value = true;
  menuAksiId.value = null;
}

function bukaEdit(jt) {
  editing.value = jt;
  form.value = { nama: jt.nama, kode: jt.kode, deskripsi: jt.deskripsi, sifat: jt.sifat, status: jt.status, urutan: jt.urutan };
  drawerOpen.value = true;
  menuAksiId.value = null;
}

async function simpan() {
  if (!form.value.nama || !form.value.kode) return;
  if (editing.value) {
    await api.put(`/jenis-tagihan/${editing.value.id}`, form.value);
  } else {
    await api.post('/jenis-tagihan', form.value);
  }
  drawerOpen.value = false;
  load();
}

async function hapus(jt) {
  if (!confirm(`Hapus jenis tagihan "${jt.nama}"?`)) return;
  await api.delete(`/jenis-tagihan/${jt.id}`);
  menuAksiId.value = null;
  load();
}

onMounted(load);
</script>
