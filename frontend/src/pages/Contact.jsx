import React, { useState, useRef } from "react";
import {
  Mail, MapPin, Phone, Send, Loader2, CheckCircle2,
  Clock, Globe, Twitter, Linkedin, Github, ChevronDown,
  AlertCircle, Headphones, Building2, Users2, Zap, ShieldCheck, Sparkles, HelpCircle, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

// ─── THEME STYLES ─────
const glassCard = `bg-white/85 backdrop-blur-2xl border border-slate-200/90 shadow-xl rounded-[28px] text-slate-900`;

// ─── ANIMATIONS ────
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 18 } },
};
const fadeIn = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

// ─── SPOTLIGHT CARD ───────
const SpotlightCard = ({ children, className = "" }) => {
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
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden group ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-0"
        style={{
          background: useTransform(
            [x, y],
            ([mx, my]) =>
              `radial-gradient(500px circle at ${mx}px ${my}px, rgba(236,72,153,0.08), transparent 50%)`
          ),
        }}
      />
      {children}
    </motion.div>
  );
};

// ─── DATA ────────────────────────────────────────────────────────────────────
const contactInfo = [
  {
    icon: Mail,
    label: "Dedicated Support Desk",
    value: "support@cognitiveems.com",
    href: "mailto:support@cognitiveems.com",
    color: "text-pink-600",
    bg: "bg-pink-50 border border-pink-200",
  },
  {
    icon: Phone,
    label: "Direct Line",
    value: "+91 98765 43210",
    sub: "Mon–Fri, 9:00 AM – 6:00 PM IST",
    href: "tel:+919876543210",
    color: "text-purple-600",
    bg: "bg-purple-50 border border-purple-200",
  },
  {
    icon: MapPin,
    label: "Global Headquarters",
    value: "Cyber Park, Tower B",
    sub: "New Delhi, India — 110001",
    href: "https://maps.google.com/?q=New+Delhi",
    color: "text-blue-600",
    bg: "bg-blue-50 border border-blue-200",
  },
];

const inquiryTypes = [
  { value: "general", label: "General Inquiry", icon: Headphones },
  { value: "enterprise", label: "Enterprise Sales", icon: Building2 },
  { value: "hr", label: "HR Partnership", icon: Users2 },
  { value: "support", label: "Technical Support", icon: Zap },
];

const subjects = [
  "Product Demo Request",
  "Pricing & Custom Plans",
  "Integration Help & API",
  "Security & Compliance",
  "Feature Request",
  "Partnership Opportunity",
  "Other",
];

const faqs = [
  { q: "How fast is enterprise deployment?", a: "Most organizations complete onboarding and data migration in under 48 hours using our automated CSV import tools." },
  { q: "Is employee data encrypted?", a: "Yes. All records and document vaults are AES-256 encrypted at rest and transmitted securely via TLS 1.3." },
  { q: "Can we test before purchasing?", a: "Absolutely. You can click 'Live Demo' on our navigation bar to access the full sandbox environment immediately." }
];

// ─── TOAST ───────────────────────────────────────────────────────────────────
const Toast = ({ status, onClose }) => {
  const isSuccess = status === "success";
  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl
            ${isSuccess
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
            }`}
        >
          {isSuccess ? <CheckCircle2 size={20} className="text-emerald-600" /> : <AlertCircle size={20} className="text-red-600" />}
          <div>
            <p className="font-bold text-sm">{isSuccess ? "Ticket Dispatched Successfully!" : "Submission Failed"}</p>
            <p className="text-xs opacity-80">
              {isSuccess ? "Our solutions architect will reach out shortly." : "Please try again or email us directly."}
            </p>
          </div>
          <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100 transition-opacity text-lg leading-none cursor-pointer">
            &times;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const inputClass = `w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all duration-200 shadow-2xs`;

// ─── MAIN COMPONENT ──────
export default function Contact() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", subject: "", inquiry: "enterprise", message: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "message") setCharCount(value.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Will Replace this placeholder URL with my deployed Google Apps Script Web App URL later before finishing this product
    const GOOGLE_SHEET_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        mode: "no-cors", // Required to bypass CORS restrictions with Google Scripts
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      setToast("success");
      setForm({ name: "", email: "", phone: "", subject: "", inquiry: "enterprise", message: "" });
      setCharCount(0);
    } catch (error) {
      console.error("Submission error:", error);
      setToast("error");
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] font-sans text-slate-900 overflow-x-hidden selection:bg-pink-500/15">

      {/* Dynamic Color-Morphing Background Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{
            y: [0, -50, 0],
            x: [0, 40, 0],
            scale: [1, 1.2, 1],
            backgroundColor: ['rgba(244, 114, 182, 0.25)', 'rgba(168, 85, 247, 0.25)', 'rgba(59, 130, 246, 0.25)', 'rgba(244, 114, 182, 0.25)']
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[700px] h-[700px] rounded-full blur-[140px] mix-blend-multiply" 
        />
        <motion.div 
          animate={{
            y: [0, 60, 0],
            x: [0, -50, 0],
            scale: [1, 1.25, 1],
            backgroundColor: ['rgba(168, 85, 247, 0.22)', 'rgba(59, 130, 246, 0.22)', 'rgba(244, 114, 182, 0.22)', 'rgba(168, 85, 247, 0.22)']
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] -right-[10%] w-[800px] h-[800px] rounded-full blur-[160px] mix-blend-multiply" 
        />
        <motion.div 
          animate={{
            y: [0, -40, 0],
            x: [0, -40, 0],
            scale: [1, 1.15, 1],
            backgroundColor: ['rgba(255, 255, 255, 0.8)', 'rgba(244, 114, 182, 0.2)', 'rgba(168, 85, 247, 0.2)', 'rgba(255, 255, 255, 0.8)']
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[10%] left-[20%] w-[900px] h-[900px] rounded-full blur-[170px] mix-blend-multiply" 
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <Navbar />

        <motion.div variants={container} initial="hidden" animate="visible" className="mt-20">

          {/* Hero Header */}
          <motion.div variants={fadeUp} className="text-center mb-16 space-y-4">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-slate-900">
              Let's Scale Your <br />
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Workforce Operations
              </span>
            </h1>
            <p className="text-slate-600 text-base max-w-2xl mx-auto leading-relaxed font-normal">
              Whether you need custom integrations, enterprise pricing, or onboarding assistance, our engineering and solutions team is ready.
            </p>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">

            {/* LEFT: Info Panel & FAQs */}
            <motion.div variants={fadeUp} className="lg:col-span-5 space-y-6">

              {contactInfo.map((item, i) => (
                <motion.a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={fadeIn}
                  whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className={`${glassCard} p-5 flex items-start gap-4 group cursor-pointer hover:border-pink-300 transition-all duration-300 block shadow-sm`}
                >
                  <div className={`p-3 rounded-2xl ${item.bg} shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-2xs`}>
                    <item.icon size={20} className={item.color} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{item.label}</p>
                    <p className="font-bold text-slate-900 text-sm">{item.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                  </div>
                </motion.a>
              ))}

              {/* Quick FAQs Accordion Box */}
              <div className={`${glassCard} p-6 shadow-sm space-y-4`}>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <HelpCircle size={18} className="text-pink-600" />
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-900">Frequently Asked Questions</h4>
                </div>
                
                <div className="space-y-3">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <button
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full text-left text-xs font-bold text-slate-800 flex items-center justify-between gap-2 cursor-pointer hover:text-pink-600 transition-colors"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown size={14} className={`transition-transform shrink-0 ${openFaq === idx ? 'rotate-180 text-pink-600' : 'text-slate-400'}`} />
                      </button>
                      <AnimatePresence>
                        {openFaq === idx && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-slate-600 mt-2 leading-relaxed"
                          >
                            {faq.a}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Status Badge */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-slate-200/90 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800">All Systems Operational</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">99.99% Uptime</span>
              </div>
            </motion.div>

            {/* RIGHT: Contact Form */}
            <motion.div variants={fadeUp} className="lg:col-span-7">
              <SpotlightCard className={`${glassCard} shadow-xl`}>
                <div className="relative z-10 p-8 md:p-10">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-slate-900">Send an Inquiry</h2>
                      <p className="text-slate-500 text-sm mt-1">Our engineering response team will get back to you promptly.</p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                      <MessageSquare size={18} />
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Inquiry Type */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inquiry Category</label>
                      <div className="grid grid-cols-2 gap-2">
                        {inquiryTypes.map(({ value, label, icon: Icon }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, inquiry: value }))}
                            className={`flex items-center gap-2.5 py-3 px-3.5 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer
                              ${form.inquiry === value
                                ? "bg-pink-50 border-pink-300 text-pink-700 shadow-2xs"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                              }`}
                          >
                            <Icon size={16} className={form.inquiry === value ? "text-pink-600" : "text-slate-400"} />
                            <span className="truncate">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name *</label>
                        <input
                          id="name" name="name" type="text"
                          value={form.name} onChange={handleChange}
                          placeholder="e.g. Harshit Kumar"
                          required className={inputClass}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Work Email *</label>
                        <input
                          id="email" name="email" type="email"
                          value={form.email} onChange={handleChange}
                          placeholder="you@company.com"
                          required className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Phone & Subject */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone (Optional)</label>
                        <input
                          id="phone" name="phone" type="tel"
                          value={form.phone} onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-2 relative">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subject *</label>
                        <button
                          type="button"
                          onClick={() => setSubjectOpen((v) => !v)}
                          className={`${inputClass} flex items-center justify-between text-left cursor-pointer`}
                        >
                          <span className={form.subject ? "text-slate-900 font-medium" : "text-slate-400"}>
                            {form.subject || "Select a subject"}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition-transform duration-200 ${subjectOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                        <AnimatePresence>
                          {subjectOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.15 }}
                              className="absolute top-full mt-2 left-0 right-0 z-30 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl"
                            >
                              {subjects.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => { setForm((p) => ({ ...p, subject: s })); setSubjectOpen(false); }}
                                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-pink-50 hover:text-pink-700 transition-colors cursor-pointer
                                    ${form.subject === s ? "text-pink-700 bg-pink-50 font-semibold" : "text-slate-700"}`}
                                >
                                  {s}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="message" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Message *</label>
                        <span className={`text-[10px] ${charCount > 900 ? "text-pink-600 font-bold" : "text-slate-400"}`}>
                          {charCount}/1000
                        </span>
                      </div>
                      <textarea
                        id="message" name="message"
                        rows={4} maxLength={1000}
                        value={form.message} onChange={handleChange}
                        placeholder="Tell us about your organization scale, current HR tools, or specific requirements..."
                        required className={inputClass}
                      />
                    </div>

                    {/* Privacy Note */}
                    <p className="text-xs text-slate-500 leading-relaxed">
                      By submitting, you agree to our{" "}
                      <a href="#" className="text-pink-600 font-semibold hover:underline">Privacy Policy</a>
                      {" "}and{" "}
                      <a href="#" className="text-pink-600 font-semibold hover:underline">Terms of Service</a>.
                      Data is handled under strict SOC2 guidelines.
                    </p>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.01 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl hover:bg-pink-600 transition-all duration-300 flex items-center justify-center gap-2.5 text-[13px] uppercase tracking-[0.15em] shadow-md disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? (
                        <><Loader2 className="animate-spin" size={18} /> Dispatched...</>
                      ) : (
                        <>Submit Inquiry <Send size={16} /></>
                      )}
                    </motion.button>
                  </form>
                </div>
              </SpotlightCard>
            </motion.div>
          </div>

        </motion.div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Toast Notification */}
      <Toast status={toast} onClose={() => setToast(null)} />
    </div>
  );
}