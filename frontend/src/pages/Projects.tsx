import React, { useState } from 'react';
import { Plus, Search, Briefcase, Calendar, TrendingUp, CheckCircle, Clock, ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useProjects } from '../store/useProjects';
import { useSites } from '../store/useSites';
import { useClients } from '../store/useClients';

export default function Projects() {
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const { addSite } = useSites();
  const { addClient } = useClients();
  const [isAdding, setIsAdding] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [newProject, setNewProject] = useState<any>({
    name: '', client: '', clientContact: '', clientPhone: '', clientEmail: '', budget: '', timeline: '', location: '', status: 'Pending'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) {
      addProject({ 
        ...newProject, 
        id: `PRJ-${Date.now().toString().slice(-4)}`,
        budget: Number(newProject.budget) 
      });

      // Automatically add to clients list
      addClient({
        id: `CLI-${Date.now().toString().slice(-4)}`,
        company: newProject.client,
        contact: newProject.clientContact || 'Unknown',
        phone: newProject.clientPhone || 'N/A',
        email: newProject.clientEmail || 'N/A',
        value: `₹${Number(newProject.budget).toLocaleString()}`
      });

      setIsAdding(false);
      setNewProject({ name: '', client: '', clientContact: '', clientPhone: '', clientEmail: '', budget: '', timeline: '', location: '', status: 'Pending' });
      alert('New project added successfully! It is currently pending approval.');
    } else if (editingProject) {
      const oldProjectName = projects.find(p => p.id === editingProject.id)?.name;
      const oldBudget = projects.find(p => p.id === editingProject.id)?.budget;

      updateProject(editingProject.id, {
        ...editingProject,
        budget: Number(editingProject.budget)
      });

      // CASCADING UPDATE: If project budget changed, update Client Contract Value
      if (oldBudget !== undefined && oldBudget !== Number(editingProject.budget)) {
        
        // Local formatCurrency function since the main one is defined below
        const formatCurrencyLocal = (val: number) => {
          if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
          if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
          return `₹${val.toLocaleString()}`;
        };

        const oldClientName = projects.find(p => p.id === editingProject.id)?.client || editingProject.client;

        useClients.getState().clients.forEach(client => {
          if (client.company === oldClientName || client.company === editingProject.client) {
            useClients.getState().updateClient(client.id, { 
              value: formatCurrencyLocal(Number(editingProject.budget))
            });
          }
        });
      }

      // CASCADING UPDATE: If project name changed, update associated Sites
      if (oldProjectName && oldProjectName !== editingProject.name) {
        // We need to import `sites` and `updateSite` from `useSites` at the top of the component
        useSites.getState().sites.forEach(site => {
          if (site.project === oldProjectName) {
            useSites.getState().updateSite(site.id, { 
              project: editingProject.name,
              name: site.name === oldProjectName ? editingProject.name : site.name // If site name matched project name exactly, rename it too
            });
          }
        });
      }

      setEditingProject(null);
      alert('Project details updated successfully!');
    }
  };

  const handleApprove = (project: any) => {
    // 1. Update Project Status
    updateProject(project.id, { status: 'Approved' });
    
    // 2. Automatically generate a Site for this project
    addSite({
      id: Date.now().toString(),
      name: project.name,
      project: project.name,
      location: project.location,
      engineers: 1, // Default minimum staffing
      workers: 0,
      status: 'Active'
    });
    
    alert(`Project Approved! A new Site has been automatically provisioned for ${project.name}.`);
  };

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    return `₹${val.toLocaleString()}`;
  };

  const activeProject = isAdding ? newProject : editingProject;

  const handleInputChange = (field: string, value: string) => {
    if (isAdding) {
      setNewProject({ ...newProject, [field]: value });
    } else {
      setEditingProject({ ...editingProject, [field]: value });
    }
  };

  if (isAdding || editingProject) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <button 
          onClick={() => { setIsAdding(false); setEditingProject(null); }}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Back to Projects List
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h1 className="text-2xl font-bold text-slate-800">
              {isAdding ? 'Add New Project' : 'Manage Project'}
            </h1>
            <p className="text-slate-500 mt-1">
              {isAdding ? 'Register a new client project. It will remain pending until approved.' : 'Update the details for this project.'}
            </p>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Project Name</label>
                <input 
                  type="text" 
                  value={activeProject.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Client Company Name</label>
                <input 
                  type="text" 
                  value={activeProject.client}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Client Contact Person</label>
                <input 
                  type="text" 
                  value={activeProject.clientContact || ''}
                  onChange={(e) => handleInputChange('clientContact', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Client Email</label>
                <input 
                  type="email" 
                  value={activeProject.clientEmail || ''}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Client Phone</label>
                <input 
                  type="text" 
                  value={activeProject.clientPhone || ''}
                  onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Location</label>
                <input 
                  type="text" 
                  value={activeProject.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Budget (₹)</label>
                <input 
                  type="number" 
                  value={activeProject.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Estimated Timeline</label>
                <input 
                  type="text" 
                  placeholder="e.g. 12 Months"
                  value={activeProject.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => { setIsAdding(false); setEditingProject(null); }}
                className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save size={18} />
                {isAdding ? 'Create Project' : 'Save Changes'}
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
          <h1 className="text-2xl font-bold text-slate-800">Project Management</h1>
          <p className="text-slate-500 mt-1">Track project budgets, timelines, and overall status.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center">
          <Briefcase size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">No Projects Found</h3>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            You haven't successfully added any projects yet, or the database connection is failing. 
            <br/><br/>
            <strong>Note:</strong> If you are adding projects but they disappear, your MongoDB Atlas cluster is blocking your IP address. Please go to MongoDB Atlas Network Access and whitelist your current IP address.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    project.status === 'Approved' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{project.name}</h3>
                    <p className="text-sm text-slate-500">{project.client}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                  project.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                  project.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                  'bg-slate-100 text-slate-700'
                }`}>
                  {project.status === 'Approved' ? <CheckCircle size={14} /> : <Clock size={14} />}
                  {project.status}
                </span>
              </div>
  
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2"><TrendingUp size={16}/> Budget</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(project.budget)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2"><Calendar size={16}/> Timeline</span>
                  <span className="font-semibold text-slate-800">{project.timeline}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2"><Search size={16}/> Location</span>
                  <span className="font-semibold text-slate-800">{project.location}</span>
                </div>
              </div>
  
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-medium text-slate-400">{project.id}</span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete ${project.name}? This will also delete the associated Client and Site.`)) {
                        deleteProject(project.id);
                        
                        // Cascade delete Client
                        const clientToDelete = useClients.getState().clients.find(c => c.company === project.client);
                        if (clientToDelete) {
                          useClients.getState().deleteClient(clientToDelete.id);
                        }
                        
                        // Cascade delete Site
                        const siteToDelete = useSites.getState().sites.find(s => s.project === project.name);
                        if (siteToDelete) {
                          useSites.getState().deleteSite(siteToDelete.id);
                        }
                      }
                    }}
                    className="text-rose-500 hover:text-rose-700 transition-colors p-1"
                    title="Delete Project"
                  >
                    <Trash2 size={16} />
                  </button>
                  {project.status === 'Pending' ? (
                    <button 
                      onClick={() => handleApprove(project)}
                      className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
                    >
                      <CheckCircle size={16} /> Approve & Move to Sites
                    </button>
                  ) : (
                    <button 
                      onClick={() => setEditingProject(project)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Manage Project →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
