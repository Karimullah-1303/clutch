import React from 'react';
import { AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';

export default function TeacherPacingBanner({ immediateNextTopic }) {
    if (!immediateNextTopic || immediateNextTopic.pacingStatus === 'UNMAPPED') return null;

    const { pacingStatus, pacingOffset } = immediateNextTopic;

    if (pacingStatus === 'LAGGING') {
        return (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
                <AlertTriangle className="text-red-500 mt-0.5" size={20} />
                <div>
                    <h4 className="text-red-800 font-bold">You are behind schedule</h4>
                    <p className="text-red-600 text-sm font-medium mt-1">
                        Based on the academic calendar, you are currently <span className="font-black underline">{pacingOffset} lectures</span> behind the AI syllabus target. Consider combining topics this week to catch up.
                    </p>
                </div>
            </div>
        );
    }

    if (pacingStatus === 'ADVANCED') {
        return (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
                <TrendingUp className="text-blue-500 mt-0.5" size={20} />
                <div>
                    <h4 className="text-blue-800 font-bold">You are ahead of schedule!</h4>
                    <p className="text-blue-600 text-sm font-medium mt-1">
                        Great pacing. You are <span className="font-black">{pacingOffset} lectures</span> ahead of the target syllabus.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <CheckCircle className="text-emerald-500" size={20} />
            <span className="text-emerald-800 font-bold text-sm">You are perfectly on track with the syllabus schedule.</span>
        </div>
    );
}