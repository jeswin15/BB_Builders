import React, { useState } from 'react';
import { Plus, Search, UserCheck, Phone, IndianRupee, ShieldAlert, ArrowLeft, Save } from 'lucide-react';
import { useWorkers } from '../store/useWorkers';
import { useSites } from '../store/useSites';

export default function Workers() {
  const { workers, addWorker, updateWorker } = useWorkers();
  const { sites } = useSites();
  const activeSiteNames = ['Unassigned', ...sites.filter(s => s.status === 'Active').map(s => s.name)];

  const [editingWorker, setEditingWorker] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [newWorker, setNewWorker] = useState<any>({
    id: '', name: '', skill: 'Helper', phone: '', site: 'Unassigned', dailyRate: 500, status: 'Active',
    joinDate: new Date().toISOString().split('T')[0], advances: 0, balance: 0, attendance: []
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      addWorker(newWorker);
      setIsRegistering(false);
      alert('New worker registered successfully!');
    } else {
      updateWorker(editingWorker.id, editingWorker);
      setEditingWorker(null);
      alert('Employee details updated successfully!');
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (isRegistering) {
      setNewWorker({ ...newWorker, [field]: value });
    } else {
      setEditingWorker({ ...editingWorker, [field]: value });
    }
  };

  const handleOpenRegister = () => {
    // Auto-generate next ID based on the highest existing ID
    const nextIdNum = Math.max(...workers.map(w => parseInt(w.id.split('-')[2]))) + 1;
    const nextId = `WK-2026-${nextIdNum.toString().padStart(3, '0')}`;
    
    setNewWorker({
      id: nextId, name: '', skill: 'Helper', phone: '', site: 'Unassigned', dailyRate: 500, status: 'Active',
      joinDate: new Date().toISOString().split('T')[0], advances: 0, balance: 0, attendance: []
    });
    setIsRegistering(true);
  };

  const activeWorker = isRegistering ? newWorker : editingWorker;

  if (isRegistering || editingWorker) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <button 
          onClick={() => { setEditingWorker(null); setIsRegistering(false); }}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Back to Worker List
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h1 className="text-2xl font-bold text-slate-800">
              {isRegistering ? 'Register New Worker' : 'Edit Employee Details'}
            </h1>
            <p className="text-slate-500 mt-1">
              {isRegistering ? 'Enter profile and payroll information for the new hire.' : `Update profile and payroll information for ${activeWorker.name}.`}
            </p>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee ID - Read Only */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Employee ID</label>
                <input 
                  type="text" 
                  value={activeWorker.id} 
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <input 
                  type="text" 
                  value={activeWorker.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Skill / Role */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Trade / Skill</label>
                <select 
                  value={activeWorker.skill}
                  onChange={(e) => handleInputChange('skill', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Mason</option>
                  <option>Electrician</option>
                  <option>Carpenter</option>
                  <option>Helper</option>
                  <option>Painter</option>
                  <option>Plumber</option>
                </select>
              </div>

              {/* Assigned Site */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Assigned Site</label>
                <select 
                  value={activeWorker.site}
                  onChange={(e) => handleInputChange('site', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {activeSiteNames.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                <input 
                  type="text" 
                  value={activeWorker.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Daily Wage */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Daily Base Wage (₹)</label>
                <input 
                  type="number" 
                  value={activeWorker.dailyRate}
                  onChange={(e) => handleInputChange('dailyRate', Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Employment Status</label>
                <select 
                  value={activeWorker.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Active</option>
                  <option>On Leave</option>
                  <option>Terminated</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => { setEditingWorker(null); setIsRegistering(false); }}
                className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save size={18} />
                {isRegistering ? 'Register Worker' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- MASTER LIST VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Worker Profiles</h1>
          <p className="text-slate-500 mt-1">Manage workforce details, skills, and daily wage rates.</p>
        </div>
        <button 
          onClick={handleOpenRegister}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          <span>Register Worker</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, skill, or ID..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
          <select className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
            <option>All Skills</option>
            <option>Mason</option>
            <option>Electrician</option>
            <option>Helper</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Employee ID & Details</th>
                <th className="px-6 py-4">Assigned Site</th>
                <th className="px-6 py-4">Daily Wage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {workers.map((worker) => (
                <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <UserCheck size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-blue-600">{worker.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="font-bold text-slate-700">{worker.id}</span>
                          <span>•</span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{worker.skill}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Phone size={10} /> {worker.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-800">{worker.site}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-slate-800 font-bold">
                      <IndianRupee size={14} className="text-slate-500" />
                      {worker.dailyRate}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      worker.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {worker.status === 'On Leave' && <ShieldAlert size={12} />}
                      {worker.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setEditingWorker(worker)}
                      className="text-blue-600 hover:text-blue-800 font-bold text-sm transition-colors border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-md"
                    >
                      Edit Profile
                    </button>
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
