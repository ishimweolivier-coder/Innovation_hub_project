import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { formatCurrency } from '../../data/constants'
import { useAppData } from '../../context/AppDataContext'
import { useStartups } from '../../context/StartupContext'
import { useAuth } from '../../context/AuthContext'
import ReportHub from '../../components/reports/ReportHub'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import {
  generatePlatformSummaryReport,
  generateApplicationsReport,
  generateFundingReport,
  generateInvestorActivityReport,
  generateAiEvaluationReport,
  generateUsersReport,
  generateEntrepreneurReport,
  generateFacilitationReport,
} from '../../utils/reportDocument'
import {
  buildApplicationsReport,
  buildFundingReport,
  buildInvestorReport,
  buildAiReport,
  buildFacilitationReport,
} from '../../utils/exportReport'
import api from '../../services/api'

export default function Reports() {
  const { adminStats: stats, investments, investors, conversations, users } = useAppData()
  const { applications } = useStartups()
  const { user } = useAuth()
  const [facilitation, setFacilitation] = useState(null)

  useEffect(() => {
    api.getFacilitationTracking()
      .then(setFacilitation)
      .catch(() => setFacilitation(null))
  }, [])

  const approvalRate = stats.totalStartups > 0
    ? Math.round((stats.approvedStartups / stats.totalStartups) * 100)
    : 0

  const reportOptions = [
    {
      id: 'platform',
      title: 'Platform Summary Report',
      description: 'Full platform analytics — startups, funding, growth trends',
      adminOnly: true,
      generate: () => generatePlatformSummaryReport(stats, user),
    },
    {
      id: 'applications',
      title: 'Startup Applications Report',
      description: 'All entrepreneur applications with status and AI scores',
      generate: () => generateApplicationsReport(applications, user),
      csvExport: () => buildApplicationsReport(applications),
    },
    {
      id: 'facilitation',
      title: 'Investor Connection & Facilitation Report',
      description: 'Tracks how Innovation Hub connects investors with entrepreneurs — from AI match and interest to messaging and funding',
      adminOnly: true,
      generate: async () => {
        const data = await api.getFacilitationTracking()
        generateFacilitationReport(data, user)
      },
      csvExport: async () => {
        const data = await api.getFacilitationTracking()
        buildFacilitationReport(data)
      },
    },
    {
      id: 'entrepreneur',
      title: 'Individual Entrepreneur Report',
      description: 'Detailed profile, AI evaluation, investor matches & communication journey for one startup',
      requiresStartup: true,
      generate: async (startup) => {
        const tracking = await api.getFacilitationTracking(startup.id)
        generateEntrepreneurReport(startup, user, 'admin', tracking)
      },
    },
    {
      id: 'funding',
      title: 'Funding & Investment Report',
      description: 'Investment volumes, disbursements, and financial summary',
      adminOnly: true,
      generate: () => generateFundingReport(investments, stats, user),
      csvExport: () => buildFundingReport(investments, stats),
    },
    {
      id: 'investors',
      title: 'Investor Activity Report',
      description: 'Investor registry and engagement metrics',
      adminOnly: true,
      generate: () => generateInvestorActivityReport(investors, conversations, user),
      csvExport: () => buildInvestorReport(investors, conversations),
    },
    {
      id: 'ai',
      title: 'AI Evaluation Report',
      description: 'AI scores, risk analysis, ROI predictions & platform communication facilitation metrics',
      generate: async () => {
        const tracking = await api.getFacilitationTracking()
        generateAiEvaluationReport(applications, user, tracking)
      },
      csvExport: () => buildAiReport(applications),
    },
    {
      id: 'users',
      title: 'User Registry Report',
      description: 'Complete directory of all platform users by role',
      adminOnly: true,
      generate: () => generateUsersReport(users, user),
    },
  ]

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-500 mt-1">Generate official reports with logo, signatures, and stamp space</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Startups', value: stats.totalStartups },
            { label: 'Approval Rate', value: `${approvalRate}%` },
            { label: 'Total Funding', value: formatCurrency(stats.fundingVolume) },
            { label: 'Success Rate', value: `${stats.successRate}%` },
          ].map((s, i) => (
            <div key={i} className="card p-5 text-center">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {facilitation?.summary && (
          <div className="card p-6 bg-gradient-to-r from-emerald-50 to-primary-50 border border-primary-100">
            <h3 className="font-display font-bold text-lg text-gray-900">Platform Facilitation Impact</h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{facilitation.summary.platformNarrative}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
              {[
                { label: 'Communication Ongoing', value: facilitation.summary.ongoingCommunications ?? 0 },
                { label: 'Funding In Progress', value: facilitation.summary.fundingInProgress ?? 0 },
                { label: 'Deals Completed', value: facilitation.summary.completedDeals ?? 0 },
                { label: 'Messages Exchanged', value: facilitation.summary.totalMessages ?? 0 },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-4 text-center border border-primary-100">
                  <p className="text-xl font-bold text-primary-700">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Funding Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="funding" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Startup Registrations</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="startups" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <ReportHub
          role="admin"
          reportOptions={reportOptions}
          applications={applications}
          showStartupPicker
        />
      </div>
    </DashboardLayout>
  )
}
