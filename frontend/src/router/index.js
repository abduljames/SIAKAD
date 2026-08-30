import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/login', component: () => import('../views/LoginView.vue') },
  { path: '/', redirect: '/jenis-tagihan' },
  { path: '/santri', component: () => import('../views/SantriView.vue'), meta: { requiresAuth: true } },
  { path: '/jenis-tagihan', component: () => import('../views/JenisTagihanView.vue'), meta: { requiresAuth: true } },
  { path: '/tagihan', component: () => import('../views/TagihanSantriView.vue'), meta: { requiresAuth: true } },
  { path: '/tagihan/buat', component: () => import('../views/BuatTagihanView.vue'), meta: { requiresAuth: true } },
  { path: '/pembayaran', component: () => import('../views/PembayaranSantriView.vue'), meta: { requiresAuth: true } },
  { path: '/laporan', component: () => import('../views/LaporanView.vue'), meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const isLoggedIn = !!localStorage.getItem('siakad_token');
  if (to.meta.requiresAuth && !isLoggedIn) return '/login';
  if (to.path === '/login' && isLoggedIn) return '/jenis-tagihan';
  return true;
});

export default router;
