import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen } from 'lucide-react';

export const HeadingIntro = ({ visualData, speaker1, speaker2, isSpeaker1Speaking, isSpeaker2Speaking }) => {
  const { heading, subheading, highlights = [] } = visualData || {};

  return (
    <div className="w-full flex flex-col gap-6 p-4 md:p-6 bg-slate-900/90 text-white rounded-2xl border-2 border-slate-700 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-2 border-b-2 border-slate-800 pb-4 text-center md:text-left"
      >
        <div className="inline-flex items-center gap-2 text-warning-yellow font-heading font-black text-xs uppercase tracking-widest">
          <Sparkles size={14} /> CHAPTER ORIENTATION
        </div>
        <h2 className="text-2xl md:text-4xl font-heading font-black uppercase text-white tracking-tight leading-snug">
          {heading || "Document Overview"}
        </h2>
        {subheading && (
          <p className="font-body text-xs md:text-sm text-slate-300 font-bold leading-relaxed">
            {subheading}
          </p>
        )}
      </motion.div>

      {/* Dynamic Speakers Stage */}
      <div className="grid grid-cols-2 gap-4 my-2">
        <motion.div 
          animate={{ scale: isSpeaker1Speaking ? 1.05 : 0.98 }}
          className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
            isSpeaker1Speaking ? 'bg-slate-800 border-brand-red shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-slate-950/60 border-slate-800 opacity-75'
          }`}
        >
          <span className="text-3xl mb-1">{speaker1?.avatar || "👩‍💼"}</span>
          <span className="font-heading font-black text-xs text-white uppercase">{speaker1?.speaker || "Lead Speaker"}</span>
          <span className="text-[10px] text-slate-400 font-mono">{speaker1?.role || "Subject Matter Expert"}</span>
        </motion.div>

        <motion.div 
          animate={{ scale: isSpeaker2Speaking ? 1.05 : 0.98 }}
          className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
            isSpeaker2Speaking ? 'bg-slate-800 border-warning-yellow shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-slate-950/60 border-slate-800 opacity-75'
          }`}
        >
          <span className="text-3xl mb-1">{speaker2?.avatar || "👨‍💼"}</span>
          <span className="font-heading font-black text-xs text-white uppercase">{speaker2?.speaker || "Domain Specialist"}</span>
          <span className="text-[10px] text-slate-400 font-mono">{speaker2?.role || "Quality Analyst"}</span>
        </motion.div>
      </div>

      {highlights.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
          {highlights.map((h, i) => (
            <motion.span 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-mono font-bold px-3 py-1 rounded-full inline-flex items-center gap-1"
            >
              <BookOpen size={10} className="text-brand-red" /> {h}
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
};
