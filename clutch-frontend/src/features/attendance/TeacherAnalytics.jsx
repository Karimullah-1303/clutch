import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, AlertOctagon, Users, BookOpen } from 'lucide-react';

/**
 * TeacherAnalytics Component
 * The strategic command center for teachers. Fetches the massive TeacherAnalyticsDto
 * payload and visualizes global averages, section-by-section health, and 
 * an actionable hitlist of at-risk students.
 */
export default function TeacherAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetches the pre-aggregated analytics payload from the Academy Service.
   */
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('clutch_token');
        const teacherId = localStorage.getItem('clutch_userId');

        if (!token || !teacherId) return;

        const response = await axios.get(
          `http://localhost:8082/api/v1/attendance/teacher/${teacherId}/analytics`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setAnalytics(response.data);
      } catch (error) {
        console.error("Failed to fetch teacher analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return <div className="text-center p-12 text-slate-500 font-medium">Crunching analytics data...</div>;
  }

  if (!analytics) {
    return <div className="text-center p-12 text-slate-500 font-medium">Failed to load analytics.</div>;
  }

  return (
    <div className="animate-fade-in space-y-8">
      
      {/* 1. Global Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-2xl border border-slate-100 shadow-soft flex items-center gap-6">
          <div className="p-4 bg-clutch-100 text-clutch-600 rounded-full">
            <Activity size={32} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Global Attendance Average</p>
            <h2 className="text-4xl font-black text-clutch-900 mt-1">{analytics.globalAveragePercentage}%</h2>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-slate-100 shadow-soft flex items-center gap-6">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
            <BookOpen size={32} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Classes Taught</p>
            <h2 className="text-4xl font-black text-slate-800 mt-1">{analytics.totalClassesTaughtThisSemester} Sessions</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Section Health Breakdown (Left Side) */}
        <div className="lg:col-span-2 bg-surface rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Users size={20} className="text-slate-600" />
            <h3 className="text-lg font-bold text-slate-800">Section Health Breakdown</h3>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {analytics.sectionHealthList.length === 0 ? (
               <p className="text-slate-500 text-sm">No section data available.</p>
            ) : (
               analytics.sectionHealthList.map((section, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800">{section.subjectName}</h4>
                    <p className="text-sm text-slate-500">{section.sectionName}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-end">
                    <span className="text-xs font-semibold text-slate-400">{section.totalClassesHeld} classes</span>
                    {/* Dynamic text color for section health */}
                    <span className={`text-xl font-black ${section.averageAttendancePercentage >= 75 ? 'text-green-600' : 'text-orange-500'}`}>
                      {section.averageAttendancePercentage}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. The Danger Zone Hitlist (Right Side) */}
        <div className="bg-surface rounded-2xl shadow-soft border border-red-100 overflow-hidden">
          <div className="p-6 border-b border-red-100 bg-red-50 flex items-center gap-2">
            <AlertOctagon size={20} className="text-red-600" />
            <h3 className="text-lg font-bold text-red-700">At-Risk Students (&lt;75%)</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {analytics.atRiskStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-medium">
                No students are currently at risk. Great job!
              </div>
            ) : (
              analytics.atRiskStudents.map((student, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800">{student.studentName}</h4>
                    <p className="text-xs font-semibold text-slate-500">{student.rollNumber}</p>
                    <p className="text-xs text-slate-400 mt-1">{student.subjectName} ({student.sectionName})</p>
                  </div>
                  <div className="bg-red-100 text-red-700 font-black px-3 py-1 rounded-lg text-sm border border-red-200 shadow-sm">
                    {student.currentPercentage}%
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}