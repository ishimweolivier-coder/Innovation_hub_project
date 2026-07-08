import { getRiskColor, getStatusColor } from '../../data/constants'
import { getScoringLabel } from '../../utils/aiLabels'

export function StatusBadge({ status }) {
  return (
    <span className={`badge ${getStatusColor(status)}`}>{status}</span>
  )
}

export function RiskBadge({ level }) {
  return (
    <span className={`badge ${getRiskColor(level)}`}>{level} Risk</span>
  )
}

export function ScoreRing({ score, size = 80, label }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const getColor = (s) => {
    if (s >= 80) return '#10b981'
    if (s >= 60) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={getColor(score)} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{score}%</span>
        </div>
      </div>
      {label && <span className="text-xs text-gray-500 mt-1 font-medium">{label}</span>}
    </div>
  )
}

export function ProgressBar({ value, max = 100, color = 'primary' }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const colors = {
    primary: 'bg-primary-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
  }
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
      <div className={`h-full rounded-full ${colors[color]} transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function AIAssessmentCard({ assessment, investorMatches = [], aiStatus = null }) {
  if (!assessment) {
    return (
      <div className="card p-6 text-center">
        <p className="text-gray-500 text-sm">Automated scoring pending...</p>
        <p className="text-xs text-gray-400 mt-1">Submit your business plan and budget to trigger evaluation</p>
      </div>
    )
  }

  const scoring = getScoringLabel(assessment.engineVersion, aiStatus)

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-2 h-2 bg-primary-500 rounded-full" />
          {scoring.short} Results
        </h3>
        <span className="text-xs text-gray-400">
          {scoring.long}
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-4">{scoring.description}</p>

      {assessment.documentsValid === false && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
          <p className="font-semibold">Documents rejected</p>
          <p className="mt-1">{assessment.validationIssues || assessment.aiSummary}</p>
          <p className="mt-2 text-xs">Upload a real business plan and budget related to your startup (PDF or DOCX). Cookbooks, stories, and unrelated files are not accepted.</p>
        </div>
      )}

      {assessment.investorAdvice && (
        <div className="mb-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
          <p className="text-xs font-semibold text-indigo-800 uppercase tracking-wide mb-1">Investor advice (visible to investors)</p>
          <p className="text-sm text-indigo-900/90 leading-relaxed">{assessment.investorAdvice}</p>
        </div>
      )}

      {assessment.aiSummary && assessment.documentsValid !== false && (
        <p className="text-sm text-gray-600 bg-primary-50/50 border border-primary-100 rounded-xl p-4 mb-6 leading-relaxed">
          {assessment.aiSummary}
        </p>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <ScoreRing score={assessment.marketUniqueness} label="Market Uniqueness" />
        <ScoreRing score={assessment.productUniqueness} label="Product Uniqueness" />
        <ScoreRing score={assessment.overallInnovation} label="Innovation Score" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-b border-gray-100">
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <RiskBadge level={assessment.riskLevel} />
          <p className="text-xs text-gray-500 mt-2">Risk Level</p>
          <p className="text-xs font-medium text-gray-600">Score: {assessment.riskScore}/100</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <p className="font-bold text-gray-900">RWF {(assessment.expectedProfit / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-gray-500 mt-1">Profit Prediction <span className="text-amber-600">(projection)</span></p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <p className="font-bold text-primary-600 text-xl">{assessment.expectedROI}%</p>
          <p className="text-xs text-gray-500 mt-1">ROI Prediction <span className="text-amber-600">(projection)</span></p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <p className="font-bold text-indigo-600">{investorMatches.length}</p>
          <p className="text-xs text-gray-500 mt-1">Investor Matches</p>
        </div>
      </div>

      {investorMatches.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Matched Investors</p>
          <div className="space-y-2">
            {investorMatches.slice(0, 3).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{inv.name}</p>
                  <p className="text-xs text-gray-500">{inv.company} · {inv.investorType}</p>
                </div>
                <span className="badge bg-indigo-100 text-indigo-700">{inv.matchScore}% match</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
