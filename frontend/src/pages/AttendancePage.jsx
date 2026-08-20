import { useState, useEffect } from 'react'
import { Calendar, Users, ClipboardCheck, Check, Clock, X, Search, UserPlus, Briefcase } from 'lucide-react'
import { motion } from 'framer-motion'
import { attendanceService, employeesService } from '../services/employees'
import { projectsService } from '../services/projects'
import { useApp } from '../context/AppContext'
import GlassCard, { CardHeader } from '../components/common/GlassCard'
import Button from '../components/common/Button'
import EmployeeDetailModal from '../components/employees/EmployeeDetailModal'

const floatingBlob = {
  animate: {
    y: [0, -30, 0],
    x: [0, 15, 0],
    scale: [1, 1.05, 1],
    rotate: [0, 5, -5, 0],
    transition: { duration: 18, repeat: Infinity, ease: "easeInOut" },
  },
}

export default function AttendancePage() {
  const { addNotification } = useApp()
  const [departments, setDepartments] = useState([])
  const [selectedDept, setSelectedDept] = useState('')
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [roster, setRoster] = useState([])
  const [directoryEmployees, setDirectoryEmployees] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDetailEmployee, setSelectedDetailEmployee] = useState(null)
  const [fetchingDetail, setFetchingDetail] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch unique departments and full directory on load
  useEffect(() => {
    employeesService.getDepartments()
      .then(depts => {
        setDepartments(depts)
      })
      .catch(err => console.error(err))

    employeesService.list()
      .then(data => setDirectoryEmployees(data))
      .catch(err => console.error(err))

    projectsService.list()
      .then(data => setProjects(data))
      .catch(err => console.error(err))
  }, [])

  // Load roster when date, department, or project changes
  const loadRoster = async () => {
    if (!selectedDate) return
    setLoading(true)
    try {
      const data = await attendanceService.getList(selectedDate, selectedDept, selectedProjectId)
      setRoster(data)
    } catch (err) {
      console.error(err)
      addNotification({ type: 'error', message: 'Failed to load attendance roster.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoster()
  }, [selectedDept, selectedProjectId, selectedDate])

  const handleStatusChange = async (employeeId, newStatus) => {
    // Update local state immediately for responsive feedback
    setRoster(prev => prev.map(emp => emp.employee_id === employeeId ? { ...emp, status: newStatus } : emp))
    
    const emp = roster.find(e => e.employee_id === employeeId)
    
    try {
      await attendanceService.saveBatch(selectedDate, [
        { 
          employee_id: employeeId, 
          status: newStatus,
          project_name: emp?.project_name,
          current_task: emp?.current_task
        }
      ])
      console.log(`Auto-saved attendance for employee ${employeeId} as ${newStatus}`)
    } catch (err) {
      console.error(err)
      addNotification({ type: 'error', message: 'Failed to auto-save attendance to server.' })
    }
  }

  const handleFieldChange = (employeeId, field, value) => {
    setRoster(prev => prev.map(emp => emp.employee_id === employeeId ? { ...emp, [field]: value } : emp))
  }

  const handleFieldBlur = async (employeeId) => {
    const emp = roster.find(e => e.employee_id === employeeId)
    if (!emp) return
    try {
      await attendanceService.saveBatch(selectedDate, [
        { 
          employee_id: employeeId, 
          status: emp.status,
          project_name: emp.project_name,
          current_task: emp.current_task
        }
      ])
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const records = roster.map(emp => ({
        employee_id: emp.employee_id,
        status: emp.status,
        project_name: emp.project_name,
        current_task: emp.current_task
      }))
      await attendanceService.saveBatch(selectedDate, records)
      addNotification({ type: 'success', message: 'Attendance records successfully archived.' })
    } catch (err) {
      console.error(err)
      addNotification({ type: 'error', message: 'Failed to save attendance.' })
    } finally {
      setSaving(false)
    }
  }

  const handleRowClick = async (emp) => {
    setFetchingDetail(true)
    try {
      const fullEmp = await employeesService.getById(emp.employee_id)
      setSelectedDetailEmployee(fullEmp)
    } catch (err) {
      console.error(err)
      addNotification({ type: 'error', message: 'Failed to fetch employee details.' })
    } finally {
      setFetchingDetail(false)
    }
  }

  const handleAddFromDirectory = (empId) => {
    if (!empId) return
    const selected = directoryEmployees.find(emp => emp.id === empId)
    if (selected) {
      const alreadyIn = roster.some(r => r.employee_id === selected.id)
      if (alreadyIn) {
        addNotification({ type: 'warning', message: `${selected.first_name} is already in the attendance list.` })
      } else {
        setRoster(prev => [
          ...prev,
          {
            employee_id: selected.id,
            first_name: selected.first_name,
            last_name: selected.last_name,
            email: selected.email,
            role: selected.role,
            department: selected.department,
            status: 'present',
            project_name: '',
            current_task: ''
          }
        ])
        addNotification({ type: 'success', message: `Added ${selected.first_name} to the attendance roster.` })
      }
    }
  }

  const filteredRoster = roster.filter(emp => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase()
    const email = (emp.email || '').toLowerCase()
    const query = searchQuery.toLowerCase()
    return fullName.includes(query) || email.includes(query)
  })

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-white p-6 md:p-10 font-sans selection:bg-orange-500/30 overflow-y-auto custom-scrollbar overflow-x-hidden">
      {/* Background Neon Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#7c3aed", "#ea580c", "#7c3aed"] }} transition={{ ...floatingBlob.animate.transition, backgroundColor: { duration: 20, repeat: Infinity, ease: "linear" } }} className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] rounded-full blur-[140px] opacity-20 mix-blend-screen" />
        <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#db2777", "#7c3aed", "#db2777"] }} transition={{ ...floatingBlob.animate.transition, delay: 2, backgroundColor: { duration: 25, repeat: Infinity, ease: "linear" } }} className="absolute top-[30%] -right-[10%] w-[700px] h-[700px] rounded-full blur-[130px] opacity-20 mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full pb-24">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 shadow-sm">
            <ClipboardCheck size={12} className="text-violet-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Operations Node</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            Daily{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400">
              Attendance
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Mark roster attendance individually or in batches by department.</p>
        </div>
      </div>

      {fetchingDetail && (
        <div className="fixed top-4 right-4 z-50 bg-[#0a0a0c] border border-white/10 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-300">Fetching Profile Details...</span>
        </div>
      )}

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        
        {/* Filters Controls */}
        <GlassCard className="bg-[#09090b]/40 border border-white/10 shadow-lg rounded-3xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Select Date</label>
              <div className="relative flex items-center group">
                <Calendar size={14} className="absolute left-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                <input
                  type="date"
                  value={selectedDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#121214] border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Select Department</label>
              <div className="relative flex items-center group">
                <Users size={14} className="absolute left-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full bg-[#121214] border border-white/5 rounded-2xl py-3 pl-11 pr-8 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all cursor-pointer bg-no-repeat"
                >
                  <option value="" className="bg-[#121214]">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.name} value={d.name} className="bg-[#121214]">{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Select Project</label>
              <div className="relative flex items-center group">
                <Briefcase size={14} className="absolute left-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-[#121214] border border-white/5 rounded-2xl py-3 pl-11 pr-8 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all cursor-pointer bg-no-repeat"
                >
                  <option value="" className="bg-[#121214]">All Projects</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#121214]">{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Add from Directory</label>
              <div className="relative flex items-center group">
                <UserPlus size={14} className="absolute left-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                <select
                  value=""
                  onChange={(e) => handleAddFromDirectory(parseInt(e.target.value))}
                  className="w-full bg-[#121214] border border-white/5 rounded-2xl py-3 pl-11 pr-8 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all cursor-pointer bg-no-repeat"
                >
                  <option value="" className="bg-[#121214]">Choose employee...</option>
                  {directoryEmployees.map(emp => (
                    <option key={emp.id} value={emp.id} className="bg-[#121214]">
                      {emp.first_name} {emp.last_name} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Search Employee</label>
              <div className="relative flex items-center group">
                <Search size={14} className="absolute left-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Filter name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121214] border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all"
                />
              </div>
            </div>

          </div>
        </GlassCard>

        {/* Roster Table */}
        <GlassCard className="bg-[#09090b]/40 border border-white/10 shadow-lg rounded-3xl p-6">
          <CardHeader title="Department Roster" subtitle={`${filteredRoster.length} employee nodes listed`} />
          
          <div className="overflow-x-auto no-scrollbar mt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-white">
                <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-violet-400 animate-pulse">Syncing Roster...</p>
              </div>
            ) : filteredRoster.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <Users size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-xs font-bold uppercase tracking-widest">No matching employees</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <th className="pb-4">Employee (Click to view profile)</th>
                    <th className="pb-4">Role</th>
                    <th className="pb-4 text-center">Availability (Month / Year)</th>
                    <th className="pb-4 text-center">Project & Task</th>
                    <th className="pb-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRoster.map((emp) => (
                    <tr key={emp.employee_id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleRowClick(emp)}>
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white border border-white/10 group-hover:scale-105 transition-transform">
                            {emp.first_name[0]}{emp.last_name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white group-hover:text-violet-400 transition-colors">
                              {emp.first_name} {emp.last_name}
                            </p>
                            <span className="text-[10px] text-slate-500">{emp.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-slate-300">{emp.role}</td>
                      <td className="py-4">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-xs font-bold text-violet-400 font-mono">
                            Month: {emp.attendance_rate_month !== undefined ? emp.attendance_rate_month : 100.0}%
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Year: {emp.attendance_rate_year !== undefined ? emp.attendance_rate_year : 100.0}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col gap-2 px-2 max-w-[200px] mx-auto">
                           <input 
                             type="text" 
                             placeholder="Project Name"
                             value={emp.project_name || ''}
                             onChange={(e) => handleFieldChange(emp.employee_id, 'project_name', e.target.value)}
                             onBlur={() => handleFieldBlur(emp.employee_id)}
                             className="w-full bg-[#121214] border border-white/5 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-slate-600"
                           />
                           <input 
                             type="text" 
                             placeholder="Current Task"
                             value={emp.current_task || ''}
                             onChange={(e) => handleFieldChange(emp.employee_id, 'current_task', e.target.value)}
                             onBlur={() => handleFieldBlur(emp.employee_id)}
                             className="w-full bg-[#121214] border border-white/5 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-slate-600"
                           />
                        </div>
                      </td>
                      <td className="py-4">
                        {emp.status === 'pre_joining' ? (
                          <div className="flex justify-center">
                            <span 
                              className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-dashed border-white/20 text-slate-400 bg-white/[0.02]"
                              title={`Joined on ${emp.hire_date || 'N/A'}`}
                            >
                              Pre-Joining ({emp.hire_date || 'N/A'})
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            {[
                              { 
                                id: 'present', 
                                label: 'Present', 
                                activeClass: 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]', 
                                inactiveClass: 'bg-transparent border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10',
                                icon: Check 
                              },
                              { 
                                id: 'absent', 
                                label: 'Absent', 
                                activeClass: 'bg-red-500 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]', 
                                inactiveClass: 'bg-transparent border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10',
                                icon: X 
                              },
                              { 
                                id: 'late', 
                                label: 'Late', 
                                activeClass: 'bg-amber-500 border-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]', 
                                inactiveClass: 'bg-transparent border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10',
                                icon: Clock 
                              }
                            ].map((pill) => {
                              const active = emp.status === pill.id
                              return (
                                <button
                                  key={pill.id}
                                  onClick={() => handleStatusChange(emp.employee_id, pill.id)}
                                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all hover:scale-[1.02] flex items-center gap-1.5 ${
                                    active ? `${pill.activeClass} scale-[1.03]` : pill.inactiveClass
                                  }`}
                                >
                                  {active && <pill.icon size={11} />}
                                  {pill.label}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {roster.length > 0 && (
            <div className="flex justify-end pt-6 border-t border-white/10 mt-6">
              <Button variant="primary" onClick={handleSave} loading={saving} className="px-6 py-3 font-bold text-xs uppercase tracking-wider">
                Save Attendance
              </Button>
            </div>
          )}
        </GlassCard>

      </motion.div>

      {selectedDetailEmployee && (
        <EmployeeDetailModal
          employee={selectedDetailEmployee}
          onClose={() => setSelectedDetailEmployee(null)}
          showAttendanceOption={true}
          defaultTab="attendance"
        />
      )}

    </div>
    </div>
  )
}
