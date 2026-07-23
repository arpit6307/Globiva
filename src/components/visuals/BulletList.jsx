import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const BulletList = ({ visualData }) => {
  const { heading, points = [] } = visualData || {};

  return (
    <div className="w-full flex flex-col gap-4 p-4 md:p-6 bg-slate-900/90 text-white rounded-2xl border-2 border-slate-700 backdrop-blur-md">
      {heading && (
        <h3 className="font-heading font-black text-lg md:text-xl uppercase text-warning-yellow border-b border-slate-800 pb-2 flex items-center gap-2">
          <ArrowRight size={18} className="text-brand-red" /> {heading}
        </h3>
      )}

      <div className="flex flex-col gap-3 my-1">
        {points.map((pt, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.15 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-brand-red/50 transition-all shadow-sm"
          >
            <CheckCircle2 size={18} className="text-success-green flex-shrink-0 mt-0.5" />
            <p className="font-body text-xs md:text-sm font-bold text-slate-100 leading-relaxed">
              {pt}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
