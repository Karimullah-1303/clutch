import React from 'react';

/**
 * PrimaryButton Component (Atomic UI)
 * The main call-to-action button used globally.
 * Handles disabled states and loading feedback natively to prevent double-submissions.
 */
export default function PrimaryButton({ text, onClick, type = "button", isLoading = false, disabled = false }) {
  
  // Derives the final disabled state. Unclickable if loading OR explicitly disabled.
  const isDisabled = isLoading || disabled;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full font-semibold py-2.5 rounded-lg transition-colors shadow-sm mt-4 
        ${isDisabled 
          ? 'bg-slate-300 text-slate-500 cursor-not-allowed' // Inactive/Loading state
          : 'bg-clutch-800 hover:bg-clutch-900 text-white'    // Active state
        }`}
    >
      {isLoading ? 'Loading...' : text}
    </button>
  );
}