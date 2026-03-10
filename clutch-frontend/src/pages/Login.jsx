import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import InputField from '../shared/components/InputField';
import PrimaryButton from '../shared/components/PrimaryButton';

/**
 * Login Component
 * Handles user authentication against the Identity Service.
 * Implements a "Two-Step Hydration" pattern:
 * 1. Authenticates credentials to receive a JWT.
 * 2. Uses the JWT to fetch the user's full profile (Role, Name) before routing.
 */
export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Updates local state dynamically based on the input field name.
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Executes the login pipeline.
   * Cross-origin requests are made to the Identity Service (Port 8081).
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Step 1: Request Authentication
      const response = await axios.post('http://localhost:8081/api/v1/auth/login', formData);
      
      // Handle slight variations in DTO responses
      const token = response.data.jwtToken || response.data.token;
      const userId = response.data.userId || response.data.id; 
      
      // Store core security credentials locally
      localStorage.setItem('clutch_token', token);
      localStorage.setItem('clutch_userId', userId); 

      // Step 2: Hydrate Profile Context
      // We immediately use the new token to fetch the user's authoritative role and name
      const profileRes = await axios.get('http://localhost:8081/api/v1/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Store display and routing context
      localStorage.setItem('clutch_userName', profileRes.data.name);
      localStorage.setItem('clutch_userRole', profileRes.data.role);
      
      // Step 3: Route to the Traffic Cop (DashboardRouter)
      navigate('/dashboard'); 
      
    } catch (err) {
      console.error(err);
      // Fallback error messaging if the backend doesn't provide a specific validation message
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-md p-8 rounded-2xl shadow-soft">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-clutch-900 tracking-tight">Clutch</h1>
          <p className="text-slate-500 mt-2 text-sm">Sign in to your university dashboard</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <InputField label="University Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="venkat.cse@andhrauniversity.edu.in" />
          <InputField label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
          <PrimaryButton text="Sign In" type="submit" isLoading={isLoading} />
        </form>
      </div>
    </div>
  );
}