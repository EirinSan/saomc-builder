<template>
  <div id="app">
    <BuildHeader />
    <RouterView />
    <Analytics />
  </div>
</template>

<script setup>
import BuildHeader from '@/components/BuildHeader.vue'
import { Analytics } from '@vercel/analytics/vue'
</script>

<style>
#app {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
}
</style>
