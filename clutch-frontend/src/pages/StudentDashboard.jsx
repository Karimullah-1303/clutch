import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, BookOpen, Briefcase, Rocket, Calendar, Bell } from 'lucide-react';
import AttendanceRing from '../features/attendance/AttendanceRing';
import SubjectStatsTable from '../features/attendance/SubjectStatsTable';
import ChangePasswordModal from '../features/auth/ChangePassword';
import StudentPortfolio from '../features/placements/StudentPortfolio'; 
import StudentJobBoard from '../features/placements/StudentJobBoard';
import StudentTimetable from '../features/academic/StudentTimetable';

export default function StudentDashboard() {
  const [subjectStats, setSubjectStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // --- NOTIFICATION STATE ---
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  
  // --- STATE FOR TABS ---
  const [activeTab, setActiveTab] = useState('attendance'); 
  
  const userName = localStorage.getItem('clutch_userName') || 'Student';
  const studentId = localStorage.getItem('clutch_userId');

  // Fetch Attendance & Notifications
  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchAttendanceData();
    }
    fetchNotifications();
  }, [activeTab]);

  const fetchAttendanceData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('clutch_token');
      const response = await axios.get(
        `/api/v1/attendance/student/${studentId}/summary`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubjectStats(response.data);
    } catch (error) {
      console.error("Error fetching student stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Hits the Placement Service (Port 8083) for career alerts
      const response = await axios.get(`/api/v1/placement/student/${studentId}/notifications`);
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const totalHeldOverall = subjectStats.reduce((sum, sub) => sum + sub.totalHeld, 0);
  const totalAttendedOverall = subjectStats.reduce((sum, sub) => sum + sub.totalAttended, 0);
  const overallPercentage = totalHeldOverall === 0 ? 0 : Math.round((totalAttendedOverall / totalHeldOverall) * 100);
  const isOverallSafe = overallPercentage >= 75;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      
      {/* HEADER & ACTION BUTTONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-clutch-900">Student Hub</h1>
          <p className="text-slate-500 mt-1">Welcome back, {userName.split(' ')[0]}. Manage your academics and career.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* --- NOTIFICATION BELL --- */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm relative"
            >
              <Bell size={20} />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl border border-slate-100 rounded-2xl z-50 animate-fade-in">
                <div className="p-4 border-b border-slate-50 font-bold text-slate-800">Notifications</div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-slate-500 text-center italic">No new updates.</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50">
                        <p className="text-sm font-bold text-slate-800">{n.title}</p>
                        <p className="text-xs text-slate-500">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex items-center gap-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Settings size={18} />
            <span className="hidden sm:inline">Security</span>
          </button>
        </div>
      </div>

      {/* --- NAVIGATION TABS --- */}
      <div className="flex space-x-2 border-b border-slate-200 mb-8 pb-px overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'attendance' ? 'border-clutch-600 text-clutch-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <BookOpen size={18} /> My Attendance
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'schedule' ? 'border-clutch-600 text-clutch-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Calendar size={18} /> My Schedule
        </button>

        <button
          onClick={() => setActiveTab('portfolio')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'portfolio' ? 'border-clutch-600 text-clutch-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Briefcase size={18} /> Placement Portfolio
        </button>

        <button
          onClick={() => setActiveTab('campusdrives')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'campusdrives' ? 'border-clutch-600 text-clutch-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Rocket size={18} /> Campus Drives
        </button>
      </div>

      {/* --- CONDITIONAL RENDERING --- */}
      <div className="min-h-[400px]">
        {activeTab === 'portfolio' && <StudentPortfolio />}
        {activeTab === 'campusdrives' && <StudentJobBoard />}
        {activeTab === 'schedule' && <StudentTimetable />}
        {activeTab === 'attendance' && (
          <>
            {isLoading ? (
              <div className="text-center p-12 text-slate-500 font-medium bg-surface rounded-2xl shadow-soft">
                Calculating your attendance data...
              </div>
            ) : subjectStats.length === 0 ? (
              <div className="text-center p-12 text-slate-500 font-medium bg-surface rounded-2xl shadow-soft">
                You are not enrolled in any active classes yet.
              </div>
            ) : (
              <>
                <div className="bg-surface rounded-2xl shadow-soft border border-slate-100 p-8 flex flex-col md:flex-row items-center justify-center gap-12">
                  <AttendanceRing percentage={overallPercentage} />
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Overall Aggregate</h2>
                    <p className="text-slate-500 mb-4 font-medium">
                      Across all subjects, you have attended <span className="text-clutch-600 font-bold">{totalAttendedOverall}</span> out of <span className="text-clutch-600 font-bold">{totalHeldOverall}</span> total classes.
                    </p>
                    <div className={`inline-block px-4 py-2 rounded-lg font-bold border ${isOverallSafe ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {isOverallSafe ? "✅ You meet the 75% university requirement." : "Warning: You are below the required attendance."}
                    </div>
                  </div>
                </div>
                <SubjectStatsTable subjects={subjectStats} />
              </>
            )}
          </>
        )}
      </div>

      {/* Password Modal Mount */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
}