import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardCheck, CheckCircle, Clock, AlertCircle, Send, ChevronLeft, ChevronRight, CalendarDays, Info, Sparkles, CheckCircle2, XCircle, MinusCircle, Timer, CalendarClock, ShieldAlert } from 'lucide-react'
import { employeePortalService } from '../../services/employeePortal'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function getMonthDays(year, month) {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
}

function dateToStr(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function EmployeeAttendancePage() {
    const [attendance, setAttendance] = useState(null)
    const [loading, setLoading] = useState(true)
    const [marking, setMarking] = useState(false)
    const [formData, setFormData] = useState({ status: 'present', project_name: '', current_task: '' })
    const [showForm, setShowForm] = useState(false)

    const today = new Date()
    const todayStr = dateToStr(today.getFullYear(), today.getMonth(), today.getDate())

    const [viewYear, setViewYear] = useState(today.getFullYear())
    const [viewMonth, setViewMonth] = useState(today.getMonth())

    useEffect(() => {
        loadAttendance()
    }, [])

    const loadAttendance = async () => {
        try {
            const data = await employeePortalService.getMyAttendance()
            setAttendance(data)
        } catch (err) {
            console.error('Failed to load attendance:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkAttendance = async (e) => {
        e.preventDefault()
        setMarking(true)
        try {
            await employeePortalService.markAttendance(formData)
            await loadAttendance()
            setShowForm(false)
        } catch (err) {
            console.error('Failed to mark attendance:', err)
        } finally {
            setMarking(false)
        }
    }

    // Build a lookup map: date-string -> record
    const recordMap = useMemo(() => {
        const map = {}
        if (attendance?.history) {
            attendance.history.forEach(r => { map[r.date] = r })
        }
        return map
    }, [attendance])

    // Parse hire date
    const hireDate = useMemo(() => {
        if (!attendance?.hire_date) return null
        const parts = attendance.hire_date.split('-')
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
    }, [attendance])

    // Calculate navigable month range
    const minMonth = hireDate ? { year: hireDate.getFullYear(), month: hireDate.getMonth() } : { year: today.getFullYear(), month: today.getMonth() }
    const maxMonth = { year: today.getFullYear(), month: today.getMonth() }

    const canGoPrev = viewYear > minMonth.year || (viewYear === minMonth.year && viewMonth > minMonth.month)
    const canGoNext = viewYear < maxMonth.year || (viewYear === maxMonth.year && viewMonth < maxMonth.month)

    const goToPrev = () => {
        if (!canGoPrev) return
        if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11) }
        else setViewMonth(viewMonth - 1)
    }

    const goToNext = () => {
        if (!canGoNext) return
        if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0) }
        else setViewMonth(viewMonth + 1)
    }

    const goToToday = () => {
        setViewYear(today.getFullYear())
        setViewMonth(today.getMonth())
    }

    // Build calendar grid
    const { firstDay, daysInMonth } = getMonthDays(viewYear, viewMonth)

    const getCellInfo = (day) => {
        const dateStr = dateToStr(viewYear, viewMonth, day)
        const cellDate = new Date(viewYear, viewMonth, day)
        const record = recordMap[dateStr]
        const isToday = dateStr === todayStr
        const isFuture = cellDate > today
        const isBeforeJoining = hireDate && cellDate < hireDate
        const isSunday = cellDate.getDay() === 0

        return { dateStr, record, isToday, isFuture, isBeforeJoining, isSunday }
    }

    const getCellStyle = (info) => {
        const { record, isToday, isFuture, isBeforeJoining, isSunday } = info

        let bg = 'bg-white/[0.02]'
        let border = 'border-white/[0.04]'
        let textColor = 'text-slate-500'
        let statusDot = null

        if (isBeforeJoining) {
            bg = 'bg-transparent'
            border = 'border-white/[0.02]'
            textColor = 'text-slate-700'
        } else if (isFuture) {
            bg = 'bg-white/[0.01]'
            border = 'border-white/[0.03]'
            textColor = 'text-slate-600'
        } else if (record) {
            if (record.status === 'present') {
                bg = 'bg-emerald-500/10'
                border = 'border-emerald-500/25'
                textColor = 'text-emerald-300'
                statusDot = 'bg-emerald-400'
            } else if (record.status === 'late') {
                bg = 'bg-amber-500/10'
                border = 'border-amber-500/25'
                textColor = 'text-amber-300'
                statusDot = 'bg-amber-400'
            } else if (record.status === 'absent') {
                bg = 'bg-red-500/10'
                border = 'border-red-500/25'
                textColor = 'text-red-300'
                statusDot = 'bg-red-400'
            }
        } else if (!isFuture && !isBeforeJoining && isSunday) {
            bg = 'bg-white/[0.02]'
            textColor = 'text-slate-600'
        } else if (!isFuture && !isBeforeJoining) {
            // Past working day with no record = absent
            bg = 'bg-red-500/5'
            border = 'border-red-500/15'
            textColor = 'text-red-400/60'
            statusDot = 'bg-red-400/40'
        }

        if (isToday) {
            border = 'border-emerald-400/60 ring-1 ring-emerald-400/20'
        }

        return { bg, border, textColor, statusDot }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        )
    }

    const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth()

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">My Attendance</h1>
                    <p className="text-xs text-slate-500 mt-1">
                        {hireDate ? `Joined ${hireDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : 'View your attendance calendar'}
                        {attendance && ` · ${attendance.present_days_this_month}/${attendance.total_days_this_month} days this month · ${attendance.monthly_rate}%`}
                    </p>
                </div>
            </motion.div>

            {/* Today's Status + Mark Attendance */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#0a0a0c] border border-white/[0.08] rounded-2xl p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <ClipboardCheck size={18} className="text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white">Today — {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h2>
                            <p className="text-[10px] text-slate-500">Only today's attendance can be marked by you. Contact admin for past corrections.</p>
                        </div>
                    </div>
                </div>

                {attendance?.today?.marked ? (
                    <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-emerald-400" />
                            <span className="text-sm font-bold text-emerald-300">Attendance marked as <span className="uppercase">{attendance.today.status}</span></span>
                        </div>
                        {attendance.today.project_name && (
                            <p className="text-xs text-slate-400 ml-6">Project: <span className="text-white">{attendance.today.project_name}</span></p>
                        )}
                        {attendance.today.current_task && (
                            <p className="text-xs text-slate-400 ml-6">Task: <span className="text-white">{attendance.today.current_task}</span></p>
                        )}
                        <button
                            onClick={() => setShowForm(true)}
                            className="ml-6 mt-2 text-[10px] text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
                        >
                            Update today's record →
                        </button>
                    </div>
                ) : (
                    !showForm ? (
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:scale-[1.005] active:scale-95 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                        >
                            <ClipboardCheck size={16} /> Mark Today's Attendance
                        </button>
                    ) : null
                )}

                {/* Mark Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleMarkAttendance}
                            className="mt-4 space-y-4 border-t border-white/[0.06] pt-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full p-3 text-xs bg-[#121214] border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white"
                                    >
                                        <option value="present">✅ Present</option>
                                        <option value="late">⏰ Late</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Project Name</label>
                                    <input
                                        value={formData.project_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                                        placeholder="What project are you on?"
                                        className="w-full p-3 text-xs bg-[#121214] border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white placeholder:text-slate-600"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Task</label>
                                    <input
                                        value={formData.current_task}
                                        onChange={(e) => setFormData(prev => ({ ...prev, current_task: e.target.value }))}
                                        placeholder="What are you working on today?"
                                        className="w-full p-3 text-xs bg-[#121214] border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white placeholder:text-slate-600"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={marking}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest"
                                >
                                    {marking ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Send size={13} />}
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-3 bg-white/5 border border-white/10 text-slate-400 text-xs font-bold rounded-xl hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Calendar View */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#0a0a0c] border border-white/[0.08] rounded-2xl overflow-hidden max-w-3xl mx-auto"
            >
                {/* Calendar Header with month navigation */}
                <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                            <CalendarDays size={15} className="text-violet-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white">{MONTHS[viewMonth]} {viewYear}</h2>
                            <p className="text-[10px] text-slate-500 mt-0.5">Attendance calendar</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isCurrentMonth && (
                            <button
                                onClick={goToToday}
                                className="px-3 py-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all"
                            >
                                Today
                            </button>
                        )}
                        <button
                            onClick={goToPrev}
                            disabled={!canGoPrev}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            onClick={goToNext}
                            disabled={!canGoNext}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-white/[0.06]">
                    {DAYS.map(day => (
                        <div key={day} className={`py-3 text-center text-[10px] font-bold uppercase tracking-wider ${day === 'Sun' ? 'text-red-400/60' : 'text-slate-500'}`}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                    {/* Empty cells for days before month start */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-14 border-r border-b border-white/[0.03]" />
                    ))}

                    {/* Day cells */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1
                        const info = getCellInfo(day)
                        const style = getCellStyle(info)
                        const { record, isToday, isFuture, isBeforeJoining, isSunday } = info

                        return (
                            <motion.div
                                key={day}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.008 }}
                                className={`relative h-14 border-r border-b ${style.border} ${style.bg} transition-all duration-200 group ${isToday ? 'z-10' : ''}`}
                            >
                                {/* Day number */}
                                <div className={`absolute top-1 left-1.5 text-[11px] font-bold ${style.textColor} ${isToday ? '!text-emerald-400' : ''}`}>
                                    {day}
                                </div>

                                {/* Status icon — centered in the cell */}
                                {record && !isBeforeJoining && (
                                    <div className="absolute inset-0 flex items-center justify-center pt-2">
                                        {record.status === 'present' && <CheckCircle2 size={16} className="text-emerald-400" strokeWidth={2.5} />}
                                        {record.status === 'late' && <Timer size={16} className="text-amber-400" strokeWidth={2.5} />}
                                        {record.status === 'absent' && <XCircle size={16} className="text-red-400" strokeWidth={2.5} />}
                                    </div>
                                )}

                                {/* Unmarked past workday (not sunday, not future, not pre-joining, no record) */}
                                {!record && !isFuture && !isBeforeJoining && !isSunday && (
                                    <div className="absolute inset-0 flex items-center justify-center pt-2">
                                        <MinusCircle size={14} className="text-red-400/40" strokeWidth={2} />
                                    </div>
                                )}

                                {/* Today marker — pulsing ring */}
                                {isToday && (
                                    <div className="absolute top-0.5 right-1">
                                        <Sparkles size={10} className="text-emerald-400 animate-pulse" />
                                    </div>
                                )}

                                {/* Sunday label */}
                                {isSunday && !isBeforeJoining && !isFuture && (
                                    <div className="absolute inset-0 flex items-center justify-center pt-2">
                                        <span className="text-[8px] text-slate-600 font-black tracking-wider">OFF</span>
                                    </div>
                                )}

                                {/* Pre-joining indicator */}
                                {isBeforeJoining && (
                                    <div className="absolute inset-0 flex items-center justify-center pt-1 opacity-20">
                                        <MinusCircle size={12} className="text-slate-600" strokeWidth={1.5} />
                                    </div>
                                )}

                                {/* Hover tooltip */}
                                {record && (
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-3 py-2 bg-[#1a1a1e] border border-white/10 rounded-xl shadow-2xl whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                {record.status === 'present' && <CheckCircle2 size={10} className="text-emerald-400" />}
                                                {record.status === 'late' && <Timer size={10} className="text-amber-400" />}
                                                {record.status === 'absent' && <XCircle size={10} className="text-red-400" />}
                                                <p className="text-[10px] font-bold text-white capitalize">{record.status}</p>
                                            </div>
                                            {record.project_name && <p className="text-[8px] text-slate-400">📁 {record.project_name}</p>}
                                            {record.current_task && <p className="text-[8px] text-slate-400">📝 {record.current_task}</p>}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>

                {/* Legend */}
                <div className="px-6 py-3 border-t border-white/[0.06] flex flex-wrap items-center gap-5">
                    <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-emerald-400" strokeWidth={2.5} />
                        <span className="text-[10px] text-slate-400 font-medium">Present</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Timer size={12} className="text-amber-400" strokeWidth={2.5} />
                        <span className="text-[10px] text-slate-400 font-medium">Late</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <XCircle size={12} className="text-red-400" strokeWidth={2.5} />
                        <span className="text-[10px] text-slate-400 font-medium">Absent</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MinusCircle size={12} className="text-slate-600" strokeWidth={2} />
                        <span className="text-[10px] text-slate-400 font-medium">Not Marked</span>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-500">
                        <ShieldAlert size={11} className="text-slate-500" />
                        <span>Only today can be marked. Contact admin for corrections.</span>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
