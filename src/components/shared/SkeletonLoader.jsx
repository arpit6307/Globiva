import React from 'react';

export const SkeletonLoader = ({ type = 'dashboard', count = 3 }) => {
  // Repeating pulsing animation wrapper class
  const pulseClass = "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse rounded-xl border border-slate-800/10";

  if (type === 'dashboard') {
    return (
      <div className="flex-1 flex flex-col gap-8 w-full">
        
        {/* Mock Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-36 p-5 flex flex-col justify-between ${pulseClass}`}>
              <div className="w-20 h-3 bg-gray-300 rounded" />
              <div className="w-16 h-8 bg-gray-300 rounded" />
            </div>
          ))}
        </div>

        {/* Mock Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-2 h-[380px] p-6 ${pulseClass}`}>
            <div className="w-48 h-4 bg-gray-300 rounded mb-6" />
            <div className="w-full h-64 bg-gray-250 rounded-xl" />
          </div>
          <div className={`h-[380px] p-6 ${pulseClass}`}>
            <div className="w-32 h-4 bg-gray-300 rounded mb-6" />
            <div className="w-full h-64 bg-gray-250 rounded-xl" />
          </div>
        </div>

      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full flex flex-col gap-4">
        {/* Mock Table Header */}
        <div className={`h-12 w-full ${pulseClass} flex items-center justify-between px-6`}>
          <div className="w-24 h-4 bg-gray-300 rounded" />
          <div className="w-36 h-4 bg-gray-300 rounded" />
          <div className="w-20 h-4 bg-gray-300 rounded" />
        </div>
        
        {/* Mock Table Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-16 w-full ${pulseClass} flex items-center justify-between px-6`}>
            <div className="w-32 h-3 bg-gray-300 rounded" />
            <div className="w-48 h-3 bg-gray-300 rounded" />
            <div className="w-16 h-6 bg-gray-300 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`h-72 p-6 flex flex-col justify-between ${pulseClass}`}>
            <div className="flex flex-col gap-3">
              <div className="w-24 h-5 bg-gray-300 rounded-md" />
              <div className="w-40 h-4 bg-gray-300 rounded mt-2" />
              <div className="w-full h-3 bg-gray-300 rounded mt-1" />
              <div className="w-5/6 h-3 bg-gray-300 rounded" />
            </div>
            <div className="w-28 h-6 bg-gray-300 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
