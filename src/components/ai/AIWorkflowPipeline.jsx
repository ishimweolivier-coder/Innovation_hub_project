import {
  UserPlus, Lightbulb, FileText, Wallet, Brain, Sparkles,
  Shield, TrendingUp, Percent, Users, ClipboardCheck, Banknote, CheckCircle,
} from 'lucide-react'
import { AI_PIPELINE_STEPS } from '../../services/aiEngine'

const ICONS = {
  user: UserPlus,
  lightbulb: Lightbulb,
  file: FileText,
  wallet: Wallet,
  brain: Brain,
  sparkles: Sparkles,
  shield: Shield,
  trending: TrendingUp,
  percent: Percent,
  users: Users,
  check: ClipboardCheck,
  dollar: Banknote,
}

const STAGE_INDEX = {
  registered: 0,
  idea_submitted: 1,
  plan_uploaded: 2,
  budget_uploaded: 3,
  ai_running: 4,
  uniqueness_done: 5,
  risk_done: 6,
  profit_done: 7,
  roi_done: 8,
  matched: 9,
  admin_review: 10,
  funding_decision: 11,
  rejected: 10,
}

export function getWorkflowIndex(workflowStage, hasAssessment) {
  if (workflowStage === 'funding_decision') return 11
  if (workflowStage === 'admin_review' && hasAssessment) return 10
  if (workflowStage === 'ai_running') return 4
  const map = STAGE_INDEX[workflowStage]
  return map ?? (hasAssessment ? 10 : 3)
}

export default function AIWorkflowPipeline({ currentStage = 'budget_uploaded', compact = false }) {
  const activeIndex = typeof currentStage === 'number'
    ? currentStage
    : getWorkflowIndex(currentStage, currentStage === 'admin_review' || currentStage === 'funding_decision')

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {AI_PIPELINE_STEPS.map((step, i) => (
          <div
            key={step.id}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
              ${i < activeIndex ? 'bg-primary-100 text-primary-700' : i === activeIndex ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}
          >
            {i < activeIndex && <CheckCircle className="w-3 h-3" />}
            {step.label}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary-600" />
        AI Workflow Pipeline
      </h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 hidden sm:block" />
        <div className="space-y-4">
          {AI_PIPELINE_STEPS.map((step, i) => {
            const Icon = ICONS[step.icon] || Brain
            const done = i < activeIndex
            const active = i === activeIndex
            return (
              <div key={step.id} className="flex items-center gap-4 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10
                  ${done ? 'bg-primary-600 text-white' : active ? 'bg-primary-100 text-primary-700 ring-4 ring-primary-100 animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                  {done ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className={`flex-1 ${active ? 'font-semibold text-primary-700' : done ? 'text-gray-700' : 'text-gray-400'}`}>
                  <p className="text-sm">{step.label}</p>
                  {active && step.id === 'evaluate' && (
                    <p className="text-xs text-gray-500 mt-0.5">Processing business rules engine...</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
