import { ref } from 'vue';

const tersimpan = localStorage.getItem('siakad_sidebar_terbuka');
// Kalau belum pernah diatur user, default-nya tertutup di layar sempit
// (hp/tablet) supaya tidak menutupi konten, terbuka di layar lebar.
const defaultTerbuka = window.innerWidth > 900;
export const sidebarTerbuka = ref(tersimpan === null ? defaultTerbuka : tersimpan === 'true');

export function toggleSidebar() {
  sidebarTerbuka.value = !sidebarTerbuka.value;
  localStorage.setItem('siakad_sidebar_terbuka', String(sidebarTerbuka.value));
}
