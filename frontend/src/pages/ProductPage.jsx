import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Users2, BrainCircuit, IndianRupee, BarChart3, GraduationCap,
  UserPlus, UserMinus, CalendarDays, ShieldCheck, Layers,
  ChevronRight, ArrowRight, Zap, Globe2, Lock, CheckCircle2,
  Star, TrendingUp, Clock, Cpu, Activity, Play, Sparkles,
  Workflow, Server, MessageSquare, Terminal, Eye, Box
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const glassCardStyle = `
  bg-white/90 
  backdrop-blur-2xl 
  border border-slate-200/90 
  shadow-lg shadow-slate-900/5 
  rounded-2xl
`;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 22, mass: 1 } },
};

// ─── BACKGROUND BLOBS ────
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

const SpotlightCard = ({ children, className = '', color = 'rgba(236,72,153,0.06)' }) => {
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
            ([mx, my]) => `radial-gradient(500px circle at ${mx}px ${my}px, ${color}, transparent 40%)`
          ),
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
};

// ─── DATA CONSTANTS ──
const flagshipProducts = [
  {
    name: "Hash#AI",
    tagline: "AI Chat and custom Output platform",
    desc: "Our flagship enterprise platform handling directory sync, custom AI generation, global compliance, and automated workflows.",
    icon: Users2,
    badge: "Flagship",
    link: "https://harshitsrivastavaaaa.github.io/hash-ai/",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    glow: "rgba(59,130,246,0.12)"
  },
  {
    name: "Hash#AI EMS",
    tagline: "Autonomous Employee Management & Parsing",
    desc: "AI engine that scans resumes, schedules round-table interviews, evaluates technical scorecards, and generates verified offer letters.",
    icon: BrainCircuit,
    badge: "Neural AI",
    route: "/recruitment",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    glow: "rgba(168,85,247,0.12)"
  },
  {
    name: "Hash#AI Resume Analyser",
    tagline: "Analyses and gives suggestions on improvements and betterments",
    desc: "Advanced neural evaluation tool that parses career profiles, benchmarks skills, and provides structured improvement suggestions.",
    icon: Server,
    badge: "Analytics",
    route: "/product",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    glow: "rgba(16,185,129,0.12)"
  },
  {
    name: "Hash# Vault Ledger",
    tagline: "Cryptographic Credential & BGV Engine",
    desc: "Instant immutable ID badge generator, statutory salary slips, offboarding certificates, and background check audits.",
    icon: ShieldCheck,
    badge: "Security",
    route: "/bgv",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    glow: "rgba(245,158,11,0.12)"
  }
];

const specializedModules = [
  { icon: Users2, title: 'Employee Hub', desc: 'Centralised employee records, org chart, and real-time directory with role-based access.', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', glow: 'rgba(59,130,246,0.12)', badge: 'Core', route: '/employees' },
  { icon: UserPlus, title: 'Recruitment Pipeline', desc: 'AI-powered sourcing, resume parsing, interview scheduling, and offer letter generation.', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', glow: 'rgba(168,85,247,0.12)', badge: 'AI', route: '/recruitment' },
  { icon: BarChart3, title: 'Performance & Goals', desc: 'OKR tracking, 360° feedback, performance reviews, and calibration dashboards.', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', glow: 'rgba(99,102,241,0.12)', badge: 'Analytics', route: '/performance' },
  { icon: IndianRupee, title: 'Smart Payroll', desc: 'Automated payroll runs, tax compliance, OTE simulations, and real-time cost modeling.', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', glow: 'rgba(16,185,129,0.12)', badge: 'Finance', route: '/payroll' },
  { icon: GraduationCap, title: 'Learning & Development', desc: 'Course management, skill gap analysis, certifications, and personalised learning paths.', color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200', glow: 'rgba(244,114,182,0.12)', badge: 'L&D', route: '/learning' },
  { icon: CalendarDays, title: 'Leave Management', desc: 'Policy engine, approval workflows, accrual tracking, and conflict detection.', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', glow: 'rgba(6,182,212,0.12)', badge: 'Time', route: '/leavemanagement' },
  { icon: UserMinus, title: 'Offboarding', desc: 'Structured exit workflows, knowledge transfer checklists, and compliance sign-offs.', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', glow: 'rgba(244,63,94,0.12)', badge: 'Process', route: '/offboarding' },
  { icon: ShieldCheck, title: 'Background Verification', desc: 'Automated BGV with credential ledger, identity checks, and signed certificates.', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', glow: 'rgba(245,158,11,0.12)', badge: 'Trust', route: '/bgv' },
  { icon: Layers, title: 'Org Intelligence', desc: 'Headcount forecasting, span-of-control analytics, and team composition insights.', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', glow: 'rgba(59,130,246,0.12)', badge: 'AI', route: '/Orgintelligence' },
  { icon: BrainCircuit, title: 'AI Analytics', desc: 'Predictive attrition, flight risk scoring, hiring funnel analysis, and custom dashboards.', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', glow: 'rgba(168,85,247,0.12)', badge: 'AI', route: '/analytics' },
  { icon: UserPlus, title: 'Onboarding', desc: 'Day-0 access provisioning, buddy assignment, checklist automation, and progress tracking.', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', glow: 'rgba(20,184,166,0.12)', badge: 'Process', route: '/onboarding' },
  { icon: Lock, title: 'Compliance & Privacy', desc: 'Policy enforcement, audit trails, GDPR tools, and regulatory compliance monitoring.', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200', glow: 'rgba(100,116,139,0.12)', badge: 'Security', route: '/compliance' },
];

const badgeStyles = {
  Core: 'bg-blue-50 text-blue-700 border-blue-200',
  AI: 'bg-purple-50 text-purple-700 border-purple-200',
  Analytics: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Finance: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'L&D': 'bg-pink-50 text-pink-700 border-pink-200',
  Time: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Process: 'bg-rose-50 text-rose-700 border-rose-200',
  Trust: 'bg-amber-50 text-amber-700 border-amber-200',
  Security: 'bg-slate-100 text-slate-700 border-slate-200',
  Flagship: 'bg-blue-50 text-blue-700 border-blue-200',
  'Neural AI': 'bg-purple-50 text-purple-700 border-purple-200',
  DevOps: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

// ─── MAIN COMPONENT ────
export default function ProductPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [scrolled, setScrolled] = useState(false);
  
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filters = ['All', 'AI', 'Core', 'Finance', 'Process', 'Analytics'];
  const filteredModules = activeFilter === 'All' ? specializedModules : specializedModules.filter((m) => m.badge === activeFilter);

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#f8fafc] text-slate-900 font-sans overflow-x-hidden selection:bg-pink-500/15">
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      <ThemedBackground />

      <Navbar scrolled={scrolled} />

      <div className="relative z-10 flex-1 w-full px-6 lg:px-12 max-w-6xl mx-auto pt-28 pb-20">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-16">

          {/* ── PRODUCTS HERO ─── */}
          <motion.div variants={fadeInUp} className="text-center max-w-3xl mx-auto space-y-4 pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/90 shadow-2xs text-[11px] font-semibold text-slate-700 mx-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
              Hash#AI Product Lineup & Architecture
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.12] text-slate-900">
              Discover our complete <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600">
                suite of AI products.
              </span>
            </h1>
            
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Explore standalone platforms, autonomous workforce applications, and deep infrastructure modules engineered for modern organizations.
            </p>
          </motion.div>

          {/* ── FLAGSHIP PRODUCTS ECOSYSTEM ── */}
          <motion.div variants={fadeInUp}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold uppercase tracking-wider mb-2">
                <Box size={13} /> Flagship Ecosystem
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-1.5">Standalone Platforms & Suites</h2>
              <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto">
                Specialized enterprise solutions built to handle specific pillars of your workforce and intelligence infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {flagshipProducts.map((prod, idx) => (
                <SpotlightCard key={idx} color={prod.glow} className={`${glassCardStyle} p-6 flex flex-col justify-between group hover:border-slate-300 transition-colors`}>
                  <div className="flex flex-col h-full gap-4">
                    <div className="flex items-start justify-between">
                      <div className={`p-3.5 rounded-2xl ${prod.bg} border ${prod.border} ${prod.color} shadow-2xs group-hover:scale-105 transition-transform`}>
                        <prod.icon size={22} />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${badgeStyles[prod.badge]}`}>
                        {prod.badge}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{prod.name}</h3>
                      <p className="text-xs font-semibold text-pink-600">{prod.tagline}</p>
                      <p className="text-xs text-slate-600 leading-relaxed pt-1">{prod.desc}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <span className="text-[10px] font-mono text-slate-400">Integrated Node</span>
                      {prod.link ? (
                        <a
                          href={prod.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${prod.color} group-hover:translate-x-1 transition-transform cursor-pointer`}
                        >
                          Explore Product <ChevronRight size={13} />
                        </a>
                      ) : (
                        <Link
                          to={prod.route}
                          className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${prod.color} group-hover:translate-x-1 transition-transform`}
                        >
                          Explore Product <ChevronRight size={13} />
                        </Link>
                      )}
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}