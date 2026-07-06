import api from './api'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export async function openDocument(applicationId, type) {
  const token = api.getToken()
  const response = await fetch(`${API_BASE}/applications/${applicationId}/documents/${type}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to load document')
  }

  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

export async function submitApplicationWithFiles(form, files, planForm = {}) {
  const token = api.getToken()
  const body = new FormData()
  body.append('startupName', form.startupName)
  body.append('category', form.category)
  body.append('description', form.description)
  body.append('fundingGoal', String(form.fundingGoal))
  body.append('budgetAmount', String(form.budgetAmount))
  body.append('projectedProfit', String(form.projectedProfit))
  body.append('businessPlanMode', planForm.mode || 'upload')

  if (planForm.mode === 'form') {
    body.append('executiveSummary', planForm.executiveSummary || '')
    body.append('marketAnalysis', planForm.marketAnalysis || '')
    body.append('productSolution', planForm.productSolution || '')
    body.append('growthStrategy', planForm.growthStrategy || '')
    body.append('teamOperations', planForm.teamOperations || '')
  } else if (files.businessPlan instanceof File) {
    body.append('businessPlan', files.businessPlan)
  }

  if (files.budget instanceof File) {
    body.append('budget', files.budget)
  }

  const response = await fetch(`${API_BASE}/applications`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || 'Submission failed')
  }
  return data
}
