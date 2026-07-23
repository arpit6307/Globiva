import React from 'react';
import { motion } from 'framer-motion';
import { GitCommit } from 'lucide-react';

export const Timeline = ({ visualData }) => {
  const { heading = "Process Workflow Timeline", steps = [] } = visualData || {};

  return (
    <div className="w-full flex flex-col gap-4 p-4 md:p-6 bg-slate-900/90 text-white rounded-2xl border-2 border-slate-700 backdrop-blur-md">
      <h3 className="font-heading font-black text-lg uppercase text-warning-yellow border-b border-slate-800 pb-2 flex items-center gap-2">
        <GitCommit size={18} className="text-brand-red" /> {heading}
      </h3>

      <div className="relative pl-6 border-l-2 border-brand-red/50 flex flex-col gap-4 my-2">
        {steps.map((st, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="relative flex flex-col gap-1 bg-slate-800/80 p-3 rounded-xl border border-slate-700"
          >
            {/* Dot node */}
            <div className="absolute -left-[31px] top-3.5 w-4 h-4 rounded-full bg-brand-red border-2 border-slate-900 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            <span className="font-heading font-black text-xs text-warning-yellow uppercase">STEP {i + 1}: {st.title || `Phase ${i + 1}`}</span>
            <p className="font-body text-xs md:text-sm font-bold text-slate-200">{st.description || st}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
