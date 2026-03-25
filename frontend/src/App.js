import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OtpPage from './pages/OtpPage';
import StudentDashboard from './pages/student/StudentDashboard';
import SubjectsPage from './pages/student/SubjectsPage';
import ChaptersPage from './pages/student/ChaptersPage';
import ContentPage from './pages/student/ContentPage';
import QuizPage from './pages/student/QuizPage';
import RemarksPage from './pages/student/RemarksPage';
import LeaderboardPage from './pages/student/LeaderboardPage';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentsPage from './pages/teacher/StudentsPage';
import CreateQuizPage from './pages/teacher/CreateQuizPage';
import AnalyticsPage from './pages/teacher/AnalyticsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageContentPage from './pages/admin/ManageContentPage';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-4xl animate-spin">🎓</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-otp" element={<OtpPage />} />
          <Route path="/dashboard" element={<RoleRedirect />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/subjects" element={<ProtectedRoute role="STUDENT"><SubjectsPage /></ProtectedRoute>} />
          <Route path="/student/subjects/:subjectId/chapters" element={<ProtectedRoute role="STUDENT"><ChaptersPage /></ProtectedRoute>} />
          <Route path="/student/chapters/:chapterId/content" element={<ProtectedRoute role="STUDENT"><ContentPage /></ProtectedRoute>} />
          <Route path="/student/subjects/:subjectId/quizzes" element={<ProtectedRoute role="STUDENT"><QuizPage /></ProtectedRoute>} />
          <Route path="/student/remarks" element={<ProtectedRoute role="STUDENT"><RemarksPage /></ProtectedRoute>} />
          <Route path="/student/leaderboard" element={<ProtectedRoute role="STUDENT"><LeaderboardPage /></ProtectedRoute>} />

          {/* Teacher Routes */}
          <Route path="/teacher/dashboard" element={<ProtectedRoute role="TEACHER"><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/students" element={<ProtectedRoute role="TEACHER"><StudentsPage /></ProtectedRoute>} />
          <Route path="/teacher/create-quiz" element={<ProtectedRoute role="TEACHER"><CreateQuizPage /></ProtectedRoute>} />
          <Route path="/teacher/analytics" element={<ProtectedRoute role="TEACHER"><AnalyticsPage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="ADMIN"><ManageUsersPage /></ProtectedRoute>} />
          <Route path="/admin/content" element={<ProtectedRoute role="ADMIN"><ManageContentPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
