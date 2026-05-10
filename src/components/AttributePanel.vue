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
      <div
        class="points-bar"
        :style="{ width: pct + '%' }"
      ></div>
    </div>

    <!-- Tooltip formules -->
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

const buildStore = useBuildStore()
const showFormulas = ref(false)

const pct = computed(() =>
  buildStore.totalAttributePoints > 0
    ? (buildStore.spentPoints / buildStore.totalAttributePoints) * 100
    : 0
)

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
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lvl-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
}

.level-display {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
  justify-content: center;
}

.level-input {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--accent);
  font-size: 1.4rem;
  font-weight: 800;
  width: 72px;
  text-align: center;
  padding: 0.2rem;
  outline: none;
  transition: border-color 0.2s;
  -moz-appearance: textfield;
}

.level-input::-webkit-outer-spin-button,
.level-input::-webkit-inner-spin-button { -webkit-appearance: none; }

.level-input:focus { border-color: var(--accent); }

.level-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* ── Points header ── */
.attr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.points-badge {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  border: 1px solid var(--accent-dim);
  border-radius: 20px;
  padding: 0.18rem 0.7rem;
}

.points-badge.empty {
  background: color-mix(in srgb, #e05c5c 10%, transparent);
  border-color: rgba(224, 92, 92, 0.3);
}

.points-num {
  font-size: 1rem;
  font-weight: 800;
  color: var(--accent);
}

.points-badge.empty .points-num { color: #e05c5c; }

.points-label {
  font-size: 0.72rem;
  color: var(--text-muted);
}

/* ── Barre de progression ── */
.points-bar-wrap {
  height: 4px;
  background: var(--surface-3);
  border-radius: 2px;
  overflow: hidden;
}

.points-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #a78bfa);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* ── Formules ── */
.formulas-toggle { }

.formula-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.formula-btn:hover { color: var(--accent); }

.formulas-list {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
}

.formula-row {
  display: grid;
  grid-template-columns: 1.2rem 80px 1fr;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.76rem;
}

.formula-icon { text-align: center; }
.formula-name { font-weight: 700; color: var(--text); }
.formula-desc { color: var(--text-muted); }

/* ── Attributs ── */
.attributes-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.attr-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: border-color 0.2s;
}

.attr-row:hover {
  border-color: color-mix(in srgb, var(--attr-color) 40%, transparent);
}

.attr-icon { font-size: 1.05rem; flex-shrink: 0; }

.attr-label {
  flex: 1;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
}

.attr-controls {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.attr-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface-3);
  color: var(--text);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  line-height: 1;
}

.attr-btn:hover:not(:disabled) {
  border-color: var(--attr-color);
  color: var(--attr-color);
  background: color-mix(in srgb, var(--attr-color) 15%, transparent);
}

.attr-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.attr-value {
  min-width: 32px;
  text-align: center;
  font-size: 1rem;
  font-weight: 800;
  color: var(--attr-color);
  font-variant-numeric: tabular-nums;
}

/* ── Reset ── */
.reset-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
  align-self: flex-start;
}

.reset-btn:hover { border-color: #e05c5c; color: #e05c5c; }

/* ── Expand transition ── */
.expand-enter-active, .expand-leave-active { transition: all 0.2s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; }
.expand-enter-to, .expand-leave-from { max-height: 300px; opacity: 1; }
</style>
