import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle, XCircle, Clock, Filter, MessageSquare } from 'lucide-react'
import { leaveService } from '../services/leave'

// Simplified Glass Theme
const glassCardStyle = "bg-white/80 border border-slate-200 shadow-sm backdrop-blur-lg rounded-2xl";

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

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
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-1 w-fit"><CheckCircle size={12} /> Approved</span>
      case 'rejected':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-1 w-fit"><XCircle size={12} /> Rejected</span>
      default:
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 rounded-lg flex items-center gap-1 w-fit"><Clock size={12} /> Pending</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full h-full p-6 lg:p-10 text-slate-900 space-y-8 pb-24">
      {/* Header & Filter */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs font-semibold">
            <Calendar size={14} className="text-blue-600" />
            <span className="uppercase tracking-widest">Time-Off Control</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Leave Approvals & <span className="text-blue-600">Management</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">Review and approve employee time-off and PTO applications</p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-white/80 backdrop-blur-lg border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Requests List */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className={`${glassCardStyle} overflow-hidden shadow-sm`}>
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900">Submitted Leave Applications</h2>
          <p className="text-xs text-slate-500">{requests.length} records</p>
        </div>

        {requests.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {requests.map((r) => (
              <div key={r.id} className="p-6 space-y-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
                      {r.employee_name ? r.employee_name.split(' ').map(n => n[0]).join('') : '?'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{r.employee_name}</h3>
                      <p className="text-xs text-slate-500">{r.employee_email} · <span className="text-slate-600 font-medium">{r.department}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg">
                      {r.leave_type} Leave
                    </span>
                    {statusBadge(r.status)}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-2 text-xs">
                  <p className="text-slate-700 font-medium">📅 Date Range: <span className="text-slate-900 font-bold">{r.start_date}</span> to <span className="text-slate-900 font-bold">{r.end_date}</span></p>
                  {r.reason && <p className="text-slate-600 italic">"{r.reason}"</p>}
                </div>

                {/* Review Action Controls */}
                {r.status === 'pending' ? (
                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-2">
                    <input
                      type="text"
                      placeholder="Add reviewer note (optional)..."
                      value={noteMap[r.id] || ''}
                      onChange={(e) => setNoteMap({ ...noteMap, [r.id]: e.target.value })}
                      className="flex-1 p-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(r.id, 'approved')}
                        disabled={processingId === r.id}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(r.id, 'rejected')}
                        disabled={processingId === r.id}
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  r.reviewer_note && (
                    <p className="text-xs text-slate-600 italic">
                      💬 Reviewer Note: <span className="text-slate-800">{r.reviewer_note}</span>
                    </p>
                  )
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-16 text-center text-slate-500 text-xs">
            <Calendar size={32} className="mx-auto mb-3 text-slate-400 opacity-60" />
            No leave requests matching the selected filter
          </div>
        )}
      </motion.div>
    </div>
  )
}