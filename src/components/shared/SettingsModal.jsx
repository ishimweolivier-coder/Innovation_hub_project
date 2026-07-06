import { X, User, Mail, Shield, KeyRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function SettingsModal({ onClose, role }) {
  const { user } = useAuth()
  const roleLabel = role === 'entrepreneur' ? 'Entrepreneur' : role === 'investor' ? 'Investor' : 'Administrator'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Account Settings</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
              {user?.avatar || 'U'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.fullName}</p>
              <p className="text-sm text-gray-500">{roleLabel}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm text-gray-800">{user?.email}</p>
              </div>
            </div>
            {user?.company && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Company</p>
                  <p className="text-sm text-gray-800">{user.company}</p>
                </div>
              </div>
            )}
            {user?.phone && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <Shield className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm text-gray-800">{user.phone}</p>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/forgot-password"
            onClick={onClose}
            className="btn-secondary w-full text-sm inline-flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" /> Change Password
          </Link>
        </div>
      </div>
    </div>
  )
}
