import { notFound } from 'next/navigation'
import pool from '@/lib/db'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function WidgetPage({ params }: Props) {
  const { slug } = await params
  const result = await pool.query('SELECT * FROM payment_requests WHERE slug = $1', [slug])
  if (result.rows.length === 0) notFound()
  const req = result.rows[0]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paynote.space'
  const token = req.token || 'USDC'
  const isCompleted = req.status === 'completed'

  return (
    <html>
      <head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>PayNote — {req.reason}</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Montserrat', -apple-system, sans-serif; background: transparent; }
          .widget { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; max-width: 360px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .banner { background: linear-gradient(135deg, #0B194F, #1A44C4); padding: 20px; }
          .banner-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #93c5fd; margin-bottom: 8px; }
          .banner-amount { font-size: 32px; font-weight: 700; color: #fff; }
          .banner-token { font-size: 14px; color: #93c5fd; margin-left: 6px; }
          .banner-reason { font-size: 13px; color: #bfdbfe; margin-top: 4px; }
          .body { padding: 16px; }
          .address-label { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #9ca3af; margin-bottom: 4px; }
          .address { font-size: 11px; font-family: monospace; color: #6b7280; word-break: break-all; background: #f9fafb; border-radius: 8px; padding: 8px; margin-bottom: 12px; }
          .btn { display: block; width: 100%; padding: 12px; background: linear-gradient(135deg, #102A83, #1A44C4); color: #fff; font-size: 14px; font-weight: 700; text-align: center; text-decoration: none; border-radius: 10px; margin-bottom: 8px; cursor: pointer; border: none; }
          .btn:hover { opacity: 0.9; }
          .btn-completed { background: #16a34a; cursor: default; }
          .powered { font-size: 10px; color: #d1d5db; text-align: center; }
          .powered a { color: #6b7280; text-decoration: none; }
        `}</style>
      </head>
      <body>
        <div className="widget">
          <div className="banner">
            <div className="banner-label">Payment Request</div>
            <div>
              <span className="banner-amount">{(Number(req.amount) < 0.01 && token !== 'cirBTC') ? Number(req.amount).toPrecision(6) : Number(req.amount).toFixed(token === 'cirBTC' ? 8 : 2)}</span>
              <span className="banner-token">{token}</span>
            </div>
            <div className="banner-reason">{req.reason}</div>
          </div>
          <div className="body">
            <div className="address-label">Send to</div>
            <div className="address">{req.to_address}</div>
            {isCompleted ? (
              <div className="btn btn-completed">Payment Completed</div>
            ) : (
              <a href={`${appUrl}/r/${slug}`} target="_blank" rel="noopener noreferrer" className="btn">
                Pay {(Number(req.amount) < 0.01 && token !== 'cirBTC') ? Number(req.amount).toPrecision(6) : Number(req.amount).toFixed(token === 'cirBTC' ? 8 : 2)} {token}
              </a>
            )}
            <div className="powered">
              Powered by <a href={appUrl} target="_blank" rel="noopener noreferrer">PayNote</a> · Built on Arc
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
