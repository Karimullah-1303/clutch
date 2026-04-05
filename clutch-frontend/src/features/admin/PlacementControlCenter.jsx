import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, Users, Plus, Power, ArrowLeft, FileText, Github, ChevronDown } from 'lucide-react';

export default function PlacementControlCenter() {
  const [jobs, setJobs] = useState([]);
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'create', 'applicants'
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FORM STATE --- (Includes the critical applicationDeadline fix)
  const [formData, setFormData] = useState({ 
    companyName: '', 
    jobRole: '', 
    description: '', 
    ctc: '', 
    minCgpa: '',
    applicationDeadline: '' 
  });

  useEffect(() => {
    if (viewMode === 'dashboard') fetchJobs();
  }, [viewMode]);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/v1/placement/admin/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      // Create a payload copy and append the End-Of-Day time for Java's LocalDateTime
      const payload = {
        ...formData,
        applicationDeadline: formData.applicationDeadline + "T23:59:59"
      };

      // Send the modified payload instead of raw formData
      await axios.post('/api/v1/placement/admin/jobs', payload);
      
      alert("✅ Campus Drive Created!");
      setFormData({ companyName: '', jobRole: '', description: '', ctc: '', minCgpa: '', applicationDeadline: '' });
      setViewMode('dashboard');
    } catch (error) {
      console.error(error);
      alert("❌ Failed to create job.");
    }
  };

  const handleToggleJob = async (jobId) => {
    try {
      await axios.put(`/api/v1/placement/admin/jobs/${jobId}/toggle`);
      fetchJobs(); // Refresh list to show updated status
    } catch (error) {
      console.error("Error toggling job:", error);
    }
  };

  const handleViewApplicants = async (job) => {
    setSelectedJob(job);
    setViewMode('applicants');
    try {
      const response = await axios.get(`/api/v1/placement/admin/jobs/${job.id}/applicants`);
      console.log("👀 APPLICANT JSON:", response.data);
      setApplicants(response.data);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await axios.put(`/api/v1/placement/admin/applications/${appId}/status?status=${newStatus}`);
      // Refresh applicants locally to show immediate color change
      setApplicants(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* HEADER ROW */}
      <div className="flex justify-between items-end bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Placement Control Center</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage recruiting drives and applicant tracking.</p>
        </div>
        {viewMode !== 'dashboard' && (
          <button 
            onClick={() => setViewMode('dashboard')}
            className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
        )}
      </div>

      {/* --- VIEW 1: DASHBOARD (List of all jobs) --- */}
      {viewMode === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* THE GIANT "ADD DRIVE" CARD */}
          <div 
            onClick={() => setViewMode('create')} 
            className="p-6 rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-blue-400 cursor-pointer flex flex-col items-center justify-center min-h-[220px] transition-all group shadow-sm hover:shadow-md"
          >
             <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 group-hover:bg-blue-50 transition-transform duration-300">
               <Plus size={36} className="text-blue-600" />
             </div>
             <h3 className="mt-4 font-black text-lg text-slate-700 group-hover:text-blue-700">Post New Drive</h3>
             <p className="text-xs font-medium text-slate-400 mt-1">Open applications for a new company</p>
          </div>

          {isLoading ? (
             <div className="col-span-2 text-center p-8 text-slate-500 font-medium">Loading active drives...</div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className={`p-6 rounded-3xl shadow-sm border transition-all flex flex-col justify-between min-h-[220px] ${job.isActive ? 'border-blue-200 bg-white hover:shadow-md' : 'border-slate-200 bg-slate-50 opacity-80'}`}>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">{job.companyName}</h3>
                      <p className="text-sm font-bold text-blue-600 mt-0.5">{job.jobRole}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-lg ${job.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                      {job.isActive ? 'Active' : 'Closed'}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 mb-6 text-sm text-slate-600 font-medium">
                    <p className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-400">Package</span> 
                      <span className="font-bold text-slate-800">{job.ctc} LPA</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Eligibility</span> 
                      <span className="font-bold text-slate-800">{job.minCgpa} CGPA</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleViewApplicants(job)}
                    className="flex-1 flex justify-center items-center gap-2 bg-slate-100 text-slate-700 px-3 py-2.5 rounded-xl text-sm font-black hover:bg-slate-200 transition-colors"
                  >
                    <Users size={18} /> Review Apps
                  </button>
                  <button 
                    onClick={() => handleToggleJob(job.id)}
                    className={`flex justify-center items-center p-2.5 rounded-xl transition-colors ${job.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                    title={job.isActive ? "Close Drive" : "Re-open Drive"}
                  >
                    <Power size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- VIEW 2: CREATE JOB FORM --- */}
      {viewMode === 'create' && (
        <form onSubmit={handleCreateJob} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 max-w-2xl mx-auto">
          <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <Briefcase size={24} className="text-blue-600"/> Post New Campus Drive
          </h3>
          <div className="grid grid-cols-2 gap-5 mb-6">
            <input type="text" placeholder="Company Name (e.g., Google)" required className="col-span-2 md:col-span-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
            
            <input type="text" placeholder="Job Role (e.g., SDE-1)" required className="col-span-2 md:col-span-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.jobRole} onChange={e => setFormData({...formData, jobRole: e.target.value})} />
            
            <input type="number" placeholder="CTC in LPA (e.g., 12)" required className="col-span-2 md:col-span-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.ctc} onChange={e => setFormData({...formData, ctc: e.target.value})} />
            
            <input type="number" step="0.1" placeholder="Min CGPA cutoff" required className="col-span-2 md:col-span-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.minCgpa} onChange={e => setFormData({...formData, minCgpa: e.target.value})} />
            
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-500 mb-1 ml-1">Application Deadline</label>
              <input type="date" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700" value={formData.applicationDeadline} onChange={e => setFormData({...formData, applicationDeadline: e.target.value})} />
            </div>

            <textarea placeholder="Job Description & Requirements..." required rows="4" className="col-span-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          
          <button type="submit" className="w-full bg-slate-900 text-white font-black text-lg py-4 rounded-xl hover:bg-black transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
            <Plus size={24}/> Launch Drive Now
          </button>
        </form>
      )}

      {/* --- VIEW 3: APPLICANTS ATS TABLE --- */}
      {viewMode === 'applicants' && selectedJob && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-slate-800">Applicants: {selectedJob.companyName}</h3>
              <p className="text-sm font-bold text-slate-500 mt-1">{selectedJob.jobRole} • <span className="text-blue-600">{applicants.length} Total Candidates</span></p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-5 font-black">Candidate Profile</th>
                  <th className="p-5 font-black">Portfolio Links</th>
                  <th className="p-5 font-black text-center">ATS Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applicants.length === 0 ? (
                  <tr><td colSpan="3" className="p-12 text-center text-slate-500 font-medium text-lg">No students have applied yet.</td></tr>
                ) : (
                  applicants.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors group">
                      
                      <td className="p-5">
                        <div className="flex flex-col gap-1.5">
                          
                          <span className="font-black text-slate-900 text-lg group-hover:text-blue-700 transition-colors">
                            {app.studentProfile?.rollNumber ? `Roll No: ${app.studentProfile.rollNumber}` : 'Unknown Candidate'}
                          </span>
                          <div className="flex gap-2 text-xs font-black">
                            <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
                              CGPA: {app.studentProfile?.cgpa || 'N/A'}
                            </span>
                            
                            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">
                              Dept: CSE
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          {app.studentProfile?.resumePdfUrl ? (
                            <a href={app.studentProfile.resumePdfUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-100 hover:shadow-sm transition-all border border-blue-100">
                              <FileText size={16} /> Resume
                            </a>
                          ) : (
                            <span className="flex items-center gap-1.5 bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-sm font-bold">
                              <FileText size={16} /> No Resume
                            </span>
                          )}
                          
                          {app.studentProfile?.githubUrl ? (
                            <a href={app.studentProfile.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black hover:shadow-sm transition-all">
                              <Github size={16} /> GitHub
                            </a>
                          ) : (
                            <span className="flex items-center gap-1.5 bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-sm font-bold">
                              <Github size={16} /> No GitHub
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-5 text-center align-middle">
                        <div className="relative inline-block w-full max-w-[160px] mx-auto">
                          <select 
                            value={app.status} 
                            onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                            className={`w-full appearance-none font-black text-sm px-4 py-2.5 rounded-xl border-2 focus:outline-none focus:ring-4 transition-all cursor-pointer ${
                              app.status === 'SELECTED' ? 'bg-green-50 text-green-700 border-green-200 focus:ring-green-100' :
                              app.status === 'SHORTLISTED' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 focus:ring-yellow-100' :
                              app.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200 focus:ring-red-100' :
                              'bg-slate-50 text-slate-600 border-slate-200 focus:ring-slate-100'
                            }`}
                          >
                            <option value="APPLIED">Under Review</option>
                            <option value="SHORTLISTED">Shortlist</option>
                            <option value="SELECTED">Select Offer</option>
                            <option value="REJECTED">Reject</option>
                          </select>
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <ChevronDown size={16} className={`
                              ${app.status === 'SELECTED' ? 'text-green-600' : 
                                app.status === 'SHORTLISTED' ? 'text-yellow-600' : 
                                app.status === 'REJECTED' ? 'text-red-600' : 'text-slate-400'}
                            `} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}