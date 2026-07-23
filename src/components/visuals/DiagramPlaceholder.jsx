import React from 'react';
import { motion } from 'framer-motion';
import { Network, ArrowRight } from 'lucide-react';

export const DiagramPlaceholder = ({ visualData }) => {
  const { title = "Process Architecture Diagram", nodes = ["Input PDF", "AI Parser", "Animated Player", "MCQ Exam"] } = visualData || {};

  return (
    <div className="w-full flex flex-col gap-4 p-4 md:p-6 bg-slate-900/90 text-white rounded-2xl border-2 border-slate-700 backdrop-blur-md">
      <h3 className="font-heading font-black text-lg uppercase text-warning-yellow border-b border-slate-800 pb-2 flex items-center gap-2">
        <Network size={18} className="text-brand-red" /> {title}
      </h3>

      <div className="flex flex-wrap items-center justify-center gap-3 my-4">
        {nodes.map((nd, idx) => (
          <React.Fragment key={idx}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.15 }}
              className="bg-slate-800 border-2 border-slate-700 hover:border-brand-red p-3 rounded-xl shadow-[3px_3px_0px_#000] text-center font-heading font-black text-xs md:text-sm text-slate-100 uppercase min-w-[110px]"
            >
              {nd}
            </motion.div>
            {idx < nodes.length - 1 && (
              <ArrowRight size={18} className="text-warning-yellow animate-pulse flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
