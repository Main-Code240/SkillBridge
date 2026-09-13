import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, Badge } from '@/components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/StateViews';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Application } from '@/types';
import { formatDate, titleCase } from '@/utils';

const statusFilters = ['all', 'submitted', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected'];

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchApps = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('applications')
      .select('*, opportunity:opportunities(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) { setError(error.message); }
    else { setApplications((data || []) as Application[]); }
    setLoading(false);
  };

  useEffect(() => { fetchApps(); }, [user]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchApps} />;

  const filtered = applications.filter((a) => {
    const matchesFilter = filter === 'all' || a.status === filter;
    const matchesSearch = !search || (a.opportunity?.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.opportunity?.company_name || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">My Applications</h2>
        <p className="text-sm text-ink-muted">Track the status of your applications</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10" placeholder="Search applications..." />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              filter === s ? 'bg-brand-primary text-white' : 'bg-white text-ink-muted border border-surface-border hover:bg-gray-50'
            }`}>
            {titleCase(s)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={<FileText className="h-8 w-8 text-brand-primary/40" />} title="No applications found"
          description="Apply to opportunities to see them here."
          action={<Link to="/dashboard/opportunities" className="btn-primary">Browse Opportunities</Link>} /></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <Card key={app.id} className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-ink">{app.opportunity?.title || 'Opportunity'}</h3>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-sm text-ink-muted">{app.opportunity?.company_name}</p>
                  <p className="mt-1 text-xs text-ink-muted">Applied on {formatDate(app.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {app.match_score > 0 && (
                    <div className="text-center">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${
                        app.match_score >= 75 ? 'bg-green-50 text-success' : app.match_score >= 50 ? 'bg-amber-50 text-warning' : 'bg-red-50 text-error'
                      }`}>{app.match_score}%</div>
                      <span className="text-xs text-ink-muted">Match</span>
                    </div>
                  )}
                </div>
              </div>
              {app.matched_skills && app.matched_skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {app.matched_skills.map((s) => <Badge key={s} variant="success">{s}</Badge>)}
                  {app.missing_skills && app.missing_skills.map((s) => <Badge key={s} variant="error">{s}</Badge>)}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
