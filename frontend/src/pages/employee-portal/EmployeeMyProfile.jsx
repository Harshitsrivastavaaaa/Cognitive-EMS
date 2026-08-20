import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Briefcase, Building2, CalendarHeart, Star, Save, CheckCircle, Edit3, X, Camera, Crown, Fingerprint, Shield, Sparkles, Code2, Zap } from 'lucide-react'
import { employeePortalService } from '../../services/employeePortal'

export default function EmployeeMyProfile() {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [saved, setSaved] = useState(false)
    const [editData, setEditData] = useState({ phone: '', location: '', skills: '' })
    const fileInputRef = useRef(null)

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            const data = await employeePortalService.getMyProfile()
            setProfile(data)
            setEditData({
                phone: data.phone || '',
                location: data.location || '',
                skills: (data.skills || []).join(', ')
            })
        } catch (err) {
            console.error('Failed to load profile:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const payload = {
                phone: editData.phone || null,
                location: editData.location || null,
                skills: editData.skills ? editData.skills.split(',').map(s => s.trim()).filter(Boolean) : null
            }
            const updated = await employeePortalService.updateMyProfile(payload)
            setProfile(prev => ({ ...prev, ...updated }))
            setEditing(false)
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            console.error('Failed to update profile:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setUploading(true)
            const result = await employeePortalService.uploadProfileImage(file)
            setProfile(prev => ({ ...prev, profile_image_filename: result.profile_image_filename }))
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            console.error('Failed to upload image:', err)
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500">
                Failed to load profile
            </div>
        )
    }

    const colorMap = {
        violet: { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.2)', text: '#a78bfa' },
        orange: { bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.2)', text: '#fb923c' },
        blue: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa' },
        rose: { bg: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.2)', text: '#fb7185' },
        cyan: { bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.2)', text: '#22d3ee' },
        emerald: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)', text: '#34d399' },
        teal: { bg: 'rgba(20, 184, 166, 0.1)', border: 'rgba(20, 184, 166, 0.2)', text: '#2dd4bf' },
        amber: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', text: '#fbbf24' },
        pink: { bg: 'rgba(236, 72, 153, 0.1)', border: 'rgba(236, 72, 153, 0.2)', text: '#f472b6' },
        indigo: { bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.2)', text: '#818cf8' },
    }

    const ReadonlyField = ({ icon: Icon, label, value, color = 'violet' }) => {
        const c = colorMap[color] || colorMap.violet
        return (
            <div className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.04] transition-colors">
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}
                >
                    <Icon size={16} style={{ color: c.text }} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
                    <p className="text-sm text-white font-medium mt-0.5 truncate">{value || '—'}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">My Profile</h1>
                    <p className="text-xs text-slate-500 mt-1">View and manage your personal information</p>
                </div>
                {!editing ? (
                    <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-500/20 transition-all"
                    >
                        <Edit3 size={13} /> Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setEditing(false)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-slate-400 text-xs font-bold rounded-xl hover:bg-white/10 transition-all"
                        >
                            <X size={13} /> Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {saving ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={13} />}
                            Save Changes
                        </button>
                    </div>
                )}
            </motion.div>

            {saved && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                    <CheckCircle size={14} className="text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300">Profile updated successfully</span>
                </motion.div>
            )}

            {/* Profile Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#0a0a0c] border border-white/[0.08] rounded-2xl overflow-hidden"
            >
                {/* Banner */}
                <div className="h-24 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent relative">
                    <div className="absolute bottom-0 left-6 translate-y-1/2">
                        <div 
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-xl border-4 border-[#0a0a0c] shadow-xl relative group cursor-pointer overflow-hidden"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {profile.profile_image_filename ? (
                                <img 
                                    src={`http://localhost:8000/api/v1/uploads/${profile.profile_image_filename}`} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>{profile.first_name[0]}{profile.last_name[0]}</span>
                            )}
                            
                            {/* Upload Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                {uploading ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Camera size={20} className="text-white drop-shadow" />
                                )}
                            </div>
                        </div>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                        />
                    </div>
                </div>

                <div className="pt-12 px-6 pb-6 space-y-6">
                    <div>
                        <h2 className="text-xl font-black text-white">{profile.first_name} {profile.last_name}</h2>
                        <p className="text-sm text-slate-400">{profile.role} · {profile.department}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <div className="flex items-center gap-0.5">
                                {[1,2,3,4,5].map(i => (
                                    <Star key={i} size={11} className={i <= Math.round(profile.performance_score || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'} />
                                ))}
                            </div>
                            <span className="text-xs text-slate-400 ml-1">{profile.performance_score || '—'} performance score</span>
                        </div>
                    </div>

                    {/* Read-only Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <ReadonlyField icon={Mail} label="Email Address" value={profile.email} color="violet" />
                        <ReadonlyField icon={Briefcase} label="Job Role" value={profile.role} color="orange" />
                        <ReadonlyField icon={Building2} label="Department" value={profile.department} color="blue" />
                        <ReadonlyField icon={CalendarHeart} label="Date of Joining" value={profile.hire_date ? new Date(profile.hire_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'} color="rose" />
                        <ReadonlyField icon={Crown} label="Reporting Manager" value={profile.manager_name} color="cyan" />
                        <ReadonlyField icon={Fingerprint} label="Employment Status" value={profile.status} color="emerald" />
                    </div>

                    {/* Editable Fields */}
                    <div className="border-t border-white/[0.06] pt-6 space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {editing ? '✏️ Editable Fields' : 'Personal Details'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {editing ? (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Phone size={10} /> Phone</label>
                                        <input
                                            value={editData.phone}
                                            onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full p-3 text-xs bg-[#121214] border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white transition-all placeholder:text-slate-600"
                                            placeholder="+1-555-0000"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><MapPin size={10} /> Location</label>
                                        <input
                                            value={editData.location}
                                            onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                                            className="w-full p-3 text-xs bg-[#121214] border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white transition-all placeholder:text-slate-600"
                                            placeholder="City, Country"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Skills (comma-separated)</label>
                                        <input
                                            value={editData.skills}
                                            onChange={(e) => setEditData(prev => ({ ...prev, skills: e.target.value }))}
                                            className="w-full p-3 text-xs bg-[#121214] border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white transition-all placeholder:text-slate-600"
                                            placeholder="React, Python, Design..."
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <ReadonlyField icon={Phone} label="Phone" value={profile.phone} color="teal" />
                                    <ReadonlyField icon={MapPin} label="Location" value={profile.location} color="amber" />
                                </>
                            )}
                        </div>

                        {/* Skills Display (view mode) */}
                        {!editing && profile.skills?.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/15 text-emerald-300 text-[11px] font-bold rounded-lg">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
