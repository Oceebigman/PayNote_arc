import { NextRequest } from 'next/server'
import { createMcpHandler, McpServer, type AuthInfo } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'
import { getApiKeyInfo } from '@/lib/apiAuth'
import { POST as createRequestHandler } from '@/app/api/request/route'
import { POST as agentPayHandler } from '@/app/api/agent/pay/route'
import { GET as pollHandler } from '@/app/api/poll/route'
import { POST as verifyHandler } from '@/app/api/verify/route'
import { GET as templatesHandler } from '@/app/api/templates/route'

// Lets any MCP-compatible agent (Claude, or anything else speaking MCP)
// create and check PayNote payment requests as a native tool call instead
// of a custom HTTP integration. Each tool calls the SAME route handler the
// REST API uses, in-process — not over the network. An earlier version did
// a real fetch() back to paynote.space, which hit Cloudflare's own
// loop-prevention on a Worker calling its own public hostname (522 timeout
// every time). Calling the exported handler directly sidesteps that
// entirely and still reuses 100% of the existing logic — nothing about
// payment creation/verification is duplicated here.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://paynote.space'
const TOKEN_ENUM = z.enum(['USDC', 'EURC', 'cirBTC'])

async function callRoute(
  handler: (req: NextRequest) => Promise<Response>,
  opts: { path: string; method?: string; apiKey?: string; body?: object }
) {
  const headers: Record<string, string> = {}
  if (opts.body) headers['Content-Type'] = 'application/json'
  if (opts.apiKey) headers['Authorization'] = `Bearer ${opts.apiKey}`
  const req = new NextRequest(`${APP_URL}${opts.path}`, {
    method: opts.method || (opts.body ? 'POST' : 'GET'),
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const res = await handler(req)
  const bodyText = await res.text()
  let data: unknown
  try {
    data = JSON.parse(bodyText)
  } catch {
    data = { error: `non-JSON response (status ${res.status}): ${bodyText.slice(0, 200)}` }
  }
  return { ok: res.ok, data }
}

function toolResult(ok: boolean, data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
    isError: !ok,
  }
}

function buildServer({ authInfo }: { authInfo?: AuthInfo }) {
  const apiKey = authInfo?.token ?? ''
  const server = new McpServer({ name: 'paynote', version: '1.0.0' })

  server.registerTool(
    'create_payment_request',
    {
      description:
        'Create a PayNote payment request for a human payer and get back a shareable link and QR-code URL. ' +
        'Non-custodial: PayNote never holds funds, the payer settles directly wallet-to-wallet on Arc.',
      inputSchema: z.object({
        amount: z.number().positive().describe('Amount to request'),
        reason: z.string().min(1).describe('What the payment is for, shown to the payer'),
        to_address: z.string().describe('Recipient wallet address (0x...)'),
        token: TOKEN_ENUM.optional().describe('Token to request in — USDC, EURC, or cirBTC. Defaults to USDC.'),
        note: z.string().optional().describe('Optional extra note shown on the pay page'),
        expires_in: z.number().int().positive().optional().describe('Seconds until the request expires'),
      }),
    },
    async (args) => {
      const { ok, data } = await callRoute(createRequestHandler, { path: '/api/request', apiKey, body: args })
      return toolResult(ok, data)
    }
  )

  server.registerTool(
    'create_agent_payment',
    {
      description:
        'Create an agent-to-agent payment request with x402 and ERC-8183 support, for autonomous machine payment ' +
        '(no human approval). Returns pay_url, poll_url, and x402_url. Optionally fires notify_url when settled.',
      inputSchema: z.object({
        amount: z.number().positive(),
        reason: z.string().min(1),
        to_address: z.string(),
        token: TOKEN_ENUM.optional(),
        notify_url: z.url().optional().describe('Webhook URL PayNote POSTs to when the payment completes'),
      }),
    },
    async (args) => {
      const { ok, data } = await callRoute(agentPayHandler, { path: '/api/agent/pay', apiKey, body: args })
      return toolResult(ok, data)
    }
  )

  server.registerTool(
    'check_payment_status',
    {
      description: 'Check the status (pending / completed / expired / failed) of a PayNote payment request by its slug.',
      inputSchema: z.object({ slug: z.string().describe('The request slug, from the URL or a previous tool call') }),
    },
    async ({ slug }) => {
      const { ok, data } = await callRoute(pollHandler, { path: `/api/poll?slug=${encodeURIComponent(slug)}`, method: 'GET' })
      return toolResult(ok, data)
    }
  )

  server.registerTool(
    'verify_payment',
    {
      description:
        'Verify an on-chain transaction hash against a PayNote payment request on Arc, and mark it completed if it matches.',
      inputSchema: z.object({
        slug: z.string(),
        tx_hash: z.string().describe('The on-chain transaction hash to verify'),
      }),
    },
    async (args) => {
      const { ok, data } = await callRoute(verifyHandler, { path: '/api/verify', body: args })
      return toolResult(ok, data)
    }
  )

  server.registerTool(
    'list_templates',
    { description: "List PayNote's built-in payment request templates (bounty, invoice, expense, etc.) with their default amounts." },
    async () => {
      const { ok, data } = await callRoute(templatesHandler, { path: '/api/templates', method: 'GET' })
      return toolResult(ok, data)
    }
  )

  return server
}

const mcpHandler = createMcpHandler(buildServer)

async function verifyAuth(req: NextRequest): Promise<AuthInfo | Response> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer pn_')) {
    return Response.json(
      { error: 'Missing API key. Pass Authorization: Bearer pn_... — get one free at https://paynote.space/docs#auth' },
      { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } }
    )
  }
  const apiKey = authHeader.replace('Bearer ', '')
  const info = await getApiKeyInfo(apiKey)
  if (!info) {
    return Response.json(
      { error: 'Invalid or inactive API key' },
      { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } }
    )
  }
  return {
    token: apiKey,
    clientId: info.name || info.id,
    scopes: ['payments'],
    // PayNote API keys don't expire today; satisfies the SDK's requirement
    // that AuthInfo always carry one. Revisit if that changes.
    expiresAt: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
  }
}

async function handle(req: NextRequest): Promise<Response> {
  const auth = await verifyAuth(req)
  if (auth instanceof Response) return auth
  return mcpHandler.fetch(req, { authInfo: auth })
}

export const GET = handle
export const POST = handle
export const DELETE = handle
