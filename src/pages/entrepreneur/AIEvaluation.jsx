import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Brain, Play, Loader2, CheckCircle, RefreshCw } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import AIWorkflowPipeline, { getWorkflowIndex } from '../../components/ai/AIWorkflowPipeline'
import AIEvaluationProgress from '../../components/ai/AIEvaluationProgress'
import { AIAssessmentCard } from '../../components/shared/Badges'
import { DocumentCards } from '../../components/shared/DocumentCards'
import { useAuth } from '../../context/AuthContext'
import { useStartups } from '../../context/StartupContext'
import { buildEvaluationReport } from '../../services/aiEngine'
import api from '../../services/api'
import { getScoringLabel } from '../../utils/aiLabels'

export default function AIEvaluation() {
  const { user } = useAuth()
  const { getMyStartup, runEvaluation, evaluating, loading } = useStartups()
  const startup = getMyStartup(user?.id)

  const [aiStep, setAiStep] = useState(null)
  const [liveSteps, setLiveSteps] = useState(startup?.evaluationSteps || [])
  const [completedSteps, setCompletedSteps] = useState([])
  const [hasRun, setHasRun] = useState(!!startup?.aiAssessment)
  const [aiStatus, setAiStatus] = useState(null)

  const canEvaluate = !!(startup?.category && startup?.description && startup?.fundingGoal)
  const workflowIndex = getWorkflowIndex(
    evaluating || aiStep ? 'ai_running' : startup?.workflowStage || 'admin_review',
    !!startup?.aiAssessment
  )

  const syncFromStartup = useCallback(() => {
    if (!startup) return
    if (startup.evaluationSteps?.length) {
      setLiveSteps(startup.evaluationSteps)
      setCompletedSteps(startup.evaluationSteps.map((s) => s.id))
      setHasRun(true)
    } else if (startup.aiAssessment && canEvaluate) {
      const report = buildEvaluationReport(startup)
      setLiveSteps(report.steps)
      setCompletedSteps(report.steps.map((s) => s.id))
      setHasRun(true)
    }
  }, [startup, canEvaluate])

  useEffect(() => {
    syncFromStartup()
  }, [syncFromStartup])

  useEffect(() => {
    api.getAiStatus().then(setAiStatus).catch(() => setAiStatus(null))
  }, [])

  const scoring = getScoringLabel(startup?.aiAssessment?.engineVersion, aiStatus)

  const handleRunEvaluation = async () => {
    if (!canEvaluate || !startup) return
    setAiStep('evaluate')
    setCompletedSteps([])
    setLiveSteps([])

    const stepOrder = ['uniqueness', 'risk', 'profit', 'roi', 'match']
    try {
      const result = await runEvaluation(startup.id, (step) => {
        setAiStep(step)
        if (stepOrder.includes(step)) {
          setCompletedSteps((prev) => [...new Set([...prev, step])])
        }
      })

      if (result?.steps) {
        setLiveSteps(result.steps)
        setCompletedSteps(result.steps.map((s) => s.id))
      }
      setAiStep('complete')
      setHasRun(true)
    } catch {
      setAiStep(null)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="entrepreneur">
        <div className="text-center py-16 text-gray-400">Loading...</div>
      </DashboardLayout>
    )
  }

  if (!startup) {
    return (
      <DashboardLayout role="entrepreneur">
        <div className="max-w-3xl mx-auto text-center py-16">
          <Brain className="w-12 h-12 text-primary-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-gray-900">AI Evaluation</h2>
          <p className="text-gray-500 mt-4">Submit your startup application first to enable AI evaluation.</p>
          <Link to="/entrepreneur/apply" className="btn-primary mt-6 inline-flex">Submit Application</Link>
        </div>
      </DashboardLayout>
    )
  }

  if (aiStep && aiStep !== 'complete' && evaluating) {
    return (
      <DashboardLayout role="entrepreneur">
        <AIEvaluationProgress currentStep={aiStep} />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="entrepreneur">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-7 h-7 text-primary-600" /> Startup Evaluation
            </h2>
            <p className="text-gray-500 mt-1">{scoring.description} — {startup.name}</p>
          </div>
          {canEvaluate && (
            <button
              type="button"
              onClick={handleRunEvaluation}
              disabled={evaluating}
              className="btn-primary text-sm self-start"
            >
              {evaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : hasRun ? <RefreshCw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {hasRun ? 'Re-run Evaluation' : 'Run Evaluation'}
            </button>
          )}
        </div>

        <div className="card p-4 bg-primary-50 border-primary-100 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          <p className="text-sm text-primary-800">
            <strong>{scoring.long}</strong> — {scoring.description}
          </p>
        </div>

        <AIWorkflowPipeline currentStage={workflowIndex} />

        {hasRun && startup.aiAssessment && (
          <>
            <AIAssessmentCard
              assessment={startup.aiAssessment}
              investorMatches={startup.investorMatches || []}
              aiStatus={aiStatus}
            />
            <DocumentCards
              applicationId={startup.id}
              businessPlanName={startup.businessPlan}
              budgetName={startup.budget}
            />
          </>
        )}

        {/* Live computed step results — NOT static descriptions */}
        {liveSteps.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Computed Step Results</h3>
            {liveSteps.map((step, i) => {
              const isDone = completedSteps.includes(step.id) || hasRun
              return (
                <div
                  key={step.id}
                  className={`card p-5 border-l-4 transition-all
                    ${isDone ? 'border-l-primary-500' : 'border-l-gray-200 opacity-60'}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${isDone ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {isDone ? <CheckCircle className="w-4 h-4" /> : i + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900">{step.title}</p>
                        <p className="text-sm text-primary-600 font-medium">{step.summary}</p>
                      </div>
                    </div>
                    {isDone && <span className="badge bg-green-100 text-green-700">Computed</span>}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {step.metrics.map((m, j) => (
                      <div
                        key={j}
                        className={`px-3 py-2 rounded-lg text-sm
                          ${m.highlight ? 'bg-primary-50 border border-primary-100' : 'bg-gray-50'}`}
                      >
                        <p className="text-xs text-gray-500">{m.label}</p>
                        <p className={`font-medium ${m.highlight ? 'text-primary-700' : 'text-gray-800'}`}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!canEvaluate && (
          <div className="card p-8 text-center">
            <p className="text-gray-600">Submit your startup application first to enable AI evaluation.</p>
            <Link to="/entrepreneur/apply" className="btn-primary mt-4 inline-flex">Submit Application</Link>
          </div>
        )}

        {canEvaluate && !hasRun && (
          <div className="card p-8 text-center border-dashed border-2 border-primary-200">
            <Brain className="w-12 h-12 text-primary-400 mx-auto mb-3" />
            <p className="text-gray-600">Click <strong>Run AI Evaluation</strong> to execute the full pipeline on your startup data.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
