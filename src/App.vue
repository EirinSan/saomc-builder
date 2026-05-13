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

/* ─── Overrides thème clair (non-scopés → affectent tous les composants) ─── */
[data-theme="light"] .stat-row:hover,
[data-theme="light"] .detail-line:hover,
[data-theme="light"] .bonus-line:hover,
[data-theme="light"] .item-row:hover:not(.incompatible) {
  background: rgba(0, 0, 0, 0.04) !important;
}

[data-theme="light"] .class-btn {
  border-color: rgba(0,0,0,0.1) !important;
}

[data-theme="light"] .slot-btn.empty {
  border-color: rgba(0,0,0,0.12) !important;
}

[data-theme="light"] .detail-line.base   { background: rgba(0,0,0,0.02) !important; }
[data-theme="light"] .detail-line.set    { background: rgba(109,40,217,0.04) !important; }
[data-theme="light"] .detail-line.attr   { background: rgba(8,145,178,0.04) !important; }

[data-theme="light"] .bonus-lines {
  background: var(--surface-2) !important;
}
</style>
