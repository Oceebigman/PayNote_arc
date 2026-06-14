# PayNote

**Non-custodial payment coordination infrastructure on Arc Network.**

Live at [paynote.space](https://paynote.space) | [Docs](https://paynote.space/docs) | [API Spec](https://paynote.space/api-spec)

---

## What PayNote Does

PayNote solves a fundamental gap in the Arc ecosystem: how does a person or AI agent get paid in USDC without accounts, KYC, or custodial intermediaries?

**Human flow:** Create a request, share a link, payer connects wallet, settles on Arc in under a second, receipt generated on-chain.

**Agent flow:** POST to /api/agent/pay, receive full instruction set with x402 and ERC-8183 endpoints, another agent pays autonomously via HTTP 402 protocol, webhook fires confirmation.

Non-custodial means PayNote never holds funds. Every payment is a direct ERC-20 transfer from payer wallet to recipient wallet.

---

## Deployed Contracts (Arc Testnet)

| Contract | Address |
|---|---|
| PayNoteRouter | 0x829fe116E221d14Db289623028c5AC6b2F30BD82 |
| PayNoteRouterV2 | 0xc7190DBb23861b7dB15eED4326eBa33B0eeacEa4 |

View on ArcScan: https://testnet.arcscan.app

---

## Supported Tokens

| Token | Contract | Decimals |
|---|---|---|
| USDC | 0x3600000000000000000000000000000000000000 | 6 |
| EURC | 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a | 6 |
| cirBTC | 0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF | 8 |

---

## Quick Start

Get an API key (self-serve, no signup required):

    curl -X POST https://paynote.space/api/keys/request
      -H "Content-Type: application/json"
      -d '{"email":"you@email.com","use_case":"My project","project_name":"My App"}'

Create a payment request:

    curl -X POST https://paynote.space/api/request
      -H "Authorization: Bearer pn_your_key"
      -H "Content-Type: application/json"
      -d '{"amount":50,"reason":"Invoice 003","to_address":"0xYourWallet","token":"USDC"}'

Agent API with ERC-8183 and x402:

    curl -X POST https://paynote.space/api/agent/pay
      -H "Authorization: Bearer pn_your_key"
      -H "Content-Type: application/json"
      -d '{"amount":10,"reason":"Task completed","to_address":"0xYourWallet","token":"USDC","notify_url":"https://agentb.server/incoming-payments"}'

x402 agent-to-agent payment endpoint:

    curl https://paynote.space/api/x402?slug=YOUR_SLUG
    Returns HTTP 402 with full payment details in body and headers.
    Agent signs EIP-3009, retries with X-PAYMENT header, receives 200.

Poll for payment status (no auth needed):

    curl https://paynote.space/api/poll?slug=YOUR_SLUG

Agent discovery manifest:

    curl https://paynote.space/.well-known/payment-manifest.json

---

## Standards Implemented

| Standard | Status | Description |
|---|---|---|
| ERC-8183 | Live | Agent payment intent headers on every /api/agent/pay response |
| x402 | Live | HTTP 402 gateway with full payment body and headers |
| EIP-3009 | Partial | x402 authorization (full signature verification in progress) |
| EIP-191 | Live | Signed payment intents with verified badge on pay page |
| HMAC-SHA256 | Live | Webhook payload signing with 5x exponential retry |

---

## SDKs

JavaScript and TypeScript:

    npm install @egcrypt/paynote-sdk

    import PayNote from '@egcrypt/paynote-sdk'
    const sdk = new PayNote()
    const request = await sdk.createRequest({
      amount: 50,
      reason: 'Invoice 003',
      toAddress: '0xYourWallet',
      token: 'USDC',
    })
    console.log(request.url)
    const result = await sdk.waitForPayment(request.slug)
    console.log(result.txHash)

Python SDK is in the sdk-python folder of this repo.

    pip install requests

---

## Architecture

    Human or Agent
         |
         v
    POST /api/agent/pay
         |
         v
    PayNote Server stores intent, returns instruction set
    (pay_url, poll_url, x402_url, receipt_url, ERC-8183 headers)
    Fires notify_url to Agent B immediately if provided
         |
         v
    Agent B hits /api/x402
         |
         v
    HTTP 402 with full payment details in body and headers
         |
         v
    Agent B signs EIP-3009 offchain (zero gas)
    Retries with X-PAYMENT header
         |
         v
    HTTP 200 - payment confirmed
    PayNote verifies on Arc RPC (5x retry with exponential backoff)
         |
         v
    Webhook fires to all registered endpoints
    Receipt generated at /receipt/[id]

---

## Infrastructure

| Layer | Technology |
|---|---|
| Blockchain | Arc Network (L1) |
| Server | Next.js 16, Ubuntu 24.04, PM2 |
| Database | PostgreSQL |
| Proxy | Nginx with Next.js Middleware |
| Standards | ERC-8183, x402, EIP-3009, EIP-191 |

---

## API Endpoints

| Endpoint | Auth | Description |
|---|---|---|
| POST /api/agent/pay | Bearer token | Create agent payment request |
| POST /api/request | Bearer token | Create human payment request |
| GET /api/poll?slug=X | None | Check payment status |
| POST /api/verify | None | Verify on Arc RPC |
| GET /api/x402?slug=X | None | x402 payment gateway |
| POST /api/webhooks | None | Register webhook endpoint |
| POST /api/keys/request | None | Self-serve API key generation |
| GET /api-spec | None | OpenAPI 3.0 specification |
| GET /.well-known/payment-manifest.json | None | Agent discovery manifest |

Full reference: https://paynote.space/docs
OpenAPI spec: https://paynote.space/api-spec

---

## Live Stats

- 119 completed payments on Arc Testnet
- 29 API routes
- 12 languages supported
- System status: https://paynote.space/status

---

## Built By

GR3AT - Arc Architects Program

paynote.space | ikeocee@gmail.com
