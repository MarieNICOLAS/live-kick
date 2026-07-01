import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LocalNotification, LocalNotificationType } from '../types/local'

type CreateNotificationInput = {
  title: string
  message: string
  type: LocalNotificationType
  targetLink?: string
}

type NotificationsState = {
  notifications: LocalNotification[]
  unreadCount: () => number
  addNotification: (notification: CreateNotificationInput) => void
  markAsRead: (id: string) => void
  markAsUnread: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearRead: () => void
}

const initialNotifications: LocalNotification[] = [
  {
    id: 'welcome-livekick',
    title: 'Bienvenue dans LiveKick',
    message: 'Suivez les matchs, classements, favoris et prédictions depuis votre espace de suivi.',
    type: 'SYSTEM',
    isRead: false,
    sentAt: '2026-06-30T08:30:00.000Z',
    targetLink: '/',
  },
  {
    id: 'next-live-reminders',
    title: 'Rappels de match disponibles',
    message: 'Activez une alerte 1 h ou 5 min avant les prochains coups d’envoi depuis la page Direct.',
    type: 'MATCH',
    isRead: false,
    sentAt: '2026-06-30T09:00:00.000Z',
    targetLink: '/live',
  },
  {
    id: 'standings-updated',
    title: 'Classements enrichis',
    message: 'Les groupes affichent désormais les positions, qualifications, buts et points avec une aide de lecture.',
    type: 'TOURNAMENT',
    isRead: false,
    sentAt: '2026-06-30T09:30:00.000Z',
    targetLink: '/groups',
  },
]

function createNotificationId() {
  return `notification-${Date.now()}-${Math.round(Math.random() * 100_000)}`
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: initialNotifications,
      unreadCount: () => get().notifications.filter((notification) => !notification.isRead).length,
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: createNotificationId(),
              isRead: false,
              sentAt: new Date().toISOString(),
            },
            ...state.notifications,
          ],
        })),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id ? { ...notification, isRead: true } : notification,
          ),
        })),
      markAsUnread: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id ? { ...notification, isRead: false } : notification,
          ),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({ ...notification, isRead: true })),
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((notification) => notification.id !== id),
        })),
      clearRead: () =>
        set((state) => ({
          notifications: state.notifications.filter((notification) => !notification.isRead),
        })),
    }),
    {
      name: 'livekick-notifications',
      partialize: ({ notifications }) => ({ notifications }),
    },
  ),
)
