import { useState, useEffect } from 'react'
import { X, Mail, Phone, MapPin, Calendar, Star, Award, FileText, Download, ChevronLeft, ChevronRight, Shield } from 'lucide-react'
import { jsPDF } from 'jspdf'
import api from '../../services/api'
import { attendanceService } from '../../services/employees'
import logoSrc from '../../assets/logo.png'

const labelStyle = "text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5"
const valueStyle = "text-sm text-slate-800 font-medium"

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

      doc.setFillColor(37, 99, 235);
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
      doc.setDrawColor(203, 213, 225);
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
        doc.setTextColor(37, 99, 235);
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

      doc.setFillColor(37, 99, 235);
      doc.rect(0, 77.6, 54, 8, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5);
      doc.text("HASH# SOLUTIONS", 27, 82, { align: 'center' });

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

    const prevMonth = () => setCalendarDate(new Date(year, month - 1, 1))
    const nextMonth = () => setCalendarDate(new Date(year, month + 1, 1))

    const getDayStatus = (dateStr) => attendanceRecords.find(r => r.date === dateStr)

    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
          <div className="flex items-center gap-2">
            <Calendar className="text-emerald-600" size={18} />
            <h3 className="text-sm font-bold text-slate-900">
              {monthNames[month]} {year}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-sm">
              <ChevronLeft size={16} />
            </button>
            <button onClick={nextMonth} className="p-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-sm">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <span key={d} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((d, index) => {
              const record = getDayStatus(d.dateString)
              const status = record?.status
              const joinDateStr = employee.hire_date ? employee.hire_date.substring(0, 10) : null
              const isPreJoining = Boolean(joinDateStr && d.dateString < joinDateStr)

              let statusClass = "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
              
              if (!d.isCurrentMonth) {
                statusClass = "text-slate-300 pointer-events-none opacity-30 border-transparent bg-transparent"
              } else if (isPreJoining) {
                statusClass = "bg-slate-100/50 border-dashed border-slate-200 text-slate-400 opacity-40 cursor-not-allowed"
              } else if (status === 'present') {
                statusClass = "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold"
              } else if (status === 'absent') {
                statusClass = "bg-red-50 border-red-200 text-red-700 font-bold"
              } else if (status === 'late') {
                statusClass = "bg-amber-50 border-amber-200 text-amber-700 font-bold"
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
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center text-xs transition-all relative shadow-sm ${statusClass}`}
                >
                  <span>{d.day}</span>
                  {!isPreJoining && status && (
                    <span className={`w-1 h-1 rounded-full absolute bottom-1 ${
                      status === 'present' ? 'bg-emerald-500' :
                      status === 'absent' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-500 pt-2 border-t border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-100 border border-emerald-300" />
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-100 border border-red-300" />
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-100 border border-amber-300" />
            <span>Late</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-200" />
            <span>No Log</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-100 border border-dashed border-slate-300" />
            <span>Pre-Joining</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300 px-4">
      {/* Expanded Modal Width to accommodate horizontal layout */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col text-slate-900">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/60 flex items-center justify-center text-blue-700 font-bold text-sm shadow-sm">
              {employee.first_name?.[0] || ''}{employee.last_name?.[0] || ''}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {employee.first_name} {employee.last_name}
              </h2>
              <span className="text-xs text-slate-500 font-medium">{employee.role} • {employee.department}</span>
            </div>
          </div>
          
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/60 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'profile' 
                ? 'border-blue-600 text-blue-600 bg-white/50' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Profile Details
          </button>
          
          <button 
            onClick={() => setActiveTab('documents')} 
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'documents' 
                ? 'border-blue-600 text-blue-600 bg-white/50' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Documents Vault
          </button>

          {showAttendanceOption && (
            <button 
              onClick={() => setActiveTab('attendance')} 
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'attendance' 
                  ? 'border-blue-600 text-blue-600 bg-white/50' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Attendance
            </button>
          )}
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {activeTab === 'profile' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Contact Information */}
              <div>
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Shield size={14} /> Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                  <div>
                    <span className={labelStyle}>Email Address</span>
                    <span className={`${valueStyle} flex items-center gap-1.5 truncate`}><Mail size={12} className="text-slate-400 shrink-0"/> {employee.email}</span>
                  </div>
                  <div>
                    <span className={labelStyle}>Phone Number</span>
                    <span className={`${valueStyle} flex items-center gap-1.5`}><Phone size={12} className="text-slate-400 shrink-0"/> {employee.phone || '—'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className={labelStyle}>Office Location</span>
                    <span className={`${valueStyle} flex items-center gap-1.5`}><MapPin size={12} className="text-slate-400 shrink-0"/> {employee.location || 'Remote'}</span>
                  </div>
                </div>
              </div>

              {/* HR & Compensation */}
              <div>
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2.5">HR & Compensation</h3>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                  <div>
                    <span className={labelStyle}>Date of Hire</span>
                    <span className={`${valueStyle} flex items-center gap-1.5`}><Calendar size={12} className="text-slate-400 shrink-0"/> {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : '—'}</span>
                  </div>
                  <div>
                    <span className={labelStyle}>Roster Status</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 border border-emerald-200/60 text-emerald-700 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {employee.status || 'active'}
                    </span>
                  </div>
                  <div>
                    <span className={labelStyle}>Annual Base Salary</span>
                    <span className={`${valueStyle} text-blue-600 font-mono font-bold`}>₹{employee.salary ? Number(employee.salary).toLocaleString() : '0'}</span>
                  </div>
                  <div>
                    <span className={labelStyle}>Performance Rating</span>
                    <span className={`${valueStyle} flex items-center gap-1`}><Star size={12} className="fill-emerald-500 text-emerald-500"/> {employee.performance_score || '4.0'} / 5</span>
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
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {employee.skills.map(s => (
                      <span key={s} className="px-3 py-1 text-[11px] rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 font-semibold tracking-wide">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : activeTab === 'documents' ? (
            /* HORIZONTAL 2-COLUMN LAYOUT FOR DOCUMENTS VAULT */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300 items-start">
              
              {/* LEFT COLUMN: Official Exit & Joining Documents List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Award size={14} /> Official & Vault Documents
                </h3>

                {employee.status?.toLowerCase() === 'alumni' && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-600">
                        <Award size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Experience Certificate</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{expDoc ? expDoc.original_name : 'Offboarding record'}</p>
                      </div>
                    </div>
                    {expDoc ? (
                      <button onClick={() => handleDownloadVaultDoc(expDoc)} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1">
                        <Download size={12} /> Get
                      </button>
                    ) : (
                      <span className="text-[9px] font-semibold text-slate-400 uppercase">N/A</span>
                    )}
                  </div>
                )}

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-600">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Joining / Offer Letter</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{joiningDoc ? joiningDoc.original_name : 'Onboarding record'}</p>
                    </div>
                  </div>
                  {joiningDoc ? (
                    <button onClick={() => handleDownloadVaultDoc(joiningDoc)} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1">
                      <Download size={12} /> Get
                    </button>
                  ) : (
                    <span className="text-[9px] font-semibold text-slate-400 uppercase">N/A</span>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-600">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Resume / CV</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{employee.cv_filename ? employee.cv_filename.replace(`cv_${employee.id}_`, '') : 'Candidate file'}</p>
                    </div>
                  </div>
                  {employee.cv_filename ? (
                    <button onClick={handleDownloadCV} disabled={downloading} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1">
                      <Download size={12} /> Get
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Empty</span>
                  )}
                </div>

                {documents.filter(d => d.id !== expDoc?.id && d.id !== joiningDoc?.id).map(docItem => (
                  <div key={docItem.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{docItem.document_type || 'Vault File'}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{docItem.original_name}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDownloadVaultDoc(docItem)} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1">
                      <Download size={12} /> Get
                    </button>
                  </div>
                ))}
              </div>

              {/* RIGHT COLUMN: Compact Digital ID Card Preview */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Digital ID Card</h3>
                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex flex-col items-center text-center">
                  
                  {/* Compact ID Graphic */}
                  <div className="w-[150px] h-[238px] bg-slate-900 rounded-xl shadow-md overflow-hidden relative border border-slate-200 flex flex-col items-center mb-4">
                    <div className="w-full h-12 bg-blue-600 flex items-center justify-center p-2">
                      <img src={logoSrc} alt="Logo" className="max-h-6 object-contain rounded-sm" />
                    </div>
                    
                    <div className="w-16 h-16 mt-3 bg-white rounded-xl shadow border-2 border-slate-900 relative flex flex-col items-center justify-center overflow-hidden z-10 shrink-0">
                      {employee.profile_image_filename ? (
                        <img 
                          src={`http://localhost:8000/api/v1/uploads/${employee.profile_image_filename}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-black text-blue-600">
                          {employee.first_name?.[0]}{employee.last_name?.[0]}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 px-2 w-full">
                      <h4 className="text-white font-bold text-xs truncate">{employee.first_name} {employee.last_name}</h4>
                      <p className="text-slate-400 text-[10px] truncate">{employee.role}</p>
                      
                      <div className="mt-2 inline-block bg-white/10 px-1.5 py-0.5 rounded text-[9px] text-white font-mono">
                        EMP-{employee.id.toString().padStart(4, '0')}
                      </div>
                    </div>

                    <div className="w-full h-7 bg-blue-600 absolute bottom-0 flex items-center justify-center">
                      <span className="text-white text-[7px] font-bold tracking-widest uppercase">
                        HASH# SOLUTIONS
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={handleDownloadIDCard} 
                    disabled={downloading}
                    className="w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Download size={14} /> Download ID Card (PDF)
                  </button>
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