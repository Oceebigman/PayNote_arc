import { NextRequest, NextResponse } from 'next/server'

interface KnowledgeEntry {
  keywords: string[]
  response: string
}

// Escalation topics — ALWAYS checked first. Never try to answer these
// with rule-based matching. Route the person to a human.
const ESCALATION_KEYWORDS = [
  // Missing funds — cover many phrasings, all serious
  'missing funds', 'lost money', 'lost payment', 'missing payment',
  "didn't receive", 'never received', 'never arrived', "hasn't arrived",
  "didn't arrive", "didn't come", 'never showed up', 'no payment received',
  'money is missing', 'payment is missing', 'where is my payment',
  'where is my money', 'not received', 'have not received', "haven't received",
  // Security
  'hacked', 'compromised', 'security breach', 'stolen', 'unauthorized access',
  // Disputes and refunds
  'dispute', 'chargeback', 'refund',
  // Fraud / scam
  'fraud', 'scam', 'scammed',
  // Wallet access issues
  'lost wallet', 'forgot seed', "can't access wallet", "can't access my wallet", 'access wallet', 'wallet access', 'locked out of wallet', 'wallet is locked', 'locked out',
  'lost my seed', 'lost seed phrase',
]

const ESCALATION_RESPONSE =
  "That sounds like something that needs direct attention — I don't want to give you " +
  "a rule-based answer for something serious. Please email ikeocee@gmail.com with " +
  "the details and someone will get back to you personally."

const GREETING_WORDS = ['hi', 'hello', 'hey', 'gm', 'yo', 'sup', 'howdy']
const GREETING_RESPONSE =
  "Hi! I'm Penny, PayNote's support assistant. I can help with API keys, creating " +
  "payment requests, webhooks, tokens, x402, ERC-8183, verification, receipts, and " +
  "more. What are you working on?"

const KNOWLEDGE: KnowledgeEntry[] = [
  {
    keywords: ['api key', 'get key', 'authenticate', 'auth', 'bearer', 'how to sign up'],
    response:
      "Get a free API key at /docs#auth — no signup required. POST to /api/keys/request " +
      "with a JSON body containing email, use_case, and project_name. You'll get back a " +
      "key that starts with pn_. Use it as Authorization: Bearer <key> on /api/agent/pay " +
      "and /api/request/[id].",
  },
  {
    keywords: ['create request', 'create payment', 'payment request', 'how to create', 'invoice', 'new request'],
    response:
      "Two ways: the homepage form for humans, or POST /api/request for programmatic use. " +
      "Required fields: amount, reason, to_address. Optional: token (USDC/EURC/cirBTC), " +
      "note, expires_in seconds, display_name, signature, recurring. Full example at " +
      "/docs#create.",
  },
  {
    keywords: ['python', 'sdk-python', 'python sdk'],
    response:
      "Python SDK is in the repo at sdk-python/ and paynote-python-sdk/. Or use the raw " +
      "API — see /docs#python for a curl-to-python translation. All you need is the " +
      "requests library and a bearer token.",
  },
  {
    keywords: ['javascript', 'js sdk', 'npm', 'node', 'typescript'],
    response:
      "JavaScript/TypeScript SDK is on npm as @egcrypt/paynote-sdk. Or just call fetch() " +
      "directly — the API is small enough that a wrapper isn't strictly necessary. See " +
      "/docs#javascript for examples.",
  },
  {
    keywords: ['webhook', 'callback', 'notification'],
    response:
      "Register a webhook via POST /api/webhooks with url, secret, and events (array). " +
      "PayNote signs every delivery with HMAC-SHA256 using your secret — verify the " +
      "X-PayNote-Signature header before trusting the payload. See /docs#webhooks for " +
      "the events list and verification example.",
  },
  {
    keywords: ['token', 'supported tokens', 'usdc', 'eurc', 'cirbtc', 'what tokens', 'stablecoin'],
    response:
      "Currently supported: USDC (native gas token on Arc), EURC (Euro stablecoin), " +
      "and cirBTC (Circle's tokenized Bitcoin). USYC and QCAD are listed but not yet " +
      "enabled. All contract addresses are in /docs#contracts.",
  },
  {
    keywords: ['x402', 'http 402', '402 protocol'],
    response:
      "x402 is an HTTP-native payment protocol. Hit /api/x402?slug=<request-slug> and " +
      "you'll get an HTTP 402 with a full body describing payment requirements plus " +
      "X-Payment-* response headers. Agents can discover payment terms this way. Note: " +
      "settlement via signed X-PAYMENT header is still WIP — check /docs#x402.",
  },
  {
    keywords: ['erc-8183', 'erc8183', '8183', 'agent api', 'agent payment'],
    response:
      "ERC-8183 is the agent payment intent standard. Every response from /api/agent/pay " +
      "carries X-ERC8183-* headers and an erc8183 block in the JSON body. Pass a " +
      "notify_url to fire a callback to your consumer agent when the request is created. " +
      "Full details at /docs#agent.",
  },
  {
    keywords: ['verify', 'verification', 'onchain check', 'confirm payment'],
    response:
      "POST /api/verify with slug and tx_hash. PayNote hits the Arc RPC with 5x " +
      "exponential retry (2s, 4s, 8s, 16s, 32s), verifies the receipt status, and " +
      "updates the payment. Idempotent — same slug + tx_hash returns { verified: true, " +
      "idempotent: true } without re-processing.",
  },
  {
    keywords: ['poll', 'status', 'check status', 'is it paid'],
    response:
      "GET /api/poll?slug=<slug> — no auth required. Returns status, tx_hash, " +
      "completed_at, amount, and token. Rate-limited to 120 requests per minute per " +
      "IP. Also lazily marks expired requests as 'expired' when past their deadline.",
  },
  {
    keywords: ['metamask', 'wallet connect', 'wallet not connecting', 'connect wallet'],
    response:
      "Make sure MetaMask is on Arc Testnet (Chain ID 0x4cef52, RPC " +
      "https://rpc.testnet.arc.network). If the pay page doesn't detect your wallet, " +
      "check the browser console for provider errors and refresh. USDC is the native " +
      "gas token on Arc — you'll pay gas in USDC.",
  },
  {
    keywords: ['pending', 'stuck', 'not confirming', 'not showing'],
    response:
      "Arc RPC has some lag after tx broadcast. Give it 30 seconds and poll again. If " +
      "still pending after a minute, check the tx hash on https://testnet.arcscan.app " +
      "directly — if it's confirmed there but PayNote shows pending, POST to " +
      "/api/verify to force a re-check.",
  },
  {
    keywords: ['insufficient', 'no funds', 'need testnet', 'faucet', 'testnet usdc'],
    response:
      "Get testnet USDC from https://faucet.circle.com — select Arc Testnet and paste " +
      "your wallet address. Usually credits within a minute.",
  },
  {
    keywords: ['receipt', 'proof of payment', 'download receipt'],
    response:
      "Every completed payment gets a permanent receipt at /receipt/<id>. Downloadable " +
      "as HTML via /api/receipt/<id>. Receipts include the tx hash, amount, sender, " +
      "recipient, and any note or memo attached.",
  },
  {
    keywords: ['error', 'error code', 'what does this mean'],
    response:
      "PayNote uses structured error codes: INVALID_AMOUNT, INVALID_ADDRESS, " +
      "INVALID_TOKEN, EXPIRED, NOT_FOUND, RATE_LIMITED, UNAUTHORIZED. Each response " +
      "has an error field with the code and a human-readable message. If you're seeing " +
      "one that isn't obvious, share the exact response and I can help decode it.",
  },
  {
    keywords: ['non-custodial', 'custody', 'do you hold', 'security', 'safe'],
    response:
      "PayNote is fully non-custodial. We never hold, store, or control funds. Every " +
      "payment is a direct ERC-20 transfer from the payer's wallet to the recipient's " +
      "wallet. PayNote only coordinates the request and verifies onchain settlement. " +
      "Nothing to hack, nothing to lose.",
  },
  {
    keywords: ['contract', 'router', 'contract address', 'deployed'],
    response:
      "PayNote's routers are on Arc Testnet: v1 at 0x829fe116E221d14Db289623028c5AC6b2F30BD82, " +
      "v2 (multi-asset, splits) at 0xc7190DBb23861b7dB15eED4326eBa33B0eeacEa4. Token " +
      "addresses and Arc precompiles are documented at /docs#contracts.",
  },
  {
    keywords: ['openapi', 'spec', 'api spec', 'documentation'],
    response:
      "Full OpenAPI 3.0 spec at /api-spec — importable into Postman, Insomnia, or " +
      "any code generator. Human-friendly docs at /docs.",
  },
  {
    keywords: ['status page', 'is it down', 'uptime', 'system status'],
    response:
      "Live system status at /status — shows Arc RPC latency, DB health, and PayNote " +
      "API state. If something looks wrong there, the outage is usually already known.",
  },
  {
    keywords: ['signed intent', 'signature', 'eip-191', 'eip191', 'sign request'],
    response:
      "You can attach an EIP-191 signature to a payment request to prove the intended " +
      "recipient authorized it. Sign a deterministic message with the recipient's " +
      "wallet, POST it as the signature field. PayNote recovers the signer and shows " +
      "a 'verified' badge on the pay page. See /docs#signed.",
  },
]

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ')
}

function isGreeting(message: string): boolean {
  const n = normalize(message)
  if (GREETING_WORDS.includes(n)) return true
  return GREETING_WORDS.some(g => n.startsWith(g + ' ') || n.startsWith(g + ','))
}

function matchesEscalation(message: string): boolean {
  const n = normalize(message)
  return ESCALATION_KEYWORDS.some(k => n.includes(normalize(k)))
}

function matchKnowledge(message: string): KnowledgeEntry | null {
  const n = normalize(message)
  for (const entry of KNOWLEDGE) {
    if (entry.keywords.some(k => n.includes(normalize(k)))) return entry
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message = body?.message
    if (!message || typeof message !== 'string' || message.length > 2000) {
      return NextResponse.json(
        { error: 'message required (string, max 2000 chars)' },
        { status: 400 }
      )
    }

    // Escalation always wins — check first
    if (matchesEscalation(message)) {
      return NextResponse.json({ response: ESCALATION_RESPONSE, escalated: true })
    }

    // Greetings
    if (isGreeting(message)) {
      return NextResponse.json({ response: GREETING_RESPONSE })
    }

    // Knowledge base
    const match = matchKnowledge(message)
    if (match) {
      return NextResponse.json({ response: match.response })
    }

    // Fallback — suggest common topics
    return NextResponse.json({
      response:
        "I don't have a specific answer for that. I can help with API keys, creating " +
        "payment requests, webhooks, supported tokens, x402, ERC-8183, verification, " +
        "receipts, or MetaMask connection issues — try asking about one of those. Or " +
        "email ikeocee@gmail.com if you need direct help.",
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
