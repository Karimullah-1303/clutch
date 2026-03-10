import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './shared/components/Layout';
import MarkAttendance from './pages/MarkAttendance';
import DashboardRouter from './pages/DashboardRouter';

/**
 * App Component (The Root Router)
 * Defines the global routing architecture using React Router v6.
 * Implements a strict separation between public routes (Login) and 
 * protected authenticated routes nested inside the App Shell (Layout).
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- PUBLIC ROUTE --- */}
        <Route path="/" element={<Login />} />

        {/* --- PROTECTED ROUTES (The App Shell) --- */}
        {/* Everything inside this Layout route will have the TopNav applied automatically */}
        <Route element={<Layout />}>
          
          {/* The Traffic Cop evaluates the user's role and serves the correct dashboard */}
          <Route path="/dashboard" element={<DashboardRouter />} /> 
          
          {/* The dynamic route for teachers to mark or edit attendance */}
          <Route path="/attendance/:blockId" element={<MarkAttendance />} />
        </Route>

        {/* --- CATCH-ALL --- */}
        {/* Redirects any unknown URLs back to the login page for security */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;