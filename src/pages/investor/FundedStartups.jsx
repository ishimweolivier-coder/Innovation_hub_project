import DashboardLayout from '../../components/layout/DashboardLayout'
import { StatusBadge } from '../../components/shared/Badges'
import { ProgressBar } from '../../components/shared/Badges'
import { formatCurrency } from '../../data/constants'
import { useAppData } from '../../context/AppDataContext'
import { useStartups } from '../../context/StartupContext'
import { TrendingUp } from 'lucide-react'

export default function FundedStartups() {
  const { applications } = useStartups()
  const { investments } = useAppData()
  const funded = applications.filter(s => ['Funded', 'Graduated'].includes(s.status))

  return (
    <DashboardLayout role="investor">
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">Funded Startups</h2>
          <p className="text-gray-500 mt-1">Track performance of startups you&apos;ve invested in</p>
        </div>

        <div className="grid gap-4">
          {funded.map((startup) => {
            const investment = investments.find(i => i.startup === startup.name || i.startupId === startup.id)
            return (
              <div key={startup.id} className="card p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display font-bold text-lg text-gray-900">{startup.name}</h3>
                      <StatusBadge status={startup.status} />
                    </div>
                    <p className="text-sm text-gray-500">{startup.category} · {startup.founder}</p>
                    {investment && (
                      <p className="text-sm text-primary-600 font-medium mt-2">
                        Your investment: {formatCurrency(investment.amount)}
                      </p>
                    )}
                  </div>
                  {startup.aiAssessment && (
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary-600">{startup.aiAssessment.expectedROI}%</p>
                        <p className="text-xs text-gray-500">Expected ROI</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-bold">+28%</span>
                        </div>
                        <p className="text-xs text-gray-500">Growth</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <ProgressBar value={startup.fundingRaised} max={startup.fundingGoal} color="green" />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>{formatCurrency(startup.fundingRaised)} raised</span>
                    <span>Goal: {formatCurrency(startup.fundingGoal)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
