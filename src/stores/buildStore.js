import { defineStore } from 'pinia'
import { EQUIPMENT_SLOTS, ATTRIBUTES, STAT_CATEGORIES } from '@/data/constants'
import { computeSetStats } from '@/data/sets'
import { useItemsStore } from '@/stores/itemsStore'
import { getRuneById } from '@/data/runes'

function getItemById(id) {
  return useItemsStore().getById(id)
}

const emptyEquipment = () =>
  Object.fromEntries(EQUIPMENT_SLOTS.map(slot => [slot.id, null]))

const emptyAttributes = () =>
  Object.fromEntries(ATTRIBUTES.map(attr => [attr.id, 0]))

export const useBuildStore = defineStore('build', {
  state: () => ({
    selectedClass: null,
    equipment: emptyEquipment(),
    attributes: emptyAttributes(),
    runes: {},
    buildName: 'Mon Build',
    level: 1,
  }),

  getters: {
    totalAttributePoints: (state) => state.level,

    spentPoints: (state) =>
      Object.values(state.attributes).reduce((sum, v) => sum + v, 0),

    remainingPoints(state) {
      return this.totalAttributePoints - this.spentPoints
    },

    // Calcule toutes les stats : items équipés + formules d'attributs exactes
    computedStats: (state) => {
      const stats = {}

      // Initialise toutes les stats à 0
      STAT_CATEGORIES.forEach(cat =>
        cat.stats.forEach(s => { stats[s.id] = 0 })
      )

      // Ajoute les stats de chaque item équipé
      Object.values(state.equipment).forEach(itemId => {
        if (!itemId) return
        const item = getItemById(itemId)
        if (!item) return
        Object.entries(item.stats).forEach(([statId, value]) => {
          if (stats[statId] !== undefined) stats[statId] += value
        })
      })

      // Ajoute les stats des runes équipées
      Object.entries(state.runes).forEach(([, runeIds]) => {
        if (!runeIds) return
        runeIds.forEach(runeId => {
          if (!runeId) return
          const rune = getRuneById(runeId)
          if (!rune) return
          Object.entries(rune.stats).forEach(([statId, value]) => {
            if (stats[statId] !== undefined) stats[statId] += value
          })
        })
      })

      // Ajoute les bonus de sets actifs
      const setCountMap = {}
      Object.values(state.equipment).forEach(itemId => {
        if (!itemId) return
        const item = getItemById(itemId)
        if (!item?.set) return
        setCountMap[item.set] = (setCountMap[item.set] || 0) + 1
      })
      const setStats = computeSetStats(setCountMap)
      Object.entries(setStats).forEach(([statId, value]) => {
        if (stats[statId] !== undefined) stats[statId] += value
      })

      const a = state.attributes

      // Force : dégâts physique +1, dégâts critique +2%
      stats.degats_attaque         += (a.force || 0) * 1
      stats.degats_critique        += (a.force || 0) * 2

      // Dextérité : chance critique +0.75%, esquive +0.3%
      stats.chance_critique        += round2((a.dexterite || 0) * 0.75)
      stats.esquive                += round2((a.dexterite || 0) * 0.3)

      // Intelligence : dégâts magiques +1%, chance critique compétence +0.75%
      stats.degats_magiques        += (a.intelligence || 0) * 1
      stats.chance_critique_competence += round2((a.intelligence || 0) * 0.75)

      // Esprit : rég. mana +0.1, rég. vie +0.15, rég. stamina +0.05
      stats.regen_mana             += round2((a.esprit || 0) * 0.1)
      stats.regen_sante            += round2((a.esprit || 0) * 0.15)
      stats.regen_stamina          += round2((a.esprit || 0) * 0.05)

      // Défense : défense +0.4
      stats.defense_stat           += round2((a.defense || 0) * 0.4)

      // Vitalité : vie max +3
      stats.sante                  += (a.vitalite || 0) * 3

      return stats
    },

    equippedItems: (state) => {
      const result = {}
      Object.entries(state.equipment).forEach(([slot, itemId]) => {
        result[slot] = itemId ? getItemById(itemId) : null
      })
      return result
    },

    // Nombre de pièces équipées par set
    equippedSetCounts: (state) => {
      const counts = {}
      Object.values(state.equipment).forEach(itemId => {
        if (!itemId) return
        const item = getItemById(itemId)
        if (!item?.set) return
        counts[item.set] = (counts[item.set] || 0) + 1
      })
      return counts
    },

    // Sets actifs (>= 2 pièces)
    activeSets: (state) => {
      const counts = {}
      Object.values(state.equipment).forEach(itemId => {
        if (!itemId) return
        const item = getItemById(itemId)
        if (!item?.set) return
        counts[item.set] = (counts[item.set] || 0) + 1
      })
      const sets = useItemsStore().sets
      return Object.entries(counts)
        .filter(([, c]) => c >= 2)
        .map(([setId, count]) => ({
          ...sets[setId],
          count,
          activeBonuses: sets[setId]?.bonuses?.filter(b => count >= b.count) ?? [],
        }))
    },
  },

  actions: {
    setClass(classId) {
      this.selectedClass = classId
    },

    setLevel(lvl) {
      const newLevel = Math.max(1, Math.min(200, lvl))
      // Si on descend le niveau sous les points dépensés, on reset
      if (this.spentPoints > newLevel) {
        this.attributes = emptyAttributes()
      }
      this.level = newLevel
    },

    equipItem(slotId, itemId) {
      this.equipment[slotId] = itemId
      // Réinitialise les runes si l'item change
      const r = { ...this.runes }
      delete r[slotId]
      this.runes = r
    },

    unequipItem(slotId) {
      this.equipment[slotId] = null
      const r = { ...this.runes }
      delete r[slotId]
      this.runes = r
    },

    equipRune(slotId, index, runeId) {
      const item = getItemById(this.equipment[slotId])
      if (!item?.runeSlots) return
      const current = this.runes[slotId] ?? Array(item.runeSlots).fill(null)
      const updated = [...current]
      if (index >= updated.length) return
      updated[index] = runeId
      this.runes = { ...this.runes, [slotId]: updated }
    },

    unequipRune(slotId, index) {
      const current = this.runes[slotId]
      if (!current) return
      const updated = [...current]
      updated[index] = null
      this.runes = { ...this.runes, [slotId]: updated }
    },

    incrementAttribute(attrId) {
      if (this.remainingPoints > 0) {
        this.attributes[attrId]++
      }
    },

    decrementAttribute(attrId) {
      if (this.attributes[attrId] > 0) {
        this.attributes[attrId]--
      }
    },

    resetAttributes() {
      this.attributes = emptyAttributes()
    },

    resetBuild() {
      this.equipment = emptyEquipment()
      this.attributes = emptyAttributes()
      this.runes = {}
      this.selectedClass = null
      this.buildName = 'Mon Build'
      this.level = 1
    },

    exportBuild() {
      const data = {
        c: this.selectedClass,
        e: this.equipment,
        a: this.attributes,
        r: this.runes,
        n: this.buildName,
        l: this.level,
      }
      return btoa(encodeURIComponent(JSON.stringify(data)))
    },

    importBuild(code) {
      try {
        const data = JSON.parse(decodeURIComponent(atob(code)))
        this.selectedClass = data.c
        this.equipment = { ...emptyEquipment(), ...data.e }
        this.attributes = { ...emptyAttributes(), ...data.a }
        this.runes = data.r || {}
        this.buildName = data.n || 'Mon Build'
        this.level = data.l || 1
        return true
      } catch {
        return false
      }
    },
  },
})

function round2(n) {
  return Math.round(n * 100) / 100
}
