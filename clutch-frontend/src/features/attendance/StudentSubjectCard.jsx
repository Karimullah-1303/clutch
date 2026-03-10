import React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';

/**
 * StudentSubjectCard Component
 * Displays attendance metrics for a single subject in a card format.
 * Dynamically applies color-coded styling (Green/Orange/Red) based on the 
 * student's attendance health status calculated by the backend.
 */
export default function StudentSubjectCard({ subjectName, stats }) {
  // Destructure the exact keys provided by the Spring Boot StudentSubjectStatDto
  const { totalHeld, totalAttended, currentPercentage, status, classesYouCanMiss, classesNeededToRecover } = stats;

  // --- Dynamic UI State Machine ---
  let cardStyle = "";
  let badgeStyle = "";
  let StatusIcon = ShieldCheck;
  let statusMessage = "";

  if (status === "SAFE") {
    cardStyle = "border-green-200 shadow-green-100/50 hover:shadow-green-100";
    badgeStyle = "bg-green-100 text-green-700";
    StatusIcon = ShieldCheck;
    statusMessage = `Safe to skip: ${classesYouCanMiss} classes`;
  } else if (status === "WARNING") {
    cardStyle = "border-orange-200 shadow-orange-100/50 hover:shadow-orange-100";
    badgeStyle = "bg-orange-100 text-orange-700";
    StatusIcon = AlertCircle;
    statusMessage = "Warning: Cannot skip the next class!";
  } else {
    // DANGER ZONE (< 75%)
    cardStyle = "border-red-200 shadow-red-100/50 hover:shadow-red-100";
    badgeStyle = "bg-red-100 text-red-700";
    StatusIcon = AlertTriangle;
    statusMessage = `Danger: Must attend next ${classesNeededToRecover} classes`;
  }

  return (
    <div className={`bg-white p-6 rounded-2xl border transition-shadow ${cardStyle}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">{subjectName}</h3>
          <p className="text-slate-500 text-sm mt-1">
            Attended {totalAttended} out of {totalHeld} classes
          </p>
        </div>
        
        {/* Big Percentage Display */}
        <div className={`text-2xl font-black ${status === 'DANGER' ? 'text-red-600' : 'text-clutch-900'}`}>
          {currentPercentage}%
        </div>
      </div>

      {/* Dynamic Status Badge */}
      <div className={`flex items-center gap-2 p-3 rounded-lg font-bold text-sm ${badgeStyle}`}>
        <StatusIcon size={20} />
        <span>{statusMessage}</span>
      </div>
    </div>
  );
}