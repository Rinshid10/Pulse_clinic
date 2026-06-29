import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Info, X, AlertTriangle } from 'lucide-react'

const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

const ICONS = {
  success: { Icon: Check, cls: 'ok' },
  info: { Icon: Info, cls: 'info' },
  warn: { Icon: AlertTriangle, cls: 'warn' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const seq = useRef(0)

  const toast = useCallback((title, desc, kind = 'success') => {
    const id = ++seq.current
    setToasts((t) => [...t, { id, title, desc, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600)
  }, [])

  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id))

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="ad-toasts">
        <AnimatePresence>
          {toasts.map((t) => {
            const { Icon, cls } = ICONS[t.kind] || ICONS.success
            return (
              <motion.div
                key={t.id}
                className="ad-toast"
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.9 }}
                transition={{ duration: 0.28, ease: [0.22, 0.8, 0.2, 1] }}
              >
                <span className={`ad-toast__icon ${cls}`}><Icon size={16} /></span>
                <div className="ad-toast__body">
                  <b>{t.title}</b>
                  {t.desc && <span>{t.desc}</span>}
                </div>
                <button className="ad-toast__close" onClick={() => remove(t.id)}><X size={15} /></button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}
