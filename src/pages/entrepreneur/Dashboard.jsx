import { Link, useNavigate } from 'react-router-dom'
import { FileText, TrendingUp, Briefcase, Bell, ArrowRight, Clock, MessageSquare, Brain } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatsCard from '../../components/shared/StatsCard'
import { AIAssessmentCard } from '../../components/shared/Badges'
import { StatusBadge } from '../../components/shared/Badges'
import { useAppData } from '../../context/AppDataContext'
import { useAuth } from '../../context/AuthContext'
import { useStartups } from '../../context/StartupContext'

export default function EntrepreneurDashboard() {
  const { user } = useAuth()
  const { getMyStartup, loading } = useStartups()
  const { opportunities, notifications, markNotificationRead } = useAppData()
  const navigate = useNavigate()
  const myStartup = getMyStartup(user?.id)
  const unreadNotifs = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <DashboardLayout role="entrepreneur">
        <div className="text-center py-16 text-gray-400">Loading your dashboard...</div>
      </DashboardLayout>
    )
  }

  if (!myStartup) {
    return (
      <DashboardLayout role="entrepreneur">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900">
              Welcome, {user?.fullName?.split(' ')[0] || 'Innovator'}!
            </h2>
            <p className="text-gray-500 mt-1">Get started by submitting your startup application</p>
          </div>
          <div className="card p-10 text-center">
            <FileText className="w-12 h-12 text-primary-400 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 text-lg">No application yet</h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Submit your startup idea, business plan, and budget to unlock AI evaluation and investor matching.
            </p>
            <Link to="/entrepreneur/apply" className="btn-primary mt-6 inline-flex">
              Submit Application <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {opportunities.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Latest Opportunities</h3>
              <div className="space-y-3">
                {opportunities.slice(0, 3).map((opp) => (
                  <Link key={opp.id} to="/entrepreneur/opportunities" className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{opp.title}</p>
                      <p className="text-xs text-gray-400">{opp.type} · Deadline: {opp.deadline}</p>
                    </div>
                    <span className="badge bg-primary-100 text-primary-700">{opp.type}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="entrepreneur">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Innovator'}!
            </h2>
            <p className="text-gray-500 mt-1">Here&apos;s an overview of your startup journey</p>
          </div>
          <div className="flex flex-wrap gap-3 self-start">
            <Link to="/entrepreneur/messages" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 transition-colors">
              <MessageSquare className="w-4 h-4" /> Messages
            </Link>
            <Link to="/entrepreneur/ai-evaluation" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-100">
              <Brain className="w-4 h-4" /> AI Report
            </Link>
            <Link to="/entrepreneur/apply" className="btn-primary text-sm">
              <FileText className="w-4 h-4" /> New Application
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Application Status" value={myStartup.status} icon={FileText} color="primary" />
          <StatsCard title="Innovation Score" value={`${myStartup.aiAssessment?.overallInnovation || '—'}%`} icon={TrendingUp} color="green" />
          <StatsCard title="Investor Matches" value={myStartup.investorMatches?.length || 0} icon={Briefcase} color="blue" />
          <StatsCard title="Notifications" value={unreadNotifs} icon={Bell} color="amber" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">My Startup</h3>
              <StatusBadge status={myStartup.status} />
            </div>
            <h4 className="font-display font-bold text-xl text-gray-900">{myStartup.name}</h4>
            <p className="text-sm text-gray-500 mt-1">{myStartup.category}</p>
            <p className="text-gray-600 text-sm mt-3 leading-relaxed">{myStartup.description}</p>
            <Link to="/entrepreneur/status" className="inline-flex items-center gap-1 text-sm text-primary-600 font-medium mt-4 hover:gap-2 transition-all">
              View full status <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <AIAssessmentCard assessment={myStartup.aiAssessment} investorMatches={myStartup.investorMatches || []} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Notifications</h3>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-400">No notifications yet</p>
              ) : (
                notifications.slice(0, 3).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={async () => {
                      if (!n.read) await markNotificationRead(n.id).catch(() => {})
                      navigate('/entrepreneur/notifications')
                    }}
                    className={`w-full flex gap-3 p-3 rounded-xl text-left hover:shadow-sm transition-all ${!n.read ? 'bg-primary-50/50' : 'bg-gray-50'}`}
                  >
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-700">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Latest Opportunities</h3>
            <div className="space-y-3">
              {opportunities.slice(0, 3).map((opp) => (
                <Link key={opp.id} to="/entrepreneur/opportunities" className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{opp.title}</p>
                    <p className="text-xs text-gray-400">{opp.type} · Deadline: {opp.deadline}</p>
                  </div>
                  <span className="badge bg-primary-100 text-primary-700">{opp.type}</span>
                </Link>
              ))}
            </div>
            <Link to="/entrepreneur/opportunities" className="inline-flex items-center gap-1 text-sm text-primary-600 font-medium mt-4">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
