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
  gap: 0.85rem;
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
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.04);
  color: var(--text-muted);
  font-size: 1.1rem; cursor: pointer;
  transition: all 0.18s;
  display: flex; align-items: center; justify-content: center;
}
.lvl-btn:hover {
  border-color: var(--accent-dim); color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  box-shadow: 0 0 12px rgba(124, 58, 237, 0.2);
}

.level-display {
  flex: 1; display: flex; align-items: baseline;
  gap: 0.3rem; justify-content: center;
}

.level-input {
  background: rgba(124, 58, 237, 0.06);
  border: 1px solid rgba(124, 58, 237, 0.25);
  border-radius: 8px; color: var(--accent);
  font-size: 1.4rem; font-weight: 800;
  font-family: var(--font);
  width: 72px; text-align: center; padding: 0.2rem;
  outline: none; transition: all 0.2s;
  -moz-appearance: textfield;
  text-shadow: 0 0 16px rgba(124, 58, 237, 0.5);
}
.level-input::-webkit-outer-spin-button,
.level-input::-webkit-inner-spin-button { -webkit-appearance: none; }
.level-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 16px rgba(124, 58, 237, 0.25);
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
  display: flex; align-items: baseline; gap: 0.2rem;
  background: color-mix(in srgb, var(--accent) 10%, rgba(255,255,255,0.02));
  border: 1px solid var(--accent-dim);
  border-radius: 20px; padding: 0.2rem 0.8rem;
  box-shadow: 0 0 12px rgba(124, 58, 237, 0.15);
}
.points-badge.empty {
  background: rgba(224, 92, 92, 0.08);
  border-color: rgba(224, 92, 92, 0.35);
  box-shadow: 0 0 12px rgba(224, 92, 92, 0.1);
}
.points-num { font-size: 1rem; font-weight: 800; color: var(--accent); text-shadow: 0 0 12px rgba(124,58,237,0.5); }
.points-badge.empty .points-num { color: #e05c5c; text-shadow: 0 0 12px rgba(224,92,92,0.4); }
.points-label { font-size: 0.7rem; color: var(--text-muted); }

/* ── Barre de progression ── */
.points-bar-wrap {
  height: 3px;
  background: rgba(255,255,255,0.05);
  border-radius: 3px; overflow: hidden;
}
.points-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #a78bfa, var(--accent-2));
  border-radius: 3px;
  transition: width 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 0 8px rgba(124, 58, 237, 0.5);
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
.attributes-list { display: flex; flex-direction: column; gap: 0.3rem; }

.attr-row {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.55rem 0.8rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  transition: all 0.18s;
  position: relative;
  overflow: hidden;
}

/* Accent left line */
.attr-row::before {
  content: '';
  position: absolute;
  left: 0; top: 20%; bottom: 20%;
  width: 2px;
  background: var(--attr-color);
  border-radius: 0 2px 2px 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.attr-row:hover::before { opacity: 0.7; }

.attr-row:hover {
  border-color: color-mix(in srgb, var(--attr-color) 30%, transparent);
  background: color-mix(in srgb, var(--attr-color) 4%, rgba(255,255,255,0.01));
}
.attr-row.req-unmet {
  border-color: rgba(224, 92, 92, 0.4);
  background: rgba(224, 92, 92, 0.04);
}
.attr-row.req-met {
  border-color: color-mix(in srgb, var(--attr-color) 35%, transparent);
}
.attr-row.req-met::before { opacity: 0.9; }

.attr-icon { font-size: 1.05rem; flex-shrink: 0; }
.attr-label { flex: 1; font-size: 0.84rem; font-weight: 600; color: var(--text); letter-spacing: 0.01em; }

.attr-controls { display: flex; align-items: center; gap: 0.35rem; }

.attr-btn {
  width: 26px; height: 26px; border-radius: 7px;
  border: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.04);
  color: var(--text-muted); font-size: 1rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s; line-height: 1;
}
.attr-btn:hover:not(:disabled) {
  border-color: var(--attr-color); color: var(--attr-color);
  background: color-mix(in srgb, var(--attr-color) 14%, transparent);
  box-shadow: 0 0 10px color-mix(in srgb, var(--attr-color) 25%, transparent);
}
.attr-btn:disabled { opacity: 0.25; cursor: not-allowed; }

.attr-value {
  min-width: 34px; text-align: center;
  font-size: 1.05rem; font-weight: 800;
  color: var(--attr-color);
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 10px color-mix(in srgb, var(--attr-color) 40%, transparent);
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
  background: transparent; border: 1px solid var(--border);
  color: var(--text-muted); border-radius: 6px;
  padding: 0.4rem 0.75rem; cursor: pointer;
  font-size: 0.8rem; transition: all 0.2s; align-self: flex-start;
}
.reset-btn:hover { border-color: #e05c5c; color: #e05c5c; }

/* ── Transitions ── */
.expand-enter-active, .expand-leave-active { transition: all 0.2s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; }
.expand-enter-to, .expand-leave-from { max-height: 300px; opacity: 1; }
</style>
