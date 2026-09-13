import { useEffect, useState } from 'react';
import { Plus, Handshake, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Badge } from '@/components/ui/Card';
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from '@/components/ui/StateViews';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import {
  Input,
  Textarea,
  Select,
} from '@/components/ui/Input';
import StatusBadge from '@/components/ui/StatusBadge';
import toast from 'react-hot-toast';
import type { Collaboration } from '@/types';
import {
  COLLABORATION_TYPES,
  formatDate,
  titleCase,
} from '@/utils';

const emptyForm = {
  title: '',
  description: '',
  collaboration_type: 'mentorship',
  institution: '',
  industry: '',
  status: 'open',
  start_date: '',
  end_date: '',
};

export default function CollaborationPage() {
  const { user } = useAuth();

  const [collabs, setCollabs] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchCollabs = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      setCollabs([]);
    } catch {
      setError('Failed to load collaborations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollabs();
  }, [user]);

  const handleSave = async () => {
    if (!user || !form.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    toast.error(
      'Collaboration API is not connected yet. The form is ready for backend integration.'
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collaboration?')) return;

    toast.error(
      'Collaboration delete API is not connected yet.'
    );
  };

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={fetchCollabs}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">
            Collaborations
          </h2>

          <p className="text-sm text-ink-muted">
            Create and manage academia-industry collaborations
          </p>
        </div>

        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          New Collaboration
        </Button>
      </div>

      {collabs.length === 0 ? (
        <Card>
          <EmptyState
            icon={
              <Handshake className="h-8 w-8 text-brand-primary/40" />
            }
            title="No collaborations yet"
            description="Create mentorship programs, workshops, guest lectures, and more."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {collabs.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="brand">
                    {titleCase(c.collaboration_type)}
                  </Badge>

                  <StatusBadge status={c.status} />
                </div>

                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-ink-muted hover:text-error"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <h3 className="mt-3 font-bold text-ink">
                {c.title}
              </h3>

              {c.description && (
                <p className="mt-1 line-clamp-2 text-sm text-ink-muted">
                  {c.description}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-muted">
                {c.institution && (
                  <span>
                    Institution: {c.institution}
                  </span>
                )}

                {c.industry && (
                  <span>
                    Industry: {c.industry}
                  </span>
                )}

                {c.start_date && (
                  <span>
                    Start: {formatDate(c.start_date)}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="New Collaboration"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            placeholder="e.g. Industry-Academia Mentorship Program"
          />

          <Select
            label="Type"
            value={form.collaboration_type}
            onChange={(e) =>
              setForm({
                ...form,
                collaboration_type: e.target.value,
              })
            }
          >
            {COLLABORATION_TYPES.map((t) => (
              <option
                key={t.value}
                value={t.value}
              >
                {t.label}
              </option>
            ))}
          </Select>

          <Textarea
            label="Description"
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Institution (optional)"
              value={form.institution}
              onChange={(e) =>
                setForm({
                  ...form,
                  institution: e.target.value,
                })
              }
            />

            <Input
              label="Industry (optional)"
              value={form.industry}
              onChange={(e) =>
                setForm({
                  ...form,
                  industry: e.target.value,
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Start Date"
              type="date"
              value={form.start_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  start_date: e.target.value,
                })
              }
            />

            <Input
              label="End Date"
              type="date"
              value={form.end_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  end_date: e.target.value,
                })
              }
            />
          </div>

          <Button
            onClick={handleSave}
            className="w-full"
          >
            Create Collaboration
          </Button>
        </div>
      </Modal>
    </div>
  );
}