const API_BASE = import.meta.env.VITE_API_URL || '/api'

function getToken() {
  return localStorage.getItem('auth_token')
}

function setToken(token) {
  if (token) localStorage.setItem('auth_token', token)
  else localStorage.removeItem('auth_token')
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  } catch (err) {
    throw new Error('Network error — backend may be waking up: ' + err.message)
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed')
  }

  return data
}

function decodeToken(token) {
  if (!token || !token.startsWith('mock-token-')) return null
  const id = parseInt(token.replace('mock-token-', ''), 10)
  return Object.values(mockUsers).find((u) => u.id === id) || null
}

import {
  mockUsers,
  mockStartups,
  mockOpportunities,
  mockEvents,
  mockNotifications,
  mockConversations,
  mockInvestments,
  mockAdminStats,
} from '../data/mockData'

function persistDb() {
  localStorage.setItem('mock_db_users', JSON.stringify(db.users))
  localStorage.setItem('mock_db_startups', JSON.stringify(db.startups))
}

function loadArray(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : [...fallback]
  } catch {
    return [...fallback]
  }
}

const db = {
  startups: loadArray('mock_db_startups', mockStartups),
  users: loadArray('mock_db_users', Object.values(mockUsers)),
  opportunities: [...mockOpportunities],
  events: [...mockEvents],
  notifications: [...mockNotifications],
  conversations: { ...mockConversations },
  investments: [...mockInvestments],
  stats: { ...mockAdminStats },
}

function mockHandler(path, options) {
  const method = (options.method || 'GET').toUpperCase()
  const body = options.body ? JSON.parse(options.body) : {}

  if (method === 'GET') return handleMockGet(path)
  if (method === 'POST') return handleMockPost(path, body)
  if (method === 'PATCH') return handleMockPatch(path, body)
  if (method === 'PUT') return handleMockPut(path, body)
  if (method === 'DELETE') return handleMockDelete(path)

  throw new Error(`Mock: unsupported method ${method} for ${path}`)
}

function handleMockGet(path) {
  const match = path.match(/^\/applications\/(\d+)$/)
  if (match) {
    const app = db.startups.find((s) => s.id === parseInt(match[1], 10))
    if (!app) throw new Error('Application not found')
    return app
  }

  if (path === '/applications') return [...db.startups]
  if (path === '/applications/me') return db.startups.filter((s) => {
    const user = decodeToken(getToken())
    return user && Number(s.founderId) === Number(user.id)
  })
  if (path === '/opportunities') return [...db.opportunities]
  if (path === '/opportunities/my-applications') return []
  if (path === '/events') return [...db.events]
  if (path === '/events/my-registrations') return []
  if (path === '/notifications') return [...db.notifications]
  if (path === '/conversations') {
    const user = decodeToken(getToken())
    if (!user) return []
    const key = user.role === 'entrepreneur' ? 'entrepreneur' : user.role === 'investor' ? 'investor' : 'admin'
    return [...(db.conversations[key] || [])]
  }
  if (path === '/investments') return [...db.investments]
  if (path.startsWith('/applications/me/growth')) return { months: [], revenue: [], users: [] }
  if (path === '/admin/stats') return { ...db.stats }
  if (path === '/admin/users') return [...db.users]
  if (path === '/admin/investors') return [...db.users.filter((u) => u.role === 'investor')]
  if (path === '/admin/opportunity-applications') return []
  if (path.match(/^\/admin\/events\/\d+\/registrations$/)) return []
  if (path.match(/^\/admin\/facilitation-tracking/)) return []
  if (path.startsWith('/admin/facilitation-tracking')) return []
  if (path === '/auth/me') {
    const user = decodeToken(getToken())
    if (!user) throw new Error('Not authenticated')
    return { ...user }
  }
  if (path === '/public/stats') return {
    totalStartups: db.startups.length || 156,
    activeInvestors: 42,
    totalFunding: 450000000,
    successRate: 68,
  }
  if (path === '/public/opportunities') return [...db.opportunities]
  if (path === '/public/events') return [...db.events]
  if (path === '/ai/status') return { configured: false, status: 'Mock AI engine active' }
  if (path === '/announcements') return []

  throw new Error(`Mock: no handler for GET ${path}`)
}

function handleMockPost(path, body) {
  const evalMatch = path.match(/^\/applications\/(\d+)\/evaluate$/)
  if (evalMatch) {
    const id = parseInt(evalMatch[1], 10)
    const app = db.startups.find((s) => s.id === id)
    if (!app) throw new Error('Application not found')
    app.aiAssessment = {
      marketUniqueness: Math.floor(Math.random() * 30) + 65,
      productUniqueness: Math.floor(Math.random() * 30) + 65,
      overallInnovation: Math.floor(Math.random() * 25) + 70,
      riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      riskScore: Math.floor(Math.random() * 60) + 10,
      expectedProfit: app.projectedProfit || 10000000,
      expectedROI: Math.floor(Math.random() * 30) + 15,
    }
    app.evaluationSteps = [
      { step: 'Analyzing business model', status: 'done' },
      { step: 'Market analysis', status: 'done' },
      { step: 'Risk assessment', status: 'done' },
      { step: 'ROI projection', status: 'done' },
    ]
    return { ...app }
  }

  if (path === '/auth/login') {
    const { email, password } = body
    const user = db.users.find((u) => u.email === email)
    if (!user || password !== 'demo123') {
      throw new Error('Invalid email or password')
    }
    const token = `mock-token-${user.id}`
    setToken(token)
    return { token, user: { ...user } }
  }

  if (path === '/auth/register/entrepreneur' || path === '/auth/register/investor') {
    const newUser = {
      id: db.users.length + 1,
      fullName: body.fullName || body.name || 'New User',
      email: body.email,
      role: path.includes('entrepreneur') ? 'entrepreneur' : 'investor',
      avatar: (body.fullName || 'NU').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
      company: body.company || null,
    }
    db.users.push(newUser)
    persistDb()
    const token = `mock-token-${newUser.id}`
    setToken(token)
    return { token, user: { ...newUser } }
  }

  if (path === '/auth/verify-admin-otp') {
    const { email } = body
    const user = db.users.find((u) => u.email === email)
    if (!user) throw new Error('User not found')
    const token = `mock-token-${user.id}`
    setToken(token)
    return { token, user: { ...user } }
  }

  if (path === '/auth/resend-admin-otp') return { message: 'OTP sent' }
  if (path === '/auth/forgot-password') return { message: 'Reset link sent' }
  if (path === '/auth/resend-reset-link') return { message: 'Reset link sent' }
  if (path === '/auth/reset-password') return { message: 'Password reset successful' }

  if (path === '/applications') {
    const newApp = {
      id: Date.now(),
      name: body.startupName || 'Untitled',
      founder: body.founderName || 'Unknown',
      founderId: body.founderId || 1,
      category: body.category || 'Other',
      description: body.description || '',
      status: 'Submitted',
      stage: 1,
      fundingGoal: body.fundingGoal || 0,
      fundingRaised: 0,
      createdAt: new Date().toISOString().split('T')[0],
      image: '/images/startup-agritech.jpg',
      budgetAmount: body.budgetAmount || 0,
      projectedProfit: body.projectedProfit || 0,
      aiAssessment: null,
    }
    db.startups.unshift(newApp)
    persistDb()
    return { ...newApp }
  }

  if (path.match(/^\/opportunities\/\d+\/apply$/)) return { message: 'Applied successfully' }
  if (path.match(/^\/events\/\d+\/register$/)) return { message: 'Registered successfully' }
  if (path.match(/^\/conversations\/interest$/)) return { message: 'Interest expressed' }
  if (path.match(/^\/conversations\/\d+\/messages$/)) return { id: Date.now(), sender: 'me', text: body.text, time: 'Just now' }

  if (path === '/investments') {
    const inv = { id: db.investments.length + 1, ...body, date: new Date().toISOString().split('T')[0], status: 'Pending' }
    db.investments.push(inv)
    return inv
  }

  if (path === '/admin/investments') {
    const inv = { id: db.investments.length + 1, ...body, date: new Date().toISOString().split('T')[0], status: 'Active' }
    db.investments.push(inv)
    return inv
  }

  if (path === '/admin/users') {
    const u = { id: db.users.length + 1, ...body, avatar: (body.fullName || 'NU').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() }
    db.users.push(u)
    persistDb()
    return u
  }

  if (path === '/opportunities') {
    const opp = { id: db.opportunities.length + 1, ...body }
    db.opportunities.push(opp)
    return opp
  }

  if (path === '/events') {
    const evt = { id: db.events.length + 1, ...body }
    db.events.push(evt)
    return evt
  }

  if (path === '/announcements') return { id: Date.now(), ...body, createdAt: new Date().toISOString() }

  throw new Error(`Mock: no handler for POST ${path}`)
}

function handleMockPatch(path, body) {
  const statusMatch = path.match(/^\/applications\/(\d+)\/status$/)
  if (statusMatch) {
    const id = parseInt(statusMatch[1], 10)
    const app = db.startups.find((s) => s.id === id)
    if (!app) throw new Error('Application not found')
    if (body.status) app.status = body.status
    if (body.stage !== undefined) app.stage = body.stage
    persistDb()
    return { ...app }
  }

  const notifMatch = path.match(/^\/notifications\/(\d+)\/read$/)
  if (notifMatch) {
    const id = parseInt(notifMatch[1], 10)
    db.notifications = db.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
    return { message: 'Marked as read' }
  }

  if (path === '/notifications/read-all') {
    db.notifications = db.notifications.map((n) => ({ ...n, read: true }))
    return { message: 'All marked as read' }
  }

  const convMatch = path.match(/^\/conversations\/(\d+)\/read$/)
  if (convMatch) return { message: 'Marked as read' }

  const investMatch = path.match(/^\/investments\/(\d+)\/status$/)
  if (investMatch) {
    const id = parseInt(investMatch[1], 10)
    db.investments = db.investments.map((inv) => inv.id === id ? { ...inv, status: body.status } : inv)
    return { message: 'Status updated' }
  }

  const grantMatch = path.match(/^\/admin\/opportunity-applications\/(\d+)\/status$/)
  if (grantMatch) return { message: 'Application reviewed' }

  const userMatch = path.match(/^\/admin\/users\/(\d+)\/status$/)
  if (userMatch) return { message: 'User status updated' }

  const userResetMatch = path.match(/^\/admin\/users\/(\d+)\/reset-password$/)
  if (userResetMatch) return { message: 'Password reset' }

  const userUpdateMatch = path.match(/^\/admin\/users\/(\d+)$/)
  if (userUpdateMatch) {
    const id = parseInt(userUpdateMatch[1], 10)
    db.users = db.users.map((u) => u.id === id ? { ...u, ...body } : u)
    persistDb()
    return { message: 'User updated' }
  }

  const eventPatchMatch = path.match(/^\/admin\/events\/(\d+)$/)
  if (eventPatchMatch) {
    const id = parseInt(eventPatchMatch[1], 10)
    db.events = db.events.map((e) => e.id === id ? { ...e, ...body } : e)
    persistDb()
    return { message: 'Event updated' }
  }

  const oppPatchMatch = path.match(/^\/admin\/opportunities\/(\d+)$/)
  if (oppPatchMatch) {
    const id = parseInt(oppPatchMatch[1], 10)
    db.opportunities = db.opportunities.map((o) => o.id === id ? { ...o, ...body } : o)
    persistDb()
    return { message: 'Opportunity updated' }
  }

  throw new Error(`Mock: no handler for PATCH ${path}`)
}

function handleMockPut(path, body) {
  const oppMatch = path.match(/^\/opportunities\/(\d+)$/)
  if (oppMatch) {
    const id = parseInt(oppMatch[1], 10)
    db.opportunities = db.opportunities.map((o) => o.id === id ? { ...o, ...body } : o)
    persistDb()
    return { message: 'Opportunity updated' }
  }

  const eventMatch = path.match(/^\/events\/(\d+)$/)
  if (eventMatch) {
    const id = parseInt(eventMatch[1], 10)
    db.events = db.events.map((e) => e.id === id ? { ...e, ...body } : e)
    persistDb()
    return { message: 'Event updated' }
  }

  const userMatch = path.match(/^\/admin\/users\/(\d+)$/)
  if (userMatch) {
    const id = parseInt(userMatch[1], 10)
    db.users = db.users.map((u) => u.id === id ? { ...u, ...body } : u)
    persistDb()
    return { message: 'User updated' }
  }

  throw new Error(`Mock: no handler for PUT ${path}`)
}

function handleMockDelete(path) {
  const oppDelMatch = path.match(/^\/opportunities\/(\d+)$/)
  if (oppDelMatch) {
    const id = parseInt(oppDelMatch[1], 10)
    db.opportunities = db.opportunities.filter((o) => o.id !== id)
    persistDb()
    return { message: 'Deleted' }
  }

  const eventDelMatch = path.match(/^\/events\/(\d+)$/)
  if (eventDelMatch) {
    const id = parseInt(eventDelMatch[1], 10)
    db.events = db.events.filter((e) => e.id !== id)
    persistDb()
    return { message: 'Deleted' }
  }
  if (path.match(/^\/admin\/users\/(\d+)$/)) {
    const id = parseInt(path.match(/^\/admin\/users\/(\d+)$/)[1], 10)
    db.users = db.users.filter((u) => u.id !== id)
    persistDb()
    return { message: 'Deleted' }
  }

  throw new Error(`Mock: no handler for DELETE ${path}`)
}

export const api = {
  setToken,
  getToken,

  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  verifyAdminOtp: (email, otp) =>
    request('/auth/verify-admin-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),

  resendAdminOtp: (email) =>
    request('/auth/resend-admin-otp', { method: 'POST', body: JSON.stringify({ email }) }),

  registerEntrepreneur: (body) =>
    request('/auth/register/entrepreneur', { method: 'POST', body: JSON.stringify(body) }),

  registerInvestor: (body) =>
    request('/auth/register/investor', { method: 'POST', body: JSON.stringify(body) }),

  getMe: () => request('/auth/me'),

  getApplications: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/applications${query ? `?${query}` : ''}`)
  },

  getMyApplication: () => request('/applications/me'),

  getApplication: (id) => request(`/applications/${id}`),

  submitApplication: (body) =>
    request('/applications', { method: 'POST', body: JSON.stringify(body) }),

  evaluateApplication: (id) =>
    request(`/applications/${id}/evaluate`, { method: 'POST' }),

  updateApplicationStatus: (id, status, stage) =>
    request(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, stage }),
    }),

  getOpportunities: () => request('/opportunities'),
  applyToOpportunity: (id) => request(`/opportunities/${id}/apply`, { method: 'POST' }),
  getMyOpportunityApplications: () => request('/opportunities/my-applications'),
  createOpportunity: (body) => request('/opportunities', { method: 'POST', body: JSON.stringify(body) }),
  updateOpportunity: (id, body) => request(`/opportunities/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteOpportunity: (id) => request(`/opportunities/${id}`, { method: 'DELETE' }),

  getEvents: () => request('/events'),
  registerForEvent: (id) => request(`/events/${id}/register`, { method: 'POST' }),
  getMyEventRegistrations: () => request('/events/my-registrations'),
  createEvent: (body) => request('/events', { method: 'POST', body: JSON.stringify(body) }),
  updateEvent: (id, body) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),
  getEventRegistrations: (eventId) => request(`/admin/events/${eventId}/registrations`),

  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),

  getConversations: () => request('/conversations'),
  markConversationRead: (id) => request(`/conversations/${id}/read`, { method: 'PATCH' }),
  sendMessage: (conversationId, text) =>
    request(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  expressInterest: (startupId) =>
    request('/conversations/interest', { method: 'POST', body: JSON.stringify({ startupId }) }),

  getInvestments: () => request('/investments'),
  createInvestment: (body) => request('/investments', { method: 'POST', body: JSON.stringify(body) }),
  updateInvestmentStatus: (id, status) =>
    request(`/investments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  createAdminInvestment: (body) => request('/admin/investments', { method: 'POST', body: JSON.stringify(body) }),

  getGrantApplications: () => request('/admin/opportunity-applications'),
  reviewGrantApplication: (id, status, reviewNotes = '') =>
    request(`/admin/opportunity-applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reviewNotes }),
    }),

  getAdminStats: () => request('/admin/stats'),
  getUsers: () => request('/admin/users'),
  createUser: (body) => request('/admin/users', { method: 'POST', body: JSON.stringify(body) }),
  updateUser: (id, body) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  updateUserStatus: (id, status) =>
    request(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  requestPasswordReset: (id) =>
    request(`/admin/users/${id}/reset-password`, { method: 'POST' }),
  getInvestors: () => request('/admin/investors'),

  getFacilitationTracking: (startupId) => {
    const query = startupId ? `?startupId=${startupId}` : ''
    return request(`/admin/facilitation-tracking${query}`)
  },

  forgotPassword: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resendResetLink: (email) =>
    request('/auth/resend-reset-link', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (body) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),

  getGrowthData: () => request('/applications/me/growth'),

  getPublicStats: () => request('/public/stats'),
  getPublicOpportunities: () => request('/public/opportunities'),
  getPublicEvents: () => request('/public/events'),

  getAiStatus: () => request('/ai/status'),

  getAnnouncements: () => request('/announcements'),
  createAnnouncement: (body) =>
    request('/announcements', { method: 'POST', body: JSON.stringify(body) }),
}

export default api
