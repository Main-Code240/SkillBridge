import { useEffect, useState } from 'react';
import { Plus, Trash2, ExternalLink, Github, Linkedin, Award, Briefcase, FolderOpen, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, Badge } from '@/components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/StateViews';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import SkillBadge from '@/components/ui/SkillBadge';
import toast from 'react-hot-toast';
import type { SkillProfile, Project, Certificate, Internship } from '@/types';
import { formatDate, ALL_SKILLS } from '@/utils';
import { Select } from '@/components/ui/Input';

export default function PortfolioPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<SkillProfile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddCert, setShowAddCert] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', project_url: '', repo_url: '', skills_used: [] as string[] });
  const [newCert, setNewCert] = useState({ title: '', issuer: '', issue_date: '', skill_name: '' });

  const fetchData = async () => {
    if (!user) return;
    try {
      const [skillRes, projRes, certRes, internRes] = await Promise.all([
        supabase.from('skill_profiles').select('*').eq('user_id', user.id).order('score', { ascending: false }),
        supabase.from('projects').select('*').eq('user_id', user.id),
        supabase.from('certificates').select('*').eq('user_id', user.id),
        supabase.from('internships').select('*').eq('user_id', user.id).eq('status', 'completed'),
      ]);
      setSkills((skillRes.data || []) as SkillProfile[]);
      setProjects((projRes.data || []) as Project[]);
      setCertificates((certRes.data || []) as Certificate[]);
      setInternships((internRes.data || []) as Internship[]);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const addProject = async () => {
    if (!user || !newProject.title.trim()) return;
    const { error } = await supabase.from('projects').insert({
      user_id: user.id,
      title: newProject.title,
      description: newProject.description,
      project_url: newProject.project_url,
      repo_url: newProject.repo_url,
      skills_used: newProject.skills_used,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Project added');
    setShowAddProject(false);
    setNewProject({ title: '', description: '', project_url: '', repo_url: '', skills_used: [] });
    fetchData();
  };

  const deleteProject = async (id: string) => {
    await supabase.from('projects').delete().eq('id', id);
    toast.success('Project removed');
    fetchData();
  };

  const addCert = async () => {
    if (!user || !newCert.title.trim()) return;
    const { error } = await supabase.from('certificates').insert({
      user_id: user.id,
      title: newCert.title,
      issuer: newCert.issuer,
      issue_date: newCert.issue_date || null,
      skill_name: newCert.skill_name,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Certificate added');
    setShowAddCert(false);
    setNewCert({ title: '', issuer: '', issue_date: '', skill_name: '' });
    fetchData();
  };

  const deleteCert = async (id: string) => {
    await supabase.from('certificates').delete().eq('id', id);
    toast.success('Certificate removed');
    fetchData();
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand-primary to-brand-medium" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex items-end gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-card text-2xl font-bold text-brand-primary">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-ink">{user?.full_name}</h2>
              <p className="text-sm text-ink-muted">{user?.degree || 'Student'} · {user?.institution || ''}</p>
            </div>
            <div className="flex gap-2">
              {user?.linkedin_url && <a href={user.linkedin_url} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-ink-muted hover:bg-gray-100"><Linkedin className="h-5 w-5" /></a>}
              {user?.github_url && <a href={user.github_url} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-ink-muted hover:bg-gray-100"><Github className="h-5 w-5" /></a>}
            </div>
          </div>
          {user?.bio && <p className="mt-4 text-sm text-ink">{user.bio}</p>}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-muted">
            {user?.location && <span>{user.location}</span>}
            {user?.email && <span>{user.email}</span>}
          </div>
        </div>
      </Card>

      {/* Skills */}
      <Card className="p-5">
        <h3 className="font-bold text-ink">Skills</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.length === 0 ? <span className="text-sm text-ink-muted">No skills added yet.</span> :
            skills.map((s) => <SkillBadge key={s.id} name={s.skill_name} level={s.level} score={s.score} verified={s.is_verified} />)}
        </div>
      </Card>

      {/* Projects */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-ink">Projects</h3>
          <Button size="sm" variant="secondary" onClick={() => setShowAddProject(true)}><Plus className="h-4 w-4" /> Add</Button>
        </div>
        {projects.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">No projects yet. Showcase your work!</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            {projects.map((p) => (
              <div key={p.id} className="rounded-xl border border-surface-border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-brand-primary" />
                    <h4 className="font-semibold text-ink">{p.title}</h4>
                  </div>
                  <button onClick={() => deleteProject(p.id)} className="text-ink-muted hover:text-error"><Trash2 className="h-4 w-4" /></button>
                </div>
                {p.description && <p className="mt-2 text-sm text-ink-muted">{p.description}</p>}
                {p.skills_used && p.skills_used.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.skills_used.map((s) => <Badge key={s} variant="brand">{s}</Badge>)}
                  </div>
                )}
                <div className="mt-3 flex gap-3">
                  {p.project_url && <a href={p.project_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-brand-primary hover:underline"><ExternalLink className="h-3 w-3" /> Live</a>}
                  {p.repo_url && <a href={p.repo_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-brand-primary hover:underline"><Github className="h-3 w-3" /> Code</a>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Certificates */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-ink">Certificates</h3>
          <Button size="sm" variant="secondary" onClick={() => setShowAddCert(true)}><Plus className="h-4 w-4" /> Add</Button>
        </div>
        {certificates.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">No certificates yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {certificates.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-surface-border p-3">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-brand-primary" />
                  <div>
                    <p className="text-sm font-medium text-ink">{c.title}</p>
                    <p className="text-xs text-ink-muted">{c.issuer} · {formatDate(c.issue_date)}</p>
                  </div>
                </div>
                <button onClick={() => deleteCert(c.id)} className="text-ink-muted hover:text-error"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Completed Internships */}
      {internships.length > 0 && (
        <Card className="p-5">
          <h3 className="font-bold text-ink">Internship History</h3>
          <div className="mt-3 space-y-2">
            {internships.map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-xl border border-surface-border p-3">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-brand-primary" />
                  <div>
                    <p className="text-sm font-medium text-ink">{i.title}</p>
                    <p className="text-xs text-ink-muted">{i.company_name} · {formatDate(i.start_date)} - {formatDate(i.end_date)}</p>
                  </div>
                </div>
                <Badge variant="success">Completed</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Project Modal */}
      <Modal isOpen={showAddProject} onClose={() => setShowAddProject(false)} title="Add Project">
        <div className="space-y-4">
          <Input label="Title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} placeholder="My awesome project" />
          <Textarea label="Description" rows={3} value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
          <Input label="Live URL (optional)" value={newProject.project_url} onChange={(e) => setNewProject({ ...newProject, project_url: e.target.value })} placeholder="https://..." />
          <Input label="Repository URL (optional)" value={newProject.repo_url} onChange={(e) => setNewProject({ ...newProject, repo_url: e.target.value })} placeholder="https://github.com/..." />
          <Select label="Skills Used" value="" onChange={(e) => {
            if (e.target.value && !newProject.skills_used.includes(e.target.value))
              setNewProject({ ...newProject, skills_used: [...newProject.skills_used, e.target.value] });
          }}>
            <option value="">Select a skill to add</option>
            {ALL_SKILLS.filter((s) => !newProject.skills_used.includes(s)).map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          {newProject.skills_used.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {newProject.skills_used.map((s) => <Badge key={s} variant="brand">{s}</Badge>)}
            </div>
          )}
          <Button onClick={addProject} className="w-full">Add Project</Button>
        </div>
      </Modal>

      {/* Add Certificate Modal */}
      <Modal isOpen={showAddCert} onClose={() => setShowAddCert(false)} title="Add Certificate">
        <div className="space-y-4">
          <Input label="Certificate Title" value={newCert.title} onChange={(e) => setNewCert({ ...newCert, title: e.target.value })} placeholder="e.g. AWS Certified Developer" />
          <Input label="Issuer" value={newCert.issuer} onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })} placeholder="e.g. Amazon Web Services" />
          <Input label="Issue Date" type="date" value={newCert.issue_date} onChange={(e) => setNewCert({ ...newCert, issue_date: e.target.value })} />
          <Input label="Skill (optional)" value={newCert.skill_name} onChange={(e) => setNewCert({ ...newCert, skill_name: e.target.value })} placeholder="e.g. Cloud Computing" />
          <Button onClick={addCert} className="w-full">Add Certificate</Button>
        </div>
      </Modal>
    </div>
  );
}
