import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Circle, AlertTriangle, X } from 'lucide-react';

const STAGES = [
  { id: 'queued', label: 'Queued' },
  { id: 'extracting', label: 'Extracting PDF' },
  { id: 'analyzing', label: 'Analyzing Content' },
  { id: 'scripting', label: 'Generating Script' },
  { id: 'generating_mcqs', label: 'Generating Questions' },
  { id: 'creating_narration', label: 'Creating Narration' },
  { id: 'rendering_video', label: 'Rendering Video' },
  { id: 'done', label: 'Complete' }
];

export const ProgressTracker = ({ jobId, onComplete, onError, onClose }) => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let interval;
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/status/${jobId}`);
        const data = await response.json();
        setStatus(data);

        if (data.stage === 'done') {
          clearInterval(interval);
          onComplete(data.result);
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
  }, [jobId, onComplete, onError]);

  const displayStages = STAGES.filter(s => s.id !== 'queued' && s.id !== 'done');

  const getDisplayCurrentIdx = () => {
    if (!status) return -1;
    if (status.stage === 'done') return displayStages.length;
    if (status.stage === 'queued') return -1;
    return displayStages.findIndex(s => s.id === status.stage);
  };

  const displayIdx = getDisplayCurrentIdx();

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl w-full max-w-md p-6 relative flex flex-col gap-6">
        
        <div className="flex justify-between items-start border-b-3 border-slate-800 pb-4">
          <h2 className="font-heading font-black text-2xl uppercase tracking-tight text-slate-800">GENERATING COURSE...</h2>
          <button 
            onClick={onClose}
            className="p-1 border-2 border-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {displayStages.map((stage, idx) => {
            const isCompleted = displayIdx > idx || status?.stage === 'done';
            const isCurrent = displayIdx === idx && status?.stage !== 'done' && status?.stage !== 'failed';

            return (
              <div key={stage.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center mt-1">
                  {isCompleted ? (
                    <CheckCircle2 className="text-success-green" size={24} />
                  ) : isCurrent ? (
                    <Loader2 className="text-brand-red animate-spin" size={24} />
                  ) : (
                    <Circle className="text-slate-300" size={24} />
                  )}
                  {idx < displayStages.length - 1 && (
                    <div className={`w-1 h-8 mt-1 rounded ${isCompleted ? 'bg-success-green' : 'bg-slate-200'}`} />
                  )}
                </div>
                
                <div className={`flex flex-col flex-1 ${isCurrent ? 'animate-pulse' : ''}`}>
                  <span className={`font-heading font-black uppercase tracking-wide text-sm ${isCompleted || isCurrent ? 'text-slate-800' : 'text-slate-400'}`}>
                    {stage.label}
                  </span>
                  {isCurrent && status?.detail && (
                    <span className="font-body font-bold text-xs text-slate-500 mt-1">
                      {status.detail}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {status?.stage === 'failed' && (
          <div className="bg-error-red/10 border-2 border-error-red rounded-xl p-4 flex gap-3 items-start mt-2">
            <AlertTriangle className="text-error-red shrink-0" size={20} />
            <div className="flex flex-col gap-2">
              <span className="font-heading font-black text-error-red uppercase text-sm">Generation Failed</span>
              <span className="font-body font-bold text-slate-700 text-xs">{status.error || 'Unknown error occurred.'}</span>
              <button 
                onClick={onClose}
                className="mt-2 bg-white border-2 border-error-red text-error-red font-heading font-black text-xs px-4 py-2 rounded-lg hover:bg-error-red hover:text-white transition-colors self-start cursor-pointer"
              >
                DISMISS
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
