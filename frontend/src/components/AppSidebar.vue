<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="mark">S</div>
      <div>
        <div class="title">SIAKAD</div>
        <div class="subtitle">Sistem Akademik Pesantren</div>
      </div>
    </div>

    <div class="nav-group-label">Data Master</div>
    <RouterLink class="nav-link" active-class="active" to="/santri"><span class="icon">🧑‍🎓</span> Santri & Kelas</RouterLink>

    <div class="nav-group-label">Tagihan Santri</div>
    <RouterLink class="nav-link" active-class="active" to="/jenis-tagihan"><span class="icon">🏷️</span> Jenis Tagihan</RouterLink>
    <RouterLink class="nav-link" active-class="active" to="/tagihan"><span class="icon">🧾</span> Tagihan Santri</RouterLink>
    <RouterLink class="nav-link" active-class="active" to="/pembayaran"><span class="icon">💳</span> Pembayaran Santri</RouterLink>

    <div class="nav-group-label">Laporan</div>
    <RouterLink class="nav-link" active-class="active" to="/laporan"><span class="icon">📊</span> Rekap Tagihan</RouterLink>
  </aside>
</template>
