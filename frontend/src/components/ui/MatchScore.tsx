import { Check, X } from 'lucide-react';
import type { MatchResult } from '@/types';

interface MatchScoreProps {
  result: MatchResult;
  size?: 'sm' | 'md' | 'lg';
}

export default function MatchScore({ result, size = 'md' }: MatchScoreProps) {
  const { score, matchedSkills, missingSkills, label } = result;

  const getColor = () => {
    if (score >= 85) return { ring: 'text-success', bg: 'bg-success', text: 'text-success' };
    if (score >= 70) return { ring: 'text-brand-primary', bg: 'bg-brand-primary', text: 'text-brand-primary' };
    if (score >= 50) return { ring: 'text-warning', bg: 'bg-warning', text: 'text-warning' };
    return { ring: 'text-error', bg: 'bg-error', text: 'text-error' };
  };

  const color = getColor();
  const sizes = {
    sm: { circle: 'h-14 w-14', text: 'text-base', label: 'text-xs' },
    md: { circle: 'h-20 w-20', text: 'text-2xl', label: 'text-sm' },
    lg: { circle: 'h-28 w-28', text: 'text-3xl', label: 'text-base' },
  };
  const s = sizes[size];

  return (
    <div className="w-full">
      <div className="flex items-center gap-4">
        <div className={`relative flex ${s.circle} items-center justify-center rounded-full ${color.bg}/10`}>
          <svg className={`absolute inset-0 ${s.circle} -rotate-90`} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-200" />
            <circle
              cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="6"
              className={color.ring}
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - score / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <span className={`font-bold ${color.text} ${s.text}`}>{score}%</span>
        </div>
        <div>
          <p className={`font-semibold ${color.text} ${s.label}`}>{label}</p>
          <p className="text-xs text-ink-muted mt-0.5">
            {matchedSkills.length} matched · {missingSkills.length} gaps
          </p>
        </div>
      </div>
      {(size === 'md' || size === 'lg') && (
        <div className="mt-4 space-y-2">
          {matchedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {matchedSkills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2 py-0.5 text-xs font-medium text-success">
                  <Check className="h-3 w-3" /> {skill}
                </span>
              ))}
            </div>
          )}
          {missingSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-0.5 text-xs font-medium text-error">
                  <X className="h-3 w-3" /> {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
