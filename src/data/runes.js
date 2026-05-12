export const RUNES = [
  // ── Offensives ──────────────────────────────────────────────────────────────
  {
    id: 'rune_tranchant',
    name: 'Rune Tranchante',
    icon: '⚔️',
    color: '#e74c3c',
    stats: { degats_attaque: 8 },
  },
  {
    id: 'rune_critique',
    name: 'Rune Critique',
    icon: '🎯',
    color: '#f39c12',
    stats: { chance_critique: 3, degats_critique: 5 },
  },
  {
    id: 'rune_devastation',
    name: 'Rune de Dévastation',
    icon: '💥',
    color: '#c0392b',
    stats: { degats_critique: 10, degats_critique_competence: 8 },
  },
  {
    id: 'rune_arcane',
    name: 'Rune Arcane',
    icon: '🔮',
    color: '#3498db',
    stats: { degats_magiques: 6, chance_critique_competence: 2 },
  },
  {
    id: 'rune_rapidite',
    name: 'Rune de Rapidité',
    icon: '⚡',
    color: '#f1c40f',
    stats: { vitesse_attaque: 0.1, haste_aptitude: 2 },
  },
  {
    id: 'rune_projectile',
    name: 'Rune du Projectile',
    icon: '🏹',
    color: '#27ae60',
    stats: { degats_projectile: 8 },
  },
  {
    id: 'rune_capacite',
    name: 'Rune des Capacités',
    icon: '🌟',
    color: '#8e44ad',
    stats: { degats_capacites: 7, chance_critique_competence: 3 },
  },

  // ── Défensives ──────────────────────────────────────────────────────────────
  {
    id: 'rune_protection',
    name: 'Rune de Protection',
    icon: '🛡️',
    color: '#2980b9',
    stats: { defense_stat: 12 },
  },
  {
    id: 'rune_resilience',
    name: 'Rune de Résilience',
    icon: '💠',
    color: '#1abc9c',
    stats: { reduction_degats: 2 },
  },
  {
    id: 'rune_esquive',
    name: "Rune d'Esquive",
    icon: '💨',
    color: '#16a085',
    stats: { esquive: 2.5, vitesse_deplacement: 5 },
  },
  {
    id: 'rune_tenacite',
    name: 'Rune de Ténacité',
    icon: '🪨',
    color: '#7f8c8d',
    stats: { tenacite: 20 },
  },

  // ── Ressources ──────────────────────────────────────────────────────────────
  {
    id: 'rune_vitalite',
    name: 'Rune de Vitalité',
    icon: '❤️',
    color: '#e91e63',
    stats: { sante: 60, regen_sante: 0.3 },
  },
  {
    id: 'rune_mana',
    name: 'Rune de Mana',
    icon: '🌀',
    color: '#9b59b6',
    stats: { mana: 40, regen_mana: 0.5 },
  },
  {
    id: 'rune_stamina',
    name: 'Rune de Stamina',
    icon: '🟢',
    color: '#2ecc71',
    stats: { stamina: 25, regen_stamina: 0.3 },
  },

  // ── Utilitaires ─────────────────────────────────────────────────────────────
  {
    id: 'rune_haste',
    name: "Rune d'Hâte",
    icon: '⏩',
    color: '#e67e22',
    stats: { haste_aptitude: 6 },
  },
  {
    id: 'rune_regeneration',
    name: 'Rune de Régénération',
    icon: '🌿',
    color: '#27ae60',
    stats: { regen_sante: 0.8, regen_mana: 0.4, regen_stamina: 0.2 },
  },

  // ── Mixtes ──────────────────────────────────────────────────────────────────
  {
    id: 'rune_guerrier',
    name: 'Rune du Guerrier',
    icon: '🗡️',
    color: '#c0392b',
    stats: { degats_attaque: 5, defense_stat: 5, sante: 20 },
  },
  {
    id: 'rune_mage',
    name: 'Rune du Mage',
    icon: '✨',
    color: '#8e44ad',
    stats: { degats_magiques: 8, mana: 25, regen_mana: 0.3 },
  },
  {
    id: 'rune_chasseur',
    name: 'Rune du Chasseur',
    icon: '🏹',
    color: '#2ecc71',
    stats: { degats_projectile: 6, chance_critique: 2, esquive: 1 },
  },
  {
    id: 'rune_gardien',
    name: 'Rune du Gardien',
    icon: '🔰',
    color: '#3498db',
    stats: { defense_stat: 8, sante: 40, reduction_degats: 1 },
  },
]

export function getRuneById(id) {
  return RUNES.find(r => r.id === id) ?? null
}
