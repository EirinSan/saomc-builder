<template>
  <div class="equipment-panel">
    <h3 class="section-title">Équipement</h3>

    <div class="slots-section">
      <div class="slots-label">Armure</div>
      <div class="slots-grid">
        <SlotButton
          v-for="slot in armorSlots"
          :key="slot.id"
          :slot="slot"
          :item="equippedItems[slot.id]"
          @click="openModal(slot)"
        />
      </div>

      <div class="slots-label">Accessoires</div>
      <div class="slots-grid">
        <SlotButton
          v-for="slot in accessorySlots"
          :key="slot.id"
          :slot="slot"
          :item="equippedItems[slot.id]"
          @click="openModal(slot)"
        />
      </div>

      <div class="slots-label">Armes</div>
      <div class="slots-grid">
        <SlotButton
          v-for="slot in weaponSlots"
          :key="slot.id"
          :slot="slot"
          :item="equippedItems[slot.id]"
          @click="openModal(slot)"
        />
      </div>

      <div class="slots-label">Artefacts</div>
      <div class="slots-grid artifact-grid">
        <SlotButton
          v-for="slot in artifactSlots"
          :key="slot.id"
          :slot="slot"
          :item="equippedItems[slot.id]"
          @click="openModal(slot)"
        />
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

const buildStore = useBuildStore()
const activeSlot = ref(null)
const equippedItems = computed(() => buildStore.equippedItems)

const armorSlots     = EQUIPMENT_SLOTS.filter(s => s.category === 'armor')
const accessorySlots = EQUIPMENT_SLOTS.filter(s => s.category === 'accessory')
const weaponSlots    = EQUIPMENT_SLOTS.filter(s => s.category === 'weapon')
const artifactSlots  = EQUIPMENT_SLOTS.filter(s => s.category === 'artifact')

function openModal(slot) {
  activeSlot.value = slot
}
</script>

<!-- SlotButton inlined as sub-component -->
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
      const item = props.item
      const slot = props.slot
      return h('button', {
        class: ['slot-btn', item ? 'filled' : ''],
        style: item ? { '--rc': rarityColor(item.rarity) } : {},
        onClick: () => emit('click'),
      }, [
        item ? h('div', { class: 'rarity-glow' }) : null,
        h('span', { class: 'slot-icon' }, slot.icon),
        h('div', { class: 'slot-text' }, [
          h('span', { class: 'slot-name' }, slot.label),
          item
            ? h('span', { class: 'slot-item-name', style: { color: rarityColor(item.rarity) } }, item.name)
            : h('span', { class: 'slot-empty' }, 'Vide'),
        ]),
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
  gap: 0.85rem;
}

.slots-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slots-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  padding-left: 0.2rem;
}

.slots-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem;
}

.artifact-grid {
  grid-template-columns: 1fr 1fr 1fr;
}

:deep(.slot-btn) {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.55rem 0.7rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  overflow: hidden;
}

:deep(.slot-btn:hover) {
  border-color: var(--accent-dim);
  background: var(--surface-3);
}

:deep(.slot-btn.filled) {
  border-color: color-mix(in srgb, var(--rc, #888) 45%, transparent);
  background: color-mix(in srgb, var(--rc, #888) 5%, var(--surface-2));
}

:deep(.rarity-glow) {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, color-mix(in srgb, var(--rc) 10%, transparent), transparent 55%);
  pointer-events: none;
}

:deep(.slot-icon) {
  font-size: 1.2rem;
  flex-shrink: 0;
}

:deep(.slot-text) {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

:deep(.slot-name) {
  font-size: 0.65rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

:deep(.slot-item-name) {
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.slot-empty) {
  font-size: 0.76rem;
  color: var(--text-muted);
  font-style: italic;
}
</style>
