export const CLASSES = [
  { id: 'guerrier', label: 'Guerrier', color: '#e74c3c', icon: '⚔️' },
  { id: 'assassin', label: 'Assassin', color: '#9b59b6', icon: '🗡️' },
  { id: 'archer', label: 'Archer', color: '#27ae60', icon: '🏹' },
  { id: 'mage', label: 'Mage', color: '#3498db', icon: '🔮' },
  { id: 'shaman', label: 'Shaman', color: '#e67e22', icon: '🌿' },
]

export const EQUIPMENT_SLOTS = [
  // Armure
  { id: 'casque',      label: 'Casque',       icon: '🪖', category: 'armor' },
  { id: 'plastron',    label: 'Plastron',     icon: '🛡️', category: 'armor' },
  { id: 'jambier',     label: 'Jambières',    icon: '🦵', category: 'armor' },
  { id: 'boots',       label: 'Bottes',       icon: '👟', category: 'armor' },
  { id: 'gant',        label: 'Gant',         icon: '🧤', category: 'armor' },
  // Accessoires
  { id: 'amulette',    label: 'Amulette',     icon: '📿', category: 'accessory' },
  { id: 'bracelet',    label: 'Bracelet',     icon: '⌚', category: 'accessory' },
  { id: 'anneau1',     label: 'Anneau 1',     icon: '💍', category: 'accessory' },
  { id: 'anneau2',     label: 'Anneau 2',     icon: '💍', category: 'accessory' },
  // Armes
  { id: 'arme',        label: 'Arme',         icon: '⚔️', category: 'weapon' },
  { id: 'secondaire',  label: 'Secondaire',   icon: '🗡️', category: 'weapon' },
  // Artefacts
  { id: 'artefact1',   label: 'Artefact 1',   icon: '🔮', category: 'artifact' },
  { id: 'artefact2',   label: 'Artefact 2',   icon: '🔮', category: 'artifact' },
  { id: 'artefact3',   label: 'Artefact 3',   icon: '🔮', category: 'artifact' },
]

export const ATTRIBUTES = [
  { id: 'force',        label: 'Force',        icon: '💪', color: '#e74c3c' },
  { id: 'dexterite',    label: 'Dextérité',    icon: '🎯', color: '#27ae60' },
  { id: 'intelligence', label: 'Intelligence', icon: '🔮', color: '#3498db' },
  { id: 'esprit',       label: 'Esprit',       icon: '✨', color: '#9b59b6' },
  { id: 'defense',      label: 'Défense',      icon: '🛡️', color: '#e67e22' },
  { id: 'vitalite',     label: 'Vitalité',     icon: '❤️', color: '#e91e63' },
]

export const STAT_CATEGORIES = [
  {
    id: 'offense',
    label: 'Attaque',
    color: '#e74c3c',
    stats: [
      { id: 'degats_attaque',              label: "Dégâts d'attaque",        unit: '' },
      { id: 'vitesse_attaque',             label: "Vitesse d'attaque",       unit: '/s' },
      { id: 'chance_critique',             label: 'Chance de critique',      unit: '%' },
      { id: 'chance_critique_competence',  label: 'Chance crit. compétence', unit: '%' },
      { id: 'degats_critique',             label: 'Dégâts critiques',        unit: '%' },
      { id: 'degats_critique_competence',  label: 'Crit. comp. dégâts',      unit: '%' },
      { id: 'degats_capacites',            label: 'Dégâts des capacités',    unit: '%' },
      { id: 'degats_projectile',           label: 'Dégâts de projectile',    unit: '%' },
      { id: 'degats_magiques',             label: 'Dégâts magiques',         unit: '%' },
    ],
  },
  {
    id: 'defense',
    label: 'Défense',
    color: '#3498db',
    stats: [
      { id: 'defense_stat',      label: 'Défense',              unit: '' },
      { id: 'reduction_degats',  label: 'Réduction des dégâts', unit: '%' },
      { id: 'esquive',           label: 'Esquive',              unit: '%' },
      { id: 'tenacite',          label: 'Ténacité',             unit: '' },
    ],
  },
  {
    id: 'resources',
    label: 'Ressources',
    color: '#27ae60',
    stats: [
      { id: 'sante',   label: 'Santé max', unit: '' },
      { id: 'mana',    label: 'Mana max',  unit: '' },
      { id: 'stamina', label: 'Stamina',   unit: '' },
    ],
  },
  {
    id: 'utility',
    label: 'Utilitaire',
    color: '#9b59b6',
    stats: [
      { id: 'haste_aptitude',    label: "Hâte d'aptitude",      unit: '%' },
      { id: 'vitesse_deplacement',label: 'Vitesse de déplacement', unit: '' },
      { id: 'soin_bonus',        label: 'Soin bonus',           unit: '' },
      { id: 'regen_sante',       label: 'Rég. de santé',        unit: '/s' },
      { id: 'regen_mana',        label: 'Rég. de mana',         unit: '/s' },
      { id: 'regen_stamina',     label: 'Rég. de stamina',      unit: '/s' },
    ],
  },
]

export const RARITIES = [
  { id: 'commun',      label: 'Commun',      color: '#95a5a6' },
  { id: 'peu_commun',  label: 'Peu commun',  color: '#2ecc71' },
  { id: 'rare',        label: 'Rare',         color: '#3498db' },
  { id: 'epique',      label: 'Épique',       color: '#9b59b6' },
  { id: 'legendaire',  label: 'Légendaire',   color: '#f39c12' },
  { id: 'mythique',    label: 'Mythique',     color: '#e74c3c' },
  { id: 'godlike',     label: 'Godlike',      color: '#ff6b35' },
  { id: 'exclusif',    label: 'Exclusif',     color: '#ff69b4' },
]
