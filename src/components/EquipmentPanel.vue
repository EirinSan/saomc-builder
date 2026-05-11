<template>
  <div class="equipment-panel">
    <h3 class="section-title">Équipement</h3>

    <div class="slots-section">

      <div class="slots-group">
        <div class="slots-label">⚔️ Armure</div>
        <div class="slots-grid cols-3">
          <SlotButton v-for="slot in armorSlots" :key="slot.id"
            :slot="slot" :item="equippedItems[slot.id]" @click="openModal(slot)" />
        </div>
      </div>

      <div class="slots-group">
        <div class="slots-label">💎 Accessoires</div>
        <div class="slots-grid cols-4">
          <SlotButton v-for="slot in accessorySlots" :key="slot.id"
            :slot="slot" :item="equippedItems[slot.id]" @click="openModal(slot)" />
        </div>
      </div>

      <div class="slots-group">
        <div class="slots-label">🗡️ Armes</div>
        <div class="slots-grid cols-2">
          <SlotButton v-for="slot in weaponSlots" :key="slot.id"
            :slot="slot" :item="equippedItems[slot.id]" @click="openModal(slot)" />
        </div>
      </div>

      <div class="slots-group">
        <div class="slots-label">🔮 Artefacts</div>
        <div class="slots-grid cols-3">
          <SlotButton v-for="slot in artifactSlots" :key="slot.id"
            :slot="slot" :item="equippedItems[slot.id]" @click="openModal(slot)" />
        </div>
      </div>

    </div>

    <ItemModal
      v-if="activeSlot"
      :slot-id="activeSlot.id"
      :slot-label="activeSlot.label"
      :selected-item-id="buildStore.equipment[activeSlot.id]"
      @close="activeSlot = null"
      @select="(id) => { buildStore.equipItem(activeSlot.id, id); activeSlot = null }"
      @unequip="buildStore.unequipItem(activeSlot.id); activeSlot = null"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { EQUIPMENT_SLOTS, RARITIES } from '@/data/constants'
import { useBuildStore } from '@/stores/buildStore'
import ItemModal from './ItemModal.vue'

const buildStore     = useBuildStore()
const activeSlot     = ref(null)
const equippedItems  = computed(() => buildStore.equippedItems)

const armorSlots     = EQUIPMENT_SLOTS.filter(s => s.category === 'armor')
const accessorySlots = EQUIPMENT_SLOTS.filter(s => s.category === 'accessory')
const weaponSlots    = EQUIPMENT_SLOTS.filter(s => s.category === 'weapon')
const artifactSlots  = EQUIPMENT_SLOTS.filter(s => s.category === 'artifact')

function openModal(slot) { activeSlot.value = slot }
</script>

<!-- SlotButton inlined -->
<script>
import { defineComponent, h } from 'vue'
import { RARITIES } from '@/data/constants'

const SlotButton = defineComponent({
  props: { slot: Object, item: Object },
  emits: ['click'],
  setup(props, { emit }) {
    function rarityColor(id) {
      return RARITIES.find(r => r.id === id)?.color ?? '#ccc'
    }
    return () => {
      const { item, slot } = props
      const rc = item ? rarityColor(item.rarity) : null
      return h('button', {
        class: ['slot-btn', item ? 'filled' : 'empty'],
        style: item ? { '--rc': rc } : {},
        onClick: () => emit('click'),
      }, [
        /* fond coloré discret */
        item ? h('div', { class: 'slot-bg' }) : null,
        /* barre de rareté gauche */
        item ? h('div', { class: 'rarity-bar' }) : null,
        /* icône */
        h('span', { class: 'slot-icon' }, slot.icon),
        /* texte */
        h('div', { class: 'slot-text' }, [
          h('span', { class: 'slot-name' }, slot.label),
          item
            ? h('span', { class: 'slot-item-name', style: { color: rc } }, item.name)
            : h('span', { class: 'slot-empty-label' }, 'Vide'),
        ]),
        /* palier badge */
        item?.palier
          ? h('span', { class: 'palier-badge' }, `P${item.palier}`)
          : null,
      ])
    }
  },
})
export default { components: { SlotButton } }
</script>

<style scoped>
.equipment-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.slots-section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.slots-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.slots-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  padding-left: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.slots-grid {
  display: grid;
  gap: 0.4rem;
}

.cols-2 { grid-template-columns: repeat(2, 1fr); }
.cols-3 { grid-template-columns: repeat(3, 1fr); }
.cols-4 { grid-template-columns: repeat(4, 1fr); }

/* ── Slot button ── */
:deep(.slot-btn) {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.65rem 0.75rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.18s;
  overflow: hidden;
  min-height: 56px;
}

:deep(.slot-btn.empty:hover) {
  border-color: var(--accent-dim);
  background: var(--surface-3);
}

:deep(.slot-btn.filled) {
  border-color: color-mix(in srgb, var(--rc) 40%, transparent);
}

:deep(.slot-btn.filled:hover) {
  border-color: color-mix(in srgb, var(--rc) 70%, transparent);
  background: color-mix(in srgb, var(--rc) 8%, var(--surface-2));
  transform: translateY(-1px);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--rc) 15%, transparent);
}

/* Fond coloré */
:deep(.slot-bg) {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--rc) 8%, transparent) 0%,
    transparent 60%);
  pointer-events: none;
}

/* Barre de rareté gauche */
:deep(.rarity-bar) {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--rc);
  border-radius: 3px 0 0 3px;
}

:deep(.slot-icon) {
  font-size: 1.35rem;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 4px rgba(0,0,0,.4));
}

:deep(.slot-text) {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
  flex: 1;
}

:deep(.slot-name) {
  font-size: 0.6rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 700;
}

:deep(.slot-item-name) {
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.slot-empty-label) {
  font-size: 0.75rem;
  color: var(--text-muted);
  opacity: 0.5;
  font-style: italic;
}

/* Badge palier */
:deep(.palier-badge) {
  flex-shrink: 0;
  font-size: 0.6rem;
  font-weight: 800;
  color: var(--rc);
  background: color-mix(in srgb, var(--rc) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--rc) 35%, transparent);
  border-radius: 6px;
  padding: 0.1rem 0.35rem;
  letter-spacing: 0.04em;
}
</style>
