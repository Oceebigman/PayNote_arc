import { NextResponse } from 'next/server'

export async function GET() {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'PayNote API',
      version: '1.0.0',
      description: 'Payment coordination infrastructure on Arc Network. Non-custodial USDC payment requests, verification, and webhooks.',
      contact: { url: 'https://paynote.space', email: 'ikeocee@gmail.com' },
      license: { name: 'MIT' },
    },
    servers: [{ url: 'https://paynote.space', description: 'Production (Arc Testnet)' }],
    security: [{ BearerAuth: [] }],
    components: {
      securitySchemes: {
        BearerAuth: { type: 'http', scheme: 'bearer', description: 'API key prefixed with pn_' }
      },
      schemas: {
        PaymentRequest: {
          type: 'object',
          properties: {
            slug: { type: 'string', example: 'k8Xm2pQn' },
            url: { type: 'string', example: 'https://paynote.space/r/k8Xm2pQn' },
            amount: { type: 'number', example: 50 },
            token: { type: 'string', enum: ['USDC','EURC','cirBTC'], example: 'USDC' },
            status: { type: 'string', enum: ['pending','completed','failed','expired'] },
            expires_at: { type: 'string', format: 'date-time', nullable: true },
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            code: { type: 'string' },
            detail: { type: 'string', nullable: true },
            docs: { type: 'string' },
          }
        }
      }
    },
    paths: {
      '/api/keys/request': {
        post: {
          summary: 'Self-serve API key generation',
          description: 'Generate your API key instantly. No account required.',
          security: [],
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['email','use_case'], properties: { email: { type: 'string' }, project_name: { type: 'string' }, use_case: { type: 'string' } } } } }
          },
          responses: {
            '200': { description: 'API key generated', content: { 'application/json': { schema: { type: 'object', properties: { key: { type: 'string' }, prefix: { type: 'string' }, message: { type: 'string' } } } } } },
            '400': { description: 'Missing fields', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
          }
        }
      },
      '/api/request': {
        post: {
          summary: 'Create payment request',
          description: 'Create a payment request and get a shareable URL.',
          tags: ['Payments'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['amount','reason','to_address'],
                  properties: {
                    amount: { type: 'number', minimum: 0.000001, description: 'Payment amount' },
                    reason: { type: 'string', minLength: 3, description: 'Description of the payment' },
                    to_address: { type: 'string', pattern: '^0x[0-9a-fA-F]{40}$', description: 'Recipient wallet address' },
                    token: { type: 'string', enum: ['USDC','EURC','cirBTC'], default: 'USDC' },
                    note: { type: 'string', description: 'Optional message for payer' },
                    expires_in: { type: 'number', description: 'Expiry in seconds' },
                    recurring: { type: 'string', enum: ['once','daily','weekly','monthly','yearly'], default: 'once' },
                    display_name: { type: 'string', description: 'Your name or business' },
                  }
                },
                example: { amount: 50, reason: 'Freelance invoice #003', to_address: '0xYourAddress', token: 'USDC' }
              }
            }
          },
          responses: {
            '201': { description: 'Request created', content: { 'application/json': { schema: { '$ref': '#/components/schemas/PaymentRequest' } } } },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            '429': { description: 'Rate limit exceeded' },
          }
        }
      },
      '/api/agent/pay': {
        post: {
          summary: 'Agent-optimised payment request',
          description: 'Creates a payment request with full agent instruction set and ERC-8183 response headers.',
          tags: ['Agent API'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/PaymentRequest' } } }
          },
          responses: {
            '201': {
              description: 'Agent payment request created',
              headers: {
                'X-ERC8183-Version': { schema: { type: 'string' } },
                'X-ERC8183-Intent-ID': { schema: { type: 'string' } },
                'X-ERC8183-Pay-URL': { schema: { type: 'string' } },
                'X-ERC8183-Poll-URL': { schema: { type: 'string' } },
              },
              content: {
                'application/json': {
                  schema: {
                    allOf: [{ '$ref': '#/components/schemas/PaymentRequest' }],
                    properties: {
                      instructions: {
                        type: 'object',
                        properties: {
                          pay_url: { type: 'string' },
                          poll_url: { type: 'string' },
                          verify_url: { type: 'string' },
                          receipt_url: { type: 'string' },
                          x402_url: { type: 'string' },
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/poll': {
        get: {
          summary: 'Check payment status',
          description: 'Lightweight status check. No authentication required.',
          tags: ['Payments'],
          security: [],
          parameters: [{ name: 'slug', in: 'query', required: true, schema: { type: 'string' } }],
          responses: {
            '200': {
              description: 'Payment status',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', enum: ['pending','completed','failed','expired'] },
                      tx_hash: { type: 'string', nullable: true },
                      completed_at: { type: 'string', format: 'date-time', nullable: true },
                      amount: { type: 'number' },
                      token: { type: 'string' },
                    }
                  }
                }
              }
            },
            '404': { description: 'Not found' },
            '429': { description: 'Rate limit exceeded' },
          }
        }
      },
      '/api/x402': {
        get: {
          summary: 'x402 payment gateway',
          description: 'Returns HTTP 402 with payment details for x402-compatible agents. Retrying with X-PAYMENT header and valid EIP-3009 authorization grants access.',
          tags: ['Agent API', 'x402'],
          security: [],
          parameters: [{ name: 'slug', in: 'query', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'Payment verified. Access granted.' },
            '402': {
              description: 'Payment required',
              headers: {
                'X-Payment-Required': { schema: { type: 'string', example: 'true' } },
                'X-Payment-Scheme': { schema: { type: 'string', example: 'exact' } },
                'X-Payment-Amount': { schema: { type: 'string' } },
                'X-Payment-Asset': { schema: { type: 'string' } },
                'X-Payment-Pay-URL': { schema: { type: 'string' } },
              }
            },
            '404': { description: 'Slug not found' },
          }
        }
      },
      '/api/webhooks': {
        post: {
          summary: 'Register webhook',
          description: 'Register an HTTPS endpoint to receive payment events. Payloads are HMAC-SHA256 signed.',
          tags: ['Webhooks'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['url','secret'],
                  properties: {
                    url: { type: 'string', format: 'uri' },
                    secret: { type: 'string', description: 'Used to sign payloads' },
                    events: { type: 'array', items: { type: 'string', enum: ['payment.created','payment.completed','payment.failed','payment.expired'] } }
                  }
                }
              }
            }
          },
          responses: { '200': { description: 'Webhook registered' } }
        }
      },
      '/api/verify': {
        post: {
          summary: 'Verify payment on-chain',
          description: 'Verifies a transaction against Arc RPC. Updates payment status. Fires webhooks. Retries automatically on timeout.',
          tags: ['Payments'],
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['slug','tx_hash'], properties: { slug: { type: 'string' }, tx_hash: { type: 'string' } } } } }
          },
          responses: {
            '200': { description: 'Verification result', content: { 'application/json': { schema: { type: 'object', properties: { verified: { type: 'boolean' }, updated: { type: 'boolean' }, block: { type: 'number' }, retry: { type: 'boolean' }, onchain_memo: { type: 'string', nullable: true } } } } } },
            '503': { description: 'Arc RPC timeout — retry in 30 seconds' }
          }
        }
      }
    }
  }

  return new Response(JSON.stringify(spec, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Cache-Control': 'public, max-age=300',
    }
  })
}
