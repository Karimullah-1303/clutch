import React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';

/**
 * SubjectStatsTable Component
 * Renders a comprehensive list view of a student's attendance across all enrolled subjects.
 * Translates the backend's Clutch Math into highly visible, color-coded status badges.
 */
export default function SubjectStatsTable({ subjects }) {
  return (
    <div className="bg-surface rounded-2xl shadow-soft border border-slate-100 overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h3 className="text-xl font-bold text-slate-800">Detailed Subject Breakdown</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold text-slate-500">Subject</th>
              <th className="p-4 font-semibold text-slate-500">Attendance</th>
              <th className="p-4 font-semibold text-slate-500">Percentage</th>
              <th className="p-4 font-semibold text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub, index) => {
              let badgeClass = "";
              let statusText = "";
              let Icon = ShieldCheck;

              // Map our backend DTO exactly to our Tailwind CSS colors and icons
              if (sub.status === "SAFE") {
                badgeClass = "bg-green-100 text-green-700 border-green-200";
                statusText = `Safe to skip ${sub.classesYouCanMiss}`;
                Icon = ShieldCheck;
              } else if (sub.status === "WARNING") {
                badgeClass = "bg-orange-100 text-orange-700 border-orange-200";
                statusText = "Cannot skip next class";
                Icon = AlertCircle;
              } else {
                badgeClass = "bg-red-100 text-red-700 border-red-200";
                statusText = `Must attend next ${sub.classesNeededToRecover}`;
                Icon = AlertTriangle;
              }

              return (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0">
                  <td className="p-4 font-bold text-slate-800">{sub.subjectName}</td>
                  
                  <td className="p-4 text-slate-600 font-medium">
                    {sub.totalAttended} / {sub.totalHeld}
                  </td>
                  
                  <td className="p-4">
                    <span className={`font-extrabold ${sub.status === 'DANGER' ? 'text-red-600' : 'text-slate-800'}`}>
                      {sub.currentPercentage}%
                    </span>
                  </td>
                  
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-bold shadow-sm ${badgeClass}`}>
                      <Icon size={16} />
                      {statusText}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}