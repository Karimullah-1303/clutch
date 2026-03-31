import React, { useState } from 'react';
import CsvUploader from '../features/admin/CsvUploader';
import PlacementControlCenter from '../features/admin/PlacementControlCenter'; 
import DepartmentHealthView from '../features/admin/DepartmentHealthView'; 
import SyllabusAiIngestion from '../features/admin/SyllabusAiIngestion'; // 🚨 IMPORT THE AI UI!
import { Database, Briefcase, Activity, Sparkles } from 'lucide-react'; 

export default function AdminDashboard() {
  const userName = localStorage.getItem('clutch_userName') || 'Admin';
  
  // Options: 'provisioning', 'health', 'placement', 'ai-syllabus'
  const [activeTab, setActiveTab] = useState('health'); 

  return (
    <div className="max-w-6xl mx-auto animate-fade-in p-4 md:p-8">
      
      <div className="mb-6 text-center md:text-left">
        <h1 className="text-3xl font-black text-clutch-900">University Admin Hub</h1>
        <p className="text-slate-500 font-medium mt-1">Welcome back, {userName}. Manage campus infrastructure, academics, and placements.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 mb-8 pb-px">
        
        <button onClick={() => setActiveTab('health')} className={`flex items-center gap-2 px-4 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'health' ? 'border-clutch-600 text-clutch-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
          <Activity size={18} /> Academic Health
        </button>

        {/* 🚨 THE NEW AI TAB 🚨 */}
        <button onClick={() => setActiveTab('ai-syllabus')} className={`flex items-center gap-2 px-4 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'ai-syllabus' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
          <Sparkles size={18} /> AI Curriculum Engine
        </button>

        <button onClick={() => setActiveTab('placement')} className={`flex items-center gap-2 px-4 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'placement' ? 'border-clutch-600 text-clutch-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
          <Briefcase size={18} /> Placement Hub
        </button>

        <button onClick={() => setActiveTab('provisioning')} className={`flex items-center gap-2 px-4 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'provisioning' ? 'border-clutch-600 text-clutch-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
          <Database size={18} /> Data Provisioning
        </button>
      </div>

      <div className="animate-fade-in">
        {activeTab === 'health' && <DepartmentHealthView />}
        {activeTab === 'placement' && <PlacementControlCenter />}
        
        {/* 🚨 RENDER THE AI COMPONENT 🚨 */}
        {activeTab === 'ai-syllabus' && <SyllabusAiIngestion />}

        {activeTab === 'provisioning' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CsvUploader title="1. Upload Users" endpoint="/api/v1/admin/upload-users" />
            <CsvUploader title="2. Upload Subjects" endpoint="/api/v1/academic/admin/upload-subjects" />
            <CsvUploader title="3. Upload Timetables" endpoint="/api/v1/academic/admin/upload-timetables" />
            <CsvUploader title="4. Upload Enrollments" endpoint="/api/v1/academic/admin/upload-enrollments" />
            <CsvUploader title="5. Upload CGPA" endpoint="/api/v1/placement/admin/upload-cgpa" />
          </div>
        )}
      </div>
    </div>
  );
}