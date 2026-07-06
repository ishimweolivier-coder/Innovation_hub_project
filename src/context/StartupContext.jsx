import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../services/api'
import { submitApplicationWithFiles } from '../services/documents'
import { useAuth } from './AuthContext'
import { runAIEvaluationPipeline } from '../services/aiEngine'

const StartupContext = createContext(null)

export function StartupProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const [applications, setApplications] = useState([])
  const [evaluating, setEvaluating] = useState(false)
  const [loading, setLoading] = useState(false)

  const refreshApplications = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const data = await api.getApplications()
      setApplications(Array.isArray(data) ? data : [])
    } catch {
      setApplications([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    refreshApplications()
  }, [refreshApplications, user?.id])

  const getMyStartup = useCallback((founderId) => {
    if (founderId == null) return null
    const owned = applications.filter((a) => Number(a.founderId) === Number(founderId))
    return owned[0] || null
  }, [applications])

  const submitApplication = useCallback(async (founderId, founderName, form, onProgress) => {
    setEvaluating(true)

    const body = {
      startupName: form.startupName,
      category: form.category,
      description: form.description,
      fundingGoal: Number(form.fundingGoal),
      budgetAmount: Number(form.budgetAmount),
      projectedProfit: Number(form.projectedProfit),
    }

    const files = {
      businessPlan: form.businessPlanMode === 'upload' && form.businessPlan instanceof File ? form.businessPlan : null,
      budget: form.budget instanceof File ? form.budget : null,
    }

    const planForm = {
      mode: form.businessPlanMode || 'upload',
      ...form.planForm,
    }

    try {
      if (onProgress) onProgress('uploaded')

      const created = await submitApplicationWithFiles(body, files, planForm)

      if (onProgress) {
        onProgress('evaluate')
        onProgress('complete')
      }

      setApplications((prev) => [created, ...prev.filter((a) => a.id !== created.id)])
      setEvaluating(false)
      return created
    } catch (err) {
      setEvaluating(false)
      throw err
    }
  }, [])

  const runEvaluation = useCallback(async (startupId, onProgress) => {
    const startup = applications.find((a) => a.id === startupId)
    if (!startup) return null

    setEvaluating(true)
    setApplications((prev) =>
      prev.map((a) => (a.id === startupId ? { ...a, workflowStage: 'ai_running' } : a))
    )

    try {
      if (onProgress) {
        await runAIEvaluationPipeline(startup, onProgress)
      }

      const updated = await api.evaluateApplication(startupId)
      setApplications((prev) => prev.map((a) => (a.id === startupId ? updated : a)))
      setEvaluating(false)
      return {
        assessment: updated.aiAssessment,
        investorMatches: updated.investorMatches,
        steps: updated.evaluationSteps,
      }
    } catch (err) {
      setEvaluating(false)
      throw err
    }
  }, [applications])

  const updateApplicationStatus = useCallback(async (id, status, stage) => {
    const updated = await api.updateApplicationStatus(id, status, stage)
    setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)))
  }, [])

  return (
    <StartupContext.Provider value={{
      applications,
      evaluating,
      loading,
      getMyStartup,
      submitApplication,
      runEvaluation,
      updateApplicationStatus,
      setApplications,
      refreshApplications,
    }}>
      {children}
    </StartupContext.Provider>
  )
}

export function useStartups() {
  const ctx = useContext(StartupContext)
  if (!ctx) throw new Error('useStartups must be used within StartupProvider')
  return ctx
}
