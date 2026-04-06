import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Star, Filter, Search, MessageSquare, Loader } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/Card';
import { useFeedback } from '../../contexts/FeedbackContext';

const AdminFeedback = () => {
  const { feedbackList, deleteFeedback, loading } = useFeedback();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredFeedback = feedbackList.filter(fb => {
    const name = fb.user_name || fb.userName || '';
    const comment = fb.comment || '';
    const matchesSearch =
      comment.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || fb.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // ✅ Show loading spinner while fetching
  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center p-12">
          <Loader className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      </DashboardLayout>
    );
  }

  const getRatingStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= rating ? 'fill-cyan-400 text-cyan-400' : 'text-zinc-600'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">User Feedback</h1>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by user or comment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="all">All Types</option>
              <option value="Bug Report">Bug Report</option>
              <option value="Feature Request">Feature Request</option>
              <option value="General Feedback">General Feedback</option>
              <option value="Trainer Feedback">Trainer Feedback</option>
            </select>
          </div>
        </div>

        {filteredFeedback.length === 0 ? (
          <Card className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">No feedback submitted yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredFeedback.map((fb) => (
              <Card key={fb.id} className="relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => deleteFeedback(fb.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete feedback"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-sm font-bold">
                        {(fb.user_name || fb.userName || 'A')[0]}
                      </div>
                      <div>
                        <p className="font-bold text-white">{fb.user_name || fb.userName || 'Anonymous'}</p>
                        <p className="text-xs text-zinc-500">{fb.user_email || fb.userEmail || ''}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        {getRatingStars(fb.rating)}
                        <span className="text-xs text-zinc-500">
                          {fb.date ? new Date(fb.date).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed">{fb.comment || ''}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      fb.type === 'Bug Report' ? 'bg-red-500/20 text-red-400' :
                      fb.type === 'Feature Request' ? 'bg-green-500/20 text-green-400' :
                      fb.type === 'Trainer Feedback' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {fb.type}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminFeedback;