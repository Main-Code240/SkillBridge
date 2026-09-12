import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Briefcase, TrendingUp, ArrowRight, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, Badge } from '@/components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/StateViews';
import MatchScore from '@/components/ui/MatchScore';
import OpportunityCard from '@/components/ui/OpportunityCard';
import type { SkillProfile, Opportunity, LearningProgram } from '@/types';
import { calculateMatchScore } from '@/utils';

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<SkillProfile[]>([]);
  const [oppRecommendations, setOppRecommendations] = useState<{ opportunity: Opportunity; match: ReturnType<typeof calculateMatchScore> }[]>([]);
  const [learningRecs, setLearningRecs] = useState<LearningProgram[]>([]);
  const [gaps, setGaps] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const [skillsRes, oppsRes, programsRes] = await Promise.all([
          supabase.from('skill_profiles').select('*').eq('user_id', user.id),
          supabase.from('opportunities').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(20),
          supabase.from('learning_programs').select('*'),
        ]);

        const userSkills = (skillsRes.data || []) as SkillProfile[];
        setSkills(userSkills);

        const allOpps = (oppsRes.data || []) as Opportunity[];
        const scored = allOpps
          .map((o) => ({ opportunity: o, match: calculateMatchScore(userSkills, o) }))
          .filter((r) => r.match.score > 0)
          .sort((a, b) => b.match.score - a.match.score)
          .slice(0, 6);
        setOppRecommendations(scored);

        const gapSkills = userSkills.filter((s) => s.score < 50).map((s) => s.skill_name.toLowerCase());
        setGaps(gapSkills);

        const allPrograms = (programsRes.data || []) as LearningProgram[];
        const matching = allPrograms.filter((p) =>
          (p.skills_taught || []).some((s: string) => gapSkills.includes(s.toLowerCase()))
        ).slice(0, 6);
        setLearningRecs(matching.length > 0 ? matching : allPrograms.slice(0, 4));
      } catch {
        setError('Failed to load recommendations.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">Your Recommendations</h2>
        <p className="text-sm text-ink-muted">Based on your skill profile and identified gaps</p>
      </div>

      {skills.length === 0 && (
        <Card className="p-5">
          <EmptyState icon={<Lightbulb className="h-8 w-8 text-brand-primary/40" />} title="Build your skill profile first"
            description="Take assessments or add skills to get personalized recommendations."
            action={<Link to="/dashboard/assessments" className="btn-primary">Take Assessment</Link>} />
        </Card>
      )}

      {/* Skill Gaps Summary */}
      {gaps.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-warning" />
            <h3 className="font-bold text-ink">Identified Skill Gaps</h3>
          </div>
          <p className="mt-1 text-sm text-ink-muted">These skills need improvement to unlock more opportunities:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {gaps.map((g) => <Badge key={g} variant="warning">{g}</Badge>)}
          </div>
        </Card>
      )}

      {/* Opportunity Recommendations */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-ink">
          <Briefcase className="h-5 w-5 text-brand-primary" /> Recommended Opportunities
        </h3>
        {oppRecommendations.length === 0 ? (
          <Card><EmptyState title="No matching opportunities" description="New opportunities will appear here as they're posted." /></Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {oppRecommendations.map(({ opportunity, match }) => (
              <Card key={opportunity.id} className="p-5">
                <div className="mb-3"><MatchScore result={match} /></div>
                <OpportunityCard opportunity={opportunity} onClick={() => window.location.href = '/dashboard/opportunities'} />
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Learning Recommendations */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-ink">
          <BookOpen className="h-5 w-5 text-brand-primary" /> Recommended Learning Programs
        </h3>
        {learningRecs.length === 0 ? (
          <Card><EmptyState title="No learning programs available" /></Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {learningRecs.map((prog) => (
              <Card key={prog.id} className="p-5" hover>
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  {prog.certification_available && <Badge variant="success">Certificate</Badge>}
                </div>
                <h4 className="mt-3 font-bold text-ink">{prog.title}</h4>
                <p className="mt-1 text-sm text-ink-muted line-clamp-2">{prog.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-muted">
                  <span>{prog.provider}</span>
                  <span>· {prog.duration_weeks} weeks</span>
                  <span>· {prog.cost}</span>
                </div>
                {prog.skills_taught && prog.skills_taught.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {prog.skills_taught.slice(0, 3).map((s) => <Badge key={s} variant="brand">{s}</Badge>)}
                  </div>
                )}
                {prog.url && (
                  <a href={prog.url} target="_blank" rel="noopener noreferrer"
                    className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline">
                    Learn More <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
