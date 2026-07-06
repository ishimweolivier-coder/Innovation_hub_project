import { useState } from 'react'
import { Megaphone, Send } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'

export default function Announcements() {
  const { announcements, createAnnouncement } = useAppData()
  const [form, setForm] = useState({ title: '', message: '', audience: 'all' })
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createAnnouncement(form)
      showToast('Announcement published and users notified', 'success')
      setForm({ title: '', message: '', audience: 'all' })
    } catch (err) {
      showToast(err.message || 'Failed to publish', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">Publish Announcements</h2>
          <p className="text-gray-500 mt-1">Send notifications to entrepreneurs, investors, or all users</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label className="label">Title</label>
            <input className="input-field" placeholder="Announcement title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="input-field min-h-[120px]" placeholder="Write your announcement..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          </div>
          <div>
            <label className="label">Audience</label>
            <select className="input-field" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
              <option value="all">All Users</option>
              <option value="entrepreneurs">Entrepreneurs Only</option>
              <option value="investors">Investors Only</option>
            </select>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary">
            <Send className="w-4 h-4" />
            {submitting ? 'Publishing...' : 'Publish Announcement'}
          </button>
        </form>

        <div>
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary-600" /> Past Announcements
          </h3>
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No announcements yet</p>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{a.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{a.audience} · {a.date}</p>
                  </div>
                  <span className="badge bg-green-100 text-green-700">{a.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
