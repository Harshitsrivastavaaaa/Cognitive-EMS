import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Rocket, Users2, IndianRupee, BrainCircuit, ShieldCheck, Zap, BarChart3, GraduationCap, Search } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const glassCard = 'bg-[#0a0a0c]/70 backdrop-blur-2xl border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_40px_rgba(0,0,0,0.5)] rounded-[28px]';
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90, damping: 18 } } };

const docCategories = [
  { icon: Rocket, title: 'Getting Started', desc: 'Install, authenticate, and make your first API call in under 5 minutes.', articles: 8, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { icon: Users2, title: 'Employee Management', desc: 'Manage employee records, org structures, and directory access.', articles: 14, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { icon: IndianRupee, title: 'Payroll & Compensation', desc: 'Configure payroll runs, tax settings, and compensation structures.', articles: 19, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { icon: BrainCircuit, title: 'AI & Analytics', desc: 'Attrition scoring, hiring funnel analysis, custom dashboard queries.', articles: 11, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20' },
  { icon: ShieldCheck, title: 'Security & Compliance', desc: 'RBAC setup, audit logs, GDPR tools, and compliance exports.', articles: 9, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { icon: Zap, title: 'Integrations & Webhooks', desc: 'Connect Slack, JIRA, Google Workspace, and custom webhooks.', articles: 16, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { icon: BarChart3, title: 'Performance & OKRs', desc: 'Set up review cycles, OKRs, 360° feedback, and calibrations.', articles: 12, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { icon: GraduationCap, title: 'Learning & Development', desc: 'Course creation, skill paths, certification tracking, and reporting.', articles: 10, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
];

const guides = [
  { title: 'Set up your first payroll run', time: '10 min', badge: 'Quickstart' },
  { title: 'Configure AI-powered sourcing', time: '8 min', badge: 'AI' },
  { title: 'Import employees via CSV', time: '5 min', badge: 'Quickstart' },
  { title: 'Build a custom analytics dashboard', time: '15 min', badge: 'Advanced' },
  { title: 'Configure SAML SSO with Okta', time: '12 min', badge: 'Security' },
  { title: 'Set up BGV workflows', time: '7 min', badge: 'Compliance' },
];

export default function DocsPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#050505] font-sans text-white overflow-hidden selection:bg-orange-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[15%] -left-[5%] w-[800px] h-[800px] rounded-full bg-blue-500/8 blur-[140px] opacity-30 mix-blend-screen" />
        <div className="absolute top-[40%] -right-[10%] w-[700px] h-[700px] rounded-full bg-violet-500/8 blur-[130px] opacity-25 mix-blend-screen" />
      </div>
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <Navbar />
        <motion.div variants={container} initial="hidden" animate="visible" className="mt-12">

          {/* Hero */}
          <motion.div variants={fadeUp} className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-widest uppercase">
              <BookOpen size={12} /> Documentation
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-blue-400 via-violet-300 to-fuchsia-400 bg-clip-text text-transparent">build & ship.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">Comprehensive guides, API reference, tutorials, and integration docs for every Hash# module.</p>

            {/* Search Bar */}
            <div className="max-w-lg mx-auto pt-2">
              <div className="flex items-center gap-3 bg-[#111113] border border-white/[0.07] rounded-2xl px-4 py-3.5 hover:border-white/15 transition-colors focus-within:border-violet-500/40 focus-within:ring-2 focus-within:ring-violet-500/20">
                <Search size={16} className="text-slate-500 shrink-0" />
                <input type="text" placeholder="Search documentation..." className="bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none flex-1" />
                <kbd className="text-[10px] text-slate-600 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
              </div>
            </div>
          </motion.div>

          {/* Category Grid */}
          <motion.div variants={fadeUp} className="mb-14">
            <h2 className="text-xl font-black mb-6">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {docCategories.map((cat, i) => (
                <motion.div key={i} variants={fadeUp} className={`${glassCard} p-5 flex flex-col gap-3 group hover:border-white/10 transition-all duration-300 cursor-pointer`}>
                  <div className={`p-3 rounded-2xl ${cat.bg} border ${cat.border} self-start group-hover:scale-110 transition-transform duration-300`}>
                    <cat.icon size={18} className={cat.color} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-sm mb-1">{cat.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{cat.desc}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">{cat.articles} articles</span>
                    <ChevronRight size={14} className={`${cat.color} group-hover:translate-x-1 transition-transform duration-200`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Popular Guides */}
          <motion.div variants={fadeUp} className={`${glassCard} p-8 mb-10`}>
            <h2 className="text-xl font-black mb-6">Popular Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {guides.map((g, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0 group cursor-pointer">
                  <BookOpen size={14} className="text-slate-600 group-hover:text-orange-400 transition-colors shrink-0" />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors flex-1">{g.title}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-600">{g.time}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400">{g.badge}</span>
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
