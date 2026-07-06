import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import OpportunityCard from '../../components/shared/OpportunityCard'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'

const FILTERS = ['All', 'Grant', 'Competition', 'Scholarship', 'Incubation']

export default function Opportunities() {
  const { opportunities, applyToOpportunity, opportunityApplications } = useAppData()
  const [activeFilter, setActiveFilter] = useState('All')
  const { showToast } = useToast()

  const filtered = activeFilter === 'All'
    ? opportunities
    : opportunities.filter((o) => o.type === activeFilter)

  const handleApply = async (opp) => {
    try {
      await applyToOpportunity(opp.id)
      showToast(`Application submitted for "${opp.title}"`, 'success')
    } catch (err) {
      showToast(err.message || 'Could not apply', 'error')
    }
  }

  return (
    <DashboardLayout role="entrepreneur">
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">Funding Opportunities</h2>
          <p className="text-gray-500 mt-1">Grants, competitions, scholarships, and incubation programs</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${activeFilter === filter
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>No opportunities found for this category.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                applied={opportunityApplications.includes(opp.id)}
                onApply={() => handleApply(opp)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
