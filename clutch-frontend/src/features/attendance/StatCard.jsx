import React from 'react';

/**
 * StatCard Component (Atomic UI - Molecule)
 * A generic, highly reusable widget for displaying key performance indicators (KPIs).
 * Used across the dashboard to display metrics like "Pending Tasks" or "Avg Class Health".
 */
export default function StatCard({ title, value, subtitle, icon: Icon, colorClass }) {
  return (
    <div className="bg-surface p-6 rounded-2xl shadow-soft border border-slate-100 flex items-start justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-extrabold text-clutch-900 mt-2">{value}</h3>
        {subtitle && <p className="text-sm font-medium mt-1 text-slate-400">{subtitle}</p>}
      </div>
      
      {/* Dynamic Icon Styling */}
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
  );
}