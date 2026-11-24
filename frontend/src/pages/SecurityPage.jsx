import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, Server, Key, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const glassCard = 'bg-[#0a0a0c]/70 backdrop-blur-2xl border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_40px_rgba(0,0,0,0.5)] rounded-[28px]';
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90, damping: 18 } } };

const certifications = [
  { label: 'SOC 2 Type II', desc: 'Annual audit by independent third-party', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { label: 'ISO 27001', desc: 'Information Security Management', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { label: 'GDPR Compliant', desc: 'EU General Data Protection Regulation', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { label: 'DPDPA 2023', desc: 'India Digital Personal Data Protection Act', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
];

const practices = [
  { icon: Lock, title: 'Encryption at Rest & in Transit', desc: 'AES-256 encryption for all stored data. TLS 1.3 enforced for all connections. Keys rotated every 90 days.' },
  { icon: Eye, title: 'Zero-Trust Access Model', desc: 'No implicit trust. Every request is authenticated, authorised, and logged. Lateral movement is impossible by architecture.' },
  { icon: Server, title: 'Infrastructure Security', desc: 'Deployed on isolated VPCs with private subnets. No public-facing databases. All infrastructure is declared as code (IaC).' },
  { icon: Key, title: 'Secrets Management', desc: 'All credentials stored in hardware-backed vaults. No secrets in code, environment files, or logs. Automated secret scanning on every commit.' },
  { icon: AlertTriangle, title: 'Penetration Testing', desc: 'Quarterly penetration tests by certified third-party firms. All critical and high findings remediated within 7 days of discovery.' },
  { icon: ShieldCheck, title: 'Incident Response', desc: 'Documented IR plan with RTO < 4 hours. Security incidents affecting customer data are disclosed within 72 hours as required by GDPR.' },
];

const checklist = [
  'Multi-factor authentication (MFA) enforced for all admin accounts',
  'Role-based access control (RBAC) across all modules',
  'Immutable audit logs with tamper detection',
  'Automated dependency vulnerability scanning (Dependabot + Snyk)',
  'DDoS mitigation at the edge via Cloudflare',
  'SIEM with real-time anomaly detection and alerting',
  'Background-checked engineering team with NDAs',
  'Separate production and non-production environments',
];

export default function SecurityPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#050505] font-sans text-white overflow-hidden selection:bg-orange-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[15%] -left-[5%] w-[800px] h-[800px] rounded-full bg-emerald-500/10 blur-[140px] opacity-35 mix-blend-screen" />
        <div className="absolute top-[40%] -right-[10%] w-[700px] h-[700px] rounded-full bg-blue-500/8 blur-[130px] opacity-30 mix-blend-screen" />
      </div>
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <Navbar />
        <motion.div variants={container} initial="hidden" animate="visible" className="mt-12">

          {/* Hero */}
          <motion.div variants={fadeUp} className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-widest uppercase">
              <ShieldCheck size={12} /> Security First
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight">
              Your data is{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">fortress-grade safe.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Security is not a feature at Cognitive EMS — it's the foundation. Every architectural decision starts with the question: how do we protect our customers' most sensitive data?
            </p>
          </motion.div>

          {/* Certifications */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
            {certifications.map((c, i) => (
              <div key={i} className={`${glassCard} p-5 text-center border ${c.border} hover:border-current/30 transition-colors duration-300`}>
                <CheckCircle2 size={24} className={`${c.color} mx-auto mb-3`} />
                <p className={`font-black text-sm ${c.color}`}>{c.label}</p>
                <p className="text-xs text-slate-500 mt-1">{c.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Security Practices */}
          <motion.div variants={fadeUp} className="mb-14">
            <h2 className="text-2xl font-black mb-6">Security Practices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {practices.map((p, i) => (
                <motion.div key={i} variants={fadeUp} className={`${glassCard} p-6 flex gap-4 items-start group hover:border-white/10 transition-colors duration-300`}>
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <p.icon size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm mb-1">{p.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Checklist */}
          <motion.div variants={fadeUp} className={`${glassCard} p-8 mb-14`}>
            <h2 className="text-xl font-black mb-6">Security Checklist</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Vulnerability Disclosure */}
          <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[28px] p-px bg-gradient-to-r from-emerald-500/30 via-teal-500/15 to-emerald-500/30 mb-10">
            <div className="bg-[#080809] rounded-[27px] p-10 text-center">
              <AlertTriangle size={28} className="text-amber-400 mx-auto mb-4" />
              <h3 className="text-2xl font-black mb-2">Found a vulnerability?</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-lg mx-auto">We run a responsible disclosure program. If you discover a security issue, please email us privately before public disclosure. We respond within 24 hours and reward impactful findings.</p>
              <a href="mailto:security@cognitiveems.com" className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black rounded-2xl hover:bg-emerald-500/25 transition-all text-sm uppercase tracking-widest">
                security@cognitiveems.com
              </a>
            </div>
          </motion.div>

        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
