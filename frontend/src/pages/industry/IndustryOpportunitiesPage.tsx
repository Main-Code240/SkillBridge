import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, Badge } from '@/components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/StateViews';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import OpportunityCard from '@/components/ui/OpportunityCard';
import StatusBadge from '@/components/ui/StatusBadge';
import toast from 'react-hot-toast';
import type { Opportunity } from '@/types';
import { OPPORTUNITY_TYPES, ALL_SKILLS, titleCase } from '@/utils';

const emptyForm = {
  title: '', description: '', opportunity_type: 'internship', required_skills: [] as string[],
  preferred_skills: [] as string[], eligibility: '', education: '', experience: '',
  location: '', work_mode: 'onsite', duration: '', stipend: '', salary: '',
  application_deadline: '', num_positions: 1, start_date: '', end_date: '',
  contact_email: '', contact_phone: '', status: 'open',
};

export default function IndustryOpportunitiesPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchOpps = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('opportunities').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) { setError(error.message); } else { setOpportunities((data || []) as Opportunity[]); }
    setLoading(false);
  };

  useEffect(() => { fetchOpps(); }, [user]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, contact_email: user?.email || '' });
    setShowForm(true);
  };

  const openEdit = (opp: Opportunity) => {
    setEditing(opp);
    setForm({
      title: opp.title, description: opp.description, opportunity_type: opp.opportunity_type,
      required_skills: opp.required_skills || [], preferred_skills: opp.preferred_skills || [],
      eligibility: opp.eligibility, education: opp.education, experience: opp.experience,
      location: opp.location, work_mode: opp.work_mode, duration: opp.duration,
      stipend: opp.stipend, salary: opp.salary,
      application_deadline: opp.application_deadline || '', num_positions: opp.num_positions,
      start_date: opp.start_date || '', end_date: opp.end_date || '',
      contact_email: opp.contact_email, contact_phone: opp.contact_phone, status: opp.status,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!user || !form.title.trim()) { toast.error('Please enter a title'); return; }
    const payload = {
      ...form,
      user_id: user.id,
      company_name: user.company_name || user.full_name,
      application_deadline: form.application_deadline || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };
    if (editing) {
      const { error } = await supabase.from('opportunities').update(payload).eq('id', editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success('Opportunity updated');
    } else {
      const { error } = await supabase.from('opportunities').insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success('Opportunity posted');
    }
    setShowForm(false);
    fetchOpps();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this opportunity? This cannot be undone.')) return;
    const { error } = await supabase.from('opportunities').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Opportunity deleted');
    fetchOpps();
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchOpps} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">My Opportunities</h2>
          <p className="text-sm text-ink-muted">Create and manage your posted opportunities</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Post Opportunity</Button>
      </div>

      {opportunities.length === 0 ? (
        <Card><EmptyState icon={<Briefcase className="h-8 w-8 text-brand-primary/40" />} title="No opportunities posted yet"
          description="Post your first internship, job, or project to start receiving applications."
          action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Post Your First Opportunity</Button>} /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opp) => (
            <div key={opp.id} className="space-y-2">
              <OpportunityCard opportunity={opp} />
              <div className="flex items-center justify-between px-1">
                <StatusBadge status={opp.status} />
                <div className="flex gap-1">
                  <button onClick={() => openEdit(opp)} className="rounded-lg p-2 text-ink-muted hover:bg-brand-primary/5 hover:text-brand-primary">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(opp.id)} className="rounded-lg p-2 text-ink-muted hover:bg-red-50 hover:text-error">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Opportunity' : 'Post New Opportunity'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Frontend Developer Intern" />
            <Select label="Type" value={form.opportunity_type} onChange={(e) => setForm({ ...form, opportunity_type: e.target.value })}>
              {OPPORTUNITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </div>
          <Textarea label="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Bangalore" />
            <Select label="Work Mode" value={form.work_mode} onChange={(e) => setForm({ ...form, work_mode: e.target.value })}>
              <option value="onsite">Onsite</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label="Duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 3 months" />
            <Input label="Stipend" value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} placeholder="e.g. ₹15,000/mo" />
            <Input label="Positions" type="number" value={form.num_positions} onChange={(e) => setForm({ ...form, num_positions: parseInt(e.target.value) || 1 })} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Application Deadline" type="date" value={form.application_deadline} onChange={(e) => setForm({ ...form, application_deadline: e.target.value })} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="open">Open</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Required Skills</label>
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-surface-border p-3">
              {form.required_skills.map((s) => (
                <button key={s} onClick={() => setForm({ ...form, required_skills: form.required_skills.filter((x) => x !== s) })}
                  className="badge bg-brand-primary/10 text-brand-primary hover:bg-red-50 hover:text-error">
                  {s} ×
                </button>
              ))}
              <Select value="" onChange={(e) => { if (e.target.value && !form.required_skills.includes(e.target.value)) setForm({ ...form, required_skills: [...form.required_skills, e.target.value] }); }}
                className="border-0 p-0 text-sm flex-1 min-w-[120px]">
                <option value="">+ Add skill</option>
                {ALL_SKILLS.filter((s) => !form.required_skills.includes(s)).map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Preferred Skills</label>
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-surface-border p-3">
              {form.preferred_skills.map((s) => (
                <button key={s} onClick={() => setForm({ ...form, preferred_skills: form.preferred_skills.filter((x) => x !== s) })}
                  className="badge bg-blue-50 text-brand-secondary hover:bg-red-50 hover:text-error">
                  {s} ×
                </button>
              ))}
              <Select value="" onChange={(e) => { if (e.target.value && !form.preferred_skills.includes(e.target.value)) setForm({ ...form, preferred_skills: [...form.preferred_skills, e.target.value] }); }}
                className="border-0 p-0 text-sm flex-1 min-w-[120px]">
                <option value="">+ Add skill</option>
                {ALL_SKILLS.filter((s) => !form.preferred_skills.includes(s)).map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Eligibility" value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} placeholder="e.g. Final year students" />
            <Input label="Education" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} placeholder="e.g. B.Tech" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Contact Email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
            <Input label="Contact Phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
          </div>
          <Button onClick={handleSave} className="w-full">{editing ? 'Update' : 'Post'} Opportunity</Button>
        </div>
      </Modal>
    </div>
  );
}
