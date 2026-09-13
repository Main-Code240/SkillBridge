import { MapPin, Clock, Briefcase, Users } from 'lucide-react';
import type { Opportunity } from '@/types';
import { formatDate, titleCase } from '@/utils';
import StatusBadge from './StatusBadge';
import SkillBadge from './SkillBadge';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onClick?: () => void;
  showMatch?: boolean;
  matchScore?: number;
}

export default function OpportunityCard({ opportunity, onClick, showMatch, matchScore }: OpportunityCardProps) {
  return (
    <div
      onClick={onClick}
      className={`card p-5 ${onClick ? 'cursor-pointer hover:shadow-elevated hover:border-brand-accent/20 transition-all' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-lg bg-brand-primary/10 px-2 py-0.5 text-xs font-semibold text-brand-primary">
              {titleCase(opportunity.opportunity_type)}
            </span>
            <StatusBadge status={opportunity.status} />
          </div>
          <h3 className="mt-2 text-base font-bold text-ink">{opportunity.title}</h3>
          <p className="text-sm text-ink-muted">{opportunity.company_name}</p>
        </div>
        {showMatch && matchScore !== undefined && (
          <div className="flex flex-col items-center">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${
              matchScore >= 75 ? 'bg-green-50 text-success' : matchScore >= 50 ? 'bg-amber-50 text-warning' : 'bg-red-50 text-error'
            }`}>
              {matchScore}%
            </div>
            <span className="mt-1 text-xs text-ink-muted">Match</span>
          </div>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-ink-muted">{opportunity.description}</p>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink-muted">
        {opportunity.location && (
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {opportunity.location}</span>
        )}
        {opportunity.work_mode && (
          <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {titleCase(opportunity.work_mode)}</span>
        )}
        {opportunity.duration && (
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {opportunity.duration}</span>
        )}
        {opportunity.num_positions > 1 && (
          <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {opportunity.num_positions} positions</span>
        )}
      </div>

      {opportunity.required_skills && opportunity.required_skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {opportunity.required_skills.slice(0, 4).map((skill) => (
            <SkillBadge key={skill} name={skill} />
          ))}
          {opportunity.required_skills.length > 4 && (
            <span className="text-xs text-ink-muted">+{opportunity.required_skills.length - 4} more</span>
          )}
        </div>
      )}

      {opportunity.application_deadline && (
        <p className="mt-3 text-xs text-ink-muted">
          Deadline: <span className="font-medium text-ink">{formatDate(opportunity.application_deadline)}</span>
        </p>
      )}
    </div>
  );
}
