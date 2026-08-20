import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Banknote, Plus, X, Search, ChevronDown,
    TrendingUp, Users, IndianRupee, CheckCircle2,
    AlertCircle, Loader2, Calendar, Building2,
    Filter, Edit, Trash2, Download, Layers
} from 'lucide-react'
import GlassCard, { CardHeader } from '../components/common/GlassCard'
import { salaryService, employeesService } from '../services/employees'
import { useApp } from '../context/AppContext'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logoSrc from '../assets/logo.png'

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1]

const floatingBlob = {
  animate: {
    y: [0, -30, 0],
    x: [0, 15, 0],
    scale: [1, 1.05, 1],
    rotate: [0, 5, -5, 0],
    transition: { duration: 18, repeat: Infinity, ease: "easeInOut" },
  },
}

const STATUS_STYLES = {
    processed: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/25',
    pending: 'text-amber-400 bg-amber-500/10 border border-amberald-500/25',
    failed: 'text-red-400 bg-red-500/10 border border-red-500/25',
}

const fadeInUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, delay: i * 0.06, ease: 'easeOut' }
    })
}

function StatCard({ label, value, sub, icon: Icon, color, index }) {
    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={index}
            className={`glass-card p-5 flex items-start gap-4 hover:-translate-y-0.5 transition-transform duration-200`}
        >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={20} className="text-white" />
            </div>
            <div>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
                <p className="text-xl font-bold text-white mt-0.5">{value}</p>
                {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
            </div>
        </motion.div>
    )
}

function downloadPayslip(record) {
    const generateAndSave = (imgElement) => {
        const doc = new jsPDF()

        // Header
        let textStartX = 14
        if (imgElement && (imgElement.width || imgElement.naturalWidth)) {
            const w = imgElement.width || imgElement.naturalWidth;
            const h = imgElement.height || imgElement.naturalHeight;
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imgElement, 0, 0);
            const logoDataUrl = canvas.toDataURL('image/png');

            let imgWidth = 35
            let imgHeight = (h * imgWidth) / w
            if (imgHeight > 20) {
                imgHeight = 20
                imgWidth = (w * imgHeight) / h
            }

            doc.addImage(logoDataUrl, 'PNG', 14, 12, imgWidth, imgHeight)
            textStartX = 14 + imgWidth + 6
        }

        doc.setFontSize(20)
        doc.setTextColor(40, 40, 40)
        doc.text("Hash AI LLC", textStartX, 22)

        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text("Payslip for the period of", textStartX, 29)
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text(`${record.month} ${record.year}`, textStartX, 35)

        // Horizontal line
        doc.setDrawColor(220, 220, 220)
        doc.line(14, 45, 196, 45)

        // Employee Info Section
        doc.setFontSize(11)
        doc.setTextColor(60, 60, 60)
        doc.text("Employee Details", 14, 55)

        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(`Name:`, 14, 63)
        doc.setTextColor(20, 20, 20)
        doc.text(record.employee_name || 'N/A', 35, 63)

        doc.setTextColor(100, 100, 100)
        doc.text(`Department:`, 14, 69)
        doc.setTextColor(20, 20, 20)
        doc.text(record.department || 'N/A', 35, 69)

        doc.setTextColor(100, 100, 100)
        doc.text(`Email:`, 14, 75)
        doc.setTextColor(20, 20, 20)
        doc.text(record.employee_email || 'N/A', 35, 75)

        doc.setTextColor(100, 100, 100)
        doc.text(`Status:`, 130, 63)
        doc.setTextColor(20, 20, 20)
        const status = record.status || 'Processed'
        doc.text(status.charAt(0).toUpperCase() + status.slice(1), 145, 63)

        doc.setTextColor(100, 100, 100)
        doc.text(`Date:`, 130, 69)
        doc.setTextColor(20, 20, 20)
        doc.text(record.payment_date ? new Date(record.payment_date).toLocaleDateString() : '-', 145, 69)

        const pf = record.pf_deduction || 0;
        const tds = record.tds_deduction || 0;
        const totalDeductions = pf + tds;
        const netPay = (record.amount || 0) - totalDeductions;

        // Table - Sleek Colorless Executive Styling
        autoTable(doc, {
            startY: 85,
            head: [['Description', 'Amount (INR)']],
            body: [
                ['Basic Salary', (record.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })],
                ['Allowances & Incentives', '0.00'],
                ['Provident Fund (PF) Deduction', pf.toLocaleString('en-IN', { minimumFractionDigits: 2 })],
                ['Tax Deducted at Source (TDS)', tds.toLocaleString('en-IN', { minimumFractionDigits: 2 })]
            ],
            foot: [['Net Payable Salary', `INR ${netPay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`]],
            theme: 'plain',
            headStyles: { fillColor: false, textColor: [30, 41, 59], fontStyle: 'bold', fontSize: 10, cellPadding: 8 },
            footStyles: { fillColor: false, textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 11, cellPadding: 8 },
            styles: { fontSize: 10, cellPadding: 7, textColor: [51, 65, 85], lineColor: [203, 213, 225], lineWidth: 0.4 },
            columnStyles: {
                0: { textColor: [51, 65, 85] },
                1: { halign: 'right', textColor: [15, 23, 42], fontStyle: 'bold' }
            }
        })

        const finalY = doc.lastAutoTable.finalY || 150

        // Footer
        doc.setFontSize(9)
        doc.setTextColor(150, 150, 150)
        doc.text("This is an official computer-generated document of Hash AI LLC. No signature is required.", 14, finalY + 20)

        // Save PDF
        const safeName = (record.employee_name || 'Employee').replace(/\s+/g, '_')
        const fileName = `Payslip_${safeName}_${record.month}_${record.year}.pdf`
        doc.save(fileName)
    }

    let called = false
    const triggerGenerate = (imgElement) => {
        if (!called) {
            called = true
            generateAndSave(imgElement)
        }
    }

    const img = new Image()
    img.onload = () => triggerGenerate(img)
    img.onerror = () => triggerGenerate(null)
    img.src = logoSrc
    if (img.complete && img.naturalWidth > 0) {
        triggerGenerate(img)
    }
}

function ProcessPayrollModal({ employees, onClose, onSuccess }) {
    const [form, setForm] = useState({
        employee_id: '',
        month: MONTHS[new Date().getMonth()],
        year: CURRENT_YEAR,
        amount: '',
        pf_deduction: '',
        tds_deduction: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')

    const selectedEmployee = employees.find(e => e.id === Number(form.employee_id))

    const filtered = employees.filter(e => {
        const q = search.toLowerCase()
        return (
            e.first_name?.toLowerCase().includes(q) ||
            e.last_name?.toLowerCase().includes(q) ||
            e.department?.toLowerCase().includes(q)
        )
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.employee_id) { setError('Please select an employee.'); return }
        setError('')
        setLoading(true)
        try {
            await salaryService.processPayroll({
                employee_id: Number(form.employee_id),
                month: form.month,
                year: Number(form.year),
                amount: form.amount ? Number(form.amount) : undefined,
                pf_deduction: form.pf_deduction ? Number(form.pf_deduction) : undefined,
                tds_deduction: form.tds_deduction ? Number(form.tds_deduction) : undefined
            })
            onSuccess()
        } catch (err) {
            const msg = err?.response?.data?.detail || 'Failed to process payroll.'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="glass-card w-full max-w-lg overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
                            <Banknote size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white">Process Payroll</h2>
                            <p className="text-xs text-slate-400">Generate a salary payment record</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                    {/* Employee selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Employee</label>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search by name or department..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 pl-9 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/40 transition-colors"
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar rounded-xl border border-white/[0.06] bg-[#07070a] divide-y divide-white/[0.04]">
                            {filtered.length === 0 ? (
                                <p className="text-center text-slate-500 text-sm py-4">No employees found</p>
                            ) : filtered.map(emp => (
                                <button
                                    key={emp.id}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, employee_id: emp.id, amount: emp.salary || '' }))}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03] ${form.employee_id === emp.id ? 'bg-orange-500/10 border-l-2 border-orange-500' : ''}`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                        {emp.first_name?.[0]}{emp.last_name?.[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{emp.first_name} {emp.last_name}</p>
                                        <p className="text-xs text-slate-400">{emp.department} · {emp.role}</p>
                                    </div>
                                    <div className="ml-auto text-sm font-semibold text-emerald-400">
                                        ₹{(emp.salary || 0).toLocaleString()}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Month + Year */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Month</label>
                            <div className="relative">
                                <select
                                    value={form.month}
                                    onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                                    className="w-full appearance-none bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/40 transition-colors pr-8"
                                >
                                    {MONTHS.map(m => <option key={m} value={m} className="bg-[#09090b]">{m}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Year</label>
                            <div className="relative">
                                <select
                                    value={form.year}
                                    onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                                    className="w-full appearance-none bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/40 transition-colors pr-8"
                                >
                                    {YEARS.map(y => <option key={y} value={y} className="bg-[#09090b]">{y}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                            Amount <span className="text-slate-600 font-normal normal-case">(leave blank to use base salary)</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                            <input
                                type="number"
                                placeholder={selectedEmployee ? (selectedEmployee.salary || 0).toLocaleString() : '0'}
                                value={form.amount}
                                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 pl-8 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/40 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Deductions */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">PF Deduction</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={form.pf_deduction}
                                    onChange={e => setForm(f => ({ ...f, pf_deduction: e.target.value }))}
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 pl-8 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/40 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">TDS Deduction</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={form.tds_deduction}
                                    onChange={e => setForm(f => ({ ...f, tds_deduction: e.target.value }))}
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 pl-8 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/40 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
                        >
                            <AlertCircle size={15} />
                            {error}
                        </motion.div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white border border-white/[0.08] hover:bg-white/[0.03] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !form.employee_id}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
                        >
                            {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                            {loading ? 'Processing…' : 'Process Payroll'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    )
}

function EditSalaryModal({ record, onClose, onSuccess }) {
    const [form, setForm] = useState({
        amount: record.amount || 0,
        pf_deduction: record.pf_deduction || 0,
        tds_deduction: record.tds_deduction || 0,
        status: record.status || 'processed',
        month: record.month,
        year: record.year
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await salaryService.updateRecord(record.id, {
                amount: Number(form.amount),
                pf_deduction: Number(form.pf_deduction),
                tds_deduction: Number(form.tds_deduction),
                status: form.status,
                month: form.month,
                year: Number(form.year)
            })
            onSuccess()
        } catch (err) {
            setError(err?.response?.data?.detail || 'Failed to update record')
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card w-full max-w-sm overflow-hidden"
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                    <h2 className="text-base font-bold text-white">Edit Record</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400">Amount</label>
                        <input
                            type="number"
                            value={form.amount}
                            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/40"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400">PF</label>
                            <input
                                type="number"
                                value={form.pf_deduction}
                                onChange={e => setForm(f => ({ ...f, pf_deduction: e.target.value }))}
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/40"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400">TDS</label>
                            <input
                                type="number"
                                value={form.tds_deduction}
                                onChange={e => setForm(f => ({ ...f, tds_deduction: e.target.value }))}
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/40"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400">Status</label>
                        <select
                            value={form.status}
                            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/40"
                        >
                            <option value="processed" className="bg-[#09090b]">Processed</option>
                            <option value="pending" className="bg-[#09090b]">Pending</option>
                            <option value="failed" className="bg-[#09090b]">Failed</option>
                        </select>
                    </div>
                    {error && <p className="text-xs text-red-400">{error}</p>}
                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2 text-sm text-slate-400 border border-white/10 rounded-xl">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 text-sm text-white bg-orange-500 hover:bg-orange-600 rounded-xl font-medium flex items-center justify-center gap-2">
                            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    )
}

function BulkProcessModal({ onClose, onSuccess }) {
    const [month, setMonth] = useState(MONTHS[new Date().getMonth()])
    const [year, setYear] = useState(CURRENT_YEAR)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await salaryService.processBulkPayroll({ month, year: Number(year) })
            onSuccess(res)
        } catch (err) {
            setError('Failed to bulk process payroll')
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card w-full max-w-sm overflow-hidden"
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                    <h2 className="text-base font-bold text-white">Bulk Process</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
                        <X size={18} />
                    </button>
                </div>
                <div className="px-6 pt-3">
                    <p className="text-xs text-slate-400">This will generate a salary record for all active employees for the selected period.</p>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <select
                            value={month}
                            onChange={e => setMonth(e.target.value)}
                            className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                        >
                            {MONTHS.map(m => <option key={m} value={m} className="bg-[#09090b]">{m}</option>)}
                        </select>
                        <select
                            value={year}
                            onChange={e => setYear(e.target.value)}
                            className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                        >
                            {YEARS.map(y => <option key={y} value={y} className="bg-[#09090b]">{y}</option>)}
                        </select>
                    </div>
                    {error && <p className="text-xs text-red-400">{error}</p>}
                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2 text-sm text-slate-400 border border-white/10 rounded-xl">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-xl font-medium flex items-center justify-center gap-2">
                            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Run Bulk'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    )
}

export default function SalaryPage() {
    const { addNotification } = useApp()
    const [records, setRecords] = useState([])
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showBulkModal, setShowBulkModal] = useState(false)
    const [editRecord, setEditRecord] = useState(null)

    const [searchQuery, setSearchQuery] = useState('')
    const [filterMonth, setFilterMonth] = useState('')
    const [filterYear, setFilterYear] = useState('')

    const fetchRecords = async () => {
        setLoading(true)
        try {
            const params = {}
            if (filterMonth) params.month = filterMonth
            if (filterYear) params.year = filterYear
            const data = await salaryService.getRecords(params)
            setRecords(data)
        } catch {
            addNotification({ type: 'error', message: 'Failed to load salary records.' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRecords()
        employeesService.list().then(setEmployees).catch(() => { })
    }, [filterMonth, filterYear])

    const handlePayrollSuccess = () => {
        setShowModal(false)
        addNotification({ type: 'success', message: 'Payroll processed successfully!' })
        fetchRecords()
    }

    const handleEditSuccess = () => {
        setEditRecord(null)
        addNotification({ type: 'success', message: 'Record updated successfully!' })
        fetchRecords()
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this record?')) return
        try {
            await salaryService.deleteRecord(id)
            addNotification({ type: 'success', message: 'Record deleted.' })
            fetchRecords()
        } catch (err) {
            addNotification({ type: 'error', message: 'Failed to delete record.' })
        }
    }

    const handleBulkSuccess = (res) => {
        setShowBulkModal(false)
        addNotification({ type: 'success', message: `Bulk processed: ${res.processed} created, ${res.skipped} skipped.` })
        fetchRecords()
    }

    const filtered = useMemo(() => {
        return records.filter(r => {
            const q = searchQuery.toLowerCase()
            return !q || r.employee_name?.toLowerCase().includes(q) || r.department?.toLowerCase().includes(q)
        })
    }, [records, searchQuery])

    // Stats
    const totalPaid = records.reduce((s, r) => s + (r.amount || 0), 0)
    const uniqueEmployees = new Set(records.map(r => r.employee_id)).size
    const thisMonth = MONTHS[new Date().getMonth()]
    const thisMonthTotal = records
        .filter(r => r.month === thisMonth && r.year === CURRENT_YEAR)
        .reduce((s, r) => s + (r.amount || 0), 0)
    const lastMonth = MONTHS[(new Date().getMonth() + 11) % 12]
    const lastMonthTotal = records
        .filter(r => r.month === lastMonth)
        .reduce((s, r) => s + (r.amount || 0), 0)
    const monthChange = lastMonthTotal > 0
        ? (((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1)
        : null

    const stats = [
        { label: 'Total Paid Out', value: `₹${(totalPaid).toLocaleString()}`, sub: 'Filtered', icon: IndianRupee, color: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
        { label: 'This Month (Filtered)', value: `₹${thisMonthTotal.toLocaleString()}`, sub: monthChange !== null ? `${monthChange >= 0 ? '+' : ''}${monthChange}% vs last month` : 'No prior data', icon: TrendingUp, color: 'bg-gradient-to-br from-orange-500 to-pink-600' },
        { label: 'Employees Paid', value: uniqueEmployees, sub: `Across ${records.length} transactions`, icon: Users, color: 'bg-gradient-to-br from-violet-500 to-indigo-600' },
        { label: 'Records', value: records.length, sub: 'Total payroll entries', icon: Banknote, color: 'bg-gradient-to-br from-sky-500 to-blue-600' },
    ]

    return (
        <div className="relative min-h-screen bg-[#050505] text-white p-6 md:p-8 font-sans selection:bg-orange-500/30 overflow-y-auto custom-scrollbar overflow-x-hidden">
            {/* Background Neon Blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#7c3aed", "#ea580c", "#7c3aed"] }} transition={{ ...floatingBlob.animate.transition, backgroundColor: { duration: 20, repeat: Infinity, ease: "linear" } }} className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] rounded-full blur-[140px] opacity-20 mix-blend-screen" />
                <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#db2777", "#7c3aed", "#db2777"] }} transition={{ ...floatingBlob.animate.transition, delay: 2, backgroundColor: { duration: 25, repeat: Infinity, ease: "linear" } }} className="absolute top-[30%] -right-[10%] w-[700px] h-[700px] rounded-full blur-[130px] opacity-20 mix-blend-screen" />
            </div>

            <div className="relative z-10 w-full space-y-6">
                {/* Page Header */}
            <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
                <div>
                    <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
                        Salary & Payroll
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Track and process employee salary payments</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowBulkModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.05] border border-white/10 hover:bg-white/10 transition-colors text-white shrink-0"
                    >
                        <Layers size={16} />
                        Bulk Process
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 transition-opacity text-white shadow-lg shadow-pink-500/20 shrink-0"
                    >
                        <Plus size={16} />
                        Process Payroll
                    </button>
                </div>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => <StatCard key={stat.label} {...stat} index={i} />)}
            </div>

            {/* Salary Records Table */}
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={4}>
                <GlassCard padding="sm">
                    {/* Table Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 pb-0">
                        <div className="relative flex-1 min-w-0 max-w-xs">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search employee or dept…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/30 transition-colors"
                            />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Filter size={14} className="text-slate-500" />
                            <div className="relative">
                                <select
                                    value={filterMonth}
                                    onChange={e => setFilterMonth(e.target.value)}
                                    className="appearance-none bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-orange-500/30 transition-colors pr-7"
                                >
                                    <option value="" className="bg-[#09090b]">All Months</option>
                                    {MONTHS.map(m => <option key={m} value={m} className="bg-[#09090b]">{m}</option>)}
                                </select>
                                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select
                                    value={filterYear}
                                    onChange={e => setFilterYear(e.target.value)}
                                    className="appearance-none bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-orange-500/30 transition-colors pr-7"
                                >
                                    <option value="" className="bg-[#09090b]">All Years</option>
                                    {YEARS.map(y => <option key={y} value={y} className="bg-[#09090b]">{y}</option>)}
                                </select>
                                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto mt-4">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    {['Employee', 'Department', 'Period', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-16">
                                            <Loader2 className="animate-spin mx-auto text-orange-400" size={28} />
                                            <p className="text-slate-500 text-sm mt-3">Loading salary records…</p>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-16">
                                            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                                                <Banknote size={24} className="text-slate-600" />
                                            </div>
                                            <p className="text-white font-semibold">No salary records found</p>
                                            <p className="text-slate-500 text-xs mt-1">
                                                {records.length === 0
                                                    ? 'Click "Process Payroll" to create the first record.'
                                                    : 'Try adjusting your filters.'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    <AnimatePresence>
                                        {filtered.map((record, i) => (
                                            <motion.tr
                                                key={record.id}
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.03 }}
                                                className="hover:bg-white/[0.02] transition-colors group"
                                            >
                                                {/* Employee */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500/30 to-pink-500/30 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                                            {record.employee_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-white text-sm">{record.employee_name}</p>
                                                            <p className="text-xs text-slate-500">{record.employee_email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Department */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <Building2 size={13} />
                                                        <span>{record.department}</span>
                                                    </div>
                                                </td>

                                                {/* Period */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1.5 text-slate-300">
                                                        <Calendar size={13} className="text-slate-500" />
                                                        <span className="font-medium">{record.month} {record.year}</span>
                                                    </div>
                                                </td>

                                                {/* Amount */}
                                                <td className="px-5 py-4">
                                                    <div className="text-emerald-400 font-bold text-base">
                                                        ₹{((record.amount || 0) - (record.pf_deduction || 0) - (record.tds_deduction || 0)).toLocaleString()}
                                                    </div>
                                                    {((record.pf_deduction || 0) > 0 || (record.tds_deduction || 0) > 0) && (
                                                        <div className="text-[10px] text-slate-500 mt-0.5">
                                                            Base: ₹{(record.amount || 0).toLocaleString()} |
                                                            Ded: ₹{((record.pf_deduction || 0) + (record.tds_deduction || 0)).toLocaleString()}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[record.status] || STATUS_STYLES.processed}`}>
                                                        <CheckCircle2 size={11} />
                                                        {record.status}
                                                    </span>
                                                </td>

                                                {/* Payment Date */}
                                                <td className="px-5 py-4 text-slate-400 text-xs">
                                                    {record.payment_date
                                                        ? new Date(record.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                        : '—'}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => downloadPayslip(record)} className="p-1.5 text-slate-400 hover:text-white bg-white/5 rounded-lg" title="Download Payslip">
                                                            <Download size={14} />
                                                        </button>
                                                        <button onClick={() => setEditRecord(record)} className="p-1.5 text-slate-400 hover:text-white bg-white/5 rounded-lg" title="Edit">
                                                            <Edit size={14} />
                                                        </button>
                                                        <button onClick={() => handleDelete(record.id)} className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 rounded-lg" title="Delete">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    {filtered.length > 0 && (
                        <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between">
                            <p className="text-xs text-slate-500">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>
                            <p className="text-xs font-semibold text-emerald-400">
                                Total: ₹{filtered.reduce((s, r) => s + (r.amount || 0), 0).toLocaleString()}
                            </p>
                        </div>
                    )}
                </GlassCard>
            </motion.div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showModal && (
                    <ProcessPayrollModal
                        employees={employees}
                        onClose={() => setShowModal(false)}
                        onSuccess={handlePayrollSuccess}
                    />
                )}
                {editRecord && (
                    <EditSalaryModal
                        record={editRecord}
                        onClose={() => setEditRecord(null)}
                        onSuccess={handleEditSuccess}
                    />
                )}
                {showBulkModal && (
                    <BulkProcessModal
                        onClose={() => setShowBulkModal(false)}
                        onSuccess={handleBulkSuccess}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
