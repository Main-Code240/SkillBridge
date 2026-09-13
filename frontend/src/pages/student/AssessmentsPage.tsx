import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { LoadingState, ErrorState } from '@/components/ui/StateViews';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import type { AssessmentQuestion } from '@/types';
import { getSkillLevel, titleCase } from '@/utils';

export default function AssessmentTakePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [assessmentSkill, setAssessmentSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    percentage: number;
    level: string;
    correct: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    const loadAssessment = async () => {
      setLoading(true);
      setError(null);

      try {
        setQuestions([]);
        setAssessmentTitle('');
        setAssessmentSkill('');
      } catch {
        setError('Failed to load assessment.');
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [id]);

  const handleSubmit = async () => {
    if (!user || !id) {
      toast.error('Authentication required.');
      return;
    }

    if (questions.length === 0) {
      toast.error('Assessment questions are not available.');
      return;
    }

    setSubmitting(true);

    try {
      let correct = 0;

      questions.forEach((q) => {
        if (answers[q.id] === q.correct_answer) {
          correct++;
        }
      });

      const total = questions.length;
      const percentage =
        total > 0 ? Math.round((correct / total) * 100) : 0;

      const level = getSkillLevel(percentage);

      setResult({
        percentage,
        level,
        correct,
        total,
      });

      toast.success('Assessment completed locally.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (result) {
    const passed = result.percentage >= 50;

    return (
      <div className="mx-auto max-w-lg">
        <Card className="p-8 text-center">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
              passed ? 'bg-green-50' : 'bg-amber-50'
            }`}
          >
            <CheckCircle2
              className={`h-10 w-10 ${
                passed ? 'text-success' : 'text-warning'
              }`}
            />
          </div>

          <h2 className="mt-4 text-2xl font-bold text-ink">
            Assessment Complete!
          </h2>

          <p className="mt-2 text-ink-muted">
            {assessmentTitle || 'Assessment'}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-2xl font-bold text-brand-primary">
                {result.percentage}%
              </p>
              <p className="text-xs text-ink-muted">Score</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-2xl font-bold text-ink">
                {result.correct}/{result.total}
              </p>
              <p className="text-xs text-ink-muted">Correct</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-2xl font-bold text-brand-primary">
                {titleCase(result.level)}
              </p>
              <p className="text-xs text-ink-muted">Level</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                navigate('/dashboard/assessments')
              }
              className="flex-1"
            >
              Back to Assessments
            </Button>

            <Button
              onClick={() => navigate('/dashboard/skills')}
              className="flex-1"
            >
              View Skills
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-ink-muted">
            Assessment questions are not connected to the backend yet.
          </p>

          <Button
            variant="secondary"
            onClick={() =>
              navigate('/dashboard/assessments')
            }
            className="mt-4"
          >
            Back to Assessments
          </Button>
        </div>
      </Card>
    );
  }

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <button
        onClick={() =>
          navigate('/dashboard/assessments')
        }
        className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Assessments
      </button>

      <div>
        <h2 className="text-xl font-bold text-ink">
          {assessmentTitle}
        </h2>

        <p className="text-sm text-ink-muted">
          Question {current + 1} of {questions.length}
        </p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-brand-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Card className="p-6">
        <p className="text-base font-semibold text-ink">
          {q.question_text}
        </p>

        <div className="mt-4 space-y-2">
          {q.question_type === 'short_answer' ? (
            <input
              type="text"
              value={answers[q.id] || ''}
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  [q.id]: e.target.value,
                })
              }
              className="input-field"
              placeholder="Type your answer..."
            />
          ) : (
            (q.options || []).map((opt, i) => (
              <button
                key={i}
                onClick={() =>
                  setAnswers({
                    ...answers,
                    [q.id]: opt,
                  })
                }
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition-all ${
                  answers[q.id] === opt
                    ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/10'
                    : 'border-surface-border hover:border-brand-accent/30'
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    answers[q.id] === opt
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-100 text-ink-muted'
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>

                {opt}
              </button>
            ))
          )}
        </div>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="secondary"
          disabled={current === 0}
          onClick={() => setCurrent(current - 1)}
        >
          Previous
        </Button>

        {current < questions.length - 1 ? (
          <Button
            disabled={!answers[q.id]}
            onClick={() => setCurrent(current + 1)}
          >
            Next
          </Button>
        ) : (
          <Button
            disabled={
              submitting ||
              Object.keys(answers).length < questions.length
            }
            onClick={handleSubmit}
          >
            {submitting
              ? 'Submitting...'
              : 'Submit Assessment'}
          </Button>
        )}
      </div>
    </div>
  );
}