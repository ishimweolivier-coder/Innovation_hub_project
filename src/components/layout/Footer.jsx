import { Link } from 'react-router-dom'
import { Lightbulb, Mail, MapPin, Phone, ExternalLink, Twitter, Globe } from 'lucide-react'

const EXTERNAL = {
  minict: 'https://www.minict.gov.rw/',
  mineduc: 'https://www.mineduc.gov.rw/',
  rdb: 'https://rdb.rw/',
  innovateRwanda: 'https://innovaterwanda.rw/',
  uok: 'https://uok.ac.rw/',
  x: 'https://x.com/ishimwe_O_1',
  instagram: 'https://instagram.com/ishimwe_rwema_olivier',
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-white text-lg">Innovation Hub</span>
                <span className="block text-xs text-primary-400">Rwanda</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              AI-powered platform connecting Rwanda&apos;s innovators with investors, opportunities, and growth pathways.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/register/entrepreneur" className="hover:text-primary-400 transition-colors">For Entrepreneurs</Link></li>
              <li><Link to="/register/investor" className="hover:text-primary-400 transition-colors">For Investors</Link></li>
              <li><Link to="/#opportunities" className="hover:text-primary-400 transition-colors">Opportunities</Link></li>
              <li><Link to="/#events" className="hover:text-primary-400 transition-colors">Events & Workshops</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href={EXTERNAL.minict} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors inline-flex items-center gap-1">
                  Ministry of ICT <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href={EXTERNAL.mineduc} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors inline-flex items-center gap-1">
                  Ministry of Education <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href={EXTERNAL.innovateRwanda} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors inline-flex items-center gap-1">
                  Innovate Rwanda <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href={EXTERNAL.rdb} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors inline-flex items-center gap-1">
                  RDB — Startup Support <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href={EXTERNAL.uok} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors inline-flex items-center gap-1">
                  University of Kigali <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li><Link to="/#features" className="hover:text-primary-400 transition-colors">How Evaluation Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-400 shrink-0" /> Kigali, Rwanda</li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                <a href="mailto:olivierishimwe006@gmail.com" className="hover:text-primary-400">olivierishimwe006@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" />
                <a href="tel:+250789637777" className="hover:text-primary-400">+250 789 637 777</a>
              </li>
              <li className="flex items-center gap-3 pt-2">
                <a href={EXTERNAL.x} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors" title="X (Twitter)">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href={EXTERNAL.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors" title="Instagram">
                  <Globe className="w-5 h-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; 2026{' '}
            Innovation Hub Rwanda
          </p>
          <div className="flex gap-4">
            <span className="w-3 h-3 rounded-full bg-rwanda-blue" title="Rwanda" />
            <span className="w-3 h-3 rounded-full bg-rwanda-yellow" title="Rwanda" />
            <span className="w-3 h-3 rounded-full bg-rwanda-green" title="Rwanda" />
          </div>
        </div>
      </div>
    </footer>
  )
}
