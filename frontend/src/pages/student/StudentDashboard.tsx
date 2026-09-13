import { useEffect, useState } from "react";
import {
  Brain,
  Target,
  Briefcase,
  FileText,
  Award,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, StatCard, Badge } from "@/components/ui/Card";
import {
  EmptyState,
  LoadingState,
  ErrorState,
} from "@/components/ui/StateViews";
import type {
  SkillProfile,
  Application,
  Internship,
  Certificate,
  Opportunity,
} from "@/types";
import OpportunityCard from "@/components/ui/OpportunityCard";
import { api } from "@/lib/api";
import { calculateMatchScore } from "@/utils";

export default function StudentDashboard() {
  const { user } = useAuth();

  const [skills, setSkills] = useState<SkillProfile[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [recommendedOpps, setRecommendedOpps] = useState<
    (Opportunity & { matchScore: number })[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [
        skillsResponse,
        applicationsResponse,
        internshipsResponse,
        certificatesResponse,
        opportunitiesResponse,
      ] = await Promise.all([
        api.get<{ skills: SkillProfile[] }>("/skill-profiles"),
        api.get<{ applications: Application[] }>("/applications"),
        api.get<{ internships: Internship[] }>("/internships"),
        api.get<{ certificates: Certificate[] }>("/certificates"),
        api.get<{ opportunities: Opportunity[] }>("/opportunities"),
      ]);

      const loadedSkills = skillsResponse.skills || [];
      const loadedApplications =
        applicationsResponse.applications || [];
      const loadedInternships =
        internshipsResponse.internships || [];
      const loadedCertificates =
        certificatesResponse.certificates || [];
      const loadedOpportunities =
        opportunitiesResponse.opportunities || [];

      setSkills(loadedSkills);
      setApplications(loadedApplications);
      setInternships(loadedInternships);
      setCertificates(loadedCertificates);

      const recommended = loadedOpportunities
        .map((opportunity) => {
          const match = calculateMatchScore(
            loadedSkills,
            opportunity
          );

          return {
            ...opportunity,
            matchScore: match.score,
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3);

      setRecommendedOpps(recommended);
    } catch (err: any) {
      setError(
        err?.message || "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  if (!user) return null;

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={fetchDashboard}
      />
    );
  }

  const avgScore =
    skills.length > 0
      ? Math.round(
          skills.reduce(
            (total, skill) => total + Number(skill.score || 0),
            0
          ) / skills.length
        )
      : 0;

  const skillGaps = skills.filter(
    (skill) => Number(skill.score || 0) < 50
  );

  const activeApps = applications.filter(
    (application) =>
      ![
        "selected",
        "rejected",
        "withdrawn",
      ].includes(application.status)
  );

  const activeInternships = internships.filter(
    (internship) =>
      !["completed", "cancelled"].includes(
        internship.status
      )
  );

  const userName =
    (user as any).full_name ||
    (user as any).fullName ||
    "Student";

  const profileComplete =
    (user as any).is_profile_complete ??
    (user as any).isProfileComplete ??
    false;

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-r from-brand-primary to-brand-medium p-6">
        <h2 className="text-xl font-bold text-white">
          Welcome back, {userName.split(" ")[0]}!
        </h2>

        <p className="mt-1 text-sm text-blue-100">
          {profileComplete
            ? "Your profile is complete. Keep building your skills!"
            : "Complete your profile to get better recommendations."}
        </p>

        {!profileComplete && (
          <Link
            to="/dashboard/settings"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
          >
            Complete Profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Brain className="h-5 w-5" />}
          label="Avg Skill Score"
          value={`${avgScore}%`}
          color="brand-primary"
        />

        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Skill Gaps"
          value={skillGaps.length}
          color="error"
        />

        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Active Applications"
          value={activeApps.length}
          color="brand-secondary"
        />

        <StatCard
          icon={<Award className="h-5 w-5" />}
          label="Certificates"
          value={certificates.length}
          color="success"
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink">
            Recommended for You
          </h3>

          <Link
            to="/dashboard/opportunities"
            className="text-sm font-medium text-brand-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {recommendedOpps.length === 0 ? (
          <Card>
            <EmptyState
              icon={
                <Briefcase className="h-8 w-8 text-brand-primary/40" />
              }
              title="No opportunities yet"
              description="New opportunities will appear here once industries post them."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendedOpps.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                showMatch
                matchScore={opportunity.matchScore}
                onClick={() => {
                  window.location.href =
                    "/dashboard/opportunities";
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-ink">
              Recent Applications
            </h3>

            <Link
              to="/dashboard/applications"
              className="text-sm text-brand-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {applications.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Apply to opportunities to track them here."
            />
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 4).map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between rounded-xl border border-surface-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {application.opportunity?.title ||
                        "Opportunity"}
                    </p>

                    <p className="text-xs text-ink-muted">
                      {application.opportunity?.company_name ||
                        (application.opportunity as any)
                          ?.companyName ||
                        ""}
                    </p>
                  </div>

                  <Badge
                    variant={
                      application.status === "selected"
                        ? "success"
                        : application.status === "rejected"
                          ? "error"
                          : "info"
                    }
                  >
                    {application.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-ink">
              Active Internships
            </h3>

            <Link
              to="/dashboard/internships"
              className="text-sm text-brand-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {activeInternships.length === 0 ? (
            <EmptyState
              title="No active internships"
              description="Your internships will appear here once you're selected."
            />
          ) : (
            <div className="space-y-3">
              {activeInternships.map((internship) => {
                const company =
                  internship.company_name ||
                  (internship as any).companyName ||
                  "";

                return (
                  <div
                    key={internship.id}
                    className="rounded-xl border border-surface-border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-ink">
                        {internship.title}
                      </p>

                      <Badge variant="info">
                        {internship.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-ink-muted">
                      {company}
                    </p>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-brand-primary"
                        style={{
                          width: `${internship.progress}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-xs text-ink-muted">
                      {internship.progress}% complete
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}