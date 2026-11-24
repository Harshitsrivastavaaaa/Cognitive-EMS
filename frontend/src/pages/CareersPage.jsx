import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  Briefcase, MapPin, Clock, ArrowRight, Zap, Heart, 
  Globe2, Users2, Coffee, TrendingUp, Sparkles, CheckCircle2,
  X, Target, Code
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// ─── THEME CONSTANTS ─────────
const textPrimary = "text-white";
const textSecondary = "text-slate-400";
const glassCardStyle = `
  bg-[#0a0a0c]/70 
  backdrop-blur-2xl 
  border border-white/5 
  shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_40px_rgba(0,0,0,0.5)] 
  rounded-[24px]
`;

// ─── ANIMATIONS ─────
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

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
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

// ─── EXPANDED DATA CONSTANTS ─────────────────────────────────────────────────
const jobs = [
  { 
    id: 1, title: 'Senior Full-Stack Engineer', dept: 'Engineering', location: 'Remote / Noida', type: 'Full-time', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', glow: 'rgba(139,92,246,0.15)', desc: 'Build the backbone of Cognitive EMS\'s neural HR platform. Expert in React, Node.js, and distributed systems required.',
    responsibilities: ['Architect scalable backend microservices using Node.js and Go.', 'Lead the migration of legacy data pipelines to a modern streaming architecture.', 'Mentor junior and mid-level engineers through code reviews and pair programming.'],
    requirements: ['5+ years of experience building high-throughput web applications.', 'Deep expertise in React, TypeScript, and modern state management.', 'Experience with AWS infrastructure (EKS, RDS, S3).']
  },
  { 
    id: 2, title: 'AI / ML Research Engineer', dept: 'AI Research', location: 'Remote / Bangalore', type: 'Full-time', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', glow: 'rgba(217,70,239,0.15)', desc: 'Design and train the matching, sourcing, and attrition-prediction models that power every Cognitive EMS module.',
    responsibilities: ['Develop predictive models for employee attrition and engagement.', 'Optimize LLMs for resume parsing and skill-matching capabilities.', 'Collaborate with product teams to integrate AI models into the core platform.'],
    requirements: ['MS or PhD in Computer Science, AI, or related field.', 'Strong proficiency in Python, PyTorch, and TensorFlow.', 'Proven experience deploying machine learning models into production environments.']
  },
  { 
    id: 3, title: 'HR Product Manager', dept: 'Product', location: 'Remote', type: 'Full-time', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', glow: 'rgba(249,115,22,0.15)', desc: 'Shape the roadmap for an HR platform used by 500+ companies. Deep domain knowledge in HR operations required.',
    responsibilities: ['Own the product lifecycle from conception to launch for the Onboarding module.', 'Conduct user research with enterprise HR leaders to identify pain points.', 'Define clear PRDs and work closely with engineering and design.'],
    requirements: ['4+ years of B2B SaaS product management experience.', 'Deep understanding of HR operations, compliance, or payroll.', 'Excellent analytical skills and ability to make data-driven decisions.']
  },
  { 
    id: 4, title: 'Senior Sales Executive', dept: 'Sales', location: 'Remote / Mumbai', type: 'Full-time', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'rgba(52,211,153,0.15)', desc: 'Own enterprise deals from sourcing to close. Experience selling HRMS or HCM solutions is a strong plus.',
    responsibilities: ['Drive the end-to-end sales cycle for enterprise accounts (1000+ employees).', 'Deliver high-impact product demonstrations to C-level executives.', 'Consistently meet and exceed quarterly revenue quotas.'],
    requirements: ['6+ years of quota-carrying B2B SaaS sales experience.', 'Prior experience selling HR, Payroll, or HCM software is mandatory.', 'Proven track record of closing 6-figure ACV deals.']
  },
  { 
    id: 5, title: 'DevOps / Platform Engineer', dept: 'Infrastructure', location: 'Remote', type: 'Full-time', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', glow: 'rgba(59,130,246,0.15)', desc: 'Ensure 99.99% uptime for our global platform. Kubernetes, Terraform, and observability stack expertise required.',
    responsibilities: ['Maintain and optimize our global Kubernetes clusters.', 'Enhance CI/CD pipelines to ensure safe, daily deployments.', 'Implement robust monitoring and alerting using Datadog and Prometheus.'],
    requirements: ['Extensive experience with Docker, Kubernetes, and Helm.', 'Proficiency in Infrastructure as Code (Terraform).', 'Strong background in Linux administration and networking.']
  },
  { 
    id: 6, title: 'UX / Product Designer', dept: 'Design', location: 'Remote', type: 'Contract', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', glow: 'rgba(236,72,153,0.15)', desc: 'Craft beautiful, functional interfaces for complex HR workflows. Figma proficiency and motion design skills valued.',
    responsibilities: ['Translate complex HR workflows into simple, intuitive user interfaces.', 'Maintain and evolve the Cognitive EMS design system.', 'Create high-fidelity prototypes for usability testing and developer handoff.'],
    requirements: ['Stunning portfolio demonstrating premium B2B or SaaS product design.', 'Expert-level proficiency in Figma.', 'Understanding of HTML/CSS and framer-motion is a strong plus.']
  },
];

const perks = [
  { icon: Globe2, label: 'Fully Remote', desc: 'Work from anywhere in the world.' },
  { icon: TrendingUp, label: 'Equity Upside', desc: 'Meaningful stock options from day one.' },
  { icon: Heart, label: 'Health Coverage', desc: 'Premium health, dental & vision for you and family.' },
  { icon: Coffee, label: 'Async-First Culture', desc: 'Deep work protected. Meetings are optional by default.' },
  { icon: Zap, label: 'Fast Growth', desc: 'Learning budgets and direct paths to senior roles.' },
  { icon: Users2, label: 'Elite Team', desc: 'Work alongside ex-Google, ex-Stripe, and ex-Razorpay engineers.' },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function CareersPage() {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const handleApply = (jobId, e) => {
    if(e) e.stopPropagation();
    if (!appliedJobs.includes(jobId)) {
      setAppliedJobs([...appliedJobs, jobId]);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#050505] font-sans overflow-x-hidden selection:bg-orange-500/30">
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      <ThemedBackground />

      <div className="relative z-10 flex-1 w-full px-6 lg:px-10 max-w-[95%] 2xl:max-w-[1920px] mx-auto pt-6 pb-24">
        <Navbar />

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-16 space-y-24 max-w-6xl mx-auto">

          {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
          <motion.div variants={fadeInUp} className="text-center max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 shadow-[inset_0_1px_0px_rgba(255,255,255,0.05)] mx-auto">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
                We're Hiring
              </span>
            </div>
            
            <h1 className={`text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter ${textPrimary} leading-[1.05]`}>
              Build the future of<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-violet-400">
                Human Resources
              </span>
            </h1>
            
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
              We're a team of builders obsessed with making HR effortless, intelligent, and humane. Come build with us.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full shadow-[inset_0_1px_0px_rgba(255,255,255,0.05)]"><Users2 size={14} className="text-orange-400" /> 45 Team Members</span>
              <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full shadow-[inset_0_1px_0px_rgba(255,255,255,0.05)]"><Globe2 size={14} className="text-violet-400" /> 12 Countries</span>
              <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full shadow-[inset_0_1px_0px_rgba(255,255,255,0.05)]"><TrendingUp size={14} className="text-emerald-400" /> Series A Funded</span>
            </div>
          </motion.div>

          {/* ── OPEN ROLES ───────────────────────────────────────────────────── */}
          <motion.div variants={fadeInUp}>
            <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-4">
              <h2 className={`text-3xl md:text-4xl font-black tracking-tighter ${textPrimary}`}>
                Open Positions
              </h2>
              <span className="text-orange-400 font-bold text-sm bg-orange-400/10 border border-orange-400/20 px-3 py-1 rounded-full flex items-center gap-2">
                {jobs.length} Roles <Sparkles size={14} />
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {jobs.map((job) => (
                <SpotlightCard 
                  key={job.id} 
                  color={job.glow} 
                  className={`${glassCardStyle} p-6 group cursor-pointer hover:border-white/10 transition-colors`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6" onClick={() => setSelectedJob(job)}>
                    
                    <div className={`p-4 rounded-2xl ${job.bg} border ${job.border} shadow-[inset_0_1px_0px_rgba(255,255,255,0.1)] shrink-0 self-start md:self-center`}>
                      <Briefcase size={24} className={job.color} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className={`font-black text-xl tracking-tight ${textPrimary} group-hover:text-orange-400 transition-colors`}>{job.title}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${job.bg} ${job.color} ${job.border} shadow-[inset_0_1px_0px_rgba(255,255,255,0.05)]`}>
                          {job.dept}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed mb-4 max-w-3xl">{job.desc}</p>
                      
                      <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <span className="flex items-center gap-1.5 bg-[#121214] border border-white/5 px-3 py-1.5 rounded-lg shadow-inner">
                          <MapPin size={14} className="text-slate-400" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1.5 bg-[#121214] border border-white/5 px-3 py-1.5 rounded-lg shadow-inner">
                          <Clock size={14} className="text-slate-400" /> {job.type}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => handleApply(job.id, e)}
                      className={`shrink-0 h-12 px-8 flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all duration-300 shadow-[0_4px_14px_rgba(255,255,255,0.1)] uppercase tracking-widest whitespace-nowrap
                        ${appliedJobs.includes(job.id) 
                          ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-[inset_0_1px_0px_rgba(255,255,255,0.1)] cursor-default' 
                          : 'bg-white text-black hover:scale-105 active:scale-95'
                        }`}
                    >
                      {appliedJobs.includes(job.id) ? (
                        <><CheckCircle2 size={16} /> Applied</>
                      ) : (
                        <>Apply Now <ArrowRight size={16} /></>
                      )}
                    </button>
                    
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </motion.div>

          {/* ── PERKS & BENEFITS ─────────────────────────────────────────────── */}
          <motion.div variants={fadeInUp}>
            <div className="text-center mb-12">
              <h2 className={`text-4xl md:text-5xl font-black tracking-tighter ${textPrimary} mb-4`}>Why Cognitive EMS?</h2>
              <p className="text-slate-400 max-w-xl mx-auto font-medium">
                We believe in taking care of the people who are building the future of people ops.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {perks.map((p, i) => (
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

          {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
          <motion.div variants={fadeInUp} className="relative overflow-hidden rounded-[32px] p-[1px] bg-gradient-to-r from-orange-500/30 via-violet-500/20 to-pink-500/30">
            <div className="bg-[#0a0a0c] rounded-[31px] p-12 md:p-20 text-center relative overflow-hidden backdrop-blur-xl">
              <div className="absolute inset-0 opacity-20 mix-blend-screen" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #f97316, transparent 60%)' }} />
              
              <div className="relative z-10 max-w-2xl mx-auto">
                <h3 className="text-3xl md:text-5xl font-black tracking-tighter mb-6 leading-tight">
                  Don't see your role?
                </h3>
                <p className="text-slate-300 text-lg mb-10 font-medium">
                  We're always open to exceptional talent. Send us your profile and we'll find a way to work together.
                </p>
                
                <a 
                  href="mailto:careers@cognitiveems.com" 
                  className="inline-flex items-center gap-2 px-10 h-14 bg-white text-black font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_4px_24px_rgba(255,255,255,0.2)] text-sm uppercase tracking-widest whitespace-nowrap"
                >
                  Send Open Application <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>

      <Footer />

      {/* ── JOB DETAILS MODAL ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#050505]/90 backdrop-blur-sm"
            onClick={() => setSelectedJob(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl bg-[#0a0a0c]/95 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden flex flex-col max-h-[90vh] shadow-[0_40px_80px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] ring-1 ring-white/5"
            >
              
              {/* Modal Header */}
              <div className="relative p-8 border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent flex-shrink-0">
                <button 
                  onClick={() => setSelectedJob(null)} 
                  className="absolute top-6 right-6 text-slate-500 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors bg-[#121214] border border-white/5"
                >
                  <X size={20} />
                </button>
                
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border ${selectedJob.bg} ${selectedJob.color} ${selectedJob.border} shadow-[inset_0_1px_0px_rgba(255,255,255,0.05)]`}>
                    {selectedJob.dept}
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#121214] border border-white/5 px-3 py-1.5 rounded-lg text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                    <MapPin size={12} /> {selectedJob.location}
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#121214] border border-white/5 px-3 py-1.5 rounded-lg text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                    <Clock size={12} /> {selectedJob.type}
                  </span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight max-w-[90%]">
                  {selectedJob.title}
                </h2>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-[#050505] space-y-10">
                
                <section>
                  <h4 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                    <Briefcase size={18} className="text-orange-400"/> The Role
                  </h4>
                  <p className="text-slate-300 text-[15px] leading-relaxed bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-inner">
                    {selectedJob.desc}
                  </p>
                </section>

                <section>
                  <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Target size={18} className="text-violet-400"/> Key Responsibilities
                  </h4>
                  <ul className="space-y-3">
                    {selectedJob.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-300 text-[15px] leading-relaxed">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                        {resp}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Code size={18} className="text-emerald-400"/> Requirements
                  </h4>
                  <ul className="space-y-3">
                    {selectedJob.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-300 text-[15px] leading-relaxed">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </section>

              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/5 bg-[#0a0a0c] flex justify-end flex-shrink-0">
                <button 
                  onClick={(e) => { handleApply(selectedJob.id, e); setSelectedJob(null); }}
                  className={`h-12 px-10 flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all shadow-[0_4px_14px_rgba(255,255,255,0.2)] uppercase tracking-widest
                    ${appliedJobs.includes(selectedJob.id) 
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' 
                      : 'bg-white text-black hover:scale-105 active:scale-95'
                    }`}
                >
                  {appliedJobs.includes(selectedJob.id) ? (
                    <><CheckCircle2 size={16} /> Application Submitted</>
                  ) : (
                    <>Submit Application <ArrowRight size={16} /></>
                  )}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}