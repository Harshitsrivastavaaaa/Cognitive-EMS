import { useState, useEffect } from 'react'
import { X, Mail, Phone, MapPin, Calendar, Star, Award, ShieldAlert, FileText, Download, ChevronLeft, ChevronRight, QrCode, CheckCircle, FilePlus, Sparkles } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import Button from '../common/Button'
import api from '../../services/api'
import { attendanceService } from '../../services/employees'
import logoSrc from '../../assets/logo.png'

const labelStyle = "text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5"
const valueStyle = "text-sm text-slate-200 font-medium"

export default function EmployeeDetailModal({ employee, onClose, showAttendanceOption = false, defaultTab = 'profile' }) {
  const [downloading, setDownloading] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [documents, setDocuments] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(false)

  useEffect(() => {
    if (employee?.id) {
      loadEmployeeDocuments()
    }
  }, [employee?.id])

  const loadEmployeeDocuments = async () => {
    if (!employee?.id) return
    setLoadingDocs(true)
    try {
      const response = await api.get(`/documents/employee/${employee.id}`)
      setDocuments(response.data || [])
    } catch (err) {
      console.error('Failed to load employee documents:', err)
    } finally {
      setLoadingDocs(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'attendance' && employee?.id) {
      setLoadingAttendance(true)
      attendanceService.getEmployeeAttendance(employee.id)
        .then(data => {
          setAttendanceRecords(data || [])
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          setLoadingAttendance(false)
        })
    }
  }, [activeTab, employee?.id])

  const handleDownloadCV = async () => {
    setDownloading(true)
    try {
      const response = await api.get(`/employees/${employee.id}/cv`, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      
      const contentDisposition = response.headers['content-disposition']
      let filename = 'cv.pdf'
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="?([^"]+)"?/)
        if (matches && matches[1]) filename = matches[1]
      } else if (employee.cv_filename) {
        filename = employee.cv_filename.replace(`cv_${employee.id}_`, '')
      }
      
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Could not download CV. Please ensure a valid CV has been uploaded.')
    } finally {
      setDownloading(false)
    }
  }

  const handleDownloadVaultDoc = async (docItem) => {
    try {
      const response = await api.get(`/documents/${docItem.id}/download`, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', docItem.original_name || 'document.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download document:', err)
      alert('Could not download document.')
    }
  }

  const handleDownloadIDCard = () => {
    setDownloading(true);
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [54, 85.6]
    });

    const generateAndSave = (imgElement, profileImgElement) => {
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 54, 85.6, 'F');

      doc.setFillColor(252, 128, 15);
      doc.rect(0, 0, 54, 15, 'F');
      
      if (imgElement) {
        const canvas = document.createElement('canvas');
        canvas.width = imgElement.width;
        canvas.height = imgElement.height;
        const ctx = canvas.getContext('2d');
        
        const r = Math.min(canvas.width, canvas.height) * 0.12;
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(canvas.width - r, 0);
        ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r);
        ctx.lineTo(canvas.width, canvas.height - r);
        ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height);
        ctx.lineTo(r, canvas.height);
        ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(imgElement, 0, 0);
        
        const roundedDataUrl = canvas.toDataURL('image/png');

        let imgHeight = 9;
        let imgWidth = (imgElement.width * imgHeight) / imgElement.height;
        if (imgWidth > 28) {
          imgWidth = 28;
          imgHeight = (imgElement.height * imgWidth) / imgElement.width;
        }
        const yPos = 3 + (9 - imgHeight) / 2;
        const xPos = (54 - imgWidth) / 2;
        doc.addImage(roundedDataUrl, 'PNG', xPos, yPos, imgWidth, imgHeight);
      }

      doc.setFont("helvetica", "bold");
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(6);
      doc.text("ID", 52, 5, { align: 'right' });

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(55, 62, 72);
      doc.setLineWidth(1.5);
      doc.roundedRect(15, 20, 24, 24, 3, 3, 'FD');
      
      if (profileImgElement && profileImgElement.width > 0) {
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        
        const r = 15;
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(canvas.width - r, 0);
        ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r);
        ctx.lineTo(canvas.width, canvas.height - r);
        ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height);
        ctx.lineTo(r, canvas.height);
        ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(profileImgElement, 0, 0, canvas.width, canvas.height);
        const profileRoundedDataUrl = canvas.toDataURL('image/png');
        doc.addImage(profileRoundedDataUrl, 'PNG', 15.5, 20.5, 23, 23);
      } else {
        doc.setFontSize(16);
        doc.setTextColor(252, 128, 15);
        doc.setFont("helvetica", "bold");
        const initials = `${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}`;
        doc.text(initials, 27, 34, { align: 'center' });
      }

      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      const fullName = `${employee.first_name} ${employee.last_name}`;
      doc.text(fullName, 27, 49, { align: 'center' });

      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(6);
      doc.text(employee.role || 'Team Member', 27, 53, { align: 'center' });

      doc.setFillColor(255, 255, 255, 0.05);
      doc.roundedRect(12, 57, 30, 7, 1.5, 1.5, 'F');

      doc.setFont("courier", "bold");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6);
      const empIdStr = `EMP-${employee.id.toString().padStart(4, '0')}`;
      doc.text(empIdStr, 27, 61.5, { align: 'center' });

      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(5);
      doc.text((employee.department || 'GENERAL').toUpperCase(), 27, 68, { align: 'center' });

      doc.setFillColor(252, 128, 15);
      doc.rect(0, 77.6, 54, 8, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5);
      doc.text("HASH AI LLC", 27, 82, { align: 'center' });

      doc.save(`ID_Card_${employee.first_name}_${employee.last_name}.pdf`);
      setDownloading(false);
    };

    const logoImg = new Image();
    logoImg.src = logoSrc;

    const profileImg = new Image();
    profileImg.crossOrigin = "anonymous";
    if (employee.profile_image_filename) {
      profileImg.src = `http://localhost:8000/api/v1/uploads/${employee.profile_image_filename}`;
    }

    let loadedCount = 0;
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= 2) {
        generateAndSave(logoImg, profileImg);
      }
    };

    logoImg.onload = checkAllLoaded;
    logoImg.onerror = checkAllLoaded;

    if (employee.profile_image_filename) {
      profileImg.onload = checkAllLoaded;
      profileImg.onerror = checkAllLoaded;
    } else {
      loadedCount++;
    }

    if (logoImg.complete) {
      logoImg.onload();
    }
  };

  const expDoc = documents.find(d => d.document_type === 'Experience Letter' || d.original_name?.toLowerCase().includes('experience'));
  const joiningDoc = documents.find(d => d.document_type === 'Joining Letter' || d.original_name?.toLowerCase().includes('offer') || d.original_name?.toLowerCase().includes('joining'));

  const renderAttendanceTab = () => {
    const year = calendarDate.getFullYear()
    const month = calendarDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startingDayOfWeek = firstDayOfMonth.getDay()

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: '', isCurrentMonth: false })
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      days.push({ day, dateString, isCurrentMonth: true })
    }

    const prevMonth = () => {
      setCalendarDate(new Date(year, month - 1, 1))
    }
    const nextMonth = () => {
      setCalendarDate(new Date(year, month + 1, 1))
    }

    const getDayStatus = (dateStr) => {
      return attendanceRecords.find(r => r.date === dateStr)
    }

    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="flex items-center justify-between bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
          <div className="flex items-center gap-2">
            <Calendar className="text-emerald-400" size={18} />
            <h3 className="text-sm font-bold text-white">
              {monthNames[month]} {year}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={nextMonth} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <span key={d} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((d, index) => {
              const record = getDayStatus(d.dateString)
              const status = record?.status
              const joinDateStr = employee.hire_date ? employee.hire_date.substring(0, 10) : null
              const isPreJoining = Boolean(joinDateStr && d.dateString < joinDateStr)

              let statusClass = "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
              
              if (!d.isCurrentMonth) {
                statusClass = "text-slate-700 pointer-events-none opacity-30 border-transparent bg-transparent"
              } else if (isPreJoining) {
                statusClass = "bg-white/[0.01] border-dashed border-white/10 text-slate-600 opacity-40 cursor-not-allowed"
              } else if (status === 'present') {
                statusClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]"
              } else if (status === 'absent') {
                statusClass = "bg-red-500/10 border-red-500/30 text-red-400 font-bold shadow-[0_0_10px_rgba(239,68,68,0.15)]"
              } else if (status === 'late') {
                statusClass = "bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.15)]"
              }

              let titleAttr = undefined
              if (isPreJoining) {
                titleAttr = `Pre-joining date (Joined: ${joinDateStr})`
              } else if (record && (record.project_name || record.current_task)) {
                titleAttr = `Project: ${record.project_name || 'None'}\nTask: ${record.current_task || 'None'}`
              }

              return (
                <div 
                  key={index}
                  title={titleAttr}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center text-xs transition-all relative ${statusClass}`}
                >
                  <span>{d.day}</span>
                  {!isPreJoining && status && (
                    <span className={`w-1 h-1 rounded-full absolute bottom-1 ${
                      status === 'present' ? 'bg-emerald-400' :
                      status === 'absent' ? 'bg-red-400' : 'bg-amber-400'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-500 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
            <span>Late</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white/5 border border-white/10" />
            <span>No Log</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white/[0.02] border border-dashed border-white/20" />
            <span>Pre-Joining</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300 px-4">
      <div className="bg-[#0a0a0c] border border-white/10 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Background blobs for premium feel */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-violet-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-orange-500 flex items-center justify-center text-white font-black text-xs">
              {employee.first_name?.[0] || ''}{employee.last_name?.[0] || ''}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                {employee.first_name} {employee.last_name}
              </h2>
              <span className="text-xs text-slate-400">{employee.role} • {employee.department}</span>
            </div>
          </div>
          
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-white/10 bg-white/[0.01]">
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'profile' 
                ? 'border-violet-500 text-violet-400' 
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Profile Details
          </button>
          
          <button 
            onClick={() => setActiveTab('documents')} 
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'documents' 
                ? 'border-[#fc800f] text-[#fc800f]' 
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Documents Vault
          </button>

          {showAttendanceOption && (
            <button 
              onClick={() => setActiveTab('attendance')} 
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'attendance' 
                  ? 'border-emerald-500 text-emerald-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Attendance
            </button>
          )}
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === 'profile' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Contact Details Grid */}
              <div>
                <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
                  <div>
                    <span className={labelStyle}>Email Address</span>
                    <span className={`${valueStyle} flex items-center gap-1.5`}><Mail size={12} className="text-slate-500"/> {employee.email}</span>
                  </div>
                  <div>
                    <span className={labelStyle}>Phone Number</span>
                    <span className={`${valueStyle} flex items-center gap-1.5`}><Phone size={12} className="text-slate-500"/> {employee.phone || '—'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className={labelStyle}>Office Location</span>
                    <span className={`${valueStyle} flex items-center gap-1.5`}><MapPin size={12} className="text-slate-500"/> {employee.location || 'Remote'}</span>
                  </div>
                </div>
              </div>

              {/* HR details */}
              <div>
                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3">HR & Compensation</h3>
                <div className="grid grid-cols-2 gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
                  <div>
                    <span className={labelStyle}>Date of Hire</span>
                    <span className={`${valueStyle} flex items-center gap-1.5`}><Calendar size={12} className="text-slate-500"/> {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : '—'}</span>
                  </div>
                  <div>
                    <span className={labelStyle}>Roster Status</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-1">
                      {employee.status || 'active'}
                    </span>
                  </div>
                  <div>
                    <span className={labelStyle}>Annual Base Salary</span>
                    <span className={`${valueStyle} text-orange-400 font-mono`}>₹{employee.salary ? Number(employee.salary).toLocaleString() : '0'}</span>
                  </div>
                  <div>
                    <span className={labelStyle}>Performance Rating</span>
                    <span className={`${valueStyle} flex items-center gap-1`}><Star size={12} className="fill-violet-400 text-violet-400"/> {employee.performance_score || '4.0'} / 5</span>
                  </div>
                  <div className="col-span-2">
                    <span className={labelStyle}>Direct Manager</span>
                    <span className={valueStyle}>{employee.manager_name || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {employee.skills && employee.skills.length > 0 && (
                <div>
                  <span className={labelStyle}>Skills & Badges</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {employee.skills.map(s => (
                      <span key={s} className="px-2.5 py-1 text-[10px] rounded-full bg-white/5 border border-white/10 text-slate-300 font-semibold uppercase tracking-wider">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : activeTab === 'documents' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* EXIT & ONBOARDING OFFICIAL DOCUMENTS VAULT */}
              <div>
                <h3 className="text-xs font-bold text-[#fc800f] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Award size={14} className="text-[#fc800f]" /> Official Exit & Joining Documents
                </h3>

                <div className="space-y-3">
                  {/* Experience Letter Card - ONLY VISIBLE FOR ALUMNI / OFFBOARDED STAFF */}
                  {employee.status?.toLowerCase() === 'alumni' && (
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                          <Award size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Experience Certificate / Offboarding Letter</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {expDoc ? expDoc.original_name : 'Generated during employee offboarding / exit.'}
                          </p>
                        </div>
                      </div>

                      {expDoc ? (
                        <Button 
                          size="sm"
                          variant="secondary" 
                          onClick={() => handleDownloadVaultDoc(expDoc)} 
                          icon={Download}
                          className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                        >
                          Download Letter
                        </Button>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Not generated during offboarding
                        </span>
                      )}
                    </div>
                  )}

                  {/* Joining Letter Card */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Joining / Offer Letter</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {joiningDoc ? joiningDoc.original_name : 'Generated during employee onboarding.'}
                        </p>
                      </div>
                    </div>

                    {joiningDoc ? (
                      <Button 
                        size="sm"
                        variant="secondary" 
                        onClick={() => handleDownloadVaultDoc(joiningDoc)} 
                        icon={Download}
                        className="text-xs text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                      >
                        Download Letter
                      </Button>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Not generated during onboarding
                      </span>
                    )}
                  </div>

                  {/* Resume / CV */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Resume / CV Document</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {employee.cv_filename ? employee.cv_filename.replace(`cv_${employee.id}_`, '') : 'Primary candidate resume file.'}
                        </p>
                      </div>
                    </div>

                    {employee.cv_filename ? (
                      <Button 
                        size="sm"
                        variant="secondary" 
                        onClick={handleDownloadCV} 
                        loading={downloading}
                        icon={Download}
                        className="text-xs text-violet-400 border-violet-500/30 hover:bg-violet-500/10"
                      >
                        Download
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Not Uploaded</span>
                    )}
                  </div>

                  {/* Other Vault Files */}
                  {documents.filter(d => d.id !== expDoc?.id && d.id !== joiningDoc?.id).map(docItem => (
                    <div key={docItem.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{docItem.document_type || 'Vault File'}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{docItem.original_name}</p>
                        </div>
                      </div>

                      <Button 
                        size="sm"
                        variant="secondary" 
                        onClick={() => handleDownloadVaultDoc(docItem)} 
                        icon={Download}
                        className="text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                      >
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* DIGITAL ID CARD */}
              <div>
                <h3 className="text-xs font-bold text-[#fc800f] uppercase tracking-wider mb-3">Digital ID Card</h3>
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
                  {/* ID Card Graphic */}
                  <div className="w-[216px] h-[342px] shrink-0 bg-[#373e48] rounded-2xl shadow-2xl overflow-hidden relative border border-white/10 flex flex-col items-center">
                    {/* Top Orange Header */}
                    <div className="w-full h-16 bg-[#fc800f] flex items-center justify-center p-3">
                      <img src={logoSrc} alt="Logo" className="max-h-8 object-contain rounded-md shadow-sm" />
                    </div>
                    <div className="absolute top-2 right-2 text-white/50 text-[8px] font-bold tracking-widest z-10">
                      ID
                    </div>

                    {/* Avatar Details */}
                    <div className="w-24 h-24 mt-6 bg-white rounded-2xl shadow-xl border-4 border-[#373e48] relative flex flex-col items-center justify-center overflow-hidden z-10 shrink-0">
                      {employee.profile_image_filename ? (
                        <img 
                          src={`http://localhost:8000/api/v1/uploads/${employee.profile_image_filename}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-black text-[#fc800f]">
                          {employee.first_name?.[0]}{employee.last_name?.[0]}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="text-center mt-4 px-4 w-full">
                      <h4 className="text-white font-bold text-lg leading-tight">{employee.first_name} {employee.last_name}</h4>
                      <p className="text-slate-400 text-xs font-medium mt-1">{employee.role}</p>
                      
                      <div className="mt-4 flex flex-col items-center gap-1">
                        <div className="bg-white/10 px-2 py-0.5 rounded text-[10px] text-white font-mono">
                          EMP-{employee.id.toString().padStart(4, '0')}
                        </div>
                        <div className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">
                          {employee.department}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Orange Footer */}
                    <div className="w-full h-10 bg-[#fc800f] absolute bottom-0 flex items-center justify-center px-4">
                      <span className="text-white text-[8px] font-bold tracking-widest uppercase text-center leading-tight">
                        Hash AI LLC
                      </span>
                    </div>
                  </div>

                  {/* ID Card Actions */}
                  <div className="flex-1 space-y-4 text-sm text-slate-300">
                    <p>Official digital identification card for <strong className="text-white">{employee.first_name}</strong>.</p>
                    <p className="text-slate-500 text-xs">Standard ID badge format (CR80, 2.125" x 3.375").</p>
                    
                    <Button 
                      variant="primary" 
                      onClick={handleDownloadIDCard} 
                      icon={Download}
                      className="mt-4 bg-[#fc800f] hover:bg-[#e0700d] border-[#fc800f] shadow-[0_0_15px_-3px_rgba(252,128,15,0.5)]"
                    >
                      Download ID Card (PDF)
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            renderAttendanceTab()
          )}
        </div>

      </div>
    </div>
  )
}
