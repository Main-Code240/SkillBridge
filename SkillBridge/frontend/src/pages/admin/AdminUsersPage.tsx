import { useEffect, useState } from 'react';
import { Search, Users, Shield, UserCheck, UserX } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, Badge } from '@/components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/StateViews';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import type { Profile, UserRole } from '@/types';
import { capitalize, formatDate } from '@/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selected, setSelected] = useState<Profile | null>(null);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers((data || []) as Profile[]);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleStatus = async (user: Profile) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', user.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'}`);
    setSelected(null);
    fetchUsers();
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchUsers} />;

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch = !search || u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">User Management</h2>
        <p className="text-sm text-ink-muted">View and manage all platform users</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search users..." />
        </div>
        <div className="sm:w-48">
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="industry">Industry</option>
            <option value="academician">Academicians</option>
            <option value="institution">Institutions</option>
            <option value="admin">Admins</option>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={<Users className="h-8 w-8 text-brand-primary/40" />} title="No users found" /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="border-b border-surface-border bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-ink-muted">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink-muted">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink-muted">Role</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink-muted">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink-muted">Joined</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary text-xs font-bold text-white">
                          {u.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="font-medium text-ink">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{u.email}</td>
                    <td className="px-4 py-3"><Badge variant="brand">{capitalize(u.role)}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={u.status === 'active' ? 'success' : 'error'}>{capitalize(u.status)}</Badge></td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(u)} className="text-brand-primary hover:underline text-sm">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Manage User">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white font-bold">
                {selected.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-bold text-ink">{selected.full_name}</p>
                <p className="text-sm text-ink-muted">{selected.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-ink-muted">Role</p><p className="font-medium text-ink">{capitalize(selected.role)}</p></div>
              <div><p className="text-ink-muted">Status</p><Badge variant={selected.status === 'active' ? 'success' : 'error'}>{capitalize(selected.status)}</Badge></div>
              {selected.company_name && <div><p className="text-ink-muted">Company</p><p className="font-medium text-ink">{selected.company_name}</p></div>}
              {selected.institution && <div><p className="text-ink-muted">Institution</p><p className="font-medium text-ink">{selected.institution}</p></div>}
              {selected.phone && <div><p className="text-ink-muted">Phone</p><p className="font-medium text-ink">{selected.phone}</p></div>}
              <div><p className="text-ink-muted">Joined</p><p className="font-medium text-ink">{formatDate(selected.created_at)}</p></div>
            </div>
            <div className="flex gap-3">
              {selected.status === 'active' ? (
                <Button variant="danger" onClick={() => toggleStatus(selected)} className="flex-1">
                  <UserX className="h-4 w-4" /> Suspend User
                </Button>
              ) : (
                <Button onClick={() => toggleStatus(selected)} className="flex-1">
                  <UserCheck className="h-4 w-4" /> Activate User
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
