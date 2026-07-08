import { useState } from 'react'
import { Plus, Calendar, Trash2, Pencil, Users } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'
import { IMAGES } from '../../data/images'

const emptyForm = { title: '', type: 'Workshop', date: '', location: '', description: '', image: IMAGES.eventWorkshop }

export default function ManageEvents() {
  const { events, createEvent, updateEvent, deleteEvent, getEventRegistrations } = useAppData()
  const { showToast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [registrations, setRegistrations] = useState([])
  const [viewingEventId, setViewingEventId] = useState(null)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (event) => {
    setEditingId(event.id)
    setForm({
      title: event.title || '',
      type: event.type || 'Workshop',
      date: event.date || '',
      location: event.location || '',
      description: event.description || '',
      image: event.image || IMAGES.eventWorkshop,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await updateEvent(editingId, form)
      } else {
        await createEvent(form)
      }
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
    } catch (err) {
      showToast(err.message || 'Failed to save event', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id)
      showToast('Event deleted', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to delete event', 'error')
    }
  }

  const handleViewRegistrations = async (eventId) => {
    setViewingEventId(eventId)
    try {
      const data = await getEventRegistrations(eventId)
      setRegistrations(data)
    } catch (err) {
      showToast(err.message || 'Failed to load registrations', 'error')
      setRegistrations([])
    }
  }



  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900">Manage Events</h2>
            <p className="text-gray-500 mt-1">Create workshops, demo days, and networking events</p>
          </div>
          <button onClick={openCreate} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Add Event
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
                  {['Workshop', 'Demo Day', 'Networking', 'Conference'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Date</label>
                <input type="date" className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input-field min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : editingId ? 'Update Event' : 'Save Event'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </form>
        )}

        {viewingEventId && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Event Registrations</h3>
              <button type="button" className="btn-secondary text-sm" onClick={() => setViewingEventId(null)}>Close</button>
            </div>
            {registrations.length === 0 ? (
              <p className="text-sm text-gray-500">No registrations yet.</p>
            ) : (
              <div className="space-y-2">
                {registrations.map((r) => (
                  <div key={r.id} className="flex justify-between text-sm border-b border-gray-100 py-2">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-gray-500">{r.email}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="card p-5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  <span className="badge bg-primary-100 text-primary-700">{event.type}</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">{event.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{event.date}</span>
                  <span>{event.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleViewRegistrations(event.id)} className="p-2 rounded-lg hover:bg-gray-50 text-gray-600" title="View registrations">
                  <Users className="w-4 h-4" />
                </button>
                <button onClick={() => openEdit(event)} className="p-2 rounded-lg hover:bg-gray-50 text-gray-600">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(event.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
