import { useState } from 'react'
import { X, FileText, DollarSign, ExternalLink } from 'lucide-react'
import { openDocument } from '../../services/documents'
import { useToast } from '../../context/ToastContext'

export function DocumentCards({ applicationId, businessPlanName, budgetName }) {
  const [viewer, setViewer] = useState(null)
  const [loading, setLoading] = useState(null)
  const { showToast } = useToast()

  const handleView = async (type, title) => {
    setLoading(type)
    try {
      const url = await openDocument(applicationId, type)
      setViewer({ url, title })
    } catch (err) {
      showToast(err.message || 'Could not load document', 'error')
    } finally {
      setLoading(null)
    }
  }

  const closeViewer = () => {
    if (viewer?.url) URL.revokeObjectURL(viewer.url)
    setViewer(null)
  }

  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Business Plan</h3>
          </div>
          <p className="text-sm text-gray-500">Comprehensive business plan with market analysis and financial projections.</p>
          {businessPlanName && <p className="text-xs text-gray-400 mt-2 truncate">{businessPlanName}</p>}
          <button
            type="button"
            onClick={() => handleView('business-plan', 'Business Plan')}
            disabled={loading === 'business-plan'}
            className="btn-secondary text-sm mt-4 w-full"
          >
            {loading === 'business-plan' ? 'Loading...' : 'View Business Plan'}
          </button>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Budget Proposal</h3>
          </div>
          <p className="text-sm text-gray-500">Detailed budget breakdown and projected profit analysis.</p>
          {budgetName && <p className="text-xs text-gray-400 mt-2 truncate">{budgetName}</p>}
          <button
            type="button"
            onClick={() => handleView('budget', 'Budget Proposal')}
            disabled={loading === 'budget'}
            className="btn-secondary text-sm mt-4 w-full"
          >
            {loading === 'budget' ? 'Loading...' : 'View Budget'}
          </button>
        </div>
      </div>

      {viewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={closeViewer} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{viewer.title}</h3>
              <div className="flex items-center gap-2">
                <a href={viewer.url} target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-gray-100" title="Open in new tab">
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </a>
                <button type="button" onClick={closeViewer} className="p-2 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <iframe src={viewer.url} title={viewer.title} className="flex-1 w-full border-0 rounded-b-2xl" />
          </div>
        </div>
      )}
    </>
  )
}
