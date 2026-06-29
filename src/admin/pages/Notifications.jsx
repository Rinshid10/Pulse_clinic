import { motion } from 'framer-motion'
import { Bell, Calendar, XCircle, Plane, Settings, CheckCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { Button, EmptyState } from '../components/ui'
import { useStore } from '../hooks/useStore'
import { useToast } from '../hooks/useToast'
import * as svc from '../services/notificationService'

const META = {
  booking: { Icon: Calendar, cls: 'i-brand' },
  cancel: { Icon: XCircle, cls: 'i-red' },
  leave: { Icon: Plane, cls: 'i-violet' },
  system: { Icon: Settings, cls: 'i-amber' },
}

export default function Notifications() {
  const toast = useToast()
  const [list, refresh] = useStore(() => svc.listNotifications(), [])
  const unread = list.filter((n) => !n.read).length

  const readOne = (id) => { svc.markRead(id); refresh() }
  const readAll = () => { svc.markAllRead(); toast('All caught up', 'Marked everything as read'); refresh() }

  return (
    <>
      <PageHeader title="Notifications" subtitle={`${unread} unread`}>
        <Button variant="ghost" onClick={readAll} disabled={!unread}><CheckCheck size={16} /> Mark all read</Button>
      </PageHeader>

      <div className="ad-card">
        <div className="ad-card__body" style={{ padding: list.length ? 12 : 0 }}>
          {list.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications yet." />
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {list.map((n, i) => {
                const { Icon, cls } = META[n.type] || META.system
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                    onClick={() => readOne(n.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                      background: n.read ? 'transparent' : 'var(--ad-surface-2)',
                      border: '1px solid', borderColor: n.read ? 'var(--ad-border)' : 'var(--ad-brand-soft)',
                    }}
                  >
                    <span className={`ad-stat__icon ${cls}`} style={{ width: 40, height: 40 }}><Icon size={18} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ fontSize: 14 }}>{n.title}</b>
                      <div className="ad-muted" style={{ fontSize: 13 }}>{n.body}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span className="ad-muted" style={{ fontSize: 12 }}>{n.time}</span>
                      {!n.read && <div style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--ad-brand)', marginLeft: 'auto', marginTop: 6 }} />}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
