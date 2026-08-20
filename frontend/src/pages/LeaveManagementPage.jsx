import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle, XCircle, Clock, Filter, MessageSquare } from 'lucide-react'
import { leaveService } from '../services/leave'

const floatingBlob = {
  animate: {
    y: [0, -30, 0],
    x: [0, 15, 0],
    scale: [1, 1.05, 1],
    rotate: [0, 5, -5, 0],
    transition: { duration: 18, repeat: Infinity, ease: "easeInOut" },
  },
}

export default function LeaveManagementPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [processingId, setProcessingId] = useState(null)
  const [noteMap, setNoteMap] = useState({})

  useEffect(() => {
    loadRequests()
  }, [statusFilter])

  const loadRequests = async () => {
    try {
      const sf = statusFilter === 'all' ? null : statusFilter
      const data = await leaveService.getAllLeaveRequests(sf)
      setRequests(data || [])
    } catch (e) {
      console.error('Failed to load leave requests:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (leaveId, status) => {
    setProcessingId(leaveId)
    try {
      const note = noteMap[leaveId] || ''
      await leaveService.updateLeaveStatus(leaveId, status, note)
      await loadRequests()
    } catch (e) {
      console.error('Failed to update leave status:', e)
    } finally {
      setProcessingId(null)
    }
  }

  const statusBadge = (st) => {
    switch (st) {
      case 'approved':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg flex items-center gap-1 w-fit"><CheckCircle size={12} /> Approved</span>
      case 'rejected':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg flex items-center gap-1 w-fit"><XCircle size={12} /> Rejected</span>
      default:
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 rounded-lg flex items-center gap-1 w-fit"><Clock size={12} /> Pending</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-white p-6 md:p-8 font-sans selection:bg-orange-500/30 overflow-y-auto custom-scrollbar overflow-x-hidden">
      {/* Background Neon Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#7c3aed", "#ea580c", "#7c3aed"] }} transition={{ ...floatingBlob.animate.transition, backgroundColor: { duration: 20, repeat: Infinity, ease: "linear" } }} className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] rounded-full blur-[140px] opacity-20 mix-blend-screen" />
        <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#db2777", "#7c3aed", "#db2777"] }} transition={{ ...floatingBlob.animate.transition, delay: 2, backgroundColor: { duration: 25, repeat: Infinity, ease: "linear" } }} className="absolute top-[30%] -right-[10%] w-[700px] h-[700px] rounded-full blur-[130px] opacity-20 mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full space-y-6">
      {/* Header & Filter */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Leave Approvals & Management</h1>
          <p className="text-xs text-slate-500 mt-1">Review and approve employee time-off and PTO applications</p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-[#121214] border border-white/10 rounded-xl p-1 w-fit">
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-violet-500/20 border border-violet-500/30 text-violet-300'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Requests List */}
      <div className="bg-[#0a0a0c] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold text-white">Submitted Leave Applications</h2>
          <p className="text-[10px] text-slate-500">{requests.length} records</p>
        </div>

        {requests.length > 0 ? (
          <div className="divide-y divide-white/[0.04]">
            {requests.map((r) => (
              <div key={r.id} className="p-6 space-y-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-300 font-bold text-xs shrink-0">
                      {r.employee_name ? r.employee_name.split(' ').map(n => n[0]).join('') : '?'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{r.employee_name}</h3>
                      <p className="text-[11px] text-slate-400">{r.employee_email} · <span className="text-slate-500">{r.department}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                      {r.leave_type} Leave
                    </span>
                    {statusBadge(r.status)}
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 space-y-2 text-xs">
                  <p className="text-slate-300 font-medium">📅 Date Range: <span className="text-white font-bold">{r.start_date}</span> to <span className="text-white font-bold">{r.end_date}</span></p>
                  {r.reason && <p className="text-slate-400 italic">"{r.reason}"</p>}
                </div>

                {/* Review Action Controls */}
                {r.status === 'pending' ? (
                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-2">
                    <input
                      type="text"
                      placeholder="Add reviewer note (optional)..."
                      value={noteMap[r.id] || ''}
                      onChange={(e) => setNoteMap({ ...noteMap, [r.id]: e.target.value })}
                      className="flex-1 p-2.5 text-xs bg-[#121214] border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(r.id, 'approved')}
                        disabled={processingId === r.id}
                        className="px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl hover:bg-emerald-500/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(r.id, 'rejected')}
                        disabled={processingId === r.id}
                        className="px-4 py-2.5 bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold rounded-xl hover:bg-red-500/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  r.reviewer_note && (
                    <p className="text-xs text-slate-400 italic">
                      💬 Reviewer Note: <span className="text-slate-300">{r.reviewer_note}</span>
                    </p>
                  )
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-slate-500 text-xs">
            <Calendar size={32} className="mx-auto mb-3 text-slate-600" />
            No leave requests matching the selected filter
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
