import { X, CheckCircle, AlertCircle, Info, Heart, Megaphone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppData } from '../../context/AppDataContext'

const iconMap = {
  approved: CheckCircle,
  opportunity: Info,
  interest: Heart,
  ai: AlertCircle,
  rejected: X,
  announcement: Megaphone,
}

const colorMap = {
  approved: 'text-green-500',
  opportunity: 'text-blue-500',
  interest: 'text-pink-500',
  ai: 'text-purple-500',
  rejected: 'text-red-500',
  announcement: 'text-amber-500',
}

export default function NotificationPanel({ onClose, role }) {
  const { notifications, markNotificationRead } = useAppData()
  const navigate = useNavigate()

  const handleClick = async (notif) => {
    if (!notif.read) {
      try {
        await markNotificationRead(notif.id)
      } catch {
        // ignore
      }
    }
  }

  const handleViewAll = () => {
    onClose()
    navigate(`/${role}/notifications`)
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-4 top-16 z-50 w-96 max-w-[calc(100vw-2rem)] card-elevated animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-6 text-sm text-gray-400 text-center">No notifications yet</p>
          ) : (
            notifications.slice(0, 8).map((notif) => {
              const Icon = iconMap[notif.type] || Info
              return (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => handleClick(notif)}
                  className={`w-full flex gap-3 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left
                    ${!notif.read ? 'bg-primary-50/30' : ''}`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colorMap[notif.type] || 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                  </div>
                  {!notif.read && <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />}
                </button>
              )
            })
          )}
        </div>
        <div className="p-3 text-center border-t border-gray-100">
          <button
            type="button"
            onClick={handleViewAll}
            className="text-sm text-primary-600 font-medium hover:text-primary-700"
          >
            View all notifications
          </button>
        </div>
      </div>
    </>
  )
}
