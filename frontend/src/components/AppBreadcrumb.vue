<template>
  <div class="breadcrumb">
    <template v-for="(item, idx) in items" :key="idx">
      <RouterLink v-if="item.to && idx < items.length - 1" :to="item.to">{{ item.label }}</RouterLink>
      <span v-else :class="idx === items.length - 1 ? 'current' : ''">{{ item.label }}</span>
      <span v-if="idx < items.length - 1" class="sep">›</span>
    </template>
  </div>
</template>

<script setup>
defineProps({ items: { type: Array, required: true } });
</script>
