<template>
  <AppLayout
    title="Tagihan Santri"
    desc="Daftar tagihan yang sudah dibuat untuk santri"
    :breadcrumb="[{ label: 'Home', to: '/' }, { label: 'Tagihan Santri' }, { label: 'Daftar Tagihan' }]"
  >
    <div class="toolbar">
      <div class="search-box">
        <span class="icon">🔍</span>
        <input v-model="search" placeholder="Cari nama santri..." @input="load" />
      </div>
      <select v-model="statusFilter" @change="load">
        <option value="">Semua Status</option>
        <option value="Belum Bayar">Belum Bayar</option>
        <option value="Sebagian">Sebagian</option>
        <option value="Lunas">Lunas</option>
      </select>
      <button class="btn btn-outline" @click="reset">↻ Reset</button>
      <RouterLink class="btn btn-outline" style="margin-left:auto;" to="/tagihan/buat-massal">👥 Buat Tagihan Massal</RouterLink>
      <RouterLink class="btn btn-primary" to="/tagihan/buat">+ Buat Tagihan Santri</RouterLink>
    </div>

    <div class="table-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>No</th><th>No. Tagihan</th><th>Santri</th><th>Kelas</th><th>Periode</th><th>Jatuh Tempo</th><th style="text-align:right;">Total Tagihan</th><th style="text-align:right;">Terbayar</th><th>Status</th><th style="text-align:right;">Aksi</th></tr>
          </thead>
          <tbody>
            <tr v-if="list.length === 0"><td colspan="10"><div class="empty-state"><div class="icon">🧾</div>Belum ada tagihan dibuat</div></td></tr>
            <tr v-for="(t, idx) in list" :key="t.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ t.noTagihan }}</td>
              <td>{{ t.santri?.nama }}</td>
              <td>{{ t.santri?.kelas?.nama || '-' }}</td>
              <td>{{ t.periode }}</td>
              <td>{{ formatTanggal(t.jatuhTempo) }}</td>
              <td style="text-align:right;">Rp {{ formatUang(t.totalTagihan) }}</td>
              <td style="text-align:right;">Rp {{ formatUang(t.totalTerbayar) }}</td>
              <td><span class="badge" :class="statusClass(t.status)">{{ t.status }}</span></td>
              <td style="text-align:right;"><RouterLink class="btn btn-ghost btn-sm" :to="`/tagihan/${t.id}/invoice`">📄 Invoice</RouterLink></td>
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
const search = ref('');
const statusFilter = ref('');

function formatUang(n) { return Number(n || 0).toLocaleString('id-ID'); }
function formatTanggal(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'; }
function statusClass(s) {
  if (s === 'Lunas') return 'badge-lunas';
  if (s === 'Sebagian') return 'badge-sebagian';
  return 'badge-belumbayar';
}

async function load() {
  const res = await api.get('/tagihan', { params: { search: search.value, status: statusFilter.value } });
  list.value = res.data;
}

function reset() { search.value = ''; statusFilter.value = ''; load(); }

onMounted(load);
</script>
