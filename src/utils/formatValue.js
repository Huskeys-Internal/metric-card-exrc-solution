export const formatValue = (value, unit = 'number') => {
  if (unit === 'percent') {
    return `${value.toFixed(1)}%`
  }
  if (unit === 'abbreviated') {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return String(value)
  }
  return value.toLocaleString()
}
