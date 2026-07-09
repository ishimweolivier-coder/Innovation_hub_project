import { useState, useEffect } from 'react'
import { Search, UserCheck, UserX, Plus, Pencil, Trash2, KeyRound, X } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAppData } from '../../context/AppDataContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { INVESTOR_TYPES } from '../../data/constants'

const roleColors = {
  Entrepreneur: 'bg-primary-100 text-primary-700',
  Investor: 'bg-blue-100 text-blue-700',
  Admin: 'bg-purple-100 text-purple-700',
}

const emptyForm = {
  fullName: '', email: '', password: '', role: 'Entrepreneur',
  phone: '', company: '', investorType: '', status: 'Active',
}

export default function ManageUsers() {
  const { users, createUser, updateUser, deleteUser, updateUserStatus, requestPasswordReset, refreshAuthData, loading } = useAppData()
  const { user: currentUser } = useAuth()
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setLoadError('Backend is taking longer than usual. Render free tier spins down after inactivity — this can take 30–60 seconds.')
    }, 15000)
    refreshAuthData().catch(() => setLoadError('Could not load users. Is the backend running?'))
    return () => clearTimeout(timer)
  }, [refreshAuthData])

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (user) => {
    setEditingId(user.id)
    setForm({
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || '',
      company: user.company || '',
      investorType: user.investorType || '',
      status: user.status,
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await updateUser(editingId, {
          fullName: form.fullName,
          email: form.email,
          role: form.role.toLowerCase(),
          phone: form.phone || null,
          company: form.company || null,
          investorType: form.investorType || null,
          status: form.status,
        })
        showToast('User updated successfully', 'success')
      } else {
        if (!form.password || form.password.length < 8) {
          showToast('Password must be at least 8 characters', 'error')
          setSaving(false)
          return
        }
        await createUser({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          role: form.role.toLowerCase(),
          phone: form.phone || null,
          company: form.company || null,
          investorType: form.investorType || null,
        })
        showToast('User created successfully', 'success')
      }
      setShowModal(false)
    } catch (err) {
      showToast(err.message || 'Failed to save user', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return
    try {
      await deleteUser(id)
      showToast('User deleted', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error')
    }
  }

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active'
    try {
      await updateUserStatus(id, newStatus)
      showToast(`User ${newStatus === 'Active' ? 'activated' : 'suspended'}`, 'success')
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error')
    }
  }

  const handleResetPassword = async (id, email) => {
    try {
      const result = await requestPasswordReset(id)
      showToast(`Password reset initiated for ${email}`, 'success')
      if (result.otp) {
        showToast(`Admin OTP (expires in ${result.expiresInMinutes || 15} min): ${result.otp}`, 'info')
      }
    } catch (err) {
      showToast(err.message || 'Failed to request reset', 'error')
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900">Manage Users</h2>
            <p className="text-gray-500 mt-1">
              {loading ? 'Loading users...' : `${users.length} registered users · Admins are created here only`}
            </p>
            {loadError && <p className="text-sm text-red-600 mt-1">{loadError}</p>}
            {!loading && !users.length && !loadError && (
              <button onClick={() => refreshAuthData().catch(() => setLoadError('Could not load users. Is the backend running?'))} className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-1">
                Retry loading users
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input className="input-field pl-11" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button onClick={openCreate} className="btn-primary text-sm whitespace-nowrap">
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                          {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.fullName}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className={`badge ${roleColors[user.role]}`}>{user.role}</span></td>
                    <td className="px-6 py-4">
                      <span className={`badge ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.status}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{user.joined}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(user)} className="p-2 rounded-lg hover:bg-gray-100" title="Edit">
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </button>
                        <button onClick={() => toggleStatus(user.id, user.status)} className="p-2 rounded-lg hover:bg-gray-100" title={user.status === 'Active' ? 'Suspend' : 'Activate'}>
                          {user.status === 'Active' ? <UserX className="w-4 h-4 text-red-500" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                        </button>
                        <button onClick={() => handleResetPassword(user.id, user.email)} className="p-2 rounded-lg hover:bg-gray-100" title="Request password reset">
                          <KeyRound className="w-4 h-4 text-amber-500" />
                        </button>
                        {user.id !== currentUser?.id && (
                          <button onClick={() => handleDelete(user.id, user.fullName)} className="p-2 rounded-lg hover:bg-gray-100" title="Delete">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {loading && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                      <p className="text-gray-400">Loading users... (backend may be waking up)</p>
                    </div>
                  </td></tr>
                )}
                {!loading && !filtered.length && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="card-elevated w-full max-w-lg p-6 bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg">{editingId ? 'Edit User' : 'Add User'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input-field" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              {!editingId && (
                <div>
                  <label className="label">Password</label>
                  <input type="password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
                </div>
              )}
              <div>
                <label className="label">Role</label>
                <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option>Entrepreneur</option>
                  <option>Investor</option>
                  <option>Admin</option>
                </select>
              </div>
              {form.role === 'Investor' && (
                <>
                  <div>
                    <label className="label">Company</label>
                    <input className="input-field" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Investor Type</label>
                    <select className="input-field" value={form.investorType} onChange={(e) => setForm({ ...form, investorType: e.target.value })}>
                      <option value="">Select type</option>
                      {INVESTOR_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="label">Phone</label>
                <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              {editingId && (
                <div>
                  <label className="label">Status</label>
                  <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option>Active</option>
                    <option>Suspended</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : editingId ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
