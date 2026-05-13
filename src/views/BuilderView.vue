<template>
  <div class="builder-view">

    <!-- ═══ LIGNE DU HAUT ═══ -->
    <div class="top-row">
      <section class="panel panel-equipment">
        <ClassSelector />
        <EquipmentPanel />
      </section>
      <section class="panel panel-attributes">
        <AttributePanel />
      </section>
    </div>

    <!-- ═══ LIGNE DU BAS ═══ -->
    <div class="bottom-row">
      <section class="panel panel-stats">
        <StatsPanel />
      </section>
      <section class="panel panel-sets">
        <SetBonusPanel />
      </section>
      <section class="panel panel-dmg">
        <DamageCalcPanel />
      </section>
    </div>

  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBuildStore } from '@/stores/buildStore'
import ClassSelector from '@/components/ClassSelector.vue'
import EquipmentPanel from '@/components/EquipmentPanel.vue'
import AttributePanel from '@/components/AttributePanel.vue'
import StatsPanel from '@/components/StatsPanel.vue'
import SetBonusPanel from '@/components/SetBonusPanel.vue'
import DamageCalcPanel from '@/components/DamageCalcPanel.vue'

const buildStore = useBuildStore()
const route = useRoute()

onMounted(() => {
  const code = route.query.build
  if (code) buildStore.importBuild(code)
})
</script>

<style scoped>
.builder-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem 1.75rem;
}

/* ── Ligne du haut : Équipement+Classe | Attributs ── */
.top-row {
  display: grid;
  grid-template-columns: 1fr 270px;
  gap: 1.25rem;
  align-items: start;
}

.top-row .panel {
  position: sticky;
  top: 68px;
  max-height: calc(100vh - 84px);
  overflow-y: auto;
}

/* ── Ligne du bas : Stats (large) | Bonus sets | Calcul dégâts ── */
.bottom-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1.25rem;
  align-items: start;
}

/* ── Panel base ── */
.panel {
  background: linear-gradient(145deg, rgba(16, 14, 31, 0.95), rgba(11, 9, 24, 0.98));
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 4px 32px rgba(0, 0, 0, 0.5),
    0 1px 0 rgba(255, 255, 255, 0.03) inset,
    0 0 0 1px rgba(255, 255, 255, 0.02) inset;
  backdrop-filter: blur(8px);
}

/* Ligne dégradée en haut de chaque panel */
.panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--accent-dim) 30%,
    var(--accent-2-dim) 70%,
    transparent 100%);
  pointer-events: none;
}

/* Coin brillant subtil */
.panel::after {
  content: '';
  position: absolute;
  top: -60px; right: -60px;
  width: 180px; height: 180px;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.05) 0%, transparent 70%);
  pointer-events: none;
}

/* Scrollbar panel */
.panel::-webkit-scrollbar       { width: 4px; }
.panel::-webkit-scrollbar-track { background: transparent; }
.panel::-webkit-scrollbar-thumb {
  background: linear-gradient(var(--accent-dim), var(--accent-2-dim));
  border-radius: 4px;
}

@media (max-width: 1100px) {
  .top-row    { grid-template-columns: 1fr 1fr; }
  .bottom-row { grid-template-columns: 1fr 1fr; }
  .panel-stats { grid-column: 1 / -1; }
  .top-row .panel { position: static; max-height: none; }
}

@media (max-width: 650px) {
  .top-row, .bottom-row { grid-template-columns: 1fr; }
  .builder-view { padding: 0.75rem; }
}
</style>
