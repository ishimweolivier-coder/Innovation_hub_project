import DashboardLayout from '../../components/layout/DashboardLayout'
import { useStartups } from '../../context/StartupContext'
import { useAuth } from '../../context/AuthContext'
import ReportHub from '../../components/reports/ReportHub'
import {
  generateApplicationsReport,
  generateAiEvaluationReport,
  generateEntrepreneurReport,
} from '../../utils/reportDocument'
import { buildApplicationsReport, buildAiReport } from '../../utils/exportReport'

export default function InvestorReports() {
  const { applications } = useStartups()
  const { user } = useAuth()

  const evaluated = applications.filter((a) => a.aiAssessment)

  const reportOptions = [
    {
      id: 'all-entrepreneurs',
      title: 'All Entrepreneur Evaluations',
      description: 'Summary report of every startup and founder on the platform',
      generate: () => generateApplicationsReport(applications, user),
      csvExport: () => buildApplicationsReport(applications),
    },
    {
      id: 'ai-evaluations',
      title: 'AI Evaluation Summary',
      description: 'Innovation scores, risk analysis, and ROI for all evaluated startups',
      generate: () => generateAiEvaluationReport(applications, user),
      csvExport: () => buildAiReport(applications),
    },
    {
      id: 'single-entrepreneur',
      title: 'Individual Entrepreneur Report',
      description: 'Full business idea report with AI advice, funding context, and matches',
      requiresStartup: true,
      generate: (startup) => generateEntrepreneurReport(startup, user, 'investor'),
    },
  ]

  return (
    <DashboardLayout role="investor">
      <div className="space-y-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">Entrepreneur Reports</h2>
          <p className="text-gray-500 mt-1">
            Generate official reports for entrepreneur startups — print or save as PDF
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Startups Available', value: applications.length },
            { label: 'AI Evaluated', value: evaluated.length },
            { label: 'Seeking Funding', value: applications.filter((a) => a.status === 'Seeking Funding').length },
          ].map((s, i) => (
            <div key={i} className="card p-5 text-center">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <ReportHub
          role="investor"
          reportOptions={reportOptions}
          applications={applications}
          showStartupPicker
        />
      </div>
    </DashboardLayout>
  )
}
