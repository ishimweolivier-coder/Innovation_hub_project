import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Send, Search, Mail, Phone, Building2 } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'

export default function Messages({ role }) {
  const { conversations, sendMessage, markConversationRead } = useAppData()
  const [searchParams] = useSearchParams()
  const initialConvId = searchParams.get('conversation')
  const [activeId, setActiveId] = useState(initialConvId ? Number(initialConvId) : conversations[0]?.id)
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const { showToast } = useToast()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (initialConvId) {
      setActiveId(Number(initialConvId))
    } else if (!activeId && conversations.length) {
      setActiveId(conversations[0].id)
    }
  }, [conversations, activeId, initialConvId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeId, conversations])

  const handleSelectConversation = async (convId) => {
    setActiveId(convId)
    const conv = conversations.find((c) => c.id === convId)
    if (conv?.unread > 0) {
      try {
        await markConversationRead(convId)
      } catch {
        // ignore
      }
    }
  }

  const active = conversations.find((c) => c.id === activeId)
  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSend = async (e) => {
    e.preventDefault()
    if (!draft.trim() || !active) return

    try {
      await sendMessage(active.id, draft.trim())
      setDraft('')
    } catch {
      showToast('Failed to send message', 'error')
    }
  }

  return (
    <DashboardLayout role={role}>
      <div className="card overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-8rem)]">
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-display font-bold text-lg text-gray-900">Messages</h2>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="input-field pl-10 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                <p>No conversations yet.</p>
                <p className="mt-2 text-xs">Messages appear when users connect or express interest.</p>
              </div>
            ) : (
              filtered.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50
                    ${activeId === conv.id ? 'bg-primary-50/50' : ''}`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                      {conv.avatar}
                    </div>
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900 truncate">{conv.name}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{conv.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{conv.role}</p>
                    <p className="text-sm text-gray-600 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                      {conv.unread}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {active ? (
            <>
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                    {active.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{active.name}</p>
                    <p className="text-sm text-gray-500">{active.role}</p>
                  </div>
                </div>
                {(active.contactEmail || active.contactPhone) && (
                  <div className="flex flex-wrap gap-3 text-sm">
                    {active.contactEmail && (
                      <a href={`mailto:${active.contactEmail}`} className="inline-flex items-center gap-1.5 text-primary-600 hover:underline">
                        <Mail className="w-4 h-4" /> {active.contactEmail}
                      </a>
                    )}
                    {active.contactPhone && (
                      <a href={`tel:${active.contactPhone}`} className="inline-flex items-center gap-1.5 text-primary-600 hover:underline">
                        <Phone className="w-4 h-4" /> {active.contactPhone}
                      </a>
                    )}
                    {active.contactCompany && (
                      <span className="inline-flex items-center gap-1.5 text-gray-500">
                        <Building2 className="w-4 h-4" /> {active.contactCompany}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {active.messages?.length ? (
                  active.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm
                          ${msg.sender === 'me'
                            ? 'bg-primary-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-800 rounded-bl-md'
                          }`}
                      >
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-primary-200' : 'text-gray-400'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 text-sm py-8">
                    No messages yet. Say hello to start the conversation.
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="input-field flex-1"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button type="submit" className="btn-primary px-4">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
