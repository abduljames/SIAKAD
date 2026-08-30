import { ref } from 'vue';

const tersimpan = localStorage.getItem('siakad_sidebar_terbuka');
export const sidebarTerbuka = ref(tersimpan === null ? true : tersimpan === 'true');

export function toggleSidebar() {
  sidebarTerbuka.value = !sidebarTerbuka.value;
  localStorage.setItem('siakad_sidebar_terbuka', String(sidebarTerbuka.value));
}
