import { useEffect, useState } from 'react';
import { Award, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from '@/components/ui/StateViews';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import {
  Input,
  Textarea,
} from '@/components/ui/Input';
import toast from 'react-hot-toast';
import type { Internship } from '@/types';
import { formatDate } from '@/utils';

export default function IndustryInternshipsPage() {
  const { user } = useAuth();

  const [internships, setInternships] =
    useState<Internship[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  const [selected, setSelected] =
    useState<Internship | null>(null);

  const [feedback, setFeedback] = useState({
    mentor_name: '',
    rating: 5,
    strengths: '',
    improvements: '',
    comments: '',
  });

  const [submitting, setSubmitting] =
    useState(false);

  const fetchInterns = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      setInternships([]);
    } catch (err: any) {
      setError(
        err?.message ||
          'Failed to load internships.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, [user]);

  const submitFeedback = async () => {
    if (!selected) return;

    setSubmitting(true);

    try {
      toast.error(
        'Mentor feedback API is not connected yet.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={fetchInterns}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">
          Internship Management
        </h2>

        <p className="text-sm text-ink-muted">
          Track internships and provide mentor feedback
        </p>
      </div>

      {internships.length === 0 ? (
        <Card>
          <EmptyState
            icon={
              <Award className="h-8 w-8 text-brand-primary/40" />
            }
            title="No active internships"
            description="Internships will appear here when you select candidates from applications."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {internships.map((intern) => (
            <Card
              key={intern.id}
              className="p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-ink">
                      {intern.title}
                    </h3>

                    <StatusBadge
                      status={intern.status}
                    />
                  </div>

                  <p className="text-sm text-ink-muted">
                    {intern.company_name}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-muted">
                    {intern.start_date && (
                      <span>
                        Start:{' '}
                        {formatDate(
                          intern.start_date
                        )}
                      </span>
                    )}

                    {intern.end_date && (
                      <span>
                        End:{' '}
                        {formatDate(
                          intern.end_date
                        )}
                      </span>
                    )}

                    {intern.mentor_name && (
                      <span>
                        Mentor:{' '}
                        {intern.mentor_name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-brand-primary">
                      {intern.progress}%
                    </p>

                    <p className="text-xs text-ink-muted">
                      Progress
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelected(intern);

                      setFeedback({
                        ...feedback,
                        mentor_name:
                          intern.mentor_name ||
                          (user as typeof user & {
                            full_name?: string;
                          })?.full_name ||
                          '',
                      });
                    }}
                  >
                    <Star className="h-4 w-4" />
                    Give Feedback
                  </Button>
                </div>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-brand-primary"
                  style={{
                    width: `${intern.progress}%`,
                  }}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Mentor Feedback"
      >
        {selected && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-sm font-semibold text-ink">
                {selected.title}
              </p>

              <p className="text-xs text-ink-muted">
                {selected.company_name}
              </p>
            </div>

            <Input
              label="Mentor Name"
              value={feedback.mentor_name}
              onChange={(e) =>
                setFeedback({
                  ...feedback,
                  mentor_name:
                    e.target.value,
                })
              }
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Rating: {feedback.rating}/5
              </label>

              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(
                  (n) => (
                    <button
                      key={n}
                      onClick={() =>
                        setFeedback({
                          ...feedback,
                          rating: n,
                        })
                      }
                    >
                      <Star
                        className={`h-7 w-7 ${
                          n <= feedback.rating
                            ? 'fill-warning text-warning'
                            : 'text-gray-200'
                        }`}
                      />
                    </button>
                  )
                )}
              </div>
            </div>

            <Textarea
              label="Strengths"
              rows={2}
              value={feedback.strengths}
              onChange={(e) =>
                setFeedback({
                  ...feedback,
                  strengths:
                    e.target.value,
                })
              }
              placeholder="What did the intern do well?"
            />

            <Textarea
              label="Areas for Improvement"
              rows={2}
              value={feedback.improvements}
              onChange={(e) =>
                setFeedback({
                  ...feedback,
                  improvements:
                    e.target.value,
                })
              }
              placeholder="What can be improved?"
            />

            <Textarea
              label="Overall Comments"
              rows={3}
              value={feedback.comments}
              onChange={(e) =>
                setFeedback({
                  ...feedback,
                  comments:
                    e.target.value,
                })
              }
              placeholder="Additional feedback..."
            />

            <Button
              onClick={submitFeedback}
              disabled={submitting}
              className="w-full"
            >
              {submitting
                ? 'Submitting...'
                : 'Submit Feedback'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}