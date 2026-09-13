import { useEffect, useState } from 'react';
import {
  Lightbulb,
  Briefcase,
  TrendingUp,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Badge } from '@/components/ui/Card';
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from '@/components/ui/StateViews';
import MatchScore from '@/components/ui/MatchScore';
import OpportunityCard from '@/components/ui/OpportunityCard';
import type {
  SkillProfile,
  Opportunity,
  LearningProgram,
} from '@/types';
import { calculateMatchScore } from '@/utils';

export default function RecommendationsPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [skills, setSkills] = useState<SkillProfile[]>([]);
  const [oppRecommendations, setOppRecommendations] =
    useState<
      {
        opportunity: Opportunity;
        match: ReturnType<typeof calculateMatchScore>;
      }[]
    >([]);

  const [learningRecs, setLearningRecs] = useState<
    LearningProgram[]
  >([]);

  const [gaps, setGaps] = useState<string[]>([]);

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      setError(null);

      try {
        setSkills([]);
        setOppRecommendations([]);
        setLearningRecs([]);
        setGaps([]);
      } catch {
        setError('Failed to load recommendations.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadRecommendations();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">
          Your Recommendations
        </h2>

        <p className="text-sm text-ink-muted">
          Based on your skill profile and identified gaps
        </p>
      </div>

      {skills.length === 0 && (
        <Card className="p-5">
          <EmptyState
            icon={
              <Lightbulb className="h-8 w-8 text-brand-primary/40" />
            }
            title="Build your skill profile first"
            description="Take assessments or add skills to get personalized recommendations."
            action={
              <Link
                to="/dashboard/assessments"
                className="btn-primary"
              >
                Take Assessment
              </Link>
            }
          />
        </Card>
      )}

      {gaps.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-warning" />

            <h3 className="font-bold text-ink">
              Identified Skill Gaps
            </h3>
          </div>

          <p className="mt-1 text-sm text-ink-muted">
            These skills need improvement to unlock more
            opportunities:
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {gaps.map((g) => (
              <Badge key={g} variant="warning">
                {g}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-ink">
          <Briefcase className="h-5 w-5 text-brand-primary" />
          Recommended Opportunities
        </h3>

        {oppRecommendations.length === 0 ? (
          <Card>
            <EmptyState
              title="No matching opportunities"
              description="New opportunities will appear here as they're posted."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {oppRecommendations.map(
              ({ opportunity, match }) => (
                <Card
                  key={opportunity.id}
                  className="p-5"
                >
                  <div className="mb-3">
                    <MatchScore result={match} />
                  </div>

                  <OpportunityCard
                    opportunity={opportunity}
                    onClick={() =>
                      (window.location.href =
                        '/dashboard/opportunities')
                    }
                  />
                </Card>
              )
            )}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-ink">
          <BookOpen className="h-5 w-5 text-brand-primary" />
          Recommended Learning Programs
        </h3>

        {learningRecs.length === 0 ? (
          <Card>
            <EmptyState
              title="No learning programs available"
              description="Learning recommendations will appear here once the backend is connected."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {learningRecs.map((prog) => (
              <Card
                key={prog.id}
                className="p-5"
                hover
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>

                  {prog.certification_available && (
                    <Badge variant="success">
                      Certificate
                    </Badge>
                  )}
                </div>

                <h4 className="mt-3 font-bold text-ink">
                  {prog.title}
                </h4>

                <p className="mt-1 line-clamp-2 text-sm text-ink-muted">
                  {prog.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-muted">
                  <span>{prog.provider}</span>
                  <span>
                    · {prog.duration_weeks} weeks
                  </span>
                  <span>· {prog.cost}</span>
                </div>

                {prog.skills_taught &&
                  prog.skills_taught.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {prog.skills_taught
                        .slice(0, 3)
                        .map((s) => (
                          <Badge
                            key={s}
                            variant="brand"
                          >
                            {s}
                          </Badge>
                        ))}
                    </div>
                  )}

                {prog.url && (
                  <a
                    href={prog.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline"
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4" />
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