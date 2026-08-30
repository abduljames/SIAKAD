<template>
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);">
    <div class="card" style="width:360px;">
      <div style="text-align:center;margin-bottom:22px;">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,var(--hijau-600),var(--hijau-700));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:20px;margin:0 auto 10px;">S</div>
        <h2 style="font-size:18px;">SIAKAD</h2>
        <p style="font-size:12.5px;color:var(--teks-sub);margin-top:3px;">Sistem Akademik Pesantren</p>
      </div>

      <form @submit.prevent="submit">
        <div class="form-group">
          <label>Username</label>
          <input v-model="username" placeholder="admin" autofocus />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input v-model="password" type="password" placeholder="••••••••" />
        </div>
        <p v-if="errorMsg" style="color:var(--danger);font-size:12.5px;margin-bottom:12px;">{{ errorMsg }}</p>
        <button class="btn btn-primary" style="width:100%;" :disabled="loading">
          {{ loading ? 'Memproses...' : 'Masuk' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');

async function submit() {
  loading.value = true;
  errorMsg.value = '';
  try {
    const res = await api.post('/auth/login', { username: username.value, password: password.value });
    localStorage.setItem('siakad_token', res.data.access_token);
    localStorage.setItem('siakad_nama', res.data.nama);
    router.push('/jenis-tagihan');
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Login gagal.';
  } finally {
    loading.value = false;
  }
}
</script>
