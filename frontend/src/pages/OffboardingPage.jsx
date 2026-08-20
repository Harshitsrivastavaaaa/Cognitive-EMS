import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserMinus, Download, FileText, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { employeesService } from '../services/employees';
import api from '../services/api';
import logoSrc from '../assets/logo.png';

export default function OffboardingPage() {
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
    doc.text("Hash AI LLC", textStartX, 22);

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

    let bodyText = `This is to certify that ${selectedEmployee.first_name} ${selectedEmployee.last_name} was employed with Hash AI LLC from ${joinDate} to ${lastDay}. During this tenure, they held the position of ${selectedEmployee.role || selectedEmployee.position || '[Role]'}.`;

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
    doc.text("For Hash AI LLC,", 14, 150);

    // Create signature image using Canvas
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
    doc.text("This is an official document of Hash AI LLC.", 14, 280);

    // Save PDF locally
    const pdfFilename = `Experience_Certificate_${selectedEmployee.first_name}_${selectedEmployee.last_name}.pdf`;
    const pdfBlob = doc.output('blob');
    doc.save(pdfFilename);

    // Auto-upload Experience Letter PDF to Document Vault for this employee
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

    // Mark as Alumni in Employee Directory
    try {
      await employeesService.update(selectedEmployee.id, {
        status: 'alumni'
      });
      alert('Experience letter generated and employee moved to Alumni section successfully!');
      fetchEmployees(); // Refresh list to remove the offboarded employee
    } catch (err) {
      console.error('Failed to update employee status:', err);
      alert('Experience letter generated, but failed to sync status to Employee Directory.');
    }
  };

  return (
    <div className="p-8 relative z-10 w-full min-h-screen font-sans flex flex-col">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="mb-10">
        <h1 className="text-4xl font-black italic tracking-tighter text-white mb-2 flex items-center gap-4">
          <div className="p-3 bg-rose-500/20 rounded-2xl text-rose-400 border border-rose-500/20">
            <UserMinus size={28} />
          </div>
          Offboarding Hub
        </h1>
        <p className="text-sm font-medium text-slate-400 tracking-wide">Generate experience letters and manage exits</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        {/* Form Section */}
        <div className="w-full lg:w-1/3 bg-[#0a0a0c] border border-white/5 rounded-3xl p-8 backdrop-blur-xl h-fit shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px]" />

          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="text-rose-500" />
            Exit Details
          </h2>

          <div className="space-y-5 relative z-10">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Select Employee</label>
              {loading ? (
                <div className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2 text-slate-400 text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Loading active network...
                </div>
              ) : (
                <select name="employeeId" value={formData.employeeId} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500/50">
                  <option value="" className="bg-[#0f0f11]">-- Select Active Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id} className="bg-[#0f0f11]">
                      {emp.first_name} {emp.last_name} ({emp.role})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Last Working Day</label>
              <input type="date" name="lastWorkingDay" value={formData.lastWorkingDay} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-rose-500/50 color-scheme-dark" />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Conduct/Performance</label>
              <select name="conduct" value={formData.conduct} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500/50">
                <option value="excellent" className="bg-[#0f0f11]">Excellent / Highly Recommended</option>
                <option value="good" className="bg-[#0f0f11]">Good / Satisfactory</option>
                <option value="standard" className="bg-[#0f0f11]">Standard</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Reason for Exit</label>
              <select name="reason" value={formData.reason} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500/50">
                <option value="resignation" className="bg-[#0f0f11]">Resignation</option>
                <option value="termination" className="bg-[#0f0f11]">Termination / Layoff</option>
                <option value="contract_end" className="bg-[#0f0f11]">Contract Completed</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Admin / Signatory Name</label>
              <input type="text" name="signatoryName" value={formData.signatoryName} onChange={handleChange} placeholder="Harshit Srivastava" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500/50" />
            </div>

            <button onClick={generatePDF} disabled={!selectedEmployee} className="w-full mt-4 py-4 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:hover:bg-rose-500 text-white font-bold rounded-xl flex justify-center items-center gap-2 transition-all shadow-[0_0_20px_-5px_#f43f5e]">
              <Download size={18} />
              Download PDF
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
              <p className="text-sm text-[#646464]">Experience Certificate</p>
            </div>
          </div>

          <div className="w-full h-px bg-[#dcdcdc] mb-6"></div>

          <div className="space-y-6 text-[15px]">
            <div className="flex justify-between text-[#141414]">
              <span>Date: {format(new Date(), 'MMMM dd, yyyy')}</span>
            </div>

            <div className="pt-2">
              <p className="font-bold text-[#141414]">To Whomsoever It May Concern,</p>
            </div>

            {selectedEmployee ? (
              <>
                <p className="leading-relaxed text-justify">
                  This is to certify that <span className="font-semibold bg-rose-100 px-1">{selectedEmployee.first_name} {selectedEmployee.last_name}</span> was employed with Hash AI LLC from <span className="font-semibold bg-rose-100 px-1">{selectedEmployee.date_of_joining ? format(new Date(selectedEmployee.date_of_joining), 'MMMM dd, yyyy') : '[Join Date]'}</span> to <span className="font-semibold bg-rose-100 px-1">{formData.lastWorkingDay ? format(new Date(formData.lastWorkingDay), 'MMMM dd, yyyy') : '[Last Working Day]'}</span>. During this tenure, they held the position of <span className="font-semibold bg-rose-100 px-1">{selectedEmployee.role || selectedEmployee.position || '[Role]'}</span>.
                </p>

                {formData.conduct === 'excellent' && (
                  <p className="leading-relaxed text-justify">
                    During their employment, we found them to be a dedicated, hardworking, and highly motivated professional. They consistently delivered excellent results and were a valuable member of our team.
                  </p>
                )}
                {formData.conduct === 'good' && (
                  <p className="leading-relaxed text-justify">
                    During their employment, they fulfilled their responsibilities well and maintained a good professional standard.
                  </p>
                )}

                <p className="leading-relaxed text-justify">
                  {formData.reason === 'resignation'
                    ? 'They are leaving the organization on their own accord. We wish them all the best in their future endeavors.'
                    : 'We wish them success in their future endeavors.'}
                </p>
              </>
            ) : (
              <div className="text-slate-400 italic text-center py-20 border-2 border-dashed border-slate-200 rounded-xl">
                Please select an employee to generate the experience letter preview.
              </div>
            )}

            <div className="pt-20">
              <p className="text-[#141414]">For Hash AI LLC,</p>
              <div className="h-16 flex items-end">
                <p className="font-signature text-4xl text-slate-900 -rotate-3 -ml-2">{adminName}</p>
              </div>
              <p className="font-bold text-[#141414] mt-1">{adminName}</p>
              <p>Director / HR Head</p>
            </div>

            {/* Footer */}
            <div className="pt-20 text-sm text-[#969696]">
              This is an official document of Hash AI LLC.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
