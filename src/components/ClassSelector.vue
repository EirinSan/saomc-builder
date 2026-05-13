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
  flex-wrap: wrap;
}

.class-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.85rem 0.5rem;
  width: 108px;
  background: var(--surface-2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

/* Reflet haut de carte */
.class-btn::before {
  content: '';
  position: absolute;
  top: 0; left: 10%; right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
  pointer-events: none;
}

.class-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%,
    color-mix(in srgb, var(--cc) 28%, transparent) 0%,
    transparent 70%);
  opacity: 0;
  transition: opacity 0.25s;
  pointer-events: none;
}

/* Bottom shimmer on active */
.class-btn::after {
  content: '';
  position: absolute;
  bottom: 0; left: 15%; right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--cc) 60%, transparent), transparent);
  opacity: 0;
  transition: opacity 0.25s;
  pointer-events: none;
}

.class-btn:hover .class-glow,
.class-btn.active .class-glow { opacity: 1; }

.class-btn:hover::after,
.class-btn.active::after { opacity: 1; }

.class-btn:hover {
  border-color: color-mix(in srgb, var(--cc) 50%, transparent);
  color: var(--cc);
  transform: translateY(-3px) scale(1.02);
  box-shadow:
    0 8px 24px color-mix(in srgb, var(--cc) 20%, transparent),
    0 2px 8px rgba(0,0,0,0.4);
}

.class-btn.active {
  border-color: color-mix(in srgb, var(--cc) 70%, transparent);
  color: var(--cc);
  background: color-mix(in srgb, var(--cc) 8%, rgba(255,255,255,0.01));
  transform: translateY(-2px);
  box-shadow:
    0 0 28px color-mix(in srgb, var(--cc) 30%, transparent),
    0 4px 16px rgba(0,0,0,0.4),
    inset 0 1px 0 color-mix(in srgb, var(--cc) 20%, transparent);
}

.class-icon {
  font-size: 1.8rem;
  line-height: 1;
  transition: filter 0.2s, transform 0.2s;
  filter: drop-shadow(0 2px 6px color-mix(in srgb, var(--cc) 30%, transparent));
}

.class-btn:hover .class-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 0 10px var(--cc));
}

.class-btn.active .class-icon {
  filter: drop-shadow(0 0 12px var(--cc)) brightness(1.2);
}

.class-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
</style>
