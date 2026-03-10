import React from 'react';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';

/**
 * DashboardRouter Component
 * Acts as the application's core "Traffic Cop" for Role-Based Access Control (RBAC).
 * Evaluates the user's role stored during the login hydration phase and mounts
 * the appropriate domain-specific dashboard.
 */
export default function DashboardRouter() {
  // Retrieve the authoritative role set by the Identity Service during login
  const role = localStorage.getItem('clutch_userRole');

  // Route to the operational/analytics hybrid dashboard
  if (role === 'TEACHER') {
    return <TeacherDashboard />;
  } 
  
  // Route to the academic standing dashboard
  if (role === 'STUDENT') {
    return <StudentDashboard />;
  }

  // Route to the campus provisioning and system management dashboard
  if (role === 'ADMIN') {
    return <AdminDashboard />;
  }

  // Security Fallback: Catch-all for tampered or missing local storage data
  return (
    <div className="p-8 text-center text-slate-500">
      Invalid Role or missing data. Please log in again.
    </div>
  );
}