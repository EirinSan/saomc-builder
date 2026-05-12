<template>
  <form class="rune-form" @submit.prevent="submit">

    <div class="form-grid">

      <!-- Infos -->
      <div class="form-section">
        <h4 class="form-section-title">Informations</h4>

        <div class="field">
          <label>Nom *</label>
          <input v-model="form.name" required placeholder="ex: Rune de Force" />
        </div>

        <div class="field-row">
          <div class="field">
            <label>Icône (emoji)</label>
            <input v-model="form.icon" placeholder="⚔️" maxlength="4" />
          </div>
          <div class="field">
            <label>Couleur</label>
            <div class="color-row">
              <input type="color" v-model="form.color" class="color-picker" />
              <input v-model="form.color" placeholder="#e74c3c" class="color-text" />
            </div>
          </div>
        </div>

        <!-- Aperçu -->
        <div class="preview">
          <span
            class="preview-icon"
            :style="{ background: form.color + '22', borderColor: form.color + '66' }"
          >{{ form.icon || '◇' }}</span>
          <span class="preview-name" :style="{ color: form.color }">{{ form.name || 'Nouvelle rune' }}</span>
        </div>
      </div>

      <!-- Stats -->
      <div class="form-section">
        <h4 class="form-section-title">Stats</h4>
        <div class="stats-list">
          <div v-for="cat in STAT_CATEGORIES" :key="cat.id">
            <div class="stat-cat-label" :style="{ color: cat.color }">{{ cat.label }}</div>
            <div class="attr-grid">
              <div class="field" v-for="stat in cat.stats" :key="stat.id">
                <label>{{ stat.label }} <span class="unit">{{ stat.unit }}</span></label>
                <input
                  type="number"
                  step="0.01"
                  :value="form.stats[stat.id] ?? ''"
                  @input="setStat(stat.id, $event.target.value)"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ID -->
    <div class="field id-field">
      <label>ID (auto-généré, modifiable)</label>
      <input v-model="form.id" required placeholder="rune_force_001" />
    </div>

    <div class="form-actions">
      <button type="button" class="btn-cancel" @click="$emit('cancel')">Annuler</button>
      <button type="submit" class="btn-submit" :disabled="saving">
        {{ saving ? 'Enregistrement...' : (editMode ? 'Modifier' : 'Ajouter la rune') }}
      </button>
    </div>

    <div v-if="errorMsg" class="form-error">{{ errorMsg }}</div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { STAT_CATEGORIES } from '@/data/constants'

const props = defineProps({
  initial: { type: Object, default: null },
})
const emit = defineEmits(['submit', 'cancel'])

const saving   = ref(false)
const errorMsg = ref('')
const editMode = computed(() => !!props.initial)

const blankForm = () => ({
  id:    '',
  name:  '',
  icon:  '◇',
  color: '#888888',
  stats: {},
})

const form = ref(blankForm())

watch(() => props.initial, (val) => {
  if (val) form.value = { ...blankForm(), ...JSON.parse(JSON.stringify(val)) }
  else     form.value = blankForm()
}, { immediate: true })

// Auto-génère l'ID depuis le nom
watch(() => form.value.name, (name) => {
  if (editMode.value) return
  form.value.id = 'rune_' + name
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40)
})

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
  saving.value   = true
  errorMsg.value = ''
  try {
    await emit('submit', { ...form.value })
    if (!editMode.value) form.value = blankForm()
  } catch (e) {
    errorMsg.value = e.message ?? "Erreur lors de l'enregistrement."
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.rune-form { display:flex; flex-direction:column; gap:1rem; }

.form-grid {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:1rem;
}
@media (max-width:700px) { .form-grid { grid-template-columns:1fr; } }

.form-section {
  background:var(--surface-2); border:1px solid var(--border);
  border-radius:10px; padding:1rem;
  display:flex; flex-direction:column; gap:.6rem;
}

.form-section-title {
  font-size:.7rem; font-weight:700; text-transform:uppercase;
  letter-spacing:.1em; color:var(--accent);
  border-bottom:1px solid var(--border); padding-bottom:.3rem; margin-bottom:.2rem;
}

.field { display:flex; flex-direction:column; gap:.25rem; }
.field label { font-size:.75rem; color:var(--text-muted); font-weight:600; }
.field input, .field select {
  background:var(--surface-3); border:1px solid var(--border); border-radius:6px;
  color:var(--text); padding:.4rem .6rem; font-size:.85rem;
  outline:none; transition:border-color .2s; width:100%;
}
.field input:focus { border-color:var(--accent); }

.field-row { display:grid; grid-template-columns:1fr 1fr; gap:.5rem; }

.color-row { display:flex; gap:.4rem; align-items:center; }
.color-picker {
  width:38px; height:32px; padding:2px; cursor:pointer;
  border-radius:6px; border:1px solid var(--border);
  background:var(--surface-3); flex-shrink:0;
}
.color-text { flex:1; }

.preview {
  display:flex; align-items:center; gap:.75rem;
  padding:.6rem .8rem; border-radius:8px;
  background:var(--surface-3); border:1px solid var(--border);
}
.preview-icon {
  width:36px; height:36px; border-radius:8px; border:1px solid;
  display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0;
}
.preview-name { font-weight:700; font-size:.95rem; }

.stats-list { display:flex; flex-direction:column; gap:.25rem; }
.attr-grid  { display:grid; grid-template-columns:1fr 1fr; gap:.4rem; }
.stat-cat-label {
  font-size:.7rem; font-weight:700; text-transform:uppercase;
  letter-spacing:.08em; margin:.4rem 0 .2rem;
}
.unit { color:var(--text-muted); font-size:.65rem; }

.id-field {
  background:var(--surface-2); border:1px solid var(--border);
  border-radius:8px; padding:.75rem;
}

.form-actions { display:flex; justify-content:flex-end; gap:.5rem; }

.btn-submit {
  padding:.55rem 1.5rem; background:var(--accent); color:#fff;
  border:none; border-radius:8px; font-weight:700; font-size:.9rem;
  cursor:pointer; transition:opacity .2s;
}
.btn-submit:disabled { opacity:.4; cursor:not-allowed; }

.btn-cancel {
  padding:.55rem 1rem; background:transparent;
  border:1px solid var(--border); color:var(--text-muted);
  border-radius:8px; cursor:pointer; transition:all .2s;
}
.btn-cancel:hover { border-color:#e05c5c; color:#e05c5c; }

.form-error {
  background:rgba(224,92,92,.1); border:1px solid rgba(224,92,92,.3);
  border-radius:6px; padding:.5rem .75rem; color:#e05c5c; font-size:.85rem;
}
</style>
