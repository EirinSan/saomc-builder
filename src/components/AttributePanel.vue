<template>
  <div class="attribute-panel">

    <!-- Niveau -->
    <div class="level-section">
      <h3 class="section-title">Niveau</h3>
      <div class="level-row">
        <button class="lvl-btn" @click="buildStore.setLevel(buildStore.level - 1)">−</button>
        <div class="level-display">
          <input
            type="number"
            class="level-input"
            :value="buildStore.level"
            min="1"
            max="200"
            @change="e => buildStore.setLevel(Number(e.target.value))"
          />
          <span class="level-label">/ 200</span>
        </div>
        <button class="lvl-btn" @click="buildStore.setLevel(buildStore.level + 1)">+</button>
      </div>

      <!-- Niveau requis du build -->
      <div v-if="buildStore.buildRequiredLevel > 1" class="req-level-row">
        <span class="req-label">Requis pour ce build :</span>
        <span
          class="req-level-badge"
          :class="buildStore.level >= buildStore.buildRequiredLevel ? 'met' : 'unmet'"
        >
          {{ buildStore.level >= buildStore.buildRequiredLevel ? '✓' : '✗' }}
          Niv. {{ buildStore.buildRequiredLevel }}
        </span>
      </div>
    </div>

    <!-- Points d'attributs -->
    <div class="attr-header">
      <h3 class="section-title">Attributs</h3>
      <div class="points-badge" :class="{ empty: buildStore.remainingPoints === 0 }">
        <span class="points-num">{{ buildStore.remainingPoints }}</span>
        <span class="points-label">/ {{ buildStore.totalAttributePoints }} pts</span>
      </div>
    </div>

    <div class="points-bar-wrap">
      <div class="points-bar" :style="{ width: pct + '%' }"></div>
    </div>

    <!-- Formules -->
    <div class="formulas-toggle">
      <button class="formula-btn" @click="showFormulas = !showFormulas">
        {{ showFormulas ? '▲' : '▼' }} Formules des attributs
      </button>
      <Transition name="expand">
        <div v-if="showFormulas" class="formulas-list">
          <div v-for="f in FORMULAS" :key="f.attr" class="formula-row">
            <span class="formula-icon">{{ f.icon }}</span>
            <span class="formula-name">{{ f.label }}</span>
            <span class="formula-desc">{{ f.desc }}</span>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Sliders attributs -->
    <div class="attributes-list">
      <div
        v-for="attr in ATTRIBUTES"
        :key="attr.id"
        class="attr-row"
        :style="{ '--attr-color': attr.color }"
        :class="{
          'req-unmet': reqUnmet(attr.id),
          'req-met':   reqMet(attr.id),
        }"
      >
        <span class="attr-icon">{{ attr.icon }}</span>
        <span class="attr-label">{{ attr.label }}</span>

        <div class="attr-controls">
          <button
            class="attr-btn"
            :disabled="buildStore.attributes[attr.id] === 0"
            @click="buildStore.decrementAttribute(attr.id)"
          >−</button>

          <span class="attr-value">{{ buildStore.attributes[attr.id] }}</span>

          <button
            class="attr-btn"
            :disabled="buildStore.remainingPoints === 0"
            @click="buildStore.incrementAttribute(attr.id)"
          >+</button>
        </div>

        <!-- Prérequis de l'attribut -->
        <span
          v-if="reqFor(attr.id) > 0"
          class="attr-req"
          :class="reqUnmet(attr.id) ? 'req-badge-unmet' : 'req-badge-met'"
          :title="`Requis : ${reqFor(attr.id)} pts pour équiper certains items`"
        >
          {{ reqUnmet(attr.id) ? '✗' : '✓' }} {{ reqFor(attr.id) }}
        </span>
      </div>
    </div>

    <button class="reset-btn" @click="buildStore.resetAttributes()">
      ↺ Réinitialiser les attributs
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ATTRIBUTES } from '@/data/constants'
import { useBuildStore } from '@/stores/buildStore'

const buildStore   = useBuildStore()
const showFormulas = ref(false)

const pct = computed(() =>
  buildStore.totalAttributePoints > 0
    ? (buildStore.spentPoints / buildStore.totalAttributePoints) * 100
    : 0
)

// Prérequis du build
function reqFor(attrId) {
  return buildStore.buildRequiredAttributes[attrId] ?? 0
}
function reqUnmet(attrId) {
  const r = reqFor(attrId)
  return r > 0 && buildStore.attributes[attrId] < r
}
function reqMet(attrId) {
  const r = reqFor(attrId)
  return r > 0 && buildStore.attributes[attrId] >= r
}

const FORMULAS = [
  { attr: 'force',        icon: '💪', label: 'Force',        desc: '+1 dégâts physiques · +2% dégâts critiques' },
  { attr: 'dexterite',    icon: '🎯', label: 'Dextérité',    desc: '+0.75% chance critique · +0.3% esquive' },
  { attr: 'intelligence', icon: '🔮', label: 'Intelligence', desc: '+1% dégâts magiques · +0.75% crit. compétence' },
  { attr: 'esprit',       icon: '✨', label: 'Esprit',       desc: '+0.1 rég. mana · +0.15 rég. vie · +0.05 rég. stamina' },
  { attr: 'defense',      icon: '🛡️', label: 'Défense',      desc: '+0.4 défense' },
  { attr: 'vitalite',     icon: '❤️', label: 'Vitalité',     desc: '+3 vie maximum' },
]
</script>

<style scoped>
.attribute-panel {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

/* ── Niveau ── */
.level-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.level-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.lvl-btn {
  width: 34px; height: 34px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-hi);
  background: var(--surface-3);
  color: var(--text);
  font-size: 1.2rem; font-weight: 700; cursor: pointer;
  transition: all 0.18s;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.lvl-btn:hover {
  border-color: var(--accent);
  color: var(--accent-hi);
  background: color-mix(in srgb, var(--accent) 16%, var(--surface-3));
  box-shadow: 0 0 16px rgba(124,58,237,0.3);
  transform: scale(1.1);
}

.level-display {
  flex: 1; display: flex; align-items: baseline;
  gap: 0.3rem; justify-content: center;
}

.level-input {
  background: var(--surface-3);
  border: 1px solid var(--border-hi);
  border-radius: var(--radius-sm);
  color: var(--accent-hi);
  font-size: 1.5rem; font-weight: 800;
  font-family: var(--font);
  width: 76px; text-align: center; padding: 0.2rem 0.4rem;
  outline: none; transition: all 0.2s;
  -moz-appearance: textfield;
  text-shadow: 0 0 18px rgba(124,58,237,0.6);
}
.level-input::-webkit-outer-spin-button,
.level-input::-webkit-inner-spin-button { -webkit-appearance: none; }
.level-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 18px rgba(124,58,237,0.3), inset 0 0 8px rgba(124,58,237,0.08);
}

.level-label { font-size: 0.8rem; color: var(--text-muted); }

/* Niveau requis */
.req-level-row {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.76rem; color: var(--text-muted);
}
.req-label { }
.req-level-badge {
  font-weight: 700; font-size: 0.75rem;
  padding: 0.15rem 0.55rem; border-radius: 20px; border: 1px solid;
}
.req-level-badge.met {
  color: #5dde8a;
  border-color: rgba(93, 222, 138, 0.35);
  background: rgba(93, 222, 138, 0.1);
}
.req-level-badge.unmet {
  color: #e05c5c;
  border-color: rgba(224, 92, 92, 0.35);
  background: rgba(224, 92, 92, 0.1);
}

/* ── Points header ── */
.attr-header {
  display: flex; align-items: center; justify-content: space-between;
}

.points-badge {
  display: flex; align-items: baseline; gap: 0.25rem;
  background: color-mix(in srgb, var(--accent) 12%, var(--surface-3));
  border: 1px solid var(--accent-dim);
  border-radius: 20px; padding: 0.22rem 0.85rem;
  box-shadow: 0 0 16px rgba(124,58,237,0.2);
}
.points-badge.empty {
  background: color-mix(in srgb, #ef4444 10%, var(--surface-3));
  border-color: rgba(239,68,68,0.4);
  box-shadow: 0 0 14px rgba(239,68,68,0.15);
}
.points-num { font-size: 1.05rem; font-weight: 800; color: var(--accent-hi); text-shadow: 0 0 14px rgba(124,58,237,0.6); }
.points-badge.empty .points-num { color: #f87171; text-shadow: 0 0 14px rgba(239,68,68,0.5); }
.points-label { font-size: 0.7rem; color: var(--text-muted); }

/* ── Barre de progression ── */
.points-bar-wrap {
  height: 4px;
  background: var(--surface-3);
  border-radius: 4px; overflow: hidden;
}
.points-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-hi), var(--cyan));
  border-radius: 4px;
  transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 0 10px rgba(124,58,237,0.55);
}

/* ── Formules ── */
.formula-btn {
  background: none; border: none; color: var(--text-muted);
  font-size: 0.75rem; cursor: pointer; padding: 0; transition: color 0.2s;
}
.formula-btn:hover { color: var(--accent); }

.formulas-list {
  margin-top: 0.5rem;
  display: flex; flex-direction: column; gap: 0.25rem;
  background: var(--surface-2); border: 1px solid var(--border);
  border-radius: 8px; padding: 0.6rem 0.75rem;
}
.formula-row {
  display: grid; grid-template-columns: 1.2rem 80px 1fr;
  align-items: center; gap: 0.4rem; font-size: 0.76rem;
}
.formula-icon { text-align: center; }
.formula-name { font-weight: 700; color: var(--text); }
.formula-desc { color: var(--text-muted); }

/* ── Attributs ── */
.attributes-list { display: flex; flex-direction: column; gap: 0.32rem; }

.attr-row {
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.6rem 0.9rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  transition: all 0.18s;
  position: relative;
  overflow: hidden;
}

/* Bar gauche colorée */
.attr-row::before {
  content: '';
  position: absolute;
  left: 0; top: 15%; bottom: 15%;
  width: 3px;
  background: var(--attr-color);
  border-radius: 0 3px 3px 0;
  opacity: 0;
  transition: opacity 0.2s;
  box-shadow: 2px 0 10px var(--attr-color);
}

.attr-row:hover::before { opacity: 0.85; }
.attr-row.req-met::before { opacity: 1; }

.attr-row:hover {
  border-color: color-mix(in srgb, var(--attr-color) 40%, transparent);
  background: color-mix(in srgb, var(--attr-color) 7%, var(--surface-2));
}
.attr-row.req-unmet {
  border-color: rgba(239,68,68,0.4);
  background: color-mix(in srgb, #ef4444 6%, var(--surface-2));
}
.attr-row.req-met {
  border-color: color-mix(in srgb, var(--attr-color) 45%, transparent);
  background: color-mix(in srgb, var(--attr-color) 6%, var(--surface-2));
}

.attr-icon { font-size: 1.1rem; flex-shrink: 0; }
.attr-label {
  flex: 1;
  font-size: 0.84rem; font-weight: 600;
  color: var(--text);
}

.attr-controls { display: flex; align-items: center; gap: 0.45rem; }

.attr-btn {
  width: 30px; height: 30px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-hi);
  background: var(--surface-3);
  color: var(--text);
  font-size: 1.05rem; font-weight: 700;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s; line-height: 1;
  flex-shrink: 0;
}
.attr-btn:hover:not(:disabled) {
  border-color: var(--attr-color);
  color: var(--attr-color);
  background: color-mix(in srgb, var(--attr-color) 16%, var(--surface-3));
  box-shadow: 0 0 14px color-mix(in srgb, var(--attr-color) 35%, transparent);
  transform: scale(1.12);
}
.attr-btn:disabled { opacity: 0.22; cursor: not-allowed; }

.attr-value {
  min-width: 38px; text-align: center;
  font-size: 1.1rem; font-weight: 800;
  color: var(--attr-color);
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 14px color-mix(in srgb, var(--attr-color) 55%, transparent);
}

/* Badge de prérequis par attribut */
.attr-req {
  font-size: 0.68rem; font-weight: 700;
  padding: 0.1rem 0.42rem; border-radius: 10px; border: 1px solid;
  flex-shrink: 0; white-space: nowrap;
}
.req-badge-met {
  color: #5dde8a;
  border-color: rgba(93, 222, 138, 0.35);
  background: rgba(93, 222, 138, 0.1);
}
.req-badge-unmet {
  color: #e05c5c;
  border-color: rgba(224, 92, 92, 0.35);
  background: rgba(224, 92, 92, 0.1);
}

/* ── Reset ── */
.reset-btn {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text-2); border-radius: var(--radius-sm);
  padding: 0.45rem 0.9rem; cursor: pointer;
  font-size: 0.76rem; font-weight: 600;
  transition: all 0.2s; align-self: flex-start;
  font-family: var(--font);
}
.reset-btn:hover {
  border-color: rgba(239,68,68,0.45);
  color: #f87171;
  background: rgba(239,68,68,0.08);
}

/* ── Transitions ── */
.expand-enter-active, .expand-leave-active { transition: all 0.2s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; }
.expand-enter-to, .expand-leave-from { max-height: 300px; opacity: 1; }
</style>
