import { useAuth } from '@/contexts/AuthContext';
import InstitutionDashboard from '@/pages/institution/InstitutionDashboard';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import IndustryDashboard from '@/pages/industry/IndustryDashboard';

export default function AnalyticsRouter() {
  const { user } = useAuth();
  if (!user) return null;
  switch (user.role) {
    case 'institution': return <InstitutionDashboard />;
    case 'admin': return <AdminDashboard />;
    default: return <IndustryDashboard />;
  }
}
