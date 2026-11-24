import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Download, CheckCircle, FileText, UserCheck, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { employeesService } from '../services/employees';
import api from '../services/api';
import { useBranding } from '../context/BrandingContext';

// Simplified Glass Theme Glassmorphisom we call it .CognitiveEMS
const glassCardStyle = "bg-white/80 border border-slate-200 shadow-sm backdrop-blur-lg rounded-2xl";
const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function OnboardingPage() {
  const { documentLogoUrl: logoSrc, companyName, contactLine } = useBranding();
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
    doc.text(companyName, textStartX, 22);

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
    const bodyText = `We are thrilled to offer you the position of ${formData.jobTitle || '[Job Title]'} in the ${formData.department || '[Department]'} department at ${companyName}. We were extremely impressed with your skills and experience, and we believe you will be a valuable addition to our team.`;
    
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
    doc.text(companyName, 14, 220);

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
    doc.text(`This is an official document of ${companyName}.`, 14, 280);
    if (contactLine) doc.text(doc.splitTextToSize(contactLine, 182), 14, 285);

    const pdfFilename = `Offer_Letter_${formData.candidateName?.replace(/\s+/g, '_') || 'Draft'}.pdf`;
    const generatedBlob = doc.output('blob');
    doc.save(pdfFilename);

    try {
      let targetEmpId = selectedEmpId;

      if (!targetEmpId) {
        const names = formData.candidateName.split(' ');
        const firstName = names[0] || 'New';
        const lastName = names.slice(1).join(' ') || 'Employee';
        
        const createdEmp = await employeesService.create({
          first_name: firstName,
          last_name: lastName,
          email: formData.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@cognitiveems.com`,
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
    <motion.div 
      className="w-full h-full p-6 lg:p-10 text-slate-900 space-y-8 pb-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* HEADER SECTION */}
      <motion.div variants={containerVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs font-semibold">
            <UserPlus size={14} className="text-blue-600" />
            <span className="uppercase tracking-widest">Recruitment & Staffing</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Onboarding <span className="text-blue-600">Hub</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">Generate offer letters and manage new hires</p>
        </div>
      </motion.div>

      {/* MAIN CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Section */}
        <motion.div variants={containerVariants} className={`lg:col-span-5 ${glassCardStyle} p-6 md:p-8 space-y-6 h-fit shadow-sm`}>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Offer Letter Details</h2>
              <p className="text-xs text-slate-500">Configure candidate specifications</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <UserCheck size={14} className="text-blue-600" /> Select Existing Candidate (Optional)
              </label>
              {loadingEmployees ? (
                <div className="text-xs text-slate-500 flex items-center gap-2 py-2">
                  <Loader2 size={14} className="animate-spin text-blue-600" /> Loading candidates...
                </div>
              ) : (
                <select 
                  value={selectedEmpId} 
                  onChange={handleSelectEmployeeChange}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                >
                  <option value="">-- Create New Candidate / Select Existing --</option>
                  {employeesList.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.role || 'Hire'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Candidate Full Name *</label>
              <input type="text" name="candidateName" value={formData.candidateName} onChange={handleChange} placeholder="e.g. Jane Doe" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. jane@example.com" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Job Title</label>
              <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="e.g. Senior Developer" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Engineering" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Annual Compensation (₹)</label>
              <input type="number" name="compensation" value={formData.compensation} onChange={handleChange} placeholder="e.g. 1500000" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Joining Date</label>
              <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Reporting Manager</label>
              <input type="text" name="reportingManager" value={formData.reportingManager} onChange={handleChange} placeholder="e.g. John Smith" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Admin / Signatory Name</label>
              <input type="text" name="signatoryName" value={formData.signatoryName} onChange={handleChange} placeholder="Harshit Srivastava" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20" />
            </div>

            <button onClick={generatePDF} className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex justify-center items-center gap-2 transition-all shadow-sm">
              <Download size={16} />
              Generate & Save to Vault
            </button>
          </div>
        </motion.div>

        {/* Live Preview Section */}
        <motion.div variants={containerVariants} className={`lg:col-span-7 ${glassCardStyle} p-8 md:p-10 text-slate-800 h-fit min-h-[600px] shadow-sm`}>
          <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <img src={logoSrc} alt={`${companyName} logo`} className="h-8 object-contain" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">{companyName}</h1>
                <p className="text-xs text-slate-500">Offer of Employment</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">Live Preview</span>
          </div>

          <div className="space-y-6 text-sm">
            <div className="flex justify-between text-slate-700 font-medium">
              <span>Date: {format(new Date(), 'MMMM dd, yyyy')}</span>
            </div>

            <div className="pt-2">
              <p className="font-bold text-slate-900">Dear {formData.candidateName || '[Candidate Name]'},</p>
            </div>

            <p className="leading-relaxed text-slate-600 text-justify">
              We are thrilled to offer you the position of <span className="font-semibold text-blue-700 bg-blue-50 px-1 py-0.5 rounded">{formData.jobTitle || '[Job Title]'}</span> in the <span className="font-semibold text-blue-700 bg-blue-50 px-1 py-0.5 rounded">{formData.department || '[Department]'}</span> department at {companyName}. We were extremely impressed with your skills and experience, and we believe you will be a valuable addition to our team.
            </p>

            <div className="space-y-2 bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
              <p className="font-bold text-slate-900 uppercase tracking-wider text-xs">Key Terms of Your Employment:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Joining Date: <span className="font-semibold text-slate-800">{formData.joiningDate ? format(new Date(formData.joiningDate), 'MMMM dd, yyyy') : '[Date]'}</span></li>
                <li>Compensation: <span className="font-semibold text-slate-800">INR {formData.compensation ? Number(formData.compensation).toLocaleString() : '[Amount]'}</span> per annum</li>
                <li>Reporting Manager: <span className="font-semibold text-slate-800">{formData.reportingManager || '[Manager Name]'}</span></li>
              </ul>
            </div>

            <p className="leading-relaxed text-slate-600 text-justify">
              Please sign and return a copy of this letter to indicate your acceptance of this offer. We look forward to welcoming you aboard and achieving great success together.
            </p>

            <div className="pt-8 border-t border-slate-100">
              <p className="text-slate-900">Sincerely,</p>
              <div className="h-14 flex items-end">
                <p className="font-signature text-3xl text-slate-900 -rotate-3 -ml-1">{adminName}</p>
              </div>
              <p className="font-bold text-slate-900 mt-1">{adminName}</p>
              <p className="text-xs text-slate-500">Director / HR Head</p>
            </div>

            <div className="pt-6 text-xs text-slate-400 border-t border-slate-100">
              This is an official document of {companyName}.
              {contactLine && <p className="mt-1">{contactLine}</p>}
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}