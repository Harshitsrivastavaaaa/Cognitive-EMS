import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const glassCard = 'bg-[#0a0a0c]/70 backdrop-blur-2xl border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_40px_rgba(0,0,0,0.5)] rounded-[28px]';
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90, damping: 18 } } };
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

const sections = [
  { title: '1. Acceptance of Terms', body: 'By accessing or using Cognitive EMS ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service. These Terms apply to all users including administrators, employees, and guests.' },
  { title: '2. Description of Service', body: 'Cognitive EMS provides a cloud-based Human Resource Management System including modules for recruitment, onboarding, payroll, performance management, leave management, background verification, and AI analytics. Features may vary by subscription plan.' },
  { title: '3. Account Registration & Security', body: 'You must provide accurate, complete information when registering. You are responsible for maintaining the confidentiality of your credentials and all activities under your account. Notify us immediately at security@cognitiveems.com of any unauthorised access.' },
  { title: '4. Subscription & Payment', body: 'Subscriptions are billed monthly or annually in advance. Payments are non-refundable except as required by law. Cognitive EMS reserves the right to modify pricing with 30 days\' notice. Failure to pay may result in service suspension.' },
  { title: '5. Data Ownership', body: 'You retain full ownership of all HR data you input into the platform. Cognitive EMS will not access your data except to provide the Service or as required by law. Upon termination, your data will be available for export for 90 days.' },
  { title: '6. Acceptable Use', body: 'You agree not to use the Service to violate any law, infringe intellectual property, transmit malware, conduct unauthorised penetration testing, scrape data without permission, or impersonate another person or organisation.' },
  { title: '7. Intellectual Property', body: 'All software, algorithms, UI components, and documentation are the exclusive property of Cognitive EMS. No part of the Service may be copied, modified, or reverse-engineered without express written consent.' },
  { title: '8. Limitation of Liability', body: 'To the maximum extent permitted by law, Cognitive EMS\'s liability for any claim arising out of these Terms shall not exceed the fees paid by you in the 3 months preceding the claim. We are not liable for indirect, incidental, or consequential damages.' },
  { title: '9. Termination', body: 'Either party may terminate these Terms with 30 days\' written notice. Cognitive EMS may suspend or terminate immediately for material breach. Upon termination, your access ends and data export is available for 90 days.' },
  { title: '10. Governing Law', body: 'These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Noida, Uttar Pradesh, India. For international users, applicable local laws may also apply.' },
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

export default function TermsPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#050505] font-sans text-white overflow-hidden selection:bg-orange-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[15%] -left-[5%] w-[700px] h-[700px] rounded-full bg-blue-500/8 blur-[140px] opacity-30 mix-blend-screen" />
        <div className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] rounded-full bg-violet-500/8 blur-[130px] opacity-25 mix-blend-screen" />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        <Navbar />
        <motion.div variants={container} initial="hidden" animate="visible" className="mt-12">
          <motion.div variants={fadeUp} className="text-center mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-widest uppercase">
              <FileText size={12} /> Legal
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Terms of Service</h1>
            <p className="text-slate-500 text-sm">Last updated: June 20, 2026 &bull; Effective: June 20, 2026</p>
            <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
              Please read these terms carefully before using Cognitive EMS. They define your rights and obligations as a user.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-3 mb-10">
            {sections.map((s, i) => <Accordion key={i} item={s} />)}
          </motion.div>

          <motion.div variants={fadeUp} className={`${glassCard} p-6 text-center`}>
            <p className="text-slate-400 text-sm">Questions about these terms? <a href="mailto:legal@cognitiveems.com" className="text-orange-400 hover:underline">legal@cognitiveems.com</a></p>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

/* ENDS HERE */
/* Checked - HARSHIT SRIVASTAVA */