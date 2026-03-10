import React from 'react';

/**
 * AttendanceToggle Component
 * A custom, animated switch used in the Teacher roster view.
 * Exclusively handles boolean state (Present vs. Absent).
 */
export default function AttendanceToggle({ isPresent, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none ${
        isPresent ? 'bg-clutch-800' : 'bg-slate-200'
      }`}
    >
      {/* The sliding "thumb" of the toggle */}
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
          isPresent ? 'translate-x-9' : 'translate-x-1'
        }`}
      />
      
      {/* Embedded text label for accessibility and high visibility */}
      <span className={`absolute text-[10px] font-bold ${isPresent ? 'left-2 text-white' : 'right-2 text-slate-500'}`}>
        {isPresent ? 'IN' : 'OUT'}
      </span>
    </button>
  );
}