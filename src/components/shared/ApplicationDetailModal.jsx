import { X } from 'lucide-react'
import { StatusBadge, AIAssessmentCard, RiskBadge } from './Badges'
import { DocumentCards } from './DocumentCards'
import { formatCurrency } from '../../data/constants'

export default function ApplicationDetailModal({ application, onClose }) {
  if (!application) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100 z-10">
          <div>
            <h3 className="font-display font-bold text-xl text-gray-900">{application.name}</h3>
            <p className="text-sm text-gray-500">Founder: {application.founder}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={application.status} />
            <span className="badge bg-gray-100 text-gray-600">{application.category}</span>
            <span className="text-sm text-gray-500">Submitted {application.createdAt}</span>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{application.description}</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-400">Funding Goal</p>
              <p className="font-semibold text-gray-900">{formatCurrency(application.fundingGoal)}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-400">Budget</p>
              <p className="font-semibold text-gray-900">{formatCurrency(application.budgetAmount)}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-400">Projected Profit</p>
              <p className="font-semibold text-gray-900">{formatCurrency(application.projectedProfit)}</p>
            </div>
          </div>

          {application.aiAssessment && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <RiskBadge level={application.aiAssessment.riskLevel} />
                <span className="text-sm text-primary-600 font-medium">
                  {application.aiAssessment.overallInnovation}% Innovation
                </span>
                <span className="text-sm text-gray-500">ROI: {application.aiAssessment.expectedROI}%</span>
              </div>
              <AIAssessmentCard
                assessment={application.aiAssessment}
                investorMatches={application.investorMatches || []}
              />
            </>
          )}

          <DocumentCards
            applicationId={application.id}
            businessPlanName={application.businessPlan}
            budgetName={application.budget}
          />
        </div>
      </div>
    </div>
  )
}
