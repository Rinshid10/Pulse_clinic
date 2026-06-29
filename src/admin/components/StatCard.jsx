import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ icon: Icon, tone = 'brand', value, label, trend, up, index = 0 }) {
  return (
    <motion.div
      className="ad-card ad-stat"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 0.8, 0.2, 1] }}
    >
      <div className="ad-stat__top">
        <div className={`ad-stat__icon i-${tone}`}>
          <Icon />
        </div>
        {trend != null && (
          <span className={`ad-trend ${up ? 'up' : 'down'}`}>
            {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {trend}
          </span>
        )}
      </div>
      <div className="ad-stat__value">{value}</div>
      <div className="ad-stat__label">{label}</div>
    </motion.div>
  )
}
