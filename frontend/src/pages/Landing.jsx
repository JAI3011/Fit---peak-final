import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import articlesData from '../data/articles.json';
import ArticleCard from '../components/ArticleCard';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Testimonials from '../components/Testimonials';
import HighlightsList from '../components/HighlightsList';
import { BrainCircuit, Activity, LineChart, Target, ArrowRight, User, Users, ShieldCheck, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.2 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 100, damping: 10 } 
  }
};

const Landing = () => {
  const navigate = useNavigate();
  const featuredArticles = articlesData.filter(a => a.featured).slice(0, 3);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 🟦 Base Background Color */}
      <div className="fixed inset-0 z-[-3] bg-[#020617]" />

      {/* 🏋️ Fitness-Themed Background Image */}
      <div 
        className="fixed inset-0 z-[-2] pointer-events-none"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* 🌑 Dark Overlay with Subtle Blur */}
      <div className="fixed inset-0 z-[-1] bg-black/60 backdrop-blur-sm pointer-events-none" />

      {/* 🌌 High-End Animated Background Auroras */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full aurora-blur animate-aurora-1" />
        <div className="absolute top-[20%] right-[-5%] w-[40%] h-[60%] bg-purple-600/10 rounded-full aurora-blur animate-aurora-2" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-fuchsia-500/10 rounded-full aurora-blur animate-aurora-3" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 z-10">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/20 rounded-full aurora-blur animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full aurora-blur animate-pulse" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight">
              Optimize Your Life.<br />
              <span className="text-gradient">Peak Performance.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
              Experience the next generation of personal coaching. FitPeak leverages AI to create adaptive workouts and hyper-personalized meal plans tailored just for you.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/signup')}
                className="neon-button px-8 py-4 rounded-xl text-lg font-bold w-full sm:w-auto"
              >
                Join FitPeak Free
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/signin')}
                className="glass-panel px-8 py-4 rounded-xl text-lg font-bold w-full sm:w-auto hover:bg-white/10 transition-colors"
              >
                Sign In
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why FitPeak?</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Our platform combines cutting-edge AI with expert trainer insights to give you the ultimate edge.</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <Card>
              <div className="p-3 bg-cyan-500/10 w-fit rounded-xl mb-6">
                <BrainCircuit className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI Adaptive Plans</h3>
              <p className="text-gray-400">Our dynamic algorithms adjust your workouts and diet based on your real-time progress and feedback.</p>
            </Card>
            
            <Card>
              <div className="p-3 bg-purple-500/10 w-fit rounded-xl mb-6">
                <Target className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Goal Precision</h3>
              <p className="text-gray-400">Whether losing weight or building muscle, hit your macros perfectly with granular daily tracking.</p>
            </Card>

            <Card>
              <div className="p-3 bg-fuchsia-500/10 w-fit rounded-xl mb-6">
                <LineChart className="w-8 h-8 text-fuchsia-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Advanced Analytics</h3>
              <p className="text-gray-400">Visualize your transformation with beautiful, intricate charts showing every micro-improvement.</p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* 🚀 The FitPeak Ecosystem Section (Roles & Journey) */}
      <section className="py-24 px-4 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
            >
              The FitPeak <span className="text-gradient">Ecosystem</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed"
            >
              Empowering every participant in the fitness journey through cutting-edge technology and seamless collaboration.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* User Role Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="glass-panel p-8 rounded-3xl relative group hover:bg-white/5 transition-all"
            >
              <div className="absolute inset-0 bg-cyan-500/5 rounded-3xl group-hover:bg-cyan-500/10 transition-colors" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-8 border border-cyan-500/30">
                  <User className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Start Your Journey</h3>
                <p className="text-zinc-400 leading-relaxed mb-6">
                  Transform your lifestyle with AI-driven workouts and nutritional guidance tailored to your unique biology and goals.
                </p>
                <div className="flex items-center text-cyan-400 font-semibold gap-2 cursor-pointer hover:gap-4 transition-all">
                  Join as User <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

            {/* Trainer Role Card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, type: 'spring', delay: 0.2 }}
              className="glass-panel p-8 rounded-3xl relative group border-purple-500/20 hover:bg-white/5 transition-all"
            >
              <div className="absolute inset-0 bg-purple-500/5 rounded-3xl group-hover:bg-purple-500/10 transition-colors" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-8 border border-purple-500/30">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Elevate Your Coaching</h3>
                <p className="text-zinc-400 leading-relaxed mb-6">
                  Manage clients at scale with deep analytics. Build professional routines and monitor real-time progress to deliver results.
                </p>
                <div className="flex items-center text-purple-400 font-semibold gap-2 cursor-pointer hover:gap-4 transition-all">
                  Join as Trainer <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

            {/* Admin Role Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, type: 'spring', delay: 0.4 }}
              className="glass-panel p-8 rounded-3xl relative group border-fuchsia-500/20 hover:bg-white/5 transition-all"
            >
              <div className="absolute inset-0 bg-fuchsia-500/5 rounded-3xl group-hover:bg-fuchsia-500/10 transition-colors" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent opacity-50" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-fuchsia-500/20 rounded-2xl flex items-center justify-center mb-8 border border-fuchsia-500/30">
                  <ShieldCheck className="w-8 h-8 text-fuchsia-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Ecosystem Mastery</h3>
                <p className="text-zinc-400 leading-relaxed mb-6">
                  Gain full control over the platform. Oversee trainers, manage platform security, and drive data-backed strategic decisions.
                </p>
                <div className="flex items-center text-fuchsia-400 font-semibold gap-2 cursor-pointer hover:gap-4 transition-all">
                  Access Dashboard <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Fitness Highlights Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
              Fitness <span className="text-gradient">Inspiration</span>
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Real results, expert tips, and peak motivation from our community.
            </p>
          </div>
          <HighlightsList maxItems={6} />
        </div>
      </section>

      {/* 🧩 Featured Articles Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-black"
            >
              FitPeak <span className="text-gradient">is for you</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 max-w-xl mx-auto mt-2"
            >
              Science‑backed insights, expert coaching, and real transformation stories.
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/library"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-cyan-500/30 hover:bg-cyan-500/10 transition"
            >
              View all articles <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section - NOW BELOW ARTICLES */}
      <Testimonials />

      {/* About Section - FitPeak is for you */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              More Than an App —{' '}
              <span className="text-gradient">A Movement</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              FitPeak was born from a simple belief: fitness should adapt to you,
              not the other way around.
            </p>
          </div>

          {/* Two-Column Layout with fade-in animation */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Left Column: Text + Values */}
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed">
                Founded by former professional athletes and engineers,
                FitPeak combines decades of coaching experience with real‑time
                performance tracking. We’ve seen too many people quit because
                generic plans don’t work.
              </p>
              <p className="text-gray-300 leading-relaxed">
                That’s why every workout, every meal, and every insight you see
                is tailored to your unique biology, schedule, and goals —
                and it evolves as you do.
              </p>

              {/* Values badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-sm font-medium">Science‑first</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="text-sm font-medium">Radical personalization</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-fuchsia-400" />
                  <span className="text-sm font-medium">Community driven</span>
                </div>
              </div>
            </div>

            {/* Right Column: Stats Cards (glass-morphism) */}
            <div className="grid grid-cols-2 gap-6">
              <div className="glass-panel rounded-2xl p-6 text-center">
                <div className="text-3xl font-black text-cyan-400">10k+</div>
                <div className="text-sm text-gray-400">Active members</div>
              </div>
              <div className="glass-panel rounded-2xl p-6 text-center">
                <div className="text-3xl font-black text-purple-400">94%</div>
                <div className="text-sm text-gray-400">Reach goals within 12 weeks</div>
              </div>
              <div className="glass-panel rounded-2xl p-6 text-center col-span-2">
                <div className="text-3xl font-black text-fuchsia-400">24/7</div>
                <div className="text-sm text-gray-400">Coaching & support</div>
              </div>
            </div>
          </motion.div>

          {/* Bottom: Team line + CTA */}
          <div className="mt-16 text-center">
            <p className="text-gray-400 mb-4">
              Built by athletes, engineers, and nutritionists who practice what we preach.
            </p>
            <button
              onClick={() => navigate('/about')}
              className="inline-flex items-center gap-2 text-cyan-400 hover:gap-3 transition-all"
            >
              Meet the team →
            </button>
          </div>
        </div>
      </section>
      
      {/* 🧭 Footer Section */}
      <motion.footer 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 py-16 px-4 text-center border-t border-green-500/40 bg-[#020617]/80 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-8 text-gradient">
            Follow FitPeak
          </h2>
          
          <div className="flex items-center justify-center gap-6 mb-10">
            {[
              { icon: Instagram, color: 'text-pink-500', label: 'Instagram' },
              { icon: Twitter, color: 'text-sky-400', label: 'Twitter' },
              { icon: Facebook, color: 'text-blue-600', label: 'Facebook' },
              { icon: Youtube, color: 'text-red-600', label: 'YouTube' }
            ].map((social, idx) => (
              <motion.a
                key={idx}
                href="#"
                whileHover={{ scale: 1.15, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 glass-panel rounded-full flex items-center justify-center hover:bg-cyan-500/10 transition-all border border-white/10 group"
                aria-label={social.label}
              >
                <social.icon className={`w-6 h-6 ${social.color} group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]`} />
              </motion.a>
            ))}
          </div>
          
          <p className="text-gray-400 text-sm font-medium tracking-wide">
            © 2026 FitPeak • All Rights Reserved
          </p>
        </div>
      </motion.footer>
    </div>
  );
};

export default Landing;