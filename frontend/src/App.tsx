import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import PrivateRoute from '@/components/layout/PrivateRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';

import LandingPage from '@/pages/public/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import PublicOpportunitiesPage from '@/pages/public/PublicOpportunitiesPage';

import SkillProfilePage from '@/pages/student/SkillProfilePage';
import AssessmentsPage from '@/pages/student/AssessmentsPage';
import AssessmentTakePage from '@/pages/student/AssessmentTakePage';
import RecommendationsPage from '@/pages/student/RecommendationsPage';
import PortfolioPage from '@/pages/student/PortfolioPage';
import CertificatesPage from '@/pages/student/CertificatesPage';

import CollaborationPage from '@/pages/industry/CollaborationPage';

import AcademicianStudentsPage from '@/pages/academician/AcademicianStudentsPage';

import AdminUsersPage from '@/pages/admin/AdminUsersPage';

import SmartDashboard from '@/pages/shared/SmartDashboard';
import AnalyticsRouter from '@/pages/shared/AnalyticsRouter';
import OpportunitiesRouter from '@/pages/shared/OpportunitiesRouter';
import ApplicationsRouter from '@/pages/shared/ApplicationsRouter';
import InternshipsRouter from '@/pages/shared/InternshipsRouter';
import SettingsPage from '@/pages/shared/SettingsPage';
import NotificationsPage from '@/pages/shared/NotificationsPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/opportunities" element={<PublicOpportunitiesPage />} />

        {/* Protected - all roles */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardLayout title="Dashboard"><SmartDashboard /></DashboardLayout></PrivateRoute>} />
        <Route path="/dashboard/settings" element={<PrivateRoute><DashboardLayout title="Settings"><SettingsPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/dashboard/notifications" element={<PrivateRoute><DashboardLayout title="Notifications"><NotificationsPage /></DashboardLayout></PrivateRoute>} />

        {/* Student */}
        <Route path="/dashboard/skills" element={<PrivateRoute allowedRoles={['student','admin']}><DashboardLayout title="My Skills"><SkillProfilePage /></DashboardLayout></PrivateRoute>} />
        <Route path="/dashboard/assessments" element={<PrivateRoute allowedRoles={['student','admin']}><DashboardLayout title="Assessments"><AssessmentsPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/dashboard/assessment/:id" element={<PrivateRoute allowedRoles={['student','admin']}><DashboardLayout title="Take Assessment"><AssessmentTakePage /></DashboardLayout></PrivateRoute>} />
        <Route path="/dashboard/recommendations" element={<PrivateRoute allowedRoles={['student']}><DashboardLayout title="Recommendations"><RecommendationsPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/dashboard/opportunities" element={<PrivateRoute><DashboardLayout title="Opportunities"><OpportunitiesRouter /></DashboardLayout></PrivateRoute>} />
        <Route path="/dashboard/applications" element={<PrivateRoute><DashboardLayout title="Applications"><ApplicationsRouter /></DashboardLayout></PrivateRoute>} />
        <Route path="/dashboard/internships" element={<PrivateRoute><DashboardLayout title="Internships"><InternshipsRouter /></DashboardLayout></PrivateRoute>} />
        <Route path="/dashboard/portfolio" element={<PrivateRoute allowedRoles={['student']}><DashboardLayout title="Portfolio"><PortfolioPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/dashboard/certificates" element={<PrivateRoute allowedRoles={['student']}><DashboardLayout title="Certificates"><CertificatesPage /></DashboardLayout></PrivateRoute>} />

        {/* Industry */}
        <Route path="/dashboard/collaboration" element={<PrivateRoute allowedRoles={['industry','academician']}><DashboardLayout title="Collaboration"><CollaborationPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/dashboard/analytics" element={<PrivateRoute allowedRoles={['industry','institution','academician','admin']}><DashboardLayout title="Analytics"><AnalyticsRouter /></DashboardLayout></PrivateRoute>} />
        <Route path="/dashboard/students" element={<PrivateRoute allowedRoles={['academician','institution','admin']}><DashboardLayout title="Students"><AcademicianStudentsPage /></DashboardLayout></PrivateRoute>} />
        <Route path="/dashboard/users" element={<PrivateRoute allowedRoles={['admin']}><DashboardLayout title="Users"><AdminUsersPage /></DashboardLayout></PrivateRoute>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
