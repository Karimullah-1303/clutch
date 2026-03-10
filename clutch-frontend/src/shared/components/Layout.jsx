import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';

/**
 * Layout Component (The App Shell)
 * Wraps all authenticated routes to provide a consistent global UI layout.
 * The `<Outlet />` acts as a placeholder where React Router dynamically 
 * injects the child page components (like DashboardRouter or MarkAttendance).
 */
export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />
      {/* This is the main content wrapper.
        If we ever need a side-by-side flex layout for a Sidebar, it goes here.
        For now, it keeps the child components beautifully centered and clean. 
      */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-8">
        <Outlet /> 
      </main>
    </div>
  );
}