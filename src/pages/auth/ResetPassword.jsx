import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Lightbulb, ArrowLeft, Lock, CheckCircle, RefreshCw } from 'lucide-react'
import api from '../../services/api'
import AuthSidePanel from '../../components/shared/AuthSidePanel'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [token, setToken] = useState(searchParams.get('token') || '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [resendMessage, setResendMessage] = useState('')
  const [resending, setResending] = useState(false)

  const handleResend = async () => {
    if (!email) {
      setError('Enter your email first')
      return
    }
    setError('')
    setResendMessage('')
    setResending(true)
    try {
      const result = await api.resendResetLink(email)
      setResendMessage(result.message || 'A new reset link was sent to your email.')
    } catch (err) {
      setError(err.message || 'Could not resend link')
    } finally {
      setResending(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResendMessage('')
    if (!token) {
      setError('Use the reset link from your email, or request a new one below.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    try {
      await api.resetPassword({ email, token, newPassword: password })
      setDone(true)
    } catch (err) {
      setError(err.message || 'Reset failed')
    }
  }

  return (
    <div className="min-h-screen flex">
      <AuthSidePanel image="/images/auth-login.jpg" imageAlt="Innovation Hub Rwanda" width="narrow">
        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="font-display text-3xl font-bold">Set New Password</h2>
        <p className="mt-4 text-primary-100 leading-relaxed">Choose a strong password for your Innovation Hub account.</p>
      </AuthSidePanel>

      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md card-elevated p-8 bg-white">
          {!done ? (
            <>
              <h1 className="font-display text-2xl font-bold text-gray-900 text-center">Reset Password</h1>
              <p className="text-gray-500 mt-2 text-sm text-center">
                {token ? 'Set your new password below.' : 'Open the link from your email to continue.'}
              </p>
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {!token && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                    No reset token found. Check your email for the link from Innovation Hub, or request a new one.
                  </div>
                )}
                {token && (
                  <input type="hidden" value={token} readOnly />
                )}
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
                  {resending ? 'Sending…' : 'Resend reset link'}
                </button>
                {resendMessage && <p className="text-sm text-green-600">{resendMessage}</p>}
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" className="btn-primary w-full" disabled={!token}>Update Password</button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h1 className="font-display text-2xl font-bold">Password Updated</h1>
              <p className="text-gray-500 mt-2 text-sm">You can now sign in with your new password.</p>
              <Link to="/login" className="btn-primary mt-6 inline-flex">Sign In</Link>
            </div>
          )}
          <Link to="/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-primary-600 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
