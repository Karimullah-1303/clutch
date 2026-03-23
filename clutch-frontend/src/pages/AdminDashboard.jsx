import React, { useState } from 'react';
import CsvUploader from '../features/admin/CsvUploader';
import PlacementControlCenter from '../features/admin/PlacementControlCenter'; // Ensure this path is correct!
import { Database, Briefcase } from 'lucide-react'; // Adding some slick icons

/**
 * AdminDashboard Component
 * The centralized hub for the university Administrator.
 * Uses a tabbed interface to switch between backend Data Provisioning 
 * and operational Placement Management.
 */
export default function AdminDashboard() {
  const userName = localStorage.getItem('clutch_userName') || 'Admin';
  
  // --- NEW: Tab Navigation State ---
  const [activeTab, setActiveTab] = useState('provisioning'); // 'provisioning' or 'placement'

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      
      {/* HEADER */}
      <div className="mb-6 text-center md:text-left">
        <h1 className="text-3xl font-bold text-clutch-900">University Admin Hub</h1>
        <p className="text-slate-500 mt-1">Welcome back, {userName}. Manage campus infrastructure and placements.</p>
      </div>

      {/* --- NAVIGATION TABS --- */}
      <div className="flex space-x-2 border-b border-slate-200 mb-8 pb-px">
        <button
          onClick={() => setActiveTab('provisioning')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'provisioning' 
              ? 'border-clutch-600 text-clutch-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Database size={18} />
          Data Provisioning
        </button>
        <button
          onClick={() => setActiveTab('placement')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'placement' 
              ? 'border-clutch-600 text-clutch-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Briefcase size={18} />
          Placement Control Center
        </button>
      </div>

      {/* --- CONDITIONAL RENDERING --- */}
      {activeTab === 'placement' ? (
        
        /* 1. THE NEW PLACEMENT HUB */
        <PlacementControlCenter />
        
      ) : (
        
        /* 2. THE ORIGINAL CSV UPLOADERS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* --- IDENTITY DOMAIN --- */}
          <CsvUploader 
            title="1. Upload Users" 
            description="CSV format: RollNumber, Name, Email, Role"
            endpoint="/api/v1/admin/upload-users"
            
          />

          {/* --- ACADEMY DOMAIN --- */}
          <CsvUploader 
            title="2. Upload Subjects" 
            description="CSV format: CourseCode, Name"
            endpoint="/api/v1/academic/admin/upload-subjects"
            
          />

          <CsvUploader 
            title="3. Upload Timetables" 
            description="CSV format: SubjectCode, SectionName, TeacherUUID, Day, StartTime, EndTime"
            endpoint="/api/v1/academic/admin/upload-timetables"
           
          />

          <CsvUploader 
            title="4. Upload Enrollments" 
            description="CSV format: StudentUUID, SectionName"
            endpoint="/api/v1/academic/admin/upload-enrollments"
            
          />

          {/* --- PLACEMENT DOMAIN --- */}
          <CsvUploader 
            title="5. Upload CGPA" 
            description="CSV format: StudentUUID, RollNumber, CGPA"
            endpoint="/api/v1/placement/admin/upload-cgpa"
          />
        </div>
      )}

    </div>
  );
}