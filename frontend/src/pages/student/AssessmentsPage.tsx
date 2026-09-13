import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Clock, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, Badge } from '@/components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/StateViews';
import type { Assessment, AssessmentAttempt } from '@/types';
import { titleCase } from '@/utils';

export default function AssessmentsPage() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [assessRes, attemptRes] = await Promise.all([
          supabase.from('assessments').select('*').eq('is_active', true),
          user ? supabase.from('assessment_attempts').select('*').eq('user_id', user.id).order('completed_at', { ascending: false }) : Promise.resolve({ data: [], error: null }),
        ]);
        setAssessments((assessRes.data || []) as Assessment[]);
        setAttempts((attemptRes.data || []) as AssessmentAttempt[]);
      } catch {
        setError('Failed to load assessments.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const getAttempt = (assessmentId: string) => attempts.find((a) => a.assessment_id === assessmentId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">Skill Assessments</h2>
        <p className="text-sm text-ink-muted">Take assessments to build your verified skill profile</p>
      </div>

      {assessments.length === 0 ? (
        <Card><EmptyState icon={<ClipboardCheck className="h-8 w-8 text-brand-primary/40" />} title="No assessments available"
          description="Assessments will appear here once an admin or academician creates them." /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assess) => {
            const attempt = getAttempt(assess.id);
            const passed = attempt && attempt.percentage >= assess.passing_score;
            return (
              <Card key={assess.id} className="p-5" hover>
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  {attempt && (
                    <Badge variant={passed ? 'success' : 'warning'}>
                      {passed ? <CheckCircle2 className="h-3 w-3" /> : null} {attempt.percentage}%
                    </Badge>
                  )}
                </div>
                <h3 className="mt-3 font-bold text-ink">{assess.title}</h3>
                <p className="mt-1 text-sm text-ink-muted line-clamp-2">{assess.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-muted">
                  <span className="inline-flex items-center gap-1"><Award className="h-3.5 w-3.5" /> {titleCase(assess.difficulty)}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {assess.time_limit_minutes} min</span>
                  <span>Pass: {assess.passing_score}%</span>
                </div>
                {attempt ? (
                  <div className="mt-4 rounded-xl bg-gray-50 p-3">
                    <p className="text-xs text-ink-muted">Last attempt: <span className="font-bold text-ink">{attempt.percentage}%</span> · {titleCase(attempt.skill_level)}</p>
                  </div>
                ) : null}
                <Link to={`/dashboard/assessment/${assess.id}`} className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-brand-primary/5 py-2.5 text-sm font-semibold text-brand-primary hover:bg-brand-primary/10">
                  {attempt ? 'Retake' : 'Start Assessment'} <ArrowRight className="h-4 w-4" />
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
