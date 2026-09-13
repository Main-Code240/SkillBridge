import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { LoadingState, ErrorState } from '@/components/ui/StateViews';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';
import type { AssessmentQuestion } from '@/types';
import { titleCase } from '@/utils';

interface AssessmentResponse {
  success: boolean;
  assessment: {
    id: string;
    title: string;
    description?: string;
    skillId?: string | null;
    skillName?: string;
    assessmentType?: string;
    difficulty?: string;
    timeLimitMinutes?: number;
    passingScore?: number;
    questions: AssessmentQuestion[];
  };
}

interface AssessmentSubmitResponse {
  success: boolean;
  result: {
    percentage: number;
    level: string;
    correct: number;
    total: number;
    passed: boolean;
  };
}

export default function AssessmentTakePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [assessmentSkill, setAssessmentSkill] = useState('');
  const [passingScore, setPassingScore] = useState(50);

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
    passed: boolean;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadAssessment = async () => {
      if (!id) {
        setError('Assessment ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await apiFetch<AssessmentResponse>(
          `/assessments/${id}`
        );

        if (!mounted) return;

        const assessment = response.assessment;

        setAssessmentTitle(assessment.title || 'Assessment');
        setAssessmentSkill(
          assessment.skillName ||
            assessment.skillId ||
            'Skill'
        );
        setPassingScore(
          typeof assessment.passingScore === 'number'
            ? assessment.passingScore
            : 50
        );

        setQuestions(assessment.questions || []);
      } catch (err: any) {
        if (!mounted) return;

        setError(
          err?.message || 'Failed to load assessment.'
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAssessment();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleAnswerChange = (
    questionId: string,
    answer: string
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (!user || !id) {
      toast.error('You must be logged in to submit the assessment.');
      return;
    }

    if (questions.length === 0) {
      toast.error('This assessment has no questions.');
      return;
    }

    const unanswered = questions.some(
      (question) => !answers[question.id]?.trim()
    );

    if (unanswered) {
      toast.error('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      const response =
        await apiFetch<AssessmentSubmitResponse>(
          `/assessments/${id}/attempts`,
          {
            method: 'POST',
            body: JSON.stringify({
              answers,
            }),
          }
        );

      const submittedResult = response.result;

      setResult({
        percentage: submittedResult.percentage,
        level: submittedResult.level,
        correct: submittedResult.correct,
        total: submittedResult.total,
        passed: submittedResult.passed,
      });

      toast.success('Assessment submitted!');
    } catch (err: any) {
      toast.error(
        err?.message || 'Failed to submit assessment.'
      );
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
    const passed =
      typeof result.passed === 'boolean'
        ? result.passed
        : result.percentage >= passingScore;

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
            {assessmentTitle}
          </p>

          {assessmentSkill && (
            <p className="mt-1 text-sm text-ink-muted">
              {assessmentSkill}
            </p>
          )}

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-2xl font-bold text-brand-primary">
                {result.percentage}%
              </p>
              <p className="text-xs text-ink-muted">
                Score
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-2xl font-bold text-ink">
                {result.correct}/{result.total}
              </p>
              <p className="text-xs text-ink-muted">
                Correct
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-lg font-bold text-brand-primary">
                {titleCase(result.level)}
              </p>
              <p className="text-xs text-ink-muted">
                Level
              </p>
            </div>
          </div>

          <div
            className={`mt-5 rounded-xl p-3 text-sm font-medium ${
              passed
                ? 'bg-green-50 text-green-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {passed
              ? 'Congratulations! You passed this assessment.'
              : `You did not reach the passing score of ${passingScore}%.`}
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
              onClick={() =>
                navigate('/dashboard/skills')
              }
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
        <p className="text-center text-ink-muted">
          This assessment has no questions yet.
        </p>

        <div className="mt-4 flex justify-center">
          <Button
            variant="secondary"
            onClick={() =>
              navigate('/dashboard/assessments')
            }
          >
            Back to Assessments
          </Button>
        </div>
      </Card>
    );
  }

  const currentQuestion = questions[current];

  if (!currentQuestion) {
    return (
      <Card className="p-8">
        <p className="text-center text-ink-muted">
          Unable to load the current question.
        </p>
      </Card>
    );
  }

  const questionId = currentQuestion.id;

  const currentAnswer =
    answers[questionId] || '';

  const progress =
    ((current + 1) / questions.length) * 100;

  const isLastQuestion =
    current === questions.length - 1;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <button
        type="button"
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

        {assessmentSkill && (
          <p className="mt-1 text-sm text-ink-muted">
            Skill: {assessmentSkill}
          </p>
        )}

        <p className="mt-1 text-sm text-ink-muted">
          Question {current + 1} of {questions.length}
        </p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-brand-primary transition-all"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="text-base font-semibold text-ink">
            {currentQuestion.question_text}
          </p>

          <span className="shrink-0 rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-ink-muted">
            {currentQuestion.question_type ===
            'short_answer'
              ? 'Short Answer'
              : 'MCQ'}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {currentQuestion.question_type ===
          'short_answer' ? (
            <input
              type="text"
              value={currentAnswer}
              onChange={(event) =>
                handleAnswerChange(
                  questionId,
                  event.target.value
                )
              }
              className="input-field w-full"
              placeholder="Type your answer..."
              autoComplete="off"
            />
          ) : (
            (currentQuestion.options || []).map(
              (option, index) => {
                const selected =
                  currentAnswer === option;

                return (
                  <button
                    type="button"
                    key={`${questionId}-${index}`}
                    onClick={() =>
                      handleAnswerChange(
                        questionId,
                        option
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition-all ${
                      selected
                        ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/10'
                        : 'border-surface-border hover:border-brand-accent/30'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        selected
                          ? 'bg-brand-primary text-white'
                          : 'bg-gray-100 text-ink-muted'
                      }`}
                    >
                      {String.fromCharCode(
                        65 + index
                      )}
                    </span>

                    <span className="text-ink">
                      {option}
                    </span>
                  </button>
                );
              }
            )
          )}
        </div>
      </Card>

      <div className="flex justify-between gap-3">
        <Button
          variant="secondary"
          disabled={current === 0 || submitting}
          onClick={() =>
            setCurrent((previous) => previous - 1)
          }
        >
          Previous
        </Button>

        {!isLastQuestion ? (
          <Button
            disabled={!currentAnswer.trim() || submitting}
            onClick={() =>
              setCurrent((previous) => previous + 1)
            }
          >
            Next
          </Button>
        ) : (
          <Button
            disabled={
              submitting ||
              Object.keys(answers).length <
                questions.length ||
              questions.some(
                (question) =>
                  !answers[question.id]?.trim()
              )
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