/**
 * Innovation Hub AI Engine
 * Business-rules scoring (Phase 1) — mirrors planned Java backend logic.
 * Inputs: startup idea, category, business plan metadata, budget figures.
 * Outputs: uniqueness, risk, profit, ROI, investor match score.
 */

const CATEGORY_BASE = {
  AgriTech: { market: 72, product: 68, risk: 28 },
  FinTech: { market: 65, product: 70, risk: 42 },
  HealthTech: { market: 78, product: 75, risk: 38 },
  EdTech: { market: 70, product: 72, risk: 35 },
  CleanTech: { market: 74, product: 76, risk: 32 },
  'E-Commerce': { market: 60, product: 62, risk: 45 },
  SaaS: { market: 68, product: 80, risk: 40 },
  'Social Impact': { market: 76, product: 74, risk: 30 },
  'Creative Industries': { market: 66, product: 78, risk: 38 },
  Other: { market: 62, product: 65, risk: 50 },
}

const INNOVATION_KEYWORDS = [
  'ai', 'iot', 'blockchain', 'mobile', 'platform', 'smart', 'digital',
  'automation', 'sustainable', 'innovative', 'unique', 'scalable', 'patent',
]

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(value)))
}

function hashSeed(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

/** Score description quality: length, keywords, specificity */
function scoreDescription(description = '') {
  const text = description.toLowerCase()
  const words = text.split(/\s+/).filter(Boolean)
  let score = 0

  if (words.length >= 15) score += 12
  else if (words.length >= 8) score += 6

  const keywordHits = INNOVATION_KEYWORDS.filter((k) => text.includes(k)).length
  score += Math.min(keywordHits * 4, 20)

  if (/\d+%/.test(text)) score += 5
  if (text.includes('rwanda') || text.includes('africa')) score += 4

  return clamp(score, 0, 25)
}

/** Step 1–2: Uniqueness scoring */
export function calculateUniqueness({ category, description, startupName, name }) {
  const label = startupName || name || ''
  const base = CATEGORY_BASE[category] || CATEGORY_BASE.Other
  const descBonus = scoreDescription(description)
  const nameSeed = hashSeed(label) % 8

  const marketUniqueness = clamp(base.market + descBonus * 0.4 + nameSeed)
  const productUniqueness = clamp(base.product + descBonus * 0.6 + (nameSeed % 5))
  const overallInnovation = clamp((marketUniqueness * 0.45) + (productUniqueness * 0.55))

  return { marketUniqueness, productUniqueness, overallInnovation, descBonus }
}

/** Normalize application inputs for engine */
export function normalizeApplication(app) {
  return {
    ...app,
    startupName: app.startupName || app.name,
    budgetAmount: Number(app.budgetAmount) || Math.round((app.fundingGoal || 10000000) * 0.4),
    projectedProfit: Number(app.projectedProfit) || Math.round((app.fundingGoal || 10000000) * 0.8),
    businessPlan: app.businessPlan || 'business-plan.pdf',
    budget: app.budget || 'budget-proposal.pdf',
  }
}

/** Step 3: Risk analysis */
export function calculateRisk({ category, fundingGoal, budgetAmount, projectedProfit, overallInnovation }) {
  const base = CATEGORY_BASE[category] || CATEGORY_BASE.Other
  let riskScore = base.risk

  const funding = Number(fundingGoal) || 0
  const budget = Number(budgetAmount) || 0
  const profit = Number(projectedProfit) || 0

  if (funding > 0 && budget > 0) {
    const ratio = budget / funding
    if (ratio > 0.8) riskScore += 15
    else if (ratio < 0.3) riskScore -= 8
  }

  if (profit > 0 && budget > 0) {
    const profitRatio = profit / budget
    if (profitRatio < 1.2) riskScore += 12
    else if (profitRatio >= 2.5) riskScore -= 10
  }

  if (funding > 30000000) riskScore += 8
  if (overallInnovation >= 85) riskScore -= 12
  else if (overallInnovation < 65) riskScore += 10

  riskScore = clamp(riskScore, 5, 95)

  let riskLevel = 'Medium'
  if (riskScore <= 30) riskLevel = 'Low'
  else if (riskScore >= 55) riskLevel = 'High'

  return { riskScore, riskLevel }
}

/** Step 4: Profit prediction — blends user projection with category model */
export function calculateProfitPrediction({ category, projectedProfit, budgetAmount, overallInnovation }) {
  const profit = Number(projectedProfit) || 0
  const budget = Number(budgetAmount) || 0
  const base = CATEGORY_BASE[category] || CATEGORY_BASE.Other

  const modelMultiplier = 1 + (overallInnovation - 70) / 200
  const modelProfit = budget > 0 ? budget * (1.8 + base.product / 100) * modelMultiplier : profit

  const expectedProfit = profit > 0
    ? clamp(Math.round(profit * 0.85 + modelProfit * 0.15), 0, 999999999)
    : Math.round(modelProfit)

  return { expectedProfit }
}

/** Step 5: ROI prediction */
export function calculateROI({ expectedProfit, fundingGoal, budgetAmount, riskScore, projectedProfit }) {
  const investment = Number(fundingGoal) || Number(budgetAmount) || 1
  const profit = Number(projectedProfit) || expectedProfit
  // Scaled annual ROI: profit vs funding ask, risk-adjusted (aligns with RWF startup benchmarks)
  const baseRoi = (profit / investment) * 30
  const riskAdjustment = (50 - riskScore) / 4
  const expectedROI = clamp(baseRoi + riskAdjustment, 8, 120)

  return { expectedROI, rawRoi: baseRoi }
}

/** Full pipeline — runs all AI steps in order */
export function runAIEvaluation(rawApplication) {
  const application = normalizeApplication(rawApplication)
  const uniqueness = calculateUniqueness(application)
  const risk = calculateRisk({ ...application, overallInnovation: uniqueness.overallInnovation })
  const profit = calculateProfitPrediction({ ...application, overallInnovation: uniqueness.overallInnovation })
  const roi = calculateROI({
    ...profit,
    ...risk,
    fundingGoal: application.fundingGoal,
    budgetAmount: application.budgetAmount,
    projectedProfit: application.projectedProfit,
  })

  return {
    ...uniqueness,
    ...risk,
    ...profit,
    ...roi,
    evaluatedAt: new Date().toISOString(),
    engineVersion: '1.0-rules',
  }
}

/** Build live step-by-step report with computed metrics for UI */
export function buildEvaluationReport(rawApplication) {
  const application = normalizeApplication(rawApplication)
  const base = CATEGORY_BASE[application.category] || CATEGORY_BASE.Other
  const uniqueness = calculateUniqueness(application)
  const risk = calculateRisk({ ...application, overallInnovation: uniqueness.overallInnovation })
  const profit = calculateProfitPrediction({ ...application, overallInnovation: uniqueness.overallInnovation })
  const roi = calculateROI({
    ...profit,
    ...risk,
    fundingGoal: application.fundingGoal,
    budgetAmount: application.budgetAmount,
    projectedProfit: application.projectedProfit,
  })
  const assessment = { ...uniqueness, ...risk, ...profit, ...roi, evaluatedAt: new Date().toISOString(), engineVersion: '1.0-rules' }
  const investorMatches = matchInvestors(assessment, application.category)

  const text = (application.description || '').toLowerCase()
  const keywordHits = INNOVATION_KEYWORDS.filter((k) => text.includes(k))
  const budgetRatio = application.fundingGoal > 0 ? (application.budgetAmount / application.fundingGoal) : 0
  const profitRatio = application.budgetAmount > 0 ? (application.projectedProfit / application.budgetAmount) : 0
  const rawRoi = application.fundingGoal > 0
    ? ((application.projectedProfit || profit.expectedProfit) / application.fundingGoal) * 30
    : 0

  const steps = [
    {
      id: 'uniqueness',
      title: 'Uniqueness Score',
      summary: `Innovation score: ${uniqueness.overallInnovation}%`,
      metrics: [
        { label: 'Market Uniqueness', value: `${uniqueness.marketUniqueness}%`, highlight: true },
        { label: 'Product Uniqueness', value: `${uniqueness.productUniqueness}%`, highlight: true },
        { label: 'Overall Innovation', value: `${uniqueness.overallInnovation}%`, highlight: true },
        { label: 'Category base', value: application.category },
        { label: 'Innovation keywords', value: keywordHits.length ? keywordHits.join(', ') : 'none detected' },
        { label: 'Description signal', value: `+${uniqueness.descBonus} pts` },
      ],
    },
    {
      id: 'risk',
      title: 'Risk Analysis',
      summary: `${risk.riskLevel} risk (${risk.riskScore}/100)`,
      metrics: [
        { label: 'Risk Level', value: risk.riskLevel, highlight: true },
        { label: 'Risk Score', value: `${risk.riskScore}/100`, highlight: true },
        { label: 'Category base risk', value: `${base.risk}/100` },
        { label: 'Budget / Funding ratio', value: `${(budgetRatio * 100).toFixed(0)}%` },
        { label: 'Profit / Budget ratio', value: profitRatio.toFixed(2) },
        { label: 'Innovation adjustment', value: uniqueness.overallInnovation >= 85 ? '−12 (high innovation)' : 'standard' },
      ],
    },
    {
      id: 'profit',
      title: 'Profit Prediction',
      summary: `RWF ${(profit.expectedProfit / 1000000).toFixed(1)}M expected`,
      metrics: [
        { label: 'Expected Profit', value: `RWF ${profit.expectedProfit.toLocaleString()}`, highlight: true },
        { label: 'Your projection', value: `RWF ${Number(application.projectedProfit).toLocaleString()}` },
        { label: 'Budget amount', value: `RWF ${Number(application.budgetAmount).toLocaleString()}` },
        { label: 'Model weight', value: '85% user + 15% category model' },
      ],
    },
    {
      id: 'roi',
      title: 'ROI Prediction',
      summary: `${roi.expectedROI}% expected ROI`,
      metrics: [
        { label: 'Expected ROI', value: `${roi.expectedROI}%`, highlight: true },
        { label: 'Raw ROI', value: `${rawRoi.toFixed(1)}%` },
        { label: 'Funding goal', value: `RWF ${Number(application.fundingGoal).toLocaleString()}` },
        { label: 'Risk adjustment', value: `${((50 - risk.riskScore) / 5).toFixed(1)} pts` },
      ],
    },
    {
      id: 'match',
      title: 'Investor Matching',
      summary: `${investorMatches.length} investor${investorMatches.length !== 1 ? 's' : ''} matched`,
      metrics: investorMatches.length > 0
        ? investorMatches.map((inv) => ({
          label: inv.name,
          value: `${inv.matchScore}% match · ${inv.investorType}`,
          highlight: true,
        }))
        : [{ label: 'Status', value: 'No matches above 55% threshold' }],
    },
  ]

  return { application, assessment, investorMatches, steps }
}

/** Investor match score 0–100 */
export function calculateInvestorMatchScore(assessment, investorProfile = {}) {
  if (!assessment) return 0

  let score = assessment.overallInnovation * 0.35
  score += (100 - assessment.riskScore) * 0.25
  score += Math.min(assessment.expectedROI, 50) * 0.4

  const type = investorProfile.investorType || ''
  if (type === 'Angel Investor' && assessment.riskScore > 50) score -= 10
  if (type === 'Venture Capital' && assessment.overallInnovation < 75) score -= 8
  if (type === 'Government Fund' && assessment.riskLevel === 'High') score -= 15

  return clamp(score)
}

export const AI_PIPELINE_STEPS = [
  { id: 'register', label: 'Entrepreneur Registers', icon: 'user' },
  { id: 'idea', label: 'Submit Startup Idea', icon: 'lightbulb' },
  { id: 'plan', label: 'Upload Business Plan', icon: 'file' },
  { id: 'budget', label: 'Upload Budget', icon: 'wallet' },
  { id: 'evaluate', label: 'AI Evaluation', icon: 'brain' },
  { id: 'uniqueness', label: 'Uniqueness Score', icon: 'sparkles' },
  { id: 'risk', label: 'Risk Analysis', icon: 'shield' },
  { id: 'profit', label: 'Profit Prediction', icon: 'trending' },
  { id: 'roi', label: 'ROI Prediction', icon: 'percent' },
  { id: 'match', label: 'Investor Matching', icon: 'users' },
  { id: 'admin', label: 'Administrator Review', icon: 'check' },
  { id: 'funding', label: 'Funding Decision', icon: 'dollar' },
]

/** Simulate async pipeline with step callbacks for UI progress */
export async function runAIEvaluationPipeline(application, onStep) {
  const steps = ['evaluate', 'uniqueness', 'risk', 'profit', 'roi', 'match']
  const delays = [400, 500, 500, 400, 400, 600]

  for (let i = 0; i < steps.length; i++) {
    onStep?.(steps[i], i + 1, steps.length)
    await new Promise((r) => setTimeout(r, delays[i]))
  }

  const assessment = runAIEvaluation(application)
  const report = buildEvaluationReport(application)
  const investorMatches = report.investorMatches

  onStep?.('complete', steps.length, steps.length)
  return { assessment, investorMatches, steps: report.steps }
}

const MOCK_INVESTORS = [
  { id: 1, name: 'Sarah Mukamana', company: 'Kigali Ventures', investorType: 'Venture Capital', minInnovation: 70 },
  { id: 2, name: 'Kigali Angels', company: 'Kigali Angels Network', investorType: 'Angel Investor', minInnovation: 65 },
  { id: 3, name: 'East Africa Fund', company: 'EAF Partners', investorType: 'Development Finance', minInnovation: 72 },
  { id: 4, name: 'Rwanda Innovation Fund', company: 'RIF', investorType: 'Government Fund', minInnovation: 75 },
]

export function matchInvestors(assessment, category) {
  return MOCK_INVESTORS
    .map((inv) => ({
      ...inv,
      matchScore: calculateInvestorMatchScore(assessment, inv),
      categoryFit: category,
    }))
    .filter((inv) => inv.matchScore >= 55 && assessment.overallInnovation >= inv.minInnovation - 10)
    .sort((a, b) => b.matchScore - a.matchScore)
}
