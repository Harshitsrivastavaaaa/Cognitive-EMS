import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import Button from '../common/Button'
import { departmentService } from '../../services/departments'

const DEFAULT_DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Product']
const statuses = ['active', 'inactive', 'on_leave']

export default function EmployeeModal({ employee, onSave, onClose }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    gitlab_id: '',
    phone: '',
    department: 'Engineering',
    role: '',
    hire_date: new Date().toISOString().split('T')[0],
    salary: '',
    status: 'active',
    manager_name: '',
    location: '',
    skills: []
  })

  const [skillInput, setSkillInput] = useState('')
  const [cvFile, setCvFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [departmentsList, setDepartmentsList] = useState(DEFAULT_DEPARTMENTS)

  useEffect(() => {
    departmentService.getDepartments().then(data => {
      if (data && data.length > 0) {
        const names = data.map(d => d.name);
        setDepartmentsList(names);
        setFormData(p => ({
          ...p,
          department: employee?.department || names[0]
        }));
      }
    }).catch(console.error);
  }, [employee]);

  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || employee.firstName || '',
        last_name: employee.last_name || employee.lastName || '',
        email: employee.email || '',
        gitlab_id: employee.gitlab_id || employee.gitlabId || '',
        phone: employee.phone || '',
        department: employee.department || 'Engineering',
        role: employee.role || '',
        hire_date: employee.hire_date || employee.hireDate || new Date().toISOString().split('T')[0],
        salary: employee.salary || '',
        status: employee.status || 'active',
        manager_name: employee.manager_name || employee.managerName || '',
        location: employee.location || '',
        skills: employee.skills || []
      })
    }
  }, [employee])

  const handleChange = e =>
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }))

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput)) {
      setFormData(p => ({ ...p, skills: [...p.skills, skillInput.trim()] }))
      setSkillInput('')
    }
  }

  const removeSkill = s =>
    setFormData(p => ({ ...p, skills: p.skills.filter(x => x !== s) }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...formData };
      if (payload.salary === '') {
        payload.salary = 0;
      } else if (payload.salary !== null) {
        payload.salary = parseFloat(payload.salary);
      }

      await onSave(payload, cvFile)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.detail || err.response?.data?.message || 'Failed to save employee. Please check your inputs.')
    } finally {
      setSaving(false)
    }
  }

  const input =
    "w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 transition-all placeholder:text-slate-600"

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300 px-4">
      <div className="bg-[#0a0a0c] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.01]">
          <h2 className="text-xl font-bold">
            <span className="text-white">{employee ? 'Edit' : 'Add'}</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Employee</span>
          </h2>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">

          {/* Scrollable Fields */}
          <div className="p-6 space-y-4 overflow-y-auto no-scrollbar flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">First Name</label>
                <input name="first_name" placeholder="First name" value={formData.first_name} onChange={handleChange} className={input} required />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Last Name</label>
                <input name="last_name" placeholder="Last name" value={formData.last_name} onChange={handleChange} className={input} required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Email</label>
                <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} className={input} required />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Gitlab ID</label>
                <input name="gitlab_id" placeholder="Gitlab ID" value={formData.gitlab_id} onChange={handleChange} className={input} />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Phone</label>
                <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className={input} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Department</label>
                <select name="department" value={formData.department} onChange={handleChange} className={input}>
                  {departmentsList.map(d => <option key={d} value={d} className="bg-[#0f0f11]">{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Role / Job Title</label>
                <input name="role" placeholder="Role" value={formData.role} onChange={handleChange} className={input} required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Hire Date</label>
                <input type="date" name="hire_date" value={formData.hire_date} onChange={handleChange} className={input} />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Salary (₹ / yr)</label>
                <input name="salary" placeholder="Salary" value={formData.salary} onChange={handleChange} className={input} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className={input}>
                  {statuses.map(s => <option key={s} value={s} className="bg-[#0f0f11]">{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Location / Office</label>
                <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} className={input} />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Direct Manager</label>
              <input name="manager_name" placeholder="Manager Name" value={formData.manager_name} onChange={handleChange} className={input} />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Upload Resume / CV</label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={e => setCvFile(e.target.files[0])} className={input} />
            </div>

            {/* Skills */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Skills & Badges</label>
              <div className="flex gap-2">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Add a skill..." className={`${input} flex-1`} />
                <Button size="sm" variant="secondary" type="button" onClick={addSkill}>Add</Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2 max-h-24 overflow-y-auto pr-1">
                {formData.skills && formData.skills.map(s => (
                  <span key={s} className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-semibold">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} className="text-violet-400 hover:text-white font-bold ml-0.5 text-sm leading-none">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/[0.01]">
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" icon={Save} loading={saving}>
              {employee ? 'Save Changes' : 'Add Employee'}
            </Button>
          </div>
        </form>

      </div>
    </div>
  )
}
