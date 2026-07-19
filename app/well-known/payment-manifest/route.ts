import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    name: 'PayNote',
    description: 'Non-custodial payment coordination infrastructure, built on Arc Network',
    version: '1.0.0',
    network: 'arc-testnet',
    protocol: 'x402',
    standards: ['ERC-8183', 'x402', 'EIP-3009'],
    endpoints: {
      create: 'https://paynote.space/api/agent/pay',
      poll: 'https://paynote.space/api/poll',
      verify: 'https://paynote.space/api/verify',
      x402: 'https://paynote.space/api/x402',
      spec: 'https://paynote.space/api-spec',
    },
    tokens: [
      { symbol: 'USDC', address: '0x3600000000000000000000000000000000000000', decimals: 6 },
      { symbol: 'EURC', address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a', decimals: 6 },
      { symbol: 'cirBTC', address: '0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF', decimals: 8 },
    ],
    authentication: {
      type: 'bearer',
      key_prefix: 'pn_',
      get_key: 'https://paynote.space/docs#auth',
    },
    contracts: {
      PayNoteRouter: '0x829fe116E221d14Db289623028c5AC6b2F30BD82',
      PayNoteRouterV2: '0xc7190DBb23861b7dB15eED4326eBa33B0eeacEa4',
    },
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    }
  })
}
