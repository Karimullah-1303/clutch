import React, { useState } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function SubjectStatsTable({ subjects }) {
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [sessionDetails, setSessionDetails] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const fetchDetails = async (subjectId) => {
    if (!subjectId) {
      console.error("❌ ERROR: subjectId is undefined!");
      return;
    }

    if (expandedSubject === subjectId) {
      setExpandedSubject(null); 
      return;
    }
    
    setExpandedSubject(subjectId);
    setIsLoadingDetails(true);
    setSessionDetails([]); 

    try {
      const studentId = localStorage.getItem('clutch_userId');
      const token = localStorage.getItem('clutch_token');
      
      const response = await axios.get(`/api/v1/attendance/student/${studentId}/subject/${subjectId}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSessionDetails(response.data);
    } catch (error) {
      console.error("❌ API Error fetching details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // 🚨 THE FIX: Perfectly mapped to the new Dynamic Margin Backend Math
  const getStatusUI = (sub) => {
    const status = sub.status || 'PENDING';
    
    switch(status) {
      case 'SAFE':
        return { 
          color: 'bg-green-100 text-green-700 border-green-200', 
          text: 'Safe', 
          subText: `Can Skip ${sub.classesYouCanMiss || 0}` 
        };
      case 'WARNING':
        return { 
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
          text: 'Warning', 
          subText: '0 Bunks Left' 
        };
      case 'DANGER':
        return { 
          color: 'bg-orange-100 text-orange-700 border-orange-200', 
          text: 'Danger', 
          subText: `Attend next ${sub.classesNeededToRecover || 0}` 
        };
      case 'CRITICAL':
        return { 
          color: 'bg-red-100 text-red-700 border-red-200', 
          text: 'Critical', 
          subText: `Attend next ${sub.classesNeededToRecover || 0}` 
        };
      case 'PENDING':
      default:
        return { 
          color: 'bg-slate-100 text-slate-600 border-slate-200', 
          text: 'No Classes', 
          subText: '---' 
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h3 className="text-xl font-bold text-slate-800">Subject Breakdown</h3>
        <p className="text-sm text-slate-500 mt-1">Click a subject to view your detailed day-by-day attendance records.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <th className="p-4 font-semibold">Subject</th>
              <th className="p-4 font-semibold text-center">Classes Attended</th>
              <th className="p-4 font-semibold text-center">Percentage</th>
              <th className="p-4 font-semibold text-center">Dynamic Margin</th>
              <th className="p-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub, index) => {
              const safeSubjectId = sub.subjectId || sub.id; 
              const isExpanded = expandedSubject === safeSubjectId;
              
              const statusUI = getStatusUI(sub);
              
              const pctColor = sub.status === 'SAFE' ? 'text-green-600' : 
                               sub.status === 'WARNING' ? 'text-yellow-600' : 
                               sub.status === 'DANGER' ? 'text-orange-600' : 
                               sub.status === 'CRITICAL' ? 'text-red-600' : 'text-slate-500';

              return (
                <React.Fragment key={safeSubjectId || index}>
                  <tr 
                    onClick={() => fetchDetails(safeSubjectId)}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-bold text-slate-800">{sub.subjectName || "Unknown Subject"}</td>
                    <td className="p-4 text-center font-medium text-slate-600">{sub.totalAttended} / {sub.totalHeld}</td>
                    <td className="p-4 text-center">
                      <span className={`font-bold ${pctColor}`}>{sub.currentPercentage || 0}%</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusUI.color}`}>
                          {statusUI.text}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-wider">
                          {statusUI.subText}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right text-slate-400">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </td>
                  </tr>

                  {/* THE DRILL-DOWN SECTION */}
                  {isExpanded && (
                    <tr className="bg-slate-50/50">
                      <td colSpan="5" className="p-0 border-b border-slate-200">
                        <div className="p-4 md:p-6 animate-fade-in">
                          <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <Calendar size={16}/> Session History
                          </h4>
                          {isLoadingDetails ? (
                            <div className="text-sm text-slate-500 font-bold text-clutch-600">Loading records from server...</div>
                          ) : sessionDetails.length === 0 ? (
                            <div className="text-sm text-slate-500 italic">No classes have been recorded yet.</div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {sessionDetails.map((session, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                  <div>
                                    <div className="text-sm font-bold text-slate-800">{session.date}</div>
                                    <div className="text-xs text-slate-500">{session.day}</div>
                                  </div>
                                  <div>
                                    {session.status === 'PRESENT' ? (
                                      <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100"><CheckCircle size={14}/> Present</span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100"><XCircle size={14}/> Absent</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}