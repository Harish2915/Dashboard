import { subDays, subMonths, subYears, format, eachDayOfInterval, eachMonthOfInterval } from 'date-fns'

export const DATE_FILTERS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '6m', label: 'Last 6 months' },
  { value: '1y', label: 'Last year' },
  { value: 'all', label: 'All time' },
]

export function getDateRange(filter) {
  const now = new Date()
  switch (filter) {
    case '7d': return { start: subDays(now, 7), end: now }
    case '30d': return { start: subDays(now, 30), end: now }
    case '90d': return { start: subDays(now, 90), end: now }
    case '6m': return { start: subMonths(now, 6), end: now }
    case '1y': return { start: subYears(now, 1), end: now }
    default: return { start: subYears(now, 2), end: now }
  }
}

export function generateMonthlyData(months = 12) {
  const now = new Date()
  return Array.from({ length: months }, (_, i) => {
    const d = subMonths(now, months - 1 - i)
    return {
      month: format(d, 'MMM'),
      fullDate: d,
    }
  })
}

export function formatCurrency(val) {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
  return `$${val}`
}

export function formatNumber(val) {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`
  return String(val)
}