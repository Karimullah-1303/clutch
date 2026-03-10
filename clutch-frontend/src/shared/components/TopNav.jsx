import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * TopNav Component
 * The global navigation bar. Handles user session termination and displays 
 * the dynamic user context (Name) hydrated during the login phase.
 */
export default function TopNav() {
  const navigate = useNavigate();
  
  // Retrieve the hydrated user display name from local storage
  const userName = localStorage.getItem('clutch_userName') || 'User'; 

  /**
   * Securely terminates the session by wiping local storage and 
   * kicking the user back to the public login route.
   */
  const handleLogout = () => {
    localStorage.clear(); 
    navigate('/');
  };

  return (
    <header className="h-16 bg-surface border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="text-xl font-extrabold text-clutch-900 tracking-tight">Clutch</span>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Dynamic User Profile Display */}
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <div className="bg-clutch-50 p-2 rounded-full">
            <User size={16} className="text-clutch-800" />
          </div>
          <span>{userName}</span>
        </div>
        
        {/* Logout Action */}
        <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}