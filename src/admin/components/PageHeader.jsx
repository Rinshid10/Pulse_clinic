import { motion } from 'framer-motion'

export default function PageHeader({ title, subtitle, children }) {
  return (
    <motion.div
      className="ad-page-head"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 0.8, 0.2, 1] }}
    >
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{children}</div>}
    </motion.div>
  )
}
