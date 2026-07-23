import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Public Pages
import Landing from './pages/Landing';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import EmployeeLogin from './pages/EmployeeLogin';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import Employees from './pages/Employees';
import Courses from './pages/Courses';
import AssignCourse from './pages/AssignCourse';
import Reports from './pages/Reports';
import AdminAnswerKey from './pages/AdminAnswerKey';

// Employee Pages
import EmployeeDashboard from './pages/EmployeeDashboard';
import CourseIntro from './pages/CourseIntro';
import CoursePlayer from './pages/CoursePlayer';
import MCQTest from './pages/MCQTest';
import ResultPage from './pages/ResultPage';
import ParticleBackground from './components/shared/ParticleBackground';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="relative min-h-screen overflow-x-hidden">
          {/* Base Background Color Layer */}
          <div className="fixed inset-0 bg-[#FAFAFA] -z-30 pointer-events-none" />

          {/* Global Blurred Gradient Mesh Backdrop */}
          <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-brand-red/8 to-orange-500/4 blur-[100px] -z-10 pointer-events-none" />
          <div className="fixed bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-warning-yellow/8 to-transparent blur-[100px] -z-10 pointer-events-none" />
          
          {/* Global 3D Parallax Floating Particles Backdrop */}
          <ParticleBackground />
          
          <Routes>
            {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/employee/login" element={<EmployeeLogin />} />

          {/* Admin Protected Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/employees" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Employees />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/courses" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Courses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/assign" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AssignCourse />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reports" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Reports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/answer-key" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAnswerKey />
              </ProtectedRoute>
            } 
          />

          {/* Employee Protected Routes */}
          <Route 
            path="/employee/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee/course/:courseId/intro" 
            element={
              <ProtectedRoute allowedRoles={['employee', 'admin']}>
                <CourseIntro />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee/course/:courseId/play" 
            element={
              <ProtectedRoute allowedRoles={['employee', 'admin']}>
                <CoursePlayer />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee/course/:courseId/quiz" 
            element={
              <ProtectedRoute allowedRoles={['employee', 'admin']}>
                <MCQTest />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee/course/:courseId/result" 
            element={
              <ProtectedRoute allowedRoles={['employee', 'admin']}>
                <ResultPage />
              </ProtectedRoute>
            } 
          />

          {/* Wildcard Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
