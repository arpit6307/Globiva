import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, Loader2, Circle, AlertTriangle, X } from 'lucide-react';

const STAGES = [
  { id: 'extracting', label: 'Extracting PDF', icon: '📄' },
  { id: 'analyzing', label: 'Analyzing Content', icon: '🧠' },
  { id: 'scripting', label: 'Generating Script', icon: '🎬' },
  { id: 'generating_mcqs', label: 'Generating Questions', icon: '❓' },
  { id: 'creating_narration', label: 'Creating Narration', icon: '🎙️' },
  { id: 'rendering_video', label: 'Rendering Video', icon: '🎥' },
];

// Map stages to their index order for comparison
const STAGE_ORDER = {
  'queued': -1,
  'extracting': 0,
  'analyzing': 1,
  'scripting': 2,
  'generating_mcqs': 3,
  'creating_narration': 4,
  'rendering_video': 5,
  'done': 6,
  'failed': -2
};

export const ProgressTracker = ({ jobId, onComplete, onError, onClose }) => {
  const [jobData, setJobData] = useState(null);
  const completedRef = useRef(false);

  useEffect(() => {
    let interval;
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/status/${jobId}`);
        if (!response.ok) {
          console.error('Status check failed:', response.status);
          return;
        }
        const data = await response.json();
        setJobData(data);

        if (data.stage === 'done' && !completedRef.current) {
          completedRef.current = true;
          clearInterval(interval);
          // Small delay for user to see "Complete" state
          setTimeout(() => {
            if (data.result) {
              onComplete(data.result);
            }
          }, 1500);
        } else if (data.stage === 'failed') {
          clearInterval(interval);
          onError(data.error || 'Generation failed');
        }
      } catch (err) {
        console.error("Error polling status:", err);
      }
    };

    checkStatus();
    interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  const currentStageIndex = jobData ? STAGE_ORDER[jobData.stage] ?? -1 : -1;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl w-full max-w-md p-6 relative flex flex-col gap-5 animate-scale-in">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b-3 border-slate-800 pb-4">
          <h2 className="font-heading font-black text-xl uppercase tracking-wider text-slate-800">
            {jobData?.stage === 'done' ? '✅ COURSE READY!' : jobData?.stage === 'failed' ? '❌ GENERATION FAILED' : '⚡ GENERATING COURSE...'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 border-2 border-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shadow-[2px_2px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress Stepper */}
        <div className="flex flex-col gap-0">
          {STAGES.map((stage, idx) => {
            const isCompleted = currentStageIndex > idx || jobData?.stage === 'done';
            const isCurrent = currentStageIndex === idx && jobData?.stage !== 'done' && jobData?.stage !== 'failed';
            const isPending = !isCompleted && !isCurrent;

            return (
              <div key={stage.id} className="flex items-stretch gap-3">
                {/* Vertical line + icon */}
                <div className="flex flex-col items-center w-7">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${
                    isCompleted 
                      ? 'border-emerald-600 bg-emerald-100' 
                      : isCurrent 
                        ? 'border-brand-red bg-red-50 animate-pulse' 
                        : 'border-slate-300 bg-slate-50'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="text-emerald-600" size={16} />
                    ) : isCurrent ? (
                      <Loader2 className="text-brand-red animate-spin" size={16} />
                    ) : (
                      <Circle className="text-slate-300" size={14} />
                    )}
                  </div>
                  {idx < STAGES.length - 1 && (
                    <div className={`w-0.5 flex-1 min-h-[20px] transition-colors duration-300 ${
                      isCompleted ? 'bg-emerald-400' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
                
                {/* Label + detail */}
                <div className={`flex flex-col pb-3 pt-0.5`}>
                  <span className={`font-heading font-black uppercase tracking-wide text-xs transition-colors duration-300 ${
                    isCompleted ? 'text-emerald-700' : isCurrent ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {stage.icon} {stage.label}
                  </span>
                  {isCurrent && jobData?.detail && (
                    <span className="font-body font-bold text-[11px] text-slate-500 mt-0.5">
                      {jobData.detail}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 border-2 border-slate-800 rounded-full h-4 overflow-hidden shadow-[2px_2px_0px_#000]">
          <div 
            className="h-full bg-gradient-to-r from-brand-red to-red-400 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${jobData?.progress || 0}%` }}
          />
        </div>

        {/* Failed state */}
        {jobData?.stage === 'failed' && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex gap-3 items-start">
            <AlertTriangle className="text-error-red shrink-0 mt-0.5" size={18} />
            <div className="flex flex-col gap-2">
              <span className="font-heading font-black text-error-red uppercase text-xs">Error Details</span>
              <span className="font-body font-bold text-slate-700 text-xs leading-relaxed">{jobData.error || 'An unknown error occurred.'}</span>
              <button 
                onClick={onClose}
                className="mt-1 bg-white border-2 border-slate-800 text-slate-800 font-heading font-black text-xs px-4 py-2 rounded-lg shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-none transition-all self-start cursor-pointer"
              >
                DISMISS
              </button>
            </div>
          </div>
        )}

        {/* Done state */}
        {jobData?.stage === 'done' && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 text-center">
            <span className="font-heading font-black text-emerald-700 uppercase text-sm">
              🎉 Course generated successfully! Saving to database...
            </span>
          </div>
        )}

      </div>
    </div>
  );
};
