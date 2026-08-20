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
  FolderKanban
} from 'lucide-react'
import { employeesService } from '../services/employees'
import { projectsService } from '../services/projects'
import GlassCard, { CardHeader } from '../components/common/GlassCard'
import LineChart from '../components/charts/LineChart'
import Button from '../components/common/Button'
import EmployeeModal from '../components/employees/EmployeeModal'
import api from '../services/api'

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
      <div className="flex justify-center items-center h-[60vh] text-violet-400 font-bold uppercase tracking-wider animate-pulse">
        Syncing Profile Node...
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="p-6 text-center text-slate-500">
        Employee record not found.
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 space-y-6">

      {/* BACK BUTTON */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/employees')}>
          Back to Directory
        </Button>
        <Button icon={Edit2} onClick={() => setShowEditModal(true)}>
          Edit Profile
        </Button>
      </div>

      {/* HEADER PROFILE CARD */}
      <div className="flex flex-col sm:flex-row gap-6 items-center p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-500 to-orange-500 flex items-center justify-center text-2xl font-black text-white shadow-lg">
          {employee.first_name?.[0] || ''}{employee.last_name?.[0] || ''}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {employee.first_name} {employee.last_name}
          </h1>
          <p className="text-sm text-slate-400 mt-1">{employee.role} • {employee.department}</p>
        </div>

        <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold tracking-wider uppercase">
          <Star size={14} className="fill-violet-400" />
          <span>{employee.performance_score || '4.2'} Rating</span>
        </div>
      </div>

      {/* DETAILED INFO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT TWO COLUMNS: Contact & Skills */}
        <div className="lg:col-span-2 space-y-6">

          <GlassCard className="bg-[#09090b]/40 border border-white/10 shadow-lg rounded-2xl p-6">
            <CardHeader title="Contact Information" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-300 mt-4">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-slate-500" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Email Address</span>
                  <span>{employee.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-slate-500" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Phone Number</span>
                  <span>{employee.phone || '—'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-slate-500" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Office Location</span>
                  <span>{employee.location || 'Remote'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-slate-500" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Date of Hire</span>
                  <span>{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : '—'}</span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="bg-[#09090b]/40 border border-white/10 shadow-lg rounded-2xl p-6">
            <CardHeader title="Technical Skillset" />
            <div className="flex flex-wrap gap-2.5 mt-4">
              {employee.skills && employee.skills.length > 0 ? (
                employee.skills.map(s => (
                  <span key={s} className="px-3.5 py-1.5 text-xs rounded-full bg-white/5 border border-white/10 text-slate-200 font-bold uppercase tracking-wider">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-xs italic">No skills listed for this employee.</span>
              )}
            </div>
          </GlassCard>

          <GlassCard className="bg-[#09090b]/40 border border-white/10 shadow-lg rounded-2xl p-6">
            <CardHeader title="Assigned Projects" icon={FolderKanban} />
            <div className="space-y-3 mt-4">
              {employeeProjects && employeeProjects.length > 0 ? (
                employeeProjects.map(proj => {
                  const memberInfo = proj.members?.find(m => m.employee_id === employee.id)
                  return (
                    <div
                      key={proj.id}
                      onClick={() => navigate('/projects')}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-orange-500/30 cursor-pointer transition-all group"
                    >
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">{proj.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Role: <span className="text-orange-400 font-semibold">{memberInfo?.role_in_project || 'Team Member'}</span>
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        {proj.status.replace('_', ' ')}
                      </span>
                    </div>
                  )
                })
              ) : (
                <span className="text-slate-500 text-xs italic">No active project assignments.</span>
              )}
            </div>
          </GlassCard>

        </div>

        {/* RIGHT COLUMN: Quick Stats & Performance */}
        <div className="space-y-6">

          <GlassCard className="bg-[#09090b]/40 border border-white/10 shadow-lg rounded-2xl p-6">
            <CardHeader title="Reporting Line" icon={Activity} />
            <div className="space-y-3 mt-4 text-sm">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Direct Manager</span>
                <span className="text-white font-semibold">{employee.manager_name || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Department Node</span>
                <span className="text-white font-semibold">{employee.department}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Annual Base Compensation</span>
                <span className="text-orange-400 font-mono font-bold">${employee.salary ? Number(employee.salary).toLocaleString() : '—'}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="bg-[#09090b]/40 border border-white/10 shadow-lg rounded-2xl p-6">
            <CardHeader title="Performance History" icon={TrendingUp} />
            <div className="mt-4">
              <LineChart data={performanceData} dataKey="score" xAxisKey="period" height={150} showGrid={false} />
            </div>
          </GlassCard>

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