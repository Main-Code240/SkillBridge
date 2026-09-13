import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  Badge,
} from "@/components/ui/Card";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/ui/StateViews";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import {
  Textarea,
  Select,
} from "@/components/ui/Input";
import OpportunityCard from "@/components/ui/OpportunityCard";
import MatchScore from "@/components/ui/MatchScore";
import toast from "react-hot-toast";
import type {
  Opportunity,
  SkillProfile,
  Application,
} from "@/types";
import {
  calculateMatchScore,
  OPPORTUNITY_TYPES,
  titleCase,
} from "@/utils";
import { api } from "@/lib/api";

export default function StudentOpportunitiesPage() {
  const { user } = useAuth();

  const [opportunities, setOpportunities] =
    useState<Opportunity[]>([]);

  const [skills, setSkills] =
    useState<SkillProfile[]>([]);

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("");

  const [selected, setSelected] =
    useState<Opportunity | null>(null);

  const [coverLetter, setCoverLetter] =
    useState("");

  const [applying, setApplying] =
    useState(false);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [
        opportunityResponse,
        skillResponse,
        applicationResponse,
      ] = await Promise.all([
        api.get<{
          opportunities: Opportunity[];
        }>("/opportunities"),

        api.get<{
          skills: SkillProfile[];
        }>("/skill-profiles"),

        api.get<{
          applications: Application[];
        }>("/applications"),
      ]);

      setOpportunities(
        opportunityResponse.opportunities || []
      );

      setSkills(skillResponse.skills || []);

      setApplications(
        applicationResponse.applications || []
      );
    } catch (err: any) {
      setError(
        err?.message ||
          "Failed to load opportunities."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return opportunities.filter((opportunity) => {
      const title =
        opportunity.title?.toLowerCase() || "";

      const company =
        opportunity.company_name?.toLowerCase() ||
        (opportunity as any).companyName
          ?.toLowerCase() ||
        "";

      const description =
        opportunity.description?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        title.includes(query) ||
        company.includes(query) ||
        description.includes(query);

      const opportunityType =
        opportunity.opportunity_type ||
        (opportunity as any).opportunityType ||
        "";

      const matchesType =
        !typeFilter ||
        opportunityType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [
    opportunities,
    search,
    typeFilter,
  ]);

  const hasApplied = (opportunityId: string) =>
    applications.some((application) => {
      const applicationOpportunityId =
        application.opportunity_id ||
        (application as any).opportunityId ||
        (application.opportunity as any)?.id ||
        (application.opportunity as any)?._id;

      return (
        String(applicationOpportunityId) ===
        String(opportunityId)
      );
    });

  const handleApply = async () => {
    if (!selected) return;

    if (hasApplied(selected.id)) {
      toast.error(
        "You have already applied for this opportunity"
      );
      return;
    }

    setApplying(true);

    try {
      await api.post<{
        application: Application;
      }>("/applications", {
        opportunityId: selected.id,
        coverLetter: coverLetter.trim(),
      });

      toast.success(
        "Application submitted!"
      );

      setSelected(null);
      setCoverLetter("");

      await fetchData();
    } catch (err: any) {
      toast.error(
        err?.message ||
          "Failed to submit application"
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={fetchData}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">
          Browse Opportunities
        </h2>

        <p className="text-sm text-ink-muted">
          Find internships, jobs, and projects matched
          to your skills
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="input-field pl-10"
            placeholder="Search opportunities..."
          />
        </div>

        <div className="sm:w-48">
          <Select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value)
            }
          >
            <option value="">
              All Types
            </option>

            {OPPORTUNITY_TYPES.map((type) => (
              <option
                key={type.value}
                value={type.value}
              >
                {type.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={
              <Search className="h-8 w-8 text-brand-primary/40" />
            }
            title="No opportunities found"
            description="Try adjusting your search or filters."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((opportunity) => {
            const match =
              calculateMatchScore(
                skills,
                opportunity
              );

            return (
              <div
                key={opportunity.id}
                className="space-y-2"
              >
                <OpportunityCard
                  opportunity={opportunity}
                  showMatch
                  matchScore={match.score}
                  onClick={() =>
                    setSelected(opportunity)
                  }
                />

                {hasApplied(opportunity.id) && (
                  <Badge variant="success">
                    Applied
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => {
          setSelected(null);
          setCoverLetter("");
        }}
        title={selected?.title || ""}
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-muted">
                  {selected.company_name ||
                    (selected as any).companyName}
                </p>

                <Badge variant="brand">
                  {titleCase(
                    selected.opportunity_type ||
                      (selected as any)
                        .opportunityType ||
                      ""
                  )}
                </Badge>
              </div>

              {(() => {
                const match =
                  calculateMatchScore(
                    skills,
                    selected
                  );

                return (
                  <MatchScore
                    result={match}
                  />
                );
              })()}
            </div>

            {selected.description && (
              <p className="text-sm text-ink">
                {selected.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {selected.location && (
                <div>
                  <p className="text-ink-muted">
                    Location
                  </p>
                  <p className="font-medium text-ink">
                    {selected.location}
                  </p>
                </div>
              )}

              {selected.work_mode && (
                <div>
                  <p className="text-ink-muted">
                    Work Mode
                  </p>
                  <p className="font-medium text-ink">
                    {titleCase(
                      selected.work_mode
                    )}
                  </p>
                </div>
              )}

              {selected.duration && (
                <div>
                  <p className="text-ink-muted">
                    Duration
                  </p>
                  <p className="font-medium text-ink">
                    {selected.duration}
                  </p>
                </div>
              )}

              {selected.stipend && (
                <div>
                  <p className="text-ink-muted">
                    Stipend
                  </p>
                  <p className="font-medium text-ink">
                    {selected.stipend}
                  </p>
                </div>
              )}

              {selected.num_positions > 1 && (
                <div>
                  <p className="text-ink-muted">
                    Positions
                  </p>
                  <p className="font-medium text-ink">
                    {selected.num_positions}
                  </p>
                </div>
              )}

              {selected.application_deadline && (
                <div>
                  <p className="text-ink-muted">
                    Deadline
                  </p>
                  <p className="font-medium text-ink">
                    {new Date(
                      selected.application_deadline
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {selected.required_skills &&
              selected.required_skills.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Required Skills
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selected.required_skills.map(
                      (skill) => (
                        <Badge
                          key={skill}
                          variant="brand"
                        >
                          {skill}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}

            {hasApplied(selected.id) ? (
              <div className="rounded-xl bg-green-50 p-4 text-center">
                <p className="text-sm font-medium text-success">
                  You have already applied for this
                  opportunity
                </p>
              </div>
            ) : (
              <>
                <Textarea
                  label="Cover Letter (optional)"
                  rows={4}
                  value={coverLetter}
                  onChange={(e) =>
                    setCoverLetter(
                      e.target.value
                    )
                  }
                  placeholder="Tell the employer why you're a great fit..."
                />

                <Button
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full"
                >
                  {applying
                    ? "Submitting..."
                    : "Apply Now"}
                </Button>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}