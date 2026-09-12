import { Link } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/opportunities', label: 'Opportunities' },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-surface-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-ink">SkillBridge</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm font-medium text-ink-muted hover:text-brand-primary transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="btn-ghost">Login</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>

        <button className="rounded-lg p-2 text-ink md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-surface-border bg-white px-4 py-4 md:hidden">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="block py-2 text-sm font-medium text-ink-muted hover:text-brand-primary" onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="mt-3 flex gap-2">
            <Link to="/login" className="btn-secondary flex-1 text-center" onClick={() => setMobileOpen(false)}>Login</Link>
            <Link to="/register" className="btn-primary flex-1 text-center" onClick={() => setMobileOpen(false)}>Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
