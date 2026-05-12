<template>
  <div class="equipment-panel">
    <h3 class="section-title">Équipement</h3>

    <div class="slots-section">

      <div class="slots-group">
        <div class="slots-label">Armure</div>
        <div class="slots-grid cols-3">
          <div v-for="slot in armorSlots" :key="slot.id" class="slot-cell">
            <SlotButton
              :slot="slot"
              :item="equippedItems[slot.id]"
              @click="openModal(slot)"
            />
            <div v-if="equippedItems[slot.id]?.runeSlots > 0" class="rune-row">
              <button
                v-for="i in equippedItems[slot.id].runeSlots"
                :key="i"
                class="rune-dot"
                :class="{ 'rune-filled': getSlottedRune(slot.id, i - 1) }"
                :style="getSlottedRune(slot.id, i - 1)
                  ? { '--rune-color': getRuneById(getSlottedRune(slot.id, i - 1))?.color ?? '#888' }
                  : {}"
                :title="getRuneById(getSlottedRune(slot.id, i - 1))?.name ?? 'Slot de rune vide'"
                @click.stop="openRuneModal(slot.id, i - 1)"
              >{{ getRuneById(getSlottedRune(slot.id, i - 1))?.icon ?? '◇' }}</button>
            </div>
          </div>
        </div>
      </div>

      <div class="slots-group">
        <div class="slots-label">Accessoires</div>
        <div class="slots-grid cols-4">
          <SlotButton v-for="slot in accessorySlots" :key="slot.id"
            :slot="slot" :item="equippedItems[slot.id]" @click="openModal(slot)" />
        </div>
      </div>

      <div class="slots-group two-col-groups">
        <div class="sub-group">
          <div class="slots-label">Armes</div>
          <div class="slots-grid cols-2">
            <div v-for="slot in weaponSlots" :key="slot.id" class="slot-cell">
              <SlotButton
                :slot="slot"
                :item="equippedItems[slot.id]"
                @click="openModal(slot)"
              />
              <div v-if="equippedItems[slot.id]?.runeSlots > 0" class="rune-row">
                <button
                  v-for="i in equippedItems[slot.id].runeSlots"
                  :key="i"
                  class="rune-dot"
                  :class="{ 'rune-filled': getSlottedRune(slot.id, i - 1) }"
                  :style="getSlottedRune(slot.id, i - 1)
                    ? { '--rune-color': getRuneById(getSlottedRune(slot.id, i - 1))?.color ?? '#888' }
                    : {}"
                  :title="getRuneById(getSlottedRune(slot.id, i - 1))?.name ?? 'Slot de rune vide'"
                  @click.stop="openRuneModal(slot.id, i - 1)"
                >{{ getRuneById(getSlottedRune(slot.id, i - 1))?.icon ?? '◇' }}</button>
              </div>
            </div>
          </div>
        </div>
        <div class="sub-group">
          <div class="slots-label">Artefacts</div>
          <div class="slots-grid cols-3">
            <SlotButton v-for="slot in artifactSlots" :key="slot.id"
              :slot="slot" :item="equippedItems[slot.id]" @click="openModal(slot)" />
          </div>
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

    <RuneModal
      v-if="activeRuneSlot"
      :slot-id="activeRuneSlot.slotId"
      :rune-index="activeRuneSlot.index"
      :current-rune-id="getSlottedRune(activeRuneSlot.slotId, activeRuneSlot.index)"
      @close="activeRuneSlot = null"
      @select="onRuneSelect"
      @unequip="onRuneUnequip"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { EQUIPMENT_SLOTS, RARITIES } from '@/data/constants'
import { useBuildStore } from '@/stores/buildStore'
import { getRuneById } from '@/data/runes'
import ItemModal from './ItemModal.vue'
import RuneModal from './RuneModal.vue'

const buildStore     = useBuildStore()
const activeSlot     = ref(null)
const activeRuneSlot = ref(null)
const equippedItems  = computed(() => buildStore.equippedItems)

const armorSlots     = EQUIPMENT_SLOTS.filter(s => s.category === 'armor')
const accessorySlots = EQUIPMENT_SLOTS.filter(s => s.category === 'accessory')
const weaponSlots    = EQUIPMENT_SLOTS.filter(s => s.category === 'weapon')
const artifactSlots  = EQUIPMENT_SLOTS.filter(s => s.category === 'artifact')

function openModal(slot) { activeSlot.value = slot }

function getSlottedRune(slotId, index) {
  return buildStore.runes[slotId]?.[index] ?? null
}

function openRuneModal(slotId, index) {
  activeRuneSlot.value = { slotId, index }
}

function onRuneSelect(runeId) {
  if (!activeRuneSlot.value) return
  buildStore.equipRune(activeRuneSlot.value.slotId, activeRuneSlot.value.index, runeId)
  activeRuneSlot.value = null
}

function onRuneUnequip() {
  if (!activeRuneSlot.value) return
  buildStore.unequipRune(activeRuneSlot.value.slotId, activeRuneSlot.value.index)
  activeRuneSlot.value = null
}
</script>

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
        item ? h('div', { class: 'slot-bg' }) : null,
        item ? h('div', { class: 'rarity-bar' }) : null,
        h('span', { class: 'slot-icon' }, slot.icon),
        h('div', { class: 'slot-text' }, [
          h('span', { class: 'slot-name' }, slot.label),
          item
            ? h('span', { class: 'slot-item-name', style: { color: rc } }, item.name)
            : h('span', { class: 'slot-empty-label' }, 'Vide'),
        ]),
        item?.palier ? h('span', { class: 'palier-badge' }, `P${item.palier}`) : null,
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
  gap: 0.75rem;
}

.slots-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

/* Armes + Artefacts côte à côte */
.two-col-groups {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  flex-direction: unset;
  align-items: start;
}

.sub-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.slots-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  padding-left: 0.15rem;
}

.slots-grid {
  display: grid;
  gap: 0.4rem;
}

.cols-2 { grid-template-columns: repeat(2, 180px); }
.cols-3 { grid-template-columns: repeat(3, minmax(140px, 200px)); }
.cols-4 { grid-template-columns: repeat(4, minmax(120px, 180px)); }

/* Wrapper pour slot + rune-row */
.slot-cell {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

/* Rangée de dots de rune */
.rune-row {
  display: flex;
  gap: 0.25rem;
  padding: 0 0.3rem 0.1rem;
  flex-wrap: wrap;
}

.rune-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px dashed var(--border);
  background: var(--surface-3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  transition: all 0.15s;
  padding: 0;
  color: var(--text-muted);
  flex-shrink: 0;
}

.rune-dot:hover {
  border-color: var(--accent);
  border-style: solid;
  background: color-mix(in srgb, var(--accent) 10%, var(--surface-3));
}

.rune-dot.rune-filled {
  border-style: solid;
  border-color: var(--rune-color, #888);
  background: color-mix(in srgb, var(--rune-color, #888) 18%, var(--surface-3));
  font-size: 0.75rem;
}

.rune-dot.rune-filled:hover {
  background: color-mix(in srgb, var(--rune-color, #888) 30%, var(--surface-3));
}

/* ── Slot button ── */
:deep(.slot-btn) {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.6rem 0.75rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.18s;
  overflow: hidden;
  height: 54px;
}

:deep(.slot-btn.empty:hover) {
  border-color: rgba(124,58,237,0.4);
  background: rgba(124,58,237,0.06);
}

:deep(.slot-btn.filled) {
  border-color: color-mix(in srgb, var(--rc) 35%, transparent);
  background: color-mix(in srgb, var(--rc) 4%, var(--surface-2));
}

:deep(.slot-btn.filled:hover) {
  border-color: color-mix(in srgb, var(--rc) 65%, transparent);
  background: color-mix(in srgb, var(--rc) 10%, var(--surface-2));
  transform: translateY(-1px);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--rc) 18%, transparent);
}

:deep(.slot-bg) {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg,
    color-mix(in srgb, var(--rc) 10%, transparent) 0%,
    transparent 55%);
  pointer-events: none;
}

:deep(.rarity-bar) {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, var(--rc), color-mix(in srgb, var(--rc) 40%, transparent));
  border-radius: 3px 0 0 3px;
}

:deep(.slot-icon) {
  font-size: 1.25rem;
  flex-shrink: 0;
  opacity: 0.85;
}

:deep(.slot-text) {
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
  min-width: 0;
  flex: 1;
}

:deep(.slot-name) {
  font-size: 0.58rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-weight: 700;
}

:deep(.slot-item-name) {
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
}

:deep(.slot-empty-label) {
  font-size: 0.73rem;
  color: var(--text-muted);
  opacity: 0.4;
  font-style: italic;
}

:deep(.palier-badge) {
  flex-shrink: 0;
  font-size: 0.58rem;
  font-weight: 800;
  color: var(--rc);
  background: color-mix(in srgb, var(--rc) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--rc) 30%, transparent);
  border-radius: 5px;
  padding: 0.1rem 0.3rem;
  letter-spacing: 0.04em;
}
</style>
