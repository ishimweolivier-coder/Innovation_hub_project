export default function StatsCard({ title, value, change, icon: Icon, color = 'primary' }) {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600 shadow-primary-500/20',
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/20',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/20',
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
    red: 'from-red-500 to-red-600 shadow-red-500/20',
  }

  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm mt-2 font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change} from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}
