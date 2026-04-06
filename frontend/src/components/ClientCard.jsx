import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Target, Clock, ChevronRight } from 'lucide-react';

const ClientCard = ({ client, user, onClick }) => {
  const navigate = useNavigate();
  const userData = client || user || {};
  const name = userData.name || "Anonymous";
  const avatar = userData.avatar || name[0];
  const goal = userData.goal || "Fitness Goal";
  const bmi = userData.bmi || "N/A";
  const progress = userData.progress || 0;
  const lastActivity = userData.lastActive || userData.lastCheckIn || "No record";

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (userData.id) {
      navigate(`/trainer/client/${userData.id}`);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={handleClick}
      className="glass-panel p-6 cursor-pointer group hover:border-cyan-400/30 transition-all relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center font-black text-white shadow-lg">
            {avatar}
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">{name}</h3>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400">
              <Target className="w-3 h-3" />
              <span>{goal}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">BMI</p>
          <span className="text-xl font-black text-white">{bmi}</span>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-zinc-500 font-bold uppercase tracking-tighter">Engagement</span>
          <span className="text-cyan-400 font-black">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
          />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase">
          <Clock className="w-3 h-3" />
          <span>{lastActivity}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  );
};

export default ClientCard;
