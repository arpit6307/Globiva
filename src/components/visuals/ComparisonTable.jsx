import React from 'react';
import { motion } from 'framer-motion';
import { Columns } from 'lucide-react';

export const ComparisonTable = ({ visualData }) => {
  const { headers = ["Parameter", "Standard Protocol", "Key Value"], rows = [], tableRows = [] } = visualData || {};
  const displayRows = tableRows.length > 0 ? tableRows : rows;

  return (
    <div className="w-full flex flex-col gap-4 p-4 md:p-6 bg-slate-900/90 text-white rounded-2xl border-2 border-slate-700 backdrop-blur-md overflow-x-auto">
      <div className="flex items-center gap-2 text-warning-yellow font-heading font-black text-xs uppercase tracking-widest border-b border-slate-800 pb-2">
        <Columns size={16} /> COMPARISON MATRIX
      </div>

      <table className="w-full text-left border-collapse min-w-[300px]">
        <thead>
          <tr className="border-b-2 border-slate-700 bg-slate-800/80">
            {headers.map((h, i) => (
              <th key={i} className="p-2.5 font-heading font-black text-xs uppercase text-brand-red tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, rIdx) => {
            const cells = Array.isArray(row) ? row : (typeof row === 'object' ? Object.values(row) : [row]);
            return (
              <motion.tr
                key={rIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rIdx * 0.1 }}
                className="border-b border-slate-800/80 hover:bg-slate-800/40"
              >
                {cells.map((cell, cIdx) => (
                  <td key={cIdx} className="p-2.5 font-body font-bold text-xs md:text-sm text-slate-200">
                    {String(cell)}
                  </td>
                ))}
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
