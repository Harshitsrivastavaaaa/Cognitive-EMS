import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronDown } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const glassCard = 'bg-[#0a0a0c]/70 backdrop-blur-2xl border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_40px_rgba(0,0,0,0.5)] rounded-[28px]';
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90, damping: 18 } } };
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

const sections = [
  { title: '1. Information We Collect', body: 'We collect information you provide directly (name, email, company details), usage data (pages visited, features used, session duration), device information (browser type, IP address, OS), and HR data you input into the platform (employee records, payroll data, performance reviews). All HR data is owned entirely by you.' },
  { title: '2. How We Use Your Information', body: 'Your information is used to operate and improve the Hash# HRMS platform, personalise your experience, provide customer support, send transactional and product-related communications, and comply with legal obligations. We do not sell your personal data to third parties — ever.' },
  { title: '3. Data Sharing & Disclosure', body: 'We share data only with trusted subprocessors (cloud infrastructure, payment processors) under strict DPAs, or when required by law. We never share your HR data with other Hash# customers. A full list of subprocessors is available upon request.' },
  { title: '4. Data Retention', body: 'Account data is retained for the duration of your subscription plus 90 days after termination. You may request earlier deletion at any time. Anonymised usage analytics may be retained for up to 3 years for product improvement purposes.' },
  { title: '5. Your Rights (GDPR & DPDPA)', body: 'You have the right to access, rectify, port, or erase your personal data. EU and EEA residents have rights under GDPR; Indian residents have rights under the DPDPA 2023. Submit requests to privacy@hash.in and we will respond within 30 days.' },
  { title: '6. Security', body: 'We protect data using AES-256 encryption at rest, TLS 1.3 in transit, strict role-based access controls, and continuous penetration testing. Hash# is SOC 2 Type II certified. For security vulnerability reports, contact security@hash.in.' },
  { title: '7. Cookies', body: 'We use strictly necessary cookies for authentication, functional cookies for preferences, and analytics cookies (with your consent) to understand platform usage. You can manage cookie preferences in your account settings at any time.' },
  { title: '8. Changes to This Policy', body: 'We may update this Privacy Policy periodically. Material changes will be communicated via email and in-app notification at least 14 days before they take effect. Continued use of the platform constitutes acceptance of the updated policy.' },
  { title: '9. Contact Us', body: 'For privacy-related questions or requests, contact our Data Protection Officer at privacy@hash.in or write to: Hash# Solutions, Noida, Uttar Pradesh, India — 201301.' },
];

function Accordion({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${glassCard} overflow-hidden transition-colors duration-200 hover:border-white/10`}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-6 text-left gap-4">
        <span className="font-black text-base">{item.title}</span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <div className="px-6 pb-6 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">{item.body}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#050505] font-sans text-white overflow-hidden selection:bg-orange-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[15%] -left-[5%] w-[700px] h-[700px] rounded-full bg-emerald-500/8 blur-[140px] opacity-30 mix-blend-screen" />
        <div className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] rounded-full bg-violet-500/8 blur-[130px] opacity-25 mix-blend-screen" />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        <Navbar />
        <motion.div variants={container} initial="hidden" animate="visible" className="mt-12">
          <motion.div variants={fadeUp} className="text-center mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-widest uppercase">
              <Shield size={12} /> Legal
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Privacy Policy</h1>
            <p className="text-slate-500 text-sm">Last updated: June 20, 2026 &bull; Effective: June 20, 2026</p>
            <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
              We take your privacy seriously. This policy explains exactly what data we collect, how we use it, and the rights you have over it.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-3 mb-10">
            {sections.map((s, i) => <Accordion key={i} item={s} />)}
          </motion.div>

          <motion.div variants={fadeUp} className={`${glassCard} p-6 text-center`}>
            <p className="text-slate-400 text-sm">Questions about this policy? <a href="mailto:privacy@hash.in" className="text-orange-400 hover:underline">privacy@hash.in</a></p>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
