import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserMinus, Download, FileText, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { employeesService } from '../services/employees';
import api from '../services/api';
import { useBranding } from '../context/BrandingContext';

// Simplified Glass Theme
const glassCardStyle = "bg-white/80 border border-slate-200 shadow-sm backdrop-blur-lg rounded-2xl";

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function OffboardingPage() {
  const { documentLogoUrl: logoSrc, companyName, contactLine } = useBranding();
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    employeeId: '',
    lastWorkingDay: '',
    conduct: 'excellent',
    reason: 'resignation',
    signatoryName: 'Harshit Srivastava'
  });

  const adminName = formData.signatoryName || 'Harshit Srivastava';

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await employeesService.list({ status: 'active' });
      setEmployees(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const selectedEmployee = employees.find(e => e.id.toString() === formData.employeeId);

  const generatePDF = async () => {
    if (!selectedEmployee) return;

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
    doc.text("Experience Certificate", textStartX, 29);

    // Horizontal line
    doc.setDrawColor(220, 220, 220);
    doc.line(14, 45, 196, 45);

    // Date
    const today = format(new Date(), 'MMMM dd, yyyy');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(`Date: ${today}`, 14, 55);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("To Whomsoever It May Concern,", 14, 75);

    // Body
    const joinDate = selectedEmployee.hire_date ? format(new Date(selectedEmployee.hire_date), 'MMMM dd, yyyy') : '[Join Date]';
    const lastDay = formData.lastWorkingDay ? format(new Date(formData.lastWorkingDay), 'MMMM dd, yyyy') : '[Last Working Day]';

    let bodyText = `This is to certify that ${selectedEmployee.first_name} ${selectedEmployee.last_name} was employed with ${companyName} from ${joinDate} to ${lastDay}. During this tenure, they held the position of ${selectedEmployee.role || selectedEmployee.position || '[Role]'}.`;

    if (formData.conduct === 'excellent') {
      bodyText += `\n\nDuring their employment, we found them to be a dedicated, hardworking, and highly motivated professional. They consistently delivered excellent results and were a valuable member of our team.`;
    } else if (formData.conduct === 'good') {
      bodyText += `\n\nDuring their employment, they fulfilled their responsibilities well and maintained a good professional standard.`;
    }

    if (formData.reason === 'resignation') {
      bodyText += `\n\nThey are leaving the organization on their own accord. We wish them all the best in their future endeavors.`;
    } else {
      bodyText += `\n\nWe wish them success in their future endeavors.`;
    }

    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const splitBody = doc.splitTextToSize(bodyText, 175);
    doc.text(splitBody, 14, 85);

    // Signatures
    doc.setTextColor(20, 20, 20);
    doc.text(`For ${companyName},`, 14, 150);

    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.font = "42px 'Alex Brush', cursive, serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(adminName, 0, 50);
    const signatureDataUrl = canvas.toDataURL('image/png');

    doc.addImage(signatureDataUrl, 'PNG', 12, 155, 45, 15);

    doc.setFont("helvetica", "bold");
    doc.text(adminName, 14, 175);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text("Director / HR Head", 14, 180);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`This is an official document of ${companyName}.`, 14, 280);
    if (contactLine) doc.text(doc.splitTextToSize(contactLine, 182), 14, 285);

    const pdfFilename = `Experience_Certificate_${selectedEmployee.first_name}_${selectedEmployee.last_name}.pdf`;
    const pdfBlob = doc.output('blob');
    doc.save(pdfFilename);

    try {
      const formDataPayload = new FormData();
      formDataPayload.append('employee_id', selectedEmployee.id);
      formDataPayload.append('document_type', 'Experience Letter');
      formDataPayload.append('file', pdfBlob, pdfFilename);

      await api.post('/documents/upload', formDataPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (uploadErr) {
      console.error('Failed to auto-save Experience Letter to vault:', uploadErr);
    }

    try {
      await employeesService.update(selectedEmployee.id, {
        status: 'alumni'
      });
      alert('Experience letter generated and employee moved to Alumni section successfully!');
      fetchEmployees();
    } catch (err) {
      console.error('Failed to update employee status:', err);
      alert('Experience letter generated, but failed to sync status to Employee Directory.');
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
            <UserMinus size={14} className="text-blue-600" />
            <span className="uppercase tracking-widest">Recruitment & Staffing</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Offboarding <span className="text-blue-600">Hub</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">Generate experience letters and manage exits</p>
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
              <h2 className="text-lg font-bold text-slate-900">Exit Details</h2>
              <p className="text-xs text-slate-500">Configure separation details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Employee</label>
              {loading ? (
                <div className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 flex items-center gap-2 text-slate-500 text-sm">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                  Loading active network...
                </div>
              ) : (
                <select name="employeeId" value={formData.employeeId} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20">
                  <option value="">-- Select Active Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.role})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Last Working Day</label>
              <input type="date" name="lastWorkingDay" value={formData.lastWorkingDay} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Conduct/Performance</label>
              <select name="conduct" value={formData.conduct} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20">
                <option value="excellent">Excellent / Highly Recommended</option>
                <option value="good">Good / Satisfactory</option>
                <option value="standard">Standard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Reason for Exit</label>
              <select name="reason" value={formData.reason} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20">
                <option value="resignation">Resignation</option>
                <option value="termination">Termination / Layoff</option>
                <option value="contract_end">Contract Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Admin / Signatory Name</label>
              <input type="text" name="signatoryName" value={formData.signatoryName} onChange={handleChange} placeholder="Harshit Srivastava" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20" />
            </div>

            <button onClick={generatePDF} disabled={!selectedEmployee} className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold text-sm rounded-xl flex justify-center items-center gap-2 transition-all shadow-sm">
              <Download size={16} />
              Download PDF
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
                <p className="text-xs text-slate-500">Experience Certificate</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">Live Preview</span>
          </div>

          <div className="space-y-6 text-sm">
            <div className="flex justify-between text-slate-700 font-medium">
              <span>Date: {format(new Date(), 'MMMM dd, yyyy')}</span>
            </div>

            <div className="pt-2">
              <p className="font-bold text-slate-900">To Whomsoever It May Concern,</p>
            </div>

            {selectedEmployee ? (
              <div className="space-y-4">
                <p className="leading-relaxed text-slate-600 text-justify">
                  This is to certify that <span className="font-semibold text-blue-700 bg-blue-50 px-1 py-0.5 rounded">{selectedEmployee.first_name} {selectedEmployee.last_name}</span> was employed with {companyName} from <span className="font-semibold text-slate-800">{selectedEmployee.date_of_joining ? format(new Date(selectedEmployee.date_of_joining), 'MMMM dd, yyyy') : '[Join Date]'}</span> to <span className="font-semibold text-slate-800">{formData.lastWorkingDay ? format(new Date(formData.lastWorkingDay), 'MMMM dd, yyyy') : '[Last Working Day]'}</span>. During this tenure, they held the position of <span className="font-semibold text-blue-700 bg-blue-50 px-1 py-0.5 rounded">{selectedEmployee.role || selectedEmployee.position || '[Role]'}</span>.
                </p>

                {formData.conduct === 'excellent' && (
                  <p className="leading-relaxed text-slate-600 text-justify">
                    During their employment, we found them to be a dedicated, hardworking, and highly motivated professional. They consistently delivered excellent results and were a valuable member of our team.
                  </p>
                )}
                {formData.conduct === 'good' && (
                  <p className="leading-relaxed text-slate-600 text-justify">
                    During their employment, they fulfilled their responsibilities well and maintained a good professional standard.
                  </p>
                )}

                <p className="leading-relaxed text-slate-600 text-justify">
                  {formData.reason === 'resignation'
                    ? 'They are leaving the organization on their own accord. We wish them all the best in their future endeavors.'
                    : 'We wish them success in their future endeavors.'}
                </p>
              </div>
            ) : (
              <div className="text-slate-400 italic text-center py-20 border-2 border-dashed border-slate-200 rounded-xl">
                Please select an employee to generate the experience letter preview.
              </div>
            )}

            <div className="pt-8 border-t border-slate-100">
              <p className="text-slate-900">For {companyName},</p>
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