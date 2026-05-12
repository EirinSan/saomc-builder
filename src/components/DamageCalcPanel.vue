<template>
  <div class="dmg-panel">
    <h3 class="section-title">⚔️ Calculateur de dégâts</h3>

    <!-- Formule active -->
    <div class="formula-box" :style="{ '--cls-color': classColor }">
      <span class="formula-class">{{ classLabel }}</span>
      <code class="formula-text">{{ formula }}</code>
    </div>

    <!-- Inputs -->
    <div class="inputs-row">
      <div class="input-field">
        <label>
          Base Arme
          <span v-if="weaponBaseDmg" class="auto-badge">auto</span>
        </label>
        <div class="input-with-icon">
          <input v-model.number="baseArmeOverride" type="number" min="0" :placeholder="weaponBaseDmg || '0'" />
          <button v-if="baseArmeOverride !== null" class="reset-btn" @click="baseArmeOverride = null" title="Utiliser la valeur de l'arme">↺</button>
        </div>
        <span v-if="weaponName" class="weapon-hint">{{ weaponName }}</span>
      </div>
      <div class="input-field">
        <label>Base Compétence</label>
        <input v-model.number="baseSkill" type="number" min="0" placeholder="0" />
      </div>
    </div>

    <!-- Résultats -->
    <div class="results-grid">
      <div class="result-card normal">
        <div class="result-label">Dégâts normaux</div>
        <div class="result-value">{{ fmtDmg(normalDmg) }}</div>
        <div class="result-hint">×{{ fmtMult(multiplier) }}</div>
      </div>
      <div class="result-card crit">
        <div class="result-label">
          Dégâts critiques
          <span class="crit-chance">({{ critChance }}%)</span>
        </div>
        <div class="result-value crit-val">{{ fmtDmg(critDmg) }}</div>
        <div class="result-hint">×{{ fmtMult(critMultiplier) }}</div>
      </div>
    </div>

    <!-- DPS espéré -->
    <div class="expected-row">
      <span class="expected-label">DPS espéré</span>
      <span class="expected-value">{{ fmtDmg(expectedDmg) }}</span>
      <span class="expected-hint">{{ critChance }}% crit</span>
    </div>

    <!-- Détail des bonus -->
    <details class="bonus-detail">
      <summary>Détail des bonus appliqués</summary>
      <div class="bonus-lines">
        <div class="bonus-line">
          <span>{{ isMagic ? 'Dégâts magiques' : "Dégâts d'attaque" }}</span>
          <span class="bv">+{{ isMagic ? stats.degats_magiques : stats.degats_attaque }}%</span>
        </div>
        <div class="bonus-line">
          <span>Dégâts des capacités</span>
          <span class="bv">+{{ stats.degats_capacites }}%</span>
        </div>
        <div class="bonus-line">
          <span>{{ isMagic ? 'Crit. comp. dégâts' : 'Dégâts critiques' }}</span>
          <span class="bv crit-col">+{{ isMagic ? stats.degats_critique_competence : stats.degats_critique }}% <span class="base-note">(base 50%)</span></span>
        </div>
        <div class="bonus-line">
          <span>{{ isMagic ? 'Crit. de compétence' : 'Chance de critique' }}</span>
          <span class="bv crit-col">{{ critChance }}%</span>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBuildStore } from '@/stores/buildStore'
import { useItemsStore } from '@/stores/itemsStore'
import { CLASSES } from '@/data/constants'

const buildStore  = useBuildStore()
const itemsStore  = useItemsStore()
const stats       = computed(() => buildStore.computedStats)
const selClass    = computed(() => buildStore.selectedClass)

// Arme équipée → dégâts d'attaque automatiques
const equippedWeapon = computed(() => {
  const id = buildStore.equipment.arme
  return id ? itemsStore.getById(id) : null
})
const weaponBaseDmg = computed(() => equippedWeapon.value?.stats?.degats_attaque ?? 0)
const weaponName    = computed(() => equippedWeapon.value?.name ?? null)

// Override manuel (null = utiliser l'arme)
const baseArmeOverride = ref(null)
const baseArme = computed(() =>
  baseArmeOverride.value !== null ? baseArmeOverride.value : weaponBaseDmg.value
)

const baseSkill = ref(0)

// Classes magiques vs physiques
const MAGIC_CLASSES = ['mage', 'shaman']
const isMagic = computed(() => MAGIC_CLASSES.includes(selClass.value))

const classColor = computed(() => CLASSES.find(c => c.id === selClass.value)?.color ?? '#7c3aed')
const classLabel = computed(() => {
  const c = CLASSES.find(c => c.id === selClass.value)
  return c ? `${c.icon} ${c.label}` : '— Choisir une classe —'
})

// Formule affichée
const formula = computed(() =>
  isMagic.value
    ? '(BaseArme + BaseSkill) × (1 + %Magie + %Capacité) × (1 + %CritSkill)'
    : '(BaseArme + BaseSkill) × (1 + %Attaque + %Capacité) × (1 + %CritAttaque)'
)

// Multiplicateur de dégâts normal
const multiplier = computed(() => {
  const dmgBonus = isMagic.value
    ? (stats.value.degats_magiques ?? 0)
    : (stats.value.degats_attaque  ?? 0)
  const capBonus = stats.value.degats_capacites ?? 0
  return 1 + (dmgBonus + capBonus) / 100
})

// Multiplicateur crit (base ×1.5 + bonus)
const critBonusPct = computed(() =>
  isMagic.value
    ? (stats.value.degats_critique_competence ?? 0)
    : (stats.value.degats_critique            ?? 0)
)
const critMultiplier = computed(() => multiplier.value * (1.5 + critBonusPct.value / 100))

// Chance de crit
const critChance = computed(() =>
  isMagic.value
    ? (stats.value.chance_critique_competence ?? 0)
    : (stats.value.chance_critique            ?? 0)
)

// Base totale
const base = computed(() => (baseArme.value || 0) + (baseSkill.value || 0))

const normalDmg   = computed(() => base.value * multiplier.value)
const critDmg     = computed(() => base.value * critMultiplier.value)
const expectedDmg = computed(() => {
  const c = critChance.value / 100
  return normalDmg.value * (1 - c) + critDmg.value * c
})

function fmtDmg(v) {
  if (!base.value) return '—'
  return Math.round(v).toLocaleString('fr-FR')
}
function fmtMult(v) {
  return v.toFixed(2) + 'x'
}
</script>

<style scoped>
.dmg-panel {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin: 0;
}

/* Formule */
.formula-box {
  background: color-mix(in srgb, var(--cls-color, #7c3aed) 8%, var(--surface-2));
  border: 1px solid color-mix(in srgb, var(--cls-color, #7c3aed) 30%, transparent);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.formula-class {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--cls-color, #7c3aed);
}

.formula-text {
  font-size: 0.72rem;
  color: var(--text-muted);
  line-height: 1.5;
  word-break: break-word;
  font-family: 'Courier New', monospace;
}

/* Inputs */
.inputs-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.input-field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.input-field label {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 600;
}

.input-field input {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  padding: 0.4rem 0.6rem;
  font-size: 0.9rem;
  font-weight: 700;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  text-align: center;
}

.input-field input:focus { border-color: var(--accent); }

.auto-badge {
  background: rgba(6,182,212,0.15);
  color: #06b6d4;
  border: 1px solid rgba(6,182,212,0.3);
  border-radius: 10px;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.05rem 0.35rem;
  text-transform: uppercase;
  margin-left: 0.3rem;
  vertical-align: middle;
}

.input-with-icon {
  display: flex;
  gap: 0.3rem;
  align-items: center;
}

.input-with-icon input { flex: 1; }

.reset-btn {
  background: var(--surface-3);
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.15s;
  flex-shrink: 0;
}
.reset-btn:hover { border-color: var(--accent); color: var(--accent); }

.weapon-hint {
  font-size: 0.65rem;
  color: #06b6d4;
  margin-top: 0.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Résultats */
.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.result-card {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.result-card.crit {
  border-color: rgba(251, 191, 36, 0.25);
  background: rgba(251, 191, 36, 0.04);
}

.result-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.crit-chance {
  font-size: 0.65rem;
  color: #fbbf24;
}

.result-value {
  font-size: 1.15rem;
  font-weight: 800;
  color: #5dde8a;
  font-variant-numeric: tabular-nums;
}

.result-value.crit-val { color: #fbbf24; }

.result-hint {
  font-size: 0.65rem;
  color: var(--text-muted);
}

/* DPS espéré */
.expected-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.45rem 0.75rem;
}

.expected-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 600;
  flex: 1;
}

.expected-value {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.expected-hint {
  font-size: 0.65rem;
  color: var(--text-muted);
}

/* Détail */
.bonus-detail {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.bonus-detail summary {
  padding: 0.45rem 0.75rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  cursor: pointer;
  user-select: none;
  background: var(--surface-2);
  list-style: none;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: color 0.15s;
}

.bonus-detail summary::-webkit-details-marker { display: none; }
.bonus-detail summary::before { content: '▶'; font-size: 0.6rem; transition: transform 0.2s; }
.bonus-detail[open] summary::before { transform: rotate(90deg); }
.bonus-detail summary:hover { color: var(--text); }

.bonus-lines {
  padding: 0.4rem 0;
  background: var(--surface-1);
}

.bonus-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.bonus-line:hover { background: var(--surface-3); }

.bv {
  font-weight: 700;
  color: #5dde8a;
}

.bv.crit-col { color: #fbbf24; }

.base-note {
  font-size: 0.65rem;
  opacity: 0.6;
  font-weight: 400;
}
</style>
