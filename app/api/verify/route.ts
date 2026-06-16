import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { dispatchWebhooks } from '@/lib/webhooks'

const MAX_RETRIES = 5

async function fetchReceiptWithRetry(txHash: string, attempt = 0): Promise<Record<string, string> | null> {
  try {
    const res = await fetch('https://rpc.testnet.arc.network', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getTransactionReceipt', params: [txHash], id: 1 }),
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    return data.result ?? null
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, 2000 * Math.pow(2, attempt)))
      return fetchReceiptWithRetry(txHash, attempt + 1)
    }
    throw err
  }
}

export async function POST(req: NextRequest) {
  try {
    const { slug, tx_hash } = await req.json()
    if (!slug || !tx_hash) {
      return NextResponse.json({ error: 'slug and tx_hash required' }, { status: 400 })
    }

    const existing = await pool.query('SELECT * FROM payment_requests WHERE slug = $1', [slug])
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Request not found', code: 'NOT_FOUND' }, { status: 404 })
    }
    const req2 = existing.rows[0]
    if (req2.status === 'completed' && req2.tx_hash === tx_hash) {
      return NextResponse.json({ verified: true, updated: false, idempotent: true })
    }

    let receipt: Record<string, string> | null = null
    try {
      receipt = await fetchReceiptWithRetry(tx_hash)
    } catch {
      return NextResponse.json({
        verified: false,
        reason: 'Arc RPC timed out after retries. Transaction may still confirm — retry in 30s.',
        retry: true,
      }, { status: 503 })
    }

    if (!receipt) {
      return NextResponse.json({ verified: false, reason: 'Transaction not found or still pending', retry: true })
    }

    if (receipt['status'] !== '0x1') {
      await pool.query(`UPDATE payment_requests SET status = 'failed' WHERE slug = $1`, [slug])
      return NextResponse.json({ verified: false, reason: 'Transaction failed on chain' })
    }

    const result = await pool.query(
      `UPDATE payment_requests SET status = 'completed', tx_hash = $1, completed_at = now()
       WHERE slug = $2 AND status != 'completed' RETURNING *`,
      [tx_hash, slug]
    )

    if (result.rows.length > 0) {
      dispatchWebhooks('payment.completed', result.rows[0]).catch(console.error)
    }

    const blockNum = parseInt(receipt['blockNumber'], 16)

    // Try to read memo from the transaction (Arc v0.7.2+)
    let onchainMemo: string | null = null
    try {
      const txRes = await fetch('https://rpc.testnet.arc.network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getTransactionByHash', params: [tx_hash], id: 1 }),
        signal: AbortSignal.timeout(5000),
      })
      const txData = await txRes.json()
      if (txData.result?.input && txData.result.input !== '0x') {
        // Attempt to decode memo from input data
        const hex = txData.result.input.slice(2)
        try {
          onchainMemo = Buffer.from(hex, 'hex').toString('utf8').replace(/[^ -~]/g, '').trim() || null
        } catch { onchainMemo = null }
      }
    } catch { /* memo read is best-effort */ }

    return NextResponse.json({
      verified: true,
      updated: result.rows.length > 0,
      block: blockNum,
      onchain_memo: onchainMemo,
    })

  } catch (err) {
    console.error('Verify error:', err)
    return NextResponse.json({ error: 'Server error', retry: true }, { status: 500 })
  }
}
