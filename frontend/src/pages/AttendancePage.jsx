import { useState, useEffect } from 'react'
import { Calendar, Users, ClipboardCheck, Check, Clock, X, Search, UserPlus, Briefcase } from 'lucide-react'
import { motion } from 'framer-motion'
import { attendanceService, employeesService } from '../services/employees'
import { projectsService } from '../services/projects'
import { useApp } from '../context/AppContext'
import GlassCard, { CardHeader } from '../components/common/GlassCard'
import Button from '../components/common/Button'
import EmployeeDetailModal from '../components/employees/EmployeeDetailModal'

// Simplified Glass Theme
const glassCardStyle = "bg-white/80 border border-slate-200 shadow-sm backdrop-blur-lg rounded-2xl";

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

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

  return (
    <div className="w-full h-full p-6 lg:p-10 text-slate-900 space-y-8 pb-24">
      {fetchingDetail && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-700">Fetching Profile Details...</span>
        </div>
      )}

      {/* Title Header */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs font-semibold">
            <ClipboardCheck size={14} className="text-blue-600" />
            <span className="uppercase tracking-widest">Operations Node</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Daily <span className="text-blue-600">Attendance</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">Mark roster attendance individually or in batches by department.</p>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        
        {/* Filters Controls */}
        <div className={`${glassCardStyle} p-6`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Date</label>
              <div className="relative flex items-center group">
                <Calendar size={14} className="absolute left-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="date"
                  value={selectedDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Department</label>
              <div className="relative flex items-center group">
                <Users size={14} className="absolute left-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-8 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all cursor-pointer"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Project</label>
              <div className="relative flex items-center group">
                <Briefcase size={14} className="absolute left-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-8 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all cursor-pointer"
                >
                  <option value="">All Projects</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Add from Directory</label>
              <div className="relative flex items-center group">
                <UserPlus size={14} className="absolute left-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <select
                  value=""
                  onChange={(e) => handleAddFromDirectory(parseInt(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-8 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all cursor-pointer"
                >
                  <option value="">Choose employee...</option>
                  {directoryEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Search Employee</label>
              <div className="relative flex items-center group">
                <Search size={14} className="absolute left-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Filter name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Roster Table */}
        <div className={`${glassCardStyle} p-6`}>
          <CardHeader title="Department Roster" subtitle={`${filteredRoster.length} employee nodes listed`} />
          
          <div className="overflow-x-auto mt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-900">
                <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-600 animate-pulse">Syncing Roster...</p>
              </div>
            ) : filteredRoster.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <Users size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-xs font-bold uppercase tracking-widest">No matching employees</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50/80">
                    <th className="p-4 pl-6">Employee (Click to view profile)</th>
                    <th className="p-4">Role</th>
                    <th className="p-4 text-center">Availability (Month / Year)</th>
                    <th className="p-4 text-center">Project & Task</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRoster.map((emp) => (
                    <tr key={emp.employee_id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleRowClick(emp)}>
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold border border-blue-200 group-hover:scale-105 transition-transform">
                            {emp.first_name[0]}{emp.last_name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {emp.first_name} {emp.last_name}
                            </p>
                            <span className="text-xs text-slate-500">{emp.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-700">{emp.role}</td>
                      <td className="p-4">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-xs font-bold text-blue-600 font-mono">
                            Month: {emp.attendance_rate_month !== undefined ? emp.attendance_rate_month : 100.0}%
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Year: {emp.attendance_rate_year !== undefined ? emp.attendance_rate_year : 100.0}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2 px-2 max-w-[200px] mx-auto">
                           <input 
                             type="text" 
                             placeholder="Project Name"
                             value={emp.project_name || ''}
                             onChange={(e) => handleFieldChange(emp.employee_id, 'project_name', e.target.value)}
                             onBlur={() => handleFieldBlur(emp.employee_id)}
                             className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
                           />
                           <input 
                             type="text" 
                             placeholder="Current Task"
                             value={emp.current_task || ''}
                             onChange={(e) => handleFieldChange(emp.employee_id, 'current_task', e.target.value)}
                             onBlur={() => handleFieldBlur(emp.employee_id)}
                             className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
                           />
                        </div>
                      </td>
                      <td className="p-4">
                        {emp.status === 'pre_joining' ? (
                          <div className="flex justify-center">
                            <span 
                              className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-dashed border-slate-300 text-slate-500 bg-slate-50"
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
                                activeClass: 'bg-emerald-600 border-emerald-600 text-white shadow-sm', 
                                inactiveClass: 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
                                icon: Check 
                              },
                              { 
                                id: 'absent', 
                                label: 'Absent', 
                                activeClass: 'bg-red-600 border-red-600 text-white shadow-sm', 
                                inactiveClass: 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
                                icon: X 
                              },
                              { 
                                id: 'late', 
                                label: 'Late', 
                                activeClass: 'bg-amber-500 border-amber-500 text-white shadow-sm', 
                                inactiveClass: 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
                                icon: Clock 
                              }
                            ].map((pill) => {
                              const active = emp.status === pill.id
                              return (
                                <button
                                  key={pill.id}
                                  onClick={() => handleStatusChange(emp.employee_id, pill.id)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all hover:scale-[1.02] flex items-center gap-1.5 ${
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
            <div className="flex justify-end pt-6 border-t border-slate-200 mt-6">
              <Button variant="primary" onClick={handleSave} loading={saving} className="px-6 py-2.5 font-bold text-xs uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm">
                Save Attendance
              </Button>
            </div>
          )}
        </div>

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
  )
}