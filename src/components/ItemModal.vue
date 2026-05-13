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
            :class="{
              selected:      pendingItem?.id === item.id,
              equipped:      selectedItemId === item.id && pendingItem?.id !== item.id,
              incompatible:  !isCompatible(item),
            }"
            @click="selectItem(item)"
          >
            <div class="item-rarity-bar" :style="{ background: getRarityColor(item.rarity) }"></div>
            <div class="item-info">

              <!-- Nom -->
              <div class="item-name-row">
                <span class="item-name" :style="{ color: getRarityColor(item.rarity) }">
                  {{ item.name }}
                </span>
                <!-- Badge classe incompatible -->
                <span v-if="!isCompatible(item)" class="badge-locked" title="Classe incompatible">
                  🔒 {{ item.classes?.map(formatClass).join(' / ') }}
                </span>
              </div>

              <!-- Méta : niveau | rareté | classes -->
              <div class="item-meta">
                <span class="meta-chip">Niv. {{ item.requiredLevel }}</span>
                <span class="meta-chip rarity-text" :style="{ color: getRarityColor(item.rarity) }">
                  {{ getRarityLabel(item.rarity) }}
                </span>
                <span v-if="item.classes" class="meta-chip classes-chip">
                  {{ item.classes.map(formatClass).join(', ') }}
                </span>
                <span v-else class="meta-chip">Toutes classes</span>
                <span v-if="item.set" class="meta-chip set-chip">Set : {{ item.set }}</span>
              </div>

              <!-- Prérequis attributs -->
              <div v-if="hasRequiredAttributes(item)" class="item-prereqs">
                <span class="prereqs-label">Prérequis :</span>
                <span
                  v-for="(val, attrId) in item.requiredAttributes"
                  :key="attrId"
                  class="prereq-chip"
                  :style="{ color: getAttrColor(attrId), borderColor: getAttrColor(attrId) + '44', background: getAttrColor(attrId) + '14' }"
                >
                  {{ getAttrIcon(attrId) }} {{ getAttrLabel(attrId) }} {{ val }}
                </span>
              </div>

              <!-- Stats -->
              <div class="item-stats-preview">
                <span
                  v-for="(val, statId) in item.stats"
                  :key="statId"
                  class="stat-chip"
                  :class="{ negative: val < 0 }"
                >
                  {{ val > 0 ? '+' : '' }}{{ val }}{{ getStatUnit(statId) }}
                  <template v-if="item.statsMax?.[statId] && item.statsMax[statId] !== val">
                    → {{ item.statsMax[statId] > 0 ? '+' : '' }}{{ item.statsMax[statId] }}{{ getStatUnit(statId) }}
                  </template>
                  {{ getStatLabel(statId) }}
                </span>
              </div>

              <!-- Lore -->
              <div v-if="item.lore" class="item-lore">{{ item.lore }}</div>

            </div>
          </button>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="$emit('unequip')">Retirer l'item</button>
          <button
            class="btn-primary"
            :disabled="!pendingItem || !isCompatible(pendingItem)"
            @click="confirmSelect"
          >
            Équiper
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RARITIES, STAT_CATEGORIES, CLASSES, ATTRIBUTES } from '@/data/constants'
import { useBuildStore } from '@/stores/buildStore'
import { useItemsStore } from '@/stores/itemsStore'

const props = defineProps({
  slotId:         { type: String, required: true },
  slotLabel:      { type: String, required: true },
  selectedItemId: { type: String, default: null },
})

const emit = defineEmits(['close', 'select', 'unequip'])

const buildStore  = useBuildStore()
const itemsStore  = useItemsStore()
const search      = ref('')
const rarityFilter = ref('')
const palierFilter = ref(null)
const showEvent   = ref(false)
const pendingItem = ref(null)

const PALIER_OPTIONS = [
  { label: 'P1', value: 1 },
  { label: 'P2', value: 2 },
  { label: 'P3', value: 3 },
]

const ARTEFACT_SLOTS = ['artefact1', 'artefact2', 'artefact3']

const allItems = computed(() => itemsStore.getByType(props.slotId))

const equippedArtefactsElsewhere = computed(() => {
  if (!ARTEFACT_SLOTS.includes(props.slotId)) return []
  const eq = buildStore.equipment
  return ARTEFACT_SLOTS
    .filter(slot => slot !== props.slotId && eq[slot])
    .map(slot => eq[slot])
})

const filteredItems = computed(() => {
  let items = allItems.value
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
  // Incompatibles en bas
  return [...items].sort((a, b) => {
    const ca = isCompatible(a) ? 0 : 1
    const cb = isCompatible(b) ? 0 : 1
    return ca - cb
  })
})

function isCompatible(item) {
  if (!item.classes) return true
  if (!buildStore.selectedClass) return true
  return item.classes.includes(buildStore.selectedClass)
}

function selectItem(item) {
  if (!isCompatible(item)) return
  pendingItem.value = item
}

function confirmSelect() {
  if (pendingItem.value && isCompatible(pendingItem.value)) {
    emit('select', pendingItem.value.id)
    emit('close')
  }
}

// ── Rareté ──────────────────────────────────────────────────────────────────
function getRarityColor(rarityId) {
  return RARITIES.find(r => r.id === rarityId)?.color ?? '#fff'
}
function getRarityLabel(rarityId) {
  return RARITIES.find(r => r.id === rarityId)?.label ?? rarityId
}

// ── Classes ──────────────────────────────────────────────────────────────────
function formatClass(classId) {
  return CLASSES.find(c => c.id === classId)?.label ?? classId
}

// ── Stats ────────────────────────────────────────────────────────────────────
const statMap = computed(() => {
  const map = {}
  STAT_CATEGORIES.forEach(cat => cat.stats.forEach(s => { map[s.id] = s }))
  return map
})
function getStatLabel(statId) {
  return statMap.value[statId]?.label ?? statId
}
function getStatUnit(statId) {
  return statMap.value[statId]?.unit ?? ''
}

// ── Prérequis attributs ──────────────────────────────────────────────────────
function hasRequiredAttributes(item) {
  return item.requiredAttributes && Object.values(item.requiredAttributes).some(v => v > 0)
}
function getAttrColor(attrId) {
  return ATTRIBUTES.find(a => a.id === attrId)?.color ?? '#888'
}
function getAttrIcon(attrId) {
  return ATTRIBUTES.find(a => a.id === attrId)?.icon ?? ''
}
function getAttrLabel(attrId) {
  return ATTRIBUTES.find(a => a.id === attrId)?.label ?? attrId
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
  max-height: 82vh;
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
.modal-header h3 { font-size: 1rem; font-weight: 700; color: var(--text); }
.slot-label { color: var(--accent); }

.close-btn {
  background: none; border: none; color: var(--text-muted);
  cursor: pointer; font-size: 1rem; padding: 0.25rem;
  border-radius: 4px; transition: color 0.2s;
}
.close-btn:hover { color: var(--text); }

.modal-filters {
  display: flex; gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--border);
}
.search-input {
  flex: 1;
  background: var(--surface-2); border: 1px solid var(--border);
  border-radius: 6px; color: var(--text); padding: 0.5rem 0.75rem;
  font-size: 0.875rem; outline: none; transition: border-color 0.2s;
}
.search-input:focus { border-color: var(--accent); }
.filter-select {
  background: var(--surface-2); border: 1px solid var(--border);
  border-radius: 6px; color: var(--text); padding: 0.5rem;
  font-size: 0.875rem; outline: none; cursor: pointer;
}

.modal-filters-row2 {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.5rem 1.25rem; border-bottom: 1px solid var(--border); flex-wrap: wrap;
}
.palier-pills { display: flex; gap: 0.3rem; }
.palier-pill {
  padding: 0.25rem 0.7rem; border-radius: 20px;
  border: 1px solid var(--border); background: var(--surface-2);
  color: var(--text-muted); font-size: 0.78rem; font-weight: 700;
  cursor: pointer; transition: all 0.15s; letter-spacing: 0.04em;
}
.palier-pill:hover { border-color: var(--accent); color: var(--accent); }
.palier-pill.active { background: var(--accent); border-color: var(--accent); color: #fff; }

.event-toggle {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.8rem; color: var(--text-muted);
  cursor: pointer; margin-left: auto; user-select: none;
}
.event-toggle input[type="checkbox"] { accent-color: var(--accent); width: 14px; height: 14px; cursor: pointer; }
.event-toggle span { transition: color 0.15s; }
.event-toggle:hover span { color: var(--text); }

/* ── Liste ── */
.item-list {
  flex: 1; overflow-y: auto;
  padding: 0.75rem 1.25rem;
  display: flex; flex-direction: column; gap: 0.35rem;
  scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}
.item-list::-webkit-scrollbar { width: 5px; }
.item-list::-webkit-scrollbar-track { background: transparent; }
.item-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

.empty-state {
  text-align: center; color: var(--text-muted); padding: 2rem; font-size: 0.9rem;
}

/* ── Item row ── */
.item-row {
  display: flex; align-items: stretch;
  background: var(--surface-2); border: 1px solid var(--border);
  border-radius: 8px; text-align: left;
  transition: all 0.15s; overflow: hidden; padding: 0; flex-shrink: 0;
  cursor: pointer;
}
.item-row:hover:not(.incompatible) { border-color: var(--accent-dim); background: var(--surface-3); }
.item-row.selected {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 6%, var(--surface-2));
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent) 25%, transparent);
}
.item-row.equipped {
  border-color: color-mix(in srgb, var(--accent) 35%, transparent);
}

/* Incompatible : vraiment bloqué */
.item-row.incompatible {
  opacity: 0.38;
  cursor: not-allowed;
  pointer-events: none; /* bloque tous les clics/hover */
}

.item-rarity-bar { width: 4px; flex-shrink: 0; }

.item-info { padding: 0.6rem 0.75rem; flex: 1; display: flex; flex-direction: column; gap: 0.3rem; }

/* Nom + badge lock */
.item-name-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.item-name { font-weight: 700; font-size: 0.9rem; }

.badge-locked {
  font-size: 0.65rem; font-weight: 700;
  padding: 0.1rem 0.45rem; border-radius: 4px;
  background: rgba(224, 92, 92, 0.15);
  border: 1px solid rgba(224, 92, 92, 0.35);
  color: #e05c5c;
  white-space: nowrap;
}

/* Méta */
.item-meta { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.meta-chip {
  font-size: 0.72rem; color: var(--text-muted);
  background: var(--surface-3); border-radius: 4px;
  padding: 0.1rem 0.4rem; border: 1px solid var(--border);
}
.rarity-text { background: transparent; border-color: transparent; font-weight: 600; }
.classes-chip { color: var(--text-muted); }
.set-chip { color: var(--accent); border-color: var(--accent-dim); background: color-mix(in srgb, var(--accent) 8%, transparent); }

/* Prérequis */
.item-prereqs {
  display: flex; flex-wrap: wrap; align-items: center; gap: 0.3rem;
}
.prereqs-label {
  font-size: 0.68rem; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.06em;
}
.prereq-chip {
  font-size: 0.7rem; font-weight: 700;
  border: 1px solid; border-radius: 4px;
  padding: 0.1rem 0.45rem;
}

/* Stats */
.item-stats-preview { display: flex; flex-wrap: wrap; gap: 0.25rem; }
.stat-chip {
  font-size: 0.7rem; background: var(--surface-1); border-radius: 4px;
  padding: 0.1rem 0.4rem; color: #5dde8a;
  border: 1px solid rgba(93, 222, 138, 0.2);
}
.stat-chip.negative { color: #e05c5c; border-color: rgba(224, 92, 92, 0.2); }

/* Lore */
.item-lore {
  font-size: 0.72rem; color: var(--text-muted);
  font-style: italic; line-height: 1.4;
  border-top: 1px solid var(--border);
  padding-top: 0.3rem; margin-top: 0.05rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Footer ── */
.modal-footer {
  display: flex; gap: 0.5rem; justify-content: flex-end;
  padding: 0.75rem 1.25rem; border-top: 1px solid var(--border);
}
.btn-primary {
  padding: 0.5rem 1.25rem; background: var(--accent); color: #000;
  border: none; border-radius: 6px; font-weight: 700;
  cursor: pointer; transition: opacity 0.2s; font-size: 0.875rem;
}
.btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }
.btn-secondary {
  padding: 0.5rem 1.25rem; background: transparent; color: var(--text-muted);
  border: 1px solid var(--border); border-radius: 6px;
  cursor: pointer; transition: all 0.2s; font-size: 0.875rem;
}
.btn-secondary:hover { border-color: #e05c5c; color: #e05c5c; }
</style>
