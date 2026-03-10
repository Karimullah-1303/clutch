import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

/**
 * DateSelector Component
 * Provides UI controls for navigating through the daily operational schedule.
 * Modifies the parent component's date state via Date object manipulation.
 */
export default function DateSelector({ selectedDate, setSelectedDate }) {
  
  /**
   * Adjusts the current selection by a specific number of days.
   * Creates a fresh Date instance to trigger React re-renders effectively.
   */
  const addDays = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  /**
   * Boolean check to determine if the currently selected date matches today's exact calendar date.
   */
  const isToday = () => {
    const today = new Date();
    return selectedDate.getDate() === today.getDate() &&
           selectedDate.getMonth() === today.getMonth() &&
           selectedDate.getFullYear() === today.getFullYear();
  };

  // Human-readable format (e.g., "Monday, March 9, 2026")
  const formattedDate = selectedDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="flex items-center justify-between bg-surface p-2 rounded-xl border border-slate-200 shadow-sm mb-6">
      
      {/* Navigate Past */}
      <button 
        onClick={() => addDays(-1)}
        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Date Display */}
      <div className="flex items-center gap-3">
        <div className="bg-clutch-50 p-2 rounded-lg text-clutch-600">
          <CalendarIcon size={18} />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-slate-800">{formattedDate}</span>
          {isToday() && <span className="text-[10px] font-bold text-clutch-600 uppercase tracking-wider">Today</span>}
        </div>
      </div>

      {/* Navigate Future */}
      <button 
        onClick={() => addDays(1)}
        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
      >
        <ChevronRight size={20} />
      </button>

    </div>
  );
}