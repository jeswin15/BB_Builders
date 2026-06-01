import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, File, Trash2, Search, Filter, X, Save } from 'lucide-react';
import { useDocuments } from '../store/useDocuments';
import { useProjects } from '../store/useProjects';
import { useAuth } from '../store/useAuth';
import { baseURL } from '../api/client';

export default function Documents() {
  const { documents, addDocument, deleteDocument } = useDocuments();
  const { projects } = useProjects();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingState, setUploadingState] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'Blueprint',
    project: '',
    file: null as File | null
  });

  const handleUploadClick = () => {
    setIsUploading(true);
    setUploadForm({
      title: '',
      type: 'Blueprint',
      project: projects.length > 0 ? projects[0].name : '',
      file: null
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadForm({ ...uploadForm, file: e.target.files[0] });
    }
  };

  const handleSaveUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file) {
      alert("Please select a file to upload.");
      return;
    }
    
    setUploadingState(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title || uploadForm.file.name);
      formData.append('type', uploadForm.type);
      formData.append('project', uploadForm.project);
      formData.append('uploadedBy', user?.name || 'Admin');
      formData.append('file', uploadForm.file);
      
      await addDocument(formData);
      
      setIsUploading(false);
      alert('Document uploaded successfully!');
    } catch (error) {
      alert('Failed to upload document.');
      console.error(error);
    } finally {
      setUploadingState(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteDocument(id);
    }
  };

  const handleDownload = (fileUrl?: string) => {
    if (!fileUrl) {
      alert("File URL not found.");
      return;
    }
    const origin = baseURL.replace('/api', '');
    window.open(`${origin}${fileUrl}`, '_blank');
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || doc.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Upload Modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Upload size={18} className="text-blue-600"/> Upload New Document</h3>
              <button onClick={() => setIsUploading(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSaveUpload} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Document Title</label>
                <input 
                  type="text" 
                  value={uploadForm.title} 
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})} 
                  placeholder="e.g., Phase 1 Blueprint"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Select File</label>
                <div 
                  className="w-full px-4 py-8 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={32} className="text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-600">
                    {uploadForm.file ? uploadForm.file.name : "Click to select a file"}
                  </p>
                  {uploadForm.file && (
                    <p className="text-xs text-slate-500 mt-1">{(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Document Type</label>
                  <select 
                    value={uploadForm.type} 
                    onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})} 
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Blueprint</option>
                    <option>Site Plan</option>
                    <option>Contract</option>
                    <option>Invoice</option>
                    <option>Report</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Project / Site</label>
                  <select 
                    value={uploadForm.project} 
                    onChange={(e) => setUploadForm({...uploadForm, project: e.target.value})} 
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- General / No Project --</option>
                    {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsUploading(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium">Cancel</button>
                <button 
                  type="submit" 
                  disabled={uploadingState}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {uploadingState ? 'Uploading...' : <><Save size={18}/> Upload</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Document Hub</h1>
          <p className="text-slate-500 mt-1">Manage blueprints, site plans, and contracts securely.</p>
        </div>
        <button 
          onClick={handleUploadClick}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto"
        >
          <Upload size={18} />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search documents by title or project..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors w-full sm:w-auto focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Blueprint">Blueprints</option>
              <option value="Contract">Contracts</option>
              <option value="Site Plan">Site Plans</option>
              <option value="Report">Reports</option>
            </select>
          </div>
        </div>

        {/* Document List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Document Details</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Uploaded By</th>
                <th className="px-6 py-4">Size / Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-800">No documents found</h3>
                    <p className="text-slate-500">Upload a new document to get started.</p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 group transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                          {doc.type === 'Blueprint' ? <File size={20} /> : <FileText size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{doc.title}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            {doc.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{doc.project || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{doc.uploadedBy}</td>
                    <td className="px-6 py-4">
                      <p className="text-slate-800 font-bold">{doc.size}</p>
                      <p className="text-xs font-medium text-slate-500">{doc.date}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDownload(doc.fileUrl)}
                          className="px-3 py-1.5 text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 rounded-lg transition-colors flex items-center gap-1 font-medium" 
                          title="Download/View"
                        >
                          <Download size={14} /> View
                        </button>
                        <button 
                          onClick={() => handleDelete(doc.id, doc.title)}
                          className="p-1.5 text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-lg transition-colors" 
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
