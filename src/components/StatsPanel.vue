<template>
  <div class="stats-panel">
    <h3 class="section-title">Statistiques</h3>

    <div class="stat-categories">
      <div
        v-for="cat in STAT_CATEGORIES"
        :key="cat.id"
        class="stat-category"
        :style="{ '--cat-color': cat.color }"
      >
        <button
          class="cat-header"
          @click="toggleCategory(cat.id)"
        >
          <span class="cat-label">{{ cat.label }}</span>
          <span class="cat-toggle">{{ openCategories.has(cat.id) ? '▲' : '▼' }}</span>
        </button>

        <Transition name="expand">
          <div v-if="openCategories.has(cat.id)" class="stat-rows">
            <div
              v-for="stat in cat.stats"
              :key="stat.id"
              class="stat-row"
              :class="{ 'non-zero': computedStats[stat.id] !== 0 }"
            >
              <span class="stat-label">{{ stat.label }}</span>
              <span
                class="stat-value"
                :class="{
                  positive: computedStats[stat.id] > 0,
                  negative: computedStats[stat.id] < 0,
                }"
              >
                {{ formatValue(computedStats[stat.id], stat.unit) }}
              </span>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { STAT_CATEGORIES } from '@/data/constants'
import { useBuildStore } from '@/stores/buildStore'

const buildStore = useBuildStore()
const computedStats = computed(() => buildStore.computedStats)

const openCategories = ref(new Set(STAT_CATEGORIES.map(c => c.id)))

function toggleCategory(id) {
  if (openCategories.value.has(id)) openCategories.value.delete(id)
  else openCategories.value.add(id)
}

function formatValue(val, unit) {
  if (val === 0) return '—'
  const prefix = val > 0 ? '+' : ''
  return `${prefix}${val}${unit}`
}
</script>

<style scoped>
.stats-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-categories {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.stat-category {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.cat-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: color-mix(in srgb, var(--cat-color) 10%, var(--surface-2));
  border: none;
  cursor: pointer;
  color: var(--cat-color);
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: background 0.2s;
}

.cat-header:hover {
  background: color-mix(in srgb, var(--cat-color) 18%, var(--surface-2));
}

.cat-toggle {
  font-size: 0.7rem;
  opacity: 0.7;
}

.stat-rows {
  padding: 0.35rem 0;
}

.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.28rem 0.9rem;
  font-size: 0.82rem;
  transition: background 0.1s;
}

.stat-row:hover {
  background: var(--surface-3);
}

.stat-row.non-zero .stat-label {
  color: var(--text);
}

.stat-label {
  color: var(--text-muted);
}

.stat-value {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--text-muted);
}

.stat-value.positive { color: #5dde8a; }
.stat-value.negative { color: #e05c5c; }

/* Expand animation */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 400px;
  opacity: 1;
}
</style>
