import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Heart, CheckCircle, Printer, Mail, Phone, Building2, MessageSquare } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { StatusBadge, ProgressBar } from '../../components/shared/Badges'
import InvestorReportCard from '../../components/shared/InvestorReportCard'
import { DocumentCards } from '../../components/shared/DocumentCards'
import { formatCurrency } from '../../data/constants'
import { useStartups } from '../../context/StartupContext'
import { useAppData } from '../../context/AppDataContext'
import { useAuth } from '../../context/AuthContext'
import { generateEntrepreneurReport } from '../../utils/reportDocument'
import { useToast } from '../../context/ToastContext'
import api from '../../services/api'

function FounderContactCard({ contact }) {
  if (!contact) return null
  return (
    <div className="card p-6 border border-primary-100 bg-primary-50/30">
      <h3 className="font-display font-bold text-lg text-gray-900 mb-1">Founder Contact</h3>
      <p className="text-sm text-gray-500 mb-4">
        You expressed interest — here is how to reach {contact.fullName} directly.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
          <Mail className="w-5 h-5 text-primary-600 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <a href={`mailto:${contact.email}`} className="text-sm font-medium text-primary-700 hover:underline break-all">
              {contact.email}
            </a>
          </div>
        </div>
        {contact.phone ? (
          <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
            <Phone className="w-5 h-5 text-primary-600 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <a href={`tel:${contact.phone}`} className="text-sm font-medium text-primary-700 hover:underline">
                {contact.phone}
              </a>
            </div>
          </div>
        ) : null}
        {contact.company ? (
          <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 sm:col-span-2">
            <Building2 className="w-5 h-5 text-primary-600 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Company</p>
              <p className="text-sm font-medium text-gray-900">{contact.company}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function StartupDetail() {
  const { id } = useParams()
  const { applications } = useStartups()
  const { expressInterest } = useAppData()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [startup, setStartup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [interestSent, setInterestSent] = useState(false)
  const [interestLoading, setInterestLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [founderContact, setFounderContact] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fromList = applications.find((s) => s.id === Number(id))
    api.getApplication(id)
      .then((data) => {
        setStartup(data || fromList || null)
        if (data?.interestExpressed) {
          setInterestSent(true)
          setFounderContact(data.founderContact || null)
          setConversationId(data.conversationId || null)
        }
      })
      .catch(() => {
        if (fromList) setStartup(fromList)
      })
      .finally(() => setLoading(false))
  }, [id, applications])

  if (loading) {
    return (
      <DashboardLayout role="investor">
        <div className="text-center py-16 text-gray-400">Loading startup report...</div>
      </DashboardLayout>
    )
  }

  if (!startup) {
    return (
      <DashboardLayout role="investor">
        <div className="text-center py-16 text-gray-500">Startup not found</div>
      </DashboardLayout>
    )
  }

  const handleExpressInterest = async () => {
    setInterestLoading(true)
    try {
      const result = await expressInterest(startup.id)
      setInterestSent(true)
      setFounderContact(result.founderContact || null)
      setConversationId(result.conversationId || null)
      setStartup((prev) => ({
        ...prev,
        interestExpressed: true,
        founderContact: result.founderContact,
        conversationId: result.conversationId,
      }))
      setShowModal(true)
      showToast(result.message || 'Interest expressed successfully', 'success')
    } catch {
      showToast('Could not express interest. Please try again.', 'error')
    } finally {
      setInterestLoading(false)
    }
  }

  const contact = founderContact || startup.founderContact

  return (
    <DashboardLayout role="investor">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link to="/investor/startups" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Startups
        </Link>

        {contact && <FounderContactCard contact={contact} />}

        <div className="card overflow-hidden">
          <div className="relative h-48 sm:h-56">
            <img src={startup.image} alt={startup.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={startup.status} />
                <span className="badge bg-white/20 text-white backdrop-blur-sm border border-white/20">{startup.category}</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">{startup.name}</h2>
              <p className="text-gray-200 mt-1">Founded by {startup.founder}</p>
            </div>
          </div>
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex-1">
                <p className="text-gray-600 leading-relaxed">{startup.description}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      generateEntrepreneurReport(startup, user, 'investor')
                      showToast('Opening entrepreneur report…', 'success')
                    } catch (err) {
                      showToast(err.message || 'Could not open report', 'error')
                    }
                  }}
                  className="btn-ghost text-sm whitespace-nowrap border border-gray-200 inline-flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Print Report
                </button>
                {interestSent && conversationId ? (
                  <Link
                    to={`/investor/messages?conversation=${conversationId}`}
                    className="btn-primary text-sm whitespace-nowrap inline-flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Message Founder
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleExpressInterest}
                    disabled={interestSent || interestLoading}
                    className={`btn-primary text-sm whitespace-nowrap inline-flex items-center gap-2 ${(interestSent || interestLoading) ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {interestLoading ? 'Sending…' : <><Heart className="w-4 h-4" /> {interestSent ? 'Interest Expressed' : 'Express Interest'}</>}
                  </button>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(startup.fundingGoal)}</p>
                <p className="text-xs text-gray-500 mt-1">Funding Goal</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(startup.fundingRaised)}</p>
                <p className="text-xs text-gray-500 mt-1">Raised</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">{startup.createdAt}</p>
                <p className="text-xs text-gray-500 mt-1">Submitted</p>
              </div>
            </div>

            {startup.fundingGoal > 0 && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Funding Progress</span>
                  <span className="font-semibold">{Math.round((startup.fundingRaised / startup.fundingGoal) * 100)}%</span>
                </div>
                <ProgressBar value={startup.fundingRaised} max={startup.fundingGoal} color="green" />
              </div>
            )}
          </div>
        </div>

        <InvestorReportCard startup={startup} assessment={startup.aiAssessment} />

        <DocumentCards
          applicationId={startup.id}
          businessPlanName={startup.businessPlan}
          budgetName={startup.budget}
        />
      </div>

      {showModal && contact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative card-elevated p-8 max-w-md w-full text-center animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-display text-xl font-bold text-gray-900">Interest Expressed!</h3>
            <p className="text-gray-500 mt-2 text-sm">
              You can now reach {contact.fullName} directly. The entrepreneur has been notified.
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-xl text-left text-sm space-y-2">
              <p><span className="text-gray-500">Email:</span> <a href={`mailto:${contact.email}`} className="text-primary-600 hover:underline">{contact.email}</a></p>
              {contact.phone && (
                <p><span className="text-gray-500">Phone:</span> <a href={`tel:${contact.phone}`} className="text-primary-600 hover:underline">{contact.phone}</a></p>
              )}
            </div>
            <div className="flex flex-col gap-2 mt-6">
              {conversationId && (
                <Link
                  to={`/investor/messages?conversation=${conversationId}`}
                  className="btn-primary text-sm w-full inline-flex items-center justify-center gap-2"
                  onClick={() => setShowModal(false)}
                >
                  <MessageSquare className="w-4 h-4" /> Open Conversation
                </Link>
              )}
              <button type="button" onClick={() => setShowModal(false)} className="btn-ghost text-sm w-full">Done</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
