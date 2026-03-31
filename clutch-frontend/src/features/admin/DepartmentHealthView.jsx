import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, ShieldAlert, CheckCircle2, TrendingUp, AlertCircle, Users, LayoutDashboard, ArrowUpDown, Filter } from 'lucide-react';

export default function DepartmentHealthView() {
  const [dashboardData, setDashboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New State for Sorting & Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortConfig, setSortConfig] = useState({ key: 'syllabusPercentage', direction: 'asc' });

  useEffect(() => {
    fetchDepartmentHealth();
  }, []);

  const fetchDepartmentHealth = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('clutch_token');
      const response = await axios.get('/api/v1/academic/admin/department-progress?departmentId=CSE', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🚨 THE ENGINE: Handles Searching, Filtering, and Sorting efficiently
  const processedData = useMemo(() => {
    let filtered = dashboardData.filter(row => {
      const matchesSearch = row.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            row.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || row.pacingStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [dashboardData, searchTerm, statusFilter, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'LAGGING': return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200"><AlertCircle size={14} /> Behind</span>;
      case 'ADVANCED': return <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200"><TrendingUp size={14} /> Ahead</span>;
      case 'ON_TRACK': return <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200"><CheckCircle2 size={14} /> On Track</span>;
      default: return <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">Unmapped</span>;
    }
  };

  return (
    <div className="w-full animate-fade-in">
      
      {/* Search & Filter Header */}
      <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="text-clutch-500" size={24} />
            Department Tracker
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Computer Science & Engineering</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Status Filter Dropdown */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-clutch-500 font-bold text-slate-700 text-sm appearance-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="LAGGING">⚠️ Behind Schedule</option>
              <option value="ON_TRACK">✅ On Track</option>
              <option value="ADVANCED">🚀 Ahead of Curve</option>
              <option value="UNMAPPED">Unmapped</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Subject or Prof..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-clutch-500 font-medium text-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* The Responsive Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="w-full">
          
          {/* Interactive Desktop Headers */}
          <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50 border-b border-slate-200 px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
            <div className="col-span-3 cursor-pointer flex items-center gap-1 hover:text-clutch-600 transition-colors" onClick={() => requestSort('teacherName')}>
              Professor <ArrowUpDown size={12} />
            </div>
            <div className="col-span-3 cursor-pointer flex items-center gap-1 hover:text-clutch-600 transition-colors" onClick={() => requestSort('subjectCode')}>
              Subject & Section <ArrowUpDown size={12} />
            </div>
            <div className="col-span-2 cursor-pointer flex items-center gap-1 hover:text-clutch-600 transition-colors" onClick={() => requestSort('currentLectureCount')}>
              Lectures <ArrowUpDown size={12} />
            </div>
            <div className="col-span-2 cursor-pointer flex items-center gap-1 hover:text-clutch-600 transition-colors" onClick={() => requestSort('syllabusPercentage')}>
              Progress <ArrowUpDown size={12} />
            </div>
            <div className="col-span-2 cursor-pointer flex items-center gap-1 hover:text-clutch-600 transition-colors" onClick={() => requestSort('pacingStatus')}>
              Status <ArrowUpDown size={12} />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-12 text-center text-slate-500 font-medium">Loading tracking data...</div>
            ) : processedData.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-medium">No records match your filters.</div>
            ) : (
              processedData.map((row, index) => (
                <div key={index} className="flex flex-col md:grid md:grid-cols-12 gap-4 px-6 py-5 hover:bg-slate-50 transition-colors">
                  
                  {/* Professor */}
                  <div className="col-span-3 flex items-center justify-between md:justify-start gap-3">
                    <span className="md:hidden text-xs font-bold text-slate-400 uppercase">Professor</span>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-clutch-100 text-clutch-700 flex items-center justify-center font-bold text-xs">
                        {row.teacherName.replace('Prof. ', '').charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900">{row.teacherName}</span>
                    </div>
                  </div>
                  
                  {/* Subject */}
                  <div className="col-span-3 flex items-center justify-between md:justify-start">
                    <span className="md:hidden text-xs font-bold text-slate-400 uppercase">Subject</span>
                    <div className="flex flex-col text-right md:text-left">
                      <span className="font-bold text-slate-800">{row.subjectCode} {row.subjectName && `• ${row.subjectName}`}</span>
                      <span className="text-xs font-medium text-slate-500 mt-0.5 flex items-center justify-end md:justify-start gap-1">
                        <Users size={12}/> {row.sectionName}
                      </span>
                    </div>
                  </div>

                  {/* Lectures Held */}
                  <div className="col-span-2 flex items-center justify-between md:justify-start">
                    <span className="md:hidden text-xs font-bold text-slate-400 uppercase">Lectures</span>
                    <span className="font-bold text-slate-700">{row.currentLectureCount} <span className="text-slate-400 font-medium text-xs">held</span></span>
                  </div>

                  {/* Progress Bar */}
                  <div className="col-span-2 flex items-center justify-between md:justify-start gap-3">
                     <span className="md:hidden text-xs font-bold text-slate-400 uppercase">Progress</span>
                     <div className="flex items-center gap-3 flex-1 md:flex-none w-full md:w-32">
                        <span className="text-sm font-bold text-slate-700 w-10 text-right md:text-left">{row.syllabusPercentage}%</span>
                        <div className="flex-1 md:w-20 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${row.pacingStatus === 'LAGGING' ? 'bg-red-500' : row.pacingStatus === 'ADVANCED' ? 'bg-blue-500' : 'bg-clutch-500'}`}
                            style={{ width: `${Math.max(row.syllabusPercentage, 5)}%` }}
                          />
                        </div>
                      </div>
                  </div>

                  {/* Status Badge */}
                  <div className="col-span-2 flex items-center justify-between md:justify-start pt-2 md:pt-0 border-t border-slate-100 md:border-0 mt-2 md:mt-0">
                    <span className="md:hidden text-xs font-bold text-slate-400 uppercase">Status</span>
                    {renderStatusBadge(row.pacingStatus)}
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}