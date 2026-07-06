import { Link } from 'react-router-dom'
import { Calendar, ExternalLink } from 'lucide-react'

const typeColors = {
  Grant: 'bg-green-100 text-green-700',
  Competition: 'bg-purple-100 text-purple-700',
  Scholarship: 'bg-blue-100 text-blue-700',
  Incubation: 'bg-amber-100 text-amber-700',
}

export default function OpportunityCard({ opportunity, showApply = true, onApply, applied = false }) {
  return (
    <div className="card overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {opportunity.image && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={opportunity.image}
            alt={opportunity.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
          <span className={`absolute bottom-3 left-3 badge ${typeColors[opportunity.type] || 'bg-gray-100 text-gray-700'}`}>
            {opportunity.type}
          </span>
        </div>
      )}
      <div className="p-6">
        {!opportunity.image && (
          <div className="flex items-start justify-between mb-3">
            <span className={`badge ${typeColors[opportunity.type]}`}>{opportunity.type}</span>
          </div>
        )}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display font-bold text-lg text-gray-900 group-hover:text-primary-700 transition-colors">
            {opportunity.title}
          </h3>
          {opportunity.image && (
            <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />{opportunity.deadline}
            </span>
          )}
        </div>
        {!opportunity.image && (
          <span className="text-xs text-gray-400 block mb-2">Deadline: {opportunity.deadline}</span>
        )}
        <p className="text-gray-600 text-sm leading-relaxed">{opportunity.description}</p>
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-400">{opportunity.organization}</span>
          {showApply && (
            applied ? (
              <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
                Applied ✓
              </span>
            ) : (
              <button
                type="button"
                onClick={onApply}
                className="inline-flex items-center gap-1 text-sm text-primary-600 font-medium hover:gap-2 transition-all"
              >
                Apply <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
