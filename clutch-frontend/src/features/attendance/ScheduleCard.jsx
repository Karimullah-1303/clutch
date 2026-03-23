import React from 'react';
import { Clock, MapPin, CheckCircle, Lock, CalendarClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * ScheduleCard Component
 * Represents a single class block in the teacher's daily operational view.
 * Now powered by the Time Engine (buttonConfig) to handle Past, Present, and Future states.
 */
export default function ScheduleCard({ blockId, subject, section, time, isCompleted, sectionId, currentDate, buttonConfig }) {
  const navigate = useNavigate();

  // Smart routing logic based on the Time Engine state
  const handleNavigation = () => {
    // Failsafe: If the button is disabled (Future or Locked), do nothing
    if (buttonConfig.disabled) return;

    if (buttonConfig.state === 'submitted') {
      // Trigger Edit Mode data hydration pipeline
      navigate(`/attendance/${blockId}`, { state: { sectionId, savedDate: currentDate, isEditMode: true } });
    } else {
      // Standard routing for a fresh submission (Today or Late)
      navigate(`/attendance/${blockId}`, { state: { sectionId, savedDate: currentDate } });
    }
  };

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
        <button 
          disabled={buttonConfig.disabled}
          onClick={handleNavigation}
          className={`flex items-center justify-center w-full md:w-auto gap-2 px-4 py-2 font-bold rounded-lg transition-colors ${buttonConfig.colorClass}`}
        >
          {/* Render dynamic icons based on the Time Engine state */}
          {buttonConfig.state === 'submitted' && <CheckCircle size={18} />}
          {buttonConfig.state === 'locked' && <Lock size={18} />}
          {buttonConfig.state === 'late' && <CalendarClock size={18} />}
          
          <span>{buttonConfig.text}</span>
        </button>
      </div>
    </div>
  );
}