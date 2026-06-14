export const ERRORS = {
  INVALID_AMOUNT:     { code: 'INVALID_AMOUNT',     message: 'Amount must be a positive number', status: 400 },
  INVALID_ADDRESS:    { code: 'INVALID_ADDRESS',     message: 'to_address must be a valid 0x Ethereum address', status: 400 },
  MISSING_FIELDS:     { code: 'MISSING_FIELDS',      message: 'Required fields missing: amount, reason, to_address', status: 400 },
  INVALID_TOKEN:      { code: 'INVALID_TOKEN',       message: 'Token not supported. Use USDC, EURC, or cirBTC', status: 400 },
  NOT_FOUND:          { code: 'NOT_FOUND',           message: 'Payment request not found', status: 404 },
  ALREADY_COMPLETED:  { code: 'ALREADY_COMPLETED',   message: 'Payment request already completed', status: 409 },
  EXPIRED:            { code: 'EXPIRED',             message: 'Payment request has expired', status: 410 },
  UNAUTHORIZED:       { code: 'UNAUTHORIZED',        message: 'Valid API key required. Get one at paynote.space/docs#auth', status: 401 },
  RATE_LIMITED:       { code: 'RATE_LIMITED',        message: 'Too many requests. Please slow down.', status: 429 },
  RPC_TIMEOUT:        { code: 'RPC_TIMEOUT',         message: 'Arc RPC timed out. Transaction may still confirm — retry in 30s', status: 503 },
  SERVER_ERROR:       { code: 'SERVER_ERROR',        message: 'Internal server error', status: 500 },
}

export function errorResponse(error: typeof ERRORS[keyof typeof ERRORS], detail?: string) {
  const { NextResponse } = require('next/server')
  return NextResponse.json(
    { error: error.message, code: error.code, detail: detail || undefined, docs: 'https://paynote.space/docs' },
    { status: error.status }
  )
}
