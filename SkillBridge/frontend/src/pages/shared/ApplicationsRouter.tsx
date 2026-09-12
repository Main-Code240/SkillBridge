import { useAuth } from '@/contexts/AuthContext';
import ApplicationsPage from '@/pages/student/ApplicationsPage';
import IndustryApplicationsPage from '@/pages/industry/IndustryApplicationsPage';

export default function ApplicationsRouter() {
  const { user } = useAuth();
  if (!user) return null;
  switch (user.role) {
    case 'industry': return <IndustryApplicationsPage />;
    default: return <ApplicationsPage />;
  }
}
