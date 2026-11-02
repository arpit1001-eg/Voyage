export type BudgetCurrency = 'USD' | 'INR' | 'EUR'

export const demoDailySpend: Record<string, number> = {
  'South Asia': 65,
  'East Asia': 125,
  'Southeast Asia': 75,
  'Southern Europe': 145,
  'Northern Europe': 175,
  'South America': 115,
}

const demoExchangeRate: Record<BudgetCurrency, number> = {
  USD: 1,
  INR: 84,
  EUR: 0.92,
}

const categoryShares = [
  { category: 'Accommodation', share: 0.36 },
  { category: 'Food', share: 0.23 },
  { category: 'Activities', share: 0.16 },
  { category: 'Transport', share: 0.1 },
  { category: 'Local transport', share: 0.1 },
  { category: 'Contingency', share: 0.05 },
] as const

export const dailySpendEstimate = (region: string) => demoDailySpend[region] ?? 120

export const convertDemoAmount = (usd: number, currency: BudgetCurrency) =>
  Math.round(usd * demoExchangeRate[currency])

export const formatDemoAmount = (amount: number, currency: BudgetCurrency) => {
  const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : '$'
  return `${symbol}${amount.toLocaleString()}`
}

export const budgetBreakdown = (total: number) => {
  let allocated = 0
  return categoryShares.map((item, index) => {
    const amount = index === categoryShares.length - 1
      ? total - allocated
      : Math.round(total * item.share)
    allocated += amount
    return { category: item.category, amount }
  })
}
