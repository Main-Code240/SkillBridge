import { useEffect, useState } from 'react';
import { Award, Plus, CheckCircle2, Clock, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, Badge } from '@/components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/StateViews';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import type { Internship, InternshipProgress, MentorFeedback } from '@/types';
import { formatDate, titleCase } from '@/utils';

export default function StudentInternshipsPage() {
  const { user } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, InternshipProgress[]>>({});
  const [feedbackMap, setFeedbackMap] = useState<Record<string, MentorFeedback[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Internship | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [addingTask, setAddingTask] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    try {
      const { data: internData, error: internErr } = await supabase
        .from('internships').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (internErr) throw internErr;
      const internList = (internData || []) as Internship[];
      setInternships(internList);

      if (internList.length > 0) {
        const internIds = internList.map((i) => i.id);
        const [progRes, fbRes] = await Promise.all([
          supabase.from('internship_progress').select('*').in('internship_id', internIds),
          supabase.from('mentor_feedback').select('*').in('internship_id', internIds),
        ]);
        const progRecord: Record<string, InternshipProgress[]> = {};
        (progRes.data || []).forEach((p: any) => {
          if (!progRecord[p.internship_id]) progRecord[p.internship_id] = [];
          progRecord[p.internship_id].push(p);
        });
        setProgressMap(progRecord);
        const fbRecord: Record<string, MentorFeedback[]> = {};
        (fbRes.data || []).forEach((f: any) => {
          if (!fbRecord[f.internship_id]) fbRecord[f.internship_id] = [];
          fbRecord[f.internship_id].push(f);
        });
        setFeedbackMap(fbRecord);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load internships.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const updateTaskStatus = async (taskId: string, status: 'pending' | 'in_progress' | 'completed') => {
    const { error } = await supabase.from('internship_progress').update({
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    }).eq('id', taskId);
    if (error) { toast.error(error.message); return; }
    toast.success('Task updated');
    fetchData();
  };

  const addTask = async () => {
    if (!selected || !newTask.title.trim()) return;
    setAddingTask(true);
    const { error } = await supabase.from('internship_progress').insert({
      internship_id: selected.id,
      title: newTask.title,
      description: newTask.description,
      status: 'pending',
    });
    if (error) { toast.error(error.message); }
    else {
      toast.success('Task added');
      setNewTask({ title: '', description: '' });
      fetchData();
    }
    setAddingTask(false);
  };

  const updateProgress = async (internship: Internship) => {
    const tasks = progressMap[internship.id] || [];
    if (tasks.length === 0) return;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const progress = Math.round((completed / tasks.length) * 100);
    let status = internship.status;
    if (progress === 100) status = 'completed';
    else if (progress > 0) status = 'in_progress';
    await supabase.from('internships').update({ progress, status }).eq('id', internship.id);
    fetchData();
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">My Internships</h2>
        <p className="text-sm text-ink-muted">Track your internship progress, tasks, and mentor feedback</p>
      </div>

      {internships.length === 0 ? (
        <Card><EmptyState icon={<Award className="h-8 w-8 text-brand-primary/40" />} title="No internships yet"
          description="When you're selected for an opportunity, your internship will appear here." /></Card>
      ) : (
        <div className="space-y-4">
          {internships.map((intern) => {
            const tasks = progressMap[intern.id] || [];
            const feedbacks = feedbackMap[intern.id] || [];
            return (
              <Card key={intern.id} className="p-5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-ink">{intern.title}</h3>
                        <StatusBadge status={intern.status} />
                      </div>
                      <p className="text-sm text-ink-muted">{intern.company_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-brand-primary">{intern.progress}%</p>
                      <p className="text-xs text-ink-muted">Complete</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                    {intern.start_date && <div><p className="text-ink-muted">Start</p><p className="font-medium text-ink">{formatDate(intern.start_date)}</p></div>}
                    {intern.end_date && <div><p className="text-ink-muted">End</p><p className="font-medium text-ink">{formatDate(intern.end_date)}</p></div>}
                    {intern.mentor_name && <div><p className="text-ink-muted">Mentor</p><p className="font-medium text-ink">{intern.mentor_name}</p></div>}
                    {intern.mentor_email && <div><p className="text-ink-muted">Mentor Email</p><p className="font-medium text-ink text-xs">{intern.mentor_email}</p></div>}
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-brand-primary transition-all" style={{ width: `${intern.progress}%` }} />
                  </div>

                  {/* Goals */}
                  {intern.goals && intern.goals.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-ink">Goals</p>
                      <ul className="mt-1 space-y-1">
                        {intern.goals.map((g, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-ink-muted">
                            <CheckCircle2 className="h-4 w-4 text-brand-primary/40" /> {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tasks */}
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink">Tasks ({tasks.length})</p>
                      <Button size="sm" variant="secondary" onClick={() => setSelected(intern)}><Plus className="h-3.5 w-3.5" /> Add Task</Button>
                    </div>
                    {tasks.length === 0 ? (
                      <p className="mt-2 text-sm text-ink-muted">No tasks yet. Add tasks to track your progress.</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {tasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-3 rounded-xl border border-surface-border p-3">
                            <button onClick={() => {
                              const next = task.status === 'pending' ? 'in_progress' : task.status === 'in_progress' ? 'completed' : 'pending';
                              updateTaskStatus(task.id, next);
                            }} className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                              task.status === 'completed' ? 'border-success bg-success text-white' :
                              task.status === 'in_progress' ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-300'
                            }`}>
                              {task.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                            </button>
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-ink-muted line-through' : 'text-ink'}`}>{task.title}</p>
                              {task.description && <p className="text-xs text-ink-muted">{task.description}</p>}
                            </div>
                            <Badge variant={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'info' : 'default'}>
                              {titleCase(task.status)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mentor Feedback */}
                  {feedbacks.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-ink">Mentor Feedback</p>
                      <div className="mt-2 space-y-2">
                        {feedbacks.map((fb) => (
                          <div key={fb.id} className="rounded-xl bg-brand-primary/5 p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-ink">{fb.mentor_name}</p>
                              <div className="flex gap-0.5">
                                {[1,2,3,4,5].map((n) => (
                                  <Star key={n} className={`h-3.5 w-3.5 ${n <= fb.rating ? 'text-warning fill-warning' : 'text-gray-200'}`} />
                                ))}
                              </div>
                            </div>
                            {fb.strengths && <p className="mt-1 text-xs text-ink"><strong>Strengths:</strong> {fb.strengths}</p>}
                            {fb.improvements && <p className="mt-0.5 text-xs text-ink"><strong>Areas to improve:</strong> {fb.improvements}</p>}
                            {fb.comments && <p className="mt-0.5 text-xs text-ink-muted">{fb.comments}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button variant="secondary" size="sm" onClick={() => updateProgress(intern)}>Refresh Progress</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Add Task">
        <div className="space-y-4">
          <Input label="Task Title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="e.g. Complete project wireframes" />
          <Textarea label="Description (optional)" rows={3} value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
          <Button onClick={addTask} disabled={addingTask || !newTask.title.trim()} className="w-full">
            {addingTask ? 'Adding...' : 'Add Task'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
