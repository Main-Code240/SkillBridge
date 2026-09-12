import { type ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap, Menu, X, Bell, LogOut, ChevronDown, User, Settings,
  LayoutDashboard, Brain, ClipboardCheck, Lightbulb, Briefcase, FileText,
  Award, FolderOpen, ShieldCheck, Users, Handshake, BarChart3,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types';
import { timeAgo, capitalize } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const roleNavs: Record<string, NavItem[]> = {
  student: [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { to: '/dashboard/skills', label: 'My Skills', icon: <Brain className="h-5 w-5" /> },
    { to: '/dashboard/assessments', label: 'Assessments', icon: <ClipboardCheck className="h-5 w-5" /> },
    { to: '/dashboard/recommendations', label: 'Recommendations', icon: <Lightbulb className="h-5 w-5" /> },
    { to: '/dashboard/opportunities', label: 'Opportunities', icon: <Briefcase className="h-5 w-5" /> },
    { to: '/dashboard/applications', label: 'Applications', icon: <FileText className="h-5 w-5" /> },
    { to: '/dashboard/internships', label: 'Internships', icon: <Award className="h-5 w-5" /> },
    { to: '/dashboard/portfolio', label: 'Portfolio', icon: <FolderOpen className="h-5 w-5" /> },
    { to: '/dashboard/certificates', label: 'Certificates', icon: <ShieldCheck className="h-5 w-5" /> },
    { to: '/dashboard/notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
    { to: '/dashboard/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ],
  industry: [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { to: '/dashboard/opportunities', label: 'Opportunities', icon: <Briefcase className="h-5 w-5" /> },
    { to: '/dashboard/applications', label: 'Applications', icon: <FileText className="h-5 w-5" /> },
    { to: '/dashboard/internships', label: 'Internships', icon: <Award className="h-5 w-5" /> },
    { to: '/dashboard/collaboration', label: 'Collaboration', icon: <Handshake className="h-5 w-5" /> },
    { to: '/dashboard/analytics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" /> },
    { to: '/dashboard/notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
    { to: '/dashboard/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ],
  academician: [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { to: '/dashboard/students', label: 'Students', icon: <Users className="h-5 w-5" /> },
    { to: '/dashboard/internships', label: 'Internships', icon: <Award className="h-5 w-5" /> },
    { to: '/dashboard/collaboration', label: 'Collaboration', icon: <Handshake className="h-5 w-5" /> },
    { to: '/dashboard/analytics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" /> },
    { to: '/dashboard/notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
    { to: '/dashboard/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ],
  institution: [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { to: '/dashboard/students', label: 'Students', icon: <Users className="h-5 w-5" /> },
    { to: '/dashboard/analytics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" /> },
    { to: '/dashboard/notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
    { to: '/dashboard/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { to: '/dashboard/users', label: 'Users', icon: <Users className="h-5 w-5" /> },
    { to: '/dashboard/skills', label: 'Skills', icon: <Brain className="h-5 w-5" /> },
    { to: '/dashboard/assessments', label: 'Assessments', icon: <ClipboardCheck className="h-5 w-5" /> },
    { to: '/dashboard/opportunities', label: 'Opportunities', icon: <Briefcase className="h-5 w-5" /> },
    { to: '/dashboard/analytics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" /> },
    { to: '/dashboard/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ],
};

export default function DashboardLayout({ children, title }: { children: ReactNode; title: string }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) {
        setNotifications(data as Notification[]);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    })();
  }, [user]);

  if (!user) return null;
  const navItems = roleNavs[user.role] || roleNavs.student;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="min-h-screen bg-surface-bg">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-surface-border bg-white transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-16 items-center gap-2 border-b border-surface-border px-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-ink">SkillBridge</span>
          </Link>
        </div>
        <nav className="flex flex-col gap-1 overflow-y-auto scrollbar-thin p-3" style={{ height: 'calc(100vh - 4rem)' }}>
          <div className="px-2 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              {capitalize(user.role)} Menu
            </span>
          </div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.to ||
              (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
            return (
              <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
                className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
          <div className="mt-auto pt-4">
            <button onClick={handleSignOut} className="sidebar-item w-full text-error hover:bg-red-50 hover:text-error">
              <LogOut className="h-5 w-5" /> Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-ink/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-surface-border bg-white/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-ink-muted hover:bg-gray-100 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold text-ink">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative rounded-lg p-2 text-ink-muted hover:bg-gray-100">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-surface-border bg-white shadow-elevated"
                    >
                      <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
                        <span className="text-sm font-semibold text-ink">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-brand-primary hover:underline">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto scrollbar-thin">
                        {notifications.length === 0 ? (
                          <p className="px-4 py-8 text-center text-sm text-ink-muted">No notifications yet</p>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className={`border-b border-surface-border px-4 py-3 ${!n.is_read ? 'bg-brand-primary/5' : ''}`}>
                              <p className="text-sm font-medium text-ink">{n.title}</p>
                              <p className="mt-0.5 text-xs text-ink-muted">{n.message}</p>
                              <p className="mt-1 text-xs text-ink-muted/70">{timeAgo(n.created_at)}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-gray-100"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-sm font-bold text-white">
                  {user.full_name.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-ink">{user.full_name || 'User'}</p>
                  <p className="text-xs text-ink-muted">{capitalize(user.role)}</p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-ink-muted sm:block" />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-surface-border bg-white shadow-elevated"
                    >
                      <div className="border-b border-surface-border px-4 py-3">
                        <p className="text-sm font-semibold text-ink">{user.full_name}</p>
                        <p className="text-xs text-ink-muted">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <Link to="/dashboard/settings" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-gray-100 hover:text-ink"
                        >
                          <Settings className="h-4 w-4" /> Settings
                        </Link>
                        <button onClick={handleSignOut}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-error hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
