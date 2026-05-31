import React, { useState } from 'react';
import { Upload, FileText, Download, File, Trash2, Search, Filter } from 'lucide-react';
import { useDocuments } from '../store/useDocuments';

export default function Documents() {
  const documents = useDocuments(state => state.documents);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Document Hub</h1>
          <p className="text-slate-500 mt-1">Manage blueprints, site plans, and contracts via Oracle Object Storage.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto">
          <Upload size={18} />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search documents by title or project..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

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
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        {doc.type === 'Blueprint' ? <File size={20} /> : <FileText size={20} />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{doc.title}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
                          {doc.type}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{doc.project}</td>
                  <td className="px-6 py-4 text-slate-600">{doc.uploadedBy}</td>
                  <td className="px-6 py-4">
                    <p className="text-slate-800 font-medium">{doc.size}</p>
                    <p className="text-xs text-slate-500">{doc.date}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download">
                        <Download size={18} />
                      </button>
                      <button className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
