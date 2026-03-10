import React from 'react';
import CsvUploader from '../features/admin/CsvUploader';

/**
 * AdminDashboard Component
 * The centralized provisioning hub for the university. 
 * Demonstrates frontend Microservice Orchestration by directing different CSV uploads
 * to entirely different backend domains (Identity Service vs. Academy Service).
 */
export default function AdminDashboard() {
  const userName = localStorage.getItem('clutch_userName') || 'Admin';

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-clutch-900">University Setup</h1>
        <p className="text-slate-500 mt-1">Welcome back, {userName}. Provision campus data below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- IDENTITY DOMAIN --- */}
        {/* HITS THE IDENTITY SERVICE (Port 8081) to provision Auth & Roles */}
        <CsvUploader 
          title="1. Upload Users" 
          description="CSV format: RollNumber, Name, Email, Role"
          endpoint="/api/v1/admin/upload-users"
          port="8081"
        />

        {/* --- ACADEMY DOMAIN --- */}
        {/* HITS THE ACADEMY SERVICE (Port 8082) to provision Course Catalog */}
        <CsvUploader 
          title="2. Upload Subjects" 
          description="CSV format: CourseCode, Name"
          endpoint="/api/v1/academic/admin/upload-subjects"
          port="8082"
        />

        {/* HITS THE ACADEMY SERVICE (Port 8082) to provision Scheduling */}
        <CsvUploader 
          title="3. Upload Timetables" 
          description="CSV format: SubjectCode, SectionName, TeacherUUID, Day, StartTime, EndTime"
          endpoint="/api/v1/academic/admin/upload-timetables"
          port="8082"
        />

        {/* HITS THE ACADEMY SERVICE (Port 8082) to map Identity Users to Academy Sections */}
        <CsvUploader 
          title="4. Upload Enrollments" 
          description="CSV format: StudentUUID, SectionName"
          endpoint="/api/v1/academic/admin/upload-enrollments"
          port="8082"
        />

      </div>
    </div>
  );
}