import { notFound } from 'next/navigation'
import pool from '@/lib/db'
import ReceiptClient from './ReceiptClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ReceiptPage({ params }: Props) {
  const { id } = await params

  const result = await pool.query(
    `SELECT * FROM payment_requests WHERE id::text = $1 OR slug = $1`,
    [id]
  )

  if (result.rows.length === 0) notFound()
  const req = result.rows[0]

  if (req.status !== 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full">
          <div className="w-12 h-12 rounded-full bg-yellow-50 border border-yellow-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p className="font-bold text-gray-900 mb-1">No receipt yet</p>
          <p className="text-gray-400 text-sm">This payment hasn't been completed yet. Receipt will be available after payment is confirmed on-chain.</p>
        </div>
      </div>
    )
  }

  return <ReceiptClient req={{
    id: req.id,
    slug: req.slug,
    amount: String(req.amount),
    reason: req.reason,
    note: req.note || '',
    to_address: req.to_address,
    sender_address: req.sender_address || '',
    tx_hash: req.tx_hash,
    created_at: req.created_at,
    completed_at: req.completed_at,
    status: req.status,
    token: req.token || 'USDC',
  }} />
}
