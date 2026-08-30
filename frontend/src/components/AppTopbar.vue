<template>
  <div class="topbar">
    <div class="topbar-left" style="display:flex;align-items:center;gap:14px;">
      <button class="sidebar-toggle-btn" @click="toggleSidebar" title="Tampilkan/sembunyikan menu">☰</button>
      <div>
        <h1>{{ title }}</h1>
        <div class="desc" v-if="desc">{{ desc }}</div>
      </div>
    </div>
    <div class="topbar-right">
      <div class="topbar-meta">
        <span>📅 {{ tanggalSekarang }}</span>
        <span>🕐 {{ jamSekarang }}</span>
      </div>
      <div class="topbar-bell">🔔<span class="dot"></span></div>
      <div class="topbar-user" @click="menuOpen = !menuOpen" style="position:relative;">
        <div class="avatar">{{ inisial }}</div>
        <span class="nama">{{ nama }}</span>
        <span style="font-size:11px;color:var(--teks-muted);">▾</span>
        <div v-if="menuOpen" style="position:absolute;top:calc(100% + 8px);right:0;background:#fff;border:1px solid var(--border);border-radius:10px;box-shadow:var(--shadow);min-width:140px;z-index:10;">
          <button class="btn btn-ghost" style="width:100%;border:none;border-radius:10px;justify-content:flex-start;" @click="logout">🚪 Keluar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { toggleSidebar } from '../composables/useSidebar';

defineProps({ title: String, desc: String });
const router = useRouter();
const menuOpen = ref(false);
const now = ref(new Date());
let timer;

onMounted(() => { timer = setInterval(() => (now.value = new Date()), 1000 * 30); });
onUnmounted(() => clearInterval(timer));

const tanggalSekarang = computed(() =>
  now.value.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
);
const jamSekarang = computed(() => now.value.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
const nama = computed(() => localStorage.getItem('siakad_nama') || 'Administrator');
const inisial = computed(() => nama.value.trim().charAt(0).toUpperCase());

function logout() {
  localStorage.removeItem('siakad_token');
  localStorage.removeItem('siakad_nama');
  router.push('/login');
}
</script>
