import { useEffect, useState } from 'react';
import { Users, Award, TrendingUp, Building2, Brain, Target } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, StatCard } from '@/components/ui/Card';
import { LoadingState, ErrorState } from '@/components/ui/StateViews';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts';

export default function InstitutionDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ students: 0, assessed: 0, internships: 0, placements: 0, industries: 0, opportunities: 0 });
  const [deptData, setDeptData] = useState<{ name: string; students: number }[]>([]);
  const [skillGapData, setSkillGapData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [studentsRes, attemptsRes, internRes, oppRes, industryRes, profilesRes] = await Promise.all([
          supabase.from('profiles').select('id, department, graduation_year', { count: 'exact' }).eq('role', 'student'),
          supabase.from('assessment_attempts').select('id', { count: 'exact', head: true }),
          supabase.from('internships').select('id, status', { count: 'exact' }),
          supabase.from('opportunities').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'industry'),
          supabase.from('skill_profiles').select('skill_name, score'),
        ]);

        const students = studentsRes.data || [];
        const internships = internRes.data || [];
        const placements = internships.filter((i: any) => i.status === 'completed').length;
        const allSkillProfiles = (profilesRes.data || []) as any[];

        setStats({
          students: studentsRes.count || 0,
          assessed: attemptsRes.count || 0,
          internships: internRes.count || 0,
          placements,
          industries: industryRes.count || 0,
          opportunities: oppRes.count || 0,
        });

        // Department distribution
        const deptCounts: Record<string, number> = {};
        students.forEach((s: any) => {
          const dept = s.department || 'Unspecified';
          deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });
        setDeptData(Object.entries(deptCounts).map(([name, students]) => ({ name, students })).slice(0, 6));

        // Skill gaps (skills with avg score < 50)
        const skillAgg: Record<string, { total: number; count: number }> = {};
        allSkillProfiles.forEach((sp: any) => {
          if (!skillAgg[sp.skill_name]) skillAgg[sp.skill_name] = { total: 0, count: 0 };
          skillAgg[sp.skill_name].total += sp.score;
          skillAgg[sp.skill_name].count += 1;
        });
        const gaps = Object.entries(skillAgg)
          .map(([name, { total, count }]) => ({ name, value: Math.round(total / count) }))
          .filter((g) => g.value < 60)
          .sort((a, b) => a.value - b.value)
          .slice(0, 6);
        setSkillGapData(gaps);
      } catch {
        setError('Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const pieColors = ['#1143A3', '#006FFF', '#3E70FF', '#5186CD', '#1747A6', '#02277A'];
  const placementRate = stats.students > 0 ? Math.round((stats.placements / stats.students) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-r from-brand-primary to-brand-medium p-6">
        <h2 className="text-xl font-bold text-white">Institution Analytics Dashboard</h2>
        <p className="mt-1 text-sm text-blue-100">Monitor student skills, internships, and placement metrics.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={<Users className="h-5 w-5" />} label="Students" value={stats.students} />
        <StatCard icon={<Brain className="h-5 w-5" />} label="Assessed" value={stats.assessed} color="brand-secondary" />
        <StatCard icon={<Award className="h-5 w-5" />} label="Internships" value={stats.internships} color="brand-accent" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Placements" value={stats.placements} color="success" />
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Industries" value={stats.industries} />
        <StatCard icon={<Target className="h-5 w-5" />} label="Opportunities" value={stats.opportunities} color="brand-secondary" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-bold text-ink">Students by Department</h3>
          <div className="mt-4 h-64">
            {deptData.length === 0 ? (
              <div className="flex h-full items-center justify-center"><p className="text-sm text-ink-muted">No data</p></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB' }} />
                  <Bar dataKey="students" fill="#1143A3" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-bold text-ink">Top Skill Gaps (avg score)</h3>
          <div className="mt-4 h-64">
            {skillGapData.length === 0 ? (
              <div className="flex h-full items-center justify-center"><p className="text-sm text-ink-muted">No skill gaps detected</p></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillGapData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB' }} />
                  <Bar dataKey="value" fill="#D97706" radius={[0, 6, 6, 0]} />
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
              <RadialBarChart innerRadius="60%" outerRadius="100%" data={[{ value: placementRate, fill: '#1143A3' }]} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#E5E7EB' }} />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-ink text-2xl font-bold">
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
