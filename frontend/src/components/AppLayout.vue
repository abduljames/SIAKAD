<template>
  <div class="app-shell">
    <AppSidebar />
    <div class="main-area">
      <AppTopbar :title="title" :desc="desc" />
      <AppBreadcrumb :items="breadcrumb" />
      <div class="content-area">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';
import AppBreadcrumb from './AppBreadcrumb.vue';

defineProps({
  title: String,
  desc: String,
  breadcrumb: { type: Array, default: () => [] },
});
</script>
