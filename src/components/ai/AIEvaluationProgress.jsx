import { Brain, Loader2, Upload, CheckCircle } from 'lucide-react'
import { AI_PIPELINE_STEPS } from '../../services/aiEngine'

const STEP_LABELS = {
  uploaded: 'Documents uploaded successfully...',
  evaluate: 'Reading documents & building investor report...',
  uniqueness: 'Analyzing market & product uniqueness...',
  risk: 'Performing risk analysis...',
  profit: 'Predicting expected profit...',
  roi: 'Computing ROI projection...',
  match: 'Matching with investors...',
  complete: 'Report ready for investors!',
}

export default function AIEvaluationProgress({ currentStep, uploadMessage }) {
  const showUploadStep = currentStep === 'uploaded' || uploadMessage
  const aiSteps = AI_PIPELINE_STEPS.filter((s) =>
    ['evaluate', 'uniqueness', 'risk', 'profit', 'roi', 'match'].includes(s.id)
  )
  const currentIndex = aiSteps.findIndex((s) => s.id === currentStep)

  return (
    <div className="card p-8 max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-primary-600 animate-pulse" />
        </div>
        <h2 className="font-display text-xl font-bold text-gray-900">
          {currentStep === 'uploaded' ? 'Documents Uploaded' : 'Generating Investor Report'}
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          {STEP_LABELS[currentStep] || 'Initializing...'}
        </p>
        {uploadMessage && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 mt-3 inline-flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" /> {uploadMessage}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {showUploadStep && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${currentStep === 'uploaded' ? 'bg-green-50 border border-green-100' : 'bg-green-50/50 border border-green-100'}`}>
            {currentStep === 'uploaded' ? (
              <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 text-green-600" />
            )}
            <span className="text-sm text-green-700 font-medium">Business plan & budget received</span>
          </div>
        )}
        {aiSteps.map((step, i) => {
          const done = currentStep === 'complete' || (currentStep !== 'uploaded' && i < currentIndex)
          const active = step.id === currentStep
          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${done ? 'bg-green-50 border border-green-100' : active ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'}`}
            >
              {done ? (
                <span className="text-green-600 text-sm font-bold">✓</span>
              ) : active ? (
                <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-gray-200" />
              )}
              <span className={`text-sm ${done ? 'text-green-700 font-medium' : active ? 'text-primary-700 font-medium' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
