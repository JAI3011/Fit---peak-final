import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap } from 'lucide-react';
import MovementModal from './MovementModal';

export default function MovementCard({ movement }) {
  const [isOpen, setIsOpen] = useState(false);

  const difficultyColors = {
    Beginner: 'text-green-400 bg-green-500/10 border-green-500/20',
    Intermediate: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    Advanced: 'text-red-400 bg-red-500/10 border-red-500/20'
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -8 }}
        onClick={() => setIsOpen(true)}
        className="group relative aspect-square rounded-[2rem] overflow-hidden border border-white/5 hover:border-cyan-400/50 transition-all duration-500 cursor-pointer shadow-2xl shadow-black/50"
      >
        {/* Visual Background */}
        <img 
          src={movement.image} 
          alt={movement.name} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Content Overlay */}
        <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
          <div className="flex justify-between items-start">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${difficultyColors[movement.difficulty]}`}>
              {movement.difficulty}
            </span>
            <div className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <Zap size={20} />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.3em] mb-2">{movement.category}</p>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-6">
              {movement.name}
            </h3>

            {/* Technical Cues (Sneak Peek) */}
            <div className="space-y-3">
              {movement.cues.slice(0, 3).map((cue, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0 border border-cyan-500/30">
                    <ShieldCheck size={12} className="text-cyan-400" />
                  </div>
                  <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{cue}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Border Effect */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <MovementModal 
            isOpen={isOpen} 
            onClose={() => setIsOpen(false)} 
            movement={movement} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
