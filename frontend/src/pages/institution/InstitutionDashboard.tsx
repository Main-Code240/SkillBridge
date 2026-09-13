import { useEffect, useState } from 'react';
import { Users, Award, TrendingUp, Building2, Brain, Target } from 'lucide-react';
import { Card, StatCard } from '@/components/ui/Card';
import { LoadingState, ErrorState } from '@/components/ui/StateViews';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';

export default function InstitutionDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    students: 0,
    assessed: 0,
    internships: 0,
    placements: 0,
    industries: 0,
    opportunities: 0,
  });

  const [deptData, setDeptData] = useState<
    { name: string; students: number }[]
  >([]);

  const [skillGapData, setSkillGapData] = useState<
    { name: string; value: number }[]
  >([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        setStats({
          students: 0,
          assessed: 0,
          internships: 0,
          placements: 0,
          industries: 0,
          opportunities: 0,
        });

        setDeptData([]);
        setSkillGapData([]);
      } catch {
        setError('Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) return <LoadingState />;

  if (error) {
    return <ErrorState message={error} />;
  }

  const placementRate =
    stats.students > 0
      ? Math.round((stats.placements / stats.students) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-r from-brand-primary to-brand-medium p-6">
        <h2 className="text-xl font-bold text-white">
          Institution Analytics Dashboard
        </h2>
        <p className="mt-1 text-sm text-blue-100">
          Monitor student skills, internships, and placement metrics.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Students"
          value={stats.students}
        />

        <StatCard
          icon={<Brain className="h-5 w-5" />}
          label="Assessed"
          value={stats.assessed}
          color="brand-secondary"
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
          icon={<Building2 className="h-5 w-5" />}
          label="Industries"
          value={stats.industries}
        />

        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Opportunities"
          value={stats.opportunities}
          color="brand-secondary"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-bold text-ink">
            Students by Department
          </h3>

          <div className="mt-4 h-64">
            {deptData.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-ink-muted">
                  Analytics data will appear here once institution data is
                  connected.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} layout="vertical">
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    allowDecimals={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={80}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #E5E7EB',
                    }}
                  />

                  <Bar
                    dataKey="students"
                    fill="#1143A3"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-ink">
            Top Skill Gaps (avg score)
          </h3>

          <div className="mt-4 h-64">
            {skillGapData.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-ink-muted">
                  No skill gap data available yet.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillGapData} layout="vertical">
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={100}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #E5E7EB',
                    }}
                  />

                  <Bar
                    dataKey="value"
                    fill="#D97706"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-bold text-ink">Placement Rate</h3>

        <div className="mt-4 flex items-center justify-center">
          <div className="h-48 w-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="60%"
                outerRadius="100%"
                data={[
                  {
                    value: placementRate,
                    fill: '#1143A3',
                  },
                ]}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  background={{ fill: '#E5E7EB' }}
                />

                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-ink text-2xl font-bold"
                >
                  {placementRate}%
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
}