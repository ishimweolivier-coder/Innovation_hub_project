import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { StatusBadge, ProgressBar } from '../../components/shared/Badges'
import { AIAssessmentCard } from '../../components/shared/Badges'
import { DocumentCards } from '../../components/shared/DocumentCards'
import { STARTUP_STAGES, formatCurrency } from '../../data/constants'
import { useAuth } from '../../context/AuthContext'
import { useStartups } from '../../context/StartupContext'
import { CheckCircle, Circle } from 'lucide-react'

export default function ApplicationStatus() {
  const { user } = useAuth()
  const { getMyStartup } = useStartups()
  const myStartup = getMyStartup(user?.id)

  if (!myStartup) {
    return (
      <DashboardLayout role="entrepreneur">
        <div className="max-w-4xl mx-auto text-center py-16">
          <h2 className="font-display text-2xl font-bold text-gray-900">Application Status</h2>
          <p className="text-gray-500 mt-4">You haven&apos;t submitted an application yet.</p>
          <Link to="/entrepreneur/apply" className="btn-primary mt-6 inline-flex">Submit Application</Link>
        </div>
      </DashboardLayout>
    )
  }

  const currentStage = myStartup.stage

  return (
    <DashboardLayout role="entrepreneur">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">Application Status</h2>
          <p className="text-gray-500 mt-1">Track your startup through every stage of the program</p>
        </div>

        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-xl">{myStartup.name}</h3>
              <p className="text-sm text-gray-500">{myStartup.category} · Submitted {myStartup.createdAt}</p>
            </div>
            <StatusBadge status={myStartup.status} />
          </div>

          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {STARTUP_STAGES.map((stage, i) => {
                const stageNum = i + 1
                const isComplete = stageNum < currentStage
                const isCurrent = stageNum === currentStage
                return (
                  <div key={stage} className="flex items-start gap-4 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10
                      ${isComplete ? 'bg-primary-600 text-white' : isCurrent ? 'bg-primary-100 text-primary-700 ring-4 ring-primary-100' : 'bg-gray-100 text-gray-400'}`}>
                      {isComplete ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </div>
                    <div className={`flex-1 pb-2 ${isCurrent ? '' : 'opacity-60'}`}>
                      <p className={`font-semibold ${isCurrent ? 'text-primary-700' : 'text-gray-700'}`}>{stage}</p>
                      {isCurrent && (
                        <p className="text-sm text-gray-500 mt-1">
                          {stageNum === 1 && 'Application submitted — pending AI evaluation'}
                          {stageNum === 2 && 'AI evaluation complete — awaiting administrator review'}
                          {stageNum === 3 && 'Congratulations! Your startup has been approved'}
                          {stageNum === 4 && 'You are currently in the incubation program'}
                          {stageNum === 5 && `Funding goal: ${formatCurrency(myStartup.fundingGoal)} · Raised: ${formatCurrency(myStartup.fundingRaised)}`}
                          {stageNum === 6 && 'Funding secured — your startup is scaling'}
                          {stageNum === 7 && 'Congratulations! You have graduated from the program'}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {currentStage >= 5 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Funding Progress</span>
                <span className="font-semibold">{Math.round((myStartup.fundingRaised / myStartup.fundingGoal) * 100)}%</span>
              </div>
              <ProgressBar value={myStartup.fundingRaised} max={myStartup.fundingGoal} color="green" />
            </div>
          )}
        </div>

        <AIAssessmentCard assessment={myStartup.aiAssessment} investorMatches={myStartup.investorMatches || []} />

        {myStartup.id && (
          <DocumentCards
            applicationId={myStartup.id}
            businessPlanName={myStartup.businessPlan}
            budgetName={myStartup.budget}
          />
        )}

        {!myStartup.aiAssessment && (
          <div className="text-center">
            <Link to="/entrepreneur/apply" className="btn-primary">Submit Application for AI Evaluation</Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
