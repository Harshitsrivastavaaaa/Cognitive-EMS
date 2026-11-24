import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Award, ShieldCheck, CreditCard, 
  UserCheck, Calendar, Sparkles, CheckCircle2, Loader2, Mail, Phone, MapPin, Building2 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { employeePortalService } from '../../services/employeePortal';
import api from '../../services/api';
import { useBranding } from '../../context/BrandingContext';

export default function EmployeeMyDocumentsPage() {
  const { documentLogoUrl: logoSrc, companyName } = useBranding();
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    setLoading(true);
    try {
      const [profileData, docsData] = await Promise.all([
        employeePortalService.getMyProfile(),
        employeePortalService.getMyDocuments()
      ]);
      setProfile(profileData);
      setDocuments(docsData || []);
    } catch (err) {
      console.error('Failed to load employee document data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadVaultDoc = async (docItem) => {
    try {
      const response = await api.get(`/documents/${docItem.id}/download`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', docItem.original_name || 'document.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download document:', err);
      alert('Could not download document.');
    }
  };

  const handleDownloadCV = async () => {
    if (!profile?.id) return;
    setDownloading(true);
    try {
      const response = await api.get(`/employees/${profile.id}/cv`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', profile.cv_filename ? profile.cv_filename.replace(`cv_${profile.id}_`, '') : 'cv.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Could not download CV. Please ensure a valid CV document is attached.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadIDCard = () => {
    if (!profile) return;
    setDownloading(true);

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [54, 85.6]
    });

    const generateAndSave = (imgElement, profileImgElement) => {
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 54, 85.6, 'F');

      doc.setFillColor(16, 185, 129); // Emerald
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
        doc.setTextColor(16, 185, 129);
        doc.setFont("helvetica", "bold");
        const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`;
        doc.text(initials, 27, 34, { align: 'center' });
      }

      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      const fullName = `${profile.first_name} ${profile.last_name}`;
      doc.text(fullName, 27, 49, { align: 'center' });

      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(6);
      doc.text(profile.role || 'Team Member', 27, 53, { align: 'center' });

      doc.setFillColor(255, 255, 255, 0.05);
      doc.roundedRect(12, 57, 30, 7, 1.5, 1.5, 'F');

      doc.setFont("courier", "bold");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6);
      const empIdStr = `EMP-${profile.id.toString().padStart(4, '0')}`;
      doc.text(empIdStr, 27, 61.5, { align: 'center' });

      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(5);
      doc.text((profile.department || 'GENERAL').toUpperCase(), 27, 68, { align: 'center' });

      doc.setFillColor(16, 185, 129);
      doc.rect(0, 77.6, 54, 8, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5);
      doc.text(doc.splitTextToSize(companyName.toUpperCase(), 50)[0], 27, 82, { align: 'center' });

      doc.save(`Digital_ID_${profile.first_name}_${profile.last_name}.pdf`);
      setDownloading(false);
    };

    const logoImg = new Image();
    logoImg.src = logoSrc;

    const profileImg = new Image();
    profileImg.crossOrigin = "anonymous";
    if (profile.profile_image_filename) {
      profileImg.src = `http://localhost:8000/api/v1/uploads/${profile.profile_image_filename}`;
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

    if (profile.profile_image_filename) {
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
  const otherDocs = documents.filter(d => d.id !== expDoc?.id && d.id !== joiningDoc?.id);

  return (
    <div className="p-8 relative z-10 w-full min-h-screen font-sans">
      
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      {/* HEADER SECTION */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-3">
          <ShieldCheck size={12} /> Employee Document Repository
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter text-white mb-2 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/20">
            <FileText size={28} />
          </div>
          My Documents & Credentials
        </h1>
        <p className="text-sm font-medium text-slate-400 tracking-wide">
          Access your digital ID badge, onboarding offer letter, tax forms, and government records
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="animate-spin text-emerald-500 mb-3" size={36} />
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 animate-pulse">Loading Documents...</p>
        </div>
      ) : (
        <div className="space-y-8 max-w-6xl">
          
          {/* DIGITAL ID CARD PREVIEW & ACTION */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />
            
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <CreditCard className="text-emerald-400" /> Digital Identification Badge
            </h2>

            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              
              {/* ID Badge Graphic */}
              <div className="w-[216px] h-[342px] shrink-0 bg-[#373e48] rounded-2xl shadow-2xl overflow-hidden relative border border-white/10 flex flex-col items-center">
                <div className="w-full h-16 bg-emerald-500 flex items-center justify-center p-3">
                  <img src={logoSrc} alt={`${companyName} logo`} className="max-h-8 object-contain rounded-md shadow-sm" />
                </div>
                <div className="absolute top-2 right-2 text-white/50 text-[8px] font-bold tracking-widest z-10">
                  ID
                </div>

                <div className="w-24 h-24 mt-6 bg-white rounded-2xl shadow-xl border-4 border-[#373e48] relative flex flex-col items-center justify-center overflow-hidden z-10 shrink-0">
                  {profile?.profile_image_filename ? (
                    <img 
                      src={`http://localhost:8000/api/v1/uploads/${profile.profile_image_filename}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-black text-emerald-500">
                      {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                    </span>
                  )}
                </div>

                <div className="text-center mt-4 px-4 w-full">
                  <h4 className="text-white font-bold text-lg leading-tight">{profile?.first_name} {profile?.last_name}</h4>
                  <p className="text-slate-400 text-xs font-medium mt-1">{profile?.role}</p>
                  
                  <div className="mt-4 flex flex-col items-center gap-1">
                    <div className="bg-white/10 px-2 py-0.5 rounded text-[10px] text-white font-mono">
                      EMP-{profile?.id ? profile.id.toString().padStart(4, '0') : '0000'}
                    </div>
                    <div className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">
                      {profile?.department || 'GENERAL'}
                    </div>
                  </div>
                </div>

                <div className="w-full h-10 bg-emerald-500 absolute bottom-0 flex items-center justify-center px-4">
                  <span className="text-white text-[8px] font-bold tracking-widest uppercase text-center leading-tight truncate">
                    {companyName}
                  </span>
                </div>
              </div>

              {/* ID Badge Actions */}
              <div className="flex-1 space-y-4 text-sm text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 size={16} /> Verified Roster Credential
                </div>
                <p className="text-slate-300 leading-relaxed">
                  This is your official digital employee badge for <strong>{profile?.first_name} {profile?.last_name}</strong>. It contains your unique employee identifier, department assignment, and role credentials.
                </p>
                <p className="text-slate-500 text-xs leading-relaxed">
                  You can download a print-ready vector PDF version formatted for standard CR80 physical ID cards (2.125" x 3.375").
                </p>

                <button 
                  onClick={handleDownloadIDCard}
                  disabled={downloading}
                  className="mt-4 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_-5px_#10b981] active:scale-95 disabled:opacity-50"
                >
                  <Download size={16} /> Download Digital ID Badge (PDF)
                </button>
              </div>

            </div>
          </div>

          {/* OFFICIAL ONBOARDING & EXIT LETTERS */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Award className="text-emerald-400" /> Official Employment Letters
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Joining Letter */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 shrink-0">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Offer / Joining Letter</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {joiningDoc ? joiningDoc.original_name : 'Official onboarding appointment and offer letter.'}
                    </p>
                  </div>
                </div>

                {joiningDoc ? (
                  <button 
                    onClick={() => handleDownloadVaultDoc(joiningDoc)}
                    className="w-full py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Download size={14} /> Download Joining Letter
                  </button>
                ) : (
                  <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center">
                    Joining Letter on Record
                  </span>
                )}
              </div>

              {/* Experience Letter (Only if Alumni) */}
              {profile?.status?.toLowerCase() === 'alumni' && (
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 shrink-0">
                      <Award size={22} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Experience Certificate</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {expDoc ? expDoc.original_name : 'Relieving & experience certification.'}
                      </p>
                    </div>
                  </div>

                  {expDoc ? (
                    <button 
                      onClick={() => handleDownloadVaultDoc(expDoc)}
                      className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      <Download size={14} /> Download Experience Letter
                    </button>
                  ) : (
                    <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center">
                      Not generated during offboarding
                    </span>
                  )}
                </div>
              )}

              {/* Candidate Resume / CV */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400 shrink-0">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Resume / CV Document</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {profile?.cv_filename ? profile.cv_filename.replace(`cv_${profile.id}_`, '') : 'Primary candidate resume file.'}
                    </p>
                  </div>
                </div>

                {profile?.cv_filename ? (
                  <button 
                    onClick={handleDownloadCV}
                    disabled={downloading}
                    className="w-full py-2.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Download size={14} /> Download CV
                  </button>
                ) : (
                  <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center">
                    No Resume File Uploaded
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* OTHER GOVERNMENT & VAULT DOCUMENTS */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" /> Government & Vault Documents
            </h2>

            {otherDocs.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl text-slate-500 text-xs font-semibold uppercase tracking-wider">
                No additional government or tax documents uploaded. Contact HR to submit files.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherDocs.map(docItem => (
                  <div key={docItem.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{docItem.document_type || 'Vault Document'}</p>
                        <p className="text-[11px] text-slate-400 truncate">{docItem.original_name}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDownloadVaultDoc(docItem)}
                      className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Download size={12} /> Download Document
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
