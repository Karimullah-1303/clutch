import React from 'react';
import { Clock, MapPin, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * ScheduleCard Component
 * Represents a single class block in the teacher's daily operational view.
 * Handles the critical routing logic, passing the required context (sectionId, date, edit mode)
 * to the MarkAttendance screen via the React Router state payload.
 */
export default function ScheduleCard({ blockId, subject, section, time, isCompleted, sectionId, currentDate }) {
  const navigate = useNavigate();

  return (
    <div className="bg-surface p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-soft transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
      
      {/* Class Details Section */}
      <div className="flex items-start gap-4">
        
        {/* Time Pillar */}
        <div className="flex flex-col items-center justify-center min-w-[100px] border-r border-slate-100 pr-4">
          <Clock size={18} className="text-clutch-500 mb-1" />
          <span className="text-sm font-bold text-clutch-900">{time}</span>
        </div>
        
        {/* Course Info */}
        <div>
          <h4 className="text-lg font-bold text-slate-800">{subject}</h4>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <MapPin size={14} />
            <span>{section}</span>
          </div>
        </div>
      </div>

      {/* Action Area & Routing Logic */}
      <div>
        {isCompleted ? (
          <button 
            // Routes to the attendance page AND triggers the "Edit Mode" data hydration pipeline
            onClick={() => navigate(`/attendance/${blockId}`, { state: { sectionId, savedDate: currentDate, isEditMode: true } })}
            className="flex items-center justify-center w-full md:w-auto gap-2 text-green-700 font-bold bg-green-100 hover:bg-green-200 px-4 py-2 rounded-lg transition-colors border border-green-200"
          >
            <CheckCircle size={18} />
            <span>Submitted (Edit)</span>
          </button>
        ) : (
          <button 
            // Standard routing for a fresh attendance submission
            onClick={() => navigate(`/attendance/${blockId}`, { state: { sectionId, savedDate: currentDate } })}
            className="w-full md:w-auto bg-clutch-50 text-clutch-800 hover:bg-clutch-100 font-semibold py-2 px-6 rounded-lg transition-colors border border-clutch-200"
          >
            Take Attendance
          </button>
        )}
      </div>
    </div>
  );
}