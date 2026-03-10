import React from 'react';

/**
 * AttendanceRing Component
 * Renders a circular progress indicator using pure SVG math.
 * Visually communicates the student's aggregate attendance health.
 */
export default function AttendanceRing({ percentage }) {
  // --- SVG Math Fundamentals ---
  const radius = 60;
  const circumference = 2 * Math.PI * radius; // The total length of the circle's path
  
  // Calculate the "empty" space on the dash array to visually represent the missing percentage
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isSafe = percentage >= 75;
  const colorClass = isSafe ? 'text-green-500' : 'text-red-500';

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      {/* Rotate the SVG so the progress bar starts exactly at the top (12 o'clock) */}
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background Track */}
        <circle cx="96" cy="96" r={radius} className="stroke-slate-100" strokeWidth="12" fill="transparent" />
        
        {/* Dynamic Colored Fill */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          className={`stroke-current ${colorClass} transition-all duration-1000 ease-in-out`}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Centered Overlay Text */}
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-extrabold text-clutch-900">{percentage}%</span>
        <span className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-1">Attendance</span>
      </div>
    </div>
  );
}