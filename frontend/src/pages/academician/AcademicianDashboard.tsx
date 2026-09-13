import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Award,
  Handshake,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, StatCard } from "@/components/ui/Card";
import {
  LoadingState,
  ErrorState,
} from "@/components/ui/StateViews";

export default function AcademicianDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [studentCount, setStudentCount] = useState(0);
  const [assessedCount, setAssessedCount] = useState(0);
  const [internshipCount, setInternshipCount] = useState(0);
  const [collabCount, setCollabCount] = useState(0);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setStudentCount(0);
        setAssessedCount(0);
        setInternshipCount(0);
        setCollabCount(0);
      } catch {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const firstName =
    (user as any)?.fullName?.split(" ")[0] ||
    (user as any)?.full_name?.split(" ")[0] ||
    "Professor";

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-r from-brand-primary to-brand-medium p-6">
        <h2 className="text-xl font-bold text-white">
          Welcome, {firstName}!
        </h2>

        <p className="mt-1 text-sm text-blue-100">
          Mentor students, track progress, and collaborate with industry.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Students"
          value={studentCount}
        />

        <StatCard
          icon={<Award className="h-5 w-5" />}
          label="Assessments Taken"
          value={assessedCount}
          color="brand-secondary"
        />

        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Active Internships"
          value={internshipCount}
          color="brand-accent"
        />

        <StatCard
          icon={<Handshake className="h-5 w-5" />}
          label="Collaborations"
          value={collabCount}
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-bold text-ink">
            Student Mentorship
          </h3>

          <p className="mt-1 text-sm text-ink-muted">
            View student skill profiles, identify gaps, and provide guidance.
          </p>

          <Link
            to="/dashboard/students"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline"
          >
            View Students
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-ink">
            Industry Collaboration
          </h3>

          <p className="mt-1 text-sm text-ink-muted">
            Create workshops, guest lectures, research collaborations, and FDPs.
          </p>

          <Link
            to="/dashboard/collaboration"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline"
          >
            Manage Collaborations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>
    </div>
  );
}