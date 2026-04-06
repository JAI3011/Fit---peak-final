import React from 'react';

const MacroSummary = ({ protein, carbs, fats }) => {
  const total = protein + carbs + fats;
  const pWidth = total > 0 ? (protein / total) * 100 : 0;
  const cWidth = total > 0 ? (carbs / total) * 100 : 0;
  const fWidth = total > 0 ? (fats / total) * 100 : 0;

  return (
    <div className="space-y-3 mt-4">
      <div className="h-3 w-full flex rounded-full overflow-hidden bg-white/5">
        <div style={{ width: `${pWidth}%` }} className="h-full bg-blue-400" title={`Protein: ${protein}g`} />
        <div style={{ width: `${cWidth}%` }} className="h-full bg-green-400" title={`Carbs: ${carbs}g`} />
        <div style={{ width: `${fWidth}%` }} className="h-full bg-orange-400" title={`Fats: ${fats}g`} />
      </div>
      <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-blue-400">Protein {protein}g</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-green-400">Carbs {carbs}g</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-orange-400" />
          <span className="text-orange-400">Fats {fats}g</span>
        </div>
      </div>
    </div>
  );
};

export default MacroSummary;
