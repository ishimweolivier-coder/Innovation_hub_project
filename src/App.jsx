import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/shared/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import Login from './pages/auth/Login'
import RegisterEntrepreneur from './pages/auth/RegisterEntrepreneur'
import RegisterInvestor from './pages/auth/RegisterInvestor'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

import EntrepreneurDashboard from './pages/entrepreneur/Dashboard'
import SubmitApplication from './pages/entrepreneur/SubmitApplication'
import ApplicationStatus from './pages/entrepreneur/ApplicationStatus'
import Opportunities from './pages/entrepreneur/Opportunities'
import GrowthTracking from './pages/entrepreneur/GrowthTracking'
import EntrepreneurEvents from './pages/entrepreneur/Events'
import AIEvaluation from './pages/entrepreneur/AIEvaluation'

import InvestorDashboard from './pages/investor/Dashboard'
import BrowseStartups from './pages/investor/BrowseStartups'
import StartupDetail from './pages/investor/StartupDetail'
import FundedStartups from './pages/investor/FundedStartups'
import InvestorEvents from './pages/investor/Events'
import InvestorReports from './pages/investor/Reports'

import AdminDashboard from './pages/admin/Dashboard'
import ReviewApplications from './pages/admin/ReviewApplications'
import ManageUsers from './pages/admin/ManageUsers'
import ManageInvestors from './pages/admin/ManageInvestors'
import ManageOpportunities from './pages/admin/ManageOpportunities'
import ManageEvents from './pages/admin/ManageEvents'
import ReviewGrantApplications from './pages/admin/ReviewGrantApplications'
import Announcements from './pages/admin/Announcements'
import Reports from './pages/admin/Reports'
import Messages from './pages/shared/Messages'
import Notifications from './pages/shared/Notifications'

export default function App() {
  return (
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
  )
}
