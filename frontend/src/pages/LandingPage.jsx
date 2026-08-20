import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, Users, Clock, FolderKanban, Zap, ArrowRight
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const glassCardStyle = "bg-white/85 backdrop-blur-2xl border border-slate-200/80 shadow-md shadow-slate-200/50 rounded-[28px]";

const floatingBlob = {
  animate: {
    y: [0, -30, 0],
    x: [0, 15, 0],
    scale: [1, 1.05, 1],
    rotate: [0, 5, -5, 0],
    transition: { duration: 18, repeat: Infinity, ease: "easeInOut" },
  },
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { demoLogin, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDirectLogin = async (e) => {
    e.preventDefault();
    await demoLogin();
    navigate('/dashboard');
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-50 text-slate-900 overflow-x-hidden font-sans selection:bg-blue-500/20">
      <Navbar scrolled={scrolled} />

      {/* Ambient Neon Blobs Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#60a5fa", "#818cf8", "#38bdf8"] }} transition={{ ...floatingBlob.animate.transition, backgroundColor: { duration: 20, repeat: Infinity, ease: "linear" } }} className="absolute -top-[10%] -left-[10%] w-[900px] h-[900px] rounded-full blur-[150px] opacity-30 mix-blend-multiply" />
        <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#c084fc", "#60a5fa", "#c084fc"] }} transition={{ ...floatingBlob.animate.transition, delay: 2, backgroundColor: { duration: 25, repeat: Infinity, ease: "linear" } }} className="absolute top-[30%] -right-[10%] w-[800px] h-[800px] rounded-full blur-[140px] opacity-25 mix-blend-multiply" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-36 pb-20 flex flex-col items-center justify-between min-h-screen">

        {/* ─── STREAMLINED HERO SECTION ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-4xl text-center flex flex-col items-center my-auto"
        >

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900 mb-6">
            Next-Gen Enterprise <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              Employee & Project HRMS
            </span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed mb-10 font-medium">
            Manage employees, allocate project engineering teams, track attendance, and analyze organizational health in one unified glassmorphism suite.
          </p>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16">

            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all"
            >
              <span>{isAuthenticated ? 'Open Admin Portal' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* ─── STREAMLINED 3-CARD CAPABILITIES GRID ──────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
            <div className={`${glassCardStyle} p-6 flex flex-col justify-between hover:border-blue-500/40 transition-all`}>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-4">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Employee Directory</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Add, edit, delete, and inspect detailed employee profiles, compensation, and technical skillsets.
                </p>
              </div>
            </div>

            <div className={`${glassCardStyle} p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-all`}>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-4">
                <FolderKanban size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Projects & Teams</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Create client projects, allocate engineers and designers, assign project roles, and track deadlines.
                </p>
              </div>
            </div>

            <div className={`${glassCardStyle} p-6 flex flex-col justify-between hover:border-purple-500/40 transition-all`}>
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mb-4">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Daily Attendance</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Batch-mark attendance by department, manage present/absent logs, and generate roster metrics.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}