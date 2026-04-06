import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, X, CheckCircle2, Loader } from 'lucide-react';
import { useFeedback } from '../contexts/FeedbackContext';
import { useAuth } from '../context/AuthContext';
import { feedbackAPI } from '../services/api';

const FeedbackModal = ({ isOpen, onClose }) => {
  const { addFeedback } = useFeedback();
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [type, setType] = useState('General Feedback');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const feedbackTypes = [
    'Bug Report',
    'Feature Request',
    'General Feedback',
    'Trainer Feedback'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      // ✅ Use context addFeedback (which calls API internally)
      await addFeedback({
        rating,
        type,
        comment,
      });

      setIsSubmitting(false);
      setIsSubmitted(true);

      setTimeout(() => {
        setIsSubmitted(false);
        setRating(0);
        setType('General Feedback');
        setComment('');
        onClose();
      }, 2500);

    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass-panel p-1 rounded-3xl overflow-hidden"
          >
            <div className="bg-darkBg/90 p-8 rounded-[22px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-purple-400" />
                  Share Your Feedback
                </h2>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-12 text-center"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-400/10 mb-6">
                    <CheckCircle2 className="w-10 h-10 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Thank you! 🙏</h3>
                  <p className="text-zinc-400">Your feedback helps us peak higher.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Rating */}
                  <div>
                    <label className="block text-xs font-black tracking-widest text-zinc-500 uppercase mb-3">
                      Rate your experience
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHover(star)}
                          onMouseLeave={() => setHover(0)}
                          className="transition-transform active:scale-90"
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              (hover || rating) >= star
                                ? 'fill-cyan-400 text-cyan-400'
                                : 'text-zinc-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Type */}
                  <div>
                    <label className="block text-xs font-black tracking-widest text-zinc-500 uppercase mb-3">
                      Feedback Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-cyan-400/50 transition-colors"
                    >
                      {feedbackTypes.map(t => (
                        <option key={t} value={t} className="bg-darkBg">{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Textarea */}
                  <div>
                    <label className="block text-xs font-black tracking-widest text-zinc-500 uppercase mb-3">
                      Your thoughts
                    </label>
                    <textarea
                      required
                      placeholder="Tell us what you think..."
                      rows="4"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-purple-400/50 transition-colors resize-none custom-scrollbar"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-8 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-sm uppercase"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 neon-button px-8 py-3 rounded-xl font-black text-white text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed grayscale' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        'Submit Feedback'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;