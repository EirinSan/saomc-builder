<template>
  <div id="app">
    <BuildHeader />
    <RouterView />
    <Analytics />
    <SpeedInsights />
  </div>
</template>

<script setup>
import BuildHeader from '@/components/BuildHeader.vue'
import { Analytics } from '@vercel/analytics/vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'
</script>

<style>
#app {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
}
</style>
