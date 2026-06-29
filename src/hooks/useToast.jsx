import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { Check, Info, X } from 'lucide-react'

const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const id = useRef(0)

  const toast = useCallback((title, desc, kind = 'success') => {
    const t = { id: ++id.current, title, desc, kind }
    setToasts((prev) => [...prev, t])
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3600)
  }, [])

  const remove = (tid) => setToasts((prev) => prev.filter((x) => x.id !== tid))

  const icons = {
    success: { Icon: Check, bg: 'var(--accent-soft)', c: 'var(--accent)' },
    info: { Icon: Info, bg: 'var(--brand-soft)', c: 'var(--brand-600)' },
  }

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="toasts">
        {toasts.map((t) => {
          const { Icon, bg, c } = icons[t.kind] || icons.success
          return (
            <div className="toast" key={t.id}>
              <div className="toast__icon" style={{ background: bg, color: c }}>
                <Icon size={17} />
              </div>
              <div style={{ flex: 1 }}>
                <b>{t.title}</b>
                {t.desc && <span>{t.desc}</span>}
              </div>
              <button className="icon-btn btn--sm" style={{ width: 28, height: 28, border: 'none' }} onClick={() => remove(t.id)}>
                <X size={15} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastCtx.Provider>
  )
}
