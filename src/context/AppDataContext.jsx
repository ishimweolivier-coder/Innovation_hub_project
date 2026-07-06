import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const AppDataContext = createContext(null)

const emptyStats = {
  totalStartups: 0,
  approvedStartups: 0,
  rejectedStartups: 0,
  pendingReview: 0,
  activeInvestors: 0,
  newInvestorRegistrations: 0,
  investmentRequests: 0,
  fundingVolume: 0,
  successRate: 0,
  monthlyGrowth: [],
  categoryDistribution: [],
}

export function AppDataProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const [opportunities, setOpportunities] = useState([])
  const [events, setEvents] = useState([])
  const [notifications, setNotifications] = useState([])
  const [conversations, setConversations] = useState([])
  const [investments, setInvestments] = useState([])
  const [adminStats, setAdminStats] = useState(emptyStats)
  const [users, setUsers] = useState([])
  const [investors, setInvestors] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [eventRegistrations, setEventRegistrations] = useState([])
  const [opportunityApplications, setOpportunityApplications] = useState([])
  const [grantApplications, setGrantApplications] = useState([])
  const [publicStats, setPublicStats] = useState({ totalStartups: 0, activeInvestors: 0, successRate: 0, fundingVolume: 0 })
  const [loading, setLoading] = useState(false)

  const refreshPublicData = useCallback(async () => {
    try {
      const [stats, opps, evts] = await Promise.all([
        api.getPublicStats(),
        api.getPublicOpportunities(),
        api.getPublicEvents(),
      ])
      setPublicStats(stats)
      setOpportunities(Array.isArray(opps) ? opps : [])
      setEvents(Array.isArray(evts) ? evts : [])
    } catch {
      setOpportunities([])
      setEvents([])
    }
  }, [])

  const refreshAuthData = useCallback(async () => {
    if (!isAuthenticated || !user) return
    setLoading(true)
    try {
      const fetches = [
        api.getOpportunities().then((d) => setOpportunities(Array.isArray(d) ? d : [])),
        api.getEvents().then((d) => setEvents(Array.isArray(d) ? d : [])),
        api.getNotifications().then((d) => setNotifications(Array.isArray(d) ? d : [])),
        api.getConversations().then((d) => setConversations(Array.isArray(d) ? d : [])),
        api.getMyEventRegistrations().then((d) => setEventRegistrations(Array.isArray(d) ? d : [])).catch(() => setEventRegistrations([])),
        api.getMyOpportunityApplications().then((d) => setOpportunityApplications(Array.isArray(d) ? d : [])).catch(() => setOpportunityApplications([])),
      ]

      if (user.role === 'investor' || user.role === 'admin') {
        fetches.push(api.getInvestments().then((d) => setInvestments(Array.isArray(d) ? d : [])))
      }
      if (user.role === 'admin') {
        fetches.push(
          api.getAdminStats().then((d) => setAdminStats(d || emptyStats)),
          api.getUsers().then((d) => setUsers(Array.isArray(d) ? d : [])),
          api.getInvestors().then((d) => setInvestors(Array.isArray(d) ? d : [])),
          api.getAnnouncements().then((d) => setAnnouncements(Array.isArray(d) ? d : [])),
          api.getGrantApplications().then((d) => setGrantApplications(Array.isArray(d) ? d : [])).catch(() => setGrantApplications([])),
        )
      }

      await Promise.allSettled(fetches)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  useEffect(() => { refreshPublicData() }, [refreshPublicData])
  useEffect(() => { refreshAuthData() }, [refreshAuthData])

  const sendMessage = useCallback(async (conversationId, text) => {
    const msg = await api.sendMessage(conversationId, text)
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, msg], lastMessage: text, time: msg.time }
          : c
      )
    )
  }, [])

  const markConversationRead = useCallback(async (conversationId) => {
    await api.markConversationRead(conversationId)
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c))
    )
  }, [])

  const markNotificationRead = useCallback(async (id) => {
    await api.markNotificationRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    await api.markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const registerForEvent = useCallback(async (eventId) => {
    await api.registerForEvent(eventId)
    setEventRegistrations((prev) => [...prev, eventId])
    const data = await api.getNotifications()
    setNotifications(Array.isArray(data) ? data : [])
  }, [])

  const applyToOpportunity = useCallback(async (opportunityId) => {
    await api.applyToOpportunity(opportunityId)
    setOpportunityApplications((prev) => [...prev, opportunityId])
    const data = await api.getNotifications()
    setNotifications(Array.isArray(data) ? data : [])
  }, [])

  const createAnnouncement = useCallback(async (body) => {
    const created = await api.createAnnouncement(body)
    setAnnouncements((prev) => [created, ...prev])
    return created
  }, [])

  const expressInterest = useCallback(async (startupId) => {
    const result = await api.expressInterest(startupId)
    await refreshAuthData()
    return result
  }, [refreshAuthData])

  const createOpportunity = useCallback(async (body) => {
    const created = await api.createOpportunity(body)
    setOpportunities((prev) => [...prev, created])
    return created
  }, [])

  const updateOpportunity = useCallback(async (id, body) => {
    const updated = await api.updateOpportunity(id, body)
    setOpportunities((prev) => prev.map((o) => (o.id === id ? updated : o)))
    return updated
  }, [])

  const deleteOpportunity = useCallback(async (id) => {
    await api.deleteOpportunity(id)
    setOpportunities((prev) => prev.filter((o) => o.id !== id))
  }, [])

  const createUser = useCallback(async (body) => {
    const created = await api.createUser(body)
    setUsers((prev) => [...prev, created])
    return created
  }, [])

  const updateUser = useCallback(async (id, body) => {
    const updated = await api.updateUser(id, body)
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
    return updated
  }, [])

  const deleteUser = useCallback(async (id) => {
    await api.deleteUser(id)
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }, [])

  const updateUserStatus = useCallback(async (id, status) => {
    await api.updateUserStatus(id, status)
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)))
  }, [])

  const requestPasswordReset = useCallback(async (id) => {
    return api.requestPasswordReset(id)
  }, [])

  const createEvent = useCallback(async (body) => {
    const created = await api.createEvent(body)
    setEvents((prev) => [...prev, created])
    return created
  }, [])

  const updateEvent = useCallback(async (id, body) => {
    const updated = await api.updateEvent(id, body)
    setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)))
    return updated
  }, [])

  const deleteEvent = useCallback(async (id) => {
    await api.deleteEvent(id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const getEventRegistrations = useCallback(async (eventId) => api.getEventRegistrations(eventId), [])

  const refreshGrantApplications = useCallback(async () => {
    const data = await api.getGrantApplications()
    setGrantApplications(Array.isArray(data) ? data : [])
  }, [])

  const reviewGrantApplication = useCallback(async (id, status, reviewNotes = '') => {
    await api.reviewGrantApplication(id, status, reviewNotes)
    await refreshGrantApplications()
  }, [refreshGrantApplications])

  const createInvestment = useCallback(async (body) => {
    const created = await api.createInvestment(body)
    setInvestments((prev) => [...prev, created])
    await refreshAuthData()
    return created
  }, [refreshAuthData])

  const createAdminInvestment = useCallback(async (body) => {
    const created = await api.createAdminInvestment(body)
    setInvestments((prev) => [...prev, created])
    await refreshAuthData()
    return created
  }, [refreshAuthData])

  return (
    <AppDataContext.Provider value={{
      opportunities,
      events,
      notifications,
      conversations,
      investments,
      adminStats,
      publicStats,
      users,
      investors,
      announcements,
      eventRegistrations,
      opportunityApplications,
      grantApplications,
      loading,
      sendMessage,
      markConversationRead,
      markNotificationRead,
      markAllNotificationsRead,
      registerForEvent,
      applyToOpportunity,
      createAnnouncement,
      expressInterest,
      createOpportunity,
      updateOpportunity,
      deleteOpportunity,
      createUser,
      updateUser,
      deleteUser,
      updateUserStatus,
      requestPasswordReset,
      createEvent,
      updateEvent,
      deleteEvent,
      getEventRegistrations,
      refreshGrantApplications,
      reviewGrantApplication,
      createInvestment,
      createAdminInvestment,
      refreshAuthData,
      refreshPublicData,
    }}>
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
