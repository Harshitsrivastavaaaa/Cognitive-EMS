import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ShieldCheck, Terminal, MapPin, Mail } from 'lucide-react';
import AkiyamLogo from '../../assets/logo.png';

export default function Footer() {
  return (
    <footer className="relative z-20 w-full bg-white/80 backdrop-blur-2xl text-slate-700 font-sans border-t border-slate-200/80 pt-20 pb-12 overflow-hidden shadow-sm">
      
      {/* Floating Animated Color Blobs Matching the Landing Page */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{
            y: [0, -30, 0],
            x: [0, 30, 0],
            scale: [1, 1.15, 1],
            backgroundColor: ['rgba(244, 114, 182, 0.15)', 'rgba(168, 85, 247, 0.15)', 'rgba(59, 130, 246, 0.15)', 'rgba(244, 114, 182, 0.15)']
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[120px] mix-blend-multiply" 
        />
        <motion.div 
          animate={{
            y: [0, 40, 0],
            x: [0, -30, 0],
            scale: [1, 1.2, 1],
            backgroundColor: ['rgba(168, 85, 247, 0.15)', 'rgba(59, 130, 246, 0.15)', 'rgba(244, 114, 182, 0.15)', 'rgba(168, 85, 247, 0.15)']
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] right-[10%] w-[600px] h-[600px] rounded-full blur-[140px] mix-blend-multiply" 
        />
      </div>

      <div className="w-full px-6 lg:px-16 relative z-10">
        
        {/* Full-Width Streamlined Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-12 border-b border-slate-200/80">
          
          {/* Brand & Address (Span 6) */}
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 p-1.5 shadow-sm">
                <img src={AkiyamLogo} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-black text-lg tracking-tight text-slate-900">
                Hash<span className="text-pink-600">#</span>AI <span className="text-xs font-semibold text-slate-500 pl-1 border-l border-slate-200 ml-1">EMS</span>
              </span>
            </div>
            
            <p className="text-xs text-slate-600 max-w-md leading-relaxed">
              Enterprise employee management suite featuring automated payroll, real-time telemetry, team resource allocation, and instant legal document dispatch.
            </p>

            {/* Address Block */}
            <div className="space-y-2 pt-1 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-pink-600 shrink-0 mt-0.5" />
                <span>Hash#AI LLC, Cyber Park, Tower A, New Delhi, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-pink-600 shrink-0" />
                <span>support@hash.ai</span>
              </div>
            </div>
          </div>

          {/* Column 1: Navigation (Span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-600">
              <li><Link to="/dashboard" className="hover:text-pink-600 transition-colors">Admin Dashboard</Link></li>
              <li><Link to="/employees" className="hover:text-pink-600 transition-colors">Personnel Directory</Link></li>
              <li><Link to="/projects" className="hover:text-pink-600 transition-colors">Project Allocations</Link></li>
              <li><Link to="/salary" className="hover:text-pink-600 transition-colors">Payroll & Payslips</Link></li>
            </ul>
          </div>

          {/* Column 2: Quick Links (Span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-600">
              <li><Link to="/docs" className="hover:text-pink-600 transition-colors flex items-center gap-1">Documentation <ArrowUpRight size={12} /></Link></li>
              <li><Link to="/product" className="hover:text-pink-600 transition-colors">System Architecture</Link></li>
              <li><Link to="/contact" className="hover:text-pink-600 transition-colors">Contact Support</Link></li>
              <li><Link to="/login" className="hover:text-pink-600 transition-colors">Portal Sign In</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Security Badges Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Hash#AI LLC. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase shadow-2xs">
              <ShieldCheck size={12} className="text-emerald-600" /> SOC2 Secure
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase shadow-2xs">
              <Terminal size={12} className="text-pink-600" /> v1.0.0. Active
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}