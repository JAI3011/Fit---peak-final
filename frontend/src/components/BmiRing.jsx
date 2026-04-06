import React from 'react';
import { motion } from 'framer-motion';

const BmiRing = ({ bmi }) => {
  // ✅ Define all sizing from one source of truth
  const SIZE = 96;          // matches w-24 h-24 (24 * 4 = 96px)
  const CENTER = SIZE / 2;  // 48
  const RADIUS = 36;
  const STROKE = 6;
  const circumference = 2 * Math.PI * RADIUS;

  const numericBMI = Number(bmi);
  const safeProgress = Number.isFinite(numericBMI)
    ? Math.min(Math.max((numericBMI - 15) / 20 * 100, 0), 100)
    : 0;
  const offset = circumference - (safeProgress / 100) * circumference;

  const getColor = (val) => {
    if (!Number.isFinite(val)) return '#94a3b8';
    if (val < 18.5) return '#facc15';
    if (val < 25)   return '#4ade80';
    return '#f43f5e';
  };

  return (
    // ✅ Use explicit width/height instead of Tailwind class only
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}   // ✅ viewBox now set correctly
        xmlns="http://www.w3.org/2000/svg"
        className="-rotate-90"
      >
        {/* Track circle */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke="currentColor"
          strokeWidth={STROKE}
          fill="transparent"
          className="text-white/10"
        />
        {/* Progress circle */}
        <motion.circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke={getColor(numericBMI)}
          strokeWidth={STROKE}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>

      {/* Label — rotate back since parent SVG is rotated */}
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold">
          {Number.isFinite(numericBMI) ? numericBMI : '—'}
        </span>
      </div>
    </div>
  );
};

export default BmiRing;
