import DashboardLayout from '../../components/layout/DashboardLayout'
import { Building2, Mail } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { formatCurrency } from '../../data/constants'

export default function ManageInvestors() {
  const { investors } = useAppData()
  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">Manage Investors</h2>
          <p className="text-gray-500 mt-1">View and manage registered investors</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {investors.map((inv) => (
            <div key={inv.id} className="card p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-gray-900">{inv.name}</h3>
                  <p className="text-sm text-gray-500">{inv.company}</p>
                  <span className="badge bg-blue-100 text-blue-700 mt-2">{inv.type}</span>
                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-500"><Mail className="w-3.5 h-3.5" />{inv.email}</span>
                  </div>
                  <div className="flex items-center gap-6 mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <p className="font-bold text-gray-900">{formatCurrency(inv.totalInvested)}</p>
                      <p className="text-xs text-gray-400">Total Invested</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{inv.startups}</p>
                      <p className="text-xs text-gray-400">Startups</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
