import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, Rocket, Brain, Users, TrendingUp, Shield,
  Sparkles, Globe, Target, Award, Briefcase,
  ChevronRight, Star, Zap, ChevronDown,
} from 'lucide-react'
import { IMAGES } from '../data/images'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import EventCard from '../components/shared/EventCard'
import OpportunityCard from '../components/shared/OpportunityCard'
import { useAppData } from '../context/AppDataContext'
import { formatCurrency } from '../data/constants'

export default function LandingPage() {
  const { opportunities, events, publicStats } = useAppData()
  const navigate = useNavigate()
  const stats = publicStats
  return (
    <div className="min-h-screen">
      <Navbar variant="hero" />

      {/* Hero Section — full background image */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: `url('${IMAGES.hero}')` }}
          aria-hidden="true"
        />
        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 hero-overlay" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-gray-900/20" aria-hidden="true" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 lg:pt-32 lg:pb-28">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left — headline & CTAs */}
            <div className="lg:col-span-7 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-primary-200 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 text-accent-400" />
                AI-Powered Innovation Platform · Rwanda
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.08] tracking-tight">
                Building Rwanda&apos;s{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-emerald-300 to-teal-200">
                  Innovation Future
                </span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-gray-200 leading-relaxed max-w-xl">
                The one-stop home for startups, investors, and innovation programs —
                from idea submission to funding, powered by smart AI evaluation.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/register/entrepreneur" className="btn-primary shadow-xl shadow-primary-900/40">
                  Start Your Journey <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register/investor"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white border-2 border-white/30 hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                >
                  Invest in Innovation
                </Link>
              </div>

              {/* Stats row */}
              <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-4 max-w-lg">
                {[
                  { value: `${stats.totalStartups}+`, label: 'Startups' },
                  { value: `${stats.activeInvestors}+`, label: 'Investors' },
                  { value: `${stats.successRate}%`, label: 'Success Rate' },
                ].map((stat) => (
                  <div key={stat.label} className="hero-stat-card text-center sm:text-left">
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-primary-200/80 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating UI cards over the image */}
            <div className="lg:col-span-5 relative hidden lg:block animate-slide-up animate-delay-200">
              <div className="relative ml-auto max-w-md">
                <div className="glass-dark rounded-2xl p-6 shadow-2xl animate-float border border-white/10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-primary-500/30 flex items-center justify-center border border-primary-400/30">
                      <Brain className="w-5 h-5 text-primary-200" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">AI Evaluation</p>
                      <p className="text-xs text-gray-300">AgriSmart Rwanda</p>
                    </div>
                    <span className="ml-auto badge bg-green-500/20 text-green-300 border border-green-400/30">Live</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ label: 'Market', score: 85 }, { label: 'Product', score: 90 }, { label: 'Overall', score: 88 }].map((s) => (
                      <div key={s.label} className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-2xl font-bold text-primary-300">{s.score}%</p>
                        <p className="text-xs text-gray-400">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-emerald-500/15 border border-emerald-400/20">
                    <span className="text-sm font-medium text-emerald-300">Low Risk</span>
                    <span className="text-sm font-bold text-white">ROI: 25%</span>
                  </div>
                </div>

                <div className="absolute -bottom-8 -left-8 glass-dark rounded-xl p-4 shadow-xl animate-float border border-white/10" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent-500/30 flex items-center justify-center">
                      <Star className="w-4 h-4 text-accent-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">New Investment</p>
                      <p className="text-xs text-gray-400">RWF 5M received</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-5 -right-5 glass-dark rounded-xl px-4 py-3 shadow-xl animate-float border border-white/10" style={{ animationDelay: '4s' }}>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-white">89 Startups Approved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <a
          href="#features"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/50 hover:text-white/80 transition-colors"
          aria-label="Scroll to features"
        >
          <span className="text-xs uppercase tracking-widest">Discover</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </a>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white relative">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-gray-900/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">Platform Features</p>
            <h2 className="section-title">Smarter, More Coordinated Support</h2>
            <p className="section-subtitle mx-auto mt-4">
              Aligning programs and partners so support actually reaches the right founders.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Rocket, title: 'Startup Application Management', desc: 'Submit ideas, upload business plans and budgets, and track your application through every stage.' },
              { icon: Brain, title: 'AI Startup Evaluation', desc: 'Get instant uniqueness scores, risk assessments, and ROI predictions powered by smart algorithms.' },
              { icon: Users, title: 'Investor Connection', desc: 'Connect with local and international investors ready to fund Rwanda\'s most promising innovations.' },
              { icon: Briefcase, title: 'Opportunity Center', desc: 'Access grants, competitions, scholarships, and incubation programs all in one place.' },
              { icon: TrendingUp, title: 'Progress Tracking', desc: 'Monitor your startup journey from submission through incubation, funding, and graduation.' },
              { icon: Shield, title: 'Secure & Transparent', desc: 'Full visibility for all stakeholders with secure document management and audit trails.' },
            ].map((feature, i) => (
              <div key={i} className="card p-8 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center mb-5 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="font-display font-bold text-xl text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem Stats — parallax-style background */}
      <section id="ecosystem" className="py-24 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-30"
          style={{ backgroundImage: `url('${IMAGES.hero}')` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-mesh-gradient opacity-90" aria-hidden="true" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary-200 font-semibold text-sm uppercase tracking-wider mb-3">Ecosystem</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Rwanda in Numbers</h2>
            <p className="text-primary-100 mt-4 max-w-2xl mx-auto">
              Explore the vibrant ecosystem of Rwanda, showcasing key sectors, innovations, and opportunities for growth.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: `${stats.totalStartups}+`, label: 'Registered Startups', icon: Rocket },
              { value: `${stats.activeInvestors}+`, label: 'Active Investors', icon: Users },
              { value: formatCurrency(stats.fundingVolume || 0), label: 'Funding Volume', icon: Target },
              { value: `${stats.successRate}%`, label: 'Success Rate', icon: Award },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 hover:scale-[1.02] transition-all duration-300">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary-200" />
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-primary-100 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Opportunities */}
      <section id="opportunities" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">Opportunities</p>
              <h2 className="section-title">Grow With Rwanda&apos;s Innovation Ecosystem</h2>
            </div>
            <Link to="/register/entrepreneur" className="btn-primary text-sm self-start">
              See More Opportunities <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {opportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onApply={() => navigate('/register/entrepreneur')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Community CTA Cards */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Showcase Your Profile', desc: 'Put your innovating firm in front of the local and global innovation community.', link: '/register/entrepreneur', cta: 'Get Started', icon: Globe },
              { title: 'Strategic Partnerships', desc: 'Connect with partners offering funding, mentorship, and tools to accelerate growth.', link: '/register/investor', cta: 'Partner With Us', icon: Users },
              { title: 'Collaborate & Innovate', desc: 'Engage with ecosystem players through events, opportunities, and resources.', link: '#events', cta: 'Learn More', icon: Sparkles },
            ].map((card, i) => (
              <div key={i} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white group hover:shadow-2xl hover:shadow-primary-600/30 transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <card.icon className="w-10 h-10 text-primary-200 mb-4 relative" />
                <h3 className="font-display font-bold text-xl mb-2 relative">{card.title}</h3>
                <p className="text-primary-100 text-sm leading-relaxed mb-6 relative">{card.desc}</p>
                <Link to={card.link} className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:gap-3 transition-all relative">
                  {card.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section id="events" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">News & Events</p>
            <h2 className="section-title">Upcoming Events & Workshops</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRegister={() => navigate('/register/entrepreneur')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — image banner */}
      <section className="relative py-28 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${IMAGES.hero}')` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-primary-950/85" aria-hidden="true" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Join Rwanda&apos;s Innovation Community
          </h2>
          <p className="text-lg text-primary-100 mt-4 max-w-2xl mx-auto">
            From Kigali to secondary cities — bringing opportunities closer to women, youth, and innovators across all districts.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/register/entrepreneur" className="btn-primary shadow-xl shadow-primary-900/50">Register as Entrepreneur</Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white border-2 border-white/30 hover:bg-white/10 transition-all"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
