<template>
  <div class="class-selector">
    <h3 class="section-title">Classe</h3>
    <div class="class-grid">
      <button
        v-for="cls in CLASSES"
        :key="cls.id"
        class="class-btn"
        :class="{ active: buildStore.selectedClass === cls.id }"
        :style="{ '--cc': cls.color }"
        @click="buildStore.setClass(cls.id)"
      >
        <div class="class-glow" />
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
}

.class-btn {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.9rem 0.5rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s;
  overflow: hidden;
}

.class-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--cc) 18%, transparent), transparent 70%);
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

.class-btn:hover .class-glow,
.class-btn.active .class-glow { opacity: 1; }

.class-btn:hover {
  border-color: color-mix(in srgb, var(--cc) 60%, transparent);
  color: var(--cc);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px color-mix(in srgb, var(--cc) 18%, transparent);
}

.class-btn.active {
  border-color: var(--cc);
  color: var(--cc);
  background: color-mix(in srgb, var(--cc) 10%, var(--surface-2));
  box-shadow: 0 0 18px color-mix(in srgb, var(--cc) 30%, transparent),
              inset 0 1px 0 color-mix(in srgb, var(--cc) 30%, transparent);
}

.class-icon {
  font-size: 1.8rem;
  line-height: 1;
  filter: drop-shadow(0 2px 6px color-mix(in srgb, var(--cc) 40%, transparent));
}

.class-btn.active .class-icon {
  filter: drop-shadow(0 0 8px var(--cc));
}

.class-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
</style>
