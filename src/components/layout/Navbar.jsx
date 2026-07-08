import { Link } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export default function Navbar({ variant = 'default' }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)

  const isHero = variant === 'hero'

  const navClass = isHero
    ? 'fixed top-0 left-0 right-0 z-50 bg-gray-900/30 backdrop-blur-md border-b border-white/10'
    : 'sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'

  const linkClass = isHero
    ? 'text-sm font-medium text-white/80 hover:text-white transition-colors'
    : 'text-sm font-medium text-gray-600 hover:text-primary-700 transition-colors'

  const brandTitleClass = isHero ? 'text-white' : 'text-gray-900'
  const brandSubClass = isHero ? 'text-primary-300' : 'text-primary-600'
  const ghostClass = isHero
    ? 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all'
    : 'btn-ghost text-sm'

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary-900/30 group-hover:scale-105 transition-transform bg-white">
              <img src="/logo.svg" alt="Innovation Hub" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <span className={`font-display font-bold text-lg ${brandTitleClass}`}>Innovation Hub</span>
              <span className={`block text-xs font-medium -mt-0.5 ${brandSubClass}`}>Rwanda</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <a href="#features" className={linkClass}>Features</a>
            <a href="#opportunities" className={linkClass}>Opportunities</a>
            <a href="#ecosystem" className={linkClass}>Ecosystem</a>
            <a href="#events" className={linkClass}>Events</a>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login" className={ghostClass}>Sign In</Link>
            <div className="relative">
              <button
                onClick={() => setRegisterOpen(!registerOpen)}
                className="btn-primary text-sm py-2.5 px-5"
              >
                Get Started
                <ChevronDown className={`w-4 h-4 transition-transform ${registerOpen ? 'rotate-180' : ''}`} />
              </button>
              {registerOpen && (
                <div className="absolute right-0 mt-2 w-56 card-elevated py-2 animate-fade-in">
                  <Link to="/register/entrepreneur" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700" onClick={() => setRegisterOpen(false)}>
                    Register as Entrepreneur
                  </Link>
                  <Link to="/register/investor" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700" onClick={() => setRegisterOpen(false)}>
                    Register as Investor
                  </Link>
                </div>
              )}
            </div>
          </div>

          <button
            className={`lg:hidden p-2 rounded-lg ${isHero ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100'}`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={`lg:hidden border-t px-4 py-4 space-y-3 animate-fade-in ${isHero ? 'border-white/10 bg-gray-900/95' : 'border-gray-100 bg-white'}`}>
          <a href="#events" className={`block py-2 ${isHero ? 'text-white/80' : 'text-gray-600'}`} onClick={() => setMobileOpen(false)}>Events</a>
          <a href="#features" className={`block py-2 ${isHero ? 'text-white/80' : 'text-gray-600'}`} onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#opportunities" className={`block py-2 ${isHero ? 'text-white/80' : 'text-gray-600'}`} onClick={() => setMobileOpen(false)}>Opportunities</a>
          <a href="#ecosystem" className={`block py-2 ${isHero ? 'text-white/80' : 'text-gray-600'}`} onClick={() => setMobileOpen(false)}>Ecosystem</a>
          <Link to="/login" className={`block py-2 font-medium ${isHero ? 'text-primary-300' : 'text-primary-700'}`} onClick={() => setMobileOpen(false)}>Sign In</Link>
          <Link to="/register/entrepreneur" className="btn-primary w-full text-sm" onClick={() => setMobileOpen(false)}>Register as Entrepreneur</Link>
          <Link to="/register/investor" className="btn-secondary w-full text-sm" onClick={() => setMobileOpen(false)}>Register as Investor</Link>
        </div>
      )}
    </nav>
  )
}
