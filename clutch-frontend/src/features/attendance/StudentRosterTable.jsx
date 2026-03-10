import React from 'react';
import AttendanceToggle from './AttendanceToggle';

/**
 * StudentRosterTable Component
 * Renders the tabular view of students for a specific class section.
 * Receives the hydrated student data and the boolean state dictionary from the parent component.
 */
export default function StudentRosterTable({ students, attendanceState, handleToggle }) {
  // Graceful fallback if data hasn't loaded or section is empty
  if (!students || students.length === 0) return null;

  return (
    <div className="bg-surface rounded-xl shadow-soft border border-slate-100 overflow-hidden mt-6">
      <table className="w-full text-left border-collapse">
        
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm uppercase tracking-wider">
            <th className="py-4 px-6 font-semibold">Roll Number</th>
            <th className="py-4 px-6 font-semibold">Student Name</th>
            <th className="py-4 px-6 font-semibold text-right">Status</th>
          </tr>
        </thead>
        
        <tbody className="divide-y divide-slate-100">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="py-4 px-6 text-slate-600 font-mono text-sm">{student.rollNumber}</td>
              <td className="py-4 px-6 font-medium text-clutch-900">{student.name}</td>
              <td className="py-4 px-6 text-right">
                
                {/* Maps the specific student's UUID to the parent's boolean state dictionary.
                  Triggers the parent's state update handler on click. 
                */}
                <AttendanceToggle 
                  isPresent={attendanceState[student.id]} 
                  onToggle={() => handleToggle(student.id)} 
                />
                
              </td>
            </tr>
          ))}
        </tbody>
        
      </table>
    </div>
  );
}