import React from 'react';

/**
 * InputField Component (Atomic UI)
 * A highly reusable, generic text input. Ensures design consistency 
 * across the entire application (Auth, Admin, Teacher features).
 */
export default function InputField({ label, type, name, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-sm font-semibold text-slate-600">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-clutch-500 bg-surface transition-all text-slate-800 placeholder-slate-400"
        required
      />
    </div>
  );
}