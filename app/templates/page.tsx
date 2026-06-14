import pool from '@/lib/db'
import TemplatesClient from './TemplatesClient'

export default async function TemplatesPage() {
  const result = await pool.query('SELECT * FROM templates ORDER BY category')
  return <TemplatesClient templates={result.rows} />
}
