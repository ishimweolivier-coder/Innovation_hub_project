import { Link } from 'react-router-dom'
import { Search, DollarSign, TrendingUp, Heart, ArrowRight, MessageSquare } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatsCard from '../../components/shared/StatsCard'
import { StatusBadge } from '../../components/shared/Badges'
import { formatCurrency } from '../../data/constants'
import { useAppData } from '../../context/AppDataContext'
import { useStartups } from '../../context/StartupContext'
import { useAuth } from '../../context/AuthContext'

export default function InvestorDashboard() {
  const { applications } = useStartups()
  const { investments, conversations } = useAppData()
  const { user } = useAuth()
  const seekingFunding = applications.filter(s => s.stage >= 3 && s.aiAssessment)
  const myInvestments = investments.filter(i => i.investor === user?.fullName)
  const totalInvested = myInvestments.reduce((sum, i) => sum + (i.amount || 0), 0)
  const interestsSent = conversations.length

  return (
    <DashboardLayout role="investor">
      <div className="space-y-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">Investor Dashboard</h2>
          <p className="text-gray-500 mt-1">Discover and invest in Rwanda&apos;s most promising startups</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Available Startups" value={seekingFunding.length} icon={Search} color="primary" />
          <StatsCard title="My Investments" value={myInvestments.length} icon={DollarSign} color="green" />
          <StatsCard title="Total Invested" value={formatCurrency(totalInvested)} icon={TrendingUp} color="blue" />
          <StatsCard title="Interests Sent" value={interestsSent} icon={Heart} color="purple" />
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 className="font-semibold text-gray-900 text-lg">Featured Startups</h3>
            <div className="flex gap-2">
              <Link to="/investor/messages" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100">
                <MessageSquare className="w-4 h-4" /> Messages
              </Link>
              <Link to="/investor/startups" className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seekingFunding.slice(0, 3).map((startup) => (
              <Link key={startup.id} to={`/investor/startups/${startup.id}`} className="card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                <div className="relative h-28 overflow-hidden">
                  <img src={startup.image} alt={startup.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                  <span className="absolute bottom-2 left-3 badge bg-white/20 text-white backdrop-blur-sm text-xs">{startup.category}</span>
                </div>
                <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-display font-bold text-gray-900 group-hover:text-primary-700 transition-colors">{startup.name}</h4>
                  <StatusBadge status={startup.status} />
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{startup.description}</p>
                {startup.aiAssessment && (
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-sm">
                    <span className="text-primary-600 font-semibold">{startup.aiAssessment.overallInnovation}% Innovation</span>
                    <span className="text-gray-400">ROI: {startup.aiAssessment.expectedROI}%</span>
                  </div>
                )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Investments</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Startup</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {myInvestments.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-50">
                    <td className="py-3 font-medium text-gray-900">{inv.startup}</td>
                    <td className="py-3">{formatCurrency(inv.amount)}</td>
                    <td className="py-3 text-gray-500">{inv.date}</td>
                    <td className="py-3"><span className="badge bg-green-100 text-green-700">{inv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
