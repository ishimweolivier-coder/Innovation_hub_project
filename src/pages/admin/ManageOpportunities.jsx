import { useState } from 'react'
import { Plus, Calendar, Trash2, Pencil } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'

const emptyForm = { title: '', type: 'Grant', description: '', deadline: '', organization: '', image: '/images/opp-grant.jpg' }

export default function ManageOpportunities() {
  const { opportunities, createOpportunity, updateOpportunity, deleteOpportunity } = useAppData()
  const { showToast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (opp) => {
    setEditingId(opp.id)
    setForm({
      title: opp.title || '',
      type: opp.type || 'Grant',
      description: opp.description || '',
      deadline: opp.deadline || '',
      organization: opp.organization || '',
      image: opp.image || '/images/opp-grant.jpg',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await updateOpportunity(editingId, form)
      } else {
        await createOpportunity(form)
      }
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
    } catch (err) {
      showToast(err.message || 'Failed to save opportunity', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete opportunity "${title}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      await deleteOpportunity(id)
      showToast('Opportunity deleted', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to delete opportunity', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900">Manage Opportunities</h2>
            <p className="text-gray-500 mt-1">Create and manage grants, competitions, and programs</p>
          </div>
          <button onClick={openCreate} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Add Opportunity
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card p-6 space-y-4 animate-fade-in">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Title</label>
                <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {['Grant', 'Competition', 'Scholarship', 'Incubation'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input-field min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Deadline</label>
                <input type="date" className="input-field" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
              </div>
              <div>
                <label className="label">Organization</label>
                <input className="input-field" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} required />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : editingId ? 'Update Opportunity' : 'Save Opportunity'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {opportunities.map((opp) => (
            <div key={opp.id} className="card p-5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">{opp.title}</h3>
                  <span className="badge bg-primary-100 text-primary-700">{opp.type}</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">{opp.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{opp.deadline}</span>
                  <span>{opp.organization}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(opp)} className="p-2 rounded-lg hover:bg-gray-50 text-gray-600">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(opp.id, opp.title)} disabled={deletingId === opp.id} className="p-2 rounded-lg hover:bg-red-50 text-red-500 disabled:opacity-50">
                  {deletingId === opp.id ? '…' : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
