import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Brain, Target, Briefcase, GraduationCap, Building2, Award,
  Users, TrendingUp, CheckCircle2, FileText, BarChart3, Handshake,
  Search, UserCheck, Star, ChevronDown,
} from 'lucide-react';
import PublicNav from '@/components/layout/PublicNav';
import Footer from '@/components/layout/Footer';

const stats = [
  { label: 'Students', value: '12,000+' },
  { label: 'Industries', value: '500+' },
  { label: 'Institutions', value: '120+' },
  { label: 'Placements', value: '3,400+' },
];

const steps = [
  { icon: <UserCheck className="h-6 w-6" />, title: 'Register & Profile', desc: 'Students create profiles with their education, skills, and career goals.' },
  { icon: <Brain className="h-6 w-6" />, title: 'Skill Assessment', desc: 'Take assessments across technical, aptitude, and soft skill domains.' },
  { icon: <Target className="h-6 w-6" />, title: 'Skill Mapping', desc: 'Get a normalized skill profile with verified scores and identified gaps.' },
  { icon: <TrendingUp className="h-6 w-6" />, title: 'Learning Recommendations', desc: 'Receive targeted learning programs to close skill gaps.' },
  { icon: <Briefcase className="h-6 w-6" />, title: 'Match & Apply', desc: 'See match scores for internships and jobs. Apply with confidence.' },
  { icon: <Award className="h-6 w-6" />, title: 'Internship & Certificate', desc: 'Track internships, receive mentor feedback, earn certificates.' },
];

const features = [
  { icon: <Brain className="h-5 w-5" />, title: 'Skill Assessment Engine', desc: 'Configurable assessments with automated scoring, skill level assignment, and gap detection across 6 assessment types.' },
  { icon: <Target className="h-5 w-5" />, title: 'Transparent Skill Mapping', desc: 'Rule-based match scoring that explains exactly why a student matches an opportunity — no black-box AI.' },
  { icon: <Briefcase className="h-5 w-5" />, title: 'Internship & Job Module', desc: 'Full lifecycle from posting to application, shortlisting, interview, selection, and internship tracking.' },
  { icon: <Handshake className="h-5 w-5" />, title: 'Academia-Industry Collaboration', desc: 'Mentorship, guest lectures, workshops, research, consultancy, FDPs, and innovation challenges.' },
  { icon: <FileText className="h-5 w-5" />, title: 'Verified Digital Portfolio', desc: 'Every student builds a shareable portfolio with verified skills, projects, certificates, and internship history.' },
  { icon: <BarChart3 className="h-5 w-5" />, title: 'Placement Analytics', desc: 'Institutions and industries get real-time dashboards on skill gaps, internship rates, and placement metrics.' },
];

const roles = [
  { icon: <GraduationCap className="h-6 w-6" />, title: 'Students', desc: 'Assess skills, find matched opportunities, track internships, build a verified portfolio.' },
  { icon: <Users className="h-6 w-6" />, title: 'Academicians', desc: 'Mentor students, track progress, collaborate with industry on research and programs.' },
  { icon: <Building2 className="h-6 w-6" />, title: 'Industries', desc: 'Post opportunities, see candidate match scores, shortlist, select, and manage internships.' },
  { icon: <Search className="h-6 w-6" />, title: 'Institutions', desc: 'Monitor skill gaps, internship participation, placement rates, and industry demand.' },
];

const faqs = [
  { q: 'What is SkillBridge?', a: 'SkillBridge is a centralized portal connecting students, academicians, industries, and institutions for skill mapping, internships, and placements.' },
  { q: 'How does the skill matching work?', a: 'Our transparent rule-based engine compares student skill profiles against opportunity requirements, calculating an explainable match percentage with matched and missing skills.' },
  { q: 'Who can use the platform?', a: 'Students, academicians, industry representatives, institution administrators, and platform admins — each with role-specific dashboards and capabilities.' },
  { q: 'Is the platform free to use?', a: 'Yes, SkillBridge is designed for academic and government use. Students and institutions can register and use all core features at no cost.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-bg">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-accent/5" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-4 py-1.5 text-sm font-medium text-brand-primary">
              <Star className="h-4 w-4" /> Smart India Hackathon 2026 · SIH26044
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Connect Skills, Academia
              <br />
              <span className="text-brand-primary">and Industry</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-muted">
              A unified platform for skill mapping, internships, placements, and academia-industry collaboration.
              Assess skills, identify gaps, get matched to opportunities, and build a verified digital portfolio.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/register" className="btn-primary btn-lg group">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/opportunities" className="btn-secondary btn-lg">
                <Search className="h-4 w-4" />
                Explore Opportunities
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {stats.map((s) => (
              <div key={s.label} className="card p-5 text-center">
                <p className="text-3xl font-extrabold text-brand-primary">{s.value}</p>
                <p className="mt-1 text-sm text-ink-muted">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-ink">How It Works</h2>
            <p className="mt-3 text-ink-muted">From registration to placement in six clear steps</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="card p-6 hover:shadow-elevated transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                    {step.icon}
                  </div>
                  <span className="text-3xl font-extrabold text-brand-primary/10">{i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skill Assessment & Mapping */}
      <section className="bg-surface-bg py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-3 py-1 text-sm font-medium text-brand-primary">
                <Brain className="h-4 w-4" /> Skill Assessment
              </span>
              <h2 className="mt-4 text-3xl font-bold text-ink">Assess. Profile. Map.</h2>
              <p className="mt-4 text-ink-muted">
                Our configurable assessment engine evaluates students across technical, aptitude, communication,
                problem-solving, soft skills, and domain knowledge. Results generate a normalized skill profile
                with proficiency levels from beginner to expert.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  '6 assessment types with configurable questions',
                  'Automated scoring with skill level assignment',
                  'Skill gap detection with targeted recommendations',
                  'Verified vs. unverified skill distinction',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-ink">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-8">
              <div className="space-y-4">
                {[
                  { skill: 'JavaScript', score: 82, level: 'Advanced' },
                  { skill: 'React', score: 76, level: 'Advanced' },
                  { skill: 'Node.js', score: 70, level: 'Intermediate' },
                  { skill: 'SQL', score: 42, level: 'Beginner' },
                  { skill: 'Communication', score: 64, level: 'Intermediate' },
                ].map((s) => (
                  <div key={s.skill}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-ink">{s.skill}</span>
                      <span className="font-bold text-brand-primary">{s.score}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-brand-primary" style={{ width: `${s.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl bg-amber-50 p-4">
                <p className="text-sm font-medium text-warning">Skill Gap Detected</p>
                <p className="mt-1 text-sm text-ink-muted">SQL at 42% — recommended: "SQL Fundamentals" learning program</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Match Score Demo */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1 card p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                  <span className="text-2xl font-bold text-success">78%</span>
                </div>
                <div>
                  <p className="font-semibold text-success">Good Match</p>
                  <p className="text-sm text-ink-muted">Frontend Developer Intern at TechCorp</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-success">Matched Skills</p>
                  <div className="mt-2 space-y-1.5">
                    {['JavaScript', 'React', 'Node.js'].map((s) => (
                      <div key={s} className="flex items-center gap-2 text-sm text-ink">
                        <CheckCircle2 className="h-4 w-4 text-success" /> {s}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-error">Skill Gaps</p>
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-ink">
                      <span className="h-4 w-4 rounded-full bg-red-50 text-error flex items-center justify-center text-xs">!</span>
                      MongoDB
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-brand-primary/5 p-3">
                <p className="text-xs text-ink-muted">Recommended Learning: "MongoDB Fundamentals"</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-3 py-1 text-sm font-medium text-brand-primary">
                <Target className="h-4 w-4" /> Skill Mapping
              </span>
              <h2 className="mt-4 text-3xl font-bold text-ink">Explainable Match Scores</h2>
              <p className="mt-4 text-ink-muted">
                No black-box AI. Our transparent rule-based engine calculates match percentages by comparing
                student skill proficiency against opportunity requirements. Students see exactly which skills
                match and which gaps need closing — and get learning recommendations to bridge them.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Weighted scoring across required and preferred skills',
                  'Eligibility, education, and experience filters',
                  'Clear matched vs. missing skills breakdown',
                  'Targeted learning program recommendations',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-ink">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-surface-bg py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-ink">Platform Features</h2>
            <p className="mt-3 text-ink-muted">Everything needed for the complete academia-industry collaboration lifecycle</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="card p-6 hover:shadow-elevated transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  {f.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-ink">Built for Every Role</h2>
            <p className="mt-3 text-ink-muted">Tailored dashboards for each participant in the ecosystem</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {roles.map((r, i) => (
              <div key={i} className="card p-6 text-center hover:shadow-elevated transition-all">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                  {r.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">{r.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-primary py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">Ready to Bridge the Gap?</h2>
          <p className="mt-4 text-blue-100">
            Join thousands of students, industries, and institutions on SkillBridge.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-primary transition-all hover:bg-blue-50 active:scale-[0.98]">
              Create Account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.98]">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface-bg py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-ink">Frequently Asked Questions</h2>
          <div className="mt-10 space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="card group p-5">
                <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-ink">
                  {faq.q}
                  <ChevronDown className="h-5 w-5 text-ink-muted transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-ink-muted">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
