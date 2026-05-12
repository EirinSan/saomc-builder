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
        <button class="cat-header" @click="toggleCategory(cat.id)">
          <span class="cat-label">{{ cat.label }}</span>
          <span class="cat-toggle">{{ openCategories.has(cat.id) ? '▲' : '▼' }}</span>
        </button>

        <Transition name="expand">
          <div v-if="openCategories.has(cat.id)" class="stat-rows">
            <div
              v-for="stat in cat.stats"
              :key="stat.id"
              class="stat-row"
              :class="{
                'non-zero': computedStats[stat.id] !== 0,
                'active': selectedStat === stat.id,
              }"
              @click="toggleDetail(stat)"
            >
              <span class="stat-label">{{ stat.label }}</span>
              <div class="stat-right">
                <span
                  v-if="statsMaxDelta[stat.id]"
                  class="stat-range"
                >
                  {{ formatValue(computedStats[stat.id], stat.unit) }}
                  <span class="range-arrow">→</span>
                  {{ formatValue(computedStats[stat.id] + statsMaxDelta[stat.id], stat.unit) }}
                </span>
                <span
                  v-else
                  class="stat-value"
                  :class="{
                    positive: computedStats[stat.id] > 0,
                    negative: computedStats[stat.id] < 0,
                  }"
                >
                  {{ formatValue(computedStats[stat.id], stat.unit) }}
                </span>
                <span class="stat-arrow">{{ selectedStat === stat.id ? '▲' : '▼' }}</span>
              </div>
            </div>

            <!-- Panneau de détail inline -->
            <Transition name="detail-expand">
              <div
                v-if="selectedStat && cat.stats.some(s => s.id === selectedStat)"
                class="detail-panel"
              >
                <div v-if="breakdown.lines.length === 0" class="detail-empty">
                  Aucune contribution pour cette stat.
                </div>
                <div v-else>
                  <div
                    v-for="(line, i) in breakdown.lines"
                    :key="i"
                    class="detail-line"
                    :class="line.type"
                  >
                    <span class="detail-source">
                      <span class="detail-icon">{{ typeIcon(line.type) }}</span>
                      {{ line.source }}
                    </span>
                    <span
                      class="detail-value"
                      :class="{ pos: line.value > 0, neg: line.value < 0 }"
                    >
                      {{ line.value > 0 ? '+' : '' }}{{ line.value }}{{ selectedStatUnit }}
                    </span>
                  </div>
                  <div class="detail-total">
                    <span>Total</span>
                    <span
                      class="detail-value"
                      :class="{ pos: breakdown.total > 0, neg: breakdown.total < 0 }"
                    >
                      {{ breakdown.total > 0 ? '+' : '' }}{{ breakdown.total }}{{ selectedStatUnit }}
                    </span>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { STAT_CATEGORIES, RARITIES } from '@/data/constants'
import { useBuildStore } from '@/stores/buildStore'

const buildStore     = useBuildStore()
const computedStats  = computed(() => buildStore.computedStats)
const statsMaxDelta  = computed(() => buildStore.statsMaxDelta)
const openCategories = ref(new Set(STAT_CATEGORIES.map(c => c.id)))
const selectedStat   = ref(null)
const selectedStatUnit = ref('')

const breakdown = computed(() =>
  selectedStat.value ? buildStore.statBreakdown(selectedStat.value) : { lines: [], total: 0 }
)

function toggleCategory(id) {
  if (openCategories.value.has(id)) openCategories.value.delete(id)
  else openCategories.value.add(id)
}

function toggleDetail(stat) {
  if (selectedStat.value === stat.id) {
    selectedStat.value = null
  } else {
    selectedStat.value = stat.id
    selectedStatUnit.value = stat.unit ?? ''
  }
}

function formatValue(val, unit) {
  if (val === 0) return '—'
  const prefix = val > 0 ? '+' : ''
  return `${prefix}${val}${unit}`
}

function typeIcon(type) {
  return { base: '⚙️', item: '🗡️', set: '✨', attr: '💡' }[type] ?? ''
}

function rarityColor(id) {
  return RARITIES.find(r => r.id === id)?.color ?? '#ccc'
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

.cat-toggle { font-size: 0.7rem; opacity: 0.7; }

.stat-rows { padding: 0.25rem 0; }

.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.28rem 0.9rem;
  font-size: 0.82rem;
  transition: background 0.12s;
  cursor: pointer;
  border-radius: 0;
  user-select: none;
}

.stat-row:hover { background: var(--surface-3); }

.stat-row.active {
  background: color-mix(in srgb, var(--cat-color) 8%, var(--surface-2));
}

.stat-row.non-zero .stat-label { color: var(--text); }
.stat-label { color: var(--text-muted); flex: 1; }

.stat-right {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.stat-value {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--text-muted);
  min-width: 40px;
  text-align: right;
}

.stat-value.positive { color: #5dde8a; }
.stat-value.negative { color: #e05c5c; }

.stat-range {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-size: 0.78rem;
  text-align: right;
  color: #f0a844;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.range-arrow {
  opacity: 0.6;
  font-size: 0.7rem;
}

.stat-arrow {
  font-size: 0.55rem;
  color: var(--text-muted);
  opacity: 0.5;
  width: 10px;
}

/* ── Panneau de détail ── */
.detail-panel {
  margin: 0 0.5rem 0.35rem;
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.detail-empty {
  padding: 0.6rem 0.75rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  font-style: italic;
}

.detail-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.3rem 0.75rem;
  font-size: 0.78rem;
  border-bottom: 1px solid var(--border);
  transition: background 0.1s;
}

.detail-line:last-of-type { border-bottom: none; }
.detail-line:hover { background: var(--surface-3); }

.detail-line.base   { background: rgba(255,255,255,0.02); }
.detail-line.set    { background: rgba(124,58,237,0.04); }
.detail-line.attr   { background: rgba(6,182,212,0.04); }

.detail-source {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--text-muted);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-icon { font-size: 0.75rem; flex-shrink: 0; }

.detail-value {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.detail-value.pos { color: #5dde8a; }
.detail-value.neg { color: #e05c5c; }

.detail-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 700;
  background: var(--surface-2);
  border-top: 1px solid var(--border);
  color: var(--text);
}

/* Animations */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to { max-height: 0; opacity: 0; }
.expand-enter-to,
.expand-leave-from { max-height: 600px; opacity: 1; }

.detail-expand-enter-active,
.detail-expand-leave-active {
  transition: all 0.18s ease;
  overflow: hidden;
}
.detail-expand-enter-from,
.detail-expand-leave-to { max-height: 0; opacity: 0; }
.detail-expand-enter-to,
.detail-expand-leave-from { max-height: 300px; opacity: 1; }
</style>
