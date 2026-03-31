import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Loader2, CheckCircle, ChevronDown, ChevronUp, BookOpen, Target, FileDigit, ArrowRightCircle, Undo2, AlertTriangle } from 'lucide-react';

// Progress Wheel Component
const ProgressWheel = ({ percentage }) => {
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative flex items-center justify-center w-6 h-6">
      <svg width="24" height="24" viewBox="0 0 24 24" className="transform -rotate-90">
        <circle cx="12" cy="12" r={radius} stroke="#f1f5f9" strokeWidth="3" fill="none" />
        <circle 
          cx="12" cy="12" r={radius} 
          stroke={percentage === 100 ? '#22c55e' : '#3b82f6'} 
          strokeWidth="3" fill="none"
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          className="transition-all duration-700 ease-out" 
        />
      </svg>
      {percentage === 100 && <CheckCircle size={10} className="absolute text-green-500 bg-white rounded-full" />}
    </div>
  );
};

export default function LessonPlanModal({ isOpen, onClose, classData, currentDate }) {
  const [syllabus, setSyllabus] = useState([]);
  const [smartData, setSmartData] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [completedTopicIds, setCompletedTopicIds] = useState([]);
  const [pushedTopicIds, setPushedTopicIds] = useState([]); 
  
  const [expandedModuleId, setExpandedModuleId] = useState(null); 
  const [activeResourceTab, setActiveResourceTab] = useState('department'); 
  const [existingPlanId, setExistingPlanId] = useState(null);

  useEffect(() => {
    if (isOpen && classData) {
      fetchSyllabusAndProgress();
      setPushedTopicIds([]); 
    }
  }, [isOpen, classData]);

  const fetchSyllabusAndProgress = async () => {
    setIsLoading(true);
    setExistingPlanId(null); 
    try {
      const token = localStorage.getItem('clutch_token');
      const teacherId = localStorage.getItem('clutch_userId');
      const offset = new Date(currentDate).getTimezoneOffset();
      const localSafeDate = new Date(currentDate.getTime() - (offset * 60 * 1000));
      const formattedDate = localSafeDate.toISOString().split('T')[0];

      // 1. Fetch Today's Plan
      const progressRes = await axios.get(
        `/api/v1/academic/lesson-plans/daily?teacherId=${teacherId}&date=${formattedDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const existingPlan = progressRes.data.find(p => p.subjectCode === classData.subjectCode && p.sectionName === classData.sectionName);
      if (existingPlan) {
          setExistingPlanId(existingPlan.id);
          if (existingPlan.pushedTopicIds) setPushedTopicIds(existingPlan.pushedTopicIds);
      }

      // 2. Fetch Smart Targets (Now includes Pacing Status!)
      const smartRes = await axios.get(
        `/api/v1/academic/lesson-plans/smart-target?sectionName=${classData.sectionName}&subjectCode=${classData.subjectCode}&timetableSlotCode=CS3201`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSmartData(smartRes.data);
      const historicalIds = smartRes.data.historicallyCompletedTopicIds || [];
      setCompletedTopicIds(historicalIds);

      // 3. Fetch Master Syllabus
      const syllabusRes = await axios.get(
        `/api/v1/academic/syllabus/${classData.sectionName}/${classData.subjectCode}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (Array.isArray(syllabusRes.data)) {
        setSyllabus(syllabusRes.data);
        if (smartRes.data.todaysTargets?.length > 0) {
            const firstTargetId = smartRes.data.todaysTargets[0].id;
            const targetModule = syllabusRes.data.find(m => m.topics?.some(t => t.id === firstTargetId));
            if (targetModule) setExpandedModuleId(targetModule.id);
        }
      } else {
        setSyllabus([]); 
      }
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTopic = (topicId) => {
    setCompletedTopicIds(prev => 
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    );
  };

  const handlePushTopic = (e, topicId) => {
    e.preventDefault();
    e.stopPropagation();
    setCompletedTopicIds(prev => prev.filter(id => id !== topicId));
    setPushedTopicIds(prev => [...prev, topicId]);
  };

  const handleUndoPush = (e, topicId) => {
    e.preventDefault();
    e.stopPropagation();
    setPushedTopicIds(prev => prev.filter(id => id !== topicId));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('clutch_token');
      const teacherId = localStorage.getItem('clutch_userId');
      const offset = new Date(currentDate).getTimezoneOffset();
      const localSafeDate = new Date(currentDate.getTime() - (offset * 60 * 1000));
      
      const payload = {
          teacherId: teacherId,
          subjectCode: classData.subjectCode,
          sectionName: classData.sectionName,
          classDate: localSafeDate.toISOString().split('T')[0], 
          startTime: "00:00:00", 
          status: "COMPLETED",
          completedTopicIds: completedTopicIds,
          pushedTopicIds: pushedTopicIds
      };

      if (existingPlanId) {
          await axios.put(`/api/v1/academic/lesson-plans/${existingPlanId}`, payload, {
              headers: { Authorization: `Bearer ${token}` }
          });
      } else {
          await axios.post('/api/v1/academic/lesson-plans', payload, {
              headers: { Authorization: `Bearer ${token}` }
          });
      }
      onClose(); 
    } catch (error) {
      console.error("Error saving lesson plan:", error);
      alert(`Save failed! Error: ${error.message}`); 
    } finally {
      setIsSaving(false);
    }
  };

  // 🚨 NEW: PACING BADGE RENDERER 🚨
  const renderPacingBadge = (status) => {
    if (!status || status === 'UNMAPPED') return null;
    if (status === 'LAGGING') return <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">🔴 Behind</span>;
    if (status === 'ADVANCED') return <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">🚀 Ahead</span>;
    if (status === 'ON_TRACK') return <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">✅ On Track</span>;
    return null;
  };

  if (!isOpen) return null;

  const globalPercentage = smartData?.totalSyllabusTopics > 0 
    ? Math.round((smartData.completedSyllabusTopics / smartData.totalSyllabusTopics) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface w-full max-w-2xl rounded-t-3xl h-[90vh] flex flex-col shadow-2xl animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-black text-clutch-900 tracking-tight">Log Lesson</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm font-bold text-clutch-500 uppercase tracking-wider">
                {classData?.subjectName} • {classData?.sectionName}
              </p>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                {globalPercentage}% Covered
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-background">
          
          {/* THE GREEN ZONE */}
          {smartData?.todaysTargets?.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-emerald-800 font-bold flex items-center gap-2">
                  <Target size={18} />
                  Suggested Daily Log
                </h3>
              </div>
              
              <div className="space-y-3">
                {smartData.todaysTargets.map((topic) => {
                  const isChecked = completedTopicIds.includes(topic.id);
                  const isPushed = pushedTopicIds.includes(topic.id);
                  const isCarryover = smartData?.carryoverTopics?.some(ct => ct.id === topic.id);

                  if (isPushed) {
                    return (
                      <div key={`pushed-${topic.id}`} className="flex items-center justify-between p-3 bg-slate-50/50 border border-dashed border-slate-300 rounded-xl transition-all animate-fade-in">
                        <div className="flex items-center gap-2 text-slate-400">
                          <ArrowRightCircle size={16} />
                          <span className="text-sm font-medium line-through">
                            {topic.topicNumber} {topic.title}
                          </span>
                        </div>
                        <button onClick={(e) => handleUndoPush(e, topic.id)} className="flex items-center gap-1 text-xs font-bold text-blue-500 hover:text-blue-700 px-2 py-1 bg-blue-50 rounded-lg">
                          <Undo2 size={12} /> Undo
                        </button>
                      </div>
                    );
                  }

                  return (
                    <label key={`target-${topic.id}`} className={`flex items-center justify-between p-3 bg-white rounded-xl cursor-pointer shadow-sm border transition-all ${isCarryover ? 'border-orange-200 hover:border-orange-400' : 'border-emerald-100 hover:border-emerald-300'}`}>
                      <div className="flex items-start gap-4 flex-1">
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => toggleTopic(topic.id)}
                            className={`peer h-6 w-6 appearance-none rounded-md border-2 border-slate-300 transition-all cursor-pointer ${isCarryover ? 'checked:bg-orange-500 checked:border-orange-500' : 'checked:bg-emerald-500 checked:border-emerald-500'}`}
                          />
                          <CheckCircle size={16} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <div className="flex flex-col">
                          {isCarryover && !isChecked && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-0.5">
                              <AlertTriangle size={10} /> Carryover from last class
                            </span>
                          )}
                          <span className={`text-base font-medium transition-colors ${isChecked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                            <span className="font-bold mr-2 text-slate-900">{topic.topicNumber}</span> 
                            {topic.title}
                            {/* 🚨 INJECT PACING BADGE HERE 🚨 */}
                            {!isChecked && renderPacingBadge(topic.pacingStatus)}
                          </span>
                        </div>
                      </div>
                      
                      {!isChecked && (
                        <button onClick={(e) => handlePushTopic(e, topic.id)} className="ml-3 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1">
                          <span className="text-xs font-bold">Push</span>
                          <ArrowRightCircle size={16} />
                        </button>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* THE BLUE ZONE: MASTER SYLLABUS */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-clutch-500"/>
              Master Syllabus
            </h3>
            
            {isLoading ? (
              <div className="flex justify-center p-12 text-clutch-500 bg-white rounded-2xl border border-slate-200">
                <Loader2 className="animate-spin mb-3" size={32} />
              </div>
            ) : syllabus.length > 0 ? (
              <div className="space-y-4">
                {syllabus.map((mod) => {
                  const isExpanded = expandedModuleId === mod.id;
                  const totalTopics = mod.topics?.length || 0;
                  const completedCount = mod.topics?.filter(t => completedTopicIds.includes(t.id)).length || 0;
                  const completionPercentage = totalTopics === 0 ? 0 : Math.round((completedCount / totalTopics) * 100);

                  return (
                    <div key={mod.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                      <div onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)} className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-colors ${isExpanded ? 'bg-slate-50 border-b border-slate-100' : 'hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-3">
                          <ProgressWheel percentage={completionPercentage} />
                          <h4 className={`font-black text-sm uppercase tracking-wider ${completionPercentage === 100 ? 'text-green-700' : 'text-slate-700'}`}>
                            Module {mod.moduleNumber}: {mod.title}
                          </h4>
                        </div>
                        <div className="text-slate-400">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="divide-y divide-slate-100 animate-fade-in">
                          {mod.topics?.map(topic => {
                            const isChecked = completedTopicIds.includes(topic.id);
                            return (
                              <label key={topic.id} className={`flex items-start gap-4 p-4 cursor-pointer transition-colors hover:bg-slate-50 ${isChecked ? 'bg-clutch-50/30' : ''}`}>
                                <div className="relative flex items-center justify-center mt-0.5">
                                  <input 
                                    type="checkbox" 
                                    checked={isChecked}
                                    onChange={() => toggleTopic(topic.id)}
                                    className="peer h-6 w-6 appearance-none rounded-md border-2 border-slate-300 checked:bg-clutch-500 checked:border-clutch-500 transition-all cursor-pointer shadow-sm"
                                  />
                                  <CheckCircle size={16} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                </div>
                                <span className={`text-base font-medium transition-colors pt-0.5 ${isChecked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                  <span className="font-bold mr-2 text-slate-900">{topic.topicNumber}</span> 
                                  {topic.title}
                                  {/* 🚨 INJECT PACING BADGE HERE TOO 🚨 */}
                                  {!isChecked && renderPacingBadge(topic.pacingStatus)}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="p-6 border-t border-slate-100 bg-white rounded-b-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex flex-col items-center justify-center bg-clutch-500 hover:bg-clutch-600 disabled:bg-slate-300 text-white py-3 rounded-xl transition-colors shadow-soft"
          >
            <div className="flex items-center gap-2 font-black text-lg">
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {isSaving ? "Submitting..." : "Submit Log to HOD"}
            </div>
            <span className="text-[10px] font-medium opacity-80 tracking-wide mt-0.5">🔒 This officially updates your course file</span>
          </button>
        </div>

      </div>
    </div>
  );
}