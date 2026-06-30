import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, BellRing, CalendarClock, Check, CheckCheck, Info, Star, Trash2, Trophy } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { useNotificationsStore } from '../../stores/notificationsStore'
import type { LocalNotification, LocalNotificationType } from '../../types/local'

type NotificationFilter = 'ALL' | 'UNREAD' | LocalNotificationType

const notificationFilters: Array<{ label: string; value: NotificationFilter }> = [
  { label: 'Toutes', value: 'ALL' },
  { label: 'Non lues', value: 'UNREAD' },
  { label: 'Matchs', value: 'MATCH' },
  { label: 'Favoris', value: 'FAVORITE' },
  { label: 'Tournoi', value: 'TOURNAMENT' },
  { label: 'Système', value: 'SYSTEM' },
]

const typeLabels: Record<LocalNotificationType, string> = {
  MATCH: 'Match',
  FAVORITE: 'Favori',
  TOURNAMENT: 'Tournoi',
  SYSTEM: 'Système',
}

function NotificationIcon({ type }: { type: LocalNotificationType }) {
  const Icon = {
    MATCH: CalendarClock,
    FAVORITE: Star,
    TOURNAMENT: Trophy,
    SYSTEM: Info,
  }[type]

  return <Icon size={20} aria-hidden="true" />
}

function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function sortByMostRecent(first: LocalNotification, second: LocalNotification) {
  return new Date(second.sentAt).getTime() - new Date(first.sentAt).getTime()
}

export function NotificationsPage() {
  const notifications = useNotificationsStore((state) => state.notifications)
  const unreadCount = useNotificationsStore((state) => state.unreadCount())
  const markAsRead = useNotificationsStore((state) => state.markAsRead)
  const markAsUnread = useNotificationsStore((state) => state.markAsUnread)
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead)
  const removeNotification = useNotificationsStore((state) => state.removeNotification)
  const clearRead = useNotificationsStore((state) => state.clearRead)
  const [filter, setFilter] = useState<NotificationFilter>('ALL')

  const filteredNotifications = useMemo(
    () =>
      [...notifications]
        .filter((notification) => {
          if (filter === 'UNREAD') {
            return !notification.isRead
          }

          return filter === 'ALL' || notification.type === filter
        })
        .sort(sortByMostRecent),
    [filter, notifications],
  )

  return (
    <section className="page-section notifications-page">
      <div className="page-heading">
        <span>
          <Bell size={16} aria-hidden="true" />
          Notifications
        </span>
        <h1>Centre de notifications</h1>
        <p>Retrouvez vos alertes de matchs, favoris, tournoi et informations système.</p>
      </div>

      <div className="notification-toolbar">
        <div>
          <strong>{unreadCount}</strong>
          <span>{unreadCount > 1 ? 'notifications non lues' : 'notification non lue'}</span>
        </div>
        <div className="notification-toolbar__actions">
          <Button type="button" variant="secondary" onClick={markAllAsRead}>
            Tout marquer lu
          </Button>
          <Button type="button" variant="ghost" onClick={clearRead}>
            Nettoyer les lues
          </Button>
        </div>
      </div>

      <div className="segmented-control" aria-label="Filtrer les notifications">
        {notificationFilters.map((item) => (
          <button
            className={filter === item.value ? 'segmented-control__item active' : 'segmented-control__item'}
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filteredNotifications.length === 0 ? (
        <EmptyState
          title="Aucune notification"
          message="Les alertes de matchs, favoris et tournoi apparaîtront ici."
        />
      ) : (
        <div className="notification-list">
          {filteredNotifications.map((notification) => (
            <article
              className={notification.isRead ? 'notification-card' : 'notification-card notification-card--unread'}
              key={notification.id}
            >
              <div className="notification-card__icon">
                {notification.isRead ? <NotificationIcon type={notification.type} /> : <BellRing size={20} aria-hidden="true" />}
              </div>

              <div className="notification-card__body">
                <div className="notification-card__meta">
                  <span>{typeLabels[notification.type]}</span>
                  <time dateTime={notification.sentAt}>{formatNotificationDate(notification.sentAt)}</time>
                </div>
                <h2>{notification.title}</h2>
                <p>{notification.message}</p>
                {notification.targetLink ? (
                  <Link to={notification.targetLink} onClick={() => markAsRead(notification.id)}>
                    Ouvrir
                  </Link>
                ) : null}
              </div>

              <div className="notification-card__actions">
                <button
                  type="button"
                  onClick={() => notification.isRead ? markAsUnread(notification.id) : markAsRead(notification.id)}
                  aria-label={notification.isRead ? 'Marquer comme non lue' : 'Marquer comme lue'}
                >
                  <Check size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => removeNotification(notification.id)}
                  aria-label="Supprimer la notification"
                >
                  <Trash2 size={17} aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {unreadCount === 0 && notifications.length > 0 ? (
        <div className="notification-done">
          <CheckCheck size={18} aria-hidden="true" />
          Toutes les notifications sont lues.
        </div>
      ) : null}
    </section>
  )
}
