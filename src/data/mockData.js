export const STARTUP_STAGES = [
  'Submitted',
  'Under Review',
  'Approved',
  'In Incubation',
  'Seeking Funding',
  'Funded',
  'Graduated',
]

export const CATEGORY_IMAGES = {
  AgriTech: '/images/startup-agritech.jpg',
  FinTech: '/images/startup-fintech.jpg',
  HealthTech: '/images/startup-healthtech.jpg',
  EdTech: '/images/startup-edtech.jpg',
  CleanTech: '/images/startup-agritech.jpg',
  'E-Commerce': '/images/startup-creative.jpg',
  SaaS: '/images/startup-fintech.jpg',
  'Social Impact': '/images/startup-healthtech.jpg',
  'Creative Industries': '/images/startup-creative.jpg',
  Other: '/images/hero-bg.jpg',
}

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

export const mockUsers = {
  entrepreneur: {
    id: 1,
    fullName: 'Jean Baptiste Uwimana',
    email: 'jean@startup.rw',
    role: 'entrepreneur',
    avatar: 'JU',
  },
  investor: {
    id: 2,
    fullName: 'Sarah Mukamana',
    email: 'sarah@invest.rw',
    role: 'investor',
    company: 'Kigali Ventures',
    avatar: 'SM',
  },
  admin: {
    id: 3,
    fullName: 'Admin User',
    email: 'admin@innovationhub.rw',
    role: 'admin',
    avatar: 'AU',
  },
  entrepreneur2: {
    id: 8,
    fullName: 'Diane Mukamana',
    email: 'diane@solar.rw',
    role: 'entrepreneur',
    avatar: 'DM',
  },
}

export const mockStartups = [
  {
    id: 1,
    name: 'AgriSmart Rwanda',
    founder: 'Jean Baptiste Uwimana',
    founderId: 1,
    category: 'AgriTech',
    description: 'IoT-powered smart farming solutions helping smallholder farmers increase yield by 40% through precision agriculture.',
    status: 'Seeking Funding',
    stage: 5,
    fundingGoal: 15000000,
    fundingRaised: 8000000,
    createdAt: '2025-11-15',
    image: '/images/startup-agritech.jpg',
    businessPlan: 'agricsmart-business-plan.pdf',
    budget: 'agricsmart-budget.xlsx',
    budgetAmount: 8000000,
    projectedProfit: 12000000,
    aiAssessment: {
      marketUniqueness: 85,
      productUniqueness: 90,
      overallInnovation: 88,
      riskLevel: 'Low',
      riskScore: 22,
      expectedProfit: 12000000,
      expectedROI: 25,
    },
  },
  {
    id: 2,
    name: 'MedConnect',
    founder: 'Alice Uwase',
    founderId: 4,
    category: 'HealthTech',
    description: 'Telemedicine platform connecting rural patients with specialists across Rwanda and East Africa.',
    status: 'In Incubation',
    stage: 4,
    fundingGoal: 25000000,
    fundingRaised: 5000000,
    createdAt: '2025-10-20',
    image: '/images/startup-healthtech.jpg',
    aiAssessment: {
      marketUniqueness: 78,
      productUniqueness: 82,
      overallInnovation: 80,
      riskLevel: 'Medium',
      riskScore: 45,
      expectedProfit: 18000000,
      expectedROI: 32,
    },
  },
  {
    id: 3,
    name: 'EduBridge',
    founder: 'Patrick Nshimiyimana',
    founderId: 5,
    category: 'EdTech',
    description: 'Digital learning platform providing STEM education to underserved communities in Rwanda.',
    status: 'Approved',
    stage: 3,
    fundingGoal: 10000000,
    fundingRaised: 0,
    createdAt: '2026-01-05',
    image: '/images/startup-edtech.jpg',
    aiAssessment: {
      marketUniqueness: 72,
      productUniqueness: 75,
      overallInnovation: 74,
      riskLevel: 'Medium',
      riskScore: 52,
      expectedProfit: 8000000,
      expectedROI: 18,
    },
  },
  {
    id: 4,
    name: 'GreenPay',
    founder: 'Marie Claire Ingabire',
    founderId: 6,
    category: 'FinTech',
    description: 'Mobile payment solution for green energy subscriptions in off-grid communities.',
    status: 'Under Review',
    stage: 2,
    fundingGoal: 20000000,
    fundingRaised: 0,
    createdAt: '2026-02-10',
    image: '/images/startup-fintech.jpg',
    aiAssessment: null,
  },
  {
    id: 5,
    name: 'CraftRwanda',
    founder: 'Emmanuel Habimana',
    founderId: 7,
    category: 'Creative Industries',
    description: 'E-commerce marketplace connecting Rwandan artisans with global buyers.',
    status: 'Funded',
    stage: 6,
    fundingGoal: 8000000,
    fundingRaised: 8000000,
    createdAt: '2025-08-01',
    image: '/images/startup-creative.jpg',
    aiAssessment: {
      marketUniqueness: 88,
      productUniqueness: 85,
      overallInnovation: 87,
      riskLevel: 'Low',
      riskScore: 18,
      expectedProfit: 15000000,
      expectedROI: 42,
    },
  },
  {
    id: 6,
    name: 'SolarPay Rwanda',
    founder: 'Diane Mukamana',
    founderId: 8,
    category: 'FinTech',
    description: 'Pay-as-you-go solar energy financing platform for rural households across East Africa.',
    status: 'Graduated',
    stage: 7,
    fundingGoal: 30000000,
    fundingRaised: 30000000,
    createdAt: '2024-06-01',
    image: '/images/startup-fintech.jpg',
    aiAssessment: {
      marketUniqueness: 92,
      productUniqueness: 88,
      overallInnovation: 90,
      riskLevel: 'Low',
      riskScore: 15,
      expectedProfit: 25000000,
      expectedROI: 55,
    },
  },
]

export const mockOpportunities = [
  {
    id: 1,
    title: 'Youth Innovation Grant 2026',
    type: 'Grant',
    description: 'RWF 5M grant for youth-led startups addressing climate change challenges.',
    deadline: '2026-04-30',
    organization: 'MINEDUC Rwanda',
    image: '/images/opp-grant.jpg',
  },
  {
    id: 2,
    title: 'Hanga Pitchfest 2026',
    type: 'Competition',
    description: 'National startup competition with RWF 20M prize pool and mentorship.',
    deadline: '2026-05-15',
    organization: 'RDB',
    image: '/images/opp-competition.jpg',
  },
  {
    id: 3,
    title: 'STEM Scholarship Program',
    type: 'Scholarship',
    description: 'Full scholarship for tech entrepreneurs pursuing advanced degrees.',
    deadline: '2026-03-31',
    organization: 'University of Rwanda',
    image: '/images/opp-scholarship.jpg',
  },
  {
    id: 4,
    title: 'Kigali Innovation Hub Incubation',
    type: 'Incubation',
    description: '6-month incubation program with workspace, mentorship, and seed funding.',
    deadline: '2026-06-01',
    organization: 'Kigali Innovation City',
    image: '/images/opp-incubation.jpg',
  },
]

export const mockEvents = [
  {
    id: 1,
    title: 'Startup Weekend Kigali',
    type: 'Event',
    date: '2026-04-12',
    location: 'Kigali Convention Centre',
    description: '54-hour event where developers, designers, and entrepreneurs build startups.',
    image: '/images/event-startup-weekend.jpg',
  },
  {
    id: 2,
    title: 'Business Plan Writing Workshop',
    type: 'Workshop',
    date: '2026-03-28',
    location: 'Online',
    description: 'Learn to craft compelling business plans that attract investors.',
    image: '/images/event-workshop.jpg',
  },
  {
    id: 3,
    title: 'Investor Readiness Training',
    type: 'Training',
    date: '2026-04-05',
    location: 'Norrsken House Kigali',
    description: 'Prepare your startup for due diligence and investor meetings.',
    image: '/images/event-training.jpg',
  },
]

export const mockNotifications = [
  { id: 1, message: 'Your application for AgriSmart Rwanda has been approved!', type: 'approved', read: false, time: '2 hours ago' },
  { id: 2, message: 'New opportunity: Youth Innovation Grant 2026 is now open.', type: 'opportunity', read: false, time: '5 hours ago' },
  { id: 3, message: 'Investor Sarah Mukamana expressed interest in your startup.', type: 'interest', read: true, time: '1 day ago' },
  { id: 4, message: 'AI evaluation completed for your business plan.', type: 'ai', read: true, time: '2 days ago' },
]

export const mockConversations = {
  entrepreneur: [
    {
      id: 1,
      name: 'Sarah Mukamana',
      role: 'Investor · Kigali Ventures',
      avatar: 'SM',
      lastMessage: 'I reviewed your AI evaluation. Can we schedule a call?',
      time: '10:30 AM',
      unread: 2,
      online: true,
      messages: [
        { id: 1, sender: 'them', text: 'Hello Jean, I came across AgriSmart Rwanda on the platform.', time: 'Yesterday 2:15 PM' },
        { id: 2, sender: 'me', text: 'Thank you Sarah! We are excited about the traction we are getting.', time: 'Yesterday 3:00 PM' },
        { id: 3, sender: 'them', text: 'I reviewed your AI evaluation. Can we schedule a call?', time: '10:30 AM' },
      ],
    },
    {
      id: 2,
      name: 'Admin Support',
      role: 'Innovation Hub Team',
      avatar: 'AH',
      lastMessage: 'Your application has moved to Seeking Funding stage.',
      time: 'Yesterday',
      unread: 0,
      online: true,
      messages: [
        { id: 1, sender: 'them', text: 'Congratulations! Your startup application has been approved.', time: 'Mon 9:00 AM' },
        { id: 2, sender: 'them', text: 'Your application has moved to Seeking Funding stage.', time: 'Yesterday 4:30 PM' },
        { id: 3, sender: 'me', text: 'Thank you for the update!', time: 'Yesterday 5:00 PM' },
      ],
    },
    {
      id: 3,
      name: 'MINEDUC Programs',
      role: 'Opportunity Coordinator',
      avatar: 'MP',
      lastMessage: 'Youth Innovation Grant deadline is April 30.',
      time: '2 days ago',
      unread: 1,
      online: false,
      messages: [
        { id: 1, sender: 'them', text: 'Youth Innovation Grant deadline is April 30.', time: '2 days ago' },
      ],
    },
  ],
  investor: [
    {
      id: 1,
      name: 'Jean Baptiste Uwimana',
      role: 'Entrepreneur · AgriSmart Rwanda',
      avatar: 'JU',
      lastMessage: 'Thank you for your interest in our startup!',
      time: '11:00 AM',
      unread: 1,
      online: true,
      messages: [
        { id: 1, sender: 'me', text: 'Hi Jean, I am interested in AgriSmart Rwanda after reviewing your profile.', time: 'Yesterday' },
        { id: 2, sender: 'them', text: 'Thank you for your interest in our startup!', time: '11:00 AM' },
      ],
    },
    {
      id: 2,
      name: 'Alice Uwase',
      role: 'Entrepreneur · MedConnect',
      avatar: 'AU',
      lastMessage: 'We are open to discussing a RWF 5M investment.',
      time: '3 days ago',
      unread: 0,
      online: false,
      messages: [
        { id: 1, sender: 'them', text: 'We are open to discussing a RWF 5M investment.', time: '3 days ago' },
      ],
    },
  ],
  admin: [
    {
      id: 1,
      name: 'Jean Baptiste Uwimana',
      role: 'Entrepreneur',
      avatar: 'JU',
      lastMessage: 'When will my AI evaluation be ready?',
      time: '9:45 AM',
      unread: 1,
      online: true,
      messages: [
        { id: 1, sender: 'them', text: 'When will my AI evaluation be ready?', time: '9:45 AM' },
      ],
    },
    {
      id: 2,
      name: 'Sarah Mukamana',
      role: 'Investor',
      avatar: 'SM',
      lastMessage: 'Please verify my investor profile.',
      time: 'Yesterday',
      unread: 0,
      online: false,
      messages: [
        { id: 1, sender: 'them', text: 'Please verify my investor profile.', time: 'Yesterday' },
      ],
    },
  ],
}

export const mockInvestments = [
  { id: 1, investor: 'Sarah Mukamana', startup: 'AgriSmart Rwanda', amount: 5000000, date: '2026-01-20', status: 'Active' },
  { id: 2, investor: 'Kigali Angels', startup: 'CraftRwanda', amount: 8000000, date: '2025-11-10', status: 'Active' },
  { id: 3, investor: 'East Africa Fund', startup: 'MedConnect', amount: 5000000, date: '2025-12-05', status: 'Pending' },
]

export const mockAdminStats = {
  totalStartups: 156,
  approvedStartups: 89,
  rejectedStartups: 34,
  pendingReview: 33,
  activeInvestors: 42,
  fundingVolume: 450000000,
  successRate: 68,
  monthlyGrowth: [
    { month: 'Sep', startups: 12, funding: 25 },
    { month: 'Oct', startups: 18, funding: 32 },
    { month: 'Nov', startups: 22, funding: 45 },
    { month: 'Dec', startups: 28, funding: 58 },
    { month: 'Jan', startups: 35, funding: 72 },
    { month: 'Feb', startups: 41, funding: 85 },
  ],
  categoryDistribution: [
    { name: 'AgriTech', value: 28 },
    { name: 'FinTech', value: 22 },
    { name: 'HealthTech', value: 18 },
    { name: 'EdTech', value: 15 },
    { name: 'Other', value: 17 },
  ],
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(amount)
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
