
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Toast from './Toast';

const adminLinks = [
  { path: '/admin/dashboard', label: 'Console', icon: '📊' },
  { path: '/admin/courses', label: 'Manage Courses', icon: '📖' },
  { path: '/admin/add-course', label: 'Add Course', icon: '➕' },
  { path: '/admin/materials', label: 'Course Materials', icon: '📁' },
  { path: '/admin/students', label: 'Student Directory', icon: '👥' },
  { path: '/admin/notifications', label: 'Announcements', icon: '📣' },
  { path: '/admin/chat', label: 'Chat', icon: '💬' }
];

export default function AdminLayout() {
  return (
    <div className="dashboard-body">
      <Navbar />

      <div className="dashboard-wrapper">
        <Sidebar links={adminLinks} />

        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <Footer />
      <Toast />
    </div>
  );
}
