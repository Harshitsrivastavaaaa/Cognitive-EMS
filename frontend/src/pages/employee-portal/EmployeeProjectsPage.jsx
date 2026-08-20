import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FolderKanban, Users, Calendar, IndianRupee } from 'lucide-react'
import { employeePortalService } from '../../services/employeePortal'

export default function EmployeeProjectsPage() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadProjects()
    }, [])

    const loadProjects = async () => {
        try {
            const data = await employeePortalService.getMyProjects()
            setProjects(data)
        } catch (err) {
            console.error('Failed to load projects:', err)
        } finally {
            setLoading(false)
        }
    }

    const statusStyles = {
        active: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
        planning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300',
        completed: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
        on_hold: 'bg-red-500/10 border-red-500/20 text-red-300',
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
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-black text-white tracking-tight">My Projects</h1>
                <p className="text-xs text-slate-500 mt-1">Projects you are currently assigned to</p>
            </motion.div>

            {/* Projects Grid */}
            {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {projects.map((project, i) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#0a0a0c] border border-white/[0.08] rounded-2xl p-6 space-y-4 hover:border-white/[0.12] transition-colors"
                        >
                            {/* Project Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                                        <FolderKanban size={18} className="text-violet-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-bold text-white truncate">{project.name}</h3>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{project.client_name || 'Internal'}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-lg shrink-0 ${statusStyles[project.status] || statusStyles.active}`}>
                                    {project.status}
                                </span>
                            </div>

                            {/* Description */}
                            {project.description && (
                                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{project.description}</p>
                            )}

                            {/* Your Role */}
                            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-4 py-2.5">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Your Role</p>
                                <p className="text-xs text-emerald-300 font-bold mt-0.5">{project.role_in_project}</p>
                            </div>

                            {/* Meta Info */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2">
                                    <Calendar size={12} className="text-slate-500" />
                                    <div>
                                        <p className="text-[9px] text-slate-600 uppercase">Start</p>
                                        <p className="text-[11px] text-slate-300 font-medium">
                                            {project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={12} className="text-slate-500" />
                                    <div>
                                        <p className="text-[9px] text-slate-600 uppercase">Due</p>
                                        <p className="text-[11px] text-slate-300 font-medium">
                                            {project.due_date ? new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={12} className="text-slate-500" />
                                    <div>
                                        <p className="text-[9px] text-slate-600 uppercase">Team</p>
                                        <p className="text-[11px] text-slate-300 font-medium">{project.members_count} members</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IndianRupee size={12} className="text-slate-500" />
                                    <div>
                                        <p className="text-[9px] text-slate-600 uppercase">Budget</p>
                                        <p className="text-[11px] text-slate-300 font-medium">₹{(project.budget || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-[#0a0a0c] border border-white/[0.08] rounded-2xl p-12 text-center"
                >
                    <FolderKanban size={40} className="text-slate-600 mx-auto mb-4" />
                    <h3 className="text-sm font-bold text-white mb-1">No Projects Assigned</h3>
                    <p className="text-xs text-slate-500">You haven't been assigned to any projects yet. Contact your manager for project assignments.</p>
                </motion.div>
            )}
        </div>
    )
}
