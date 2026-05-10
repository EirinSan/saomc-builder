<template>
  <div class="class-selector">
    <h3 class="section-title">Classe</h3>
    <div class="class-grid">
      <button
        v-for="cls in CLASSES"
        :key="cls.id"
        class="class-btn"
        :class="{ active: buildStore.selectedClass === cls.id }"
        :style="{ '--class-color': cls.color }"
        @click="buildStore.setClass(cls.id)"
      >
        <span class="class-icon">{{ cls.icon }}</span>
        <span class="class-label">{{ cls.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { CLASSES } from '@/data/constants'
import { useBuildStore } from '@/stores/buildStore'

const buildStore = useBuildStore()
</script>

<style scoped>
.class-selector {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.class-grid {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.class-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.6rem 1rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s;
  font-size: 0.8rem;
  min-width: 72px;
}

.class-btn:hover {
  border-color: var(--class-color);
  color: var(--class-color);
  background: color-mix(in srgb, var(--class-color) 10%, transparent);
}

.class-btn.active {
  border-color: var(--class-color);
  color: var(--class-color);
  background: color-mix(in srgb, var(--class-color) 15%, transparent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--class-color) 30%, transparent);
}

.class-icon {
  font-size: 1.4rem;
}

.class-label {
  font-weight: 600;
  letter-spacing: 0.02em;
}
</style>
