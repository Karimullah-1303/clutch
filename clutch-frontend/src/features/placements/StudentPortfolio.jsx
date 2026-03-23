import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Github, Code, Globe, FileText, CheckCircle, Save } from 'lucide-react';
import PrimaryButton from '../../shared/components/PrimaryButton';

export default function StudentPortfolio() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    githubUrl: '',
    leetcodeUrl: '',
    portfolioUrl: '',
    resumePdfUrl: '',
    skillsString: '' // We will split this into an array before sending
  });

  const studentId = localStorage.getItem('clutch_userId');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`/api/v1/placement/portfolio/${studentId}`);
      setProfile(response.data);
      setFormData({
        githubUrl: response.data.githubUrl || '',
        leetcodeUrl: response.data.leetcodeUrl || '',
        portfolioUrl: response.data.portfolioUrl || '',
        resumePdfUrl: response.data.resumePdfUrl || '',
        skillsString: response.data.skills ? response.data.skills.join(', ') : ''
      });
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert comma-separated string back to array
      const skillsArray = formData.skillsString.split(',').map(s => s.trim()).filter(s => s !== '');
      
      const payload = {
        ...formData,
        skills: skillsArray
      };

      await axios.put(`/api/v1/placement/portfolio/${studentId}`, payload);
      alert('✅ Portfolio updated successfully!');
    } catch (error) {
      alert('❌ Failed to update portfolio.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading your placement profile...</div>;

  if (!profile) return (
    <div className="bg-red-50 p-6 rounded-2xl text-red-700 border border-red-200 text-center">
      <h2 className="text-lg font-bold">Profile Not Found</h2>
      <p>Your academic profile hasn't been initialized yet. Please wait for the Admin to upload the official CGPA records.</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Placement Portfolio</h1>
        <p className="text-slate-500 mt-1">Update your professional links to apply for campus drives.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
        
        {/* READ-ONLY ACADEMIC DATA */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500 font-medium">Official University CGPA</p>
            <p className="text-3xl font-black text-slate-800">{profile.cgpa}</p>
          </div>
          {profile.isCgpaVerified && (
            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-sm">
              <CheckCircle size={16} /> Verified
            </div>
          )}
        </div>

        <hr className="border-slate-100" />

        {/* EDITABLE PORTFOLIO DATA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Github size={16}/> GitHub URL</label>
            <input type="url" name="githubUrl" value={formData.githubUrl} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clutch-500 outline-none" placeholder="https://github.com/username"/>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Code size={16}/> LeetCode URL</label>
            <input type="url" name="leetcodeUrl" value={formData.leetcodeUrl} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clutch-500 outline-none" placeholder="https://leetcode.com/u/username"/>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Globe size={16}/> Personal Website</label>
            <input type="url" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clutch-500 outline-none" placeholder="https://yourdomain.com"/>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><FileText size={16}/> Resume Link (Drive/PDF)</label>
            <input type="url" name="resumePdfUrl" value={formData.resumePdfUrl} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clutch-500 outline-none" placeholder="https://drive.google.com/..."/>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Technical Skills (Comma separated)</label>
          <input type="text" name="skillsString" value={formData.skillsString} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clutch-500 outline-none" placeholder="Java, React, Spring Boot, DevOps..."/>
        </div>

        <div className="pt-4 flex justify-end">
          <PrimaryButton 
            text={isSaving ? "Saving..." : "Save Portfolio"} 
            onClick={handleSave} 
            isLoading={isSaving}
          />
        </div>
      </div>
    </div>
  );
}