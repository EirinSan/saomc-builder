import { defineStore } from 'pinia'
import { EQUIPMENT_SLOTS, ATTRIBUTES, STAT_CATEGORIES } from '@/data/constants'
import { computeSetStats } from '@/data/sets'
import { useItemsStore } from '@/stores/itemsStore'

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

      // Initialise toutes les stats à 0, puis applique les valeurs de base
      STAT_CATEGORIES.forEach(cat =>
        cat.stats.forEach(s => { stats[s.id] = 0 })
      )

      // ── Stats de base (avant items & attributs) ──
      stats.degats_attaque               = 1
      stats.chance_critique              = 1
      stats.degats_critique              = 200
      stats.degats_critique_competence   = 200
      stats.mana                         = 20
      stats.sante                        = 20

      // Ajoute les stats de chaque item équipé
      Object.values(state.equipment).forEach(itemId => {
        if (!itemId) return
        const item = getItemById(itemId)
        if (!item) return
        Object.entries(item.stats).forEach(([statId, value]) => {
          if (stats[statId] !== undefined) stats[statId] += value
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
      const setStats = computeSetStats(setCountMap, useItemsStore().sets)
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

    // Retourne le détail des contributions pour une stat donnée
    statBreakdown: (state) => (statId) => {
      const itemsStore = useItemsStore()
      const a = state.attributes

      // Valeurs de base
      const BASE = {
        degats_attaque: 1, chance_critique: 1,
        degats_critique: 200, degats_critique_competence: 200,
        mana: 20, sante: 20,
      }

      // Formules d'attributs
      const ATTR_FORMULAS = {
        degats_attaque:              [{ attr: 'force',        rate: 1,    label: 'Force' }],
        degats_critique:             [{ attr: 'force',        rate: 2,    label: 'Force' }],
        chance_critique:             [{ attr: 'dexterite',    rate: 0.75, label: 'Dextérité' }],
        esquive:                     [{ attr: 'dexterite',    rate: 0.3,  label: 'Dextérité' }],
        degats_magiques:             [{ attr: 'intelligence', rate: 1,    label: 'Intelligence' }],
        chance_critique_competence:  [{ attr: 'intelligence', rate: 0.75, label: 'Intelligence' }],
        regen_mana:                  [{ attr: 'esprit',       rate: 0.1,  label: 'Esprit' }],
        regen_sante:                 [{ attr: 'esprit',       rate: 0.15, label: 'Esprit' }],
        regen_stamina:               [{ attr: 'esprit',       rate: 0.05, label: 'Esprit' }],
        defense_stat:                [{ attr: 'defense',      rate: 0.4,  label: 'Défense' }],
        sante:                       [{ attr: 'vitalite',     rate: 3,    label: 'Vitalité' }],
      }

      const lines = []

      // Base
      const base = BASE[statId] ?? 0
      if (base !== 0) lines.push({ source: 'Base', value: base, type: 'base' })

      // Items équipés
      Object.values(state.equipment).forEach(itemId => {
        if (!itemId) return
        const item = itemsStore.getById(itemId)
        if (!item) return
        const val = item.stats?.[statId]
        if (val) lines.push({ source: item.name, value: val, type: 'item', rarity: item.rarity })
      })

      // Bonus de sets
      const setCountMap = {}
      Object.values(state.equipment).forEach(itemId => {
        if (!itemId) return
        const item = itemsStore.getById(itemId)
        if (!item?.set) return
        setCountMap[item.set] = (setCountMap[item.set] || 0) + 1
      })
      for (const [setId, count] of Object.entries(setCountMap)) {
        const set = itemsStore.sets[setId]
        if (!set) continue
        const activeBonuses = (set.bonuses ?? []).filter(b => count >= b.count)
        let setVal = 0
        activeBonuses.forEach(b => { setVal += b.stats?.[statId] ?? 0 })
        if (setVal !== 0) lines.push({ source: `Set : ${set.name}`, value: setVal, type: 'set' })
      }

      // Attributs
      ;(ATTR_FORMULAS[statId] ?? []).forEach(({ attr, rate, label }) => {
        const pts = a[attr] || 0
        if (pts > 0) lines.push({
          source: `${label} (${pts} pts × ${rate})`,
          value: round2(pts * rate),
          type: 'attr',
        })
      })

      const total = lines.reduce((s, l) => s + l.value, 0)
      return { lines, total }
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
    },

    unequipItem(slotId) {
      this.equipment[slotId] = null
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
      this.selectedClass = null
      this.buildName = 'Mon Build'
      this.level = 1
    },

    exportBuild() {
      // On ne garde que les slots équipés (pas null) et les attributs > 0
      const e = Object.fromEntries(
        Object.entries(this.equipment).filter(([, v]) => v !== null)
      )
      const a = Object.fromEntries(
        Object.entries(this.attributes).filter(([, v]) => v !== 0)
      )
      const data = {
        c: this.selectedClass || undefined,
        e: Object.keys(e).length ? e : undefined,
        a: Object.keys(a).length ? a : undefined,
        n: this.buildName !== 'Mon Build' ? this.buildName : undefined,
        l: this.level !== 1 ? this.level : undefined,
      }
      // JSON → UTF-8 bytes → base64 URL-safe (sans encodeURIComponent)
      const json = JSON.stringify(data)
      const b64 = btoa(unescape(encodeURIComponent(json)))
      // URL-safe : remplace +→- /→_ et supprime le padding =
      return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    },

    importBuild(code) {
      try {
        // Restaure le base64 standard avant atob
        const b64 = code.replace(/-/g, '+').replace(/_/g, '/')
        const json = decodeURIComponent(escape(atob(b64)))
        const data = JSON.parse(json)
        this.selectedClass = data.c ?? null
        this.equipment = { ...emptyEquipment(), ...(data.e ?? {}) }
        this.attributes = { ...emptyAttributes(), ...(data.a ?? {}) }
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
