import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Plus, Clock, CheckCircle, XCircle, Send, AlertCircle, Sparkles } from 'lucide-react'
import { leaveService } from '../../services/leave'

export default function EmployeeLeavePage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [formData, setFormData] = useState({
    leave_type: 'vacation',
    start_date: '',
    end_date: '',
    reason: ''
  })

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const data = await leaveService.getMyLeaveRequests()
      setRequests(data || [])
    } catch (e) {
      console.error('Failed to load leave requests:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await leaveService.submitLeave(formData)
      setSuccessMsg('Leave request submitted successfully!')
      setShowForm(false)
      setFormData({ leave_type: 'vacation', start_date: '', end_date: '', reason: '' })
      await loadRequests()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      console.error('Submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length
  const approvedCount = requests.filter(r => r.status === 'approved').length
  const remainingDays = Math.max(0, 15 - approvedCount * 2)

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
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Page Title & Action */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Leave & PTO Portal</h1>
          <p className="text-xs text-slate-500 mt-1">Submit time-off requests and track approval statuses</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          <Plus size={14} /> Request Leave
        </button>
      </motion.div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-xs text-emerald-300 font-bold flex items-center gap-2">
          <CheckCircle size={14} /> {successMsg}
        </motion.div>
      )}

      {/* Leave Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#0a0a0c] border border-white/[0.08] rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Calendar size={16} className="text-emerald-400" />
            </div>
            <p className="text-xs font-bold text-slate-400">Available PTO Days</p>
          </div>
          <p className="text-2xl font-black text-white">{remainingDays} <span className="text-xs text-slate-500 font-normal">/ 15 days</span></p>
        </div>

        <div className="bg-[#0a0a0c] border border-white/[0.08] rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Clock size={16} className="text-yellow-400" />
            </div>
            <p className="text-xs font-bold text-slate-400">Pending Approval</p>
          </div>
          <p className="text-2xl font-black text-white">{pendingCount} <span className="text-xs text-slate-500 font-normal">requests</span></p>
        </div>

        <div className="bg-[#0a0a0c] border border-white/[0.08] rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <CheckCircle size={16} className="text-blue-400" />
            </div>
            <p className="text-xs font-bold text-slate-400">Approved Leaves</p>
          </div>
          <p className="text-2xl font-black text-white">{approvedCount} <span className="text-xs text-slate-500 font-normal">requests</span></p>
        </div>
      </div>

      {/* Submission Form Modal/Panel */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleSubmit}
          className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl"
        >
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-400" /> New Leave Application
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Leave Type</label>
              <select
                value={formData.leave_type}
                onChange={(e) => setFormData(prev => ({ ...prev, leave_type: e.target.value }))}
                className="w-full p-3 text-xs bg-[#121214] border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white"
              >
                <option value="vacation">🌴 Vacation / Annual</option>
                <option value="sick">🤒 Sick Leave</option>
                <option value="casual">☕ Casual Leave</option>
                <option value="remote">💻 Remote Work Day</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full p-3 text-xs bg-[#121214] border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">End Date</label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full p-3 text-xs bg-[#121214] border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reason / Description</label>
            <textarea
              rows={2}
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Brief explanation for leave request..."
              className="w-full p-3 text-xs bg-[#121214] border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white placeholder:text-slate-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 bg-white/5 border border-white/10 text-slate-400 text-xs font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 uppercase tracking-wider"
            >
              {submitting ? <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Send size={13} />}
              Submit Application
            </button>
          </div>
        </motion.form>
      )}

      {/* History Table */}
      <div className="bg-[#0a0a0c] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold text-white">Leave Application History</h2>
          <p className="text-[10px] text-slate-500">{requests.length} records</p>
        </div>

        {requests.length > 0 ? (
          <div className="divide-y divide-white/[0.04]">
            {requests.map((r) => (
              <div key={r.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white uppercase tracking-wide">{r.leave_type} Leave</span>
                    {statusBadge(r.status)}
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    📅 {r.start_date} → {r.end_date}
                  </p>
                  {r.reason && <p className="text-xs text-slate-500 italic mt-1">"{r.reason}"</p>}
                  {r.reviewer_note && (
                    <p className="text-xs text-emerald-400/80 bg-emerald-500/10 px-3 py-1.5 rounded-lg mt-2 w-fit">
                      💬 Reviewer Note: {r.reviewer_note}
                    </p>
                  )}
                </div>
                <div className="text-right text-[10px] text-slate-600">
                  Requested on {new Date(r.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-slate-500 text-xs">
            <Calendar size={32} className="mx-auto mb-3 text-slate-600" />
            No leave requests submitted yet
          </div>
        )}
      </div>
    </div>
  )
}
