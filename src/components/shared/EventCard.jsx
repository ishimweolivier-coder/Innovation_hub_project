import { Clock, MapPin } from 'lucide-react'

export default function EventCard({ event, onRegister, registered = false, loading = false }) {
  return (
    <div className="card overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative h-44 overflow-hidden">
        <img
          src={event.image || '/images/event-placeholder.jpg'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/20 to-transparent" />
        <span className="absolute top-3 left-3 badge bg-white/20 text-white backdrop-blur-sm border border-white/25">
          {event.type}
        </span>
      </div>
      <div className="p-6">
        <h3 className="font-display font-bold text-lg text-gray-900 group-hover:text-primary-700 transition-colors">
          {event.title}
        </h3>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description}</p>
        <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{event.date}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.location}</span>
        </div>
        {onRegister !== false && (
          registered ? (
            <button type="button" disabled className="btn-secondary text-sm w-full mt-4 py-2.5 opacity-70 cursor-default">
              Registered ✓
            </button>
          ) : (
            <button type="button" onClick={onRegister} disabled={loading} className="btn-primary text-sm w-full mt-4 py-2.5 disabled:opacity-60">
              {loading ? 'Registering…' : 'Register'}
            </button>
          )
        )}
      </div>
    </div>
  )
}
