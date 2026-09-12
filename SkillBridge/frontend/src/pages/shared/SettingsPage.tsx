import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Badge } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { capitalize } from '@/utils';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
    avatar_url: user?.avatar_url || '',
    linkedin_url: user?.linkedin_url || '',
    github_url: user?.github_url || '',
    portfolio_url: user?.portfolio_url || '',
    institution: user?.institution || '',
    degree: user?.degree || '',
    department: user?.department || '',
    graduation_year: user?.graduation_year || '',
    company_name: user?.company_name || '',
    industry_type: user?.industry_type || '',
    website_url: user?.website_url || '',
    institution_name: user?.institution_name || '',
    designation: user?.designation || '',
    specialization: user?.specialization || '',
  });

  const handleSave = async () => {
    setSaving(true);
    const updates: any = { ...form, is_profile_complete: true };
    if (form.graduation_year) updates.graduation_year = parseInt(form.graduation_year as any);
    const { error } = await updateProfile(updates);
    setSaving(false);
    if (error) { toast.error(error); } else { toast.success('Profile updated'); }
  };

  if (!user) return null;
  const isStudent = user.role === 'student';
  const isIndustry = user.role === 'industry';
  const isAcademician = user.role === 'academician';
  const isInstitution = user.role === 'institution';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">Settings</h2>
        <p className="text-sm text-ink-muted">Manage your profile and account preferences</p>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary text-2xl font-bold text-white">
            {user.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="font-bold text-ink">{user.full_name}</h3>
            <p className="text-sm text-ink-muted">{user.email}</p>
            <Badge variant="brand">{capitalize(user.role)}</Badge>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold text-ink">Basic Information</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Input label="Avatar URL" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} />
        </div>
        <div className="mt-4">
          <Textarea label="Bio" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="LinkedIn URL" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
          <Input label="GitHub URL" value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} />
          <Input label="Portfolio URL" value={form.portfolio_url} onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })} />
        </div>
      </Card>

      {isStudent && (
        <Card className="p-5">
          <h3 className="font-bold text-ink">Academic Information</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Institution" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="e.g. IIT Delhi" />
            <Input label="Degree" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} placeholder="e.g. B.Tech" />
            <Input label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Computer Science" />
            <Input label="Graduation Year" type="number" value={form.graduation_year} onChange={(e) => setForm({ ...form, graduation_year: e.target.value as any })} placeholder="e.g. 2026" />
          </div>
        </Card>
      )}

      {isIndustry && (
        <Card className="p-5">
          <h3 className="font-bold text-ink">Company Information</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Company Name" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
            <Input label="Industry Type" value={form.industry_type} onChange={(e) => setForm({ ...form, industry_type: e.target.value })} placeholder="e.g. Technology" />
            <Input label="Website" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} />
          </div>
        </Card>
      )}

      {isAcademician && (
        <Card className="p-5">
          <h3 className="font-bold text-ink">Academic Information</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Institution" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
            <Input label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Professor" />
            <Input label="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Machine Learning" />
          </div>
        </Card>
      )}

      {isInstitution && (
        <Card className="p-5">
          <h3 className="font-bold text-ink">Institution Information</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Institution Name" value={form.institution_name} onChange={(e) => setForm({ ...form, institution_name: e.target.value })} />
            <Input label="Website" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} />
          </div>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
      </div>
    </div>
  );
}
