import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { StatusBadge, RiskBadge } from '../../components/shared/Badges'
import { STARTUP_CATEGORIES } from '../../data/constants'
import { useStartups } from '../../context/StartupContext'

export default function BrowseStartups() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const { applications } = useStartups()

  const filtered = applications.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !category || s.category === category
    const hasAI = !!s.aiAssessment
    return matchSearch && matchCategory && s.stage >= 2 && hasAI
  })

  return (
    <DashboardLayout role="investor">
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">Browse Startups</h2>
          <p className="text-gray-500 mt-1">AI-evaluated startups ranked by innovation score and investor match</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input className="input-field pl-11" placeholder="Search startups..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select className="input-field pl-10 pr-8 min-w-[180px]" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {STARTUP_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((startup) => (
            <Link key={startup.id} to={`/investor/startups/${startup.id}`} className="card overflow-hidden hover:shadow-lg transition-all group">
              <div className="relative h-36 overflow-hidden">
                <img
                  src={startup.image}
                  alt={startup.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent" />
                <span className="absolute top-3 right-3"><StatusBadge status={startup.status} /></span>
                <span className="absolute top-3 left-3 badge bg-white/20 text-white backdrop-blur-sm border border-white/20">{startup.category}</span>
              </div>
              <div className="p-5">
                <h3 className="font-display font-bold text-lg text-gray-900 group-hover:text-primary-700 transition-colors">{startup.name}</h3>
                <p className="text-sm text-gray-500">by {startup.founder}</p>
                <p className="text-sm text-gray-600 line-clamp-2 mt-2">{startup.description}</p>
                {startup.aiAssessment && (
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className="badge bg-primary-100 text-primary-700">{startup.aiAssessment.overallInnovation}% Score</span>
                    <RiskBadge level={startup.aiAssessment.riskLevel} />
                    <span className="badge bg-indigo-100 text-indigo-700">ROI {startup.aiAssessment.expectedROI}%</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No AI-evaluated startups found matching your criteria</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
