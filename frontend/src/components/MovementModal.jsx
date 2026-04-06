import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Zap, Info, Bookmark, Play, ArrowLeft } from 'lucide-react';

const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&]+)/);
  return match ? match[1] : null;
};

export default function MovementModal({ isOpen, onClose, movement }) {
  const videoId = getYouTubeVideoId(movement.videoUrl);

  useEffect(() => {
    if (isOpen) {
        document.body.style.overflow = 'hidden';
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
        <div className="absolute inset-0 cursor-pointer" onClick={onClose} />
        
        <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#020617] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.1)] max-h-[90vh] overflow-y-auto lg:overflow-visible no-scrollbar"
        >
            {/* Header / Actions */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
                <button 
                  onClick={onClose} 
                  className="pointer-events-auto flex items-center gap-2 text-zinc-400 hover:text-cyan-400 transition-all font-bold group bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10"
                >
                  <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
                </button>
                <div className="flex gap-2 pointer-events-auto">
                    <button className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-zinc-400 hover:text-pink-500 transition-colors">
                        <Bookmark size={20} />
                    </button>
                    <button onClick={onClose} className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-zinc-400 hover:text-red-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Left Column: Video Loop */}
            <div className="lg:col-span-7 flex items-center justify-center bg-black relative min-h-[400px] lg:h-[600px]">
                {videoId ? (
                    <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&playlist=${videoId}&loop=1&mute=1&controls=0&rel=0`}
                        title={movement.name}
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <Play size={40} className="text-cyan-400 opacity-50" />
                        </div>
                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Video format pending</p>
                    </div>
                )}
                
                {/* Visual Label */}
                <div className="absolute bottom-6 left-6 px-4 py-2 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-cyan-500/20">
                    Live Demo
                </div>
            </div>

            {/* Right Column: Coaching Details */}
            <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center overflow-y-auto no-scrollbar">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-cyan-400 text-[11px] font-black uppercase tracking-[0.3em]">Strategy Card</span>
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-white italic uppercase tracking-tighter leading-tight mb-4">
                        {movement.name}
                    </h2>
                    <p className="text-zinc-400 text-lg leading-relaxed font-medium">
                        {movement.description}
                    </p>
                </div>

                {/* Technical Checklist */}
                <div className="space-y-4 mb-10">
                    <h3 className="text-xs font-black uppercase text-zinc-500 tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Zap size={14} className="text-cyan-400" /> Professional Cues
                    </h3>
                    {movement.cues.map((cue, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/5 hover:border-cyan-400/20 transition-all cursor-default group">
                            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                                <ShieldCheck size={14} />
                            </div>
                            <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{cue}</span>
                        </div>
                    ))}
                </div>

                {/* Expert Tip Box */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Info size={40} />
                    </div>
                    <p className="text-[10px] font-black uppercase text-cyan-400 tracking-widest mb-2 flex items-center gap-2">
                        <Zap size={12} className="text-yellow-400" /> Expert Pro Tip
                    </p>
                    <p className="text-sm text-cyan-50 font-bold leading-relaxed">
                        "{movement.proTip}"
                    </p>
                </div>
            </div>
        </motion.div>
    </div>,
    document.body
  );
}
