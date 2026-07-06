import { Bell, CheckCheck } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'

const typeColors = {
  approved: 'bg-green-100 text-green-700',
  opportunity: 'bg-blue-100 text-blue-700',
  interest: 'bg-pink-100 text-pink-700',
  ai: 'bg-purple-100 text-purple-700',
  rejected: 'bg-red-100 text-red-700',
  announcement: 'bg-amber-100 text-amber-700',
}

export default function Notifications({ role }) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppData()
  const { showToast } = useToast()
  const unread = notifications.filter((n) => !n.read).length

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead()
      showToast('All notifications marked as read', 'success')
    } catch {
      showToast('Failed to update notifications', 'error')
    }
  }

  const handleClick = async (notif) => {
    if (!notif.read) {
      try {
        await markNotificationRead(notif.id)
      } catch {
        showToast('Failed to mark as read', 'error')
      }
    }
  }

  return (
    <DashboardLayout role={role}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-7 h-7 text-primary-600" /> Notifications
            </h2>
            <p className="text-gray-500 mt-1">{unread} unread</p>
          </div>
          {unread > 0 && (
            <button type="button" onClick={handleMarkAll} className="btn-secondary text-sm">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="card p-12 text-center text-gray-400">No notifications yet</div>
          ) : (
            notifications.map((notif) => (
              <button
                key={notif.id}
                type="button"
                onClick={() => handleClick(notif)}
                className={`card p-5 w-full text-left hover:shadow-md transition-all
                  ${!notif.read ? 'border-l-4 border-l-primary-500' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className={`text-sm ${!notif.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">{notif.time}</p>
                  </div>
                  <span className={`badge text-xs ${typeColors[notif.type] || 'bg-gray-100 text-gray-600'}`}>
                    {notif.type}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
