import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, FileText, Sparkles, Loader2, CheckCircle, ArrowRight, BookOpen, Clock } from 'lucide-react';

export default function SyllabusAiIngestion() {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, analyzing, verification, publishing, success
  const [extractedData, setExtractedData] = useState(null);

  // Hardcoded subjects for the prototype dropdown (Expand this to fetch from your backend later)
  const subjects = [
    { code: 'CS3201', name: 'Object Oriented Software Engineering' },
    { code: 'CS3202', name: 'Machine Learning' },
    { code: 'CS3203', name: 'Cryptography & Network Security' },
    { code: 'CS3204_SN', name: 'Sensor Networks' },
    { code: 'CS3204_CC', name: 'Cloud Computing' },
    { code: 'CS3204_DWDM', name: 'Data Warehousing and Data Mining' },
    { code: 'CS3205' , name: 'Embedded Systems' },
    { code: 'CS3206' , name: 'Object Oriented Software Engineering Lab'},
    { code: 'CS3207' , name: 'Machine Learning Lab'},
    { code: 'CS3208' , name: 'Cryptography & Network Security Lab'},
    { code: 'CS3209', name: 'Embedded Systems Design' }
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };


  const handleAiExtraction = async () => {
    if (!file || !selectedSubject) return alert("Select a subject and upload a PDF.");
    
    setStatus('analyzing');

    try {
        const token = localStorage.getItem('clutch_token');
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('subjectCode', selectedSubject);

        const response = await axios.post('/api/v1/academic/admin/syllabus/ai-extract', formData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data' 
            }
        });

        setExtractedData(response.data);
        setStatus('verification');

    } catch (error) {
        console.error("AI Extraction failed", error);
        alert("AI failed to read the document. Check backend console.");
        setStatus('idle');
    }
  };

  const handlePublish = async () => {
    setStatus('publishing');
    try {
      const token = localStorage.getItem('clutch_token');
      
      await axios.post('/api/v1/academic/admin/syllabus/ai-publish', JSON.stringify(extractedData), { 
          headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
      });
      
      setTimeout(() => {
        setStatus('success');
      }, 1000);
    } catch (error) {
      console.error("Failed to publish syllabus", error);
      alert("Failed to save to database!");
      setStatus('verification'); 
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 max-w-4xl mx-auto mt-6 animate-fade-in">
      
      <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-6">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">AI Curriculum Ingestion</h2>
          <p className="text-slate-500 font-medium mt-1">Upload an official university PDF syllabus. Our AI will automatically extract modules and calculate pacing targets.</p>
        </div>
      </div>

      {/* STEP 1: UPLOAD ZONE */}
      {(status === 'idle' || status === 'analyzing') && (
        <div className="space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Target Subject</label>
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full md:w-1/2 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium outline-none"
            >
              <option value="">Select a Course Code...</option>
              {subjects.map(s => <option key={s.code} value={s.code}>{s.code} - {s.name}</option>)}
            </select>
          </div>

          <div className="border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl p-10 flex flex-col items-center justify-center relative overflow-hidden group">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            
            {status === 'analyzing' ? (
              <div className="flex flex-col items-center text-purple-600 animate-pulse">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p className="font-bold text-lg">AI is extracting curriculum data...</p>
                <p className="text-sm font-medium opacity-70 mt-1">Calculating 45-day pacing targets</p>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center text-clutch-600">
                <FileText size={48} className="mb-4" />
                <p className="font-bold text-lg">{file.name}</p>
                <p className="text-sm font-medium text-slate-500 mt-1">Ready for AI Analysis</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-400 group-hover:text-clutch-500 transition-colors">
                <UploadCloud size={48} className="mb-4" />
                <p className="font-bold text-lg text-slate-700">Drag & Drop official syllabus PDF</p>
                <p className="text-sm font-medium mt-1">or click to browse your files</p>
              </div>
            )}
          </div>

          {file && status === 'idle' && (
            <button 
              onClick={handleAiExtraction}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-colors shadow-soft"
            >
              <Sparkles size={20} />
              Run AI Extraction Engine
            </button>
          )}
        </div>
      )}

      {/* STEP 2: HUMAN VERIFICATION */}
      {(status === 'verification' || status === 'publishing') && extractedData && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex items-center justify-between bg-purple-50 p-4 rounded-xl border border-purple-100">
            <div>
              <p className="text-xs font-bold text-purple-500 uppercase tracking-wider">Analysis Complete</p>
              <h3 className="text-lg font-black text-purple-900">{extractedData.subjectCode} Curriculum Map</h3>
            </div>
            <div className="flex items-center gap-2 text-purple-700 font-bold bg-white px-3 py-1.5 rounded-lg border border-purple-200 shadow-sm">
              <Clock size={16} />
              {extractedData.totalEstimatedLectures} Lectures Mapped
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {extractedData.modules.map(mod => (
              <div key={mod.moduleNumber} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                  <BookOpen size={18} className="text-clutch-500" />
                  <h4 className="font-bold text-slate-800">Module {mod.moduleNumber}: {mod.title}</h4>
                </div>
                <div className="divide-y divide-slate-100 bg-white">
                  {mod.topics.map(topic => (
                    <div key={topic.topicNumber} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                      <span className="text-sm font-medium text-slate-700">
                        <span className="font-bold text-slate-900 mr-2">{topic.topicNumber}.</span>
                        {topic.title}
                      </span>
                      <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                        Target Lec: {topic.targetLectureNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={handlePublish}
            disabled={status === 'publishing'}
            className="w-full flex items-center justify-center gap-2 bg-clutch-600 hover:bg-clutch-700 text-white font-bold py-4 rounded-xl transition-colors shadow-soft disabled:bg-slate-400"
          >
            {status === 'publishing' ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
            {status === 'publishing' ? 'Generating UUIDs and Saving to Database...' : 'Approve & Publish to Database'}
          </button>
        </div>
      )}

      {/* STEP 3: SUCCESS */}
      {status === 'success' && (
        <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Curriculum Published!</h3>
          <p className="text-slate-500 font-medium mt-2 max-w-md">
            The syllabus for {selectedSubject} is now live. The Time-Series engine will track progress dynamically.
          </p>
          <button 
            onClick={() => { setStatus('idle'); setFile(null); setSelectedSubject(''); }}
            className="mt-8 flex items-center gap-2 text-clutch-600 font-bold hover:text-clutch-800 transition-colors"
          >
            Process Another Syllabus <ArrowRight size={18} />
          </button>
        </div>
      )}

    </div>
  );
}