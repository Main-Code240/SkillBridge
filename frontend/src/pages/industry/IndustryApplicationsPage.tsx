import { useEffect, useState } from 'react';
import { FileText, Search, User, CheckCircle2, XCircle, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, Badge } from '@/components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/StateViews';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import StatusBadge from '@/components/ui/StatusBadge';
import MatchScore from '@/components/ui/MatchScore';
import toast from 'react-hot-toast';
import type { Application, Profile } from '@/types';
import { formatDate, titleCase } from '@/utils';

const statuses = ['submitted', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected'];

export default function IndustryApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Application | null>(null);
  const [applicant, setApplicant] = useState<Profile | null>(null);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchApps = async () => {
    if (!user) return;
    try {
      const { data: opps } = await supabase.from('opportunities').select('id').eq('user_id', user.id);
      const oppIds = (opps || []).map((o: any) => o.id);
      if (oppIds.length === 0) { setApplications([]); setLoading(false); return; }
      const { data, error } = await supabase
        .from('applications')
        .select('*, opportunity:opportunities(*)')
        .in('opportunity_id', oppIds)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setApplications((data || []) as Application[]);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApps(); }, [user]);

  const viewApplicant = async (app: Application) => {
    setSelected(app);
    setNotes(app.industry_notes || '');
    const { data } = await supabase.from('profiles').select('*').eq('id', app.user_id).maybeSingle();
    setApplicant(data as Profile);
  };

  const updateStatus = async (appId: string, status: string) => {
    setUpdating(true);
    const { error } = await supabase.from('applications').update({ status, industry_notes: notes }).eq('id', appId);
    if (error) { toast.error(error.message); setUpdating(false); return; }

    // Notify the student
    const app = applications.find((a) => a.id === appId);
    if (app) {
      await supabase.from('notifications').insert({
        user_id: app.user_id,
        title: 'Application Status Updated',
        message: `Your application for ${app.opportunity?.title} has been moved to ${titleCase(status)}.`,
        type: 'application',
      });

      // If selected, create an internship record
      if (status === 'selected') {
        await supabase.from('internships').insert({
          user_id: app.user_id,
          application_id: appId,
          opportunity_id: app.opportunity_id,
          company_name: app.opportunity?.company_name || '',
          title: app.opportunity?.title || 'Internship',
          status: 'started',
          progress: 0,
        });
        await supabase.from('notifications').insert({
          user_id: app.user_id,
          title: 'Congratulations! You\'ve been selected',
          message: `You have been selected for ${app.opportunity?.title} at ${app.opportunity?.company_name}.`,
          type: 'success',
        });
      }
    }
    toast.success(`Application ${titleCase(status)}`);
    setUpdating(false);
    setSelected(null);
    fetchApps();
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchApps} />;

  const filtered = applications.filter((a) => {
    const matchesFilter = filter === 'all' || a.status === filter;
    const matchesSearch = !search || (a.opportunity?.title || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">Applications</h2>
        <p className="text-sm text-ink-muted">Review candidates and manage application statuses</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search by opportunity..." />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', ...statuses].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              filter === s ? 'bg-brand-primary text-white' : 'bg-white text-ink-muted border border-surface-border hover:bg-gray-50'
            }`}>{titleCase(s)}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={<FileText className="h-8 w-8 text-brand-primary/40" />} title="No applications found" description="Applications will appear here once students apply to your opportunities." /></Card>
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
                  <p className="text-sm text-ink-muted">Applied {formatDate(app.created_at)}</p>
                </div>
                {app.match_score > 0 && (
                  <div className="text-center">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${
                      app.match_score >= 75 ? 'bg-green-50 text-success' : app.match_score >= 50 ? 'bg-amber-50 text-warning' : 'bg-red-50 text-error'
                    }`}>{app.match_score}%</div>
                    <span className="text-xs text-ink-muted">Match</span>
                  </div>
                )}
                <Button size="sm" variant="secondary" onClick={() => viewApplicant(app)}>Review</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Review Application" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white font-bold">
                {applicant?.full_name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-bold text-ink">{applicant?.full_name || 'Applicant'}</p>
                <p className="text-sm text-ink-muted">{applicant?.email}</p>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm font-semibold text-ink">{selected.opportunity?.title}</p>
              <p className="text-xs text-ink-muted">{selected.opportunity?.company_name}</p>
            </div>

            {selected.match_score > 0 && (
              <MatchScore result={{ score: selected.match_score, matchedSkills: selected.matched_skills || [], missingSkills: selected.missing_skills || [], label: selected.match_score >= 75 ? 'Excellent Match' : selected.match_score >= 50 ? 'Good Match' : 'Moderate Match' }} />
            )}

            {selected.cover_letter && (
              <div>
                <p className="text-sm font-semibold text-ink">Cover Letter</p>
                <p className="mt-1 text-sm text-ink-muted">{selected.cover_letter}</p>
              </div>
            )}

            {applicant && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                {applicant.institution && <div><p className="text-ink-muted">Institution</p><p className="font-medium text-ink">{applicant.institution}</p></div>}
                {applicant.degree && <div><p className="text-ink-muted">Degree</p><p className="font-medium text-ink">{applicant.degree}</p></div>}
                {applicant.department && <div><p className="text-ink-muted">Department</p><p className="font-medium text-ink">{applicant.department}</p></div>}
                {applicant.graduation_year && <div><p className="text-ink-muted">Graduation</p><p className="font-medium text-ink">{applicant.graduation_year}</p></div>}
                {applicant.location && <div><p className="text-ink-muted">Location</p><p className="font-medium text-ink">{applicant.location}</p></div>}
                {applicant.linkedin_url && <div><p className="text-ink-muted">LinkedIn</p><a href={applicant.linkedin_url} target="_blank" rel="noreferrer" className="text-brand-primary hover:underline">View Profile</a></div>}
              </div>
            )}

            <Textarea label="Internal Notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes about this candidate..." />

            <div>
              <p className="mb-2 text-sm font-semibold text-ink">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <button key={s} disabled={updating || selected.status === s}
                    onClick={() => updateStatus(selected.id, s)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      selected.status === s ? 'bg-brand-primary text-white' : 'bg-white text-ink-muted border border-surface-border hover:bg-gray-50'
                    } disabled:opacity-50`}>{titleCase(s)}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
