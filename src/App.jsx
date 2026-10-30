
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { SocketProvider } from './context/SocketContext';

import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import StudentLayout from './components/StudentLayout';

import Home from './pages/Home';
import Chat from './pages/Chat';

import StudentLogin from './pages/auth/StudentLogin';
import AdminLogin from './pages/auth/AdminLogin';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

import NotFound from './pages/NotFound';

import StudentDashboard from './pages/student/StudentDashboard';
import BrowseCourses from './pages/student/BrowseCourses';
import MyCourses from './pages/student/MyCourses';
import CourseDetailsStudent from './pages/student/CourseDetailsStudent';
import EnrollmentSuccess from './pages/student/EnrollmentSuccess';
import Progress from './pages/student/Progress';
import Materials from './pages/student/Materials';
import NotificationsStudent from './pages/student/NotificationsStudent';
import Certificate from './pages/student/Certificate';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCourses from './pages/admin/ManageCourses';
import AddCourse from './pages/admin/AddCourse';
import EditCourse from './pages/admin/EditCourse';
import CourseDetails from './pages/admin/CourseDetails';
import StudentDirectory from './pages/admin/StudentDirectory';
import Notifications from './pages/admin/Notifications';
import ManageMaterials from './pages/admin/ManageMaterials';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CourseProvider>
          <SocketProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/auth/login" element={<StudentLogin />} />
              <Route path="/login" element={<StudentLogin />} />
              <Route path="/auth/admin-login" element={<AdminLogin />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/signup" element={<Register />} />
              <Route
                path="/auth/forgot-password"
                element={<ForgotPassword />}
              />

              {/* Student routes */}
              <Route element={<ProtectedRoute role="student" />}>
                <Route element={<StudentLayout />}>
                  <Route
                    path="/student/dashboard"
                    element={<StudentDashboard />}
                  />
                  <Route path="/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/browse" element={<BrowseCourses />} />
                  <Route path="/courses" element={<BrowseCourses />} />
                  <Route path="/student/my-courses" element={<MyCourses />} />
                  <Route
                    path="/student/course/:id"
                    element={<CourseDetailsStudent />}
                  />
                  <Route
                    path="/student/enrollment-success"
                    element={<EnrollmentSuccess />}
                  />
                  <Route path="/student/progress" element={<Progress />} />
                  <Route
                    path="/student/materials"
                    element={<Materials />}
                  />
                  <Route
                    path="/student/notifications"
                    element={<NotificationsStudent />}
                  />
                  <Route path="/student/chat" element={<Chat />} />
                  <Route
                    path="/student/certificate"
                    element={<Certificate />}
                  />
                </Route>
              </Route>

              {/* Admin routes */}
              <Route element={<ProtectedRoute role="admin" />}>
                <Route element={<AdminLayout />}>
                  <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard />}
                  />
                  <Route
                    path="/admin/courses"
                    element={<ManageCourses />}
                  />
                  <Route
                    path="/admin/courses/:id"
                    element={<CourseDetails />}
                  />
                  <Route
                    path="/admin/courses/:id/edit"
                    element={<EditCourse />}
                  />
                  <Route
                    path="/admin/add-course"
                    element={<AddCourse />}
                  />
                  <Route
                    path="/admin/materials"
                    element={<ManageMaterials />}
                  />
                  <Route
                    path="/admin/students"
                    element={<StudentDirectory />}
                  />
                  <Route
                    path="/admin/notifications"
                    element={<Notifications />}
                  />
                  <Route path="/admin/chat" element={<Chat />} />
                </Route>
              </Route>

              {/* Not found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SocketProvider>
        </CourseProvider>
      </AuthProvider>
    </Router>
  );
}
