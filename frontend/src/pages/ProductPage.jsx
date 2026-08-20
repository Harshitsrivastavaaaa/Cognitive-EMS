import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Users2, BrainCircuit, IndianRupee, BarChart3, GraduationCap,
  UserPlus, UserMinus, CalendarDays, ShieldCheck, Layers,
  ChevronRight, ArrowRight, Zap, Globe2, Lock, CheckCircle2,
  Star, TrendingUp, Clock, Cpu, Activity, Play, Sparkles
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const textPrimary = "text-white";
const textSecondary = "text-slate-400";
const glassCardStyle = `
  bg-[#0a0a0c]/70 
  backdrop-blur-2xl 
  border border-white/5 
  shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_40px_rgba(0,0,0,0.5)] 
  rounded-[24px]
`;

const floatingBlob = {
  animate: {
    y: [0, -30, 0],
    x: [0, 15, 0],
    scale: [1, 1.05, 1],
    rotate: [0, 5, -5, 0],
    transition: { duration: 18, repeat: Infinity, ease: "easeInOut" },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20, mass: 1 } },
};

// ─── SHARED COMPONENTS ────
const ThemedBackground = () => (
  <>
    <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#ea580c", "#7c3aed", "#ea580c"] }} transition={{ ...floatingBlob.animate.transition, backgroundColor: { duration: 20, repeat: Infinity, ease: "linear" } }} className="absolute -top-[10%] -left-[10%] w-[900px] h-[900px] rounded-full blur-[130px] opacity-40 mix-blend-screen" />
      <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#7c3aed", "#f97316", "#7c3aed"] }} transition={{ ...floatingBlob.animate.transition, delay: 2, backgroundColor: { duration: 25, repeat: Infinity, ease: "linear" } }} className="absolute top-[20%] -right-[10%] w-[700px] h-[700px] rounded-full blur-[130px] opacity-40 mix-blend-screen" />
      <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#d946ef", "#ea580c", "#d946ef"] }} transition={{ ...floatingBlob.animate.transition, delay: 4, backgroundColor: { duration: 22, repeat: Infinity, ease: "linear" } }} className="absolute -bottom-[20%] left-[20%] w-[800px] h-[800px] rounded-full blur-[150px] opacity-20 mix-blend-screen" />
    </div>
  </>
);

const SpotlightCard = ({ children, className = '', color = 'rgba(249,115,22,0.08)' }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  return (
    <motion.div ref={ref} onMouseMove={handleMouseMove} className={`relative overflow-hidden group ${className}`}>
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-0"
        style={{
          background: useTransform(
            [x, y],
            ([mx, my]) => `radial-gradient(600px circle at ${mx}px ${my}px, ${color}, transparent 40%)`
          ),
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
};

// ─── DATA CONSTANTS ──
const modules = [
  { icon: Users2, title: 'Employee Hub', desc: 'Centralised employee records, org chart, and real-time directory with role-based access.', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', glow: 'rgba(249,115,22,0.15)', badge: 'Core', route: '/employees' },
  { icon: UserPlus, title: 'Recruitment Pipeline', desc: 'AI-powered sourcing, resume parsing, interview scheduling, and offer letter generation.', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', glow: 'rgba(139,92,246,0.15)', badge: 'AI', route: '/recruitment' },
  { icon: BarChart3, title: 'Performance & Goals', desc: 'OKR tracking, 360° feedback, performance reviews, and calibration dashboards.', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', glow: 'rgba(59,130,246,0.15)', badge: 'Analytics', route: '/performance' },
  { icon: IndianRupee, title: 'Smart Payroll', desc: 'Automated payroll runs, tax compliance, OTE simulations, and real-time cost modeling.', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'rgba(52,211,153,0.15)', badge: 'Finance', route: '/payroll' },
  { icon: GraduationCap, title: 'Learning & Development', desc: 'Course management, skill gap analysis, certifications, and personalised learning paths.', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', glow: 'rgba(236,72,153,0.15)', badge: 'L&D', route: '/learning' },
  { icon: CalendarDays, title: 'Leave Management', desc: 'Policy engine, approval workflows, accrual tracking, and conflict detection.', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', glow: 'rgba(34,211,238,0.15)', badge: 'Time', route: '/leavemanagement' },
  { icon: UserMinus, title: 'Offboarding', desc: 'Structured exit workflows, knowledge transfer checklists, and compliance sign-offs.', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', glow: 'rgba(248,113,113,0.15)', badge: 'Process', route: '/offboarding' },
  { icon: ShieldCheck, title: 'Background Verification', desc: 'Automated BGV with credential ledger, identity checks, and signed certificates.', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'rgba(251,191,36,0.15)', badge: 'Trust', route: '/bgv' },
  { icon: Layers, title: 'Org Intelligence', desc: 'Headcount forecasting, span-of-control analytics, and team composition insights.', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', glow: 'rgba(99,102,241,0.15)', badge: 'AI', route: '/Orgintelligence' },
  { icon: BrainCircuit, title: 'AI Analytics', desc: 'Predictive attrition, flight risk scoring, hiring funnel analysis, and custom dashboards.', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', glow: 'rgba(217,70,239,0.15)', badge: 'AI', route: '/analytics' },
  { icon: UserPlus, title: 'Onboarding', desc: 'Day-0 access provisioning, buddy assignment, checklist automation, and progress tracking.', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', glow: 'rgba(45,212,191,0.15)', badge: 'Process', route: '/onboarding' },
  { icon: Lock, title: 'Compliance & Privacy', desc: 'Policy enforcement, audit trails, GDPR tools, and regulatory compliance monitoring.', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', glow: 'rgba(148,163,184,0.15)', badge: 'Security', route: '/compliance' },
];

const pillars = [
  { icon: Zap, label: 'Lightning Fast', desc: 'Sub-100ms response across all modules, even at enterprise scale.' },
  { icon: Lock, label: 'Enterprise Secure', desc: 'SOC 2 Type II, end-to-end encryption, and role-based access control.' },
  { icon: Globe2, label: 'Global Ready', desc: 'Multi-currency payroll, localised compliance, and 30+ language support.' },
  { icon: Cpu, label: 'AI-Native Core', desc: "Every module is powered by Hash#'s proprietary neural HR engine." },
  { icon: Activity, label: 'Real-Time Sync', desc: 'Live data propagation across all modules — no stale dashboards.' },
  { icon: TrendingUp, label: 'Scales with You', desc: 'From 10 to 100,000 employees without a config change.' },
];

const metrics = [
  { value: '10x', label: 'Faster Hiring', color: 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500' },
  { value: '40%', label: 'Lower Attrition', color: 'text-violet-400' },
  { value: '99.99%', label: 'Uptime SLA', color: 'text-emerald-400' },
  { value: '12m', label: 'Avg. Onboarding', color: 'text-blue-400' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'VP People, Fintech Scale-up', stars: 5, quote: 'Hash# cut our time-to-hire by 68%. The AI sourcing alone pays for itself every quarter.' },
  { name: 'David Chen', role: 'CHRO, SaaS Enterprise', stars: 5, quote: "The only HRMS that didn't require a 6-month implementation. We were live in 3 days." },
  { name: 'Sara Al-Hassan', role: 'Head of HR Ops, HealthTech', stars: 5, quote: 'BGV used to take 2 weeks. Hash# does it in under 4 hours with a full audit trail.' },
];

const badgeStyles = {
  Core: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  AI: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
  Analytics: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Finance: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'L&D': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Time: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Process: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Trust: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Security: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
};

// ─── MAIN COMPONENT ────
export default function ProductPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'AI', 'Core', 'Finance', 'Process', 'Analytics'];
  const filtered = activeFilter === 'All' ? modules : modules.filter((m) => m.badge === activeFilter);

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#050505] font-sans overflow-x-hidden selection:bg-orange-500/30">
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      <ThemedBackground />

      <div className="relative z-10 flex-1 w-full px-6 lg:px-10 max-w-[95%] 2xl:max-w-[1920px] mx-auto pt-6 pb-24">
        <Navbar />

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-16 space-y-24">

          {/* ── HERO SECTION ─── */}
          <motion.div variants={fadeInUp} className="text-center max-w-5xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 shadow-[inset_0_1px_0px_rgba(255,255,255,0.05)] mx-auto">
              <Sparkles size={12} className="text-orange-400" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
                The Full Product Suite
              </span>
            </div>
            
            <h1 className={`text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter ${textPrimary} leading-[1.05]`}>
              Every HR workflow,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-violet-400">
                supercharged by AI.
              </span>
            </h1>
            
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
              Hash# HRMS is not a collection of tools. It's a single, unified intelligence 
              layer for your entire people operation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                to="/login"
                className="h-14 px-8 rounded-full bg-white text-black font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all whitespace-nowrap uppercase tracking-widest"
              >
                Start Free Trial <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="h-14 px-8 rounded-full bg-white/5 border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-colors shadow-[inset_0_1px_0px_rgba(255,255,255,0.05)] uppercase tracking-widest whitespace-nowrap"
              >
                <Play size={14} className="text-slate-400" /> Request Demo
              </Link>
            </div>
          </motion.div>

          {/* ── KEY METRICS ─── */}
          <motion.div variants={fadeInUp}>
            <SpotlightCard className={`${glassCardStyle} p-8`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-white/5">
                {metrics.map((m, i) => (
                  <div key={i} className="flex flex-col items-center justify-center text-center p-4 group hover:scale-105 transition-transform duration-300">
                    <p className={`text-4xl md:text-5xl font-black tracking-tighter ${m.color} mb-2`}>{m.value}</p>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{m.label}</p>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </motion.div>

          {/* ── MODULE GRID ── */}
          <motion.div variants={fadeInUp}>
            <div className="text-center mb-12">
              <h2 className={`text-4xl md:text-5xl font-black tracking-tighter ${textPrimary} mb-4`}>12 Modules. One Platform.</h2>
              <p className="text-slate-400 max-w-xl mx-auto font-medium">
                Every module shares the same data model, permissions layer, and neural AI engine.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all duration-300 shadow-[inset_0_1px_0px_rgba(255,255,255,0.05)] ${
                    activeFilter === f
                      ? 'bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.2)]'
                      : 'bg-[#121214] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filtered.map((mod) => (
                  <SpotlightCard key={mod.title} color={mod.glow} className={`${glassCardStyle} p-6 group cursor-pointer hover:border-white/10 transition-colors`}>
                    <div className="flex flex-col h-full gap-5">
                      <div className="flex items-start justify-between">
                        <div className={`p-3.5 rounded-2xl ${mod.bg} border ${mod.border} shadow-[inset_0_1px_0px_rgba(255,255,255,0.1)] shrink-0`}>
                          <mod.icon size={24} className={mod.color} />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${badgeStyles[mod.badge]} shadow-[inset_0_1px_0px_rgba(255,255,255,0.05)]`}>
                          {mod.badge}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-black text-xl tracking-tight mb-2 ${textPrimary}`}>{mod.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{mod.desc}</p>
                      </div>
                      <Link
                        to={mod.route}
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 ${mod.color} group-hover:underline decoration-2 underline-offset-4`}
                      >
                        Explore Module <ChevronRight size={14} />
                      </Link>
                    </div>
                  </SpotlightCard>
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* ── PLATFORM PILLARS ─── */}
          <motion.div variants={fadeInUp}>
            <div className="text-center mb-12">
              <h2 className={`text-4xl md:text-5xl font-black tracking-tighter ${textPrimary} mb-4`}>Built different, by design.</h2>
              <p className="text-slate-400 max-w-xl mx-auto font-medium">
                The core architectural principles that make Hash# the last HRMS you'll ever need.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pillars.map((p, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[20px] p-6 flex gap-4 items-start group hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 shadow-[inset_0_1px_0px_rgba(255,255,255,0.02)]">
                  <div className="p-3 rounded-2xl bg-[#121214] border border-white/5 group-hover:bg-orange-500/10 group-hover:border-orange-500/30 transition-all duration-300 shrink-0 shadow-inner">
                    <p.icon size={20} className="text-slate-400 group-hover:text-orange-400 transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg mb-1.5 ${textPrimary}`}>{p.label}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── TESTIMONIALS ─── */}
          <motion.div variants={fadeInUp}>
            <div className="text-center mb-12">
              <h2 className={`text-4xl md:text-5xl font-black tracking-tighter ${textPrimary} mb-4`}>Trusted by HR leaders.</h2>
              <p className="text-slate-400 max-w-xl mx-auto font-medium">
                Real outcomes from scale-ups and enterprises that made the switch to Hash#.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <SpotlightCard key={i} className={`${glassCardStyle} p-8 flex flex-col gap-6`} color="rgba(249,115,22,0.1)">
                  <div className="flex gap-1">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={16} className="text-orange-400 fill-orange-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-[15px] leading-relaxed italic flex-1 font-medium">"{t.quote}"</p>
                  <div className="pt-4 border-t border-white/5 mt-auto">
                    <p className={`font-bold text-base ${textPrimary}`}>{t.name}</p>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mt-1">{t.role}</p>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </motion.div>

          {/* ── CTA BANNER ─── */}
          <motion.div variants={fadeInUp} className="relative overflow-hidden rounded-[32px] p-[1px] bg-gradient-to-r from-orange-500/30 via-violet-500/20 to-pink-500/30">
            <div className="bg-[#0a0a0c] rounded-[31px] p-12 md:p-20 text-center relative overflow-hidden backdrop-blur-xl">
              <div className="absolute inset-0 opacity-20 mix-blend-screen" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #f97316, transparent 60%)' }} />
              
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-tight">
                  Ready to transform<br />
                  <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                    your people ops?
                  </span>
                </h2>
                <p className="text-slate-300 text-lg md:text-xl mb-10 font-medium">
                  Join 500+ forward-thinking companies using Hash# to run leaner, smarter, and more human HR.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    to="/login"
                    className="h-14 px-10 w-full sm:w-auto rounded-full bg-white text-black font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all uppercase tracking-widest whitespace-nowrap"
                  >
                    Get Started Free <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/contact"
                    className="h-14 px-10 w-full sm:w-auto rounded-full bg-white/5 border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-colors shadow-[inset_0_1px_0px_rgba(255,255,255,0.05)] uppercase tracking-widest whitespace-nowrap"
                  >
                    Talk to Sales
                  </Link>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-2 mt-8 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>No credit card required</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20 mx-2" />
                  <span>14-day free trial</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20 mx-2" />
                  <span className="flex items-center gap-1"><Lock size={12} className="text-slate-400" /> SOC 2 Compliant</span>
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>

      <Footer />
    </div>
  );
}