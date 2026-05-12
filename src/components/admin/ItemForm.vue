<template>
  <form class="item-form" @submit.prevent="submit">
    <div class="form-grid">

      <!-- Infos de base -->
      <div class="form-section">
        <h4 class="form-section-title">Informations</h4>

        <div class="field">
          <label>Nom *</label>
          <input v-model="form.name" required placeholder="ex: Casque de Fer" />
        </div>

        <div class="field-row">
          <div class="field">
            <label>Type *</label>
            <select v-model="form.type" required>
              <option value="">— Choisir —</option>
              <option v-for="t in ITEM_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
          </div>
          <div class="field">
            <label>Palier [P?]</label>
            <select v-model.number="form.palier">
              <option :value="null">—</option>
              <option :value="1">P1</option>
              <option :value="2">P2</option>
              <option :value="3">P3</option>
            </select>
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Rareté *</label>
            <select v-model="form.rarity" required>
              <option v-for="r in RARITIES" :key="r.id" :value="r.id">{{ r.label }}</option>
            </select>
          </div>
          <div class="field">
            <label>Niveau min.</label>
            <input v-model.number="form.requiredLevel" type="number" min="1" max="200" />
          </div>
        </div>

        <div class="field">
          <label>Classe(s)</label>
          <div class="checkbox-row">
            <label class="checkbox-label toutes-label">
              <input
                type="checkbox"
                :checked="form.classes === null"
                @change="form.classes = form.classes === null ? [] : null"
              />
              Toutes
            </label>
            <template v-if="form.classes !== null">
              <label v-for="cls in CLASSES" :key="cls.id" class="checkbox-label">
                <input
                  type="checkbox"
                  :value="cls.id"
                  :checked="form.classes.includes(cls.id)"
                  @change="toggleClass(cls.id, $event.target.checked)"
                />
                {{ cls.label }}
              </label>
            </template>
          </div>
        </div>

        <div class="field set-field" ref="setFieldRef">
          <label>Set</label>
          <div class="set-input-wrap">
            <input
              v-model="setSearch"
              class="set-search"
              placeholder="Rechercher un set..."
              autocomplete="off"
              @focus="setDropdownOpen = true"
              @input="setDropdownOpen = true"
            />
            <button v-if="form.set" type="button" class="set-clear" @click="clearSet" title="Retirer le set">✕</button>
          </div>
          <div v-if="form.set" class="set-selected-badge" :style="{ borderColor: selectedSetColor, color: selectedSetColor }">
            ✨ {{ selectedSetName }}
          </div>
          <div v-if="setDropdownOpen && filteredSets.length > 0" class="set-dropdown">
            <button
              v-for="s in filteredSets" :key="s.id"
              type="button"
              class="set-option"
              :class="{ active: form.set === s.id }"
              :style="{ '--sc': s.color ?? '#888' }"
              @click="pickSet(s)"
            >
              <span class="set-dot" :style="{ background: s.color ?? '#888' }"></span>
              <span class="set-option-name">{{ s.name }}</span>
              <span class="set-option-id">{{ s.id }}</span>
            </button>
          </div>
          <div v-if="setDropdownOpen && filteredSets.length === 0 && setSearch" class="set-empty">
            Aucun set trouvé
          </div>
        </div>

        <div class="field">
          <label>Lore</label>
          <textarea v-model="form.lore" rows="3" placeholder="Description de l'item..."></textarea>
        </div>

        <div class="field" v-if="isRuneSlotType">
          <label>Slots de rune (0–5)</label>
          <input
            v-model.number="form.runeSlots"
            type="number"
            min="0"
            max="5"
            placeholder="0"
          />
        </div>

        <div class="field">
          <label>Tags</label>
          <label class="tag-checkbox">
            <input type="checkbox" :checked="form.tags.includes('event')" @change="toggleTag('event', $event.target.checked)" />
            <span class="tag-event-badge">🎉 Item d'événement</span>
          </label>
        </div>
      </div>

      <!-- Attributs requis -->
      <div class="form-section">
        <h4 class="form-section-title">Attributs requis</h4>
        <div class="attr-grid">
          <div class="field" v-for="attr in ATTRIBUTES" :key="attr.id">
            <label>{{ attr.icon }} {{ attr.label }}</label>
            <input
              type="number"
              min="0"
              :value="form.requiredAttributes[attr.id] ?? 0"
              @input="setAttr(attr.id, $event.target.value)"
              placeholder="0"
            />
          </div>
        </div>

        <!-- Stats -->
        <h4 class="form-section-title" style="margin-top:1rem">
          Stats
          <span v-if="hasRange" class="range-badge">Min → Max (craft aléatoire)</span>
        </h4>
        <div class="stats-list">
          <div v-for="cat in STAT_CATEGORIES" :key="cat.id">
            <div class="stat-cat-label" :style="{ color: cat.color }">{{ cat.label }}</div>
            <div class="attr-grid">
              <div class="field" v-for="stat in cat.stats" :key="stat.id">
                <label>{{ stat.label }} <span class="unit">{{ stat.unit }}</span></label>
                <div v-if="hasRange" class="range-inputs">
                  <input type="number" step="0.01"
                    :value="form.stats[stat.id] ?? ''"
                    @input="setStat(stat.id, $event.target.value)"
                    placeholder="Min" class="range-in" />
                  <span class="range-arrow">→</span>
                  <input type="number" step="0.01"
                    :value="form.statsMax[stat.id] ?? ''"
                    @input="setStatMax(stat.id, $event.target.value)"
                    placeholder="Max" class="range-in" />
                </div>
                <input v-else type="number" step="0.01"
                  :value="form.stats[stat.id] ?? ''"
                  @input="setStat(stat.id, $event.target.value)"
                  placeholder="0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ID auto-généré -->
    <div class="field id-field">
      <label>ID (auto-généré, modifiable)</label>
      <input v-model="form.id" required placeholder="casque_de_fer_001" />
    </div>

    <div class="form-actions">
      <button type="button" class="btn-cancel" @click="$emit('cancel')">Annuler</button>
      <button type="submit" class="btn-submit" :disabled="saving">
        {{ saving ? 'Enregistrement...' : (editMode ? 'Modifier' : 'Ajouter l\'item') }}
      </button>
    </div>

    <div v-if="errorMsg" class="form-error">{{ errorMsg }}</div>
  </form>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { CLASSES, RARITIES, ATTRIBUTES, STAT_CATEGORIES, EQUIPMENT_SLOTS } from '@/data/constants'
import { useItemsStore } from '@/stores/itemsStore'

const RUNE_SLOT_TYPES = ['casque', 'plastron', 'jambier', 'boots', 'gant', 'arme', 'secondaire']

const props = defineProps({
  initial: { type: Object, default: null },
})
const emit = defineEmits(['submit', 'cancel'])

const ITEM_TYPES = [
  { value: 'casque',     label: 'Casque' },
  { value: 'plastron',   label: 'Plastron' },
  { value: 'jambier',    label: 'Jambières' },
  { value: 'boots',      label: 'Bottes' },
  { value: 'gant',       label: 'Gant' },
  { value: 'amulette',   label: 'Amulette' },
  { value: 'bracelet',   label: 'Bracelet' },
  { value: 'anneau',     label: 'Anneau' },
  { value: 'arme',       label: 'Arme principale' },
  { value: 'secondaire', label: 'Main secondaire' },
  { value: 'artefact',   label: 'Artefact' },
]

const saving = ref(false)
const errorMsg = ref('')
const editMode = computed(() => !!props.initial)
const isRuneSlotType = computed(() => RUNE_SLOT_TYPES.includes(form.value?.type))

const itemsStore = useItemsStore()

const RANGED_TYPES = ['casque','plastron','jambier','boots','gant','arme','secondaire']
const hasRange = computed(() => RANGED_TYPES.includes(form.value.type))

// ── Recherche de set ──
const setSearch       = ref('')
const setDropdownOpen = ref(false)
const setFieldRef     = ref(null)

const filteredSets = computed(() => {
  const q = setSearch.value.toLowerCase()
  return itemsStore.setsList.filter(s =>
    s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
  )
})

const selectedSetName  = computed(() => itemsStore.sets[form.value.set]?.name ?? form.value.set)
const selectedSetColor = computed(() => itemsStore.sets[form.value.set]?.color ?? '#888')

function pickSet(s) {
  form.value.set = s.id
  setSearch.value = ''
  setDropdownOpen.value = false
}

function clearSet() {
  form.value.set = ''
  setSearch.value = ''
  setDropdownOpen.value = false
}

// Fermer le dropdown si clic en dehors
function onDocClick(e) {
  if (setFieldRef.value && !setFieldRef.value.contains(e.target)) {
    setDropdownOpen.value = false
  }
}
onMounted(() => document.addEventListener('mousedown', onDocClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocClick))

// Sync setSearch avec le set initial (mode édition)
watch(() => form.value.set, (val) => {
  if (!val) setSearch.value = ''
})

const blankForm = () => ({
  id: '',
  name: '',
  type: '',
  palier: null,
  classes: null,
  rarity: 'commun',
  requiredLevel: 1,
  requiredAttributes: {},
  stats: {},
  statsMax: {},
  lore: '',
  set: '',
  tags: [],
  runeSlots: 0,
})

const form = ref(blankForm())

// Pré-remplir si édition
watch(() => props.initial, (val) => {
  if (val) form.value = { ...blankForm(), ...JSON.parse(JSON.stringify(val)) }
  else form.value = blankForm()
}, { immediate: true })

// Auto-génère l'ID depuis le nom
watch(() => form.value.name, (name) => {
  if (editMode.value) return
  form.value.id = name
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 50)
    + '_001'
})

function toggleClass(classId, checked) {
  const arr = Array.isArray(form.value.classes) ? [...form.value.classes] : []
  if (checked) { if (!arr.includes(classId)) arr.push(classId) }
  else { const i = arr.indexOf(classId); if (i !== -1) arr.splice(i, 1) }
  form.value.classes = arr
}

function toggleTag(tag, checked) {
  const tags = [...form.value.tags]
  if (checked && !tags.includes(tag)) tags.push(tag)
  if (!checked) form.value.tags = tags.filter(t => t !== tag)
  else form.value.tags = tags
}

function setAttr(id, val) {
  const n = parseFloat(val)
  if (!val || n === 0) {
    const a = { ...form.value.requiredAttributes }
    delete a[id]
    form.value.requiredAttributes = a
  } else {
    form.value.requiredAttributes = { ...form.value.requiredAttributes, [id]: n }
  }
}

function setStatMax(id, val) {
  const n = parseFloat(val)
  if (val === '' || isNaN(n) || n === 0) {
    const s = { ...form.value.statsMax }; delete s[id]; form.value.statsMax = s
  } else {
    form.value.statsMax = { ...form.value.statsMax, [id]: n }
  }
}

function setStat(id, val) {
  const n = parseFloat(val)
  if (val === '' || isNaN(n) || n === 0) {
    const s = { ...form.value.stats }
    delete s[id]
    form.value.stats = s
  } else {
    form.value.stats = { ...form.value.stats, [id]: n }
  }
}

async function submit() {
  saving.value = true
  errorMsg.value = ''
  try {
    const payload = {
      ...form.value,
      classes: form.value.classes?.length ? form.value.classes : null,
      set: form.value.set || null,
    }
    await emit('submit', payload)
    if (!editMode.value) form.value = blankForm()
  } catch (e) {
    errorMsg.value = e.message ?? 'Erreur lors de l\'enregistrement.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.item-form { display: flex; flex-direction: column; gap: 1rem; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 800px) { .form-grid { grid-template-columns: 1fr; } }

.form-section {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.form-section-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent);
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.3rem;
  margin-bottom: 0.2rem;
}

.field { display: flex; flex-direction: column; gap: 0.25rem; }

.field label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

.field input, .field select, .field textarea {
  background: var(--surface-3);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}

.field input:focus, .field select:focus, .field textarea:focus {
  border-color: var(--accent);
}

.field textarea { resize: vertical; min-height: 60px; }

.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }

.checkbox-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: var(--text);
  cursor: pointer;
}

.checkbox-label input { width: auto; }

/* ── Set dropdown ── */
.set-field { position: relative; }

.set-input-wrap {
  display: flex;
  gap: 0.3rem;
  align-items: center;
}

.set-search {
  flex: 1;
  background: var(--surface-3);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}
.set-search:focus { border-color: var(--accent); }

.set-clear {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.set-clear:hover { border-color: #e05c5c; color: #e05c5c; }

.set-selected-badge {
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid;
  border-radius: 20px;
  padding: 0.15rem 0.6rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.25rem;
}

.set-dropdown {
  position: absolute;
  top: 100%;
  left: 0; right: 0;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  margin-top: 0.25rem;
}

.set-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.45rem 0.75rem;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
  border-bottom: 1px solid var(--border);
}
.set-option:last-child { border-bottom: none; }
.set-option:hover { background: var(--surface-3); }
.set-option.active { background: rgba(124,58,237,0.1); }

.set-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.set-option-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--sc, #888);
  flex: 1;
}

.set-option-id {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.set-empty {
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
}

.toutes-label {
  border-right: 1px solid var(--border);
  padding-right: 0.6rem;
  margin-right: 0.2rem;
}

.tag-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.tag-checkbox input[type="checkbox"] {
  width: auto;
  accent-color: var(--accent);
  cursor: pointer;
}

.tag-event-badge {
  font-size: 0.82rem;
  background: rgba(251,191,36,0.12);
  border: 1px solid rgba(251,191,36,0.35);
  color: #fbbf24;
  border-radius: 20px;
  padding: 0.15rem 0.65rem;
  font-weight: 600;
}

.attr-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
}

.stat-cat-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0.5rem 0 0.3rem;
}

.unit { color: var(--text-muted); font-size: 0.65rem; }

.range-badge {
  font-size: 0.65rem;
  background: rgba(251,191,36,0.12);
  border: 1px solid rgba(251,191,36,0.3);
  color: #fbbf24;
  border-radius: 10px;
  padding: 0.1rem 0.5rem;
  font-weight: 600;
  margin-left: 0.5rem;
  text-transform: none;
  letter-spacing: 0;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.range-in {
  background: var(--surface-3);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  padding: 0.4rem 0.4rem;
  font-size: 0.82rem;
  outline: none;
  width: 100%;
  transition: border-color 0.2s;
}
.range-in:focus { border-color: var(--accent); }

.range-arrow {
  color: var(--text-muted);
  font-size: 0.8rem;
  flex-shrink: 0;
}

.id-field {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.75rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-submit {
  padding: 0.55rem 1.5rem;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-cancel {
  padding: 0.55rem 1rem;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover { border-color: #e05c5c; color: #e05c5c; }

.form-error {
  background: rgba(224, 92, 92, 0.1);
  border: 1px solid rgba(224, 92, 92, 0.3);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  color: #e05c5c;
  font-size: 0.85rem;
}
</style>
