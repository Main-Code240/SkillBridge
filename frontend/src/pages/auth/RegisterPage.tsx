import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, Building2, Users, Search, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

const roles: { value: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'student', label: 'Student', icon: <GraduationCap className="h-5 w-5" />, desc: 'Assess skills and find opportunities' },
  { value: 'industry', label: 'Industry', icon: <Building2 className="h-5 w-5" />, desc: 'Post jobs and manage internships' },
  { value: 'academician', label: 'Academician', icon: <Users className="h-5 w-5" />, desc: 'Mentor students and collaborate' },
  { value: 'institution', label: 'Institution', icon: <Search className="h-5 w-5" />, desc: 'Monitor analytics and placements' },
];

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (fullName.trim().length < 2) return 'Name must be at least 2 characters';
    if (!email.includes('@')) return 'Please enter a valid email';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    setLoading(true);
    const { error } = await signUp(email, password, role, fullName);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Account created! Welcome to SkillBridge.');
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-bg px-4 py-8">
      <div className="w-full max-w-lg">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-ink">SkillBridge</span>
        </Link>

        <div className="card p-8">
          <h1 className="text-2xl font-bold text-ink">Create Account</h1>
          <p className="mt-2 text-sm text-ink-muted">Join SkillBridge and bridge the skills gap</p>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-ink">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => (
                <button key={r.value} type="button" onClick={() => setRole(r.value)}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                    role === r.value
                      ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/10'
                      : 'border-surface-border hover:border-brand-accent/30'
                  }`}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    role === r.value ? 'bg-brand-primary text-white' : 'bg-gray-100 text-ink-muted'
                  }`}>
                    {r.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{r.label}</p>
                    <p className="text-xs text-ink-muted">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="input-field pl-10" placeholder="John Doe" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10" placeholder="you@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <input type={showPassword ? 'text' : 'password'} required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-10" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <input type={showPassword ? 'text' : 'password'} required value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-10" placeholder="••••••••" />
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
