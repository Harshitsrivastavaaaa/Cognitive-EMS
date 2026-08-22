import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Rocket, Users2, IndianRupee, BrainCircuit, ShieldCheck, Zap, BarChart3, GraduationCap, Search } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const glassCard = 'bg-white/90 backdrop-blur-2xl border border-slate-200/90 shadow-lg shadow-slate-900/5 rounded-2xl';
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 22 } } };

const docCategories = [
  { icon: Rocket, title: 'Getting Started', desc: 'Install, authenticate, and make your first API call in under 5 minutes.', articles: 8, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  { icon: Users2, title: 'Employee Management', desc: 'Manage employee records, org structures, and directory access.', articles: 14, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  { icon: IndianRupee, title: 'Payroll & Compensation', desc: 'Configure payroll runs, tax settings, and compensation structures.', articles: 19, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { icon: BrainCircuit, title: 'AI & Analytics', desc: 'Attrition scoring, hiring funnel analysis, custom dashboard queries.', articles: 11, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  { icon: ShieldCheck, title: 'Security & Compliance', desc: 'RBAC setup, audit logs, GDPR tools, and compliance exports.', articles: 9, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { icon: Zap, title: 'Integrations & Webhooks', desc: 'Connect Slack, JIRA, Google Workspace, and custom webhooks.', articles: 16, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { icon: BarChart3, title: 'Performance & OKRs', desc: 'Set up review cycles, OKRs, 360° feedback, and calibrations.', articles: 12, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  { icon: GraduationCap, title: 'Learning & Development', desc: 'Course creation, skill paths, certification tracking, and reporting.', articles: 10, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
];

const guides = [
  { title: 'Set up your first payroll run', time: '10 min', badge: 'Quickstart' },
  { title: 'Configure AI-powered sourcing', time: '8 min', badge: 'AI' },
  { title: 'Import employees via CSV', time: '5 min', badge: 'Quickstart' },
  { title: 'Build a custom analytics dashboard', time: '15 min', badge: 'Advanced' },
  { title: 'Configure SAML SSO with Okta', time: '12 min', badge: 'Security' },
  { title: 'Set up BGV workflows', time: '7 min', badge: 'Compliance' },
];

const ThemedBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <motion.div 
      animate={{
        y: [0, -40, 0],
        x: [0, 30, 0],
        scale: [1, 1.15, 1],
        backgroundColor: ['rgba(244, 114, 182, 0.2)', 'rgba(168, 85, 247, 0.2)', 'rgba(59, 130, 246, 0.2)', 'rgba(244, 114, 182, 0.2)']
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] rounded-full blur-[120px] mix-blend-multiply" 
    />
    <motion.div 
      animate={{
        y: [0, 50, 0],
        x: [0, -40, 0],
        scale: [1, 1.2, 1],
        backgroundColor: ['rgba(168, 85, 247, 0.18)', 'rgba(59, 130, 246, 0.18)', 'rgba(244, 114, 182, 0.18)', 'rgba(168, 85, 247, 0.18)']
      }}
      transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[20%] -right-[10%] w-[700px] h-[700px] rounded-full blur-[140px] mix-blend-multiply" 
    />
  </div>
);

export default function DocsPage() {
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] font-sans text-slate-900 selection:bg-pink-500/15 overflow-x-hidden">
      <ThemedBackground />
      <Navbar scrolled={scrolled} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 pt-28 pb-20">
        <motion.div variants={container} initial="hidden" animate="visible" className="space-y-12">

          {/* Hero */}
          <motion.div variants={fadeUp} className="text-center max-w-3xl mx-auto space-y-4 pt-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/90 shadow-2xs text-[11px] font-semibold text-slate-700 mx-auto">
              <BookOpen size={12} className="text-pink-600" /> Documentation Hub
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.12] text-slate-900">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">build & ship.</span>
            </h1>
            
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Comprehensive guides, API reference, tutorials, and integration docs for every Hash# module.
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto pt-2">
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-2xs hover:border-slate-300 transition-colors focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-500/15">
                <Search size={16} className="text-slate-400 shrink-0" />
                <input type="text" placeholder="Search documentation..." className="bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none flex-1" />
                <kbd className="text-[10px] text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
              </div>
            </div>
          </motion.div>

          {/* Category Grid */}
          <motion.div variants={fadeUp}>
            <h2 className="text-lg font-extrabold text-slate-900 mb-6">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {docCategories.map((cat, i) => (
                <motion.div key={i} variants={fadeUp} className={`${glassCard} p-5 flex flex-col gap-3 group hover:border-slate-300 transition-all duration-300 cursor-pointer`}>
                  <div className={`p-3 rounded-xl ${cat.bg} border ${cat.border} self-start group-hover:scale-105 transition-transform duration-300`}>
                    <cat.icon size={18} className={cat.color} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-slate-900 mb-1">{cat.title}</h3>
                    <p className="text-slate-600 text-xs leading-relaxed">{cat.desc}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
                    <span className="text-[11px] text-slate-500">{cat.articles} articles</span>
                    <ChevronRight size={14} className={`${cat.color} group-hover:translate-x-1 transition-transform duration-200`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Popular Guides */}
          <motion.div variants={fadeUp} className={`${glassCard} p-6 sm:p-8`}>
            <h2 className="text-lg font-extrabold text-slate-900 mb-6">Popular Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {guides.map((g, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0 group cursor-pointer">
                  <BookOpen size={14} className="text-slate-400 group-hover:text-pink-600 transition-colors shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors flex-1">{g.title}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-500">{g.time}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-pink-50 border border-pink-200 text-pink-600">{g.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </motion.div>
      </div>
      <Footer />
    </div>
  );
}