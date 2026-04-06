import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { trainerData } from '../data/trainerData';

const AssignmentModal = ({ isOpen, onClose, type, onAssign }) => {
  if (!isOpen) return null;

  const data = type === 'workout' ? trainerData.templates.workouts : trainerData.templates.dietPlans;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg glass-panel p-8 rounded-[2rem] border-white/10 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase font-jakarta">
            Assign New {type === 'workout' ? 'Workout' : 'Meal Plan'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {data.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onAssign(item);
                onClose();
              }}
              className="w-full text-left p-4 bg-white/5 border border-white/5 hover:border-cyan-400/30 rounded-2xl group transition-all"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{item.name}</h4>
                  <p className="text-xs text-zinc-500 uppercase font-black tracking-widest mt-1">
                    {type === 'workout' ? `${item.duration} • ${item.intensity}` : `${item.calories} kcal • ${item.goal}`}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-cyan-400/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Check className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
            </button>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 py-4 glass-panel border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all rounded-2xl"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
};

export default AssignmentModal;
