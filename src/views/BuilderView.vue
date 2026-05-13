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

.top-row {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1rem;
  align-items: start;
}

.top-row .panel {
  position: sticky;
  top: 66px;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}

.bottom-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1.25rem;
  align-items: start;
}

/* ── Panel ── */
.panel {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.03) inset;
}

.panel::before {
  content: '';
  position: absolute;
  top: 0; left: 10%; right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent-dim), var(--cyan-dim), transparent);
  pointer-events: none;
}

.panel::-webkit-scrollbar { width: 4px; }
.panel::-webkit-scrollbar-track { background: transparent; }
.panel::-webkit-scrollbar-thumb { background: var(--accent-dim); border-radius: 4px; }

@media (max-width: 1200px) {
  .top-row { grid-template-columns: 1fr 280px; }
}
@media (max-width: 960px) {
  .top-row    { grid-template-columns: 1fr; }
  .bottom-row { grid-template-columns: 1fr 1fr; }
  .panel-attributes { order: -1; }
  .top-row .panel { position: static; max-height: none; }
}
@media (max-width: 650px) {
  .bottom-row { grid-template-columns: 1fr; }
  .builder-view { padding: 0.6rem; gap: 0.6rem; }
  .panel { padding: 0.85rem; }
}
</style>
