import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Users, CalendarCheck, AlertCircle, Settings, BarChart3, CalendarDays } from 'lucide-react';
import StatCard from '../features/attendance/StatCard';
import ScheduleCard from '../features/attendance/ScheduleCard';
import DateSelector from '../features/attendance/DateSelector';
import ChangePasswordModal from '../features/auth/ChangePassword';
import TeacherAnalytics from '../features/attendance/TeacherAnalytics';

/**
 * TeacherDashboard Component
 * Acts as the main command center for teachers. Features a tabbed interface to switch
 * between daily schedule management (operational view) and the Analytics Hub (strategic view).
 */
export default function TeacherDashboard() {
  const location = useLocation(); 

  // Initialize date from router state (if navigating back from marking attendance) or default to today
  const [currentDate, setCurrentDate] = useState(() => {
    return location.state?.savedDate ? new Date(location.state.savedDate) : new Date();
  });
  
  const [todayClasses, setTodayClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dashboard aggregated metrics
  const [stats, setStats] = useState({ pending: 0, scheduled: 0, avgHealth: "--" });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Controls whether the UI shows the daily schedule or the global analytics
  const [activeTab, setActiveTab] = useState('schedule');
  
  /**
   * Fetches the daily schedule from the Academy Service.
   * Re-runs automatically whenever the user changes the `currentDate` via the DateSelector,
   * or when the router location key changes (e.g., returning from a successful submission).
   */
  useEffect(() => {
    const fetchSchedule = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('clutch_token');
        const teacherId = localStorage.getItem('clutch_userId');

        if (!token || !teacherId) {
          console.error("Missing credentials. Please log in again.");
          return;
        }

        // Format date strictly to YYYY-MM-DD to match the Spring Boot backend expectation
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        const response = await axios.get(
          `http://localhost:8082/api/v1/blocks/teacher/${teacherId}/daily-schedule?date=${formattedDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const fetchedClasses = response.data;
        setTodayClasses(fetchedClasses);

        // --- DYNAMIC METRICS CALCULATION ---
        const completedClasses = fetchedClasses.filter(cls => cls.completed);
        let totalPresent = 0;
        let totalStudents = 0;

        completedClasses.forEach(cls => {
            totalPresent += cls.presentCount || 0;
            totalStudents += cls.totalEnrolled || 0;
        });

        // Protect against NaN/Infinity if a teacher has zero students enrolled
        const healthScore = totalStudents > 0 
            ? Math.round((totalPresent / totalStudents) * 100) + "%" 
            : "--";

        setStats({
          scheduled: fetchedClasses.length,
          pending: fetchedClasses.filter(cls => !cls.completed).length,
          avgHealth: healthScore
        });

      } catch (error) {
        console.error("Error fetching daily schedule:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [currentDate, location.key]); 

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      
      {/* Header with Tab Switcher & Security Configuration */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-clutch-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back. Here is your overview.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Tab Navigation Menu */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${activeTab === 'schedule' ? 'bg-white text-clutch-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <CalendarDays size={18} />
              <span className="hidden sm:inline">Schedule</span>
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${activeTab === 'analytics' ? 'bg-white text-clutch-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <BarChart3 size={18} />
              <span className="hidden sm:inline">Analytics</span>
            </button>
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

      {/* --- CONDITIONAL RENDERING --- 
          Renders the global analytics if active, otherwise shows the operational daily schedule 
      */}
      {activeTab === 'analytics' ? (
        <TeacherAnalytics />
      ) : (
        <>
          {/* Daily Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Pending Tasks" value={stats.pending} subtitle="Needs attendance" icon={AlertCircle} colorClass="bg-orange-100 text-orange-600" />
            <StatCard title="Classes Scheduled" value={stats.scheduled} subtitle="For selected date" icon={CalendarCheck} colorClass="bg-blue-100 text-clutch-600" />
            <StatCard title="Avg Class Health" value={stats.avgHealth} subtitle="Present vs Enrolled" icon={Users} colorClass="bg-green-100 text-green-600" />
          </div>

          <DateSelector selectedDate={currentDate} setSelectedDate={setCurrentDate} />

          {/* Daily Schedule List */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              Schedule for {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </h2>
            
            {isLoading ? (
              <div className="text-center p-8 text-slate-500 font-medium">Loading your classes...</div>
            ) : todayClasses.length > 0 ? (
              <div className="flex flex-col gap-4">
                {todayClasses.map((cls) => (
                  <ScheduleCard 
                    key={cls.blockId} 
                    blockId={cls.blockId} 
                    subject={cls.subjectName} 
                    section={cls.sectionName} 
                    time={cls.startTime.substring(0, 5)} 
                    isCompleted={cls.completed} 
                    sectionId={cls.sectionId}
                    currentDate={currentDate.toISOString()} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-surface rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500 font-medium">No classes scheduled for this date.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals mounted at the root level of the component */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
}