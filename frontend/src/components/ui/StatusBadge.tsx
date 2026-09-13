import { titleCase } from '@/utils';

interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-50 text-brand-secondary',
  under_review: 'bg-amber-50 text-warning',
  shortlisted: 'bg-brand-primary/10 text-brand-primary',
  interview: 'bg-purple-50 text-purple-600',
  selected: 'bg-green-50 text-success',
  rejected: 'bg-red-50 text-error',
  withdrawn: 'bg-gray-100 text-ink-muted',
  started: 'bg-blue-50 text-brand-secondary',
  in_progress: 'bg-amber-50 text-warning',
  mentor_feedback: 'bg-brand-primary/10 text-brand-primary',
  final_evaluation: 'bg-purple-50 text-purple-600',
  completed: 'bg-green-50 text-success',
  cancelled: 'bg-red-50 text-error',
  open: 'bg-green-50 text-success',
  closed: 'bg-gray-100 text-ink-muted',
  draft: 'bg-gray-100 text-ink-muted',
  active: 'bg-blue-50 text-brand-secondary',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const color = statusColors[status] || 'bg-gray-100 text-ink-muted';
  return (
    <span className={`badge ${color}`}>
      {titleCase(status)}
    </span>
  );
}
