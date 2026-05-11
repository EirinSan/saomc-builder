<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h3>Choisir un item — <span class="slot-label">{{ slotLabel }}</span></h3>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>

        <div class="modal-filters">
          <input
            v-model="search"
            class="search-input"
            placeholder="Rechercher un item..."
          />
          <select v-model="rarityFilter" class="filter-select">
            <option value="">Toutes raretés</option>
            <option v-for="r in RARITIES" :key="r.id" :value="r.id">{{ r.label }}</option>
          </select>
        </div>
        <div class="modal-filters-row2">
          <div class="palier-pills">
            <button
              v-for="p in PALIER_OPTIONS" :key="p.value"
              class="palier-pill"
              :class="{ active: palierFilter === p.value }"
              type="button"
              @click="palierFilter = palierFilter === p.value ? null : p.value"
            >{{ p.label }}</button>
          </div>
          <label class="event-toggle">
            <input type="checkbox" v-model="showEvent" />
            <span>Items d'événement</span>
          </label>
        </div>

        <div class="item-list">
          <div v-if="filteredItems.length === 0" class="empty-state">
            Aucun item disponible pour ce slot.
          </div>

          <button
            v-for="item in filteredItems"
            :key="item.id"
            class="item-row"
            :class="{ selected: selectedItemId === item.id, incompatible: !isCompatible(item) }"
            @click="selectItem(item)"
          >
            <div class="item-rarity-bar" :style="{ background: getRarityColor(item.rarity) }"></div>
            <div class="item-info">
              <div class="item-name" :style="{ color: getRarityColor(item.rarity) }">
                {{ item.name }}
              </div>
              <div class="item-meta">
                <span class="item-level">Niv. {{ item.requiredLevel }}</span>
                <span class="item-rarity">{{ getRarityLabel(item.rarity) }}</span>
                <span v-if="item.classes" class="item-classes">
                  {{ item.classes.map(formatClass).join(', ') }}
                </span>
                <span v-else class="item-classes">Toutes classes</span>
              </div>
              <div class="item-stats-preview">
                <span
                  v-for="(val, statId) in item.stats"
                  :key="statId"
                  class="stat-chip"
                  :class="{ negative: val < 0 }"
                >
                  {{ val > 0 ? '+' : '' }}{{ val }} {{ getStatLabel(statId) }}
                </span>
              </div>
            </div>
          </button>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="$emit('unequip')">Retirer l'item</button>
          <button class="btn-primary" :disabled="!pendingItem" @click="confirmSelect">
            Équiper
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RARITIES, STAT_CATEGORIES, CLASSES } from '@/data/constants'
import { useBuildStore } from '@/stores/buildStore'
import { useItemsStore } from '@/stores/itemsStore'

const props = defineProps({
  slotId: { type: String, required: true },
  slotLabel: { type: String, required: true },
  selectedItemId: { type: String, default: null },
})

const emit = defineEmits(['close', 'select', 'unequip'])

const buildStore = useBuildStore()
const itemsStore = useItemsStore()
const search = ref('')
const rarityFilter = ref('')
const palierFilter = ref(null)
const showEvent = ref(false)
const pendingItem = ref(null)

const PALIER_OPTIONS = [
  { label: 'P1', value: 1 },
  { label: 'P2', value: 2 },
  { label: 'P3', value: 3 },
]

const allItems = computed(() => itemsStore.getByType(props.slotId))

const ARTEFACT_SLOTS = ['artefact1', 'artefact2', 'artefact3']

// Pour les artefacts : IDs déjà équipés dans les autres slots artefacts
const equippedArtefactsElsewhere = computed(() => {
  if (!ARTEFACT_SLOTS.includes(props.slotId)) return []
  const eq = buildStore.equipment
  return ARTEFACT_SLOTS
    .filter(slot => slot !== props.slotId && eq[slot])
    .map(slot => eq[slot])
})

const filteredItems = computed(() => {
  let items = allItems.value
  // Artefacts : exclure ceux déjà équipés dans un autre slot artefact
  if (ARTEFACT_SLOTS.includes(props.slotId)) {
    items = items.filter(i => !equippedArtefactsElsewhere.value.includes(i.id))
  }
  if (!showEvent.value) items = items.filter(i => !i.tags?.includes('event'))
  if (rarityFilter.value) items = items.filter(i => i.rarity === rarityFilter.value)
  if (palierFilter.value !== null) items = items.filter(i => i.palier === palierFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    items = items.filter(i => i.name.toLowerCase().includes(q))
  }
  return items
})

function isCompatible(item) {
  if (!item.classes) return true
  if (!buildStore.selectedClass) return true
  return item.classes.includes(buildStore.selectedClass)
}

function selectItem(item) {
  pendingItem.value = item
}

function confirmSelect() {
  if (pendingItem.value) {
    emit('select', pendingItem.value.id)
    emit('close')
  }
}

function getRarityColor(rarityId) {
  return RARITIES.find(r => r.id === rarityId)?.color ?? '#fff'
}

function getRarityLabel(rarityId) {
  return RARITIES.find(r => r.id === rarityId)?.label ?? rarityId
}

function formatClass(classId) {
  return CLASSES.find(c => c.id === classId)?.label ?? classId
}

const statLabelMap = computed(() => {
  const map = {}
  STAT_CATEGORIES.forEach(cat => cat.stats.forEach(s => { map[s.id] = s.label }))
  return map
})

function getStatLabel(statId) {
  return statLabelMap.value[statId] ?? statId
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
  z-index: 1000;
}

.modal {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: 12px;
  width: min(640px, 95vw);
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

.slot-label {
  color: var(--accent);
}

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
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--border);
}

.search-input {
  flex: 1;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus { border-color: var(--accent); }

.filter-select {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  padding: 0.5rem 0.5rem;
  font-size: 0.875rem;
  outline: none;
  cursor: pointer;
}

.modal-filters-row2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1.25rem;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

.palier-pills {
  display: flex;
  gap: 0.3rem;
}

.palier-pill {
  padding: 0.25rem 0.7rem;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.04em;
}

.palier-pill:hover { border-color: var(--accent); color: var(--accent); }

.palier-pill.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.event-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  cursor: pointer;
  margin-left: auto;
  user-select: none;
}

.event-toggle input[type="checkbox"] {
  accent-color: var(--accent);
  width: 14px;
  height: 14px;
  cursor: pointer;
}

.event-toggle span { transition: color 0.15s; }
.event-toggle:hover span { color: var(--text); }

.item-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  /* Scrollbar custom */
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}
.item-list::-webkit-scrollbar { width: 5px; }
.item-list::-webkit-scrollbar-track { background: transparent; }
.item-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 2rem;
  font-size: 0.9rem;
}

.item-row {
  display: flex;
  align-items: stretch;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  overflow: hidden;
  padding: 0;
  flex-shrink: 0;
}

.item-row:hover { border-color: var(--accent-dim); background: var(--surface-3); }
.item-row.selected {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 6%, var(--surface-2));
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent) 25%, transparent);
}
.item-row.incompatible { opacity: 0.35; }

.item-rarity-bar {
  width: 4px;
  flex-shrink: 0;
}

.item-info {
  padding: 0.6rem 0.75rem;
  flex: 1;
}

.item-name {
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
}

.item-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.35rem;
  flex-wrap: wrap;
}

.item-level { color: var(--text-muted); }
.item-rarity, .item-classes { }

.item-stats-preview {
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

.stat-chip.negative {
  color: #e05c5c;
  border-color: rgba(224, 92, 92, 0.2);
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
