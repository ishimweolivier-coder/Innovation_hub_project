import { useState } from 'react'
import { FileText, Printer, Download, ChevronDown } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { downloadCsv } from '../../utils/exportReport'

export default function ReportHub({
  role,
  reportOptions,
  applications = [],
  showStartupPicker = false,
}) {
  const { showToast } = useToast()
  const [selectedStartupId, setSelectedStartupId] = useState('')

  const handleGenerate = async (option) => {
    try {
      const startup = applications.find((a) => String(a.id) === String(selectedStartupId))
      if (option.requiresStartup && !startup) {
        showToast('Please select a startup first', 'error')
        return
      }
      await option.generate(startup)
      showToast(`Opening "${option.title}"…`, 'success')
    } catch (err) {
      showToast(err.message || 'Could not generate report', 'error')
    }
  }

  const handleCsv = async (option) => {
    try {
      await option.csvExport?.()
      showToast(`Downloaded "${option.title}" CSV`, 'success')
    } catch {
      showToast('CSV download failed', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {showStartupPicker && applications.length > 0 && (
        <div className="card p-5 bg-gradient-to-r from-primary-50 to-emerald-50 border border-primary-100">
          <label className="label">Select entrepreneur / startup for individual report</label>
          <div className="relative mt-1">
            <select
              className="input-field appearance-none pr-10 bg-white"
              value={selectedStartupId}
              onChange={(e) => setSelectedStartupId(e.target.value)}
            >
              <option value="">— Choose a startup —</option>
              {applications.map((a) => (
                <option key={a.id} value={a.id}>{a.name} — {a.founder}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {reportOptions.map((option) => (
          <div
            key={option.id}
            className="card p-6 hover:shadow-lg transition-all group border border-gray-100"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-gray-900">{option.title}</h4>
                  {option.adminOnly && (
                    <span className="text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Admin</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => handleGenerate(option)}
                    className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" /> Print / PDF
                  </button>
                  {option.csvExport && (
                    <button
                      type="button"
                      onClick={() => handleCsv(option)}
                      className="btn-ghost text-sm py-2 px-3 inline-flex items-center gap-2 border border-gray-200"
                    >
                      <Download className="w-4 h-4" /> CSV
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-5 bg-gray-50 border border-gray-100 text-sm text-gray-600">
        <p className="font-semibold text-gray-800 mb-2">Report features</p>
        <ul className="grid sm:grid-cols-2 gap-2 list-disc list-inside">
          <li>Official header with Innovation Hub logo</li>
          <li>Report ID and date stamp</li>
          <li>Prepared-by signature line</li>
          <li>Official stamp placeholder</li>
          <li>Authorized signature &amp; date</li>
          <li>Print or save as PDF from browser</li>
        </ul>
        {role === 'investor' && (
          <p className="mt-3 text-amber-800 bg-amber-50 px-3 py-2 rounded-lg">
            As an investor, you can generate reports for entrepreneur startups only.
          </p>
        )}
      </div>
    </div>
  )
}

export { downloadCsv }
