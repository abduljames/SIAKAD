import { reactive } from 'vue';

export const dialogState = reactive({
  visible: false,
  type: 'success', // success | error | confirm
  title: '',
  message: '',
  resolve: null,
});

function open(type, title, message) {
  return new Promise((resolve) => {
    dialogState.type = type;
    dialogState.title = title;
    dialogState.message = message;
    dialogState.resolve = resolve;
    dialogState.visible = true;
  });
}

export function successDialog(message, title = 'Berhasil') {
  return open('success', title, message);
}

export function errorDialog(message, title = 'Gagal') {
  return open('error', title, message);
}

export function confirmDialog(message, title = 'Konfirmasi') {
  return open('confirm', title, message);
}

export function closeDialog(result) {
  dialogState.visible = false;
  if (dialogState.resolve) dialogState.resolve(result);
  dialogState.resolve = null;
}

// Ambil pesan error yang enak dibaca dari response axios, dipakai di semua
// view supaya pesan gagal konsisten (bukan cuma "Request failed...").
export function pesanError(err) {
  return err?.response?.data?.message || err?.message || 'Terjadi kesalahan, coba lagi.';
}
