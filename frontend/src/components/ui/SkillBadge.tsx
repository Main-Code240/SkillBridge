import type { SkillLevel } from '@/types';

interface SkillBadgeProps {
  name: string;
  level?: SkillLevel;
  score?: number;
  verified?: boolean;
}

const levelColors: Record<SkillLevel, string> = {
  beginner: 'bg-gray-100 text-gray-600',
  intermediate: 'bg-blue-50 text-brand-secondary',
  advanced: 'bg-brand-primary/10 text-brand-primary',
  expert: 'bg-green-50 text-success',
};

export default function SkillBadge({ name, level, score, verified }: SkillBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-white px-3 py-1.5">
      <span className="text-sm font-medium text-ink">{name}</span>
      {level && (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${levelColors[level]}`}>
          {level}
        </span>
      )}
      {score !== undefined && (
        <span className="text-xs font-bold text-ink-muted">{score}%</span>
      )}
      {verified && (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-50">
          <svg className="h-3 w-3 text-success" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </span>
      )}
    </div>
  );
}
