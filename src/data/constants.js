export const STARTUP_STAGES = [
  'Submitted',
  'Under Review',
  'Approved',
  'In Incubation',
  'Seeking Funding',
  'Funded',
  'Graduated',
]

export const STARTUP_CATEGORIES = [
  'AgriTech',
  'FinTech',
  'HealthTech',
  'EdTech',
  'CleanTech',
  'E-Commerce',
  'SaaS',
  'Social Impact',
  'Creative Industries',
  'Other',
]

export const INVESTOR_TYPES = [
  'Angel Investor',
  'Venture Capital',
  'Corporate',
  'Government Fund',
  'Development Finance',
]

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export const getRiskColor = (level) => {
  switch (level) {
    case 'Low': return 'bg-green-100 text-green-700'
    case 'Medium': return 'bg-amber-100 text-amber-700'
    case 'High': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export const getStatusColor = (status) => {
  const colors = {
    'Submitted': 'bg-blue-100 text-blue-700',
    'Under Review': 'bg-amber-100 text-amber-700',
    'Approved': 'bg-green-100 text-green-700',
    'In Incubation': 'bg-purple-100 text-purple-700',
    'Seeking Funding': 'bg-indigo-100 text-indigo-700',
    'Funded': 'bg-emerald-100 text-emerald-700',
    'Graduated': 'bg-gray-100 text-gray-700',
    'Rejected': 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}
