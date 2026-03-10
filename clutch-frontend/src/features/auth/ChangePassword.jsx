import React, { useState } from 'react';
import axios from 'axios';
import { X, Key, Lock, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * ChangePasswordModal Component
 * A secure, self-contained modal for user credential updates.
 * Implements local UI validation before delegating the actual cryptographic
 * verification and update to the Identity Service backend.
 */
export default function ChangePasswordModal({ isOpen, onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Early return if modal is not active to prevent unnecessary DOM rendering
  if (!isOpen) return null;

  /**
   * Handles the password change submission pipeline.
   * Includes pre-flight checks to reduce unnecessary API calls.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- Pre-flight UI Validation ---
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem('clutch_token');

    try {
      // --- API Execution ---
      // Cross-origin request to the Identity Service (Port 8081)
      await axios.put('http://localhost:8081/api/v1/auth/change-password', {
        oldPassword: oldPassword,
        newPassword: newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("Password changed successfully!");
      
      // Clear sensitive state immediately upon success
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Graceful auto-close UX
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);

    } catch (err) {
      console.error("Failed to change password:", err);
      // Surface authoritative errors from the backend (e.g., "Old password incorrect")
      setError(err.response?.data?.message || "Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clears all state securely when the user closes the modal manually.
   */
  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="bg-surface border-b border-slate-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-clutch-900 font-bold">
            <Key size={18} className="text-clutch-600" />
            <h2>Change Password</h2>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Dynamic Alert Banners */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg flex items-center gap-2 border border-red-100">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm font-medium rounded-lg flex items-center gap-2 border border-green-100">
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Old Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-clutch-500 focus:bg-white transition-colors"
                  placeholder="Enter current password"
                  required
                />
              </div>
            </div>

            <div className="border-t border-slate-100 my-2"></div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-clutch-500 focus:bg-white transition-colors"
                  placeholder="Create new password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-clutch-500 focus:bg-white transition-colors"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-2 w-full bg-clutch-800 hover:bg-clutch-900 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}