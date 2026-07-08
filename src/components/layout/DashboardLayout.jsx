import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, TrendingUp, Bell, Briefcase,
  Users, Settings, LogOut, Menu, X, Search,
  BarChart3, Calendar, DollarSign, ClipboardCheck, Megaphone,
  Building2, ChevronLeft, ChevronRight, MessageSquare, Brain,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import NotificationPanel from '../shared/NotificationPanel'
import SettingsModal from '../shared/SettingsModal'

const entrepreneurNav = [
  { path: '/entrepreneur', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/entrepreneur/apply', icon: FileText, label: 'Submit Application' },
  { path: '/entrepreneur/status', icon: ClipboardCheck, label: 'Application Status' },
  { path: '/entrepreneur/opportunities', icon: Briefcase, label: 'Opportunities' },
  { path: '/entrepreneur/growth', icon: TrendingUp, label: 'Growth Tracking' },
  { path: '/entrepreneur/ai-evaluation', icon: Brain, label: 'AI Evaluation' },
  { path: '/entrepreneur/events', icon: Calendar, label: 'News & Events' },
  { path: '/entrepreneur/messages', icon: MessageSquare, label: 'Messages' },
]

const investorNav = [
  { path: '/investor', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/investor/startups', icon: Search, label: 'Browse Startups' },
  { path: '/investor/funded', icon: DollarSign, label: 'Funded Startups' },
  { path: '/investor/reports', icon: BarChart3, label: 'Reports' },
  { path: '/investor/events', icon: Calendar, label: 'News & Events' },
  { path: '/investor/messages', icon: MessageSquare, label: 'Messages' },
]

const adminNav = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/applications', icon: FileText, label: 'Review Applications' },
  { path: '/admin/users', icon: Users, label: 'Manage Users' },
  { path: '/admin/investors', icon: Building2, label: 'Manage Investors' },
  { path: '/admin/opportunities', icon: Briefcase, label: 'Opportunities' },
  { path: '/admin/grant-applications', icon: ClipboardCheck, label: 'Grant Applications' },
  { path: '/admin/events', icon: Calendar, label: 'Events' },
  { path: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
  { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { path: '/admin/messages', icon: MessageSquare, label: 'Messages' },
]

export default function DashboardLayout({ children, role }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const { conversations, notifications } = useAppData()
  const navItems = role === 'entrepreneur' ? entrepreneurNav : role === 'investor' ? investorNav : adminNav
  const roleLabel = role === 'entrepreneur' ? 'Entrepreneur' : role === 'investor' ? 'Investor' : 'Administrator'
  const messagesPath = `/${role}/messages`
  const unreadMessages = conversations.reduce((sum, c) => sum + c.unread, 0)
  const unreadNotifications = notifications.filter((n) => !n.read).length

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const closePanels = () => {
    setNotifOpen(false)
    setSettingsOpen(false)
  }

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <Link to="/" className="flex-shrink-0">
          <img src="/logo.svg" alt="Innovation Hub" className="w-10 h-10 rounded-xl shadow-lg shadow-black/20 bg-white" />
        </Link>
        {sidebarOpen && (
          <div>
            <Link to="/" className="font-display font-bold text-white hover:text-amber-300 transition-colors">Innovation Hub</Link>
            <span className="block text-xs text-amber-300/90 font-medium">{roleLabel} Portal</span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const isMessages = item.path.includes('/messages')
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-white/15 text-white shadow-lg shadow-black/10 border border-white/10'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-amber-300' : ''}`} />
              {sidebarOpen && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {isMessages && unreadMessages > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-900 text-xs font-bold flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <button
          type="button"
          onClick={() => { setSettingsOpen(true); setNotifOpen(false) }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white w-full"
        >
          <Settings className="w-5 h-5" />
          {sidebarOpen && <span>Settings</span>}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 w-full"
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar — indigo/slate theme */}
      <aside
        className={`hidden lg:flex flex-col relative transition-all duration-300
          bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950
          border-r border-indigo-900/50 shadow-xl
          ${sidebarOpen ? 'w-64' : 'w-20'}`}
      >
        <SidebarContent />
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-24 w-6 h-6 bg-indigo-800 border border-indigo-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-indigo-700 z-10"
        >
          {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-72 flex flex-col shadow-2xl animate-slide-up bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950">
            <button type="button" className="absolute top-4 right-4 p-1 text-white" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button type="button" className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-display font-bold text-lg text-gray-900">
                  {navItems.find((n) => n.path === location.pathname)?.label || 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Messages button */}
              <Link
                to={messagesPath}
                onClick={closePanels}
                className="relative inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium
                  bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Messages</span>
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-900 text-xs font-bold flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => { setNotifOpen(!notifOpen); setSettingsOpen(false) }}
                className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-gray-200">
                <div className="hidden sm:flex items-center gap-2 mr-1">
                  <img src="/logo.svg" alt="" className="w-7 h-7 rounded-md shadow-sm" />
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                  {user?.avatar || 'U'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">{roleLabel}</p>
                </div>
              </div>
            </div>
          </div>

          {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} role={role} />}
          {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} role={role} />}
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
