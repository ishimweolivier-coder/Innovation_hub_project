import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'

export default function WelcomePopup() {
  const [name, setName] = useState(() => sessionStorage.getItem('welcome_name'))
  const [visible, setVisible] = useState(!!sessionStorage.getItem('welcome_name'))
  const [dismissing, setDismissing] = useState(false)

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => {
      setDismissing(true)
      setTimeout(() => {
        setVisible(false)
        setName(null)
        sessionStorage.removeItem('welcome_name')
      }, 500)
    }, 4000)
    return () => clearTimeout(timer)
  }, [visible])

  const handleDismiss = () => {
    setDismissing(true)
    setTimeout(() => {
      setVisible(false)
      setName(null)
      sessionStorage.removeItem('welcome_name')
    }, 500)
  }

  if (!visible || !name) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-16 pointer-events-none">
      <div
        className={`pointer-events-auto relative max-w-lg w-full mx-4 px-8 py-7 rounded-2xl shadow-2xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-primary-50 text-center transform transition-all duration-500 ${
          dismissing ? 'opacity-0 scale-95 -translate-y-4' : 'opacity-100 scale-100 translate-y-0'
        }`}
      >
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center shadow-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h2 className="mt-2 font-display text-2xl font-bold text-gray-900">
          Signed in successfully!
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          Welcome back, <span className="font-semibold text-primary-700">{name}</span>
        </p>
        <div className="mt-4 flex justify-center gap-1">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-primary-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <button
          onClick={handleDismiss}
          className="mt-4 text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 pointer-events-auto"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
