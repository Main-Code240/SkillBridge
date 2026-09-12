import { useEffect, useState } from 'react';
import { Search, Users, Brain, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, Badge } from '@/components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/StateViews';
import Modal from '@/components/ui/Modal';
import SkillBadge from '@/components/ui/SkillBadge';
import type { Profile, SkillProfile } from '@/types';
import { getSkillLevel } from '@/utils';

export default function AcademicianStudentsPage() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<SkillProfile[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setStudents((data || []) as Profile[]);
      } catch {
        setError('Failed to load students.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const viewStudent = async (student: Profile) => {
    setSelected(student);
    const { data } = await supabase.from('skill_profiles').select('*').eq('user_id', student.id).order('score', { ascending: false });
    setSkills((data || []) as SkillProfile[]);
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const filtered = students.filter((s) =>
    !search || s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.institution || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">Students</h2>
        <p className="text-sm text-ink-muted">View student profiles and skill assessments</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10" placeholder="Search by name, email, or institution..." />
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={<Users className="h-8 w-8 text-brand-primary/40" />} title="No students found" /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Card key={s.id} className="p-5" hover>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white font-bold">
                  {s.full_name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-ink">{s.full_name}</h3>
                  <p className="text-xs text-ink-muted">{s.email}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm text-ink-muted">
                {s.institution && <p>{s.institution}</p>}
                {s.degree && <p>{s.degree}{s.department ? ` · ${s.department}` : ''}</p>}
                {s.graduation_year && <p>Graduating: {s.graduation_year}</p>}
              </div>
              <button onClick={() => viewStudent(s)} className="mt-3 w-full rounded-xl bg-brand-primary/5 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/10">
                View Skills
              </button>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.full_name || 'Student'} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {selected.institution && <div><p className="text-ink-muted">Institution</p><p className="font-medium text-ink">{selected.institution}</p></div>}
              {selected.degree && <div><p className="text-ink-muted">Degree</p><p className="font-medium text-ink">{selected.degree}</p></div>}
              {selected.department && <div><p className="text-ink-muted">Department</p><p className="font-medium text-ink">{selected.department}</p></div>}
              {selected.graduation_year && <div><p className="text-ink-muted">Graduation</p><p className="font-medium text-ink">{selected.graduation_year}</p></div>}
            </div>
            <div>
              <h4 className="font-semibold text-ink">Skill Profile</h4>
              {skills.length === 0 ? (
                <p className="mt-2 text-sm text-ink-muted">No skills assessed yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {skills.map((s) => (
                    <div key={s.id}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-ink">{s.skill_name}</span>
                        <span className="font-bold text-brand-primary">{s.score}%</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                        <div className={`h-full rounded-full ${s.score >= 70 ? 'bg-success' : s.score >= 50 ? 'bg-brand-primary' : 'bg-error'}`} style={{ width: `${s.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
