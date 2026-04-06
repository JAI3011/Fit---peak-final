import React from 'react';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const StreakCounter = ({ days }) => {
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full"
    >
      <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
      <span className="text-sm font-bold text-orange-500">{days} Day Streak!</span>
    </motion.div>
  );
};

export default StreakCounter;
