import { defineStore } from 'pinia'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { RUNES as STATIC_RUNES } from '@/data/runes'

export const useRunesStore = defineStore('runes', {
  state: () => ({
    runes:   [],
    loading: false,
    error:   null,
    source:  'local',
  }),

  getters: {
    getById:   (state) => (id) => state.runes.find(r => r.id === id) ?? null,
    runesList: (state) => state.runes,
  },

  actions: {
    async init() {
      if (isSupabaseConfigured) {
        await this.loadFromSupabase()
      } else {
        this.runes  = [...STATIC_RUNES]
        this.source = 'local'
      }
    },

    async loadFromSupabase() {
      this.loading = true
      this.error   = null
      try {
        const { data, error } = await supabase.from('runes').select('*').order('name')
        if (error) throw error
        // Si aucune rune en base → utilise les runes statiques comme fallback
        this.runes  = data.length ? data.map(normalizeRow) : [...STATIC_RUNES]
        this.source = 'supabase'
      } catch (err) {
        console.error('Supabase runes error:', err)
        this.error  = err.message
        this.runes  = [...STATIC_RUNES]
      } finally {
        this.loading = false
      }
    },

    async addRune(rune) {
      const row = toDbRow(rune)
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('runes').insert(row).select().single()
        if (error) throw error
        this.runes.push(normalizeRow(data))
        return normalizeRow(data)
      } else {
        this.runes.push(rune)
        return rune
      }
    },

    async updateRune(id, updates) {
      const row = toDbRow(updates)
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('runes').update(row).eq('id', id).select().single()
        if (error) throw error
        const idx = this.runes.findIndex(r => r.id === id)
        if (idx !== -1) this.runes[idx] = normalizeRow(data)
        return normalizeRow(data)
      } else {
        const idx = this.runes.findIndex(r => r.id === id)
        if (idx !== -1) this.runes[idx] = { ...this.runes[idx], ...updates }
      }
    },

    async deleteRune(id) {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('runes').delete().eq('id', id)
        if (error) throw error
      }
      this.runes = this.runes.filter(r => r.id !== id)
    },

    // Importe les runes statiques par défaut dans Supabase
    async seedDefaults() {
      if (!isSupabaseConfigured) return
      for (const rune of STATIC_RUNES) {
        const { error } = await supabase
          .from('runes').upsert(toDbRow(rune), { onConflict: 'id' })
        if (error) console.error('Seed error:', error)
      }
      await this.loadFromSupabase()
    },
  },
})

function normalizeRow(row) {
  return {
    id:    row.id,
    name:  row.name,
    icon:  row.icon  ?? '◇',
    color: row.color ?? '#888888',
    stats: row.stats ?? {},
  }
}

function toDbRow(rune) {
  return {
    id:    rune.id,
    name:  rune.name,
    icon:  rune.icon  ?? '◇',
    color: rune.color ?? '#888888',
    stats: rune.stats ?? {},
  }
}
