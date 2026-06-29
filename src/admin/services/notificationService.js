import * as store from '../../services/clinicStore'

export const listNotifications = () => store.getNotifications()
export const addNotification = (n) => store.addNotification(n)
export const markRead = (id) => store.markNotificationRead(id)
export const markAllRead = () => store.markAllNotificationsRead()
export const unreadCount = () => store.getNotifications().filter((n) => !n.read).length
