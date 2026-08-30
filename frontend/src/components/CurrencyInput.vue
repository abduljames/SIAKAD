<template>
  <input type="text" inputmode="numeric" :value="tampilan" @input="onInput" @blur="onBlur" />
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({ modelValue: { type: [Number, String], default: 0 } });
const emit = defineEmits(['update:modelValue']);

function formatAngka(n) {
  return Number(n || 0).toLocaleString('id-ID');
}

function angkaMentah(v) {
  return String(v ?? '').replace(/\D/g, '');
}

const tampilan = ref(formatAngka(props.modelValue));

watch(
  () => props.modelValue,
  (v) => {
    if (angkaMentah(v) !== angkaMentah(tampilan.value)) tampilan.value = formatAngka(v);
  },
);

function onInput(e) {
  const raw = angkaMentah(e.target.value);
  tampilan.value = raw ? formatAngka(raw) : '';
  emit('update:modelValue', raw ? Number(raw) : 0);
}

function onBlur() {
  tampilan.value = formatAngka(props.modelValue);
}
</script>
