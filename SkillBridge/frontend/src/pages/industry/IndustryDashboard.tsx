import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, Users, Award, TrendingUp, ArrowRight, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, StatCard, Badge } from '@/components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/StateViews';
import type { Opportunity, Application, Internship } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate, titleCase } from '@/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function IndustryDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [oppRes, appRes, internRes] = await Promise.all([
          supabase.from('opportunities').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('applications').select('*, opportunity:opportunities(user_id)').eq('opportunity.user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('internships').select('*').eq('user_id', user.id),
        ]);
        setOpportunities((oppRes.data || []) as Opportunity[]);
        setApplications((appRes.data || []) as Application[]);
        setInternships((internRes.data || []) as Internship[]);
      } catch {
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const activeOpps = opportunities.filter((o) => o.status === 'open');
  const shortlisted = applications.filter((a) => a.status === 'shortlisted' || a.status === 'interview');
  const selected = applications.filter((a) => a.status === 'selected');

  const statusData = [
    { name: 'Submitted', count: applications.filter((a) => a.status === 'submitted').length },
    { name: 'Under Review', count: applications.filter((a) => a.status === 'under_review').length },
    { name: 'Shortlisted', count: applications.filter((a) => a.status === 'shortlisted').length },
    { name: 'Interview', count: applications.filter((a) => a.status === 'interview').length },
    { name: 'Selected', count: selected.length },
  ];

  const oppTypeData = (() => {
    const counts: Record<string, number> = {};
    opportunities.forEach((o) => { counts[o.opportunity_type] = (counts[o.opportunity_type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: titleCase(name), value }));
  })();

  const pieColors = ['#1143A3', '#006FFF', '#3E70FF', '#5186CD', '#1747A6'];

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-r from-brand-primary to-brand-medium p-6">
        <h2 className="text-xl font-bold text-white">Welcome, {user?.company_name || user?.full_name || 'Industry Partner'}!</h2>
        <p className="mt-1 text-sm text-blue-100">Manage your opportunities, review candidates, and track internships.</p>
        <Link to="/dashboard/opportunities" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20">
          <Plus className="h-4 w-4" /> Post New Opportunity
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<Briefcase className="h-5 w-5" />} label="Active Opportunities" value={activeOpps.length} />
        <StatCard icon={<FileText className="h-5 w-5" />} label="Total Applications" value={applications.length} color="brand-secondary" />
        <StatCard icon={<Users className="h-5 w-5" />} label="Shortlisted" value={shortlisted.length} color="brand-accent" />
        <StatCard icon={<Award className="h-5 w-5" />} label="Selected" value={selected.length} color="success" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-bold text-ink">Application Status Overview</h3>
          <div className="mt-4 h-64">
            {applications.length === 0 ? (
              <div className="flex h-full items-center justify-center"><p className="text-sm text-ink-muted">No applications yet</p></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB' }} />
                  <Bar dataKey="count" fill="#1143A3" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-bold text-ink">Opportunities by Type</h3>
          <div className="mt-4 h-64">
            {oppTypeData.length === 0 ? (
              <div className="flex h-full items-center justify-center"><p className="text-sm text-ink-muted">No opportunities yet</p></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={oppTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }: any) => name}>
                    {oppTypeData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-ink">Recent Applications</h3>
          <Link to="/dashboard/applications" className="text-sm text-brand-primary hover:underline">View all</Link>
        </div>
        {applications.length === 0 ? (
          <EmptyState title="No applications yet" description="Applications will appear here once students apply to your opportunities." />
        ) : (
          <div className="mt-3 space-y-2">
            {applications.slice(0, 5).map((app) => (
              <div key={app.id} className="flex items-center justify-between rounded-xl border border-surface-border p-3">
                <div>
                  <p className="text-sm font-medium text-ink">{app.opportunity?.title || 'Opportunity'}</p>
                  <p className="text-xs text-ink-muted">{formatDate(app.created_at)} · {app.match_score}% match</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
