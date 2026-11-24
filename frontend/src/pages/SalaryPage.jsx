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
import { useBranding } from '../context/BrandingContext'

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1]

// Simplified Glass Theme
const glassCardStyle = "bg-white/80 border border-slate-200 shadow-sm backdrop-blur-lg rounded-2xl";

const STATUS_STYLES = {
    processed: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    pending: 'text-amber-700 bg-amber-50 border border-amber-200',
    failed: 'text-red-700 bg-red-50 border border-red-200',
}

const fadeInUp = {
    hidden: { opacity: 0, y: 15 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, delay: i * 0.06, ease: 'easeOut' }
    })
}

function StatCard({ label, value, sub, icon: Icon, color, index }) {
    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={index}
            className={`${glassCardStyle} p-5 flex items-start gap-4 hover:shadow-md transition-all duration-300`}
        >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={20} className="text-white" />
            </div>
            <div>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
                {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
            </div>
        </motion.div>
    )
}

function downloadPayslip(record, { logoSrc, companyName, contactLine }) {
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
        doc.text(companyName, textStartX, 22)

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

        // Table
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
        doc.text(`This is an official computer-generated document of ${companyName}. No signature is required.`, 14, finalY + 20)
        if (contactLine) doc.text(doc.splitTextToSize(contactLine, 182), 14, finalY + 25)

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
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl overflow-hidden shadow-xl"
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                            <Banknote size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Process Payroll</h2>
                            <p className="text-xs text-slate-500">Generate a salary payment record</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</label>
                        <div className="relative">
                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search by name or department..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 pl-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 divide-y divide-slate-100 mt-2">
                            {filtered.length === 0 ? (
                                <p className="text-center text-slate-500 text-sm py-4">No employees found</p>
                            ) : filtered.map(emp => (
                                <button
                                    key={emp.id}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, employee_id: emp.id, amount: emp.salary || '' }))}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-blue-50/50 ${form.employee_id === emp.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                                        {emp.first_name?.[0]}{emp.last_name?.[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{emp.first_name} {emp.last_name}</p>
                                        <p className="text-xs text-slate-500">{emp.department} · {emp.role}</p>
                                    </div>
                                    <div className="ml-auto text-sm font-semibold text-emerald-600">
                                        ₹{(emp.salary || 0).toLocaleString()}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Month</label>
                            <div className="relative">
                                <select
                                    value={form.month}
                                    onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                                    className="w-full appearance-none bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 pr-8"
                                >
                                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Year</label>
                            <div className="relative">
                                <select
                                    value={form.year}
                                    onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                                    className="w-full appearance-none bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 pr-8"
                                >
                                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Amount <span className="text-slate-400 font-normal normal-case">(leave blank for base salary)</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                            <input
                                type="number"
                                placeholder={selectedEmployee ? (selectedEmployee.salary || 0).toLocaleString() : '0'}
                                value={form.amount}
                                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 pl-8 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">PF Deduction</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={form.pf_deduction}
                                    onChange={e => setForm(f => ({ ...f, pf_deduction: e.target.value }))}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-4 pl-8 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">TDS Deduction</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={form.tds_deduction}
                                    onChange={e => setForm(f => ({ ...f, tds_deduction: e.target.value }))}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-4 pl-8 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                            <AlertCircle size={15} />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !form.employee_id}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl overflow-hidden shadow-xl"
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900">Edit Record</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</label>
                        <input
                            type="number"
                            value={form.amount}
                            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">PF</label>
                            <input
                                type="number"
                                value={form.pf_deduction}
                                onChange={e => setForm(f => ({ ...f, pf_deduction: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">TDS</label>
                            <input
                                type="number"
                                value={form.tds_deduction}
                                onChange={e => setForm(f => ({ ...f, tds_deduction: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                        <select
                            value={form.status}
                            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                        >
                            <option value="processed">Processed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                    {error && <p className="text-xs text-red-600">{error}</p>}
                    <div className="pt-2 flex gap-3 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="flex-1 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl overflow-hidden shadow-xl"
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900">Bulk Process</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="px-6 pt-3">
                    <p className="text-xs text-slate-600">This will generate a salary record for all active employees for the selected period.</p>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <select
                            value={month}
                            onChange={e => setMonth(e.target.value)}
                            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none"
                        >
                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select
                            value={year}
                            onChange={e => setYear(e.target.value)}
                            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none"
                        >
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    {error && <p className="text-xs text-red-600">{error}</p>}
                    <div className="pt-2 flex gap-3 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="flex-1 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm">
                            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Run Bulk'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    )
}

export default function SalaryPage() {
    const { documentLogoUrl, companyName, contactLine } = useBranding()
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
        { label: 'Total Paid Out', value: `₹${(totalPaid).toLocaleString()}`, sub: 'Filtered', icon: IndianRupee, color: 'bg-emerald-600' },
        { label: 'This Month (Filtered)', value: `₹${thisMonthTotal.toLocaleString()}`, sub: monthChange !== null ? `${monthChange >= 0 ? '+' : ''}${monthChange}% vs last month` : 'No prior data', icon: TrendingUp, color: 'bg-blue-600' },
        { label: 'Employees Paid', value: uniqueEmployees, sub: `Across ${records.length} transactions`, icon: Users, color: 'bg-violet-600' },
        { label: 'Records', value: records.length, sub: 'Total payroll entries', icon: Banknote, color: 'bg-amber-600' },
    ]

    return (
        <div className="w-full h-full p-6 lg:p-10 text-slate-900 space-y-8 pb-24">
            {/* Page Header */}
            <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
            >
                <div>
                    <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs font-semibold">
                        <Banknote size={14} className="text-blue-600" />
                        <span className="uppercase tracking-widest">Finance Operations</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Salary & <span className="text-blue-600">Payroll</span>
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">Track and process employee salary payments</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowBulkModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Layers size={16} />
                        Bulk Process
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus size={16} />
                        Process Payroll
                    </button>
                </div>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => <StatCard key={stat.label} {...stat} index={i} />)}
            </div>

            {/* Salary Records Table */}
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={4}>
                <div className={glassCardStyle}>
                    {/* Table Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 pb-4 border-b border-slate-100">
                        <div className="relative flex-1 w-full sm:max-w-xs">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search employee or dept…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-white/80 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 shadow-sm"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            <Filter size={16} className="text-slate-400" />
                            <div className="relative">
                                <select
                                    value={filterMonth}
                                    onChange={e => setFilterMonth(e.target.value)}
                                    className="appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-400 pr-8 shadow-sm cursor-pointer"
                                >
                                    <option value="">All Months</option>
                                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select
                                    value={filterYear}
                                    onChange={e => setFilterYear(e.target.value)}
                                    className="appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-400 pr-8 shadow-sm cursor-pointer"
                                >
                                    <option value="">All Years</option>
                                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-slate-700">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    {['Employee', 'Department', 'Period', 'Amount', 'Status', 'Date', 'Actions'].map((h, idx) => (
                                        <th key={h} className={`py-3.5 px-6 whitespace-nowrap ${idx === 6 ? 'text-right pr-6' : 'text-left'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-16">
                                            <Loader2 className="animate-spin mx-auto text-blue-600" size={28} />
                                            <p className="text-slate-500 text-sm mt-3">Loading salary records…</p>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-16">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                                                <Banknote size={24} />
                                            </div>
                                            <p className="text-slate-900 font-semibold">No salary records found</p>
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
                                                className="hover:bg-slate-50/50 transition-colors group"
                                            >
                                                {/* Employee */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 border border-blue-200">
                                                            {record.employee_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 text-sm">{record.employee_name}</p>
                                                            <p className="text-xs text-slate-500">{record.employee_email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Department */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                                                        <Building2 size={14} className="text-slate-400" />
                                                        <span>{record.department}</span>
                                                    </div>
                                                </td>

                                                {/* Period */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-slate-700">
                                                        <Calendar size={14} className="text-slate-400" />
                                                        <span className="font-medium">{record.month} {record.year}</span>
                                                    </div>
                                                </td>

                                                {/* Amount */}
                                                <td className="px-6 py-4">
                                                    <div className="text-emerald-600 font-bold text-base">
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
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[record.status] || STATUS_STYLES.processed}`}>
                                                        <CheckCircle2 size={12} />
                                                        {record.status}
                                                    </span>
                                                </td>

                                                {/* Payment Date */}
                                                <td className="px-6 py-4 text-slate-500 text-xs">
                                                    {record.payment_date
                                                        ? new Date(record.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                        : '—'}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right pr-6">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => downloadPayslip(record, { logoSrc: documentLogoUrl, companyName, contactLine })} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download Payslip" aria-label="Download payslip">
                                                            <Download size={16} />
                                                        </button>
                                                        <button onClick={() => setEditRecord(record)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit" aria-label="Edit salary record">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(record.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete" aria-label="Delete salary record">
                                                            <Trash2 size={16} />
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
                        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
                            <span>{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</span>
                            <span className="font-bold text-emerald-600">
                                Total: ₹{filtered.reduce((s, r) => s + (r.amount || 0), 0).toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>
            </motion.div>

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