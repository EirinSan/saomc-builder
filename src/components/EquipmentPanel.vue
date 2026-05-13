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
            : h('span', { class: 'slot-empty-label' }, '— Vide —'),
        ]),
        item?.palier ? h('span', { class: 'palier-badge' }, `P${item.palier}`) : null,
      ])
    }
  },
})
export default { components: { SlotButton } }
</script>

<style scoped>
.equipment-panel { display: flex; flex-direction: column; gap: 1rem; }
.slots-section { display: flex; flex-direction: column; gap: 1rem; }
.slots-group { display: flex; flex-direction: column; gap: 0.5rem; }

.two-col-groups {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 1rem;
  flex-direction: unset;
  align-items: start;
}
.sub-group { display: flex; flex-direction: column; gap: 0.5rem; }

.slots-label {
  font-size: 0.58rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.slots-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--border-hi), transparent);
}

.slots-grid { display: grid; gap: 0.5rem; }
.cols-2 { grid-template-columns: repeat(2, 1fr); }
.cols-3 { grid-template-columns: repeat(3, 1fr); }
.cols-4 { grid-template-columns: repeat(4, 1fr); }

.slot-cell { display: flex; flex-direction: column; gap: 0.2rem; }

.rune-row {
  display: flex;
  gap: 0.2rem;
  padding: 0.1rem 0.5rem;
  flex-wrap: wrap;
}

.rune-dot {
  width: 20px; height: 20px;
  border-radius: 50%;
  border: 1px dashed rgba(120, 60, 240, 0.3);
  background: rgba(120, 60, 240, 0.06);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.55rem;
  transition: all 0.16s;
  padding: 0;
  color: rgba(120, 60, 240, 0.4);
  flex-shrink: 0;
}
.rune-dot:hover {
  border-style: solid;
  border-color: var(--accent);
  background: rgba(120, 60, 240, 0.18);
  color: var(--accent-hi);
  box-shadow: 0 0 10px rgba(120,60,240,0.35);
  transform: scale(1.18);
}
.rune-dot.rune-filled {
  border-style: solid;
  border-color: var(--rune-color, #888);
  background: color-mix(in srgb, var(--rune-color, #888) 25%, var(--surface-3));
  font-size: 0.68rem;
  color: white;
  box-shadow: 0 0 8px color-mix(in srgb, var(--rune-color, #888) 50%, transparent);
}
.rune-dot.rune-filled:hover {
  background: color-mix(in srgb, var(--rune-color, #888) 40%, var(--surface-3));
  box-shadow: 0 0 14px color-mix(in srgb, var(--rune-color, #888) 60%, transparent);
  transform: scale(1.18);
}

/* ══════════════════════════════
   SLOT BUTTON
══════════════════════════════ */
:deep(.slot-btn) {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  padding: 0.7rem 0.9rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  overflow: hidden;
  height: 62px;
}

/* VIDE */
:deep(.slot-btn.empty) {
  background: var(--surface-2);
  border: 1px solid rgba(255,255,255,0.09);
}
:deep(.slot-btn.empty:hover) {
  border-color: var(--accent-dim);
  background: color-mix(in srgb, var(--accent) 7%, var(--surface-2));
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.5), 0 0 20px rgba(120,60,240,0.12);
}
:deep(.slot-btn.empty:hover .slot-icon) {
  opacity: 0.65 !important;
  transform: scale(1.1) !important;
  filter: drop-shadow(0 0 10px rgba(120,60,240,0.8));
}

/* REMPLI */
:deep(.slot-btn.filled) {
  background: color-mix(in srgb, var(--rc) 11%, var(--surface-2));
  border: 1px solid color-mix(in srgb, var(--rc) 45%, transparent);
}
:deep(.slot-btn.filled:hover) {
  background: color-mix(in srgb, var(--rc) 18%, var(--surface-2));
  border-color: color-mix(in srgb, var(--rc) 75%, transparent);
  transform: translateY(-2px);
  box-shadow:
    0 10px 30px color-mix(in srgb, var(--rc) 30%, transparent),
    0 2px 8px rgba(0,0,0,0.5);
}

/* Dégradé diagonale rarity */
:deep(.slot-bg) {
  position: absolute; inset: 0;
  background: linear-gradient(130deg,
    color-mix(in srgb, var(--rc) 25%, transparent) 0%,
    transparent 50%);
  pointer-events: none;
}

/* Barre rarity gauche */
:deep(.rarity-bar) {
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--rc), color-mix(in srgb, var(--rc) 30%, transparent));
  border-radius: 3px 0 0 3px;
  box-shadow: 0 0 16px color-mix(in srgb, var(--rc) 60%, transparent);
}

/* Reflet haut sur filled */
:deep(.slot-btn.filled)::after {
  content: '';
  position: absolute; top: 0; left: 10%; right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--rc) 55%, transparent), transparent);
  pointer-events: none;
}

:deep(.slot-icon) {
  font-size: 1.5rem;
  flex-shrink: 0;
  line-height: 1;
  transition: opacity 0.2s, transform 0.2s, filter 0.2s;
}
:deep(.slot-btn.empty .slot-icon)  { opacity: 0.35; filter: grayscale(0.4); }
:deep(.slot-btn.filled .slot-icon) {
  opacity: 1;
  filter: drop-shadow(0 0 8px color-mix(in srgb, var(--rc) 55%, transparent));
}
:deep(.slot-btn.filled:hover .slot-icon) { transform: scale(1.08); }

:deep(.slot-text) {
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
  min-width: 0;
  flex: 1;
}
:deep(.slot-name) {
  font-size: 0.52rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 700;
}
:deep(.slot-item-name) {
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
:deep(.slot-empty-label) {
  font-size: 0.68rem;
  color: var(--text-muted);
  opacity: 0.4;
  letter-spacing: 0.04em;
}
:deep(.palier-badge) {
  flex-shrink: 0;
  font-size: 0.54rem;
  font-weight: 800;
  color: var(--rc);
  background: color-mix(in srgb, var(--rc) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--rc) 35%, transparent);
  border-radius: 5px;
  padding: 0.1rem 0.38rem;
  letter-spacing: 0.06em;
}
</style>
