import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Rocket, Building, DollarSign, Award, CheckCircle, Clock, XCircle, Star } from 'lucide-react';
import PrimaryButton from '../../shared/components/PrimaryButton';

export default function StudentJobBoard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]); // 🚨 NEW: Stores your application history!
  const [applyingTo, setApplyingTo] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  const studentId = localStorage.getItem('clutch_userId');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch both active jobs AND your personal application history at the same time
      const [jobsRes, appsRes] = await Promise.all([
        axios.get('/api/v1/placement/student/jobs'),
        axios.get(`/api/v1/placement/student/${studentId}/applications`)
      ]);
      
      setJobs(jobsRes.data);
      setApplications(appsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (job) => {
    setApplyingTo(job.id);
    try {
      const response = await axios.post(`/api/v1/placement/student/jobs/${job.id}/apply/${studentId}`);
      alert(`✅ ${response.data}`);
      fetchData(); // 🚨 NEW: Instantly refresh the data so the button turns into a status badge!
    } catch (error) {
      alert(`❌ ${error.response?.data || "Application failed."}`);
    } finally {
      setApplyingTo(null);
    }
  };

  // Helper function to find out if the student applied to a specific job
  const getMyApplication = (jobId) => {
    return applications.find(app => app.jobPosting.id === jobId);
  };

  // Helper to render the beautiful status badge
  const renderStatusBadge = (status) => {
    switch(status) {
      case 'APPLIED':
        return <div className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-50 text-blue-700 rounded-lg font-bold border border-blue-200"><Clock size={18}/> Application Under Review</div>;
      case 'SHORTLISTED':
        return <div className="flex items-center justify-center gap-2 w-full py-2.5 bg-yellow-50 text-yellow-700 rounded-lg font-bold border border-yellow-200"><Star size={18}/> You are Shortlisted!</div>;
      case 'SELECTED':
        return <div className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-50 text-green-700 rounded-lg font-bold border border-green-200"><CheckCircle size={18}/> Offer Selected!</div>;
      case 'REJECTED':
        return <div className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-50 text-red-700 rounded-lg font-bold border border-red-200"><XCircle size={18}/> Not Selected</div>;
      default:
        return null;
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Campus Drives...</div>;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      
      <div className="mb-8 flex items-center gap-4">
        <div className="bg-clutch-100 p-3.5 rounded-2xl text-clutch-600 shadow-sm border border-clutch-200">
          <Rocket size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campus Drives</h1>
          <p className="text-slate-500 mt-1">Review active opportunities and track your application status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.length === 0 ? (
          <div className="col-span-full bg-surface p-12 text-center rounded-2xl border border-slate-100 shadow-soft">
            <Rocket size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Active Drives</h3>
            <p className="text-slate-500">There are no companies recruiting at the moment. Check back later!</p>
          </div>
        ) : (
          jobs.map((job) => {
            const myApp = getMyApplication(job.id); // Check if we applied!

            return (
              <div key={job.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-md transition-shadow">
                
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                    <Building size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{job.companyName}</h3>
                    <p className="text-clutch-600 font-bold">{job.jobRole}</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-sm mb-6 flex-grow">{job.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <DollarSign size={16} className="text-green-600"/> {job.ctc} LPA
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Award size={16} className="text-purple-600"/> Min CGPA: {job.minCgpa}
                  </div>
                </div>

                {/* 🚨 THE MAGIC: If applied, show the status badge. If not, show the Apply button! */}
                {myApp ? (
                  renderStatusBadge(myApp.status)
                ) : (
                  <PrimaryButton 
                    text={applyingTo === job.id ? "Applying..." : "Apply Now"} 
                    onClick={() => handleApply(job)}
                    isLoading={applyingTo === job.id}
                    disabled={!job.isActive}
                  />
                )}

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}