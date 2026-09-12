import { useAuth } from '@/contexts/AuthContext';
import StudentDashboard from '@/pages/student/StudentDashboard';
import IndustryDashboard from '@/pages/industry/IndustryDashboard';
import AcademicianDashboard from '@/pages/academician/AcademicianDashboard';
import InstitutionDashboard from '@/pages/institution/InstitutionDashboard';
import AdminDashboard from '@/pages/admin/AdminDashboard';

export default function SmartDashboard() {
  const { user } = useAuth();
  if (!user) return null;
  switch (user.role) {
    case 'industry': return <IndustryDashboard />;
    case 'academician': return <AcademicianDashboard />;
    case 'institution': return <InstitutionDashboard />;
    case 'admin': return <AdminDashboard />;
    default: return <StudentDashboard />;
  }
}
