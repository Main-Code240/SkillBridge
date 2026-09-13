import { useAuth } from '@/contexts/AuthContext';
import StudentInternshipsPage from '@/pages/student/StudentInternshipsPage';
import IndustryInternshipsPage from '@/pages/industry/IndustryInternshipsPage';

export default function InternshipsRouter() {
  const { user } = useAuth();
  if (!user) return null;
  switch (user.role) {
    case 'industry': return <IndustryInternshipsPage />;
    default: return <StudentInternshipsPage />;
  }
}
