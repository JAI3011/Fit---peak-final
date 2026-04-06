import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ArticleCard from '../components/ArticleCard';
import articlesData from '../data/articles.json';
import movementsData from '../data/movements.json';
import { Search, Sparkles, TrendingUp, Bookmark, Layers, FilterX, Youtube, Zap } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import HighlightsList from '../components/HighlightsList';
import MovementCard from '../components/MovementCard';

export default function Library() {
  const [search, setSearch] = useState("");
  const location = useLocation();
  const isUserSection = location.pathname.startsWith('/user');
  
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [savedArticles, setSavedArticles] = useState([]);

  // Load saved articles from localStorage
  useEffect(() => {
    const loadSaved = () => {
      setSavedArticles(JSON.parse(localStorage.getItem('fitpeak-saved-articles') || '[]'));
    };
    loadSaved();
    window.addEventListener('saved-articles-updated', loadSaved);
    return () => window.removeEventListener('saved-articles-updated', loadSaved);
  }, []);

  const categories = useMemo(() => {
    const cats = ["All", "Saved", ...new Set(articlesData.map(a => a.category))];
    return cats;
  }, []);

  const filteredArticles = useMemo(() => {
    return articlesData.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase()) || 
                          article.excerpt.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || 
                              (selectedCategory === "Saved" && savedArticles.includes(article.id)) ||
                              article.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory, savedArticles]);

  const filteredMovements = useMemo(() => {
    return movementsData.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || m.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const trendingArticles = useMemo(() => {
    return articlesData.filter(a => a.featured).slice(0, 3);
  }, []);

  const LibraryContent = (
    <div className="max-w-7xl mx-auto">
      {/* Search & Header */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
              KNOWLEDGE <span className="text-cyan-400">LIBRARY</span>
            </h1>
            <p className="text-gray-400 max-w-xl font-medium leading-relaxed">
              Unlock the science of high performance. curated insights on training, nutrition, and recovery.
            </p>
          </div>
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-cyan-400 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search concepts, articles..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600 font-bold"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
          <div className="flex items-center gap-2 pr-4 border-r border-white/10">
            <Layers size={16} className="text-gray-500" />
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none">Filter</span>
          </div>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                ${selectedCategory === cat 
                  ? 'bg-cyan-500 border-cyan-400 text-black shadow-lg shadow-cyan-500/20' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20'
                }
                ${cat === 'Saved' && savedArticles.length > 0 ? 'inline-flex items-center gap-2' : ''}
              `}
            >
              {cat === 'Saved' && savedArticles.length > 0 && (
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
              {cat}
            </button>
          ))}
          {selectedCategory !== "All" && (
             <button 
              onClick={() => setSelectedCategory("All")}
              className="text-gray-500 hover:text-white transition-colors p-2"
              title="Clear Filter"
            >
              <FilterX size={20} />
            </button>
          )}
        </div>
      </section>

      {/* Featured / Trending Section (Only if filtering is off) */}
      {selectedCategory === "All" && search === "" && (
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp size={24} className="text-purple-400" />
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Trending Now</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {trendingArticles.map((article, i) => (
              <motion.div 
                key={article.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={i === 0 ? "lg:col-span-8 h-[500px]" : "lg:col-span-4 h-[500px]"}
              >
                <div className="relative h-full w-full group rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  <img src={article.image} alt={article.title} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-4 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase text-cyan-400 tracking-widest">
                        {article.category}
                      </span>
                      <span className="flex items-center gap-1.5 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                        <Sparkles size={14} className="text-yellow-400" /> Featured insight
                      </span>
                    </div>
                    <h3 className={`${i === 0 ? 'text-4xl' : 'text-2xl'} font-black text-white mb-4 leading-tight group-hover:text-cyan-400 transition-colors`}>
                      {article.title}
                    </h3>
                    <motion.div 
                      whileHover={{ x: 10 }}
                      className="inline-flex items-center gap-2"
                    >
                      <button className="px-6 py-2.5 bg-cyan-500 text-black font-black uppercase text-[11px] tracking-widest rounded-full shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all">
                        Read Story
                      </button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Fitness Highlights (Video Tips) - Only if not viewing 'Saved' */}
      {selectedCategory !== "Saved" && (
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                <Youtube size={24} />
              </div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Pro Tips & Highlights</h2>
            </div>
            <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">
              {selectedCategory === "All" ? "Universal Tips" : `${selectedCategory} Technique`}
            </div>
          </div>
          <div className="glass p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
            <HighlightsList 
              maxItems={3} 
              category={selectedCategory === "All" ? null : selectedCategory} 
            />
          </div>
        </section>
      )}

      {/* Movement Strategy (Technical Drills) - Only if not viewing 'Saved' */}
      {selectedCategory !== "Saved" && filteredMovements.length > 0 && (
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Zap size={24} />
              </div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Movement Strategy</h2>
            </div>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full border border-white/10">
              Technical Drills
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredMovements.slice(0, 4).map((movement, i) => (
                <motion.div
                  key={movement.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <MovementCard movement={movement} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Grid Results */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <Layers size={24} className="text-cyan-400" />
             <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                {selectedCategory === "Saved" ? "Your Library" : `${selectedCategory} Insights`}
             </h2>
          </div>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
            {filteredArticles.length} Results
          </p>
        </div>

        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredArticles.map((article, i) => (
                <motion.div
                  key={article.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-32 text-center glass rounded-3xl border border-white/5">
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-12 border border-white/10 group-hover:rotate-0 transition-transform">
              <Search size={40} className="text-gray-600" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 italic">Nothing found</h3>
            <p className="text-gray-500 max-w-xs mx-auto font-medium">Try adjusting your filters or search keywords to find what you're looking for.</p>
            <button 
              onClick={() => { setSelectedCategory("All"); setSearch(""); }}
              className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all"
            >
              Reset Search
            </button>
          </div>
        )}
      </section>
    </div>
  );

  if (isUserSection) {
    return (
      <DashboardLayout role="user">
        <div className="pb-32">
          {LibraryContent}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/5 rounded-full aurora-blur" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full aurora-blur" />
      </div>

      <Navbar />
      <div className="relative pt-32 pb-32 px-4 z-10">
        {LibraryContent}
      </div>
    </div>
  );
}