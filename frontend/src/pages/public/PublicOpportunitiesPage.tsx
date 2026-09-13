import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Briefcase, GraduationCap } from 'lucide-react';
import PublicNav from '@/components/layout/PublicNav';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/StateViews';
import { Select } from '@/components/ui/Input';
import OpportunityCard from '@/components/ui/OpportunityCard';
import type { Opportunity } from '@/types';
import { OPPORTUNITY_TYPES } from '@/utils';

export default function PublicOpportunitiesPage() {
  const [opportunities] = useState<Opportunity[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      const title = o.title || '';
      const companyName = o.company_name || '';
      const description = o.description || '';

      const matchesSearch =
        !search ||
        title.toLowerCase().includes(search.toLowerCase()) ||
        companyName.toLowerCase().includes(search.toLowerCase()) ||
        description.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        !typeFilter || o.opportunity_type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [opportunities, search, typeFilter]);

  return (
    <div className="min-h-screen bg-surface-bg">
      <PublicNav />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink">
            Browse Opportunities
          </h1>

          <p className="mt-2 text-ink-muted">
            Discover internships, jobs, and projects from leading industries
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
              placeholder="Search by title, company, or keyword..."
            />
          </div>

          <div className="sm:w-48">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>

              {OPPORTUNITY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={
                <Briefcase className="h-8 w-8 text-brand-primary/40" />
              }
              title="No opportunities found"
              description="There are no public opportunities available yet."
              action={
                <Link to="/register" className="btn-primary">
                  Register to Apply
                </Link>
              }
            />
          </Card>
        ) : (
          <>
            <p className="mb-4 text-sm text-ink-muted">
              {filtered.length} opportunities found
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  onClick={() => {
                    window.location.href = '/register';
                  }}
                />
              ))}
            </div>
          </>
        )}

        {!loading && !error && filtered.length > 0 && (
          <Card className="mt-8 p-6 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-brand-primary" />

            <h3 className="mt-3 text-lg font-bold text-ink">
              Want to apply?
            </h3>

            <p className="mt-1 text-sm text-ink-muted">
              Register as a student to apply and track your applications.
            </p>

            <Link to="/register" className="btn-primary mt-4">
              Get Started
            </Link>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}