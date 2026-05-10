<template>
  <div id="app">
    <BuildHeader />
    <RouterView />
  </div>
</template>

<script setup>
import BuildHeader from '@/components/BuildHeader.vue'
</script>

<style>
#app {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
}
</style>
