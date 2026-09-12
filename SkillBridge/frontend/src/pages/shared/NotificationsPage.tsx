import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, Badge } from '@/components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/StateViews';
import Button from '@/components/ui/Button';
import type { Notification } from '@/types';
import { timeAgo, titleCase } from '@/utils';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifs = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) { setError(error.message); } else { setNotifications((data || []) as Notification[]); }
    setLoading(false);
  };

  useEffect(() => { fetchNotifs(); }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success('All marked as read');
  };

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const deleteNotif = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success('Notification deleted');
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchNotifs} />;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Notifications</h2>
          <p className="text-sm text-ink-muted">{unreadCount} unread · {notifications.length} total</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={markAllRead}><CheckCheck className="h-4 w-4" /> Mark all read</Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card><EmptyState icon={<Bell className="h-8 w-8 text-brand-primary/40" />} title="No notifications" description="You'll be notified about applications, opportunities, and updates here." /></Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={`p-4 ${!n.is_read ? 'border-brand-primary/20 bg-brand-primary/5' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1" onClick={() => !n.is_read && markRead(n.id)} role="button">
                  <div className="flex items-center gap-2">
                    <Badge variant={n.type === 'success' ? 'success' : n.type === 'error' ? 'error' : n.type === 'warning' ? 'warning' : 'info'}>
                      {titleCase(n.type)}
                    </Badge>
                    {!n.is_read && <span className="h-2 w-2 rounded-full bg-brand-primary" />}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-ink">{n.title}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">{n.message}</p>
                  <p className="mt-1 text-xs text-ink-muted/70">{timeAgo(n.created_at)}</p>
                </div>
                <button onClick={() => deleteNotif(n.id)} className="rounded-lg p-1.5 text-ink-muted hover:bg-red-50 hover:text-error">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
