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
  gap: 1rem;
  padding: 1rem 1.5rem;
}

/* ── Ligne du haut : Équipement+Classe | Attributs ── */
.top-row {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1rem;
  align-items: start;
}

.top-row .panel {
  position: sticky;
  top: 76px;
  max-height: calc(100vh - 92px);
  overflow-y: auto;
}

/* ── Ligne du bas : Stats (large) | Bonus sets | Calcul dégâts ── */
.bottom-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
  align-items: start;
}

/* ── Panel base ── */
.panel {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Scrollbar */
.panel::-webkit-scrollbar       { width: 4px; }
.panel::-webkit-scrollbar-track { background: transparent; }
.panel::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

@media (max-width: 1100px) {
  .top-row    { grid-template-columns: 1fr 1fr; }
  .bottom-row { grid-template-columns: 1fr 1fr; }
  .panel-stats { grid-column: 1 / -1; }
  .top-row .panel { position: static; max-height: none; }
}

@media (max-width: 650px) {
  .top-row, .bottom-row { grid-template-columns: 1fr; }
}
</style>
