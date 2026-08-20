import React, { useState, useRef } from "react";
import {
  Mail, MapPin, Phone, Send, Loader2, CheckCircle2,
  Clock, Globe, Twitter, Linkedin, Github, ChevronDown,
  AlertCircle, Headphones, Building2, Users2, Zap
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

// ─── THEME ─────
const glassCard = `bg-[#0a0a0c]/70 backdrop-blur-2xl border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_40px_rgba(0,0,0,0.5)] rounded-[28px]`;

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
              `radial-gradient(500px circle at ${mx}px ${my}px, rgba(249,115,22,0.12), transparent 50%)`
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
    label: "Email Us",
    value: "hello@hash.in",
    sub: "24-hour response SLA",
    href: "mailto:hello@hash.in",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "+91 98765 43210",
    sub: "Mon–Fri, 9 AM – 6 PM IST",
    href: "tel:+919876543210",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: MapPin,
    label: "Headquarters",
    value: "Noida, Uttar Pradesh",
    sub: "India — 201301",
    href: "https://maps.google.com/?q=Noida,UP",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
];

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Globe, href: "#", label: "Website" },
];

const inquiryTypes = [
  { value: "general", label: "General Inquiry", icon: Headphones },
  { value: "enterprise", label: "Enterprise Sales", icon: Building2 },
  { value: "hr", label: "HR Partnership", icon: Users2 },
  { value: "support", label: "Technical Support", icon: Zap },
];

const subjects = [
  "Product Demo Request",
  "Pricing & Plans",
  "Integration Help",
  "Bug Report",
  "Feature Request",
  "Partnership Opportunity",
  "Other",
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
              ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
              : "bg-red-950/90 border-red-500/30 text-red-300"
            }`}
        >
          {isSuccess ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <div>
            <p className="font-bold text-sm">{isSuccess ? "Message Sent!" : "Failed to Send"}</p>
            <p className="text-xs opacity-70">
              {isSuccess ? "We'll get back to you within 24 hours." : "Please try again or email us directly."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 opacity-50 hover:opacity-100 transition-opacity text-lg leading-none"
          >
            &times;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


const inputClass = `w-full bg-[#111113] border border-white/[0.07] rounded-xl px-4 py-3.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 hover:border-white/10 transition-all duration-200 shadow-inner`;

// ─── MAIN COMPONENT ──────
export default function Contact() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", subject: "", inquiry: "general", message: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "message") setCharCount(value.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    setToast("success");
    setForm({ name: "", email: "", phone: "", subject: "", inquiry: "general", message: "" });
    setCharCount(0);
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] font-sans text-white overflow-hidden selection:bg-orange-500/30">

      {/* Background Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[15%] -left-[5%] w-[800px] h-[800px] rounded-full bg-orange-500/10 blur-[140px] opacity-50 mix-blend-screen" />
        <div className="absolute top-[30%] -right-[10%] w-[700px] h-[700px] rounded-full bg-violet-500/10 blur-[140px] opacity-40 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[30%] w-[600px] h-[600px] rounded-full bg-blue-500/8 blur-[120px] opacity-30 mix-blend-screen" />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <Navbar />

        <motion.div variants={container} initial="hidden" animate="visible" className="mt-10">

          {/* Hero Header */}
          <motion.div variants={fadeUp} className="text-center mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold tracking-widest uppercase mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              We're Here to Help
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Get In{" "}
              <span className="bg-gradient-to-r from-orange-400 via-orange-300 to-amber-400 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
              Have a question, idea, or want to explore what Hash# can do for your
              organization? Reach out — we'd love to hear from you.
            </p>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* LEFT: Info Panel */}
            <motion.div variants={fadeUp} className="lg:col-span-4 space-y-5">

              {contactInfo.map((item, i) => (
                <motion.a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={fadeIn}
                  whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className={`${glassCard} p-5 flex items-start gap-4 group cursor-pointer hover:border-white/10 transition-colors duration-300 block`}
                >
                  <div className={`p-3 rounded-2xl ${item.bg} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon size={20} className={item.color} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">{item.label}</p>
                    <p className="font-bold text-slate-100 text-sm">{item.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                  </div>
                </motion.a>
              ))}

              {/* Business Hours */}
              <motion.div variants={fadeUp} className={`${glassCard} p-6`}>
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className="text-slate-400" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Business Hours</p>
                </div>
                <div className="space-y-2.5">
                  {[
                    { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM" },
                    { day: "Saturday", hours: "10:00 AM – 2:00 PM" },
                    { day: "Sunday", hours: "Closed" },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{row.day}</span>
                      <span className={`font-semibold ${row.hours === "Closed" ? "text-red-400" : "text-slate-200"}`}>
                        {row.hours}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/15">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-xs text-emerald-400 font-semibold">Currently online & ready to help</p>
                </div>
              </motion.div>

              {/* Social Links */}
              <motion.div variants={fadeUp} className={`${glassCard} p-5`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Find Us Online</p>
                <div className="grid grid-cols-4 gap-2">
                  {socialLinks.map(({ icon: Icon, href, label }, i) => (
                    <a
                      key={i}
                      href={href}
                      aria-label={label}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-orange-500/10 hover:border-orange-500/20 transition-all duration-200 group"
                    >
                      <Icon size={16} className="text-slate-400 group-hover:text-orange-400 transition-colors" />
                      <span className="text-[9px] text-slate-600 group-hover:text-slate-400 transition-colors">{label}</span>
                    </a>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* RIGHT: Contact Form */}
            <motion.div variants={fadeUp} className="lg:col-span-8">
              <SpotlightCard className={glassCard}>
                <div className="relative z-10 p-8 md:p-10">
                  <div className="mb-8">
                    <h2 className="text-2xl font-black tracking-tight">Send a Message</h2>
                    <p className="text-slate-500 text-sm mt-1">Fill in the details below and we'll respond promptly.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Inquiry Type */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inquiry Type</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {inquiryTypes.map(({ value, label, icon: Icon }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, inquiry: value }))}
                            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-semibold transition-all duration-200
                              ${form.inquiry === value
                                ? "bg-orange-500/15 border-orange-500/40 text-orange-300"
                                : "bg-white/[0.03] border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300"
                              }`}
                          >
                            <Icon size={16} />
                            {label}
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
                          className={`${inputClass} flex items-center justify-between text-left`}
                        >
                          <span className={form.subject ? "text-slate-200" : "text-slate-600"}>
                            {form.subject || "Select a subject"}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`text-slate-500 transition-transform duration-200 ${subjectOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                        <AnimatePresence>
                          {subjectOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.15 }}
                              className="absolute top-full mt-2 left-0 right-0 z-30 bg-[#111113] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                            >
                              {subjects.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => { setForm((p) => ({ ...p, subject: s })); setSubjectOpen(false); }}
                                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-500/10 hover:text-orange-300 transition-colors
                                    ${form.subject === s ? "text-orange-300 bg-orange-500/10" : "text-slate-300"}`}
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
                        <span className={`text-[10px] ${charCount > 900 ? "text-orange-400" : "text-slate-600"}`}>
                          {charCount}/1000
                        </span>
                      </div>
                      <textarea
                        id="message" name="message"
                        rows={5} maxLength={1000}
                        value={form.message} onChange={handleChange}
                        placeholder="Tell us about your use case, challenge, or question..."
                        required className={inputClass}
                      />
                    </div>

                    {/* Privacy Note */}
                    <p className="text-xs text-slate-600 leading-relaxed">
                      By submitting, you agree to our{" "}
                      <a href="#" className="text-orange-400 hover:underline">Privacy Policy</a>
                      {" "}and{" "}
                      <a href="#" className="text-orange-400 hover:underline">Terms of Service</a>.
                      We'll never share your information with third parties.
                    </p>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black rounded-2xl hover:from-orange-400 hover:to-amber-400 transition-all duration-300 flex items-center justify-center gap-2.5 text-[13px] uppercase tracking-[0.15em] shadow-[0_4px_24px_rgba(249,115,22,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <><Loader2 className="animate-spin" size={18} /> Sending…</>
                      ) : (
                        <>Send Message <Send size={16} /></>
                      )}
                    </motion.button>
                  </form>
                </div>
              </SpotlightCard>
            </motion.div>
          </div>

          {/* Bottom Stats Strip */}
          <motion.div variants={fadeUp} className={`${glassCard} mt-8 p-6`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { label: "Response Time", value: "< 2 hrs", color: "text-emerald-400" },
                { label: "Customer Satisfaction", value: "98.7%", color: "text-orange-400" },
                { label: "Support Tickets Resolved", value: "12,400+", color: "text-violet-400" },
                { label: "Uptime SLA", value: "99.99%", color: "text-blue-400" },
              ].map((stat, i) => (
                <div key={i}>
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Toast Notification */}
      <Toast status={toast} onClose={() => setToast(null)} />
    </div>
  );
}
