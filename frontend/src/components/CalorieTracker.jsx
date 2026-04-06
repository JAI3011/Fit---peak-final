import React from 'react';

const CalorieTracker = ({ current, goal }) => {
  const progress = Math.min((current / goal) * 100, 100);

  return (
    <div className="space-y-2 mt-4">
      <div className="flex justify-between text-xs text-zinc-400">
        <span>Daily Intake</span>
        <span>{current} / {goal} kcal</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 shadow-[0_0_10px_#22d3ee] rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-[10px] text-zinc-500 text-right italic">
        {goal - current > 0 ? `${goal - current} kcal remaining` : 'Goal reached!'}
      </div>
    </div>
  );
};

export default CalorieTracker;
