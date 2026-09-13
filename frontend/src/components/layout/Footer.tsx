import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-surface-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-ink">SkillBridge</span>
            </div>
            <p className="mt-3 text-sm text-ink-muted">
              Academia - Industry - Skills - Careers. A unified platform for skill mapping, internships, and placements.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink">Platform</h4>
            <ul className="mt-3 space-y-2">
              <li><Link to="/how-it-works" className="text-sm text-ink-muted hover:text-brand-primary">How It Works</Link></li>
              <li><Link to="/opportunities" className="text-sm text-ink-muted hover:text-brand-primary">Opportunities</Link></li>
              <li><Link to="/register" className="text-sm text-ink-muted hover:text-brand-primary">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink">Roles</h4>
            <ul className="mt-3 space-y-2">
              <li><Link to="/register" className="text-sm text-ink-muted hover:text-brand-primary">Student</Link></li>
              <li><Link to="/register" className="text-sm text-ink-muted hover:text-brand-primary">Industry</Link></li>
              <li><Link to="/register" className="text-sm text-ink-muted hover:text-brand-primary">Academician</Link></li>
              <li><Link to="/register" className="text-sm text-ink-muted hover:text-brand-primary">Institution</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink">Contact</h4>
            <ul className="mt-3 space-y-2">
              <li className="flex items-center gap-2 text-sm text-ink-muted"><Mail className="h-4 w-4" /> info@skillbridge.in</li>
              <li className="flex items-center gap-2 text-sm text-ink-muted"><Phone className="h-4 w-4" /> +91 11 1234 5678</li>
              <li className="flex items-center gap-2 text-sm text-ink-muted"><MapPin className="h-4 w-4" /> New Delhi, India</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-surface-border pt-6 text-center">
          <p className="text-xs text-ink-muted">
            SkillBridge - Smart India Hackathon 2026. Ministry of AYUSH, All India Institute of Ayurveda.
          </p>
        </div>
      </div>
    </footer>
  );
}
