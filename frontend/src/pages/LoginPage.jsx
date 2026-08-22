import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, Building2, UserCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import '@/index.css'
import Hashailogo from "../assets/logo.png";
import Navbar from "../components/layout/Navbar"

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
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center font-sans text-slate-900 relative">
            <div className="absolute top-0 w-full z-50">
                <Navbar />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[850px] flex flex-col lg:flex-row bg-white/80 backdrop-blur-lg border border-slate-200 rounded-[2rem] overflow-hidden shadow-xl mx-4 mt-16 lg:mt-0"
            >
                {/* Info Column (Left) */}
                <div className="hidden lg:flex flex-col justify-between w-[45%] py-10 px-8 bg-slate-50/50 border-r border-slate-200 relative overflow-hidden">
                    <div className="relative z-10 space-y-6">
                        {/* Logo Box with Curved Edges */}
                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 p-2 flex items-center justify-center shadow-sm">
                            <img 
                                src={Hashailogo} 
                                alt="Hash#AI Logo" 
                                className="w-full h-full object-contain" 
                            />
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                              Hash#AI <br/>
                              <span className="text-blue-600 font-bold">
                                  Automated Employee Management System
                              </span>
                          </h1>
                          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                              Internal configuration node and personnel management system.
                          </p>
                        </div>
                    </div>

                    <div className="relative z-10 space-y-4 mt-10">
                        {[
                            { text: 'Internal Database Node Active', icon: <CheckCircle size={14} className="text-emerald-600" /> },
                            { text: 'SSL Encrypted Session', icon: <Lock size={14} className="text-blue-600" /> }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                    {item.icon}
                                </div>
                                <span className="text-xs font-semibold text-slate-600">{item.text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="relative z-10 text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-12">
                        <span>Hash#AI © 2026</span>
                    </div>
                </div>

                {/* Form Column (Right) */}
                <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 bg-white">
                    <div className="w-full max-w-[320px] space-y-8">
                        
                        {/* Role Toggle */}
                        <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-inner">
                            <button
                                type="button"
                                onClick={() => { setLoginRole('employer'); setError('') }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                                    loginRole === 'employer'
                                        ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                                }`}
                            >
                                <Building2 size={16} /> Employer
                            </button>
                            <button
                                type="button"
                                onClick={() => { setLoginRole('employee'); setError('') }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                                    loginRole === 'employee'
                                        ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                                }`}
                            >
                                <UserCircle size={16} /> Employee
                            </button>
                        </div>

                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                Welcome Back
                            </h2>
                            <p className="text-sm text-slate-500">
                                {loginRole === 'employee' ? 'Sign in to your employee portal' : 'Access the admin dashboard'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative group">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input 
                                    name="email" 
                                    type="email" 
                                    placeholder="Work Email" 
                                    className="w-full py-3 pl-10 pr-4 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 text-slate-900 transition-all placeholder:text-slate-400 shadow-sm" 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>

                            <div className="relative group">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input 
                                    name="password" 
                                    type={showPassword ? 'text' : 'password'} 
                                    placeholder="Password" 
                                    className="w-full py-3 pl-10 pr-10 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 text-slate-900 transition-all placeholder:text-slate-400 shadow-sm" 
                                    onChange={handleChange} 
                                    required 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            <div className="h-5 flex items-center justify-center">
                                {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs font-semibold">⚠ {error}</motion.div>}
                                {successMessage && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-600 text-xs font-semibold flex items-center gap-1"><CheckCircle size={14}/> {successMessage}</motion.div>}
                            </div>

                            <div className="pt-2">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting} 
                                    className={`w-full py-3 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group text-sm disabled:opacity-70 shadow-sm hover:shadow-md ${
                                        loginRole === 'employee'
                                            ? 'bg-emerald-600 hover:bg-emerald-700'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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