<template>
  <div class="set-panel" v-if="buildStore.activeSets.length > 0 || hasPartialSets">
    <h3 class="section-title">Effets de Set</h3>

    <!-- Sets actifs (>= 2 pièces) -->
    <div
      v-for="set in buildStore.activeSets"
      :key="set.id"
      class="set-card active"
      :style="{ '--set-color': set.color }"
    >
      <div class="set-header">
        <span class="set-name">{{ set.name }}</span>
        <span class="set-count">{{ set.count }}/{{ maxPieces(set.id) }}</span>
      </div>

      <div class="set-bonuses">
        <div
          v-for="bonus in allBonuses(set.id)"
          :key="bonus.count"
          class="bonus-row"
          :class="{ unlocked: set.count >= bonus.count }"
        >
          <span class="bonus-threshold">[{{ bonus.count }}]</span>
          <span class="bonus-label">{{ bonus.label }}</span>
          <span class="bonus-check">{{ set.count >= bonus.count ? '✓' : '○' }}</span>
        </div>
      </div>
    </div>

    <!-- Sets partiels (1 pièce uniquement) -->
    <div v-if="hasPartialSets" class="partial-section">
      <div
        v-for="[setId, count] in partialSets"
        :key="setId"
        class="set-card partial"
        :style="{ '--set-color': getSet(setId)?.color ?? '#555' }"
      >
        <div class="set-header">
          <span class="set-name">{{ getSet(setId)?.name ?? setId }}</span>
          <span class="set-count partial-count">{{ count }}/{{ maxPieces(setId) }}</span>
        </div>
        <div class="set-next">
          Prochain bonus à 2 pièces
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBuildStore } from '@/stores/buildStore'
import { useItemsStore } from '@/stores/itemsStore'

const buildStore  = useBuildStore()
const itemsStore  = useItemsStore()

// Sets avec exactement 1 pièce (pas encore actifs)
const partialSets = computed(() => {
  const counts = {}
  Object.values(buildStore.equipment).forEach(itemId => {
    if (!itemId) return
    const item = itemsStore.getById(itemId)
    if (!item?.set) return
    counts[item.set] = (counts[item.set] || 0) + 1
  })
  return Object.entries(counts).filter(([, c]) => c === 1)
})

const hasPartialSets = computed(() => partialSets.value.length > 0)

function getSet(setId) {
  return itemsStore.sets[setId]
}

function allBonuses(setId) {
  return itemsStore.sets[setId]?.bonuses ?? []
}

// Nombre total d'items dans ce set (dans la DB)
function maxPieces(setId) {
  const count = itemsStore.items.filter(i => i.set === setId).length
  return count > 0 ? count : '?'
}
</script>

<style scoped>
.set-panel {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.set-card {
  border: 1px solid color-mix(in srgb, var(--set-color) 28%, transparent);
  border-radius: 12px;
  overflow: hidden;
  background: color-mix(in srgb, var(--set-color) 4%, rgba(255,255,255,0.01));
  box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  position: relative;
}

/* Accent line top */
.set-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    color-mix(in srgb, var(--set-color) 60%, transparent),
    transparent);
  pointer-events: none;
}

.set-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.8rem;
  background: color-mix(in srgb, var(--set-color) 12%, rgba(255,255,255,0.01));
  border-bottom: 1px solid color-mix(in srgb, var(--set-color) 18%, transparent);
}

.set-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--set-color);
}

.set-count {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--set-color);
  background: color-mix(in srgb, var(--set-color) 20%, transparent);
  border: 1px solid color-mix(in srgb, var(--set-color) 30%, transparent);
  border-radius: 12px;
  padding: 0.1rem 0.5rem;
}

.partial-count {
  color: var(--text-muted);
  background: var(--surface-3);
  border-color: var(--border);
}

.set-bonuses {
  padding: 0.4rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.bonus-row {
  display: grid;
  grid-template-columns: 28px 1fr 16px;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.76rem;
  color: var(--text-muted);
  opacity: 0.5;
  transition: all 0.2s;
}

.bonus-row.unlocked {
  color: var(--text);
  opacity: 1;
}

.bonus-threshold {
  font-weight: 700;
  color: var(--set-color);
}

.bonus-check {
  text-align: center;
  font-size: 0.7rem;
  color: #5dde8a;
}

.bonus-row:not(.unlocked) .bonus-check {
  color: var(--text-muted);
}

/* Partiels */
.partial-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.set-card.partial {
  border-style: dashed;
  opacity: 0.65;
}

.set-next {
  padding: 0.35rem 0.75rem;
  font-size: 0.74rem;
  color: var(--text-muted);
  font-style: italic;
}
</style>
