import { useEffect, useState } from 'react';
import { Brain, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, Badge } from '@/components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/StateViews';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import SkillBadge from '@/components/ui/SkillBadge';
import toast from 'react-hot-toast';
import type { SkillProfile, SkillLevel } from '@/types';
import { getSkillLevel, ALL_SKILLS, titleCase } from '@/utils';

const levelColors: Record<SkillLevel, string> = {
  beginner: 'bg-gray-100 text-gray-600',
  intermediate: 'bg-blue-50 text-brand-secondary',
  advanced: 'bg-brand-primary/10 text-brand-primary',
  expert: 'bg-green-50 text-success',
};

export default function SkillProfilePage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<SkillProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Technical', score: 50, source: 'manual' });

  const fetchSkills = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('skill_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('score', { ascending: false });
    if (error) { setError(error.message); }
    else { setSkills((data || []) as SkillProfile[]); }
    setLoading(false);
  };

  useEffect(() => { fetchSkills(); }, [user]);

  const handleAdd = async () => {
    if (!user) return;
    if (!newSkill.name.trim()) { toast.error('Please enter a skill name'); return; }
    const level = getSkillLevel(newSkill.score);
    const { error } = await supabase.from('skill_profiles').insert({
      user_id: user.id,
      skill_name: newSkill.name,
      category: newSkill.category,
      score: newSkill.score,
      level,
      source: newSkill.source,
      is_verified: false,
    });
    if (error) { toast.error(error.message); }
    else {
      toast.success('Skill added');
      setShowAdd(false);
      setNewSkill({ name: '', category: 'Technical', score: 50, source: 'manual' });
      fetchSkills();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('skill_profiles').delete().eq('id', id);
    if (error) { toast.error(error.message); }
    else { toast.success('Skill removed'); fetchSkills(); }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchSkills} />;

  const categories = [...new Set(skills.map((s) => s.category))].sort();
  const gaps = skills.filter((s) => s.score < 50);
  const strengths = skills.filter((s) => s.score >= 70);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">My Skill Profile</h2>
          <p className="text-sm text-ink-muted">{skills.length} skills tracked · {strengths.length} strengths · {gaps.length} gaps</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> Add Skill</Button>
      </div>

      {skills.length === 0 ? (
        <Card><EmptyState icon={<Brain className="h-8 w-8 text-brand-primary/40" />} title="No skills yet"
          description="Add skills manually or take an assessment to build your skill profile."
          action={<Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> Add Your First Skill</Button>} /></Card>
      ) : (
        <>
          {/* Strengths and Gaps */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-bold text-success">Strengths</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {strengths.length === 0 ? <span className="text-sm text-ink-muted">No strengths yet. Take assessments to identify your strong skills.</span> :
                  strengths.map((s) => <SkillBadge key={s.id} name={s.skill_name} level={s.level} score={s.score} verified={s.is_verified} />)}
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="font-bold text-error">Skill Gaps</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {gaps.length === 0 ? <span className="text-sm text-ink-muted">No significant gaps detected. Great job!</span> :
                  gaps.map((s) => <SkillBadge key={s.id} name={s.skill_name} level={s.level} score={s.score} />)}
              </div>
            </Card>
          </div>

          {/* All Skills by Category */}
          {categories.map((cat) => (
            <Card key={cat} className="p-5">
              <h3 className="mb-4 font-bold text-ink">{cat}</h3>
              <div className="space-y-3">
                {skills.filter((s) => s.category === cat).map((skill) => (
                  <div key={skill.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-ink">{skill.skill_name}</span>
                          {skill.is_verified && <Badge variant="success">Verified</Badge>}
                          <span className="text-xs text-ink-muted">· {titleCase(skill.source)}</span>
                        </div>
                        <span className="text-sm font-bold text-brand-primary">{skill.score}%</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                        <div className={`h-full rounded-full ${skill.score >= 70 ? 'bg-success' : skill.score >= 50 ? 'bg-brand-primary' : 'bg-error'}`}
                          style={{ width: `${skill.score}%` }} />
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${levelColors[skill.level]}`}>{titleCase(skill.level)}</span>
                    <button onClick={() => handleDelete(skill.id)} className="rounded-lg p-1.5 text-ink-muted hover:bg-red-50 hover:text-error">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Skill">
        <div className="space-y-4">
          <Select label="Skill" value={newSkill.name} onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}>
            <option value="">Select a skill</option>
            {ALL_SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select label="Category" value={newSkill.category} onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}>
            <option value="Technical">Technical</option>
            <option value="Soft Skills">Soft Skills</option>
            <option value="Domain">Domain Knowledge</option>
            <option value="Aptitude">Aptitude</option>
          </Select>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Proficiency Score: {newSkill.score}%</label>
            <input type="range" min="0" max="100" value={newSkill.score}
              onChange={(e) => setNewSkill({ ...newSkill, score: parseInt(e.target.value) })}
              className="w-full accent-brand-primary" />
            <div className="mt-1 flex justify-between text-xs text-ink-muted">
              <span>Beginner</span><span>Intermediate</span><span>Advanced</span><span>Expert</span>
            </div>
          </div>
          <Select label="Source" value={newSkill.source} onChange={(e) => setNewSkill({ ...newSkill, source: e.target.value })}>
            <option value="manual">Manual Entry</option>
            <option value="certification">Certification</option>
            <option value="project">Project</option>
            <option value="internship">Internship</option>
          </Select>
          <Button onClick={handleAdd} className="w-full">Add Skill</Button>
        </div>
      </Modal>
    </div>
  );
}
