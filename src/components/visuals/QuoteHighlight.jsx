import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export const QuoteHighlight = ({ visualData }) => {
  const { quote, author, highlightKey } = visualData || {};

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 md:p-8 bg-slate-900/90 text-white rounded-2xl border-3 border-brand-red/80 shadow-[6px_6px_0px_#000] backdrop-blur-md text-center relative overflow-hidden">
      <Quote size={48} className="text-brand-red/30 absolute -top-2 -left-2 rotate-180 pointer-events-none" />
      
      {highlightKey && (
        <span className="bg-brand-red text-white text-[10px] font-heading font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 border border-slate-800 shadow-[2px_2px_0px_#000]">
          {highlightKey}
        </span>
      )}

      <motion.p
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="font-heading font-black text-lg md:text-2xl text-slate-100 uppercase leading-relaxed tracking-tight"
      >
        "{quote || "Operational excellence is achieved through adherence to verified documentation principles."}"
      </motion.p>

      {author && (
        <span className="font-mono text-xs text-warning-yellow mt-3 font-bold block uppercase">
          &mdash; {author}
        </span>
      )}
    </div>
  );
};
