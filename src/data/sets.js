// Sets gérés via l'admin (/admin) et stockés dans Supabase
// Ce fichier ne contient plus de sets en dur

export const SETS = {}

export function getActiveSetBonuses(setId, equippedCount, setsMap = SETS) {
  const set = setsMap[setId]
  if (!set || equippedCount < 2) return []
  return (set.bonuses ?? []).filter(b => equippedCount >= b.count)
}

export function computeSetStats(setCountMap, setsMap = SETS) {
  const totals = {}
  for (const [setId, count] of Object.entries(setCountMap)) {
    const bonuses = getActiveSetBonuses(setId, count, setsMap)
    for (const bonus of bonuses) {
      for (const [stat, val] of Object.entries(bonus.stats ?? {})) {
        totals[stat] = (totals[stat] || 0) + val
      }
    }
  }
  return totals
}
