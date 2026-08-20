import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, Box, Hexagon, Zap, Building2, UserCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import '@/index.css'
import AkiyamLogo from "../assets/logo.png";
import Navbar from "../components/layout/Navbar"

const floatingBlob = {
  animate: {
    y: [0, -30, 0],
    x: [0, 15, 0],
    scale: [1, 1.05, 1],
    rotate: [0, 5, -5, 0],
    transition: { duration: 18, repeat: Infinity, ease: "easeInOut" },
  },
};

export default function LoginPage() {
    const { login, isAuthenticated, role } = useAuth()
    const navigate = useNavigate()
    const [loginRole, setLoginRole] = useState('employer') // 'employer' or 'employee'
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    if (isAuthenticated) {
        return <Navigate to={role === 'employee' ? '/employee-portal' : '/dashboard'} replace />
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')
        try {
            const result = await login(formData.email, formData.password)
            setSuccessMessage('Authentication successful')
            const userRole = result?.user?.role || loginRole
            navigate(userRole === 'employee' ? '/employee-portal' : '/dashboard')
        } catch (err) {
            setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.')
            setIsSubmitting(false)
        }
    }

    return (
        <div className="relative h-screen w-full bg-[#050505] flex items-center justify-center overflow-hidden font-sans selection:bg-violet-500/30">
            <Navbar/>
            <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
            <div className="fixed inset-0 z-0 pointer-events-none">
                <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#7c3aed", "#ea580c", "#7c3aed"] }} transition={{ ...floatingBlob.animate.transition, backgroundColor: { duration: 20, repeat: Infinity, ease: "linear" } }} className="absolute -top-[10%] -left-[5%] w-[700px] h-[700px] rounded-full blur-[140px] opacity-15 mix-blend-screen" />
                <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#ea580c", "#7c3aed", "#ea580c"] }} transition={{ ...floatingBlob.animate.transition, delay: 2, backgroundColor: { duration: 25, repeat: Infinity, ease: "linear" } }} className="absolute top-[20%] -right-[5%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-15 mix-blend-screen" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative z-10 w-full max-w-[850px] flex flex-col lg:flex-row bg-[#0a0a0c]/85 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl mx-4"
            >
                {/* Info Column */}
                <div className="hidden lg:flex flex-col justify-between w-[42%] py-10 px-8 bg-white/[0.01] border-r border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />

                    <div className="relative z-10 space-y-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-white/10 to-transparent border border-white/10 flex items-center justify-center shadow-lg">
                            <img 
                                src={AkiyamLogo} 
                                alt="Hash# Logo" 
                                className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" 
                            />
                        </div>
                        <div>
                          <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
                              Hash# <br/>
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 font-bold">
                                 Employee Management
                              </span>
                          </h1>
                          <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                              Internal workspace configuration node.
                          </p>
                        </div>
                    </div>

                    <div className="relative z-10 space-y-3 mt-8">
                        {[
                            { text: 'Internal Database Node Active', icon: <CheckCircle size={12} className="text-violet-400" /> },
                            { text: 'SSL Encrypted Session', icon: <Lock size={12} className="text-orange-400" /> }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                    {item.icon}
                                </div>
                                <span className="text-[11px] font-semibold text-slate-300">{item.text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="relative z-10 text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-8">
                        <span>Hash# Tech © 2026</span>
                    </div>
                </div>

                {/* Form Column */}
                <div className="flex-1 flex flex-col justify-center items-center p-8 relative bg-[#0a0a0c]">
                    <div className="w-full max-w-[320px] space-y-6">
                        
                        {/* Role Toggle */}
                        <div className="flex bg-[#121214] border border-white/10 rounded-xl p-1">
                            <button
                                type="button"
                                onClick={() => { setLoginRole('employer'); setError('') }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                                    loginRole === 'employer'
                                        ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 text-orange-300 shadow-[0_0_10px_rgba(234,88,12,0.1)]'
                                        : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                <Building2 size={14} /> Employer
                            </button>
                            <button
                                type="button"
                                onClick={() => { setLoginRole('employee'); setError('') }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                                    loginRole === 'employee'
                                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                        : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                <UserCircle size={14} /> Employee
                            </button>
                        </div>

                        <div className="text-center space-y-1.5">
                            <h2 className="text-2xl font-bold text-white tracking-tight">
                                Sign In
                            </h2>
                            <p className="text-xs text-slate-400">
                                {loginRole === 'employee' ? 'Access your employee portal' : 'Access the admin dashboard'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative group">
                                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                                <input name="email" type="email" placeholder="Work Email" className="w-full p-3 pl-11 text-xs bg-[#121214] border border-white/10 rounded-xl focus:outline-none focus:border-violet-500/50 text-white transition-all placeholder:text-slate-600" onChange={handleChange} required />
                            </div>

                            <div className="relative group">
                                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                                <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" className="w-full p-3 pl-11 pr-11 text-xs bg-[#121214] border border-white/10 rounded-xl focus:outline-none focus:border-violet-500/50 text-white transition-all placeholder:text-slate-600" onChange={handleChange} required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1 rounded-md">
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>

                            <div className="h-4 flex items-center justify-center">
                                {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-[11px] font-bold">⚠ {error}</motion.div>}
                                {successMessage && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400 text-[11px] font-bold flex items-center gap-1"><CheckCircle size={11}/> {successMessage}</motion.div>}
                            </div>

                            <div className="pt-1 space-y-3">
                                <button type="submit" disabled={isSubmitting} className={`w-full py-3 text-white font-bold rounded-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 group text-xs uppercase tracking-widest disabled:opacity-50 ${
                                    loginRole === 'employee'
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                        : 'bg-gradient-to-r from-orange-500 to-pink-500'
                                }`}>
                                    {isSubmitting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (
                                        <>
                                            Sign In
                                            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}