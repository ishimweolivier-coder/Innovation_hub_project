import { useState } from 'react'
import { CheckCircle, XCircle, Eye, Brain, Users } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import ApplicationDetailModal from '../../components/shared/ApplicationDetailModal'
import { StatusBadge, RiskBadge } from '../../components/shared/Badges'
import { useStartups } from '../../context/StartupContext'
import { useToast } from '../../context/ToastContext'

export default function ReviewApplications() {
  const { applications, updateApplicationStatus } = useStartups()
  const [filter, setFilter] = useState('all')
  const [viewApp, setViewApp] = useState(null)
  const [actingId, setActingId] = useState(null)
  const { showToast } = useToast()

  const handleAction = async (id, action) => {
    const app = applications.find((a) => a.id === id)
    if (!app?.aiAssessment) {
      showToast('Cannot review — AI evaluation not completed', 'error')
      return
    }
    setActingId(id)
    try {
      await updateApplicationStatus(id, action === 'approve' ? 'Approved' : 'Rejected', action === 'approve' ? 3 : app.stage)
      showToast(action === 'approve' ? 'Application approved' : 'Application rejected', action === 'approve' ? 'success' : 'info')
    } catch {
      showToast('Failed to update status', 'error')
    } finally {
      setActingId(null)
    }
  }

  const filtered = filter === 'all' ? applications : applications.filter((a) =>
    filter === 'pending' ? ['Submitted', 'Under Review'].includes(a.status) : a.status === filter
  )

  const canAdvanceLifecycle = (status) => ['Approved', 'In Incubation', 'Funded'].includes(status)

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">Review Applications</h2>
          <p className="text-gray-500 mt-1">Review AI-scored applications — approve or reject after evaluation</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[{ key: 'all', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'Approved', label: 'Approved' }, { key: 'In Incubation', label: 'In Incubation' }, { key: 'Funded', label: 'Funded' }, { key: 'Graduated', label: 'Graduated' }, { key: 'Rejected', label: 'Rejected' }].map((f) => (
            <button key={f.key} type="button" onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${filter === f.key ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map((app) => (
            <div key={app.id} className="card p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-display font-bold text-lg text-gray-900">{app.name}</h3>
                    <StatusBadge status={app.status} />
                    <span className="badge bg-gray-100 text-gray-600">{app.category}</span>
                    {!app.aiAssessment && (
                      <span className="badge bg-amber-100 text-amber-700">AI Pending</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">Founder: {app.founder} · Submitted: {app.createdAt}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{app.description}</p>
                  {app.aiAssessment && (
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <Brain className="w-4 h-4 text-primary-600" />
                      <span className="text-sm text-primary-600 font-medium">{app.aiAssessment.overallInnovation}% Innovation</span>
                      <RiskBadge level={app.aiAssessment.riskLevel} />
                      <span className="text-sm text-gray-500">ROI: {app.aiAssessment.expectedROI}%</span>
                      {(app.investorMatches?.length > 0) && (
                        <span className="text-sm text-indigo-600 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> {app.investorMatches.length} investor matches
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setViewApp(app)} className="btn-ghost text-sm">
                    <Eye className="w-4 h-4" /> View
                  </button>
                  {['Submitted', 'Under Review'].includes(app.status) && app.aiAssessment && (
                    <>
                      <button type="button" onClick={() => handleAction(app.id, 'approve')} disabled={actingId === app.id} className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50">
                        {actingId === app.id ? 'Processing…' : <><CheckCircle className="w-4 h-4" /> Approve</>}
                      </button>
                      <button type="button" onClick={() => handleAction(app.id, 'reject')} disabled={actingId === app.id} className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50">
                        {actingId === app.id ? 'Processing…' : <><XCircle className="w-4 h-4" /> Reject</>}
                      </button>
                    </>
                  )}

                  {/* Admin lifecycle actions: sequentially advance approved startups through stages */}
                  {canAdvanceLifecycle(app.status) && app.aiAssessment && (
                    <div className="flex items-center gap-2">
                      {app.status === 'Approved' && (
                        <button type="button" onClick={async () => {
                          setActingId(app.id)
                          try {
                            await updateApplicationStatus(app.id, 'In Incubation', 4)
                            showToast('Application moved to incubation', 'success')
                          } catch { showToast('Failed to update status', 'error') }
                          finally { setActingId(null) }
                        }} disabled={actingId === app.id} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50">
                          {actingId === app.id ? 'Processing…' : 'In Incubation'}
                        </button>
                      )}

                      {app.status === 'In Incubation' && (
                        <button type="button" onClick={async () => {
                          setActingId(app.id)
                          try {
                            await updateApplicationStatus(app.id, 'Funded', 6)
                            showToast('Application marked Funded', 'success')
                          } catch { showToast('Failed to update status', 'error') }
                          finally { setActingId(null) }
                        }} disabled={actingId === app.id} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-50">
                          {actingId === app.id ? 'Processing…' : 'Funded'}
                        </button>
                      )}

                      {app.status === 'Funded' && (
                        <button type="button" onClick={async () => {
                          setActingId(app.id)
                          try {
                            await updateApplicationStatus(app.id, 'Graduated', 7)
                            showToast('Application marked Graduated', 'success')
                          } catch { showToast('Failed to update status', 'error') }
                          finally { setActingId(null) }
                        }} disabled={actingId === app.id} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors disabled:opacity-50">
                          {actingId === app.id ? 'Processing…' : 'Graduated'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {viewApp && <ApplicationDetailModal application={viewApp} onClose={() => setViewApp(null)} />}
    </DashboardLayout>
  )
}
