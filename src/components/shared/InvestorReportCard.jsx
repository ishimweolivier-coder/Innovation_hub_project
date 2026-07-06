import { FileText, Lightbulb, AlertTriangle, TrendingUp } from 'lucide-react'
import { ScoreRing, RiskBadge } from './Badges'
import { formatCurrency } from '../../data/constants'

export default function InvestorReportCard({ startup, assessment }) {
  if (!assessment) {
    return (
      <div className="card p-6 text-center text-gray-500 text-sm">
        Evaluation report not available yet for this startup.
      </div>
    )
  }

  const invalid = assessment.documentsValid === false

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            Business Idea Report — {startup.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            AI analysis of uploaded documents and application data for investor review
          </p>
        </div>
        {!invalid && (
          <span className="badge bg-primary-100 text-primary-700 shrink-0">
            Innovation {assessment.overallInnovation}%
          </span>
        )}
      </div>

      {invalid ? (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-800">
          Documents did not pass validation. Request the entrepreneur to re-submit a real business plan and budget.
        </div>
      ) : (
        <>
          {assessment.aiSummary && (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Executive summary</p>
              <p className="text-sm text-gray-700 leading-relaxed">{assessment.aiSummary}</p>
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4">
            <ScoreRing score={assessment.marketUniqueness} size={72} label="Market" />
            <ScoreRing score={assessment.productUniqueness} size={72} label="Product" />
            <ScoreRing score={assessment.overallInnovation} size={72} label="Innovation" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4 py-4 border-y border-gray-100">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <RiskBadge level={assessment.riskLevel} />
              <p className="text-xs text-gray-500 mt-2">Risk score: {assessment.riskScore}/100</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="font-bold text-gray-900">{formatCurrency(assessment.expectedProfit)}</p>
              <p className="text-xs text-gray-500 mt-1">Projected profit</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="font-bold text-primary-600 text-xl">{assessment.expectedROI}%</p>
              <p className="text-xs text-gray-500 mt-1">Expected ROI</p>
            </div>
          </div>

          {assessment.investorAdvice && (
            <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-100">
              <p className="font-semibold text-indigo-900 flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4" /> Investor advice
              </p>
              <p className="text-sm text-indigo-900/90 leading-relaxed whitespace-pre-line">{assessment.investorAdvice}</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <p className="font-medium text-emerald-900 flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" /> Funding context
              </p>
              <p className="text-gray-600">Goal: {formatCurrency(startup.fundingGoal)}</p>
              <p className="text-gray-600">Raised: {formatCurrency(startup.fundingRaised)}</p>
              <p className="text-gray-600">Category: {startup.category}</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
              <p className="font-medium text-amber-900 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" /> Due diligence note
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Verify document claims in meetings. Review the business plan and budget files below before committing capital.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
