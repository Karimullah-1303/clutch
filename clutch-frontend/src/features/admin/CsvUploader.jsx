import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import PrimaryButton from "../../shared/components/PrimaryButton";

/**
 * CsvUploader Component
 * A highly reusable, dynamic file upload card.
 * Acts as an API gateway by accepting a target `port` and `endpoint` via props, 
 * allowing the Admin Dashboard to route different CSV payloads to different microservices.
 */
export default function CsvUploader({ title, endpoint, port, description }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // State machine: idle, loading, success, error
  const [message, setMessage] = useState('');

  /**
   * Captures the file from the DOM input and resets the status machine.
   */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  /**
   * Packages the CSV as a multipart/form-data payload and executes the upload.
   */
  const handleUpload = async () => {
    if (!file) return;
    setStatus('loading');
    
    // Required to send binary files over HTTP
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('clutch_token');
      await axios.post(`http://localhost:${port}${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setStatus('success');
      setMessage(`${file.name} uploaded successfully!`);
      setFile(null); // Clear file to prevent duplicate submissions
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Upload failed. Please check the CSV format.');
    }
  };

  return (
    <div className="bg-surface p-6 rounded-2xl shadow-soft border border-slate-100 flex flex-col items-center text-center">
      <div className="bg-clutch-50 p-3 rounded-full mb-4 text-clutch-600">
        <UploadCloud size={24} />
      </div>
      <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
      <p className="text-slate-500 text-sm mt-1 mb-6">{description}</p>

      {/* File Selection Input */}
      <input 
        type="file" 
        accept=".csv" 
        onChange={handleFileChange}
        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-clutch-50 file:text-clutch-700 hover:file:bg-clutch-100 mb-4 cursor-pointer transition-colors"
      />

      {/* Dynamic Status Feedback */}
      {status === 'success' && <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-4"><CheckCircle size={16} /> {message}</div>}
      {status === 'error' && <div className="flex items-center gap-2 text-red-500 text-sm font-medium mb-4"><AlertCircle size={16} /> {message}</div>}

      {/* Action Button */}
      <PrimaryButton 
        text={status === 'loading' ? 'Uploading...' : 'Upload Data'} 
        onClick={handleUpload} 
        isLoading={status === 'loading'}
        disabled={!file}
      />
    </div>
  );
}