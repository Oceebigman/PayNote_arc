/**
 * Circle Forwarding Service for Gateway
 * Simplifies crosschain USDC transfers to Arc
 * No multichain infrastructure needed
 * No destination chain gas handling
 * Single query parameter enables forwarding
 *
 * Docs: https://developers.circle.com/circle-mint/docs/forwarding-service
 */

export const CIRCLE_FORWARDING_CHAINS: Record<number, string> = {
  1:     'Ethereum',
  8453:  'Base',
  137:   'Polygon',
  42161: 'Arbitrum',
  10:    'Optimism',
  43114: 'Avalanche',
  56:    'BSC',
}

export function buildForwardingUrl(params: {
  amount: string
  toAddress: string
  slug: string
  sourceChainId: number
}): string {
  // Circle Gateway forwarding — add ?forward=true to destination
  // Circle handles bridge, minting on Arc, and delivery automatically
  const destUrl = `https://paynote.space/api/verify?slug=${params.slug}&forwarded=true`
  const sourceName = CIRCLE_FORWARDING_CHAINS[params.sourceChainId] || 'Unknown'

  return `https://gateway.circle.com/forward?` +
    `destination=arc-testnet` +
    `&amount=${params.amount}` +
    `&recipient=${params.toAddress}` +
    `&callback=${encodeURIComponent(destUrl)}` +
    `&source_chain=${params.sourceChainId}` +
    `&memo=${encodeURIComponent(`PayNote:${params.slug}`)}`
}

export function isArcChain(chainId: string): boolean {
  return chainId === '0x4cef52' || chainId === '0x4ce752'
}
