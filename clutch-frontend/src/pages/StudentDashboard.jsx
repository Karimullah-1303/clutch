import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AttendanceRing from '../features/attendance/AttendanceRing';
import SubjectStatsTable from '../features/attendance/SubjectStatsTable';

/**
 * StudentDashboard Component
 * Fetches and displays a comprehensive academic standing view for a student,
 * rendering a master average ring and a detailed subject-by-subject breakdown table.
 */
export default function StudentDashboard() {
  const [subjectStats, setSubjectStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userName = localStorage.getItem('clutch_userName') || 'Student';

  /**
   * Fetches the pre-calculated, aggregated attendance summary from the Academy Service.
   */
  useEffect(() => {
    const fetchAttendanceData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('clutch_token');
        const studentId = localStorage.getItem('clutch_userId');

        const response = await axios.get(
          `http://localhost:8082/api/v1/attendance/student/${studentId}/summary`, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setSubjectStats(response.data);
      } catch (error) {
        console.error("Error fetching student stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  // --- MASTER AGGREGATE CALCULATIONS ---
  // Reduce functions sum up the total held and attended classes across ALL distinct subjects
  const totalHeldOverall = subjectStats.reduce((sum, sub) => sum + sub.totalHeld, 0);
  const totalAttendedOverall = subjectStats.reduce((sum, sub) => sum + sub.totalAttended, 0);
  
  // Protect against division by zero errors during the first week of a semester
  const overallPercentage = totalHeldOverall === 0 ? 0 : Math.round((totalAttendedOverall / totalHeldOverall) * 100);
  
  // Strict check against the standard 75% university requirement
  const isOverallSafe = overallPercentage >= 75;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-clutch-900">My Attendance</h1>
        <p className="text-slate-500 mt-1">Welcome back, {userName.split(' ')[0]}. Here is your academic standing.</p>
      </div>

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
          {/* Master Hero Card: Global Percentage Overview */}
          <div className="bg-surface rounded-2xl shadow-soft border border-slate-100 p-8 flex flex-col md:flex-row items-center justify-center gap-12">
            <AttendanceRing percentage={overallPercentage} />
            
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Overall Aggregate</h2>
              <p className="text-slate-500 mb-4 font-medium">
                Across all subjects, you have attended <span className="text-clutch-600 font-bold">{totalAttendedOverall}</span> out of <span className="text-clutch-600 font-bold">{totalHeldOverall}</span> total classes.
              </p>
              
              {/* Dynamic Status Banner */}
              <div className={`inline-block px-4 py-2 rounded-lg font-bold border ${isOverallSafe ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {isOverallSafe ? "✅ You meet the 75% university requirement." : "🚨 Warning: You are below the required attendance."}
              </div>
            </div>
          </div>

          {/* Detailed Subject-by-Subject Breakdown Table */}
          <SubjectStatsTable subjects={subjectStats} />
        </>
      )}
    </div>
  );
}