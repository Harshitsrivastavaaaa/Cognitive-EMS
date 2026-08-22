import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users, Clock, FolderKanban, ArrowRight, Search, Building2, Briefcase, Eye, ShieldCheck, QrCode, CreditCard, Mail, Terminal, Cpu, FileText, CheckCircle2, Network, ChevronRight, Layers, Sparkles, ArrowUpRight
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer'

const MOCK_ORG_NODES = [
  { id: 1, name: "Harshit Srivastava", role: "Principal Architect", dept: "Engineering", project: "Core Cloud OS", salary: "₹24,00,000", status: "Active", activity: "Pushed 4 commits today", avatarBg: "from-blue-600 to-indigo-600", tagColor: "bg-blue-50 text-blue-700 border-blue-200", empId: "EMP-8042", email: "sarah.j@hash.ai", uptime: "99.9%", level: "L5 - Principal" },
  { id: 2, name: "Prachi Khanna", role: "Senior UI/UX Designer", dept: "Design", project: "Glassmorphism UI", salary: "₹18,50,000", status: "Active", activity: "Completed Figma review", avatarBg: "from-pink-600 to-rose-600", tagColor: "bg-pink-50 text-pink-700 border-blue-200", empId: "EMP-8043", email: "alex.r@hash.ai", uptime: "99.4%", level: "L4 - Senior" },
  { id: 3, name: "Marcus Kirk", role: "Backend Engineer", dept: "Engineering", project: "Payment Gateway", salary: "₹19,00,000", status: "Active", activity: "In code review", avatarBg: "from-purple-600 to-indigo-600", tagColor: "bg-purple-50 text-purple-700 border-blue-200", empId: "EMP-8044", email: "marcus.t@hash.ai", uptime: "99.8%", level: "L3 - Mid-Level" },
  { id: 4, name: "Elena Rostova", role: "Product Manager", dept: "Product", project: "AI Analytics", salary: "₹22,00,000", status: "Active", activity: "Sprint planning active", avatarBg: "from-emerald-600 to-teal-600", tagColor: "bg-emerald-50 text-emerald-700 border-blue-200", empId: "EMP-8045", email: "elena.r@hash.ai", uptime: "100%", level: "L4 - Lead PM" },
  { id: 5, name: "David Lucas", role: "DevOps Lead", dept: "Operations", project: "Node Infrastructure", salary: "₹21,00,000", status: "Active", activity: "Kubernetes cluster healthy", avatarBg: "from-amber-600 to-orange-600", tagColor: "bg-amber-50 text-amber-700 border-blue-200", empId: "EMP-8046", email: "david.k@hash.ai", uptime: "99.9%", level: "L4 - Lead Ops" }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [selectedNode, setSelectedNode] = useState(MOCK_ORG_NODES[0]);
  const [activeDeptTab, setActiveDeptTab] = useState('All');
  const [activeIdCardIndex, setActiveIdCardIndex] = useState(0);
  const [activeDocType, setActiveDocType] = useState('joining');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredNodes = MOCK_ORG_NODES.filter(node => 
    activeDeptTab === 'All' || node.dept === activeDeptTab
  );

  const activeUser = MOCK_ORG_NODES[activeIdCardIndex];

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] text-slate-900 overflow-x-hidden font-sans selection:bg-pink-500/15">
      <Navbar scrolled={scrolled} />

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

      <div className="relative z-10 w-full pt-36 pb-24 flex flex-col items-center">

        {/* ─── FULL-WIDTH HERO SECTION ───────────────────────────────────── */}
        <div className="w-full px-6 lg:px-16 max-w-7xl mx-auto flex flex-col items-center text-center pt-6 pb-16">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/90 shadow-2xs text-xs font-semibold text-slate-700 mb-8">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            Hash#AI Automated EMS by Hash#AI 
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-slate-900 mb-6">
            Enterprise HR & Projects, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600">
              Simplified & Intelligent.
            </span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed mb-10 font-normal">
            Manage personnel directories, allocate engineering squads, track attendance, and autogenerate official ID badges and legal HR letters instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto mb-16">
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-pink-600 text-white font-semibold text-xs tracking-wide shadow-md shadow-slate-900/10 transition-all active:scale-95 cursor-pointer"
            >
              <span>{isAuthenticated ? 'Open Admin Portal' : 'Get Started Free'}</span>
              <ArrowRight size={15} />
            </button>

            <button
              onClick={() => navigate('/product')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-pink-600 hover:border-pink-200 font-semibold text-xs tracking-wide transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <span>Explore Platform</span>
            </button>
          </div>
        </div>

        {/* ─── LIVE ID CARD GENERATOR FEATURE SHOWCASE ───────────────────── */}
        <div className="w-full px-6 lg:px-16 max-w-7xl mx-auto mb-16">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-8 lg:p-12 shadow-xl shadow-slate-900/5 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-pink-50 text-pink-600 border border-pink-200 text-xs font-bold uppercase tracking-wider">
                <CreditCard size={15} /> Automated Credential Engine
              </div>
              
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Instant Autogenerated <br />
                <span className="text-pink-600">Employee ID Badges</span>
              </h2>

              <p className="text-slate-600 text-sm leading-relaxed">
                Hash#AI EMS automatically compiles personnel data into professional, secure ID badges complete with unique verification serials, role credentials, and department tagging. Select a profile below to test live generation:
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {MOCK_ORG_NODES.map((person, idx) => (
                  <button
                    key={person.id}
                    onClick={() => setActiveIdCardIndex(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeIdCardIndex === idx
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {person.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center">
              <motion.div 
                key={activeUser.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-sm bg-gradient-to-b from-white to-slate-50 border border-slate-200/80 rounded-[28px] p-6 shadow-2xl relative overflow-hidden text-slate-900"
              >
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" />

                <div className="flex items-center justify-between pt-2 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-black flex items-center justify-center text-xs">
                      H#
                    </div>
                    <span className="font-extrabold text-sm tracking-tight">Hash<span className="text-pink-600">#</span>AI EMS</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                    {activeUser.empId}
                  </span>
                </div>

                <div className="py-6 flex flex-col items-center text-center space-y-3">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${activeUser.avatarBg} text-white text-2xl font-black flex items-center justify-center shadow-lg`}>
                    {activeUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{activeUser.name}</h3>
                    <p className="text-xs font-semibold text-pink-600 mt-0.5">{activeUser.role}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${activeUser.tagColor}`}>
                    {activeUser.dept} Division
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5 text-left">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Security Clearance</p>
                    <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck size={12} /> Level 4 Verified
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-slate-900 rounded-lg p-1 flex items-center justify-center text-white">
                    <QrCode size={36} />
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>

        {/* ─── OFFICIAL DOCUMENT VAULT & LETTER PREVIEWER ────────────────── */}
        <div className="w-full px-6 lg:px-16 max-w-7xl mx-auto mb-16">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-8 lg:p-12 shadow-xl shadow-slate-900/5 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 text-xs font-bold uppercase tracking-wider">
                <FileText size={15} /> Statutory Document Generator
              </div>
              
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Instant Legal & HR <br />
                <span className="text-purple-600">Document Dispatch</span>
              </h2>

              <p className="text-slate-600 text-sm leading-relaxed">
                Generate formal Joining Letters, Monthly Salary Slips, and Offboarding Experience Certificates instantly with auto-computed compensation structures and digital verification hashes.
              </p>

              <div className="flex flex-col gap-2.5 pt-2">
                {[
                  { id: 'joining', label: 'Official Joining Offer Letter', desc: 'Auto-compiled with role terms & compensation' },
                  { id: 'salary', label: 'Monthly Salary Payslip', desc: 'Detailed PF, TDS, and net disbursement breakdown' },
                  { id: 'offboarding', label: 'Offboarding Experience Certificate', desc: 'Structured separation & service tenure record' }
                ].map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDocType(doc.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      activeDocType === doc.id
                        ? 'bg-purple-50/80 border-purple-300 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className={`text-xs font-bold ${activeDocType === doc.id ? 'text-purple-900' : 'text-slate-900'}`}>{doc.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{doc.desc}</p>
                    </div>
                    {activeDocType === doc.id && <CheckCircle2 size={16} className="text-purple-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 flex justify-center">
              <motion.div 
                key={activeDocType + activeUser.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl relative space-y-6 text-slate-900 font-sans"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                      H#
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm tracking-tight text-slate-900">Hash#AI Technologies Inc.</h4>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">Global HR Operations Node</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                    REF: HASH/2026/892
                  </span>
                </div>

                {activeDocType === 'joining' && (
                  <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                    <p className="font-bold text-slate-900">Dear {activeUser.name},</p>
                    <p>
                      We are thrilled to offer you the position of <strong className="text-slate-900">{activeUser.role}</strong> within our <span className="text-purple-600 font-semibold">{activeUser.dept}</span> division at Hash#AI. Your annual compensation package is structured at <strong className="text-emerald-600">{activeUser.salary}</strong>.
                    </p>
                    <p>
                      You will be assigned to the <strong className="text-slate-900">{activeUser.project}</strong> engineering initiative starting effective immediately.
                    </p>
                  </div>
                )}

                {activeDocType === 'salary' && (
                  <div className="space-y-4 text-xs text-slate-700">
                    <div className="flex justify-between border-b border-slate-100 pb-2 font-bold text-slate-900">
                      <span>Earnings & Deductions</span>
                      <span>Amount (INR)</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>Basic Compensation</span><span className="font-semibold text-slate-900">₹1,20,000</span></div>
                      <div className="flex justify-between"><span>Housing & Medical Allowance</span><span className="font-semibold text-slate-900">₹45,000</span></div>
                      <div className="flex justify-between"><span>Provident Fund (PF Deduction)</span><span className="font-semibold text-rose-600">-₹6,400</span></div>
                      <div className="flex justify-between"><span>Tax Deducted at Source (TDS)</span><span className="font-semibold text-rose-600">-₹12,500</span></div>
                    </div>
                    <div className="pt-3 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                      <span>Net Monthly Disbursement</span>
                      <span className="text-emerald-600">₹1,46,100</span>
                    </div>
                  </div>
                )}

                {activeDocType === 'offboarding' && (
                  <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                    <p className="font-bold text-slate-900">TO WHOMSOEVER IT MAY CONCERN,</p>
                    <p>
                      This is to certify that <strong className="text-slate-900">{activeUser.name}</strong> ({activeUser.empId}) served as <strong className="text-slate-900">{activeUser.role}</strong> in our <span className="text-purple-600 font-semibold">{activeUser.dept}</span> team.
                    </p>
                    <p>
                      During their tenure, they successfully spearheaded deliverables for <strong className="text-slate-900">{activeUser.project}</strong> with exemplary conduct and technical expertise. We wish them the absolute best in their future endeavors.
                    </p>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Authorized Signatory</p>
                    <p className="text-xs font-bold text-slate-900">Chief People Officer, Hash#AI</p>
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={12} /> Digitally Verified
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>

        {/* ─── INTERACTIVE ORG NODE INSPECTOR ────────────────────────────── */}
        <div className="w-full px-6 lg:px-16 max-w-7xl mx-auto mb-24">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-pink-50 text-pink-600 border border-pink-200 shadow-sm">
                <Network size={22} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Interactive Organization Hierarchy Node</h3>
                <p className="text-xs text-slate-500 mt-0.5">Explore personnel structure across departments and inspect live system telemetry.</p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-slate-200/90 shadow-2xs overflow-x-auto">
              {['All', 'Engineering', 'Design', 'Product', 'Operations'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setActiveDeptTab(dept)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeDeptTab === dept
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-[32px] p-6 lg:p-8 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-5 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2">Active Personnel Nodes ({filteredNodes.length})</p>
              
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {filteredNodes.map((node) => {
                  const isSelected = selectedNode.id === node.id;
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? 'bg-pink-50/80 border-pink-300 shadow-sm'
                          : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${node.avatarBg} text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0`}>
                          {node.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-pink-900' : 'text-slate-900'}`}>{node.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{node.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${node.tagColor}`}>
                          {node.dept}
                        </span>
                        <ChevronRight size={14} className={`transition-transform ${isSelected ? 'text-pink-600 translate-x-0.5' : 'text-slate-300'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-900 text-white rounded-3xl p-6 lg:p-8 shadow-inner relative overflow-hidden flex flex-col justify-between min-h-[420px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${selectedNode.avatarBg} text-white font-black flex items-center justify-center text-sm shadow-md`}>
                      {selectedNode.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-white">{selectedNode.name}</h4>
                      <p className="text-xs text-pink-400 font-semibold">{selectedNode.role}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Node {selectedNode.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hierarchy Level</p>
                    <p className="text-sm font-bold text-white mt-1">{selectedNode.level}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Annual Compensation</p>
                    <p className="text-sm font-bold text-emerald-400 mt-1">{selectedNode.salary}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <div className="flex justify-between"><span className="text-slate-400">Employee ID Hash:</span> <span className="font-mono text-white">{selectedNode.empId}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Assigned Project:</span> <span className="font-bold text-pink-400">{selectedNode.project}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Secure Comms:</span> <span className="font-mono text-white">{selectedNode.email}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">System Telemetry:</span> <span className="text-emerald-400 font-semibold">{selectedNode.activity}</span></div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 relative z-10">
                <span>Database Node State: Synchronized</span>
                <button onClick={() => navigate('/login')} className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer">
                  Manage in Portal &rarr;
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ─── FRESH REDESIGNED 3-COLUMN CAPABILITIES CARDS ──────────────── */}
        <div className="w-full px-6 lg:px-16 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <motion.div 
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-[32px] p-8 shadow-sm hover:shadow-2xl transition-all flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Users size={26} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">Personnel Directory</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Centralized HR database offering structured employee profiles, role management, contact lists, and secure document vault integration.
              </p>
              <ul className="space-y-2.5 mb-8 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-600" /> Bulk CSV & Excel data exports</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-600" /> Role & department access control</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-600" /> Live employee status toggles</li>
              </ul>
            </div>
            <button onClick={() => navigate('/login')} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform cursor-pointer">
              <span>Explore Directory</span> <ArrowUpRight size={14} />
            </button>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-[32px] p-8 shadow-sm hover:shadow-2xl transition-all flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 to-pink-600" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <FolderKanban size={26} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">Projects & Allocations</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Map engineering talent to complex project milestones. Track client deliverables, sprint schedules, and portfolio workloads in real time.
              </p>
              <ul className="space-y-2.5 mb-8 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-600" /> Multi-team squad allocation</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-600" /> Deadline & milestone tracking</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-600" /> Resource bandwidth analytics</li>
              </ul>
            </div>
            <button onClick={() => navigate('/login')} className="flex items-center gap-1.5 text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform cursor-pointer">
              <span>View Project Hub</span> <ArrowUpRight size={14} />
            </button>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-[32px] p-8 shadow-sm hover:shadow-2xl transition-all flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-600 to-teal-600" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Clock size={26} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">Attendance & Payroll</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Automated attendance logging, PTO leave approvals, statutory tax calculations (PF & TDS), and instant PDF payslip generations.
              </p>
              <ul className="space-y-2.5 mb-8 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-600" /> One-click monthly salary execution</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-600" /> Automated jsPDF payslip builder</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-600" /> Leave approval workflow manager</li>
              </ul>
            </div>
            <button onClick={() => navigate('/login')} className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform cursor-pointer">
              <span>Inspect Payroll</span> <ArrowUpRight size={14} />
            </button>
          </motion.div>

        </div>
      </div>
    <Footer />
    </div>
  );
}