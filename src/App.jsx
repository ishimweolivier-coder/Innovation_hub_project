import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/shared/ProtectedRoute'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const Login = lazy(() => import('./pages/auth/Login'))
const RegisterEntrepreneur = lazy(() => import('./pages/auth/RegisterEntrepreneur'))
const RegisterInvestor = lazy(() => import('./pages/auth/RegisterInvestor'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))

const EntrepreneurDashboard = lazy(() => import('./pages/entrepreneur/Dashboard'))
const SubmitApplication = lazy(() => import('./pages/entrepreneur/SubmitApplication'))
const ApplicationStatus = lazy(() => import('./pages/entrepreneur/ApplicationStatus'))
const Opportunities = lazy(() => import('./pages/entrepreneur/Opportunities'))
const GrowthTracking = lazy(() => import('./pages/entrepreneur/GrowthTracking'))
const EntrepreneurEvents = lazy(() => import('./pages/entrepreneur/Events'))
const AIEvaluation = lazy(() => import('./pages/entrepreneur/AIEvaluation'))

const InvestorDashboard = lazy(() => import('./pages/investor/Dashboard'))
const BrowseStartups = lazy(() => import('./pages/investor/BrowseStartups'))
const StartupDetail = lazy(() => import('./pages/investor/StartupDetail'))
const FundedStartups = lazy(() => import('./pages/investor/FundedStartups'))
const InvestorEvents = lazy(() => import('./pages/investor/Events'))
const InvestorReports = lazy(() => import('./pages/investor/Reports'))

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const ReviewApplications = lazy(() => import('./pages/admin/ReviewApplications'))
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'))
const ManageInvestors = lazy(() => import('./pages/admin/ManageInvestors'))
const ManageOpportunities = lazy(() => import('./pages/admin/ManageOpportunities'))
const ManageEvents = lazy(() => import('./pages/admin/ManageEvents'))
const ReviewGrantApplications = lazy(() => import('./pages/admin/ReviewGrantApplications'))
const Announcements = lazy(() => import('./pages/admin/Announcements'))
const Reports = lazy(() => import('./pages/admin/Reports'))
const Messages = lazy(() => import('./pages/shared/Messages'))
const Notifications = lazy(() => import('./pages/shared/Notifications'))

function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 animate-pulse" />
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/entrepreneur" element={<RegisterEntrepreneur />} />
        <Route path="/register/investor" element={<RegisterInvestor />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/entrepreneur" element={<ProtectedRoute allowedRoles={['entrepreneur']}><EntrepreneurDashboard /></ProtectedRoute>} />
        <Route path="/entrepreneur/apply" element={<ProtectedRoute allowedRoles={['entrepreneur']}><SubmitApplication /></ProtectedRoute>} />
        <Route path="/entrepreneur/status" element={<ProtectedRoute allowedRoles={['entrepreneur']}><ApplicationStatus /></ProtectedRoute>} />
        <Route path="/entrepreneur/opportunities" element={<ProtectedRoute allowedRoles={['entrepreneur']}><Opportunities /></ProtectedRoute>} />
        <Route path="/entrepreneur/growth" element={<ProtectedRoute allowedRoles={['entrepreneur']}><GrowthTracking /></ProtectedRoute>} />
        <Route path="/entrepreneur/ai-evaluation" element={<ProtectedRoute allowedRoles={['entrepreneur']}><AIEvaluation /></ProtectedRoute>} />
        <Route path="/entrepreneur/events" element={<ProtectedRoute allowedRoles={['entrepreneur']}><EntrepreneurEvents /></ProtectedRoute>} />
        <Route path="/entrepreneur/messages" element={<ProtectedRoute allowedRoles={['entrepreneur']}><Messages role="entrepreneur" /></ProtectedRoute>} />
        <Route path="/entrepreneur/notifications" element={<ProtectedRoute allowedRoles={['entrepreneur']}><Notifications role="entrepreneur" /></ProtectedRoute>} />

        <Route path="/investor" element={<ProtectedRoute allowedRoles={['investor']}><InvestorDashboard /></ProtectedRoute>} />
        <Route path="/investor/startups" element={<ProtectedRoute allowedRoles={['investor']}><BrowseStartups /></ProtectedRoute>} />
        <Route path="/investor/startups/:id" element={<ProtectedRoute allowedRoles={['investor']}><StartupDetail /></ProtectedRoute>} />
        <Route path="/investor/funded" element={<ProtectedRoute allowedRoles={['investor']}><FundedStartups /></ProtectedRoute>} />
        <Route path="/investor/reports" element={<ProtectedRoute allowedRoles={['investor']}><InvestorReports /></ProtectedRoute>} />
        <Route path="/investor/events" element={<ProtectedRoute allowedRoles={['investor']}><InvestorEvents /></ProtectedRoute>} />
        <Route path="/investor/messages" element={<ProtectedRoute allowedRoles={['investor']}><Messages role="investor" /></ProtectedRoute>} />
        <Route path="/investor/notifications" element={<ProtectedRoute allowedRoles={['investor']}><Notifications role="investor" /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/applications" element={<ProtectedRoute allowedRoles={['admin']}><ReviewApplications /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
        <Route path="/admin/investors" element={<ProtectedRoute allowedRoles={['admin']}><ManageInvestors /></ProtectedRoute>} />
        <Route path="/admin/opportunities" element={<ProtectedRoute allowedRoles={['admin']}><ManageOpportunities /></ProtectedRoute>} />
        <Route path="/admin/events" element={<ProtectedRoute allowedRoles={['admin']}><ManageEvents /></ProtectedRoute>} />
        <Route path="/admin/grant-applications" element={<ProtectedRoute allowedRoles={['admin']}><ReviewGrantApplications /></ProtectedRoute>} />
        <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={['admin']}><Announcements /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />
        <Route path="/admin/messages" element={<ProtectedRoute allowedRoles={['admin']}><Messages role="admin" /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['admin']}><Notifications role="admin" /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
