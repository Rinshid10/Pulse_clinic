import { motion } from 'framer-motion'

/* Scroll-triggered reveal. Wrap any block; children fade+rise into view. */
export function Reveal({ children, delay = 0, y = 24, as = 'div', ...rest }) {
  const M = motion[as] || motion.div
  return (
    <M
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 0.8, 0.2, 1] }}
      {...rest}
    >
      {children}
    </M>
  )
}

/* Container that staggers its <Stagger.Item> children. */
export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}
export const staggerItem = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 0.8, 0.2, 1] } },
}
