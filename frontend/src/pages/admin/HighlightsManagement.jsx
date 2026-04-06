import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Save, Loader, Youtube } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/Card';
import { highlightAPI } from '../../services/api';

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

const HighlightsManagement = () => {

const [highlights, setHighlights] = useState([]);
const [loading, setLoading] = useState(true);
const [showModal, setShowModal] = useState(false);
const [editingId, setEditingId] = useState(null);
const [formData, setFormData] = useState({
    title: '',
    youtubeUrl: '',
    category: '',
});
const [errors, setErrors] = useState({});
const [saving, setSaving] = useState(false);

const fetchHighlights = async () => {
    setLoading(true);
    try {
    const res = await highlightAPI.getAll();
    setHighlights(res.data);
    } catch (err) {
    console.error('Failed to fetch highlights', err);
    } finally {
    setLoading(false);
    }
};

useEffect(() => {
    fetchHighlights();
}, []);

const handleOpenModal = (highlight = null) => {
    if (highlight) {
    setEditingId(highlight.id);
    setFormData({
        title: highlight.title,
        youtubeUrl: highlight.youtubeUrl,
        category: highlight.category || '',
    });
    } else {
    setEditingId(null);
    setFormData({ title: '', youtubeUrl: '', category: '' });
    }
    setErrors({});
    setShowModal(true);
};

const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ title: '', youtubeUrl: '', category: '' });
    setErrors({});
};

const validateForm = () => {
  const newErrors = {};
  if (!formData.title.trim()) newErrors.title = 'Title is required';
  
  const url = formData.youtubeUrl.trim();
  if (!url) {
    newErrors.youtubeUrl = 'YouTube URL is required';
  } else {
    const testId = getYouTubeVideoId(url);
    if (!testId) {
      newErrors.youtubeUrl = 'Invalid YouTube URL. Use format like: https://youtu.be/... or https://www.youtube.com/watch?v=...';
    }
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
    if (editingId) {
        await highlightAPI.update(editingId, formData);
    } else {
        await highlightAPI.create(formData);
    }
    await fetchHighlights();
    handleCloseModal();
    } catch (err) {
    console.error('Save failed', err);
    } finally {
    setSaving(false);
    }
};

const handleDelete = async (id) => {
    if (!window.confirm('Delete this video highlight?')) return;
    try {
    await highlightAPI.delete(id);
    await fetchHighlights();
    } catch (err) {
    console.error('Delete failed', err);
    }
};

// Helper to extract thumbnail for preview
const getThumbnail = (url) => {
    const id = getYouTubeVideoId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

return (
    <DashboardLayout role="admin">
    <div className="space-y-6">
        <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Fitness Video Highlights</h1>
        <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-white font-bold hover:from-cyan-400 hover:to-purple-400 transition-all"
        >
            <Plus className="w-4 h-4" />
            Add Video
        </button>
        </div>

        {loading ? (
        <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
        ) : highlights.length === 0 ? (
        <Card className="text-center py-12">
            <p className="text-zinc-400">No fitness videos added yet.</p>
        </Card>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((item) => {
            const thumb = getThumbnail(item.youtubeUrl);
            return (
                <Card key={item.id} className="relative group">
                <div className="aspect-video rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 mb-4 flex items-center justify-center">
                    {thumb ? (
                    <img
                        src={thumb}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-t-xl"
                    />
                    ) : (
                    <Youtube className="w-12 h-12 text-cyan-400" />
                    )}
                </div>
                <div className="flex justify-between items-start">
                    <div>
                    <h3 className="font-bold text-white">{item.title}</h3>
                    {item.category && (
                        <p className="text-xs text-zinc-500 mt-1">{item.category}</p>
                    )}
                    <p className="text-xs text-zinc-600 truncate mt-2">{item.youtubeUrl}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => handleOpenModal(item)}
                        className="p-2 hover:bg-purple-500/10 rounded-lg text-purple-400"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-400"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    </div>
                </div>
                </Card>
            );
            })}
        </div>
        )}
    </div>

      {/* Add/Edit Modal */}
    <AnimatePresence>
        {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6"
            >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                {editingId ? 'Edit Video' : 'Add New Video'}
                </h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-zinc-800 rounded-lg">
                <X className="w-5 h-5 text-zinc-400" />
                </button>
            </div>
            <div className="space-y-4">
                <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">
                    Title
                </label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                    placeholder="e.g., 10-Minute HIIT Workout"
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                </div>
                 <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">
                    YouTube URL
                </label>
                <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
                {errors.youtubeUrl && <p className="text-red-400 text-xs mt-1">{errors.youtubeUrl}</p>}
                </div>
                <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">
                    Category (optional)
                </label>
                <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Workout Tips, Success Story, Trainer Demo"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
                </div>
            </div>
            <div className="flex gap-3 mt-6">
                <button
                onClick={handleCloseModal}
                className="flex-1 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                Cancel
                </button>
                <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : (editingId ? 'Update' : 'Add')}
                </button>
            </div>
            </motion.div>
        </div>
        )}
    </AnimatePresence>
    </DashboardLayout>
);
};

export default HighlightsManagement;