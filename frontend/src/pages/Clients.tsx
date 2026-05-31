import React, { useState } from 'react';
import { Plus, Search, Building2, Phone, Mail, FileText, ArrowLeft, Save } from 'lucide-react';
import { useClients } from '../store/useClients';
import { useProjects } from '../store/useProjects';

export default function Clients() {
  const { clients, addClient, updateClient } = useClients();
  const { projects, updateProject } = useProjects();
  
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [newClient, setNewClient] = useState<any>({
    company: '', contact: '', phone: '', email: '', value: ''
  });

  const filteredClients = clients.filter(c => 
    c.company.toLowerCase().includes(search.toLowerCase()) || 
    c.contact.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) {
      addClient({ 
        ...newClient, 
        id: `CLI-${Date.now().toString().slice(-4)}`
      });
      setIsAdding(false);
      setNewClient({ company: '', contact: '', phone: '', email: '', value: '' });
      alert('New client added successfully!');
    } else if (editingClient) {
      // Find the old client record to see if the company name changed
      const oldClient = clients.find(c => c.id === editingClient.id); 
      
      const oldCompanyName = oldClient?.company;

      updateClient(editingClient.id, editingClient);
      
      // CASCADING UPDATE: If company name changed, update all associated projects
      if (oldCompanyName && oldCompanyName !== editingClient.company) {
        projects.forEach(proj => {
          if (proj.client === oldCompanyName) {
            updateProject(proj.id, { client: editingClient.company });
          }
        });
      }
      
      setEditingClient(null);
      alert('Client details updated! Associated projects have been automatically synced.');
    }
  };

  const activeClient = isAdding ? newClient : editingClient;

  const handleInputChange = (field: string, value: string) => {
    if (isAdding) {
      setNewClient({ ...newClient, [field]: value });
    } else {
      setEditingClient({ ...editingClient, [field]: value });
    }
  };

  if (isAdding || editingClient) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <button 
          onClick={() => { setIsAdding(false); setEditingClient(null); }}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Back to Clients List
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h1 className="text-2xl font-bold text-slate-800">
              {isAdding ? 'Add New Client' : 'Manage Client'}
            </h1>
            <p className="text-slate-500 mt-1">
              {isAdding ? 'Register a new client profile.' : 'Update details for this client.'}
            </p>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Company Name</label>
                <input 
                  type="text" 
                  value={activeClient.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Contact Person</label>
                <input 
                  type="text" 
                  value={activeClient.contact}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Phone</label>
                <input 
                  type="text" 
                  value={activeClient.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <input 
                  type="email" 
                  value={activeClient.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Contract Value</label>
                <input 
                  type="text" 
                  value={activeClient.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => { setIsAdding(false); setEditingClient(null); }}
                className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save size={18} />
                {isAdding ? 'Add Client' : 'Save Changes'}
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
          <h1 className="text-2xl font-bold text-slate-800">Client Management</h1>
          <p className="text-slate-500 mt-1">Manage client profiles, contacts, and billing details.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          <span>Add Client</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search clients by name or contact..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Company Details</th>
                <th className="px-6 py-4">Contact Person</th>
                <th className="px-6 py-4">Contract Value</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{client.company}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Mail size={12} /> {client.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">{client.contact}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <Phone size={12} /> {client.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                      <FileText size={14} />
                      {client.value}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setEditingClient(client)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                    >
                      Manage
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
