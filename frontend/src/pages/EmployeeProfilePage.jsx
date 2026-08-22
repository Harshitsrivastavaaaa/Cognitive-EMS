import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  TrendingUp,
  Award,
  ArrowLeft,
  Edit2,
  Activity,
  FolderKanban,
  Shield
} from 'lucide-react'
import { employeesService } from '../services/employees'
import { projectsService } from '../services/projects'
import Button from '../components/common/Button'
import EmployeeModal from '../components/employees/EmployeeModal'
import api from '../services/api'

// Simplified Glass Theme
const glassCardStyle = "bg-white/80 border border-slate-200 shadow-sm backdrop-blur-lg rounded-2xl p-6";

const performanceData = [
  { period: 'Q1', score: 4.2 },
  { period: 'Q2', score: 4.4 },
  { period: 'Q3', score: 4.3 },
  { period: 'Q4', score: 4.5 },
]

export default function EmployeeProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [employeeProjects, setEmployeeProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadEmployee()
  }, [id])

  const loadEmployee = async () => {
    setLoading(true)
    try {
      const data = id
        ? await employeesService.getById(id)
        : (await employeesService.list({ limit: 1 }))[0]

      setEmployee(data)
      if (data && data.id) {
        const projs = await projectsService.getEmployeeProjects(data.id)
        setEmployeeProjects(projs)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEmployee = async (data, cvFile) => {
    const saved = await employeesService.update(employee.id, data)
    if (cvFile && saved && saved.id) {
      const uploadForm = new FormData();
      uploadForm.append('file', cvFile);
      try {
        await api.post(`/employees/${saved.id}/cv`, uploadForm, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (err) {
        console.error('Failed to upload CV:', err);
      }
    }
    setShowEditModal(false)
    loadEmployee()
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] text-slate-400 font-bold uppercase tracking-wider text-xs">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-3" />
        Syncing Profile Node...
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="p-12 text-center text-slate-500 font-semibold text-sm">
        Employee record not found.
      </div>
    )
  }

  return (
    <div className="w-full h-full p-6 lg:p-10 text-slate-900 space-y-8 pb-24">

      {/* NAVIGATION CONTROLS */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/employees')}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>
        <button
          onClick={() => setShowEditModal(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <Edit2 size={16} /> Edit Profile
        </button>
      </div>

      {/* HEADER PROFILE CARD */}
      <div className={`flex flex-col sm:flex-row gap-6 items-center p-6 ${glassCardStyle} bg-white/90`}>
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/60 flex items-center justify-center text-2xl font-black text-blue-700 shadow-sm">
          {employee.first_name?.[0] || ''}{employee.last_name?.[0] || ''}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {employee.first_name} {employee.last_name}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">{employee.role} • {employee.department}</p>
        </div>

        <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold tracking-wider uppercase">
          <Star size={14} className="fill-emerald-500 text-emerald-500" />
          <span>{employee.performance_score || '4.2'} Rating</span>
        </div>
      </div>

      {/* DETAILED INFO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT TWO COLUMNS: Contact, Skills & Projects */}
        <div className="lg:col-span-2 space-y-6">

          {/* CONTACT INFO */}
          <div className={glassCardStyle}>
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 font-bold text-slate-900 text-sm">
              <Shield size={16} className="text-blue-600" />
              <span>Contact Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-700 mt-4">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Email Address</span>
                  <span className="font-medium">{employee.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Phone Number</span>
                  <span className="font-medium">{employee.phone || '—'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Office Location</span>
                  <span className="font-medium">{employee.location || 'Remote'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Date of Hire</span>
                  <span className="font-medium">{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* TECHNICAL SKILLSET */}
          <div className={glassCardStyle}>
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 font-bold text-slate-900 text-sm">
              <Award size={16} className="text-blue-600" />
              <span>Technical Skillset</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {employee.skills && employee.skills.length > 0 ? (
                employee.skills.map(s => (
                  <span key={s} className="px-3.5 py-1.5 text-xs rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 font-semibold tracking-wide">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 text-xs italic">No skills listed for this employee.</span>
              )}
            </div>
          </div>

          {/* ASSIGNED PROJECTS */}
          <div className={glassCardStyle}>
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 font-bold text-slate-900 text-sm">
              <FolderKanban size={16} className="text-blue-600" />
              <span>Assigned Projects</span>
            </div>
            <div className="space-y-3 mt-4">
              {employeeProjects && employeeProjects.length > 0 ? (
                employeeProjects.map(proj => {
                  const memberInfo = proj.members?.find(m => m.employee_id === employee.id)
                  return (
                    <div
                      key={proj.id}
                      onClick={() => navigate('/projects')}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 hover:bg-slate-100/80 hover:border-blue-300 cursor-pointer transition-all group"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{proj.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Role: <span className="text-slate-700 font-semibold">{memberInfo?.role_in_project || 'Team Member'}</span>
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60">
                        {proj.status.replace('_', ' ')}
                      </span>
                    </div>
                  )
                })
              ) : (
                <span className="text-slate-400 text-xs italic">No active project assignments.</span>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Reporting Line & Performance */}
        <div className="space-y-6">

          {/* REPORTING LINE */}
          <div className={glassCardStyle}>
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 font-bold text-slate-900 text-sm">
              <Activity size={16} className="text-blue-600" />
              <span>Reporting Line</span>
            </div>
            <div className="space-y-4 mt-4 text-sm">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Direct Manager</span>
                <span className="text-slate-900 font-semibold">{employee.manager_name || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Department Node</span>
                <span className="text-slate-900 font-semibold">{employee.department}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Annual Base Compensation</span>
                <span className="text-blue-600 font-mono font-bold">${employee.salary ? Number(employee.salary).toLocaleString() : '—'}</span>
              </div>
            </div>
          </div>

          {/* PERFORMANCE HISTORY */}
          <div className={glassCardStyle}>
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 font-bold text-slate-900 text-sm">
              <TrendingUp size={16} className="text-blue-600" />
              <span>Performance History</span>
            </div>
            <div className="mt-4">
              <LineChart data={performanceData} dataKey="score" xAxisKey="period" height={150} showGrid={false} />
            </div>
          </div>

        </div>
      </div>

      {showEditModal && (
        <EmployeeModal
          employee={employee}
          onSave={handleSaveEmployee}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  )
}