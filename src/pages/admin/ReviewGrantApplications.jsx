import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAppData } from '../../context/AppDataContext'

export default function ReviewGrantApplications() {
  const { grantApplications, refreshGrantApplications, reviewGrantApplication } = useAppData()
  const [filter, setFilter] = useState('Pending')
  const [notes, setNotes] = useState({})

  useEffect(() => {
    refreshGrantApplications()
  }, [refreshGrantApplications])

  const filtered = grantApplications.filter((a) => filter === 'All' || a.status === filter)

  const handleReview = async (id, status) => {
    await reviewGrantApplication(id, status, notes[id] || '')
    setNotes((prev) => ({ ...prev, [id]: '' }))
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">Grant & Opportunity Applications</h2>
          <p className="text-gray-500 mt-1">Review entrepreneur applications for grants, competitions, and programs</p>
        </div>

        <div className="flex gap-2">
          {['Pending', 'Approved', 'Rejected', 'All'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === status ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="card p-8 text-center text-gray-500">No applications in this category.</div>
          )}
          {filtered.map((app) => (
            <div key={app.id} className="card p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{app.opportunityTitle}</h3>
                    <span className="badge bg-primary-100 text-primary-700">{app.opportunityType}</span>
                    <span className={`badge ${app.status === 'Approved' ? 'bg-green-100 text-green-700' : app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{app.applicantName} · {app.applicantEmail}</p>
                  <p className="text-xs text-gray-400 mt-1">Applied {app.appliedAt}</p>
                  {app.reviewNotes && <p className="text-sm text-gray-500 mt-2 italic">Note: {app.reviewNotes}</p>}
                </div>
                {app.status === 'Pending' && (
                  <div className="flex flex-col gap-2 min-w-[240px]">
                    <textarea
                      className="input-field min-h-[60px] text-sm"
                      placeholder="Review notes (optional)"
                      value={notes[app.id] || ''}
                      onChange={(e) => setNotes({ ...notes, [app.id]: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleReview(app.id, 'Approved')} className="btn-primary text-sm flex-1">
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button type="button" onClick={() => handleReview(app.id, 'Rejected')} className="btn-secondary text-sm flex-1 text-red-600">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                )}
                {app.status !== 'Pending' && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" /> Reviewed {app.reviewedAt || '—'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
