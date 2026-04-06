import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Bookmark, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ArticleCard({ article }) {
  const location = useLocation();
  const isUserSection = location.pathname.startsWith('/user');
  const detailPath = isUserSection ? `/user/article/${article.slug}` : `/article/${article.slug}`;
  
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('fitpeak-saved-articles') || '[]');
    setIsSaved(saved.includes(article.id));
  }, [article.id]);

  const toggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = JSON.parse(localStorage.getItem('fitpeak-saved-articles') || '[]');
    let updated;
    if (isSaved) {
      updated = saved.filter(id => id !== article.id);
    } else {
      updated = [...saved, article.id];
    }
    localStorage.setItem('fitpeak-saved-articles', JSON.stringify(updated));
    setIsSaved(!isSaved);
    // Dispatch custom event for Library to sync
    window.dispatchEvent(new Event('saved-articles-updated'));
  };

  // Dynamic reading time estimate
  const charCount = article.content?.length || 0;
  const wordCount = charCount / 5; // average word length
  const readTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 wpm

  return (
    <div className="glass-panel rounded-2xl overflow-hidden hover:scale-[1.02] transition-all group border border-white/5 hover:border-cyan-400/30">
      <div className="relative h-48">
        <img 
          src={article.image} 
          alt={article.title} 
          className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        
        {/* Top Info Badge */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-cyan-500/20">
            {article.category}
          </span>
        </div>

        {/* Bookmark Action */}
        <button 
          onClick={toggleSave}
          className={`absolute top-4 right-4 p-2 rounded-xl backdrop-blur-md border transition-all
            ${isSaved 
              ? 'bg-cyan-500 border-cyan-400 text-black scale-110' 
              : 'bg-black/40 border-white/10 text-white hover:bg-black/60 hover:border-white/20'
            }`}
        >
          <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
        </button>

        {/* Quick Read Time */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white/80 text-[10px] font-bold uppercase tracking-widest bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
          <Clock size={12} className="text-cyan-400" /> {readTime} min read
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center text-[10px] text-gray-500 mb-3 font-black uppercase tracking-[0.2em]">
          <span>{article.author}</span>
          <span>{new Date(article.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        
        <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-cyan-400 transition-colors line-clamp-2 h-14 tracking-tight">
          {article.title}
        </h3>
        
        <p className="text-gray-400 mb-6 text-sm leading-relaxed line-clamp-2 opacity-80 group-hover:opacity-100 transition-opacity">
          {article.excerpt}
        </p>

        <Link
          to={detailPath}
          className="inline-flex items-center gap-2 text-cyan-400 font-black uppercase tracking-widest hover:gap-4 transition-all text-[11px] group/link"
        >
          Read insight <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}