import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Upload, FileText, DollarSign, CheckCircle, Brain, ArrowRight, PenLine } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import AIEvaluationProgress from '../../components/ai/AIEvaluationProgress'
import { AIAssessmentCard } from '../../components/shared/Badges'
import { STARTUP_CATEGORIES } from '../../data/constants'
import { useAuth } from '../../context/AuthContext'
import { useStartups } from '../../context/StartupContext'
import { useToast } from '../../context/ToastContext'

const emptyPlanForm = {
  executiveSummary: '',
  marketAnalysis: '',
  productSolution: '',
  growthStrategy: '',
  teamOperations: '',
}

export default function SubmitApplication() {
  const [step, setStep] = useState(1)
  const [aiStep, setAiStep] = useState(null)
  const [uploadMessage, setUploadMessage] = useState('')
  const [result, setResult] = useState(null)
  const [businessPlanMode, setBusinessPlanMode] = useState('upload')
  const [planForm, setPlanForm] = useState(emptyPlanForm)
  const [form, setForm] = useState({
    startupName: '', category: '', description: '', fundingGoal: '',
    businessPlan: null, budget: null, budgetAmount: '', projectedProfit: '',
  })
  const { user } = useAuth()
  const { submitApplication, evaluating } = useStartups()
  const { showToast } = useToast()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handlePlanFormChange = (e) => setPlanForm({ ...planForm, [e.target.name]: e.target.value })

  const handleFile = (field) => (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm({ ...form, [field]: file })
      showToast(`${field === 'businessPlan' ? 'Business plan' : 'Budget'} selected: ${file.name}`, 'success')
    }
  }

  const planStepValid = () => {
    if (businessPlanMode === 'upload') return !!form.businessPlan
    return planForm.executiveSummary.trim() && planForm.marketAnalysis.trim() && planForm.productSolution.trim()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!planStepValid()) {
      showToast('Complete your business plan (upload or form)', 'error')
      return
    }
    if (!form.budget) {
      showToast('Please upload your budget document', 'error')
      return
    }

    setUploadMessage(
      businessPlanMode === 'form'
        ? 'Business plan form saved · Budget uploaded'
        : `Business plan uploaded · Budget uploaded (${form.budget.name})`
    )
    setAiStep('uploaded')

    try {
      const updated = await submitApplication(
        user?.id || 1,
        user?.fullName || 'Entrepreneur',
        { ...form, businessPlanMode, planForm },
        (step) => setAiStep(step === 'complete' ? 'complete' : step)
      )
      setResult(updated)
      showToast('Documents uploaded and AI report generated! Investors can now view your business idea report.', 'success')
    } catch (err) {
      showToast(err.message || 'Submission failed. Please try again.', 'error')
      setAiStep(null)
      setUploadMessage('')
    }
  }

  if (aiStep && !result) {
    return (
      <DashboardLayout role="entrepreneur">
        <AIEvaluationProgress currentStep={aiStep} uploadMessage={uploadMessage} />
      </DashboardLayout>
    )
  }

  if (result) {
    const docsOk = result.aiAssessment?.documentsValid !== false
    return (
      <DashboardLayout role="entrepreneur">
        <div className="max-w-3xl mx-auto space-y-6 py-8">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-900">
              {docsOk ? 'Documents Uploaded & Report Ready' : 'Application Submitted — Documents Need Review'}
            </h2>
            <p className="text-gray-500 mt-2">
              {docsOk
                ? 'Your business plan and budget were received. Investors can open your startup to read the AI business idea report and investment advice.'
                : 'Please re-upload valid business documents.'}
            </p>
          </div>
          <AIAssessmentCard assessment={result.aiAssessment} investorMatches={result.investorMatches} />
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/entrepreneur/ai-evaluation" className="btn-primary text-sm">
              <Brain className="w-4 h-4" /> View Full Report
            </Link>
            <Link to="/entrepreneur/status" className="btn-secondary text-sm">
              Track Status <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const steps = [
    { num: 1, label: 'Startup Idea', icon: FileText },
    { num: 2, label: 'Business Plan', icon: Upload },
    { num: 3, label: 'Budget', icon: DollarSign },
  ]

  return (
    <DashboardLayout role="entrepreneur">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Submit Startup Application</h2>
        <p className="text-gray-500 mb-2">Upload documents or fill the business plan form — AI generates an investor report after submission</p>
        <p className="text-xs text-amber-700 mb-8 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          Budget must be uploaded (PDF/DOCX). Business plan: upload a file <strong>or</strong> fill the online form if you don&apos;t have a document yet.
        </p>

        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all w-full
                  ${step === s.num ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25' : step > s.num ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-500'}`}
              >
                <s.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && <div className={`w-8 h-0.5 ${step > s.num ? 'bg-primary-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="card p-8">
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="label">Startup Name</label>
                <input name="startupName" className="input-field" placeholder="e.g. AgriSmart Rwanda" value={form.startupName} onChange={handleChange} required />
              </div>
              <div>
                <label className="label">Category</label>
                <select name="category" className="input-field" value={form.category} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {STARTUP_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Startup Idea / Description</label>
                <textarea name="description" className="input-field min-h-[120px] resize-y" placeholder="Describe your innovative solution, target market, and impact in Rwanda..." value={form.description} onChange={handleChange} required />
              </div>
              <div>
                <label className="label">Funding Goal (RWF)</label>
                <input name="fundingGoal" type="number" className="input-field" placeholder="15000000" value={form.fundingGoal} onChange={handleChange} required />
              </div>
              <button type="button" onClick={() => setStep(2)} className="btn-primary">Continue to Business Plan</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setBusinessPlanMode('upload')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium ${businessPlanMode === 'upload' ? 'bg-white shadow text-primary-700' : 'text-gray-500'}`}
                >
                  <Upload className="w-4 h-4" /> Upload document
                </button>
                <button
                  type="button"
                  onClick={() => setBusinessPlanMode('form')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium ${businessPlanMode === 'form' ? 'bg-white shadow text-primary-700' : 'text-gray-500'}`}
                >
                  <PenLine className="w-4 h-4" /> Fill online form
                </button>
              </div>

              {businessPlanMode === 'upload' ? (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-primary-400 transition-colors">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="font-medium text-gray-700">Upload Business Plan</p>
                  <p className="text-sm text-gray-400 mt-1">PDF or DOCX up to 10MB</p>
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" id="businessPlan" onChange={handleFile('businessPlan')} />
                  <label htmlFor="businessPlan" className="btn-secondary text-sm mt-4 cursor-pointer inline-flex">Choose File</label>
                  {form.businessPlan && <p className="text-sm text-green-600 mt-3 font-medium">✓ Uploaded: {form.businessPlan.name}</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">No document? Describe your plan below — we&apos;ll generate a business plan from your answers.</p>
                  {[
                    { name: 'executiveSummary', label: 'Executive Summary', rows: 4 },
                    { name: 'marketAnalysis', label: 'Market Analysis', rows: 3 },
                    { name: 'productSolution', label: 'Product & Solution', rows: 3 },
                    { name: 'growthStrategy', label: 'Growth Strategy', rows: 3 },
                    { name: 'teamOperations', label: 'Team & Operations', rows: 3 },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="label">{field.label}</label>
                      <textarea
                        name={field.name}
                        rows={field.rows}
                        className="input-field resize-y"
                        value={planForm[field.name]}
                        onChange={handlePlanFormChange}
                        required={['executiveSummary', 'marketAnalysis', 'productSolution'].includes(field.name)}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary">Back</button>
                <button type="button" onClick={() => planStepValid() ? setStep(3) : showToast('Complete business plan first', 'error')} className="btn-primary">Continue to Budget</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Budget Amount (RWF)</label>
                  <input name="budgetAmount" type="number" className="input-field" placeholder="5000000" value={form.budgetAmount} onChange={handleChange} required />
                </div>
                <div>
                  <label className="label">Projected Profit (RWF)</label>
                  <input name="projectedProfit" type="number" className="input-field" placeholder="12000000" value={form.projectedProfit} onChange={handleChange} required />
                </div>
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-primary-400 transition-colors">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="font-medium text-gray-700">Upload Budget Proposal</p>
                <p className="text-sm text-gray-400 mt-1">Required · PDF or DOCX</p>
                <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" id="budget" onChange={handleFile('budget')} />
                <label htmlFor="budget" className="btn-secondary text-sm mt-4 cursor-pointer inline-flex">Choose File</label>
                {form.budget && <p className="text-sm text-green-600 mt-3 font-medium">✓ Uploaded: {form.budget.name}</p>}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary">Back</button>
                <button type="submit" disabled={evaluating} className="btn-primary">
                  <Brain className="w-4 h-4" /> Upload & Generate Investor Report
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  )
}
