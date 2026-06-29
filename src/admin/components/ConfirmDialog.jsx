import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { Button } from './ui'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="ad-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel}>
          <motion.div
            className="ad-modal ad-confirm"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.24, ease: [0.22, 0.8, 0.2, 1] }}
          >
            <div className="ad-confirm__icon" style={{ background: danger ? 'var(--ad-red-soft)' : 'var(--ad-amber-soft)', color: danger ? 'var(--ad-red)' : 'var(--ad-amber)' }}>
              <AlertTriangle size={28} />
            </div>
            <h3>{title}</h3>
            <p>{message}</p>
            <div className="ad-confirm__foot">
              <Button variant="ghost" onClick={onCancel}>Cancel</Button>
              <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
