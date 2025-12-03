import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard
import DashboardPage from './pages/dashboard/DashboardPage';

// Projects
import ProjectListPage from './pages/projects/ProjectListPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import NewProjectPage from './pages/projects/NewProjectPage';
import EditProjectPage from './pages/projects/EditProjectPage';

// Role-specific Pages
import StudentProjectsPage from './pages/student/StudentProjectsPage';
import TeacherReviewsPage from './pages/teacher/TeacherReviewsPage';
import CommitteeAssignmentsPage from './pages/committee/CommitteeAssignmentsPage';
import LibraryArchivePage from './pages/library/LibraryArchivePage';

// Other Pages
import NotificationsPage from './pages/notifications/NotificationsPage';
import SearchPage from './pages/search/SearchPage';
import ProfilePage from './pages/profile/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectListPage />} />
            <Route path="/projects/new" element={<NewProjectPage />} />
            <Route path="/projects/:uuid" element={<ProjectDetailPage />} />
            <Route path="/projects/:uuid/edit" element={<EditProjectPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Role-specific Routes */}
            <Route path="/student/projects" element={<StudentProjectsPage />} />
            <Route path="/teacher/reviews" element={<TeacherReviewsPage />} />
            <Route path="/committee/assignments" element={<CommitteeAssignmentsPage />} />
            <Route path="/library/archive" element={<LibraryArchivePage />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
