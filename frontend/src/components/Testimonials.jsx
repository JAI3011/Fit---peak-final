import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Card from './Card';
import api from '../services/api';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.12,
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const Testimonials = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicFeedback = async () => {
      try {
        const res = await api.get('/feedback/public');
        setFeedbackList(res.data);
      } catch (err) {
        console.error('Failed to fetch public feedback', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicFeedback();
  }, []);

  const filtered = feedbackList.filter(item => item.comment && item.comment.trim().length >= 10).slice(0, 6);

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mt-4 text-gray-400 max-w-3xl mx-auto">Loading testimonials...</p>
        </div>
      </section>
    );
  }

  if (!filtered || filtered.length === 0) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gradient">What users are saying</h2>
          <p className="mt-4 text-gray-400 max-w-3xl mx-auto">No testimonials yet. Submit feedback from your dashboard to populate this section.</p>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="py-20 px-4"
    >
      <div className="max-w-7xl mx-auto mb-10 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gradient">What users are saying</h2>
        <p className="mt-4 text-gray-400 max-w-3xl mx-auto">Real feedback from real FitPeak users, refined for transformation results.</p>
      </div>

      <motion.div className="max-w-7xl mx-auto grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3" variants={containerVariants}>
        {filtered.map((feedback) => (
          <motion.div key={feedback._id || feedback.id || Math.random()} variants={itemVariants}>
            <Card className="h-full">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`w-4 h-4 ${index < (feedback.rating || 5) ? 'text-yellow-400' : 'text-gray-600'}`}
                  />
                ))}
              </div>
              <p className="text-gray-200 italic mb-5">
                "{feedback.comment.trim()}"
              </p>
              <div className="text-sm text-gray-300">
                <p className="font-semibold text-white">{feedback.userName || feedback.name || 'Anonymous'}</p>
                {feedback.type && <p className="text-cyan-300">{feedback.type}</p>}
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
};

export default Testimonials;