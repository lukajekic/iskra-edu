// src/hooks/useSeasonalTheme.ts
export function isWinterSeason(d = new Date()) {
  const m = d.getMonth() // 0 = jan, 11 = dec
  const day = d.getDate()
  return m === 11 || (m === 0 && day <= 15)
}

export function useSeasonalTheme(): 'winter' | 'default' {
  // ?theme=winter ili ?theme=default služi za testiranje van sezone
  const forced = new URLSearchParams(location.search).get('theme')
  if (forced === 'winter' || forced === 'default') return forced
  return isWinterSeason() ? 'winter' : 'default'
}