import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react'
import StatsCard from '../../components/shared/StatsCard'
import { formatCurrency } from '../../data/constants'
import api from '../../services/api'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function GrowthTracking() {
  const [growth, setGrowth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getGrowthData()
      .then(setGrowth)
      .catch(() => setGrowth(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <DashboardLayout role="entrepreneur">
        <div className="text-center py-16 text-gray-400">Loading growth data...</div>
      </DashboardLayout>
    )
  }

  if (!growth) {
    return (
      <DashboardLayout role="entrepreneur">
        <div className="text-center py-16">
          <p className="text-gray-500">Submit an application to track your startup growth.</p>
        </div>
      </DashboardLayout>
    )
  }

  const metrics = growth.metrics || []
  const milestones = growth.milestones || []
  const latest = metrics[metrics.length - 1] || { revenue: 0, users: 0 }
  const projected = metrics.find((m) => m.month === 'Projected') || latest

  return (
    <DashboardLayout role="entrepreneur">
      <div className="space-y-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">Growth Tracking</h2>
          <p className="text-gray-500 mt-1">{growth.startupName} — live metrics from your application</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Funding Raised" value={formatCurrency(growth.fundingRaised)} icon={DollarSign} color="green" />
          <StatsCard title="Funding Goal" value={formatCurrency(growth.fundingGoal)} icon={Target} color="purple" />
          <StatsCard title="Projected Revenue" value={formatCurrency(projected.revenue)} icon={TrendingUp} color="primary" />
          <StatsCard title="Stage" value={`${growth.stage}/7`} icon={Users} color="blue" />
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Revenue Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={metrics}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Program Milestones</h3>
          <div className="space-y-4">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${m.done ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {m.done ? '✓' : i + 1}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${m.done ? 'text-gray-900' : 'text-gray-500'}`}>{m.title}</p>
                </div>
                {m.done && <span className="badge bg-green-100 text-green-700">Completed</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
