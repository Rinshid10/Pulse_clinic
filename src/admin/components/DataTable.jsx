import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'
import { EmptyState } from './ui'

/* Reusable table.
   columns: [{ key, header, render?(row), width? }]
   rows: array of objects with an `id`. */
export default function DataTable({ columns, rows, empty = 'Nothing to show here.' }) {
  if (!rows.length) {
    return (
      <div className="ad-card">
        <EmptyState icon={Inbox} title={empty} />
      </div>
    )
  }
  return (
    <div className="ad-card">
      <div className="ad-tablewrap">
        <table className="ad-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} style={c.width ? { width: c.width } : undefined}>{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.025, 0.3) }}
              >
                {columns.map((c) => (
                  <td key={c.key} data-label={typeof c.header === 'string' ? c.header : ''}>{c.render ? c.render(row) : row[c.key]}</td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
