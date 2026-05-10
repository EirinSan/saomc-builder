import { defineStore } from 'pinia'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { computeSetStats } from '@/data/sets'

export const useItemsStore = defineStore('items', {
  state: () => ({
    items: [],
    sets: {},
    loading: false,
    error: null,
    source: 'local',
  }),

  getters: {
    getById: (state) => (id) => state.items.find(i => i.id === id),

    getByType: (state) => (type) => {
      const t = type.startsWith('anneau') ? 'anneau'
        : type.startsWith('artefact') ? 'artefact'
        : type
      return state.items.filter(i => i.type === t)
    },

    setsList: (state) => Object.values(state.sets),
  },

  actions: {
    async init() {
      if (isSupabaseConfigured) {
        await this.loadFromSupabase()
      } else {
        this.items = []
        this.sets  = {}
        this.source = 'local'
      }
    },

    async loadFromSupabase() {
      this.loading = true
      this.error = null
      try {
        const [itemsRes, setsRes] = await Promise.all([
          supabase.from('items').select('*').order('name'),
          supabase.from('sets').select('*'),
        ])
        if (itemsRes.error) throw itemsRes.error
        if (setsRes.error) throw setsRes.error

        this.items = itemsRes.data.map(normalizeRow)
        this.sets  = Object.fromEntries(setsRes.data.map(s => [s.id, s]))
        this.source = 'supabase'
      } catch (err) {
        console.error('Supabase error:', err)
        this.error = err.message
        this.items = []
        this.sets  = {}
      } finally {
        this.loading = false
      }
    },

    // ── Items CRUD ────────────────────────────────────────────

    async addItem(item) {
      const row = toDbRow(item)
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('items').insert(row).select().single()
        if (error) throw error
        this.items.push(normalizeRow(data))
        return normalizeRow(data)
      } else {
        this.items.push(item)
        return item
      }
    },

    async updateItem(id, updates) {
      const row = toDbRow(updates)
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('items').update(row).eq('id', id).select().single()
        if (error) throw error
        const idx = this.items.findIndex(i => i.id === id)
        if (idx !== -1) this.items[idx] = normalizeRow(data)
        return normalizeRow(data)
      } else {
        const idx = this.items.findIndex(i => i.id === id)
        if (idx !== -1) this.items[idx] = { ...this.items[idx], ...updates }
      }
    },

    async deleteItem(id) {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('items').delete().eq('id', id)
        if (error) throw error
      }
      this.items = this.items.filter(i => i.id !== id)
    },

    // ── Sets CRUD ─────────────────────────────────────────────

    async addSet(set) {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('sets').insert(set).select().single()
        if (error) throw error
        this.sets[data.id] = data
        return data
      } else {
        this.sets[set.id] = set
        return set
      }
    },

    async updateSet(id, updates) {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('sets').update(updates).eq('id', id).select().single()
        if (error) throw error
        this.sets[id] = data
        return data
      } else {
        this.sets[id] = { ...this.sets[id], ...updates }
      }
    },

    async deleteSet(id) {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('sets').delete().eq('id', id)
        if (error) throw error
      }
      delete this.sets[id]
    },

    // Calcule les stats de set pour un équipement donné
    computeSetStats(equipmentMap) {
      const counts = {}
      Object.values(equipmentMap).forEach(itemId => {
        if (!itemId) return
        const item = this.getById(itemId)
        if (!item?.set) return
        counts[item.set] = (counts[item.set] || 0) + 1
      })
      return computeSetStats(counts, this.sets)
    },
  },
})

function toDbRow(item) {
  return {
    id:                  item.id,
    name:                item.name,
    type:                item.type,
    palier:              item.palier ?? null,
    classes:             item.classes?.length ? item.classes : null,
    rarity:              item.rarity,
    required_level:      item.requiredLevel ?? 1,
    required_attributes: item.requiredAttributes ?? {},
    stats:               item.stats ?? {},
    lore:                item.lore ?? '',
    set_id:              item.set || null,
    tags:                item.tags ?? [],
  }
}

function normalizeRow(row) {
  return {
    id:                 row.id,
    name:               row.name,
    type:               row.type,
    palier:             row.palier ?? null,
    classes:            row.classes ?? null,
    rarity:             row.rarity,
    requiredLevel:      row.required_level ?? 1,
    requiredAttributes: row.required_attributes ?? {},
    stats:              row.stats ?? {},
    lore:               row.lore ?? '',
    set:                row.set_id ?? null,
    tags:               row.tags ?? [],
  }
}
