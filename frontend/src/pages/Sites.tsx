import React, { useState } from 'react';
import { Plus, HardHat, MapPin, Users, CheckCircle2, ArrowLeft, Save } from 'lucide-react';
import { useSites } from '../store/useSites';
import { useWorkers } from '../store/useWorkers';

export default function Sites() {
  const { sites, addSite, updateSite } = useSites();
  const { workers } = useWorkers();
  const [isAdding, setIsAdding] = useState(false);
  const [editingSite, setEditingSite] = useState<any>(null);
  const [newSite, setNewSite] = useState<any>({
    name: '', project: '', location: '', engineers: 0, workers: 0, status: 'Active'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) {
      addSite({ ...newSite, id: Date.now().toString() });
      setIsAdding(false);
      setNewSite({ name: '', project: '', location: '', engineers: 0, workers: 0, status: 'Active' });
      alert('New site added successfully!');
    } else if (editingSite) {
      const oldSiteName = sites.find(s => s.id === editingSite.id)?.name;

      updateSite(editingSite.id, editingSite);

      // CASCADING UPDATE: If site name changed, update assigned workers
      if (oldSiteName && oldSiteName !== editingSite.name) {
        useWorkers.getState().workers.forEach(w => {
          if (w.site === oldSiteName) {
            useWorkers.getState().updateWorker(w.id, { site: editingSite.name });
          }
        });
      }

      setEditingSite(null);
      alert('Site details updated! Associated workers have been automatically synced.');
    }
  };

  const activeSite = isAdding ? newSite : editingSite;

  const handleInputChange = (field: string, value: string | number) => {
    if (isAdding) {
      setNewSite({ ...newSite, [field]: value });
    } else {
      setEditingSite({ ...editingSite, [field]: value });
    }
  };

  if (isAdding || editingSite) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <button 
          onClick={() => { setIsAdding(false); setEditingSite(null); }}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Back to Sites List
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h1 className="text-2xl font-bold text-slate-800">
              {isAdding ? 'Add New Site' : 'Manage Site'}
            </h1>
            <p className="text-slate-500 mt-1">
              {isAdding ? 'Register a new construction site or project phase.' : 'Update details for this site.'}
            </p>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Site Name</label>
                <input 
                  type="text" 
                  value={activeSite.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Project Name</label>
                <input 
                  type="text" 
                  value={activeSite.project}
                  onChange={(e) => handleInputChange('project', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Location</label>
                <input 
                  type="text" 
                  value={activeSite.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Status</label>
                <select 
                  value={activeSite.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Active</option>
                  <option>Completed</option>
                  <option>On Hold</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => { setIsAdding(false); setEditingSite(null); }}
                className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save size={18} />
                {isAdding ? 'Save Site' : 'Update Site'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Site Management</h1>
          <p className="text-slate-500 mt-1">Monitor individual construction sites, attendance, and daily logs.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          <span>Add Site</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Site Name & Project</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Active Workforce</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sites.map((site) => {
                const dynamicWorkerCount = workers.filter(w => w.site === site.name && w.status === 'Active').length;
                return (
                <tr key={site.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <HardHat size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{site.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{site.project}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin size={16} className="text-slate-400" />
                      {site.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="font-semibold text-slate-800">{site.engineers}</p>
                        <p className="text-xs text-slate-500">Engineers</p>
                      </div>
                      <div className="w-px h-8 bg-slate-200"></div>
                      <div className="text-center">
                        <p className="font-semibold text-blue-600">{dynamicWorkerCount}</p>
                        <p className="text-xs text-slate-500">Workers</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium text-xs">
                      <CheckCircle2 size={14} />
                      {site.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
                        View Logs
                      </button>
                      <button 
                        onClick={() => setEditingSite(site)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
