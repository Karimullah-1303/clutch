import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function DateSelector({ selectedDate, setSelectedDate }) {
  const addDays = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isToday = () => {
    const today = new Date();
    return selectedDate.getDate() === today.getDate() &&
           selectedDate.getMonth() === today.getMonth() &&
           selectedDate.getFullYear() === today.getFullYear();
  };

  const formattedDate = selectedDate.toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  // Helper to correctly format local date for the input
  const getInputValue = () => {
    const offset = selectedDate.getTimezoneOffset()
    const myDate = new Date(selectedDate.getTime() - (offset*60*1000))
    return myDate.toISOString().split('T')[0]
  }

  return (
    <div className="flex items-center justify-between bg-surface p-2 rounded-xl border border-slate-200 shadow-sm mb-6">
      <button onClick={() => addDays(-1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
        <ChevronLeft size={20} />
      </button>

      <div className="flex items-center gap-3">
        {/* 🚨 THE MAGIC INVISIBLE NATIVE DATE PICKER 🚨 */}
        <div className="relative bg-clutch-50 p-2 rounded-lg text-clutch-600 hover:bg-clutch-100 transition-colors cursor-pointer overflow-hidden">
          <CalendarIcon size={18} />
          <input 
            type="date" 
            value={getInputValue()}
            onChange={(e) => {
              if (e.target.value) {
                // Parse safely to avoid timezone shifting
                const [y, m, d] = e.target.value.split('-');
                setSelectedDate(new Date(y, m - 1, d));
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-slate-800">{formattedDate}</span>
          {isToday() && <span className="text-[10px] font-bold text-clutch-600 uppercase tracking-wider">Today</span>}
        </div>
      </div>

      <button onClick={() => addDays(1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}