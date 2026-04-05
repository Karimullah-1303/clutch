import React from 'react';
import { Clock, MapPin, CheckCircle, Lock, CalendarClock, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ScheduleCard({ 
  blockId, 
  subject, 
  section, 
  time, 
  isCompleted, 
  sectionId, 
  currentDate, 
  buttonConfig,
  subjectCode, 
  syllabusProgress, 
  onOpenLessonPlan 
}) {
  const navigate = useNavigate();

  const handleAttendance = () => {
    if (buttonConfig.disabled) return;
    if (buttonConfig.state === 'submitted') {
      navigate(`/attendance/${blockId}`, { state: { sectionId, savedDate: currentDate, isEditMode: true } });
    } else {
      navigate(`/attendance/${blockId}`, { state: { sectionId, savedDate: currentDate } });
    }
  };

  return (
    <div className="bg-surface p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-soft transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
      
      {/* Class Details Section */}
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center justify-center min-w-[90px] border-r border-slate-100 pr-4">
          <Clock size={18} className="text-clutch-500 mb-1" />
          <span className="text-sm font-bold text-clutch-900">{time}</span>
        </div>
        
        <div>
          <h4 className="text-lg font-bold text-slate-800">{subject}</h4>
          <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span className="font-medium">{section}</span>
            </div>
            {/*  THE UPDATED DYNAMIC PROGRESS INDICATOR */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border transition-colors ${syllabusProgress > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
              <BookOpen size={12} />
              <span>Syllabus: {syllabusProgress !== undefined ? `${syllabusProgress}%` : '--'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Area: Split Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <button 
          onClick={() => onOpenLessonPlan(blockId, subjectCode, subject, section)}
          className="flex items-center justify-center gap-2 px-4 py-2 font-bold rounded-lg transition-colors bg-white text-clutch-600 border border-slate-200 hover:bg-slate-50 hover:border-clutch-200"
        >
          <BookOpen size={18} />
          <span>Lesson Plan</span>
        </button>

        <button 
          disabled={buttonConfig.disabled}
          onClick={handleAttendance}
          className={`flex items-center justify-center gap-2 px-4 py-2 font-bold rounded-lg transition-colors ${buttonConfig.colorClass}`}
        >
          {buttonConfig.state === 'submitted' && <CheckCircle size={18} />}
          {buttonConfig.state === 'locked' && <Lock size={18} />}
          {buttonConfig.state === 'late' && <CalendarClock size={18} />}
          <span>{buttonConfig.text}</span>
        </button>
      </div>
    </div>
  );
}