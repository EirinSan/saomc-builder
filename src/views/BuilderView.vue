<template>
  <div class="builder-view">
    <!-- Colonne gauche : Équipement -->
    <section class="panel panel-equipment">
      <ClassSelector />
      <EquipmentPanel />
    </section>

    <!-- Colonne centre : Attributs -->
    <section class="panel panel-attributes">
      <AttributePanel />
    </section>

    <!-- Colonne droite : Stats + Sets -->
    <section class="panel panel-stats">
      <SetBonusPanel />
      <StatsPanel />
    </section>
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

const buildStore = useBuildStore()
const route = useRoute()

onMounted(() => {
  const code = route.query.build
  if (code) buildStore.importBuild(code)
})
</script>

<style scoped>
.builder-view {
  display: grid;
  grid-template-columns: 320px 280px 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  min-height: calc(100vh - 60px);
  align-items: start;
}

.panel {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 76px;
  max-height: calc(100vh - 92px);
  overflow-y: auto;
}

/* Scrollbar custom */
.panel::-webkit-scrollbar { width: 4px; }
.panel::-webkit-scrollbar-track { background: transparent; }
.panel::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

@media (max-width: 900px) {
  .builder-view {
    grid-template-columns: 1fr;
  }

  .panel {
    position: static;
    max-height: none;
  }
}
</style>
