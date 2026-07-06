import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lightbulb, ArrowRight, Building2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import AuthSidePanel from '../../components/shared/AuthSidePanel'
import { IMAGES } from '../../data/images'

const INVESTOR_TYPES = ['Angel Investor', 'Venture Capital', 'Corporate', 'Government Fund', 'Development Finance']

export default function RegisterInvestor() {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    company: '', investorType: '', phone: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    const result = await register({ ...form, role: 'investor' })
    if (result.success) navigate('/investor')
    else setError(result.error || 'Registration failed')
  }

  return (
    <div className="min-h-screen flex">
      <AuthSidePanel
        image={IMAGES.authInvestor}
        imageAlt="Investors reviewing startup opportunities in Rwanda"
        width="narrow"
      >
        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6">
          <Building2 className="w-7 h-7 text-primary-200" />
        </div>
        <h2 className="font-display text-3xl font-bold leading-tight">Invest in Rwanda&apos;s Future</h2>
        <p className="mt-4 text-primary-100 leading-relaxed">
          Discover promising startups, review AI-powered evaluations, and express investment interest with confidence.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-gray-200">
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-300" /> Browse vetted startup profiles</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-300" /> View AI risk & ROI analysis</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-300" /> Track funded startup performance</li>
        </ul>
      </AuthSidePanel>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto bg-gray-50">
        <div className="w-full max-w-lg py-8">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg">Innovation Hub</span>
          </Link>

          <h1 className="font-display text-2xl font-bold text-gray-900">Register as Investor</h1>
          <p className="text-gray-500 mt-2">Create your investor profile to discover startups</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="label" htmlFor="fullName">Full Name</label>
              <input id="fullName" name="fullName" className="input-field bg-white" placeholder="Sarah Mukamana" value={form.fullName} onChange={handleChange} required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input id="email" name="email" type="email" className="input-field bg-white" placeholder="you@invest.rw" value={form.email} onChange={handleChange} required />
              </div>
              <div>
                <label className="label" htmlFor="phone">Phone</label>
                <input id="phone" name="phone" className="input-field bg-white" placeholder="+250 788 000 000" value={form.phone} onChange={handleChange} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="company">Company / Organization</label>
                <input id="company" name="company" className="input-field bg-white" placeholder="Kigali Ventures" value={form.company} onChange={handleChange} required />
              </div>
              <div>
                <label className="label" htmlFor="investorType">Investor Type</label>
                <select id="investorType" name="investorType" className="input-field bg-white" value={form.investorType} onChange={handleChange} required>
                  <option value="">Select type</option>
                  {INVESTOR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} className="input-field pr-12 bg-white" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} required minLength={8} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" className="input-field bg-white" value={form.confirmPassword} onChange={handleChange} required />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

            <button type="submit" className="btn-primary w-full">
              Create Investor Account <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-primary-600 font-semibold">Sign in</Link>
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">
            Are you an entrepreneur? <Link to="/register/entrepreneur" className="text-primary-600 font-semibold">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
