<template>
  <form class="set-form" @submit.prevent="submit">

    <!-- Infos de base -->
    <div class="form-section">
      <h4 class="form-section-title">Informations du set</h4>

      <div class="field">
        <label>Nom *</label>
        <input v-model="form.name" required placeholder="ex: Crocs des Bois" />
      </div>

      <div class="field-row">
        <div class="field">
          <label>ID (snake_case) *</label>
          <input v-model="form.id" required :disabled="editMode" placeholder="crocs_des_bois" />
        </div>
        <div class="field">
          <label>Couleur</label>
          <div class="color-row">
            <input type="color" v-model="form.color" class="color-pick" />
            <input v-model="form.color" class="color-text" placeholder="#888888" />
          </div>
        </div>
      </div>
    </div>

    <!-- Bonus par palier -->
    <div class="form-section">
      <div class="section-row">
        <h4 class="form-section-title">Bonus de set</h4>
        <button type="button" class="btn-add-bonus" @click="addBonus">+ Ajouter un seuil</button>
      </div>

      <div v-if="form.bonuses.length === 0" class="empty-bonuses">
        Aucun bonus. Clique sur « + Ajouter un seuil » pour commencer.
      </div>

      <div v-for="(bonus, bi) in form.bonuses" :key="bi" class="bonus-block">
        <div class="bonus-block-header">
          <span class="bonus-index">Seuil #{{ bi + 1 }}</span>
          <div class="field-row" style="flex:1">
            <div class="field">
              <label>Pièces requises</label>
              <input v-model.number="bonus.count" type="number" min="2" max="14" placeholder="2" />
            </div>
            <div class="field">
              <label>Label d'affichage</label>
              <input v-model="bonus.label" placeholder="ex: +10% dégâts" />
            </div>
          </div>
          <button type="button" class="btn-remove-bonus" @click="removeBonus(bi)" title="Supprimer ce seuil">✕</button>
        </div>

        <!-- Stats du bonus -->
        <div class="bonus-stats">
          <div class="bonus-stats-header">
            <span class="bonus-stats-title">Stats accordées</span>
            <button type="button" class="btn-add-stat" @click="addStat(bi)">+ Stat</button>
          </div>
          <div v-for="(entry, si) in bonus.statEntries" :key="si" class="stat-entry">
            <select v-model="entry.key" class="stat-key-select">
              <option value="">— Choisir —</option>
              <optgroup v-for="cat in STAT_CATEGORIES" :key="cat.id" :label="cat.label">
                <option v-for="stat in cat.stats" :key="stat.id" :value="stat.id">
                  {{ stat.label }} {{ stat.unit }}
                </option>
              </optgroup>
            </select>
            <input v-model.number="entry.value" type="number" step="0.01" placeholder="valeur" class="stat-val-input" />
            <button type="button" class="btn-remove-stat" @click="removeStat(bi, si)" title="Supprimer">✕</button>
          </div>
          <div v-if="!bonus.statEntries.length" class="empty-stats-hint">
            Aucune stat. Clique sur « + Stat ».
          </div>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn-cancel" @click="$emit('cancel')">Annuler</button>
      <button type="submit" class="btn-submit" :disabled="saving">
        {{ saving ? 'Enregistrement...' : (editMode ? 'Modifier le set' : 'Créer le set') }}
      </button>
    </div>

    <div v-if="errorMsg" class="form-error">{{ errorMsg }}</div>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { STAT_CATEGORIES } from '@/data/constants'

const props = defineProps({
  initial: { type: Object, default: null },
})
const emit = defineEmits(['submit', 'cancel'])

const saving  = ref(false)
const errorMsg = ref('')
const editMode = computed(() => !!props.initial)

function blankForm() {
  return { id: '', name: '', color: '#7c3aed', bonuses: [] }
}

// Convert bonuses (stats object) ↔ statEntries (array of {key, value}) for the UI
function bonusesToEntries(bonuses) {
  return (bonuses ?? []).map(b => ({
    count: b.count,
    label: b.label ?? '',
    statEntries: Object.entries(b.stats ?? {}).map(([key, value]) => ({ key, value })),
  }))
}

function entriesToBonuses(entries) {
  return entries.map(e => ({
    count: e.count,
    label: e.label,
    stats: Object.fromEntries(
      e.statEntries.filter(s => s.key).map(s => [s.key, s.value ?? 0])
    ),
  }))
}

const form = ref(blankForm())

watch(() => props.initial, (val) => {
  if (val) {
    form.value = {
      id:      val.id,
      name:    val.name,
      color:   val.color ?? '#7c3aed',
      bonuses: bonusesToEntries(val.bonuses),
    }
  } else {
    form.value = blankForm()
  }
}, { immediate: true })

// Auto-generate ID from name (new set only)
watch(() => form.value.name, (name) => {
  if (editMode.value) return
  form.value.id = name
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40)
})

function addBonus() {
  form.value.bonuses.push({ count: 2, label: '', statEntries: [] })
}
function removeBonus(i) {
  form.value.bonuses.splice(i, 1)
}
function addStat(bi) {
  form.value.bonuses[bi].statEntries.push({ key: '', value: 0 })
}
function removeStat(bi, si) {
  form.value.bonuses[bi].statEntries.splice(si, 1)
}

async function submit() {
  saving.value = true
  errorMsg.value = ''
  try {
    const payload = {
      id:      form.value.id,
      name:    form.value.name,
      color:   form.value.color,
      bonuses: entriesToBonuses(form.value.bonuses),
    }
    await emit('submit', payload)
    if (!editMode.value) form.value = blankForm()
  } catch (e) {
    errorMsg.value = e?.message ?? 'Erreur lors de l\'enregistrement.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.set-form { display: flex; flex-direction: column; gap: 1rem; }

.form-section {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.form-section-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent);
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.3rem;
  margin: 0;
}

.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.field { display: flex; flex-direction: column; gap: 0.25rem; }

.field label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

.field input, .field select {
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

.field input:focus, .field select:focus { border-color: var(--accent); }

.field input:disabled { opacity: 0.5; cursor: not-allowed; }

.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }

.color-row { display: flex; gap: 0.4rem; align-items: center; }

.color-pick {
  width: 38px !important;
  height: 34px;
  padding: 2px;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
}

.color-text { flex: 1; }

/* Bonus blocks */
.empty-bonuses {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
  padding: 1rem;
  border: 1px dashed var(--border);
  border-radius: 8px;
}

.bonus-block {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.bonus-block-header {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  background: var(--surface-3);
  padding: 0.6rem 0.75rem;
}

.bonus-index {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  white-space: nowrap;
  padding-bottom: 0.4rem;
}

.btn-remove-bonus {
  background: transparent;
  border: 1px solid rgba(224,92,92,0.3);
  color: #e05c5c;
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
  flex-shrink: 0;
  transition: all 0.15s;
}
.btn-remove-bonus:hover { background: rgba(224,92,92,0.1); }

.bonus-stats {
  padding: 0.6rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.bonus-stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bonus-stats-title {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
}

.stat-entry {
  display: grid;
  grid-template-columns: 1fr 100px 28px;
  gap: 0.35rem;
  align-items: center;
}

.stat-key-select, .stat-val-input {
  background: var(--surface-3);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  padding: 0.35rem 0.5rem;
  font-size: 0.82rem;
  outline: none;
}

.stat-key-select:focus, .stat-val-input:focus { border-color: var(--accent); }

.btn-remove-stat {
  background: transparent;
  border: none;
  color: #e05c5c;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.2rem;
  border-radius: 4px;
}
.btn-remove-stat:hover { background: rgba(224,92,92,0.1); }

.empty-stats-hint {
  font-size: 0.78rem;
  color: var(--text-muted);
  padding: 0.3rem 0;
}

/* Buttons */
.btn-add-bonus {
  padding: 0.3rem 0.7rem;
  background: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}
.btn-add-bonus:hover { background: rgba(124,58,237,0.12); }

.btn-add-stat {
  padding: 0.2rem 0.55rem;
  background: transparent;
  border: 1px solid var(--cyan, #06b6d4);
  color: var(--cyan, #06b6d4);
  border-radius: 5px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-add-stat:hover { background: rgba(6,182,212,0.1); }

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
