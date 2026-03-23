import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Users, CalendarCheck, AlertCircle, Settings, BarChart3, CalendarDays } from 'lucide-react';
import StatCard from '../features/attendance/StatCard';
import ScheduleCard from '../features/attendance/ScheduleCard';
import DateSelector from '../features/attendance/DateSelector';
import ChangePasswordModal from '../features/auth/ChangePassword';
import TeacherAnalytics from '../features/attendance/TeacherAnalytics';

// --- NEW: THE TIME ENGINE ---
// Helper to strip the time so we only compare the actual calendar days
const getMidnight = (date) => new Date(new Date(date).setHours(0, 0, 0, 0));

const getAttendanceButtonState = (selectedDate, isSubmitted) => {
  const today = getMidnight(new Date());
  const targetDate = getMidnight(new Date(selectedDate));
  
  // Calculate difference in days safely
  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // 1. THE FUTURE
  if (targetDate > today) {
    return { state: "future", text: "Upcoming", disabled: true, colorClass: "bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300" };
  } 
  
  // 2. ALREADY SUBMITTED (Past or Present)
  if (isSubmitted) {
    return { state: "submitted", text: "Submitted (Edit)", disabled: false, colorClass: "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200" };
  }

  // 3. THE PAST (Unsubmitted)
  if (targetDate < today) {
    if (diffDays <= 2) {
      // Grace Period (48 Hours)
      return { state: "late", text: "Submit Late", disabled: false, colorClass: "bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200" };
    } else {
      // Locked completely
      return { state: "locked", text: "Locked (Missed)", disabled: true, colorClass: "bg-red-50 text-red-500 cursor-not-allowed border border-red-200" };
    }
  }

  // 4. EXACTLY TODAY (Unsubmitted)
  return { state: "today", text: "Take Attendance", disabled: false, colorClass: "bg-clutch-600 text-white hover:bg-clutch-700" };
};

export default function TeacherDashboard() {
  const location = useLocation(); 

  const [currentDate, setCurrentDate] = useState(() => {
    return location.state?.savedDate ? new Date(location.state.savedDate) : new Date();
  });
  
  const [todayClasses, setTodayClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [stats, setStats] = useState({ pending: 0, scheduled: 0, avgHealth: "--" });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  
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

        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        const response = await axios.get(
          `/api/v1/blocks/teacher/${teacherId}/daily-schedule?date=${formattedDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const fetchedClasses = response.data;
        setTodayClasses(fetchedClasses);

        const completedClasses = fetchedClasses.filter(cls => cls.completed);
        let totalPresent = 0;
        let totalStudents = 0;

        completedClasses.forEach(cls => {
            totalPresent += cls.presentCount || 0;
            totalStudents += cls.totalEnrolled || 0;
        });

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
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-clutch-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back. Here is your overview.</p>
        </div>
        
        <div className="flex items-center gap-3">
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

      {activeTab === 'analytics' ? (
        <TeacherAnalytics />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Pending Tasks" value={stats.pending} subtitle="Needs attendance" icon={AlertCircle} colorClass="bg-orange-100 text-orange-600" />
            <StatCard title="Classes Scheduled" value={stats.scheduled} subtitle="For selected date" icon={CalendarCheck} colorClass="bg-blue-100 text-clutch-600" />
            <StatCard title="Avg Class Health" value={stats.avgHealth} subtitle="Present vs Enrolled" icon={Users} colorClass="bg-green-100 text-green-600" />
          </div>

          <DateSelector selectedDate={currentDate} setSelectedDate={setCurrentDate} />

          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              Schedule for {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </h2>
            
            {isLoading ? (
              <div className="text-center p-8 text-slate-500 font-medium">Loading your classes...</div>
            ) : todayClasses.length > 0 ? (
              <div className="flex flex-col gap-4">
                {todayClasses.map((cls) => {
                  
                  // 🚨 NEW: Calculate the state before rendering the card
                  const btnConfig = getAttendanceButtonState(currentDate, cls.completed);

                  return (
                    <ScheduleCard 
                      key={cls.blockId} 
                      blockId={cls.blockId} 
                      subject={cls.subjectName} 
                      section={cls.sectionName} 
                      time={cls.startTime.substring(0, 5)} 
                      isCompleted={cls.completed} 
                      sectionId={cls.sectionId}
                      currentDate={currentDate.toISOString()} 
                      buttonConfig={btnConfig} // 🚨 NEW: Pass it down!
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-8 bg-surface rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500 font-medium">No classes scheduled for this date.</p>
              </div>
            )}
          </div>
        </>
      )}

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
}