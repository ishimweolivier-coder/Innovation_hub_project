import { formatCurrency } from '../data/constants'

const REPORT_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Georgia, serif; color: #1e293b; background: #fff; line-height: 1.5; }
  @page { size: A4; margin: 14mm; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
    .page-break { page-break-before: always; }
  }
  .report { max-width: 210mm; margin: 0 auto; padding: 24px; }
  .header-band {
    background: linear-gradient(135deg, #14532d 0%, #15803d 45%, #166534 100%);
    color: #fff; padding: 28px 32px; border-radius: 12px 12px 0 0;
    display: flex; justify-content: space-between; align-items: flex-start; gap: 24px;
  }
  .logo-block { display: flex; align-items: center; gap: 16px; }
  .logo-mark {
    width: 56px; height: 56px; background: rgba(255,255,255,0.15);
    border: 2px solid rgba(255,255,255,0.35); border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; font-weight: 800;
  }
  .org-name { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
  .org-tagline { font-size: 11px; opacity: 0.9; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.08em; }
  .meta-block { text-align: right; font-size: 12px; opacity: 0.95; }
  .meta-block p { margin-bottom: 4px; }
  .meta-block strong { font-weight: 600; }
  .title-bar {
    background: #f8fafc; border: 1px solid #e2e8f0; border-top: none;
    padding: 20px 32px; border-bottom: 3px solid #15803d;
  }
  .report-title { font-size: 20px; font-weight: 700; color: #0f172a; }
  .report-subtitle { font-size: 13px; color: #64748b; margin-top: 6px; }
  .confidential {
    display: inline-block; margin-top: 10px; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.1em; color: #b45309;
    background: #fef3c7; padding: 4px 10px; border-radius: 4px;
  }
  .body { padding: 28px 32px; border: 1px solid #e2e8f0; border-top: none; }
  .section { margin-bottom: 28px; }
  .section h2 {
    font-size: 14px; font-weight: 700; color: #15803d; text-transform: uppercase;
    letter-spacing: 0.06em; margin-bottom: 12px; padding-bottom: 8px;
    border-bottom: 2px solid #dcfce7;
  }
  .section p, .section li { font-size: 13px; color: #334155; margin-bottom: 8px; }
  .section ul { padding-left: 20px; }
  .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
  .metric {
    background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;
    padding: 14px; text-align: center;
  }
  .metric-value { font-size: 18px; font-weight: 800; color: #14532d; }
  .metric-label { font-size: 10px; color: #64748b; margin-top: 4px; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
  th {
    background: #14532d; color: #fff; text-align: left; padding: 10px 12px;
    font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;
  }
  td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
  tr:nth-child(even) td { background: #f8fafc; }
  .highlight-box {
    background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 18px;
    border-radius: 0 8px 8px 0; margin: 12px 0; font-size: 13px;
  }
  .signatures {
    display: grid; grid-template-columns: 1fr 140px 1fr; gap: 24px;
    margin-top: 40px; padding-top: 28px; border-top: 2px dashed #cbd5e1;
  }
  .sig-box { text-align: center; }
  .sig-line {
    height: 48px; border-bottom: 2px solid #334155; margin-bottom: 8px;
    margin-top: 20px;
  }
  .sig-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; }
  .sig-name { font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 4px; }
  .sig-role { font-size: 11px; color: #64748b; }
  .stamp-box { text-align: center; }
  .stamp-area {
    width: 100px; height: 100px; border: 2px dashed #94a3b8; border-radius: 50%;
    margin: 12px auto 8px; display: flex; align-items: center; justify-content: center;
    font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: 600;
  }
  .footer {
    margin-top: 24px; padding: 16px 32px; background: #f1f5f9; border-radius: 0 0 12px 12px;
    border: 1px solid #e2e8f0; border-top: none; font-size: 10px; color: #64748b;
    display: flex; justify-content: space-between;
  }
  .toolbar {
    position: fixed; top: 16px; right: 16px; display: flex; gap: 8px; z-index: 100;
  }
  .toolbar button {
    padding: 10px 20px; border: none; border-radius: 8px; font-weight: 600;
    cursor: pointer; font-size: 14px;
  }
  .btn-print { background: #15803d; color: #fff; }
  .btn-close { background: #e2e8f0; color: #334155; }
`

function escapeHtml(text) {
  if (text == null) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function reportId() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `IHR-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.floor(Math.random() * 9000 + 1000)}`
}

function formatReportDate(date = new Date()) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function renderTable(headers, rows) {
  if (!rows?.length) return '<p><em>No data available.</em></p>'
  return `
    <table>
      <thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${row.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`
}

function renderMetrics(metrics) {
  if (!metrics?.length) return ''
  return `<div class="metrics">${metrics.map((m) => `
    <div class="metric"><div class="metric-value">${escapeHtml(m.value)}</div><div class="metric-label">${escapeHtml(m.label)}</div></div>
  `).join('')}</div>`
}

function renderSections(sections) {
  return sections.map((s) => `
    <div class="section">
      <h2>${escapeHtml(s.heading)}</h2>
      ${s.content ? `<div>${s.content}</div>` : ''}
      ${s.metrics ? renderMetrics(s.metrics) : ''}
      ${s.table ? renderTable(s.table.headers, s.table.rows) : ''}
      ${s.highlight ? `<div class="highlight-box">${s.highlight}</div>` : ''}
    </div>`).join('')
}

export function buildReportHtml({
  title,
  subtitle,
  reportType,
  preparedBy,
  preparedByRole,
  recipientLabel = 'Authorized Officer',
  sections = [],
  confidential = true,
}) {
  const id = reportId()
  const dateStr = formatReportDate()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(title)} — Innovation Hub Rwanda</title>
  <style>${REPORT_STYLES}</style>
</head>
<body>
  <div class="toolbar no-print">
    <button class="btn-print" onclick="window.print()">Print / Save PDF</button>
    <button class="btn-close" onclick="window.close()">Close</button>
  </div>
  <div class="report">
    <header class="header-band">
      <div class="logo-block">
        <div class="logo-mark">IH</div>
        <div>
          <div class="org-name">Innovation Hub Rwanda</div>
          <div class="org-tagline">Startup · Investment · Innovation Platform</div>
        </div>
      </div>
      <div class="meta-block">
        <p><strong>Report ID:</strong> ${escapeHtml(id)}</p>
        <p><strong>Date:</strong> ${escapeHtml(dateStr)}</p>
        <p><strong>Type:</strong> ${escapeHtml(reportType)}</p>
        <p><strong>Prepared by:</strong> ${escapeHtml(preparedBy)}</p>
      </div>
    </header>
    <div class="title-bar">
      <h1 class="report-title">${escapeHtml(title)}</h1>
      ${subtitle ? `<p class="report-subtitle">${escapeHtml(subtitle)}</p>` : ''}
      ${confidential ? '<span class="confidential">Confidential — Internal Use</span>' : ''}
    </div>
    <div class="body">
      ${renderSections(sections)}
      <div class="signatures">
        <div class="sig-box">
          <div class="sig-line"></div>
          <p class="sig-label">Prepared By</p>
          <p class="sig-name">${escapeHtml(preparedBy)}</p>
          <p class="sig-role">${escapeHtml(preparedByRole)}</p>
        </div>
        <div class="stamp-box">
          <p class="sig-label">Official Stamp</p>
          <div class="stamp-area">Stamp Here</div>
        </div>
        <div class="sig-box">
          <div class="sig-line"></div>
          <p class="sig-label">${escapeHtml(recipientLabel)}</p>
          <p class="sig-name">&nbsp;</p>
          <p class="sig-role">Signature &amp; Date</p>
        </div>
      </div>
    </div>
    <footer class="footer">
      <span>Innovation Hub Rwanda · Kigali Innovation City · innovationhub.rw</span>
      <span>${escapeHtml(id)} · Generated ${escapeHtml(dateStr)}</span>
    </footer>
  </div>
</body>
</html>`
}

export function openReport(html, windowTitle = 'Innovation Hub Report') {
  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) {
    throw new Error('Pop-up blocked. Please allow pop-ups to view the report.')
  }
  win.document.write(html)
  win.document.title = windowTitle
  win.document.close()
}

// ─── Report generators ───────────────────────────────────────────────

export function generatePlatformSummaryReport(stats, user) {
  const html = buildReportHtml({
    title: 'Platform Summary Report',
    subtitle: 'Comprehensive overview of Innovation Hub Rwanda platform performance',
    reportType: 'Platform Analytics',
    preparedBy: user?.fullName || 'Administrator',
    preparedByRole: 'Platform Administrator',
    sections: [
      {
        heading: 'Executive Summary',
        content: `<p>This report summarizes platform-wide metrics including startup registrations, funding activity, investor engagement, and overall success rates as of ${formatReportDate()}.</p>`,
        metrics: [
          { label: 'Total Startups', value: stats.totalStartups ?? 0 },
          { label: 'Active Investors', value: stats.activeInvestors ?? 0 },
          { label: 'Funding Volume', value: formatCurrency(stats.fundingVolume) },
          { label: 'Success Rate', value: `${stats.successRate ?? 0}%` },
        ],
      },
      {
        heading: 'Monthly Growth',
        table: {
          headers: ['Month', 'New Startups', 'Funding (RWF)'],
          rows: (stats.monthlyGrowth || []).map((m) => [m.month, m.startups, formatCurrency(m.funding)]),
        },
      },
      {
        heading: 'Category Distribution',
        table: {
          headers: ['Category', 'Count'],
          rows: (stats.categoryDistribution || []).map((c) => [c.name || c.category, c.value || c.count]),
        },
      },
    ],
  })
  openReport(html, 'Platform Summary Report')
}

export function generateApplicationsReport(applications, user) {
  const html = buildReportHtml({
    title: 'Startup Applications Report',
    subtitle: 'Complete register of entrepreneur applications on the platform',
    reportType: 'Applications Register',
    preparedBy: user?.fullName || 'Administrator',
    preparedByRole: user?.role === 'admin' ? 'Platform Administrator' : 'Investor',
    sections: [
      {
        heading: 'Application Overview',
        metrics: [
          { label: 'Total Applications', value: applications.length },
          { label: 'Approved', value: applications.filter((a) => a.status === 'Approved' || a.status === 'Funded').length },
          { label: 'Under Review', value: applications.filter((a) => a.status === 'Under Review').length },
          { label: 'Seeking Funding', value: applications.filter((a) => a.status === 'Seeking Funding').length },
        ],
      },
      {
        heading: 'Application Details',
        table: {
          headers: ['Startup', 'Founder', 'Category', 'Status', 'Funding Goal', 'Innovation', 'Risk', 'ROI'],
          rows: applications.map((a) => [
            a.name, a.founder, a.category, a.status,
            formatCurrency(a.fundingGoal),
            a.aiAssessment?.overallInnovation != null ? `${a.aiAssessment.overallInnovation}%` : '—',
            a.aiAssessment?.riskLevel ?? '—',
            a.aiAssessment?.expectedROI != null ? `${a.aiAssessment.expectedROI}%` : '—',
          ]),
        },
      },
    ],
  })
  openReport(html, 'Applications Report')
}

export function generateFundingReport(investments, stats, user) {
  const html = buildReportHtml({
    title: 'Funding & Investment Report',
    subtitle: 'Investment volumes, disbursements, and funding pipeline analysis',
    reportType: 'Financial Summary',
    preparedBy: user?.fullName || 'Administrator',
    preparedByRole: 'Platform Administrator',
    sections: [
      {
        heading: 'Funding Overview',
        metrics: [
          { label: 'Total Volume', value: formatCurrency(stats.fundingVolume) },
          { label: 'Total Investments', value: investments.length },
          { label: 'Active', value: investments.filter((i) => i.status === 'Active').length },
          { label: 'Pending', value: investments.filter((i) => i.status === 'Pending').length },
        ],
      },
      {
        heading: 'Investment Register',
        table: {
          headers: ['Startup', 'Investor', 'Amount (RWF)', 'Date', 'Status'],
          rows: investments.map((i) => [i.startup, i.investor, formatCurrency(i.amount), i.date, i.status]),
        },
      },
    ],
  })
  openReport(html, 'Funding Report')
}

export function generateInvestorActivityReport(investors, conversations, user) {
  const html = buildReportHtml({
    title: 'Investor Activity Report',
    subtitle: 'Investor registry, engagement metrics, and platform participation',
    reportType: 'Investor Analytics',
    preparedBy: user?.fullName || 'Administrator',
    preparedByRole: 'Platform Administrator',
    sections: [
      {
        heading: 'Investor Registry',
        metrics: [
          { label: 'Registered Investors', value: investors.length },
          { label: 'Active Conversations', value: conversations.length },
        ],
        table: {
          headers: ['Name', 'Company', 'Type', 'Min Innovation', 'Status'],
          rows: investors.map((i) => [i.name, i.company || '—', i.type || '—', i.minInnovation ?? '—', i.status || 'Active']),
        },
      },
    ],
  })
  openReport(html, 'Investor Activity Report')
}

export function generateAiEvaluationReport(applications, user, tracking = null) {
  const evaluated = applications.filter((a) => a.aiAssessment)
  const sections = [
    {
      heading: 'Evaluation Summary',
      metrics: [
        { label: 'Evaluated Startups', value: evaluated.length },
        { label: 'Avg Innovation', value: evaluated.length ? `${Math.round(evaluated.reduce((s, a) => s + (a.aiAssessment?.overallInnovation || 0), 0) / evaluated.length)}%` : '—' },
        { label: 'Low Risk', value: evaluated.filter((a) => a.aiAssessment?.riskLevel === 'Low').length },
        { label: 'High Risk', value: evaluated.filter((a) => a.aiAssessment?.riskLevel === 'High').length },
      ],
    },
    {
      heading: 'Detailed Scores',
      table: {
        headers: ['Startup', 'Innovation', 'Market', 'Product', 'Risk', 'ROI', 'Matches'],
        rows: evaluated.map((a) => [
          a.name,
          `${a.aiAssessment.overallInnovation}%`,
          `${a.aiAssessment.marketUniqueness ?? '—'}%`,
          `${a.aiAssessment.productUniqueness ?? '—'}%`,
          a.aiAssessment.riskLevel,
          `${a.aiAssessment.expectedROI ?? '—'}%`,
          a.investorMatches?.length ?? 0,
        ]),
      },
    },
  ]

  if (tracking?.summary) {
    const s = tracking.summary
    sections.push({
      heading: 'AI + Platform Communication Tracking',
      content: `<p>${escapeHtml(s.platformNarrative || '')}</p>`,
      highlight: s.aiFacilitationInsight ? escapeHtml(s.aiFacilitationInsight) : null,
      metrics: [
        { label: 'Investor Interests', value: s.totalInterests ?? 0 },
        { label: 'AI-Matched', value: s.aiMatchedConnections ?? 0 },
        { label: 'Active Conversations', value: s.connectionsWithMessages ?? 0 },
        { label: '→ Investment Rate', value: `${s.interestToInvestmentRate ?? 0}%` },
      ],
    })
    if (tracking.journeys?.length) {
      sections.push({
        heading: 'Investor–Entrepreneur Connection Journey',
        table: {
          headers: ['Startup', 'Investor', 'AI Match', 'Interest', 'Messages', 'Investment', 'Status', 'Comment'],
          rows: tracking.journeys.slice(0, 20).map((j) => [
            j.startupName,
            j.investorName,
            j.aiMatched ? `${j.aiMatchScore ?? '✓'}%` : '—',
            j.interestDate || '—',
            j.messageCount ?? 0,
            j.investmentAmount ? formatCurrency(j.investmentAmount) : '—',
            j.communicationStatus || j.currentStage,
            j.statusComment || j.facilitationInsight || '—',
          ]),
        },
      })
    }
  }

  const html = buildReportHtml({
    title: 'AI Evaluation Report',
    subtitle: 'Automated assessment scores, risk analysis, investor matching & platform facilitation tracking',
    reportType: 'AI Analytics',
    preparedBy: user?.fullName || 'Administrator',
    preparedByRole: user?.role === 'admin' ? 'Platform Administrator' : 'Investor',
    sections,
  })
  openReport(html, 'AI Evaluation Report')
}

export function generateUsersReport(users, user) {
  const html = buildReportHtml({
    title: 'User Registry Report',
    subtitle: 'Complete platform user directory by role and status',
    reportType: 'User Management',
    preparedBy: user?.fullName || 'Administrator',
    preparedByRole: 'Platform Administrator',
    sections: [
      {
        heading: 'User Statistics',
        metrics: [
          { label: 'Total Users', value: users.length },
          { label: 'Entrepreneurs', value: users.filter((u) => u.role === 'Entrepreneur').length },
          { label: 'Investors', value: users.filter((u) => u.role === 'Investor').length },
          { label: 'Administrators', value: users.filter((u) => u.role === 'Admin').length },
        ],
      },
      {
        heading: 'User Directory',
        table: {
          headers: ['Name', 'Email', 'Role', 'Status', 'Joined'],
          rows: users.map((u) => [u.name, u.email, u.role, u.status, u.joined || '—']),
        },
      },
    ],
  })
  openReport(html, 'User Registry Report')
}

export function generateEntrepreneurReport(startup, user, role = 'admin', tracking = null) {
  const a = startup.aiAssessment
  const sections = [
    {
      heading: 'Entrepreneur & Startup Profile',
      metrics: [
        { label: 'Startup', value: startup.name },
        { label: 'Founder', value: startup.founder },
        { label: 'Category', value: startup.category },
        { label: 'Status', value: startup.status },
      ],
      table: {
        headers: ['Field', 'Value'],
        rows: [
          ['Description', startup.description || '—'],
          ['Funding Goal', formatCurrency(startup.fundingGoal)],
          ['Funding Raised', formatCurrency(startup.fundingRaised)],
          ['Stage', startup.stage ?? '—'],
          ['Workflow', startup.workflowStage ?? '—'],
          ['Created', startup.createdAt || '—'],
        ],
      },
    },
  ]

  if (a) {
    sections.push({
      heading: 'AI Business Evaluation',
      content: a.aiSummary ? `<p>${escapeHtml(a.aiSummary)}</p>` : '',
      metrics: [
        { label: 'Innovation Score', value: `${a.overallInnovation}%` },
        { label: 'Market Uniqueness', value: `${a.marketUniqueness ?? '—'}%` },
        { label: 'Product Uniqueness', value: `${a.productUniqueness ?? '—'}%` },
        { label: 'Expected ROI', value: `${a.expectedROI ?? '—'}%` },
      ],
      table: {
        headers: ['Metric', 'Value'],
        rows: [
          ['Risk Level', a.riskLevel],
          ['Risk Score', `${a.riskScore}/100`],
          ['Profit Prediction', formatCurrency(a.expectedProfit || a.profitPrediction)],
          ['Documents Valid', a.documentsValid === false ? 'No — resubmit required' : 'Yes'],
        ],
      },
      highlight: a.investorAdvice ? `<strong>Investor Advice:</strong><br/>${escapeHtml(a.investorAdvice).replace(/\n/g, '<br/>')}` : null,
    })
  }

  if (startup.investorMatches?.length) {
    sections.push({
      heading: 'Investor Matches',
      table: {
        headers: ['Investor', 'Match Score', 'Category Fit'],
        rows: startup.investorMatches.map((m) => [m.name, `${m.matchScore}%`, m.categoryFit || '—']),
      },
    })
  }

  const startupTracking = tracking?.startupSummaries?.[0] || tracking?.journeys
  if (startupTracking) {
    const summary = tracking.startupSummaries?.[0]
    const journeys = tracking.journeys || []
    sections.push({
      heading: 'Platform Facilitation & Communication Journey',
      content: summary?.facilitationInsight
        ? `<p>${escapeHtml(summary.facilitationInsight)}</p>`
        : '<p>Innovation Hub tracks how investors connect with this entrepreneur through interest, messaging, and funding.</p>',
      metrics: summary ? [
        { label: 'Interested Investors', value: summary.interestedInvestors ?? 0 },
        { label: 'Active Conversations', value: summary.activeConnections ?? 0 },
        { label: 'Messages Exchanged', value: summary.totalMessages ?? 0 },
        { label: 'Funding Progress', value: `${summary.fundingProgress ?? 0}%` },
      ] : [],
    })
    if (journeys.length) {
      sections.push({
        heading: 'Investor Connection Timeline',
        table: {
          headers: ['Investor', 'Status', 'Messages', 'Investment', 'Comment'],
          rows: journeys.map((j) => [
            j.investorName,
            j.communicationStatus || j.currentStage,
            j.messageCount ?? 0,
            j.investmentAmount ? `${formatCurrency(j.investmentAmount)} (${j.investmentStatus})` : '—',
            j.statusComment || j.facilitationInsight || '—',
          ]),
        },
      })
      const firstJourney = journeys[0]
      if (firstJourney?.timeline?.length) {
        sections.push({
          heading: 'End-to-End Journey (Latest Connection)',
          table: {
            headers: ['Stage', 'Date', 'Platform Role'],
            rows: firstJourney.timeline.map((t) => [t.stage, t.date, t.description]),
          },
        })
      }
      if (firstJourney?.decisionDetected) {
        sections.push({
          heading: 'AI Decision Detection',
          highlight: `<strong>Partnership decision detected:</strong> ${escapeHtml(firstJourney.decisionSummary || 'Investor and entrepreneur reached an agreement through platform messaging.')}`,
          content: firstJourney.aiCommunicationSummary
            ? `<p>${escapeHtml(firstJourney.aiCommunicationSummary)}</p>`
            : '',
        })
      }
    }
  }

  const html = buildReportHtml({
    title: `Entrepreneur Report — ${startup.name}`,
    subtitle: `Detailed evaluation and profile for ${startup.founder}'s startup`,
    reportType: 'Entrepreneur Evaluation',
    preparedBy: user?.fullName || 'Report Generator',
    preparedByRole: role === 'admin' ? 'Platform Administrator' : 'Registered Investor',
    recipientLabel: role === 'admin' ? 'Director, Innovation Hub' : 'Investment Committee',
    sections,
  })
  openReport(html, `Entrepreneur Report — ${startup.name}`)
}

export function generateAllEntrepreneursReport(applications, user, role = 'investor') {
  generateApplicationsReport(applications, user)
}

export function generateFacilitationReport(data, user) {
  const s = data?.summary || {}
  const journeys = data?.journeys || []
  const startupSummaries = data?.startupSummaries || []

  const html = buildReportHtml({
    title: 'Investor Connection & Facilitation Report',
    subtitle: 'How Innovation Hub Rwanda connects entrepreneurs with investors — from AI matching to funded partnerships',
    reportType: 'Platform Impact & Communication Tracking',
    preparedBy: user?.fullName || 'Administrator',
    preparedByRole: 'Platform Administrator',
    sections: [
      {
        heading: 'Platform Mission & Impact Summary',
        content: `<p>${escapeHtml(s.platformNarrative || '')}</p>`,
        highlight: s.aiFacilitationInsight ? escapeHtml(s.aiFacilitationInsight) : null,
        metrics: [
          { label: 'Registered Startups', value: s.totalStartups ?? 0 },
          { label: 'With Investor Activity', value: s.startupsWithInvestorActivity ?? 0 },
          { label: 'Investor Interests', value: s.totalInterests ?? 0 },
          { label: 'Funded Connections', value: s.fundedConnections ?? 0 },
        ],
      },
      {
        heading: 'Communication Funnel',
        metrics: [
          { label: 'AI-Matched', value: s.aiMatchedConnections ?? 0 },
          { label: 'Communication Ongoing', value: s.ongoingCommunications ?? 0 },
          { label: 'Funding In Progress', value: s.fundingInProgress ?? 0 },
          { label: 'Deals Completed', value: s.completedDeals ?? 0 },
          { label: 'Total Messages', value: s.totalMessages ?? 0 },
          { label: 'Interest → Investment', value: `${s.interestToInvestmentRate ?? 0}%` },
        ],
      },
      {
        heading: 'Startup Facilitation Overview',
        table: {
          headers: ['Startup', 'Founder', 'Status', 'Messages', 'Invested', 'Progress', 'Facilitation Comment'],
          rows: startupSummaries.map((r) => [
            r.startupName,
            r.founderName,
            r.communicationStatus || r.startupStatus,
            r.totalMessages ?? 0,
            r.totalInvested ? formatCurrency(r.totalInvested) : '—',
            `${r.fundingProgress ?? 0}%`,
            r.statusComment || r.facilitationInsight || '—',
          ]),
        },
      },
      {
        heading: 'Full Investor–Entrepreneur Journeys',
        table: {
          headers: ['Startup', 'Investor', 'Status', 'Messages', 'Investment', 'Facilitation Comment'],
          rows: journeys.map((j) => [
            j.startupName,
            j.investorName,
            j.communicationStatus || j.currentStage,
            j.messageCount ?? 0,
            j.investmentAmount ? `${formatCurrency(j.investmentAmount)} (${j.investmentStatus})` : '—',
            j.statusComment || j.facilitationInsight || '—',
          ]),
        },
      },
    ],
  })
  openReport(html, 'Facilitation Report')
}
