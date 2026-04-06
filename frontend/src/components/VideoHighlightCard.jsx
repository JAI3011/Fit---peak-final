import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, ArrowLeft } from 'lucide-react';
import Card from './Card';

// Robust YouTube ID extraction – works for:
// - https://youtu.be/VIDEO_ID?si=...
// - https://www.youtube.com/watch?v=VIDEO_ID&...
// - https://www.youtube.com/embed/VIDEO_ID
// - https://www.youtube.com/shorts/VIDEO_ID
const getYouTubeVideoId = (url) => {
if (!url || typeof url !== 'string') return null;

  // Remove any leading/trailing whitespace
url = url.trim();

  // Handle youtu.be format (including query parameters after the ID)
if (url.includes('youtu.be/')) {
    const afterDomain = url.split('youtu.be/')[1];
    // Split on '?' to remove any query parameters (like ?si=...)
    const videoId = afterDomain.split('?')[0];
    return videoId.length === 11 ? videoId : null;
}

try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com')) {
      // Standard watch?v=...
    let videoId = urlObj.searchParams.get('v');
    if (videoId) return videoId;

      // /embed/...
    if (urlObj.pathname.includes('/embed/')) {
        videoId = urlObj.pathname.split('/embed/')[1].split('?')[0];
        return videoId.length === 11 ? videoId : null;
    }

      // /shorts/...
    if (urlObj.pathname.includes('/shorts/')) {
        videoId = urlObj.pathname.split('/shorts/')[1].split('?')[0];
        return videoId.length === 11 ? videoId : null;
    }
    }
} catch (e) {
    console.warn('Invalid YouTube URL:', url);
    return null;
}
return null;
};

const VideoModal = ({ isOpen, onClose, videoId, title }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEsc);
      return () => {
        window.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl pointer-events-auto">
      {/* Clickable Backdrop */}
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={onClose}
      />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl z-10 flex flex-col gap-4 pointer-events-auto"
      >
        {/* Header - Now part of the flex flow, not outside */}
        <div className="flex justify-between items-center px-2">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-zinc-400 hover:text-cyan-400 transition-all font-bold group select-none py-2"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-lg">Back</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-red-400 transition-all hover:scale-110 select-none"
            aria-label="Close modal"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Video Player */}
        <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.1)] border border-white/10 bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

const VideoHighlightCard = ({ highlight }) => {
const [isModalOpen, setIsModalOpen] = useState(false);
const videoId = getYouTubeVideoId(highlight.youtubeUrl);
const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

// Debugging Log to verify extraction
console.log(`[Highlight] URL: ${highlight.youtubeUrl} -> ID: ${videoId}`);

const handleClick = () => {
    if (videoId) {
    setIsModalOpen(true);
    } else {
    // If extraction fails, fallback to opening the raw URL in a new tab
    window.open(highlight.youtubeUrl, '_blank');
    }
};

return (
    <>
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group cursor-pointer"
        onClick={handleClick}
    >
        <Card className="p-4 hover:border-cyan-400/30 transition-all h-full flex flex-col">
        <div className="aspect-video rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 mb-4 flex items-center justify-center relative overflow-hidden">
            {thumbnailUrl ? (
            <img
                src={thumbnailUrl}
                alt={highlight.title}
                className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-500"
            />
            ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center">
                <Play className="w-8 h-8 text-cyan-400/50 mb-2" />
                <p className="text-xs text-zinc-500">External Video</p>
            </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-10 h-10 text-white" />
            </div>
        </div>
        <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">
            {highlight.title}
        </h4>
        {highlight.category && (
            <p className="text-xs text-zinc-500 mt-1">{highlight.category}</p>
        )}
        </Card>
    </motion.div>

    <AnimatePresence>
        {isModalOpen && (
        <VideoModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            videoId={videoId}
            title={highlight.title}
        />
        )}
    </AnimatePresence>
    </>
);
};

export default VideoHighlightCard;