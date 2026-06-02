import React, { useState } from 'react';
import { Plus, HardHat, MapPin, Users, CheckCircle2, ArrowLeft, Save, Printer, Download, Receipt, TrendingUp, TrendingDown } from 'lucide-react';
import { useSites } from '../store/useSites';
import { useWorkers } from '../store/useWorkers';
import { useFinance } from '../store/useFinance';

import logoImg from '../assets/BB Builder Logo.png';

export default function Sites() {
  const { sites, addSite, updateSite } = useSites();
  const { workers } = useWorkers();
  const { transactions } = useFinance();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingSite, setEditingSite] = useState<any>(null);
  const [viewingSite, setViewingSite] = useState<any>(null);
  
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

  const handlePrint = () => {
    window.print();
  };

  const downloadCSV = () => {
    const siteTransactions = transactions.filter(t => t.site === viewingSite.name)
                                         .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (siteTransactions.length === 0) {
      alert("No transactions to download for this site.");
      return;
    }

    const headers = ["Date", "Type", "Category", "Description", "Amount (INR)", "Site"];
    const rows = siteTransactions.map(tx => [
      tx.date,
      tx.type,
      tx.category,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.amount,
      `"${tx.site || ''}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${viewingSite.name.replace(/\s+/g, '_')}_Ledger_Logs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const activeSite = isAdding ? newSite : editingSite;

  const handleInputChange = (field: string, value: string | number) => {
    if (isAdding) {
      setNewSite({ ...newSite, [field]: value });
    } else {
      setEditingSite({ ...editingSite, [field]: value });
    }
  };

  // ================= VIEW SITE LOGS / LEDGER =================
  if (viewingSite) {
    const siteTransactions = transactions.filter(t => t.site === viewingSite.name)
                                         .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const totalExpenses = siteTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = siteTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;

    const siteWorkersStats = workers
      .map(w => {
        const siteAttendance = w.attendance?.filter(a => a.site === viewingSite.name && (a.status === 'Present' || a.status === 'Half-Day')) || [];
        if (siteAttendance.length === 0) return null;
        
        const totalDays = siteAttendance.reduce((sum, a) => sum + (a.status === 'Half-Day' ? 0.5 : 1), 0);
        const totalWages = siteAttendance.reduce((sum, a) => sum + (a.wage || 0), 0);
        
        return {
          id: w.id,
          name: w.name,
          skill: w.skill,
          totalDays,
          totalWages
        };
      })
      .filter(Boolean) as { id: string, name: string, skill: string, totalDays: number, totalWages: number }[];

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <button 
            onClick={() => setViewingSite(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Sites List
          </button>
          <div className="flex gap-3">
            <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors">
              <Printer size={18} />
              <span>Print Ledger</span>
            </button>
            <button onClick={downloadCSV} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <Download size={18} />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {/* Printable Ledger Area */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-4xl mx-auto print:shadow-none print:border-none print:w-full">
          <div className="p-10">
            
            <div className="flex justify-between items-start border-b border-slate-200 pb-8">
              <div className="flex items-center gap-3">
                <img src={logoImg} alt="BB Builders Logo" className="h-20 object-contain" />
                <div>
                  <p className="text-sm text-slate-500 font-medium">Enterprise Construction & Management</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-light text-slate-400 uppercase tracking-widest">Site Ledger</h2>
                <p className="text-slate-800 font-semibold mt-2">Generated: <span className="font-mono text-slate-600">{new Date().toLocaleDateString()}</span></p>
              </div>
            </div>

            <div className="mt-8 mb-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Site Details</h3>
              <p className="text-2xl font-bold text-slate-800">{viewingSite.name}</p>
              <p className="text-slate-600 font-medium mt-1">Project: {viewingSite.project}</p>
              <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                <MapPin size={14} /> {viewingSite.location}
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-8 print:border print:border-slate-200 print:rounded-lg print:p-4">
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 print:border-none print:bg-transparent print:p-0">
                <p className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-1"><TrendingUp size={14} /> Total Funds Assigned</p>
                <p className="text-2xl font-black text-emerald-700 mt-1">{formatCurrency(totalIncome)}</p>
              </div>
              <div className="bg-rose-50 rounded-lg p-4 border border-rose-100 print:border-none print:bg-transparent print:p-0">
                <p className="text-xs font-bold text-rose-600 uppercase flex items-center gap-1"><TrendingDown size={14} /> Total Expenses Recorded</p>
                <p className="text-2xl font-black text-rose-700 mt-1">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className={`${balance >= 0 ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-rose-50 border-rose-100 text-rose-700'} rounded-lg p-4 border print:border-none print:bg-transparent print:p-0`}>
                <p className="text-xs font-bold uppercase flex items-center gap-1"><Receipt size={14} /> Net Balance</p>
                <p className="text-2xl font-black mt-1">{formatCurrency(balance)}</p>
              </div>
            </div>

            <table className="w-full text-left mb-8">
              <thead className="border-b-2 border-slate-800">
                <tr>
                  <th className="py-3 text-sm font-bold text-slate-800 uppercase tracking-wider w-1/6">Date</th>
                  <th className="py-3 text-sm font-bold text-slate-800 uppercase tracking-wider w-1/6">Type</th>
                  <th className="py-3 text-sm font-bold text-slate-800 uppercase tracking-wider w-1/4">Category</th>
                  <th className="py-3 text-sm font-bold text-slate-800 uppercase tracking-wider w-1/3">Description</th>
                  <th className="py-3 text-sm font-bold text-slate-800 uppercase tracking-wider text-right w-1/6">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {siteTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 font-medium">No transactions recorded for this site.</td>
                  </tr>
                ) : (
                  siteTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="py-3 text-slate-600 font-medium">{tx.date}</td>
                      <td className="py-3">
                        <span className={`text-xs font-bold uppercase tracking-wider ${tx.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 text-slate-700">{tx.category}</td>
                      <td className="py-3 text-slate-800">{tx.description}</td>
                      <td className={`py-3 text-right font-bold ${tx.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.type === 'Income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Worker Labor History Table */}
            <div className="mt-12">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Labor Cost Breakdown</h3>
              <table className="w-full text-left mb-8">
                <thead className="border-b-2 border-slate-800">
                  <tr>
                    <th className="py-3 text-sm font-bold text-slate-800 uppercase tracking-wider w-1/3">Worker Name</th>
                    <th className="py-3 text-sm font-bold text-slate-800 uppercase tracking-wider w-1/4">Trade / Skill</th>
                    <th className="py-3 text-sm font-bold text-slate-800 uppercase tracking-wider w-1/4 text-center">Days Worked</th>
                    <th className="py-3 text-sm font-bold text-slate-800 uppercase tracking-wider text-right w-1/6">Total Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {siteWorkersStats.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">No worker attendance logged for this site yet.</td>
                    </tr>
                  ) : (
                    siteWorkersStats.map((wStats) => (
                      <tr key={wStats.id}>
                        <td className="py-3 text-slate-800 font-bold">{wStats.name}</td>
                        <td className="py-3 text-slate-600 font-medium">{wStats.skill}</td>
                        <td className="py-3 text-slate-800 text-center font-semibold">
                          <span className="bg-slate-100 px-3 py-1 rounded-md">{wStats.totalDays}</span>
                        </td>
                        <td className="py-3 text-right font-bold text-emerald-600">{formatCurrency(wStats.totalWages)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-16 pt-8 border-t border-slate-200">
              <p className="text-xs text-slate-400 italic text-center">This site ledger contains auto-generated labor costs from daily EOD processes as well as manually logged site transactions.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= ADD / EDIT SITE =================
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

  // ================= DEFAULT SITES LIST =================
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
                      <button 
                        onClick={() => setViewingSite(site)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors px-3 py-1.5 rounded-md border border-blue-200 hover:bg-blue-50"
                      >
                        View Logs
                      </button>
                      <button 
                        onClick={() => setEditingSite(site)}
                        className="text-slate-400 hover:text-slate-600 transition-colors px-3 py-1.5"
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
