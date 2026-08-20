import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, UploadCloud, Download, Trash2, Search, X, Loader2, Award, UserCheck, CheckCircle2 } from 'lucide-react';
import { documentService } from '../services/documents';
import { employeesService } from '../services/employees';
import api from '../services/api';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDocTypeFilter, setSelectedDocTypeFilter] = useState('All');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ employee_id: '', document_type: 'Joining Letter', file: null });
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docsData, empsData] = await Promise.all([
        documentService.getAllDocuments(),
        employeesService.list()
      ]);
      setDocuments(docsData || []);
      setEmployees(empsData || []);
    } catch (err) {
      console.error('Failed to load vault data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadData(p => ({ ...p, file: e.target.files[0] }));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.employee_id) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('employee_id', uploadData.employee_id);
    formData.append('document_type', uploadData.document_type);
    formData.append('file', uploadData.file);

    try {
      const newDoc = await documentService.uploadDocument(formData);
      setDocuments(prev => [...prev, newDoc]);
      setShowUploadModal(false);
      setUploadData({ employee_id: '', document_type: 'Joining Letter', file: null });
      setStatusMessage('Document uploaded successfully!');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      console.error("Upload failed", err);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document from vault?")) return;
    try {
      await documentService.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete document.');
    }
  };
  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.original_name.toLowerCase().includes(search.toLowerCase()) || 
                          (d.employee_name || "").toLowerCase().includes(search.toLowerCase()) ||
                          (d.document_type || "").toLowerCase().includes(search.toLowerCase());
    
    if (selectedDocTypeFilter === 'All') return matchesSearch;
    return matchesSearch && d.document_type === selectedDocTypeFilter;
  });

  const docTypes = ['All', 'Joining Letter', 'Experience Letter', 'Offer Letter', 'Resume / CV', 'ID Proof', 'Tax Form', 'Contract', 'Other'];

  return (
    <div className="p-8 relative z-10 w-full min-h-screen font-sans">
      
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white mb-2 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/20">
              <FileText size={28} />
            </div>
            Document Vault
          </h1>
          <p className="text-sm font-medium text-slate-400 tracking-wide">
            Securely manage employee candidate files, onboarding letters, and exit certificates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 transition-all shadow-[0_0_20px_-5px_#10b981] active:scale-95"
          >
            <UploadCloud size={18} />
            Upload Candidate Document
          </button>
        </div>
      </div>

      {/* STATUS BANNER */}
      {statusMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 size={18} />
          {statusMessage}
        </div>
      )}

      {/* SEARCH AND TYPE FILTER BAR */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-xl mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search documents by filename, candidate/employee name, or type..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-500"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mr-2">Filter Type:</span>
          {docTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedDocTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDocTypeFilter === type
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* DOCUMENTS GRID */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocs.map((doc, idx) => (
            <motion.div 
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${
                    doc.document_type === 'Joining Letter' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    doc.document_type === 'Experience Letter' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {doc.document_type === 'Experience Letter' ? <Award size={22} /> : <FileText size={22} />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                    {doc.document_type || 'Document'}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base truncate mb-1" title={doc.original_name}>
                  {doc.original_name}
                </h3>
                <p className="text-xs text-slate-400 mb-4 flex items-center gap-2 font-medium">
                  <UserCheck size={13} className="text-emerald-400" />
                  <span>{doc.employee_name || 'Candidate / Employee'}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                <a 
                  href={documentService.downloadDocumentUrl(doc.id)}
                  download
                  className="flex-1 text-center py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold transition-all border border-emerald-500/20"
                >
                  <Download size={14} className="inline mr-1.5" /> Download
                </a>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}

          {filteredDocs.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl text-slate-500 font-semibold text-sm uppercase tracking-wider">
              No matching documents found in vault.
            </div>
          )}
        </div>
      )}

      {/* UPLOAD DOCUMENT BY CANDIDATE SELECTOR MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowUploadModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0c] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden z-10"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <UploadCloud className="text-emerald-500" /> Candidate Document Upload
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Select a candidate/employee to attach documents to their profile vault.</p>
                </div>
                <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-5 relative z-10">
                
                {/* CANDIDATE SELECTOR */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Select Candidate / Employee *
                  </label>
                  <select 
                    value={uploadData.employee_id}
                    onChange={e => setUploadData(p => ({ ...p, employee_id: e.target.value }))}
                    className="w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    required
                  >
                    <option value="" className="bg-[#0f0f11]">-- Choose Candidate / Employee --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id} className="bg-[#0f0f11]">
                        {emp.first_name} {emp.last_name} — {emp.role} ({emp.department}) [{emp.status?.toUpperCase() || 'ACTIVE'}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* DOCUMENT TYPE */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Document Classification *
                  </label>
                  <select 
                    value={uploadData.document_type}
                    onChange={e => setUploadData(p => ({ ...p, document_type: e.target.value }))}
                    className="w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="Joining Letter" className="bg-[#0f0f11]">Joining Letter / Offer Letter</option>
                    <option value="Experience Letter" className="bg-[#0f0f11]">Experience Certificate / Letter</option>
                    <option value="Resume / CV" className="bg-[#0f0f11]">Resume / CV Document</option>
                    <option value="ID Proof" className="bg-[#0f0f11]">ID Proof / Government Document</option>
                    <option value="Tax Form" className="bg-[#0f0f11]">Tax Form / Payroll Record</option>
                    <option value="Contract" className="bg-[#0f0f11]">Employment Contract</option>
                    <option value="Other" className="bg-[#0f0f11]">Other Miscellaneous File</option>
                  </select>
                </div>

                {/* FILE ATTACHMENT */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Upload Document File (PDF / Doc / Image) *
                  </label>
                  <input 
                    type="file"
                    onChange={handleFileChange}
                    className="w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 focus:outline-none"
                    required
                  />
                </div>

                <div className="pt-3">
                  <button 
                    type="submit" 
                    disabled={uploading || !uploadData.file || !uploadData.employee_id}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_-5px_#10b981] flex items-center justify-center gap-2"
                  >
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                    <span>{uploading ? 'Uploading to Vault...' : 'Confirm & Save Document'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
