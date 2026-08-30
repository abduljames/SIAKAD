<template>
  <div v-if="dialogState.visible" class="dialog-overlay" @click.self="onOverlayClick">
    <div class="dialog-box">
      <div class="dialog-icon" :class="'tone-' + dialogState.type">
        <span v-if="dialogState.type === 'success'">✓</span>
        <span v-else-if="dialogState.type === 'error'">✕</span>
        <span v-else>?</span>
      </div>
      <h3>{{ dialogState.title }}</h3>
      <p>{{ dialogState.message }}</p>
      <div class="dialog-actions">
        <template v-if="dialogState.type === 'confirm'">
          <button class="btn btn-danger" style="flex:1;" @click="closeDialog(false)">Batal</button>
          <button class="btn btn-primary" style="flex:1;" @click="closeDialog(true)">Ya, Lanjutkan</button>
        </template>
        <template v-else>
          <button class="btn" :class="dialogState.type === 'error' ? 'btn-danger' : 'btn-primary'" style="flex:1;" @click="closeDialog(true)">OK</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { dialogState, closeDialog } from '../composables/useDialog';

function onOverlayClick() {
  if (dialogState.type !== 'confirm') closeDialog(true);
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.dialog-box {
  background: #fff; border-radius: var(--radius); padding: 28px 26px 22px;
  width: 340px; max-width: 90vw; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}
.dialog-icon {
  width: 52px; height: 52px; border-radius: 50%; margin: 0 auto 14px;
  display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800;
}
.dialog-icon.tone-success { background: var(--hijau-100); color: var(--hijau-700); }
.dialog-icon.tone-error { background: var(--danger-bg); color: var(--danger); }
.dialog-icon.tone-confirm { background: var(--oranye-100); color: #b45309; }
.dialog-box h3 { font-size: 16px; margin-bottom: 8px; }
.dialog-box p { font-size: 13px; color: var(--teks-sub); line-height: 1.5; white-space: pre-line; }
.dialog-actions { display: flex; gap: 10px; margin-top: 20px; }
</style>
