// Items gérés via l'admin (/admin) et stockés dans Supabase
// Ce fichier ne contient plus d'items en dur

export const ITEMS = []

export function getItemsByType(type) {
  const t = type.startsWith('anneau') ? 'anneau'
    : type.startsWith('artefact') ? 'artefact'
    : type
  return ITEMS.filter(i => i.type === t)
}

export function getItemById(id) {
  return ITEMS.find(i => i.id === id)
}
