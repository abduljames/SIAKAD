<template>
  <aside class="sidebar" :class="{ collapsed: !sidebarTerbuka }">
    <div class="sidebar-brand">
      <div>
        <div class="title">SIAKAD</div>
        <div class="subtitle">Sistem Akademik Pesantren</div>
      </div>
      <button class="sidebar-toggle-btn" style="margin-left:auto;" @click="toggleSidebar" title="Sembunyikan menu">☰</button>
    </div>

    <div class="nav-group-label">Data Master</div>
    <RouterLink class="nav-link" active-class="active" to="/santri"><span class="icon tone-biru">🧑‍🎓</span> Santri & Kelas</RouterLink>

    <div class="nav-group-label">Tagihan Santri</div>
    <RouterLink class="nav-link" active-class="active" to="/jenis-tagihan"><span class="icon tone-oranye">🏷️</span> Jenis Tagihan</RouterLink>
    <RouterLink class="nav-link" active-class="active" to="/tagihan"><span class="icon tone-hijau">🧾</span> Tagihan Santri</RouterLink>
    <RouterLink class="nav-link" active-class="active" to="/pembayaran"><span class="icon tone-teal">💳</span> Pembayaran Santri</RouterLink>

    <div class="nav-group-label">Laporan</div>
    <RouterLink class="nav-link" active-class="active" to="/laporan"><span class="icon tone-ungu">📊</span> Rekap Tagihan</RouterLink>
  </aside>
</template>

<script setup>
import { sidebarTerbuka, toggleSidebar } from '../composables/useSidebar';
</script>
