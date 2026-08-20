import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Download, CheckCircle, FileText, UserCheck, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { employeesService } from '../services/employees';
import api from '../services/api';
import logoSrc from '../assets/logo.png';

export default function OnboardingPage() {
  const { user } = useAuth();
  const [employeesList, setEmployeesList] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');

  const [formData, setFormData] = useState({
    candidateName: '',
    email: '',
    jobTitle: '',
    department: '',
    compensation: '',
    joiningDate: '',
    reportingManager: '',
    signatoryName: 'Harshit Srivastava'
  });

  const adminName = formData.signatoryName || 'Harshit Srivastava';

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const data = await employeesService.list();
      setEmployeesList(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleSelectEmployeeChange = (e) => {
    const empId = e.target.value;
    setSelectedEmpId(empId);

    if (!empId) {
      setFormData({
        candidateName: '',
        email: '',
        jobTitle: '',
        department: '',
        compensation: '',
        joiningDate: '',
        reportingManager: ''
      });
      return;
    }

    const emp = employeesList.find(item => item.id.toString() === empId);
    if (emp) {
      setFormData({
        candidateName: `${emp.first_name} ${emp.last_name}`.trim(),
        email: emp.email || '',
        jobTitle: emp.role || '',
        department: emp.department || '',
        compensation: emp.salary || '',
        joiningDate: emp.hire_date ? emp.hire_date.substring(0, 10) : '',
        reportingManager: emp.manager_name || ''
      });
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generatePDF = async () => {
    if (!formData.candidateName.trim()) {
      alert('Please enter or select Candidate Name before generating onboarding letter.');
      return;
    }

    const loadImage = (src) => new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
      if (img.complete && img.naturalWidth > 0) {
        resolve(img);
      }
    });

    const imgElement = await loadImage(logoSrc);
    const doc = new jsPDF();
    
    // Header
    let textStartX = 14;
    if (imgElement && (imgElement.width || imgElement.naturalWidth)) {
        const w = imgElement.width || imgElement.naturalWidth;
        const h = imgElement.height || imgElement.naturalHeight;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgElement, 0, 0);
        const logoDataUrl = canvas.toDataURL('image/png');

        let imgWidth = 35;
        let imgHeight = (h * imgWidth) / w;
        if (imgHeight > 20) {
            imgHeight = 20;
            imgWidth = (w * imgHeight) / h;
        }

        doc.addImage(logoDataUrl, 'PNG', 14, 12, imgWidth, imgHeight);
        textStartX = 14 + imgWidth + 6;
    }

    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("Hash AI LLC", textStartX, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Offer of Employment", textStartX, 29);
    
    // Horizontal line
    doc.setDrawColor(220, 220, 220);
    doc.line(14, 45, 196, 45);

    // Date
    const today = format(new Date(), 'MMMM dd, yyyy');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(`Date: ${today}`, 14, 55);

    // Salutation
    doc.setFont("helvetica", "bold");
    doc.text(`Dear ${formData.candidateName || '[Candidate Name]'},`, 14, 70);

    // Body
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const bodyText = `We are thrilled to offer you the position of ${formData.jobTitle || '[Job Title]'} in the ${formData.department || '[Department]'} department at Hash AI LLC. We were extremely impressed with your skills and experience, and we believe you will be a valuable addition to our team.`;
    
    const splitBody = doc.splitTextToSize(bodyText, 175);
    doc.text(splitBody, 14, 80);

    // Terms
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text("Key Terms of Your Employment:", 14, 105);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(`1. Joining Date: You are expected to join on ${formData.joiningDate ? format(new Date(formData.joiningDate), 'MMMM dd, yyyy') : '[Date]'}.`, 19, 115);
    doc.text(`2. Compensation: Your annual base salary will be INR ${formData.compensation || '[Amount]'}, subject to statutory deductions.`, 19, 125);
    doc.text(`3. Reporting: You will be reporting to ${formData.reportingManager || '[Manager Name]'} for your day-to-day activities.`, 19, 135);
    
    const closingText = `Please sign and return a copy of this letter to indicate your acceptance of this offer. We look forward to welcoming you aboard and achieving great success together.`;
    const splitClosing = doc.splitTextToSize(closingText, 175);
    doc.text(splitClosing, 14, 155);

    // Signatures
    doc.text("Sincerely,", 14, 185);

    // Create signature image using Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.font = "42px 'Alex Brush', cursive, serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(adminName, 0, 50);
    const signatureDataUrl = canvas.toDataURL('image/png');

    doc.addImage(signatureDataUrl, 'PNG', 12, 185, 45, 15);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text(adminName, 14, 210);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text("Director / HR Head", 14, 215);
    doc.text("Hash AI LLC", 14, 220);

    doc.setTextColor(20, 20, 20);
    doc.text("Accepted By:", 120, 185);
    doc.setDrawColor(40, 40, 40);
    doc.line(120, 210, 180, 210);
    doc.setTextColor(60, 60, 60);
    doc.text("Signature", 120, 217);
    doc.text("Date", 170, 217);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("This is an official document of Hash AI LLC.", 14, 280);

    // Save PDF locally
    const pdfFilename = `Offer_Letter_${formData.candidateName?.replace(/\s+/g, '_') || 'Draft'}.pdf`;
    const generatedBlob = doc.output('blob');
    doc.save(pdfFilename);

    // Save Joining Letter PDF into specific candidate's Document Vault
    try {
      let targetEmpId = selectedEmpId;

      if (!targetEmpId) {
        const names = formData.candidateName.split(' ');
        const firstName = names[0] || 'New';
        const lastName = names.slice(1).join(' ') || 'Employee';
        
        const createdEmp = await employeesService.create({
          first_name: firstName,
          last_name: lastName,
          email: formData.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@hash.in`,
          role: formData.jobTitle || 'New Hire',
          department: formData.department || 'General',
          salary: formData.compensation || 0,
          hire_date: formData.joiningDate || new Date().toISOString(),
          manager_name: formData.reportingManager,
          status: 'active',
          location: 'Remote'
        });

        if (createdEmp && createdEmp.id) {
          targetEmpId = createdEmp.id;
        }
      }

      if (targetEmpId && generatedBlob) {
        const uploadData = new FormData();
        uploadData.append('employee_id', targetEmpId);
        uploadData.append('document_type', 'Joining Letter');
        uploadData.append('file', generatedBlob, pdfFilename);

        await api.post('/documents/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      alert(`Onboarding letter generated and automatically saved to Document Vault for ${formData.candidateName}!`);
      fetchEmployees();
    } catch (err) {
      console.error('Failed to sync onboarding letter to document vault:', err);
      alert('Onboarding letter generated and downloaded, but failed to save to candidate vault. Please ensure required candidate fields are valid.');
    }
  };

  return (
    <div className="p-8 relative z-10 w-full min-h-screen font-sans flex flex-col">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="mb-10">
        <h1 className="text-4xl font-black italic tracking-tighter text-white mb-2 flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 border border-blue-500/20">
            <UserPlus size={28} />
          </div>
          Onboarding Hub
        </h1>
        <p className="text-sm font-medium text-slate-400 tracking-wide">Generate offer letters and manage new hires</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        {/* Form Section */}
        <div className="w-full lg:w-1/3 bg-[#0a0a0c] border border-white/5 rounded-3xl p-8 backdrop-blur-xl h-fit shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
          
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="text-blue-500" />
            Offer Letter Details
          </h2>

          <div className="space-y-5 relative z-10">
            
            {/* Existing Candidate Dropdown */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
                <UserCheck size={13} className="text-blue-400" /> Select Existing Candidate (Optional)
              </label>
              {loadingEmployees ? (
                <div className="text-xs text-slate-500 flex items-center gap-2 py-2">
                  <Loader2 size={14} className="animate-spin" /> Loading candidates...
                </div>
              ) : (
                <select 
                  value={selectedEmpId} 
                  onChange={handleSelectEmployeeChange}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="" className="bg-[#0f0f11]">-- Create New Candidate / Select Existing --</option>
                  {employeesList.map(emp => (
                    <option key={emp.id} value={emp.id} className="bg-[#0f0f11]">
                      {emp.first_name} {emp.last_name} ({emp.role || 'Hire'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Candidate Full Name *</label>
              <input type="text" name="candidateName" value={formData.candidateName} onChange={handleChange} placeholder="e.g. Jane Doe" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. jane@example.com" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Job Title</label>
              <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="e.g. Senior Developer" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Engineering" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Annual Compensation (₹)</label>
              <input type="number" name="compensation" value={formData.compensation} onChange={handleChange} placeholder="e.g. 1500000" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Joining Date</label>
              <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 color-scheme-dark" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Reporting Manager</label>
              <input type="text" name="reportingManager" value={formData.reportingManager} onChange={handleChange} placeholder="e.g. John Smith" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Admin / Signatory Name</label>
              <input type="text" name="signatoryName" value={formData.signatoryName} onChange={handleChange} placeholder="Harshit Srivastava" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50" />
            </div>

            <button onClick={generatePDF} className="w-full mt-4 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl flex justify-center items-center gap-2 transition-all shadow-[0_0_20px_-5px_#3b82f6]">
              <Download size={18} />
              Generate & Save to Vault
            </button>
          </div>
        </div>

        {/* Live Preview Section */}
        <div className="w-full lg:w-2/3 bg-white text-[#3c3c3c] p-10 rounded-3xl shadow-xl h-fit min-h-[600px] font-sans">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <img src={logoSrc} alt="Hash# Logo" className="h-10 object-contain" />
            <div>
              <h1 className="text-2xl font-semibold text-[#282828]">Hash AI LLC</h1>
              <p className="text-sm text-[#646464]">Offer of Employment</p>
            </div>
          </div>
          
          <div className="w-full h-px bg-[#dcdcdc] mb-6"></div>

          <div className="space-y-6 text-[15px]">
            <div className="flex justify-between text-[#141414]">
              <span>Date: {format(new Date(), 'MMMM dd, yyyy')}</span>
            </div>

            <div className="pt-2">
              <p className="font-bold text-[#141414]">Dear {formData.candidateName || '[Candidate Name]'},</p>
            </div>

            <p className="leading-relaxed text-justify">
              We are thrilled to offer you the position of <span className="font-semibold bg-blue-100 px-1">{formData.jobTitle || '[Job Title]'}</span> in the <span className="font-semibold bg-blue-100 px-1">{formData.department || '[Department]'}</span> department at Hash AI LLC. We were extremely impressed with your skills and experience, and we believe you will be a valuable addition to our team.
            </p>

            <div className="space-y-2">
              <p className="font-bold text-[#141414]">Key Terms of Your Employment:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Joining Date: <span className="font-semibold">{formData.joiningDate ? format(new Date(formData.joiningDate), 'MMMM dd, yyyy') : '[Date]'}</span></li>
                <li>Compensation: <span className="font-semibold">INR {formData.compensation ? Number(formData.compensation).toLocaleString() : '[Amount]'}</span> per annum</li>
                <li>Reporting Manager: <span className="font-semibold">{formData.reportingManager || '[Manager Name]'}</span></li>
              </ul>
            </div>

            <p className="leading-relaxed text-justify">
              Please sign and return a copy of this letter to indicate your acceptance of this offer. We look forward to welcoming you aboard and achieving great success together.
            </p>

            <div className="pt-12">
              <p className="text-[#141414]">Sincerely,</p>
              <div className="h-16 flex items-end">
                <p className="font-signature text-4xl text-slate-900 -rotate-3 -ml-2">{adminName}</p>
              </div>
              <p className="font-bold text-[#141414] mt-1">{adminName}</p>
              <p>Director / HR Head</p>
            </div>

            {/* Footer */}
            <div className="pt-12 text-sm text-[#969696]">
              This is an official document of Hash AI LLC.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
