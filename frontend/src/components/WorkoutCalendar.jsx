import React from 'react';

const WorkoutCalendar = () => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dates = [
    { day: 19, status: 'done' },
    { day: 20, status: 'missed' },
    { day: 21, status: 'done' },
    { day: 22, status: 'done' },
    { day: 23, status: 'current' },
    { day: 24, status: 'future' },
    { day: 25, status: 'future' },
  ];

  return (
    <div className="mt-4">
      <div className="grid grid-cols-7 gap-2 text-center text-[10px] text-zinc-500 mb-2">
        {days.map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {dates.map((date, i) => (
          <div 
            key={i} 
            className={`h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
              date.status === 'done' ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30' :
              date.status === 'missed' ? 'bg-red-400/10 text-red-400/50 border border-red-400/10' :
              date.status === 'current' ? 'bg-white/10 text-white border border-white/30 animate-pulse' :
              'bg-white/5 text-zinc-600 border border-white/5'
            }`}
          >
            {date.day}
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4 text-[10px] text-zinc-500">
        <span>Mar 2026</span>
        <button className="text-cyan-400 hover:underline">Full History</button>
      </div>
    </div>
  );
};

export default WorkoutCalendar;
