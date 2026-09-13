import { useEffect, useState } from 'react';
import { Search, Users, UserCheck, UserX } from 'lucide-react';
import { Card, Badge } from '@/components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/StateViews';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import type { Profile } from '@/types';
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
      setLoading(true);
      setError(null);

      setUsers([]);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (user: Profile) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';

    toast.error(
      `User status API is not connected yet. Cannot ${newStatus === 'active' ? 'activate' : 'suspend'} user.`
    );
  };

  if (loading) return <LoadingState />;

  if (error) {
    return <ErrorState message={error} onRetry={fetchUsers} />;
  }

  const filtered = users.filter((u) => {
    const fullName =
      (u as Profile & { full_name?: string; fullName?: string }).fullName ||
      (u as Profile & { full_name?: string }).full_name ||
      '';

    const email = u.email || '';

    const matchesRole =
      roleFilter === 'all' || u.role === roleFilter;

    const matchesSearch =
      !search ||
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());

    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">User Management</h2>
        <p className="text-sm text-ink-muted">
          View and manage all platform users
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Search users..."
          />
        </div>

        <div className="sm:w-48">
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
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
        <Card>
          <EmptyState
            icon={
              <Users className="h-8 w-8 text-brand-primary/40" />
            }
            title="No users found"
            description="Users will appear here once the admin user API is connected."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="border-b border-surface-border bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-ink-muted">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-ink-muted">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-ink-muted">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-ink-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-ink-muted">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-ink-muted">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-surface-border">
                {filtered.map((u) => {
                  const userData = u as Profile & {
                    full_name?: string;
                    fullName?: string;
                    created_at?: string;
                  };

                  const fullName =
                    userData.fullName ||
                    userData.full_name ||
                    'User';

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary text-xs font-bold text-white">
                            {fullName.charAt(0).toUpperCase()}
                          </div>

                          <span className="font-medium text-ink">
                            {fullName}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-ink-muted">
                        {u.email}
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="brand">
                          {capitalize(u.role)}
                        </Badge>
                      </td>

                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            u.status === 'active'
                              ? 'success'
                              : 'error'
                          }
                        >
                          {capitalize(u.status)}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-ink-muted">
                        {formatDate(userData.created_at || '')}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelected(u)}
                          className="text-sm text-brand-primary hover:underline"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Manage User"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary font-bold text-white">
                {(
                  (selected as Profile & {
                    full_name?: string;
                    fullName?: string;
                  }).fullName ||
                  (selected as Profile & {
                    full_name?: string;
                  }).full_name ||
                  'U'
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <p className="font-bold text-ink">
                  {(selected as Profile & {
                    full_name?: string;
                    fullName?: string;
                  }).fullName ||
                    (selected as Profile & {
                      full_name?: string;
                    }).full_name ||
                    'User'}
                </p>

                <p className="text-sm text-ink-muted">
                  {selected.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-ink-muted">Role</p>
                <p className="font-medium text-ink">
                  {capitalize(selected.role)}
                </p>
              </div>

              <div>
                <p className="text-ink-muted">Status</p>

                <Badge
                  variant={
                    selected.status === 'active'
                      ? 'success'
                      : 'error'
                  }
                >
                  {capitalize(selected.status)}
                </Badge>
              </div>

              {(selected as Profile & {
                company_name?: string;
              }).company_name && (
                <div>
                  <p className="text-ink-muted">Company</p>
                  <p className="font-medium text-ink">
                    {
                      (selected as Profile & {
                        company_name?: string;
                      }).company_name
                    }
                  </p>
                </div>
              )}

              {selected.institution && (
                <div>
                  <p className="text-ink-muted">Institution</p>
                  <p className="font-medium text-ink">
                    {selected.institution}
                  </p>
                </div>
              )}

              {selected.phone && (
                <div>
                  <p className="text-ink-muted">Phone</p>
                  <p className="font-medium text-ink">
                    {selected.phone}
                  </p>
                </div>
              )}

              <div>
                <p className="text-ink-muted">Joined</p>
                <p className="font-medium text-ink">
                  {formatDate(
                    (selected as Profile & {
                      created_at?: string;
                    }).created_at || ''
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {selected.status === 'active' ? (
                <Button
                  variant="danger"
                  onClick={() => toggleStatus(selected)}
                  className="flex-1"
                >
                  <UserX className="h-4 w-4" />
                  Suspend User
                </Button>
              ) : (
                <Button
                  onClick={() => toggleStatus(selected)}
                  className="flex-1"
                >
                  <UserCheck className="h-4 w-4" />
                  Activate User
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}