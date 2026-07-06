export function downloadCsv(filename, rows) {
  const csv = rows.map((row) =>
    row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
  ).join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function buildApplicationsReport(applications) {
  const rows = [
    ['Startup', 'Founder', 'Category', 'Status', 'Funding Goal', 'Innovation Score', 'Risk', 'ROI'],
    ...applications.map((a) => [
      a.name,
      a.founder,
      a.category,
      a.status,
      a.fundingGoal,
      a.aiAssessment?.overallInnovation ?? '—',
      a.aiAssessment?.riskLevel ?? '—',
      a.aiAssessment?.expectedROI ?? '—',
    ]),
  ]
  downloadCsv('startup-applications-report.csv', rows)
}

export function buildFundingReport(investments, stats) {
  const rows = [
    ['Metric', 'Value'],
    ['Total Funding Volume', stats.fundingVolume],
    ['Total Startups', stats.totalStartups],
    ['Approved Startups', stats.approvedStartups],
    ['Success Rate', `${stats.successRate}%`],
    [],
    ['Startup', 'Investor', 'Amount', 'Date', 'Status'],
    ...investments.map((i) => [i.startup, i.investor, i.amount, i.date, i.status]),
  ]
  downloadCsv('funding-summary-report.csv', rows)
}

export function buildInvestorReport(investors, conversations) {
  const rows = [
    ['Name', 'Company', 'Type', 'Min Innovation', 'Status'],
    ...investors.map((i) => [i.name, i.company, i.type, i.minInnovation, i.status]),
    [],
    ['Active Conversations', conversations.length],
  ]
  downloadCsv('investor-activity-report.csv', rows)
}

export function buildAiReport(applications) {
  const evaluated = applications.filter((a) => a.aiAssessment)
  const rows = [
    ['Startup', 'Innovation', 'Risk Level', 'Risk Score', 'Profit Prediction', 'ROI', 'Matches'],
    ...evaluated.map((a) => [
      a.name,
      a.aiAssessment.overallInnovation,
      a.aiAssessment.riskLevel,
      a.aiAssessment.riskScore,
      a.aiAssessment.profitPrediction,
      a.aiAssessment.expectedROI,
      a.investorMatches?.length ?? 0,
    ]),
  ]
  downloadCsv('ai-evaluation-report.csv', rows)
}

export function buildFacilitationReport(data) {
  const journeys = data?.journeys || []
  const rows = [
    ['Startup', 'Founder', 'Investor', 'Communication Status', 'Status Comment', 'Messages', 'Investment Amount', 'Investment Status', 'Funding Progress'],
    ...journeys.map((j) => [
      j.startupName,
      j.founderName,
      j.investorName,
      j.communicationStatus || j.currentStage || '',
      j.statusComment || j.facilitationInsight || '',
      j.messageCount ?? 0,
      j.investmentAmount ?? '',
      j.investmentStatus || '',
      j.fundingProgress != null ? `${j.fundingProgress}%` : '',
    ]),
  ]
  downloadCsv('investor-facilitation-report.csv', rows)
}
