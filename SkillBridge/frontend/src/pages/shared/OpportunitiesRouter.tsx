import { useAuth } from '@/contexts/AuthContext';
import StudentOpportunitiesPage from '@/pages/student/StudentOpportunitiesPage';
import IndustryOpportunitiesPage from '@/pages/industry/IndustryOpportunitiesPage';

export default function OpportunitiesRouter() {
  const { user } = useAuth();
  if (!user) return null;
  switch (user.role) {
    case 'industry': return <IndustryOpportunitiesPage />;
    default: return <StudentOpportunitiesPage />;
  }
}
