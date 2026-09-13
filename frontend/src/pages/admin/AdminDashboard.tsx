import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  Award,
  Briefcase,
  Brain,
  FileText,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Card, StatCard } from "@/components/ui/Card";
import {
  LoadingState,
  ErrorState,
} from "@/components/ui/StateViews";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    users: 0,
    students: 0,
    industries: 0,
    institutions: 0,
    opportunities: 0,
    applications: 0,
    internships: 0,
    placements: 0,
    skills: 0,
    assessments: 0,
  });

  const [roleData, setRoleData] = useState<
    { name: string; value: number }[]
  >([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setStats({
          users: 0,
          students: 0,
          industries: 0,
          institutions: 0,
          opportunities: 0,
          applications: 0,
          internships: 0,
          placements: 0,
          skills: 0,
          assessments: 0,
        });

        setRoleData([]);
      } catch {
        setError("Failed to load admin data.");
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

  const pieColors = [
    "#1143A3",
    "#006FFF",
    "#3E70FF",
    "#5186CD",
    "#1747A6",
  ];

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-r from-brand-primary to-brand-medium p-6">
        <h2 className="text-xl font-bold text-white">
          Admin Dashboard
        </h2>

        <p className="mt-1 text-sm text-blue-100">
          Platform overview and system management.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Users"
          value={stats.users}
        />

        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Students"
          value={stats.students}
          color="brand-secondary"
        />

        <StatCard
          icon={<Building2 className="h-5 w-5" />}
          label="Industries"
          value={stats.industries}
          color="brand-accent"
        />

        <StatCard
          icon={<Building2 className="h-5 w-5" />}
          label="Institutions"
          value={stats.institutions}
        />

        <StatCard
          icon={<Briefcase className="h-5 w-5" />}
          label="Opportunities"
          value={stats.opportunities}
          color="brand-secondary"
        />

        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Applications"
          value={stats.applications}
        />

        <StatCard
          icon={<Award className="h-5 w-5" />}
          label="Internships"
          value={stats.internships}
          color="brand-accent"
        />

        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Placements"
          value={stats.placements}
          color="success"
        />

        <StatCard
          icon={<Brain className="h-5 w-5" />}
          label="Skill Records"
          value={stats.skills}
        />

        <StatCard
          icon={<Brain className="h-5 w-5" />}
          label="Assessments"
          value={stats.assessments}
          color="brand-secondary"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-bold text-ink">
            Users by Role
          </h3>

          <div className="mt-4 h-64">
            {roleData.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-ink-muted">
                  No users yet
                </p>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={roleData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }: any) =>
                      `${name}: ${value}`
                    }
                  >
                    {roleData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={
                          pieColors[
                            index % pieColors.length
                          ]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #E5E7EB",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-ink">
            Platform Activity
          </h3>

          <div className="mt-4 h-64">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={[
                  {
                    name: "Users",
                    count: stats.users,
                  },
                  {
                    name: "Opportunities",
                    count: stats.opportunities,
                  },
                  {
                    name: "Applications",
                    count: stats.applications,
                  },
                  {
                    name: "Internships",
                    count: stats.internships,
                  },
                  {
                    name: "Placements",
                    count: stats.placements,
                  },
                ]}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                  allowDecimals={false}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                  }}
                />

                <Bar
                  dataKey="count"
                  fill="#1143A3"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          to="/dashboard/users"
          className="card p-5 transition-all hover:shadow-elevated"
        >
          <Users className="h-8 w-8 text-brand-primary" />

          <h3 className="mt-3 font-bold text-ink">
            Manage Users
          </h3>

          <p className="mt-1 text-sm text-ink-muted">
            View and manage all platform users
          </p>

          <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary">
            Manage
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>

        <Link
          to="/dashboard/skills"
          className="card p-5 transition-all hover:shadow-elevated"
        >
          <Brain className="h-8 w-8 text-brand-primary" />

          <h3 className="mt-3 font-bold text-ink">
            Skills & Assessments
          </h3>

          <p className="mt-1 text-sm text-ink-muted">
            Manage skill catalog and assessments
          </p>

          <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary">
            Manage
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>

        <Link
          to="/dashboard/opportunities"
          className="card p-5 transition-all hover:shadow-elevated"
        >
          <Briefcase className="h-8 w-8 text-brand-primary" />

          <h3 className="mt-3 font-bold text-ink">
            Opportunities
          </h3>

          <p className="mt-1 text-sm text-ink-muted">
            View all posted opportunities
          </p>

          <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary">
            View
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </div>
  );
}