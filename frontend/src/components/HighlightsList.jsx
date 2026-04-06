import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import VideoHighlightCard from './VideoHighlightCard';
import { highlightAPI } from '../services/api';

const HighlightsList = ({ maxItems = 6, category = null }) => {
const [highlights, setHighlights] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchHighlights = async () => {
    try {
        const res = await highlightAPI.getAll();
        let items = res.data;
        if (category) {
        items = items.filter(item => item.category === category);
        }
        setHighlights(items.slice(0, maxItems));
    } catch (err) {
        console.error('Failed to fetch highlights', err);
    } finally {
        setLoading(false);
    }
    };
    fetchHighlights();
}, [maxItems, category]);

if (loading) {
    return (
    <div className="flex justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-cyan-400" />
    </div>
    );
}

if (highlights.length === 0) {
    return (
    <div className="text-center py-12 text-zinc-500">
        No fitness highlights available yet. Check back soon!
    </div>
    );
}

return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {highlights.map((highlight) => (
        <VideoHighlightCard key={highlight.id} highlight={highlight} />
    ))}
    </div>
);
};

export default HighlightsList;