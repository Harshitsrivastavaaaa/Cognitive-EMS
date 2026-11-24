import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { 
  ArrowRight, BrainCircuit, ShieldCheck, Cpu, 
  Globe2, Layers, Users2, Zap, Clock, TrendingUp,
  Building2, Calendar, CheckCircle2
} from 'lucide-react';
import Footer from './Footer'; 
import Navbar from './Navbar';
import BrandLogo from '../../assets/logo.svg';

const BrandMark = () => (
  <img src={BrandLogo} alt="Cognitive EMS logo" className="w-10 h-10 rounded-xl" />
);

// ------ THEME --------
const glassCardStyle = `
  bg-white/90 
  backdrop-blur-2xl 
  border border-slate-200/90 
  shadow-lg shadow-slate-900/5 
  rounded-2xl
`;

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, y: 0, 
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } 
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const SpotlightCard = ({ children, className = "", glowColor = "rgba(236,72,153,0.08)" }) => {
  const divRef = useRef(null);
  const position = { x: useMotionValue(0), y: useMotionValue(0) };

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    position.x.set(e.clientX - rect.left);
    position.y.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden group ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-0"
        style={{
          background: useTransform(
            [position.x, position.y],
            ([x, y]) => `radial-gradient(500px circle at ${x}px ${y}px, ${glowColor}, transparent 40%)`
          ),
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
};

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

export default function AboutPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] text-slate-900 font-sans selection:bg-pink-500/15 overflow-x-hidden">
      <ThemedBackground />
      <Navbar scrolled={scrolled} />

      {/* ─── HERO SECTION ────*/}
      <section className="relative w-full pt-32 md:pt-40 pb-20 flex flex-col items-center text-center px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/90 shadow-2xs text-[11px] font-semibold text-slate-700">
            <Building2 size={13} className="text-pink-600" />
            <span className="tracking-wider uppercase">Enterprise Workforce Infrastructure</span>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-slate-900 mb-6">
            Scale your enterprise, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600">
              not your HR headcount.
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-slate-600 text-sm md:text-base max-w-2xl leading-relaxed mb-8">
            Cognitive EMS replaces fragmented, manual HR processes with an autonomous neural network. We help high-growth companies slash overhead, guarantee compliance, and hire top-tier talent in milliseconds.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-pink-600 text-white font-semibold text-xs tracking-wide shadow-md shadow-slate-900/10 transition-all active:scale-95 cursor-pointer"
            >
              <Calendar size={14} /> Schedule Consultation
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-pink-600 hover:border-pink-200 font-semibold text-xs tracking-wide transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              Explore Platform
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── METRICS IMPACT SECTION ────*/}
      <section className="relative w-full py-16 px-6 border-y border-slate-200/80 bg-white/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-10">
            <h2 className="text-xs font-extrabold tracking-widest text-slate-400 uppercase">Average Client Impact in Year 1</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Reduction in Time-to-Hire", value: "73%", icon: Clock, color: "text-purple-600" },
              { label: "Compliance Accuracy", value: "100%", icon: ShieldCheck, color: "text-emerald-600" },
              { label: "HR Admin Hours Saved", value: "1.2M+", icon: Users2, color: "text-pink-600" },
              { label: "Increase in Retention", value: "42%", icon: TrendingUp, color: "text-blue-600" }
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center text-center p-4 bg-white/90 border border-slate-200/90 rounded-2xl shadow-2xs">
                <stat.icon size={20} className="text-slate-400 mb-3" />
                <span className={`text-3xl md:text-4xl font-black tracking-tight mb-1 ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VALUE PROPOSITION ───── */}
      <section className="relative w-full py-20 px-6">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Why Enterprise Leaders Choose Cognitive EMS</h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">We don't sell software. We sell the infrastructure that protects your company from liability while accelerating growth.</p>
          </div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            <motion.div variants={fadeInUp} className="h-full">
              <SpotlightCard className={`p-7 h-full ${glassCardStyle}`} glowColor="rgba(168,85,247,0.12)">
                <div className="w-12 h-12 mb-6 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <BrainCircuit size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Find Top 1% Talent, Instantly</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Stop paying recruiters to keyword-match. Our semantic parsing engine instantly ranks thousands of candidates against your exact requirements, stripping demographic bias.
                </p>
              </SpotlightCard>
            </motion.div>

            <motion.div variants={fadeInUp} className="h-full">
              <SpotlightCard className={`p-7 h-full ${glassCardStyle}`} glowColor="rgba(16,185,129,0.12)">
                <div className="w-12 h-12 mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Zero-Risk Compliance</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Protect your company from legal liability. We cryptographically verify every credential, employment history, and background check against immutable global registries.
                </p>
              </SpotlightCard>
            </motion.div>

            <motion.div variants={fadeInUp} className="h-full">
              <SpotlightCard className={`p-7 h-full ${glassCardStyle}`} glowColor="rgba(244,114,182,0.12)">
                <div className="w-12 h-12 mb-6 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600">
                  <Zap size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Zero-Touch Operations</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  From dispatching offer letters to provisioning accounts and IT hardware, Cognitive EMS operates as an autonomous background agent ensuring team readiness on Day 1.
                </p>
              </SpotlightCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── LEADERSHIP / NARRATIVE ───── */}
      <section className="relative w-full py-20 px-6 bg-white/40 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                <Globe2 size={13} className="text-slate-500" />
                <span className="tracking-wider uppercase">Our Partnership Model</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-6">
                Built by systems architects <br />
                <span className="text-slate-500">for business leaders.</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
                We didn't set out to build another generic HR dashboard. We built a complex systems solver designed to handle the massive operational friction that slows companies down. When you partner with Cognitive EMS, you aren't buying software—you are acquiring an autonomous operational team.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900"><CheckCircle2 size={15} className="text-emerald-600"/> SOC2 Type II Certified</div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900"><CheckCircle2 size={15} className="text-emerald-600"/> GDPR & CCPA Compliant</div>
              </div>
            </motion.div>

            {/* Abstract Tech Visual */}
            <div className="relative w-full aspect-square max-w-[400px] mx-auto flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-56 h-56 border border-slate-200 rounded-full animate-[spin_40s_linear_infinite]">
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-purple-500/20 border border-purple-500/50 rounded-full blur-[1px]" />
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-pink-500/20 border border-pink-500/50 rounded-full blur-[1px]" />
                </div>
                <div className="absolute w-40 h-40 border border-slate-100 rounded-full animate-[spin_30s_linear_infinite_reverse]">
                   <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-5 h-5 bg-blue-500/20 border border-blue-500/50 rounded-full blur-[1px]" />
                </div>
                <div className="absolute w-20 h-20 bg-white border border-slate-200 shadow-lg rounded-2xl flex items-center justify-center rotate-12">
                  <BrandMark />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA SECTION ──── */}
      <section className="relative w-full py-24 px-6">
        <SpotlightCard className={`max-w-4xl mx-auto p-10 md:p-14 text-center bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950 text-white rounded-3xl shadow-xl`} glowColor="rgba(244,114,182,0.2)">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/15 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-4">
              Ready to upgrade your enterprise architecture?
            </h2>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-8">
              Let our engineering team show you how Cognitive EMS can integrate directly into your existing stack to eliminate overhead and secure your hiring pipeline.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => navigate('/contact')}
                className="group flex items-center justify-center gap-2 px-8 py-3.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-pink-600/25 transition-all cursor-pointer"
              >
                Book an Executive Demo
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </SpotlightCard>
      </section>

      <Footer />
    </div>
  );
}