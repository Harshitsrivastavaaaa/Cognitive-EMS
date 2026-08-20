import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ClipboardCheck, FolderKanban, Calendar, Zap, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { employeePortalService } from '../../services/employeePortal'

export default function EmployeePortalDashboard() {
    const { user } = useAuth()
    const [attendance, setAttendance] = useState(null)
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [marking, setMarking] = useState(false)
    const [markSuccess, setMarkSuccess] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [attData, projData] = await Promise.all([
                employeePortalService.getMyAttendance(),
                employeePortalService.getMyProjects()
            ])
            setAttendance(attData)
            setProjects(projData)
        } catch (err) {
            console.error('Failed to load dashboard data:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleQuickAttendance = async () => {
        setMarking(true)
        try {
            await employeePortalService.markAttendance({ status: 'present' })
            setMarkSuccess(true)
            const attData = await employeePortalService.getMyAttendance()
            setAttendance(attData)
            setTimeout(() => setMarkSuccess(false), 3000)
        } catch (err) {
            console.error('Failed to mark attendance:', err)
        } finally {
            setMarking(false)
        }
    }

    const firstName = user?.first_name || user?.firstName || 'Employee'
    const currentHour = new Date().getHours()
    const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening'

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-white/85 backdrop-blur-xl border border-slate-200/80 p-8 shadow-sm"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                    <p className="text-emerald-600 text-xs font-bold tracking-widest uppercase mb-1">{greeting}</p>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">{firstName}</span>
                    </h1>
                    <p className="text-slate-600 text-sm mt-2">Your employee portal dashboard — manage your profile, track attendance, and view projects.</p>
                </div>
            </motion.div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Attendance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/85 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                                <ClipboardCheck size={18} className="text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Today's Attendance</h3>
                                <p className="text-[10px] text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>

                    {attendance?.today?.marked ? (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                            <CheckCircle size={16} className="text-emerald-600" />
                            <span className="text-sm font-bold text-emerald-700">Marked as {attendance.today.status}</span>
                        </div>
                    ) : (
                        <button
                            onClick={handleQuickAttendance}
                            disabled={marking}
                            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest disabled:opacity-50 shadow-sm"
                        >
                            {marking ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : markSuccess ? (
                                <><CheckCircle size={14} /> Marked!</>
                            ) : (
                                <><Zap size={14} /> Mark Present Now</>
                            )}
                        </button>
                    )}
                </motion.div>

                {/* Monthly Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/85 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center">
                            <Calendar size={18} className="text-violet-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Monthly Stats</h3>
                            <p className="text-[10px] text-slate-500">Attendance rate</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-600 font-medium">Attendance Rate</span>
                            <span className="text-slate-900 font-bold">{attendance?.monthly_rate || 100}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${attendance?.monthly_rate || 100}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-600"
                            />
                        </div>
                        <p className="text-[11px] text-slate-500">{attendance?.present_days_this_month || 0} / {attendance?.total_days_this_month || 0} days present</p>
                    </div>
                </motion.div>

                {/* Projects Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/85 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
                            <FolderKanban size={18} className="text-orange-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">My Projects</h3>
                            <p className="text-[10px] text-slate-500">Active assignments</p>
                        </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900">{projects.length}</div>
                    <div className="space-y-2">
                        {projects.slice(0, 2).map((p) => (
                            <div key={p.id} className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${p.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                <span className="text-xs text-slate-700 font-medium truncate">{p.name}</span>
                            </div>
                        ))}
                        {projects.length > 2 && (
                            <p className="text-[10px] text-slate-500">+{projects.length - 2} more</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
