import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lightbulb, ArrowRight, RefreshCw, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import AuthSidePanel from '../../components/shared/AuthSidePanel'
import { IMAGES } from '../../data/images'

const DASHBOARD_ROUTES = {
  entrepreneur: '/entrepreneur',
  investor: '/investor',
  admin: '/admin',
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [otpStep, setOtpStep] = useState(false)
  const [expiresInMinutes, setExpiresInMinutes] = useState(15)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const { login, verifyAdminOtp, resendAdminOtp } = useAuth()
  const navigate = useNavigate()

  const handleOtpChange = (value) => {
    setOtp(value.replace(/\D/g, '').slice(0, 6))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)

    if (otpStep) {
      const result = await verifyAdminOtp(email, otp)
      setSubmitting(false)
      if (result.success) {
        sessionStorage.setItem('welcome_name', result.name)
        navigate(DASHBOARD_ROUTES.admin)
      } else {
        setError(result.error)
      }
      return
    }

    const result = await login(email, password)
    setSubmitting(false)
    if (result.success) {
      if (result.requiresOtp) {
        setOtpStep(true)
        setExpiresInMinutes(result.expiresInMinutes || 15)
        setInfo(result.message || 'Enter the 6-digit code sent to your email.')
        setOtp('')
      } else {
        sessionStorage.setItem('welcome_name', result.name)
        navigate(DASHBOARD_ROUTES[result.role] || '/')
      }
    } else {
      setError(result.error)
    }
  }

  const handleResendOtp = async () => {
    setError('')
    setInfo('')
    setResending(true)
    const result = await resendAdminOtp(email)
    setResending(false)
    if (result.success) {
      setInfo(result.message || 'A new code was sent to your email.')
    } else {
      setError(result.error)
    }
  }

  const backToLogin = () => {
    setOtpStep(false)
    setOtp('')
    setError('')
    setInfo('')
  }

  return (
    <div className="min-h-screen flex">
      <AuthSidePanel
        image={IMAGES.authLogin}
        imageAlt="Innovators collaborating at Innovation Hub Rwanda"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mb-8">
          <Lightbulb className="w-8 h-8" />
        </div>
        <h2 className="font-display text-4xl font-bold leading-tight">Welcome Back to Innovation Hub</h2>
        <p className="mt-4 text-primary-100 text-lg leading-relaxed">
          Connect with Rwanda&apos;s innovation ecosystem. Track applications, discover opportunities, and grow your startup.
        </p>
        <div className="mt-10 space-y-4">
          {['AI-powered startup evaluation', 'Investor matching & funding', 'Progress tracking & analytics'].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-xs font-bold">{i + 1}</div>
              <span className="text-gray-100">{item}</span>
            </div>
          ))}
        </div>
      </AuthSidePanel>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg">Innovation Hub</span>
          </Link>

          {!otpStep ? (
            <>
              <h1 className="font-display text-2xl font-bold text-gray-900">Sign in to your account</h1>
              <p className="text-gray-500 mt-2">Enter your credentials to access your dashboard</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
                <ShieldCheck className="w-7 h-7 text-primary-600" />
              </div>
              <h1 className="font-display text-2xl font-bold text-gray-900">Admin verification</h1>
              <p className="text-gray-500 mt-2">
                Enter the 6-digit code sent to <strong className="text-gray-700">{email}</strong>.
                Expires in {expiresInMinutes} minutes.
              </p>
            </>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {!otpStep ? (
              <>
                <div>
                  <label className="label" htmlFor="email">Email address</label>
                  <input id="email" type="email" className="input-field bg-white" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="label mb-0" htmlFor="password">Password</label>
                    <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <input id="password" type={showPassword ? 'text' : 'password'} className="input-field pr-12 bg-white" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="label" htmlFor="otp">Verification code</label>
                  <input
                    id="otp"
                    className="input-field bg-white text-center text-2xl tracking-[0.5em] font-mono"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    required
                    maxLength={6}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="mt-2 flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:text-primary-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                    {resending ? 'Sending…' : 'Resend code'}
                  </button>
                </div>
                <button type="button" onClick={backToLogin} className="text-sm text-gray-500 hover:text-gray-700">
                  ← Back to sign in
                </button>
              </>
            )}

            {info && <p className="text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">{info}</p>}
            {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

            <button type="submit" className="btn-primary w-full" disabled={submitting || (otpStep && otp.length !== 6)}>
              {submitting ? 'Please wait...' : otpStep ? 'Verify & Go to Dashboard' : 'Sign In'}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {!otpStep && (
            <p className="mt-6 text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link to="/register/entrepreneur" className="text-primary-600 font-semibold hover:text-primary-700">Register as Entrepreneur</Link>
              {' or '}
              <Link to="/register/investor" className="text-primary-600 font-semibold hover:text-primary-700">Investor</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
