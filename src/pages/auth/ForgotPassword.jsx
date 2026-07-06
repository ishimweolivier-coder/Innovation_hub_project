import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lightbulb, ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import api from '../../services/api'
import AuthSidePanel from '../../components/shared/AuthSidePanel'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.forgotPassword(email)
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Request failed')
    }
  }

  return (
    <div className="min-h-screen flex">
      <AuthSidePanel image="/images/auth-login.jpg" imageAlt="Innovation Hub Rwanda" width="narrow">
        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6">
          <Mail className="w-7 h-7" />
        </div>
        <h2 className="font-display text-3xl font-bold">Reset Your Password</h2>
        <p className="mt-4 text-primary-100 leading-relaxed">
          We&apos;ll email you a secure link from Innovation Hub to reset your password.
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
            {!submitted ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-7 h-7 text-primary-600" />
                </div>
                <h1 className="font-display text-2xl font-bold text-gray-900 text-center">Forgot your password?</h1>
                <p className="text-gray-500 mt-2 text-center text-sm">
                  Enter your email and we&apos;ll send a reset link from <strong>innovationhub@gmail.com</strong>.
                </p>
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                  <button type="submit" className="btn-primary w-full">Send Reset Link</button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <h1 className="font-display text-2xl font-bold text-gray-900">Check your email</h1>
                <p className="text-gray-500 mt-2 text-sm">
                  If an account exists for <strong className="text-gray-700">{email}</strong>, we sent a reset link.
                  Open the email from Innovation Hub and click the link to set a new password.
                </p>
                <p className="text-gray-400 mt-3 text-xs">Didn&apos;t receive it? Check spam or wait a minute and try again.</p>
              </div>
            )}

            <Link to="/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-primary-600 font-medium hover:text-primary-700">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
