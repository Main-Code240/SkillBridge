import { useEffect, useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, Badge } from '@/components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/StateViews';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import OpportunityCard from '@/components/ui/OpportunityCard';
import MatchScore from '@/components/ui/MatchScore';
import toast from 'react-hot-toast';
import type { Opportunity, SkillProfile, Application } from '@/types';
import { calculateMatchScore, OPPORTUNITY_TYPES, titleCase } from '@/utils';

export default function StudentOpportunitiesPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [skills, setSkills] = useState<SkillProfile[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [oppRes, skillRes, appRes] = await Promise.all([
        supabase.from('opportunities').select('*').eq('status', 'open').order('created_at', { ascending: false }),
        supabase.from('skill_profiles').select('*').eq('user_id', user.id),
        supabase.from('applications').select('*').eq('user_id', user.id),
      ]);
      setOpportunities((oppRes.data || []) as Opportunity[]);
      setSkills((skillRes.data || []) as SkillProfile[]);
      setApplications((appRes.data || []) as Application[]);
    } catch {
      setError('Failed to load opportunities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      const matchesSearch = !search ||
        o.title.toLowerCase().includes(search.toLowerCase()) ||
        o.company_name.toLowerCase().includes(search.toLowerCase()) ||
        o.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = !typeFilter || o.opportunity_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [opportunities, search, typeFilter]);

  const hasApplied = (oppId: string) => applications.some((a) => a.opportunity_id === oppId);

  const handleApply = async () => {
    if (!user || !selected) return;
    setApplying(true);
    try {
      const match = calculateMatchScore(skills, selected);
      const { error } = await supabase.from('applications').insert({
        user_id: user.id,
        opportunity_id: selected.id,
        cover_letter: coverLetter,
        match_score: match.score,
        matched_skills: match.matchedSkills,
        missing_skills: match.missingSkills,
        status: 'submitted',
      });
      if (error) throw error;

      // Notify the opportunity owner
      await supabase.from('notifications').insert({
        user_id: selected.user_id,
        title: 'New Application Received',
        message: `${user.full_name} applied for ${selected.title} with ${match.score}% match.`,
        type: 'application',
      });

      // Notify the student
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Application Submitted',
        message: `You applied for ${selected.title} at ${selected.company_name}.`,
        type: 'application',
      });

      toast.success('Application submitted!');
      setSelected(null);
      setCoverLetter('');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">Browse Opportunities</h2>
        <p className="text-sm text-ink-muted">Find internships, jobs, and projects matched to your skills</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10" placeholder="Search opportunities..." />
        </div>
        <div className="sm:w-48">
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {OPPORTUNITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <Card><EmptyState icon={<Search className="h-8 w-8 text-brand-primary/40" />} title="No opportunities found"
          description="Try adjusting your search or filters." /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((opp) => {
            const match = calculateMatchScore(skills, opp);
            return (
              <div key={opp.id} className="space-y-2">
                <OpportunityCard opportunity={opp} showMatch matchScore={match.score} onClick={() => setSelected(opp)} />
                {hasApplied(opp.id) && <Badge variant="success">Applied</Badge>}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail + Apply Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title || ''} size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-muted">{selected.company_name}</p>
                <Badge variant="brand">{titleCase(selected.opportunity_type)}</Badge>
              </div>
              {(() => {
                const match = calculateMatchScore(skills, selected);
                return <MatchScore result={match} />;
              })()}
            </div>

            {selected.description && <p className="text-sm text-ink">{selected.description}</p>}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {selected.location && <div><p className="text-ink-muted">Location</p><p className="font-medium text-ink">{selected.location}</p></div>}
              {selected.work_mode && <div><p className="text-ink-muted">Work Mode</p><p className="font-medium text-ink">{titleCase(selected.work_mode)}</p></div>}
              {selected.duration && <div><p className="text-ink-muted">Duration</p><p className="font-medium text-ink">{selected.duration}</p></div>}
              {selected.stipend && <div><p className="text-ink-muted">Stipend</p><p className="font-medium text-ink">{selected.stipend}</p></div>}
              {selected.num_positions > 1 && <div><p className="text-ink-muted">Positions</p><p className="font-medium text-ink">{selected.num_positions}</p></div>}
              {selected.application_deadline && <div><p className="text-ink-muted">Deadline</p><p className="font-medium text-ink">{selected.application_deadline}</p></div>}
            </div>

            {selected.required_skills && selected.required_skills.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-ink">Required Skills</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selected.required_skills.map((s) => <Badge key={s} variant="brand">{s}</Badge>)}
                </div>
              </div>
            )}

            {hasApplied(selected.id) ? (
              <div className="rounded-xl bg-green-50 p-4 text-center">
                <p className="text-sm font-medium text-success">You have already applied for this opportunity</p>
              </div>
            ) : (
              <>
                <Textarea label="Cover Letter (optional)" rows={4} value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell the employer why you're a great fit..." />
                <Button onClick={handleApply} disabled={applying} className="w-full">
                  {applying ? 'Submitting...' : 'Apply Now'}
                </Button>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
