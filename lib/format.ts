/**
 * Format payment amounts with proper decimal precision
 * Nanopayments (e.g. 0.000001 USDC) show full precision
 * Normal amounts show 2 decimal places
 * cirBTC always shows 8 decimal places
 */
export function formatAmount(amount: number | string, token: string): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(n)) return '0.00'

  if (token === 'cirBTC') {
    return n.toFixed(8)
  }

  // Nanopayment — show full precision without trailing zeros
  if (n > 0 && n < 0.01) {
    // Find meaningful decimal places
    const str = n.toPrecision(6)
    const parsed = parseFloat(str)
    // Remove trailing zeros but keep at least the significant digits
    return parsed.toString()
  }

  return n.toFixed(2)
}

/**
 * Format for display — adds commas for large amounts
 */
export function formatAmountDisplay(amount: number | string, token: string): string {
  const formatted = formatAmount(amount, token)
  const n = parseFloat(formatted)
  if (n >= 1000) {
    return n.toLocaleString('en-US', {
      minimumFractionDigits: token === 'cirBTC' ? 8 : 2,
      maximumFractionDigits: token === 'cirBTC' ? 8 : 2,
    })
  }
  return formatted
}
