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
  gap: 0.8rem;
}

.class-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.55rem;
}

.class-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 0.4rem 0.85rem;
  width: 100%;
  background: var(--surface-2);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius);
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

/* Halo coloré de fond */
.class-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 10%,
    color-mix(in srgb, var(--cc) 30%, transparent) 0%,
    transparent 70%);
  opacity: 0;
  transition: opacity 0.22s;
  pointer-events: none;
}

/* Barre colorée en bas */
.class-btn::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent,
    color-mix(in srgb, var(--cc) 80%, transparent),
    transparent);
  opacity: 0;
  transition: opacity 0.22s;
}

.class-btn:hover .class-glow,
.class-btn.active .class-glow { opacity: 1; }
.class-btn:hover::after,
.class-btn.active::after { opacity: 1; }

.class-btn:hover {
  border-color: color-mix(in srgb, var(--cc) 55%, transparent);
  color: var(--cc);
  transform: translateY(-3px);
  box-shadow: 0 10px 28px color-mix(in srgb, var(--cc) 22%, transparent), 0 2px 8px rgba(0,0,0,0.5);
}

.class-btn.active {
  border-color: var(--cc);
  color: var(--cc);
  background: color-mix(in srgb, var(--cc) 10%, var(--surface-2));
  transform: translateY(-1px);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--cc) 40%, transparent),
    0 8px 32px color-mix(in srgb, var(--cc) 30%, transparent),
    inset 0 1px 0 color-mix(in srgb, var(--cc) 20%, transparent);
}

.class-icon {
  font-size: 2rem;
  line-height: 1;
  transition: filter 0.2s, transform 0.2s;
}

.class-btn.active .class-icon {
  filter: drop-shadow(0 0 14px var(--cc)) brightness(1.15);
  transform: scale(1.08);
}
.class-btn:hover:not(.active) .class-icon {
  filter: drop-shadow(0 0 10px var(--cc));
  transform: scale(1.05);
}

.class-label {
  font-size: 0.63rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
</style>
