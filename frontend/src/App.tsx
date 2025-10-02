import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import StudentManagementPage from './pages/StudentManagementPage';
import TeacherManagementPage from './pages/TeacherManagementPage';
import ClassManagementPage from './pages/ClassManagementPage';
import SubjectManagementPage from './pages/SubjectManagementPage';
import AttendanceManagementPage from './pages/AttendanceManagementPage';
import GradeManagementPage from './pages/GradeManagementPage';
import OnboardingPage from './pages/OnboardingPage';
import HelpPage from './pages/HelpPage';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Main App Component
const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} 
        />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/help" element={<HelpPage />} />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            user ? (
              user.role === 'admin' ? <AdminDashboard /> :
              user.role === 'teacher' ? <TeacherDashboard /> :
              user.role === 'student' ? <StudentDashboard /> :
              user.role === 'parent' ? <ParentDashboard /> :
              <Navigate to="/login" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Role-specific Routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/students" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StudentManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/teachers" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TeacherManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/classes" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ClassManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/subjects" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SubjectManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/attendance" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <AttendanceManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/grades" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <GradeManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/*" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/*" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/parent/*" 
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Box>
  );
};

// App with Auth Provider
const AppWithAuth: React.FC = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWithAuth;
