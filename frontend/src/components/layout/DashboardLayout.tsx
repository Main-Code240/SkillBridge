import { type ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Menu,
  Bell,
  LogOut,
  ChevronDown,
  Settings,
  LayoutDashboard,
  Brain,
  ClipboardCheck,
  Lightbulb,
  Briefcase,
  FileText,
  Award,
  FolderOpen,
  ShieldCheck,
  Users,
  Handshake,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Notification } from '@/types';
import { timeAgo, capitalize } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/api';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

interface NotificationsResponse {
  success: boolean;
  notifications: Array<{
    _id?: string;
    id?: string;
    user?: string;
    userId?: string;
    title: string;
    message?: string;
    type?: string;
    isRead?: boolean;
    is_read?: boolean;
    link?: string;
    createdAt?: string;
    created_at?: string;
  }>;
}

const roleNavs: Record<string, NavItem[]> = {
  student: [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      to: '/dashboard/skills',
      label: 'My Skills',
      icon: <Brain className="h-5 w-5" />,
    },
    {
      to: '/dashboard/assessments',
      label: 'Assessments',
      icon: <ClipboardCheck className="h-5 w-5" />,
    },
    {
      to: '/dashboard/recommendations',
      label: 'Recommendations',
      icon: <Lightbulb className="h-5 w-5" />,
    },
    {
      to: '/dashboard/opportunities',
      label: 'Opportunities',
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      to: '/dashboard/applications',
      label: 'Applications',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      to: '/dashboard/internships',
      label: 'Internships',
      icon: <Award className="h-5 w-5" />,
    },
    {
      to: '/dashboard/portfolio',
      label: 'Portfolio',
      icon: <FolderOpen className="h-5 w-5" />,
    },
    {
      to: '/dashboard/certificates',
      label: 'Certificates',
      icon: <ShieldCheck className="h-5 w-5" />,
    },
    {
      to: '/dashboard/notifications',
      label: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
    },
    {
      to: '/dashboard/settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ],

  industry: [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      to: '/dashboard/opportunities',
      label: 'Opportunities',
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      to: '/dashboard/applications',
      label: 'Applications',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      to: '/dashboard/internships',
      label: 'Internships',
      icon: <Award className="h-5 w-5" />,
    },
    {
      to: '/dashboard/collaboration',
      label: 'Collaboration',
      icon: <Handshake className="h-5 w-5" />,
    },
    {
      to: '/dashboard/analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      to: '/dashboard/notifications',
      label: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
    },
    {
      to: '/dashboard/settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ],

  academician: [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      to: '/dashboard/students',
      label: 'Students',
      icon: <Users className="h-5 w-5" />,
    },
    {
      to: '/dashboard/internships',
      label: 'Internships',
      icon: <Award className="h-5 w-5" />,
    },
    {
      to: '/dashboard/collaboration',
      label: 'Collaboration',
      icon: <Handshake className="h-5 w-5" />,
    },
    {
      to: '/dashboard/analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      to: '/dashboard/notifications',
      label: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
    },
    {
      to: '/dashboard/settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ],

  institution: [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      to: '/dashboard/students',
      label: 'Students',
      icon: <Users className="h-5 w-5" />,
    },
    {
      to: '/dashboard/analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      to: '/dashboard/notifications',
      label: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
    },
    {
      to: '/dashboard/settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ],

  admin: [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      to: '/dashboard/users',
      label: 'Users',
      icon: <Users className="h-5 w-5" />,
    },
    {
      to: '/dashboard/skills',
      label: 'Skills',
      icon: <Brain className="h-5 w-5" />,
    },
    {
      to: '/dashboard/assessments',
      label: 'Assessments',
      icon: <ClipboardCheck className="h-5 w-5" />,
    },
    {
      to: '/dashboard/opportunities',
      label: 'Opportunities',
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      to: '/dashboard/analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      to: '/dashboard/settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ],
};

function normalizeNotification(
  notification: NotificationsResponse['notifications'][number]
): Notification {
  const id = String(
    notification._id ??
      notification.id ??
      ''
  );

  return {
    id,
    user_id: String(
      notification.userId ??
        notification.user ??
        ''
    ),
    title: notification.title || '',
    message: notification.message || '',
    type: notification.type || 'info',
    is_read:
      notification.isRead ??
      notification.is_read ??
      false,
    link: notification.link || '',
    created_at:
      notification.createdAt ??
      notification.created_at ??
      new Date().toISOString(),
  } as Notification;
}

export default function DashboardLayout({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [userMenuOpen, setUserMenuOpen] =
    useState(false);

  const [notifOpen, setNotifOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      setLoadingNotifications(true);

      const response =
        await apiFetch<NotificationsResponse>(
          '/notifications'
        );

      const normalized =
        (response.notifications || [])
          .map(normalizeNotification)
          .slice(0, 10);

      setNotifications(normalized);

      setUnreadCount(
        normalized.filter(
          (notification) =>
            !notification.is_read
        ).length
      );
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    loadNotifications();
  }, [user]);

  if (!user) return null;

  const navItems =
    roleNavs[user.role] ||
    roleNavs.student;

  const userData = user as typeof user & {
    fullName?: string;
    full_name?: string;
  };

  const fullName =
    userData.full_name ||
    userData.fullName ||
    'User';

  const firstLetter =
    fullName.charAt(0).toUpperCase() ||
    'U';

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      navigate('/');
    }
  };

  const markAllRead = async () => {
    if (!user || unreadCount === 0) return;

    try {
      const unreadNotifications =
        notifications.filter(
          (notification) =>
            !notification.is_read
        );

      await Promise.all(
        unreadNotifications.map(
          (notification) =>
            apiFetch(
              `/notifications/${notification.id}/read`,
              {
                method: 'PATCH',
              }
            )
        )
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      setUnreadCount(0);
    } catch {
      await loadNotifications();
    }
  };

  const handleNotificationClick = (
    notification: Notification
  ) => {
    setNotifOpen(false);

    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg">
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-surface-border bg-white transition-transform lg:translate-x-0 ${
          sidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-surface-border px-5">
          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>

            <span className="font-bold text-ink">
              SkillBridge
            </span>
          </Link>
        </div>

        <nav
          className="flex flex-col gap-1 overflow-y-auto scrollbar-thin p-3"
          style={{
            height: 'calc(100vh - 4rem)',
          }}
        >
          <div className="px-2 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              {capitalize(user.role)} Menu
            </span>
          </div>

          {navItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== '/dashboard' &&
                location.pathname.startsWith(
                  item.to
                ));

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() =>
                  setSidebarOpen(false)
                }
                className={`sidebar-item ${
                  isActive
                    ? 'sidebar-item-active'
                    : ''
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}

          <div className="mt-auto pt-4">
            <button
              type="button"
              onClick={handleSignOut}
              className="sidebar-item w-full text-error hover:bg-red-50 hover:text-error"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-ink/30 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-surface-border bg-white/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="rounded-lg p-2 text-ink-muted hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <h1 className="text-lg font-bold text-ink">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen(
                    (previous) => !previous
                  );
                  setUserMenuOpen(false);
                }}
                className="relative rounded-lg p-2 text-ink-muted hover:bg-gray-100"
              >
                <Bell className="h-5 w-5" />

                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white">
                    {unreadCount > 9
                      ? '9+'
                      : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() =>
                        setNotifOpen(false)
                      }
                    />

                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: 8,
                      }}
                      className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-surface-border bg-white shadow-elevated"
                    >
                      <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
                        <span className="text-sm font-semibold text-ink">
                          Notifications
                        </span>

                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllRead}
                            className="text-xs text-brand-primary hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto scrollbar-thin">
                        {loadingNotifications ? (
                          <div className="px-4 py-8 text-center text-sm text-ink-muted">
                            Loading notifications...
                          </div>
                        ) : notifications.length ===
                          0 ? (
                          <p className="px-4 py-8 text-center text-sm text-ink-muted">
                            No notifications yet
                          </p>
                        ) : (
                          notifications.map(
                            (notification) => (
                              <button
                                type="button"
                                key={notification.id}
                                onClick={() =>
                                  handleNotificationClick(
                                    notification
                                  )
                                }
                                className={`block w-full border-b border-surface-border px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                                  !notification.is_read
                                    ? 'bg-brand-primary/5'
                                    : ''
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  {!notification.is_read && (
                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-primary" />
                                  )}

                                  <div
                                    className={
                                      notification.is_read
                                        ? 'w-full'
                                        : 'w-full'
                                    }
                                  >
                                    <p className="text-sm font-medium text-ink">
                                      {
                                        notification.title
                                      }
                                    </p>

                                    <p className="mt-0.5 text-xs text-ink-muted">
                                      {
                                        notification.message
                                      }
                                    </p>

                                    <p className="mt-1 text-xs text-ink-muted/70">
                                      {timeAgo(
                                        notification.created_at
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            )
                          )
                        )}
                      </div>

                      <div className="border-t border-surface-border p-2">
                        <Link
                          to="/dashboard/notifications"
                          onClick={() =>
                            setNotifOpen(false)
                          }
                          className="block rounded-lg px-3 py-2 text-center text-xs font-medium text-brand-primary hover:bg-brand-primary/5"
                        >
                          View all notifications
                        </Link>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(
                    (previous) => !previous
                  );
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-gray-100"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-sm font-bold text-white">
                  {firstLetter}
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-ink">
                    {fullName}
                  </p>

                  <p className="text-xs text-ink-muted">
                    {capitalize(user.role)}
                  </p>
                </div>

                <ChevronDown className="hidden h-4 w-4 text-ink-muted sm:block" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() =>
                        setUserMenuOpen(false)
                      }
                    />

                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: 8,
                      }}
                      className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-surface-border bg-white shadow-elevated"
                    >
                      <div className="border-b border-surface-border px-4 py-3">
                        <p className="text-sm font-semibold text-ink">
                          {fullName}
                        </p>

                        <p className="truncate text-xs text-ink-muted">
                          {user.email}
                        </p>
                      </div>

                      <div className="p-2">
                        <Link
                          to="/dashboard/settings"
                          onClick={() =>
                            setUserMenuOpen(false)
                          }
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-gray-100 hover:text-ink"
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>

                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-error hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}