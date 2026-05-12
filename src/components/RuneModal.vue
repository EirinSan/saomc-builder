<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h3>Choisir une rune <span class="slot-label">— slot {{ runeIndex + 1 }}</span></h3>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>

        <div class="modal-filters">
          <input
            v-model="search"
            class="search-input"
            placeholder="Rechercher une rune..."
            autofocus
          />
        </div>

        <div class="rune-list">
          <div v-if="filteredRunes.length === 0" class="empty-state">
            Aucune rune trouvée.
          </div>

          <button
            v-for="rune in filteredRunes"
            :key="rune.id"
            class="rune-row"
            :class="{ selected: pendingRuneId === rune.id, current: currentRuneId === rune.id && pendingRuneId !== rune.id }"
            @click="pendingRuneId = rune.id"
          >
            <span
              class="rune-icon"
              :style="{
                background: rune.color + '22',
                borderColor: rune.color + '66',
              }"
            >{{ rune.icon }}</span>
            <div class="rune-info">
              <div class="rune-name" :style="{ color: rune.color }">{{ rune.name }}</div>
              <div class="rune-stats">
                <span
                  v-for="(val, statId) in rune.stats"
                  :key="statId"
                  class="stat-chip"
                  :class="{ negative: val < 0 }"
                >
                  {{ val > 0 ? '+' : '' }}{{ val }} {{ getStatLabel(statId) }}
                </span>
              </div>
            </div>
            <span v-if="currentRuneId === rune.id" class="current-badge">Actuelle</span>
          </button>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="$emit('unequip')">Retirer la rune</button>
          <button class="btn-primary" :disabled="!pendingRuneId" @click="confirmSelect">
            Insérer
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RUNES } from '@/data/runes'
import { STAT_CATEGORIES } from '@/data/constants'

const props = defineProps({
  slotId:       { type: String, required: true },
  runeIndex:    { type: Number, required: true },
  currentRuneId:{ type: String, default: null },
})

const emit = defineEmits(['close', 'select', 'unequip'])

const search       = ref('')
const pendingRuneId = ref(props.currentRuneId)

const filteredRunes = computed(() => {
  if (!search.value) return RUNES
  const q = search.value.toLowerCase()
  return RUNES.filter(r => r.name.toLowerCase().includes(q))
})

const statLabelMap = computed(() => {
  const map = {}
  STAT_CATEGORIES.forEach(cat => cat.stats.forEach(s => { map[s.id] = s.label }))
  return map
})

function getStatLabel(statId) {
  return statLabelMap.value[statId] ?? statId
}

function confirmSelect() {
  if (pendingRuneId.value) emit('select', pendingRuneId.value)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.modal {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: 12px;
  width: min(520px, 95vw);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
}

.slot-label { color: var(--accent); }

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.2s;
}
.close-btn:hover { color: var(--text); }

.modal-filters {
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--border);
}

.search-input {
  width: 100%;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.search-input:focus { border-color: var(--accent); }

.rune-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 2rem;
  font-size: 0.9rem;
}

.rune-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  padding: 0.6rem 0.75rem;
  position: relative;
}
.rune-row:hover { border-color: var(--accent-dim); background: var(--surface-3); }
.rune-row.selected { border-color: var(--accent); box-shadow: 0 0 8px var(--accent-dim); }
.rune-row.current { border-color: color-mix(in srgb, var(--accent) 40%, transparent); }

.rune-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.rune-info {
  flex: 1;
  min-width: 0;
}

.rune-name {
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
}

.rune-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.stat-chip {
  font-size: 0.7rem;
  background: var(--surface-1);
  border-radius: 4px;
  padding: 0.1rem 0.4rem;
  color: #5dde8a;
  border: 1px solid rgba(93, 222, 138, 0.2);
}
.stat-chip.negative { color: #e05c5c; border-color: rgba(224, 92, 92, 0.2); }

.current-badge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 20px;
  padding: 0.1rem 0.5rem;
  flex-shrink: 0;
}

.modal-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--border);
}

.btn-primary {
  padding: 0.5rem 1.25rem;
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  font-size: 0.875rem;
}
.btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }

.btn-secondary {
  padding: 0.5rem 1.25rem;
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}
.btn-secondary:hover { border-color: #e05c5c; color: #e05c5c; }
</style>
