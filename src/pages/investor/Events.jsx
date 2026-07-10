import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import EventCard from '../../components/shared/EventCard'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'

export default function InvestorEvents() {
  const { events, registerForEvent, eventRegistrations } = useAppData()
  const { showToast } = useToast()
  const [registeringId, setRegisteringId] = useState(null)

  const handleRegister = async (event) => {
    setRegisteringId(event.id)
    try {
      await registerForEvent(event.id)
      showToast(`Registered for "${event.title}"!`, 'success')
    } catch (err) {
      showToast(err.message || 'Could not register', 'error')
    } finally {
      setRegisteringId(null)
    }
  }

  return (
    <DashboardLayout role="investor">
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">News & Events</h2>
          <p className="text-gray-500 mt-1">Industry events, pitch days, and networking opportunities</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              registered={eventRegistrations.includes(event.id)}
              onRegister={() => handleRegister(event)}
              loading={registeringId === event.id}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
