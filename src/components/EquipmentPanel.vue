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
import { useBuildStore }  from '@/stores/buildStore'
import { useRunesStore }  from '@/stores/runesStore'
import ItemModal from './ItemModal.vue'
import RuneModal from './RuneModal.vue'

const buildStore  = useBuildStore()
const runesStore  = useRunesStore()
const getRuneById = (id) => runesStore.getById(id)
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
  gap: 1rem;
}

.slots-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--text-muted);
  padding-left: 0.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.slots-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(124, 58, 237, 0.15), transparent);
}

.slots-grid {
  display: grid;
  gap: 0.45rem;
}

.cols-2 { grid-template-columns: repeat(2, 175px); }
.cols-3 { grid-template-columns: repeat(3, minmax(138px, 200px)); }
.cols-4 { grid-template-columns: repeat(4, minmax(118px, 178px)); }

/* Wrapper pour slot + rune-row */
.slot-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Rangée de dots de rune */
.rune-row {
  display: flex;
  gap: 0.22rem;
  padding: 0 0.5rem 0.05rem;
  flex-wrap: wrap;
}

.rune-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px dashed rgba(124, 58, 237, 0.25);
  background: rgba(124, 58, 237, 0.04);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  transition: all 0.18s;
  padding: 0;
  color: rgba(124, 58, 237, 0.3);
  flex-shrink: 0;
}

.rune-dot:hover {
  border-color: rgba(124, 58, 237, 0.6);
  border-style: solid;
  background: rgba(124, 58, 237, 0.12);
  color: var(--accent);
  box-shadow: 0 0 8px rgba(124, 58, 237, 0.25);
  transform: scale(1.15);
}

.rune-dot.rune-filled {
  border-style: solid;
  border-color: var(--rune-color, #888);
  background: color-mix(in srgb, var(--rune-color, #888) 22%, rgba(5, 4, 14, 0.8));
  font-size: 0.7rem;
  color: var(--text);
  box-shadow: 0 0 6px color-mix(in srgb, var(--rune-color, #888) 40%, transparent);
}

.rune-dot.rune-filled:hover {
  background: color-mix(in srgb, var(--rune-color, #888) 35%, rgba(5, 4, 14, 0.7));
  box-shadow: 0 0 12px color-mix(in srgb, var(--rune-color, #888) 50%, transparent);
  transform: scale(1.15);
}

/* ── Slot button ── */
:deep(.slot-btn) {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
  height: 60px;
}

/* ── État VIDE ── */
:deep(.slot-btn.empty) {
  background: transparent;
  border: 1px dashed rgba(124, 58, 237, 0.22);
}

:deep(.slot-btn.empty:hover) {
  border-color: rgba(124, 58, 237, 0.55);
  border-style: solid;
  background: rgba(124, 58, 237, 0.06);
  transform: translateY(-2px);
  box-shadow:
    0 6px 20px rgba(0,0,0,0.35),
    0 0 16px rgba(124, 58, 237, 0.12);
}

:deep(.slot-btn.empty:hover .slot-icon) {
  opacity: 1 !important;
  transform: scale(1.15) !important;
  filter: drop-shadow(0 0 6px rgba(124, 58, 237, 0.6));
}

/* ── État REMPLI ── */
:deep(.slot-btn.filled) {
  border: 1px solid color-mix(in srgb, var(--rc) 35%, transparent);
  background: color-mix(in srgb, var(--rc) 6%, rgba(8, 6, 18, 0.9));
}

:deep(.slot-btn.filled:hover) {
  border-color: color-mix(in srgb, var(--rc) 65%, transparent);
  background: color-mix(in srgb, var(--rc) 12%, rgba(8, 6, 18, 0.9));
  transform: translateY(-2px);
  box-shadow:
    0 8px 24px color-mix(in srgb, var(--rc) 25%, transparent),
    0 2px 8px rgba(0,0,0,0.5),
    inset 0 1px 0 color-mix(in srgb, var(--rc) 15%, transparent);
}

/* Fond dégradé rarity */
:deep(.slot-bg) {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg,
      color-mix(in srgb, var(--rc) 18%, transparent) 0%,
      transparent 45%),
    linear-gradient(to right,
      color-mix(in srgb, var(--rc) 8%, transparent) 0%,
      transparent 60%);
  pointer-events: none;
}

/* Barre de rareté gauche */
:deep(.rarity-bar) {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: linear-gradient(180deg,
    var(--rc) 0%,
    color-mix(in srgb, var(--rc) 50%, transparent) 70%,
    transparent 100%);
  border-radius: 3px 0 0 3px;
  box-shadow: 2px 0 12px color-mix(in srgb, var(--rc) 50%, transparent);
}

/* Reflet haut */
:deep(.slot-btn.filled)::after {
  content: '';
  position: absolute;
  top: 0; left: 12%; right: 12%;
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    color-mix(in srgb, var(--rc) 40%, transparent),
    transparent);
  pointer-events: none;
}

:deep(.slot-icon) {
  font-size: 1.4rem;
  flex-shrink: 0;
  transition: opacity 0.2s, transform 0.22s;
  line-height: 1;
}

:deep(.slot-btn.empty .slot-icon) {
  opacity: 0.22;
  font-size: 1.5rem;
}

:deep(.slot-btn.filled .slot-icon) {
  opacity: 0.9;
  filter: drop-shadow(0 0 6px color-mix(in srgb, var(--rc) 45%, transparent));
}

:deep(.slot-btn.filled:hover .slot-icon) {
  opacity: 1;
  transform: scale(1.1);
}

:deep(.slot-text) {
  display: flex;
  flex-direction: column;
  gap: 0.06rem;
  min-width: 0;
  flex: 1;
}

:deep(.slot-name) {
  font-size: 0.54rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 700;
}

:deep(.slot-btn.empty .slot-name) {
  opacity: 0.5;
}

:deep(.slot-item-name) {
  font-size: 0.81rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
  letter-spacing: 0.01em;
}

:deep(.slot-empty-label) {
  display: none;
}

:deep(.palier-badge) {
  flex-shrink: 0;
  font-size: 0.56rem;
  font-weight: 800;
  color: var(--rc);
  background: color-mix(in srgb, var(--rc) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--rc) 30%, transparent);
  border-radius: 5px;
  padding: 0.1rem 0.35rem;
  letter-spacing: 0.06em;
  box-shadow: 0 0 8px color-mix(in srgb, var(--rc) 20%, transparent);
}
</style>
