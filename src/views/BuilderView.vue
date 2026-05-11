<template>
  <div class="builder-view">

    <!-- ═══ LIGNE DU HAUT : Équipement | Attributs | Stats ═══ -->
    <div class="top-row">
      <section class="panel panel-equipment">
        <ClassSelector />
        <EquipmentPanel />
      </section>

      <section class="panel panel-attributes">
        <AttributePanel />
      </section>

      <section class="panel panel-stats">
        <StatsPanel />
      </section>
    </div>

    <!-- ═══ LIGNE DU BAS : Calculateur dégâts + Bonus de set ═══ -->
    <div class="bottom-row">
      <section class="panel panel-dmg">
        <DamageCalcPanel />
      </section>
      <section class="panel panel-sets">
        <SetBonusPanel />
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
  min-height: calc(100vh - 60px);
}

/* ─── Ligne du haut ─── */
.top-row {
  display: grid;
  grid-template-columns: 320px 260px 1fr;
  gap: 1rem;
  align-items: start;
}

/* ─── Ligne du bas ─── */
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: start;
}

/* ─── Panels ─── */
.panel {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Top panels : collent en haut et scrollent */
.top-row .panel {
  position: sticky;
  top: 76px;
  max-height: calc(100vh - 92px);
  overflow-y: auto;
}

/* Scrollbar custom */
.panel::-webkit-scrollbar { width: 4px; }
.panel::-webkit-scrollbar-track { background: transparent; }
.panel::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

@media (max-width: 1100px) {
  .top-row    { grid-template-columns: 1fr 1fr; }
  .panel-stats { grid-column: 1 / -1; }
}

@media (max-width: 700px) {
  .top-row, .bottom-row { grid-template-columns: 1fr; }
  .top-row .panel { position: static; max-height: none; }
}
</style>
