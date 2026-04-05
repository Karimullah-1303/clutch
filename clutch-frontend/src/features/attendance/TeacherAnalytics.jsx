import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, AlertOctagon, Users, BookOpen, ChevronDown, ChevronUp, Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function TeacherAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- NEW STATES FOR THE DOUBLE DRILL-DOWN ---
  const [expandedSectionKey, setExpandedSectionKey] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [sessionRecords, setSessionRecords] = useState([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('clutch_token');
        const teacherId = localStorage.getItem('clutch_userId');

        if (!token || !teacherId) return;

        const response = await axios.get(
          `/api/v1/attendance/teacher/${teacherId}/analytics`,
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

  
  const handleSectionClick = async (subjectId, sectionId, subjectName, sectionName) => {
    // Fallback key just in case IDs are missing from DTO
    const key = (subjectId && sectionId) ? `${subjectId}-${sectionId}` : `${subjectName}-${sectionName}`;
    
    if (expandedSectionKey === key) {
      setExpandedSectionKey(null); // Close it
      return;
    }

    if (!subjectId || !sectionId) {
       console.error("❌ Missing subjectId or sectionId in the DTO! Cannot fetch sessions.");
       alert("Developer Error: Backend must provide subjectId and sectionId in TeacherAnalyticsDto.");
       return;
    }

    setExpandedSectionKey(key);
    setExpandedSessionId(null); 
    setSessions([]);
    setIsLoadingSessions(true);

    try {
      const token = localStorage.getItem('clutch_token');
      const teacherId = localStorage.getItem('clutch_userId');
      
      const res = await axios.get(
        `/api/v1/attendance/teacher/${teacherId}/subject/${subjectId}/section/${sectionId}/sessions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessions(res.data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

 
  const handleSessionClick = async (sessionId, e) => {
    e.stopPropagation(); 
    
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
      return;
    }

    setExpandedSessionId(sessionId);
    setSessionRecords([]);
    setIsLoadingRecords(true);

    try {
      const token = localStorage.getItem('clutch_token');
      const res = await axios.get(
        `/api/v1/attendance/session/${sessionId}/records`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessionRecords(res.data);
    } catch (error) {
      console.error("Error fetching session records:", error);
    } finally {
      setIsLoadingRecords(false);
    }
  };


  if (isLoading) return <div className="text-center p-12 text-slate-500 font-medium">Crunching analytics data...</div>;
  if (!analytics) return <div className="text-center p-12 text-slate-500 font-medium">Failed to load analytics.</div>;

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
        <div className="lg:col-span-2 bg-surface rounded-2xl shadow-soft border border-slate-100 overflow-hidden h-fit">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Users size={20} className="text-slate-600" />
               <h3 className="text-lg font-bold text-slate-800">Section Health Breakdown</h3>
            </div>
            <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">Click to expand</span>
          </div>
          
          {/* Changed to flex-col to allow accordions to expand smoothly */}
          <div className="p-6 flex flex-col gap-4">
            {analytics.sectionHealthList.length === 0 ? (
               <p className="text-slate-500 text-sm">No section data available.</p>
            ) : (
               analytics.sectionHealthList.map((section, idx) => {
                 // Determine if this specific card is the one clicked
                 const sectionKey = (section.subjectId && section.sectionId) ? `${section.subjectId}-${section.sectionId}` : `${section.subjectName}-${section.sectionName}`;
                 const isSectionExpanded = expandedSectionKey === sectionKey;

                 return (
                  <div 
                    key={idx} 
                    onClick={() => handleSectionClick(section.subjectId, section.sectionId, section.subjectName, section.sectionName)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${isSectionExpanded ? 'border-clutch-300 bg-white shadow-md' : 'border-slate-100 bg-slate-50 hover:border-slate-300'}`}
                  >
                    {/* TOP SUMMARY ROW */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
                      <div>
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                          {section.subjectName}
                          {isSectionExpanded ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
                        </h4>
                        <p className="text-sm text-slate-500">{section.sectionName}</p>
                      </div>
                      <div className="flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto mt-2 sm:mt-0">
                        <span className="text-xs font-semibold text-slate-400">{section.totalClassesHeld} classes</span>
                        <span className={`text-xl font-black ${section.averageAttendancePercentage >= 75 ? 'text-green-600' : 'text-orange-500'}`}>
                          {section.averageAttendancePercentage}%
                        </span>
                      </div>
                    </div>

                    
                    {isSectionExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <h5 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <Calendar size={16} className="text-clutch-500"/> Past Sessions
                        </h5>
                        
                        {isLoadingSessions ? (
                           <p className="text-xs text-slate-500">Loading sessions...</p>
                        ) : sessions.length === 0 ? (
                           <p className="text-xs text-slate-400 italic">No historical sessions found.</p>
                        ) : (
                           <div className="flex flex-col gap-2">
                             {sessions.map(session => {
                               const isSessionExpanded = expandedSessionId === session.id;
                               
                               return (
                                 <div key={session.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                   
                                   {/* SESSION ROW (Click to reveal students) */}
                                   <div 
                                     className="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                                     onClick={(e) => handleSessionClick(session.id, e)}
                                   >
                                     <span className="text-sm font-bold text-slate-700">{session.sessionDate}</span>
                                     <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 bg-white px-2 py-1 border border-slate-200 rounded-md">View details</span>
                                        {isSessionExpanded ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
                                     </div>
                                   </div>

                                   
                                   {isSessionExpanded && (
                                     <div className="p-3 bg-white border-t border-slate-100">
                                       {isLoadingRecords ? (
                                         <p className="text-xs text-slate-500">Loading student attendance...</p>
                                       ) : sessionRecords.length === 0 ? (
                                         <p className="text-xs text-slate-400 italic">No records for this day.</p>
                                       ) : (
                                         <div className="max-h-48 overflow-y-auto">
                                            <ul className="text-sm divide-y divide-slate-100">
                                              {sessionRecords.map((record, i) => (
                                                <li key={i} className="py-2 flex justify-between items-center">
                                                  <span className="font-bold text-sm text-slate-700">{record.studentName}</span>
                                                  {record.status === 'PRESENT' ? (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md"><CheckCircle size={14}/> Present</span>
                                                  ) : (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md"><XCircle size={14}/> Absent</span>
                                                  )}
                                                </li>
                                              ))}
                                            </ul>
                                         </div>
                                       )}
                                     </div>
                                   )}
                                 </div>
                               );
                             })}
                           </div>
                        )}
                      </div>
                    )}
                  </div>
                );
               })
            )}
          </div>
        </div>

        {/* 3. The Danger Zone Hitlist (Right Side) */}
        <div className="bg-surface rounded-2xl shadow-soft border border-red-100 overflow-hidden h-fit">
          <div className="p-6 border-b border-red-100 bg-red-50 flex items-center gap-2">
            <AlertOctagon size={20} className="text-red-600" />
            <h3 className="text-lg font-bold text-red-700">At-Risk Students (&lt;75%)</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {analytics.atRiskStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-medium">
                No students are currently at risk. Great job!
              </div>
            ) : (
              analytics.atRiskStudents.map((student, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800">{student.studentName || 'Unknown Student'}</h4>
                    <p className="text-xs font-semibold text-slate-500">{student.rollNumber || 'N/A'}</p>
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