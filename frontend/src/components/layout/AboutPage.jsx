import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { 
  ArrowRight, BrainCircuit, ShieldCheck, Cpu, 
  Globe2, Layers, Users2, Zap, Clock, TrendingUp,
  Building2, Calendar
} from 'lucide-react';
import Footer from './Footer'; 
import Navbar from './Navbar';

const AkiyamLogo = () => (
  <div className="w-5 h-5 flex items-center justify-center bg-gradient-to-tr from-orange-500 to-violet-500 rounded text-[10px] font-black text-white">
    A
  </div>
);

// ------ THEME --------
const glassCardStyle = `
  bg-[#0a0a0c]/70 
  backdrop-blur-2xl 
  border border-white/5 
  shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_40px_rgba(0,0,0,0.5)] 
  rounded-[32px]
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

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, y: 0, 
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } 
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const SpotlightCard = ({ children, className = "", glowColor = "rgba(139, 92, 246, 0.15)" }) => {
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
            ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, ${glowColor}, transparent 40%)`
          ),
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
};

const ThemedBackground = () => (
  <>
    <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#7c3aed", "#f97316", "#7c3aed"] }} transition={{ ...floatingBlob.animate.transition, backgroundColor: { duration: 20, repeat: Infinity, ease: "linear" } }} className="absolute -top-[10%] -left-[10%] w-[900px] h-[900px] rounded-full blur-[150px] opacity-20 mix-blend-screen" />
      <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#ea580c", "#ec4899", "#ea580c"] }} transition={{ ...floatingBlob.animate.transition, delay: 2, backgroundColor: { duration: 25, repeat: Infinity, ease: "linear" } }} className="absolute top-[40%] -right-[10%] w-[800px] h-[800px] rounded-full blur-[150px] opacity-15 mix-blend-screen" />
    </div>
  </>
);

export default function AboutPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-violet-500/30">
      <ThemedBackground />
      <Navbar />

      {/* ─── HERO SECTION ────*/}
      <section className="relative w-full pt-32 md:pt-40 pb-24 flex flex-col items-center text-center px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 w-full max-w-[1000px] mx-auto flex flex-col items-center"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white/5 border border-white/10 shadow-[inset_0_1px_0px_rgba(255,255,255,0.05)] backdrop-blur-md">
            <Building2 size={14} className="text-violet-400" />
            <span className="text-[11px] font-black text-slate-300 tracking-[0.2em] uppercase">Enterprise Workforce Infrastructure</span>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-[clamp(3rem,7vw,6.5rem)] font-black tracking-[-0.04em] leading-[0.95] text-white mb-8">
            Scale your enterprise, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400">
              not your HR headcount.
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-slate-400 text-lg md:text-2xl font-medium max-w-3xl leading-relaxed mb-10">
            Hash# replaces fragmented, manual HR processes with an autonomous neural network. We help high-growth companies slash overhead, guarantee compliance, and hire top-tier talent in milliseconds.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-extrabold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)]"
            >
              <Calendar size={20} /> Schedule Consultation
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/[0.05] border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all"
            >
              Explore Platform
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ───  ANOTHER SECTION ────*/}
      <section className="relative w-full py-24 px-6 border-y border-white/5 bg-[#030304]/50">
        <div className="max-w-[1440px] mx-auto w-[90%]">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black tracking-[0.2em] text-slate-500 uppercase">Average Client Impact in Year 1</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: "Reduction in Time-to-Hire", value: "73%", icon: Clock, color: "text-violet-400" },
              { label: "Compliance Accuracy", value: "100%", icon: ShieldCheck, color: "text-emerald-400" },
              { label: "HR Admin Hours Saved", value: "1.2M+", icon: Users2, color: "text-orange-400" },
              { label: "Increase in Retention", value: "42%", icon: TrendingUp, color: "text-pink-400" }
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center text-center">
                <stat.icon size={24} className="text-slate-600 mb-4" />
                <span className={`text-4xl md:text-5xl font-black tracking-tighter mb-2 ${stat.color}`}>{stat.value}</span>
                <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VALUE PROPOSITION  ───── */}
      <section className="relative w-full py-24 px-6">
        <div className="max-w-[1440px] mx-auto w-[90%]">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Why Enterprise Leaders Choose Hash#</h2>
            <p className="text-slate-400 text-lg max-w-2xl">We don't sell software. We sell the infrastructure that protects your company from liability while accelerating growth.</p>
          </div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]"
          >
            <motion.div variants={fadeInUp} className="h-full">
              <SpotlightCard className={`p-10 h-full ${glassCardStyle}`} glowColor="rgba(249, 115, 22, 0.15)">
                <div className="w-14 h-14 mb-8 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                  <BrainCircuit size={28} className="text-orange-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">Find Top 1% Talent, Instantly</h3>
                <p className="text-slate-400 leading-relaxed">
                  Stop paying recruiters to keyword-match. Our semantic parsing engine instantly ranks thousands of candidates against your exact requirements, completely stripping demographic bias to ensure you only interview the absolute best.
                </p>
              </SpotlightCard>
            </motion.div>

            <motion.div variants={fadeInUp} className="h-full">
              <SpotlightCard className={`p-10 h-full ${glassCardStyle}`} glowColor="rgba(52, 211, 153, 0.15)">
                <div className="w-14 h-14 mb-8 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <ShieldCheck size={28} className="text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">Zero-Risk Compliance</h3>
                <p className="text-slate-400 leading-relaxed">
                  Protect your company from bad hires and legal liability. We cryptographically verify every credential, employment history, and background check against immutable global registries before an offer is even drafted.
                </p>
              </SpotlightCard>
            </motion.div>

            <motion.div variants={fadeInUp} className="h-full">
              <SpotlightCard className={`p-10 h-full ${glassCardStyle}`} glowColor="rgba(139, 92, 246, 0.15)">
                <div className="w-14 h-14 mb-8 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                  <Zap size={28} className="text-violet-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">Zero-Touch Operations</h3>
                <p className="text-slate-400 leading-relaxed">
                  From dispatching offer letters to provisioning Slack accounts and IT hardware, Hash# operates as an autonomous background agent. Slash your HR admin costs and ensure every new hire is ready on Day 1.
                </p>
              </SpotlightCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── LEADERSHIP / NARRATIVE ───── */}
      <section className="relative w-full py-32 px-6">
        <div className="max-w-[1440px] mx-auto w-[90%]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <Globe2 size={14} className="text-slate-400" />
                <span className="text-[11px] font-black text-slate-300 tracking-[0.2em] uppercase">Our Partnership Model</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.1] mb-8">
                Built by systems architects <br />
                <span className="text-slate-500">for business leaders.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                We didn't set out to build another generic HR dashboard. We built a complex systems solver designed to handle the massive operational friction that slows companies down. When you partner with Hash#, you aren't buying software—you are acquiring an autonomous operational team.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm font-bold text-white"><ShieldCheck size={16} className="text-emerald-400"/> SOC2 Type II Certified</div>
                <div className="flex items-center gap-2 text-sm font-bold text-white"><ShieldCheck size={16} className="text-emerald-400"/> GDPR & CCPA Compliant</div>
              </div>
            </motion.div>

            {/* Abstract Tech Visual */}
            <div className="relative w-full aspect-square max-w-[500px] mx-auto">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIvPjwvc3ZnPg==')] opacity-50 [mask-image:radial-gradient(circle_at_center,black_40%,transparent_70%)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64 border border-white/10 rounded-full animate-[spin_40s_linear_infinite]">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-violet-500/20 border border-violet-500/50 rounded-full blur-[2px]" />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-orange-500/20 border border-orange-500/50 rounded-full blur-[2px]" />
                </div>
                <div className="absolute w-48 h-48 border border-white/5 rounded-full animate-[spin_30s_linear_infinite_reverse]">
                   <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-pink-500/20 border border-pink-500/50 rounded-full blur-[2px]" />
                </div>
                <div className="absolute w-24 h-24 bg-[#0a0a0c] border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)] rounded-3xl flex items-center justify-center rotate-12">
                  <AkiyamLogo />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA SECTION ──── */}
      <section className="relative w-full py-32 px-6 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-violet-900/10 to-transparent pointer-events-none" />
        <SpotlightCard className={`max-w-[1000px] mx-auto p-12 md:p-16 text-center ${glassCardStyle}`}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
          
          <h2 className="text-4xl md:text-6xl font-black tracking-[-0.04em] leading-[0.95] mb-6 text-white">
            Ready to upgrade your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-orange-400">
              enterprise architecture?
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Let our engineering team show you how Hash# can integrate directly into your existing stack to eliminate overhead and secure your hiring pipeline.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button
              onClick={() => navigate('/contact')}
              className="group flex items-center justify-center gap-3 px-10 py-5 bg-white text-black font-extrabold rounded-2xl text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_40px_rgba(255,255,255,0.2)]"
            >
              Book an Executive Demo
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </SpotlightCard>
      </section>
      <Footer />
    </div>
  );
}