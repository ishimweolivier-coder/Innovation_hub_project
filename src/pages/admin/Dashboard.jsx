import DashboardLayout from '../../components/layout/DashboardLayout'
import StatsCard from '../../components/shared/StatsCard'
import { formatCurrency } from '../../data/constants'
import { useAppData } from '../../context/AppDataContext'
import { Rocket, CheckCircle, XCircle, Users, DollarSign, TrendingUp, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#6b7280']

export default function AdminDashboard() {
  const { adminStats: stats } = useAppData()

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-500 mt-1">Platform overview and key performance metrics</p>
          </div>
          <Link to="/admin/messages" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 self-start">
            <MessageSquare className="w-4 h-4" /> Messages
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatsCard title="Total Startups" value={stats.totalStartups} icon={Rocket} color="primary" />
          <StatsCard title="Approved" value={stats.approvedStartups} icon={CheckCircle} color="green" />
          <StatsCard title="Rejected" value={stats.rejectedStartups} icon={XCircle} color="red" />
          <StatsCard title="Active Investors" value={stats.activeInvestors} icon={Users} color="blue" />
          <StatsCard title="Funding Volume" value={formatCurrency(stats.fundingVolume)} icon={DollarSign} color="purple" />
          <StatsCard title="Success Rate" value={`${stats.successRate}%`} icon={TrendingUp} color="amber" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Monthly Growth</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="startups" fill="#10b981" radius={[6, 6, 0, 0]} name="Startups" />
                <Bar dataKey="funding" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Funding (M RWF)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Startup Categories</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={stats.categoryDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {stats.categoryDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Pending Actions</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link to="/admin/applications" className="p-4 bg-amber-50 rounded-xl border border-amber-100 hover:shadow-md transition-all">
              <p className="text-2xl font-bold text-amber-700">{stats.pendingReview}</p>
              <p className="text-sm text-amber-600 mt-1">Applications to Review</p>
            </Link>
            <Link to="/admin/investors" className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition-all">
              <p className="text-2xl font-bold text-blue-700">{stats.newInvestorRegistrations ?? 0}</p>
              <p className="text-sm text-blue-600 mt-1">New Investor Registrations</p>
            </Link>
            <Link to="/admin/messages" className="p-4 bg-purple-50 rounded-xl border border-purple-100 hover:shadow-md transition-all">
              <p className="text-2xl font-bold text-purple-700">{stats.investmentRequests ?? 0}</p>
              <p className="text-sm text-purple-600 mt-1">Investment Requests</p>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
