import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lightbulb, ArrowLeft, Mail, CheckCircle, KeyRound, RefreshCw } from 'lucide-react'
import api from '../../services/api'
import AuthSidePanel from '../../components/shared/AuthSidePanel'

export default function ForgotPassword() {
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.forgotPassword(email)
      setStep('otp')
    } catch (err) {
      setError(err.message || 'Request failed')
    }
  }

  const handleResend = async () => {
    setError('')
    setResending(true)
    try {
      await api.resendResetLink(email)
    } catch (err) {
      setError(err.message || 'Could not resend')
    } finally {
      setResending(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    try {
      await api.resetPassword({ email, token: otp, newPassword: password })
      setStep('done')
    } catch (err) {
      setError(err.message || 'Reset failed')
    }
  }

  return (
    <div className="min-h-screen flex">
      <AuthSidePanel image="/images/auth-login.jpg" imageAlt="Innovation Hub Rwanda" width="narrow">
        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6">
          {step === 'done' ? <CheckCircle className="w-7 h-7" /> : <Mail className="w-7 h-7" />}
        </div>
        <h2 className="font-display text-3xl font-bold">Reset Your Password</h2>
        <p className="mt-4 text-primary-100 leading-relaxed">
          {step === 'done'
            ? 'Your password has been updated.'
            : 'Enter your email to receive a verification code.'}
        </p>
      </AuthSidePanel>

      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg">Innovation Hub</span>
          </Link>

          <div className="card-elevated p-8 bg-white">
            {step === 'email' && (
              <>
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-7 h-7 text-primary-600" />
                </div>
                <h1 className="font-display text-2xl font-bold text-gray-900 text-center">Forgot your password?</h1>
                <p className="text-gray-500 mt-2 text-center text-sm">
                  Enter your email and we&apos;ll send a verification code.
                </p>
                <form onSubmit={handleSendOtp} className="mt-8 space-y-5">
                  <div>
                    <label className="label" htmlFor="email">Email address</label>
                    <input
                      id="email"
                      type="email"
                      className="input-field bg-white"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <button type="submit" className="btn-primary w-full">Send Verification Code</button>
                </form>
              </>
            )}

            {step === 'otp' && (
              <>
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-6">
                  <KeyRound className="w-7 h-7 text-primary-600" />
                </div>
                <h1 className="font-display text-2xl font-bold text-gray-900 text-center">Check your email</h1>
                <p className="text-gray-500 mt-2 text-center text-sm">
                  A 6-digit code was sent to <strong className="text-gray-700">{email}</strong>.
                </p>
                <form onSubmit={handleReset} className="mt-8 space-y-4">
                  <div>
                    <label className="label">Verification Code</label>
                    <input
                      type="text"
                      className="input-field text-center text-xl tracking-[8px] font-mono"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                    />
                  </div>
                  <div>
                    <label className="label">New Password</label>
                    <input
                      type="password"
                      className="input-field"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <label className="label">Confirm Password</label>
                    <input
                      type="password"
                      className="input-field"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:text-primary-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                    {resending ? 'Sending…' : 'Resend code'}
                  </button>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <button type="submit" className="btn-primary w-full">Reset Password</button>
                </form>
              </>
            )}

            {step === 'done' && (
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <h1 className="font-display text-2xl font-bold text-gray-900">Password Updated</h1>
                <p className="text-gray-500 mt-2 text-sm">
                  Your password has been reset successfully. You can now sign in with your new password.
                </p>
                <Link to="/login" className="btn-primary mt-6 inline-flex">Sign In</Link>
              </div>
            )}

            {step !== 'done' && (
              <Link to="/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-primary-600 font-medium hover:text-primary-700">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
