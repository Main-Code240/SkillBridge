import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, Target, Briefcase, FileText, Award, TrendingUp, ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, StatCard, Badge } from '@/components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/StateViews';
import type { SkillProfile, Application, Internship, Certificate, Opportunity } from '@/types';
import { calculateMatchScore, formatDate, titleCase } from '@/utils';
import OpportunityCard from '@/components/ui/OpportunityCard';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<SkillProfile[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [recommendedOpps, setRecommendedOpps] = useState<(Opportunity & { matchScore: number })[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [skillsRes, appsRes, internshipsRes, certsRes, oppsRes] = await Promise.all([
          supabase.from('skill_profiles').select('*').eq('user_id', user.id),
          supabase.from('applications').select('*, opportunity:opportunities(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
          supabase.from('internships').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('certificates').select('*').eq('user_id', user.id),
          supabase.from('opportunities').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(6),
        ]);

        setSkills((skillsRes.data || []) as SkillProfile[]);
        setApplications((appsRes.data || []) as Application[]);
        setInternships((internshipsRes.data || []) as Internship[]);
        setCertificates((certsRes.data || []) as Certificate[]);

        const allOpps = (oppsRes.data || []) as Opportunity[];
        const scored = allOpps
          .map((o) => ({ ...o, matchScore: calculateMatchScore(skillsRes.data || [], o).score }))
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 3);
        setRecommendedOpps(scored);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const avgScore = skills.length > 0 ? Math.round(skills.reduce((a, s) => a + s.score, 0) / skills.length) : 0;
  const skillGaps = skills.filter((s) => s.score < 50);
  const activeApps = applications.filter((a) => !['selected', 'rejected', 'withdrawn'].includes(a.status));
  const activeInternships = internships.filter((i) => !['completed', 'cancelled'].includes(i.status));

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card bg-gradient-to-r from-brand-primary to-brand-medium p-6">
        <h2 className="text-xl font-bold text-white">Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}!</h2>
        <p className="mt-1 text-sm text-blue-100">
          {user?.is_profile_complete
            ? 'Your profile is complete. Keep building your skills!'
            : 'Complete your profile to get better recommendations.'}
        </p>
        {!user?.is_profile_complete && (
          <Link to="/dashboard/settings" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20">
            Complete Profile <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<Brain className="h-5 w-5" />} label="Avg Skill Score" value={`${avgScore}%`} color="brand-primary" />
        <StatCard icon={<Target className="h-5 w-5" />} label="Skill Gaps" value={skillGaps.length} color="error" />
        <StatCard icon={<FileText className="h-5 w-5" />} label="Active Applications" value={activeApps.length} color="brand-secondary" />
        <StatCard icon={<Award className="h-5 w-5" />} label="Certificates" value={certificates.length} color="success" />
      </div>

      {/* Recommended Opportunities */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink">Recommended for You</h3>
          <Link to="/dashboard/opportunities" className="text-sm font-medium text-brand-primary hover:underline">
            View all
          </Link>
        </div>
        {recommendedOpps.length === 0 ? (
          <Card><EmptyState icon={<Briefcase className="h-8 w-8 text-brand-primary/40" />} title="No opportunities yet" description="New opportunities will appear here once industries post them." /></Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendedOpps.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} showMatch matchScore={opp.matchScore}
                onClick={() => window.location.href = `/dashboard/opportunities`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Applications + Active Internships */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-ink">Recent Applications</h3>
            <Link to="/dashboard/applications" className="text-sm text-brand-primary hover:underline">View all</Link>
          </div>
          {applications.length === 0 ? (
            <EmptyState title="No applications yet" description="Apply to opportunities to track them here." />
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 4).map((app) => (
                <div key={app.id} className="flex items-center justify-between rounded-xl border border-surface-border p-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{app.opportunity?.title || 'Opportunity'}</p>
                    <p className="text-xs text-ink-muted">{app.opportunity?.company_name} · {formatDate(app.created_at)}</p>
                  </div>
                  <Badge variant={app.status === 'selected' ? 'success' : app.status === 'rejected' ? 'error' : 'info'}>
                    {titleCase(app.status)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-ink">Active Internships</h3>
            <Link to="/dashboard/internships" className="text-sm text-brand-primary hover:underline">View all</Link>
          </div>
          {activeInternships.length === 0 ? (
            <EmptyState title="No active internships" description="Your internships will appear here once you're selected." />
          ) : (
            <div className="space-y-3">
              {activeInternships.map((intern) => (
                <div key={intern.id} className="rounded-xl border border-surface-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ink">{intern.title}</p>
                    <Badge variant="info">{titleCase(intern.status)}</Badge>
                  </div>
                  <p className="text-xs text-ink-muted">{intern.company_name}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-brand-primary" style={{ width: `${intern.progress}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">{intern.progress}% complete</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
