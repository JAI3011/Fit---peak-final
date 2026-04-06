import { useParams, Navigate, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import articlesData from '../data/articles.json';
import Navbar from '../components/Navbar';
import ArticleCard from '../components/ArticleCard';
import { Calendar, User, ArrowLeft, Clock, Share2, HelpCircle, CheckCircle, XCircle, Heart, ChevronRight } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Link } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';

export default function ArticleDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const article = articlesData.find(a => a.slug === slug);
  const isUserSection = location.pathname.startsWith('/user');
  
  const [quizOpen, setQuizOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  // Scroll Progress logic
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const recommendedArticles = useMemo(() => {
    if (!article) return [];
    return articlesData
      .filter(a => a.id !== article.id && (a.category === article.category || a.featured))
      .slice(0, 3);
  }, [article]);

  if (!article) return <Navigate to={isUserSection ? "/user/library" : "/library"} />;

  // Mock quiz data for the current article
  const quizData = {
    question: "What is the primary goal of establishing fitness standards at FitPeak?",
    options: [
      "To compare users against each other",
      "To ensure measurable, observable, and repeatable progress",
      "To increase the weight lifted regardless of technique",
      "To follow arbitrary industry trends"
    ],
    correctIndex: 1
  };

  const handleAnswer = (index) => {
    setSelectedAnswer(index);
    setIsCorrect(index === quizData.correctIndex);
  };

  const Content = (
    <div className="max-w-7xl mx-auto px-4">
      {/* Article Header & Back Link */}
      <div className="flex items-center justify-between mb-8 max-w-4xl mx-auto">
        <Link 
          to={isUserSection ? "/user/library" : "/library"}
          className="inline-flex items-center gap-2 text-cyan-400 hover:gap-3 transition-all font-bold group bg-white/5 px-4 py-2 rounded-xl border border-white/10"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Library
        </Link>
        <div className="flex gap-2">
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors">
              <Share2 size={20} />
            </button>
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-pink-500 transition-colors">
              <Heart size={20} />
            </button>
        </div>
      </div>

      <motion.article 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-20"
      >
        <div className="relative group rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl shadow-cyan-500/10 border border-white/10">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-[400px] md:h-[600px] object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="px-4 py-1.5 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-cyan-500/20">
                {article.category}
              </span>
              <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <Clock size={14} className="text-cyan-400" /> {Math.ceil(article.content.length / 1000)} min read
              </div>
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.1] tracking-tighter italic">
              {article.title}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 sticky top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 p-[1px]">
                  <div className="w-full h-full rounded-2xl bg-[#020617] flex items-center justify-center overflow-hidden">
                    <User size={24} className="text-cyan-400" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-bold text-lg leading-none mb-1">{article.author}</p>
                  <p className="text-cyan-400/60 text-[10px] font-black uppercase tracking-widest">Lead Expert</p>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 text-zinc-400 text-sm">
                  <Calendar size={18} className="text-purple-500" />
                  <span>{new Date(article.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed italic">
                  FitPeak's core philosophy is driven by elite performance research.
                </p>
              </div>
            </div>
          </div>

          {/* Article Body */}
          <div className="lg:col-span-3">
            <div
              className="prose prose-invert prose-emerald max-w-none 
                prose-headings:text-white prose-headings:font-black prose-headings:tracking-tighter prose-headings:italic
                prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-12
                prose-p:text-zinc-400 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-8
                prose-strong:text-cyan-400 prose-strong:font-bold
                prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:bg-cyan-500/5 prose-blockquote:px-8 prose-blockquote:py-4 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-white prose-blockquote:text-xl
                prose-li:text-zinc-400 prose-li:text-lg
              "
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            
            {/* Knowledge Quiz Section */}
            <div className="mt-20 pt-10 border-t border-white/10">
                <div className={`p-8 rounded-3xl border transition-all ${quizOpen ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                <HelpCircle size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tighter italic">Knowledge Check</h3>
                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Test your comprehension</p>
                            </div>
                        </div>
                        {!quizOpen && (
                            <button 
                                onClick={() => setQuizOpen(true)}
                                className="px-6 py-2 bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest rounded-full shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all"
                            >
                                Start Quiz
                            </button>
                        )}
                    </div>

                    {quizOpen && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <p className="text-lg font-bold text-white mb-6 leading-tight">
                                {quizData.question}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quizData.options.map((option, i) => (
                                    <button
                                        key={i}
                                        disabled={selectedAnswer !== null}
                                        onClick={() => handleAnswer(i)}
                                        className={`p-4 rounded-2xl text-left text-sm font-medium transition-all border
                                            ${selectedAnswer === i 
                                                ? (isCorrect ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-100')
                                                : 'bg-black/20 border-white/10 text-zinc-400 hover:border-white/30 hover:text-white'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black">{String.fromCharCode(65 + i)}</span>
                                            {option}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            
                            {selectedAnswer !== null && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4 flex items-center gap-3">
                                    {isCorrect ? (
                                        <div className="flex items-center gap-2 text-green-400 font-bold">
                                            <CheckCircle size={20} /> Correct! You've mastered this concept.
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-red-400 font-bold">
                                            <XCircle size={20} /> Not quite. Review the section on "Measurable Results".
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => { setSelectedAnswer(null); setIsCorrect(null); }}
                                        className="ml-auto text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest"
                                    >
                                        Try Again
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="mt-12 flex items-center justify-between">
              <p className="text-zinc-500 text-sm font-medium">Was this article helpful to your training?</p>
              <div className="flex gap-4">
                <button className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all text-sm font-bold">Yes, very</button>
                <button className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all text-sm font-bold">Show more</button>
              </div>
            </div>
          </div>
        </div>
      </motion.article>

      {/* Recommended Articles Section */}
      <section className="mb-32">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-cyan-500 rounded-full" />
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Up Next</h2>
            </div>
            <Link to={isUserSection ? "/user/library" : "/library"} className="text-cyan-400 font-black uppercase text-xs tracking-widest hover:gap-3 transition-all flex items-center gap-2">
                Explore All <ChevronRight size={16} />
            </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendedArticles.map(a => (
                <ArticleCard key={a.id} article={a} />
            ))}
        </div>
      </section>
    </div>
  );

  const FixedProgressBar = (
    <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-cyan-500 origin-left z-[100] shadow-[0_0_15px_rgba(34,211,238,0.5)]"
        style={{ scaleX }}
    />
  );

  if (isUserSection) {
    return (
      <DashboardLayout role="user">
        {FixedProgressBar}
        <div className="pb-32">
          {Content}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden">
      {FixedProgressBar}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/5 rounded-full aurora-blur" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full aurora-blur" />
      </div>

      <Navbar />
      <div className="relative pt-32 pb-32 z-10">
        {Content}
      </div>
    </div>
  );
}