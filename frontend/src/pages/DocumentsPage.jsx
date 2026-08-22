import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, UploadCloud, Download, Trash2, Search, X, Loader2, Award, UserCheck, CheckCircle2 } from 'lucide-react';
import { documentService } from '../services/documents';
import { employeesService } from '../services/employees';
import api from '../services/api';

// Simplified Glass Theme
const glassCardStyle = "bg-white/80 border border-slate-200 shadow-sm backdrop-blur-lg rounded-2xl";

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

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
            <FileText size={14} className="text-blue-600" />
            <span className="uppercase tracking-widest">Repository & Storage</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Document <span className="text-blue-600">Vault</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Securely manage employee candidate files, onboarding letters, and exit certificates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl flex items-center gap-2 transition-colors shadow-sm"
          >
            <UploadCloud size={16} />
            Upload Candidate Document
          </button>
        </div>
      </motion.div>

      {/* STATUS BANNER */}
      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 size={18} />
          {statusMessage}
        </div>
      )}

      {/* SEARCH AND TYPE FILTER BAR */}
      <motion.div variants={containerVariants} className={`${glassCardStyle} p-6 space-y-4`}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search documents by filename, candidate/employee name, or type..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-slate-400"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Filter Type:</span>
          {docTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedDocTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedDocTypeFilter === type
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </motion.div>

      {/* DOCUMENTS GRID */}
      <motion.div variants={containerVariants}>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocs.map((doc, idx) => (
              <motion.div 
                key={doc.id}
                variants={containerVariants}
                className={`${glassCardStyle} p-6 hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl ${
                      doc.document_type === 'Joining Letter' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                      doc.document_type === 'Experience Letter' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                      'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}>
                      {doc.document_type === 'Experience Letter' ? <Award size={20} /> : <FileText size={20} />}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                      {doc.document_type || 'Document'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base truncate mb-1" title={doc.original_name}>
                    {doc.original_name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-5 flex items-center gap-1.5 font-medium">
                    <UserCheck size={14} className="text-blue-600" />
                    <span className="truncate">{doc.employee_name || 'Candidate / Employee'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <a 
                    href={documentService.downloadDocumentUrl(doc.id)}
                    download
                    className="flex-1 text-center py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition-colors border border-blue-200 flex items-center justify-center gap-1.5"
                  >
                    <Download size={14} /> Download
                  </a>
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors border border-red-200"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}

            {filteredDocs.length === 0 && (
              <div className="col-span-full py-20 text-center border border-dashed border-slate-200 rounded-2xl bg-white/50 text-slate-500 font-semibold text-sm">
                No matching documents found in vault.
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* UPLOAD DOCUMENT MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-5">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Candidate Document Upload</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Attach documents to employee profile vault.</p>
                </div>
                <button onClick={() => setShowUploadModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Select Candidate / Employee *
                  </label>
                  <select 
                    value={uploadData.employee_id}
                    onChange={e => setUploadData(p => ({ ...p, employee_id: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                    required
                  >
                    <option value="">-- Choose Candidate / Employee --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} — {emp.role} ({emp.department}) [{emp.status?.toUpperCase() || 'ACTIVE'}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Document Classification *
                  </label>
                  <select 
                    value={uploadData.document_type}
                    onChange={e => setUploadData(p => ({ ...p, document_type: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  >
                    <option value="Joining Letter">Joining Letter / Offer Letter</option>
                    <option value="Experience Letter">Experience Certificate / Letter</option>
                    <option value="Resume / CV">Resume / CV Document</option>
                    <option value="ID Proof">ID Proof / Government Document</option>
                    <option value="Tax Form">Tax Form / Payroll Record</option>
                    <option value="Contract">Employment Contract</option>
                    <option value="Other">Other Miscellaneous File</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Upload Document File (PDF / Doc / Image) *
                  </label>
                  <input 
                    type="file"
                    onChange={handleFileChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-700 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowUploadModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={uploading || !uploadData.file || !uploadData.employee_id}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm flex items-center gap-2"
                  >
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                    <span>{uploading ? 'Uploading...' : 'Save Document'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}