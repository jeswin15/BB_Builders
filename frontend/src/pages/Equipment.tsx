import React, { useState } from 'react';
import { Plus, Search, Truck, Wrench, CalendarClock, Power, ArrowLeft, Save, Settings2 } from 'lucide-react';
import { useEquipment } from '../store/useEquipment';
import type { Equipment as EquipmentType } from '../store/useEquipment';
import { useWorkers } from '../store/useWorkers';
import { useFinance } from '../store/useFinance';
import { useSites } from '../store/useSites';

export default function Equipment() {
  const { equipment, addEquipment, updateEquipment } = useEquipment();
  const { workers } = useWorkers();
  const { addTransaction } = useFinance();
  const { sites } = useSites();
  const activeSiteNames = ['Unassigned', ...sites.filter(s => s.status === 'Active').map(s => s.name)];
  
  const [isAdding, setIsAdding] = useState(false);
  const [manageItem, setManageItem] = useState<EquipmentType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  
  const [newItem, setNewItem] = useState({
    name: '', code: '', type: 'Machinery', owned: true, status: 'Available', site: '',
    maintenanceSchedule: '', fuelCost: '', operator: ''
  });

  const [manageForm, setManageForm] = useState({
    status: '',
    site: '',
    operator: '',
    maintenanceSchedule: '',
    additionalFuelCost: 0
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) {
      const fuelCostValue = Number(newItem.fuelCost) || 0;
      
      await addEquipment({
        id: `EQ-${Date.now().toString().slice(-4)}`,
        code: newItem.code,
        name: newItem.name,
        type: newItem.type,
        owned: newItem.owned,
        status: newItem.status,
        site: newItem.site,
        maintenanceSchedule: newItem.maintenanceSchedule,
        fuelCost: fuelCostValue,
        operator: newItem.operator
      });

      // If fuel cost is logged, auto-sync with Finance as an expense
      if (fuelCostValue > 0) {
        await addTransaction({
          id: `TXN-${Date.now().toString().slice(-4)}`,
          date: new Date().toISOString().split('T')[0],
          type: 'Expense',
          category: 'Equipment Fuel',
          description: `Initial Fuel/Operating cost for ${newItem.name} at ${newItem.site}`,
          amount: fuelCostValue,
          site: newItem.site
        });
      }

      setIsAdding(false);
      setNewItem({ name: '', code: '', type: 'Machinery', owned: true, status: 'Available', site: '', maintenanceSchedule: '', fuelCost: '', operator: '' });
      alert('Equipment added successfully!');
    }
  };

  const handleOpenManage = (item: EquipmentType) => {
    setManageForm({
      status: item.status,
      site: item.site,
      operator: item.operator || '',
      maintenanceSchedule: item.maintenanceSchedule || '',
      additionalFuelCost: 0
    });
    setManageItem(item);
  };

  const handleManageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manageItem) return;

    let totalFuelCost = manageItem.fuelCost || 0;

    if (manageForm.additionalFuelCost > 0) {
      totalFuelCost += manageForm.additionalFuelCost;

      // Log the additional fuel expense to Finance
      await addTransaction({
        id: `TXN-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split('T')[0],
        type: 'Expense',
        category: 'Equipment Fuel',
        description: `Additional Fuel/Operating cost for ${manageItem.name} at ${manageForm.site}`,
        amount: manageForm.additionalFuelCost,
        site: manageForm.site
      });
    }

    await updateEquipment(manageItem.id, {
      status: manageForm.status,
      site: manageForm.site,
      operator: manageForm.operator,
      maintenanceSchedule: manageForm.maintenanceSchedule,
      fuelCost: totalFuelCost
    });

    setManageItem(null);
    alert('Equipment updated successfully!');
  };

  const handleInputChange = (field: string, value: any) => {
    setNewItem({ ...newItem, [field]: value });
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All Types' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (isAdding) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <button 
          onClick={() => setIsAdding(false)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Back to Equipment List
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h1 className="text-2xl font-bold text-slate-800">Add New Equipment</h1>
            <p className="text-slate-500 mt-1">Register new machinery, vehicles, or tools.</p>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Equipment Name</label>
                <input type="text" value={newItem.name} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Equipment Code (e.g. EX-102)</label>
                <input type="text" value={newItem.code} onChange={(e) => handleInputChange('code', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Type</label>
                <select value={newItem.type} onChange={(e) => handleInputChange('type', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Machinery</option>
                  <option>Vehicles</option>
                  <option>Tools</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Assigned Site</label>
                <select value={newItem.site} onChange={(e) => handleInputChange('site', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="" disabled>Select a Site...</option>
                  {activeSiteNames.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Operator Assignment</label>
                <select value={newItem.operator} onChange={(e) => handleInputChange('operator', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Unassigned --</option>
                  {workers.map(worker => (
                    <option key={worker.id} value={worker.name}>{worker.name} ({worker.trade})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Maintenance Schedule (Next Date)</label>
                <input type="date" value={newItem.maintenanceSchedule} onChange={(e) => handleInputChange('maintenanceSchedule', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Initial Fuel / Operating Cost (₹)</label>
                <input type="number" value={newItem.fuelCost} onChange={(e) => handleInputChange('fuelCost', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2 flex items-center gap-3 mt-8">
                <input type="checkbox" id="owned" checked={newItem.owned} onChange={(e) => handleInputChange('owned', e.target.checked)} className="w-5 h-5 rounded text-blue-600" />
                <label htmlFor="owned" className="text-sm font-semibold text-slate-700">Is Owned (Uncheck for Rented)</label>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
              <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"><Save size={18} />Save Equipment</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Manage Equipment Modal */}
      {manageItem && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Settings2 size={18} className="text-blue-600"/> Manage Equipment</h3>
              <button onClick={() => setManageItem(null)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleManageSubmit} className="p-6 space-y-4">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-2 border border-blue-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                   {manageItem.type === 'Machinery' ? <Truck size={20} /> : <Wrench size={20} />}
                </div>
                <div>
                  <p className="font-bold">{manageItem.name}</p>
                  <p className="text-blue-600/80">{manageItem.code} • {manageItem.owned ? 'Owned' : 'Rented'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Status</label>
                  <select 
                    value={manageForm.status} 
                    onChange={(e) => setManageForm({...manageForm, status: e.target.value})} 
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required
                  >
                    <option>Available</option>
                    <option>In Use</option>
                    <option>Under Maintenance</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Assigned Site</label>
                  <select 
                    value={manageForm.site} 
                    onChange={(e) => setManageForm({...manageForm, site: e.target.value})} 
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required 
                  >
                    <option value="" disabled>Select a Site...</option>
                    {activeSiteNames.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Operator Assignment</label>
                <select 
                  value={manageForm.operator} 
                  onChange={(e) => setManageForm({...manageForm, operator: e.target.value})} 
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Unassigned --</option>
                  {workers.map(worker => (
                    <option key={worker.id} value={worker.name}>{worker.name} ({worker.trade})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Maintenance Schedule</label>
                <input 
                  type="date" 
                  value={manageForm.maintenanceSchedule} 
                  onChange={(e) => setManageForm({...manageForm, maintenanceSchedule: e.target.value})} 
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Add New Fuel / Operating Cost (₹)</label>
                <input 
                  type="number" 
                  value={manageForm.additionalFuelCost || ''} 
                  placeholder="e.g. 2000"
                  onChange={(e) => setManageForm({...manageForm, additionalFuelCost: Number(e.target.value)})} 
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <p className="text-xs text-slate-500">Entering an amount will auto-log an expense to Finance for the assigned site.</p>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setManageItem(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"><Save size={16}/> Save Updates</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Equipment & Machinery</h1>
          <p className="text-slate-500 mt-1">Track company-owned and rented equipment assignments and maintenance.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={18} />
          <span>Add Equipment</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search equipment by code or name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option>All Types</option>
            <option>Machinery</option>
            <option>Vehicles</option>
            <option>Tools</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {filteredEquipment.length === 0 ? (
             <div className="p-12 text-center flex flex-col items-center">
               <Wrench size={48} className="text-slate-300 mb-4" />
               <h3 className="text-lg font-semibold text-slate-800">No Equipment Found</h3>
               <p className="text-slate-500 mt-2 max-w-md mx-auto">Try adjusting your search criteria or add new equipment.</p>
             </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Equipment Details</th>
                  <th className="px-6 py-4">Ownership</th>
                  <th className="px-6 py-4">Assigned Location</th>
                  <th className="px-6 py-4">Operator</th>
                  <th className="px-6 py-4">Maintenance</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEquipment.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                          {item.type === 'Machinery' ? <Truck size={20} /> : <Wrench size={20} />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{item.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${item.owned ? 'bg-slate-100 text-slate-700' : 'bg-purple-100 text-purple-700'}`}>
                        {item.owned ? 'Owned' : 'Rented'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.site}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {item.operator || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {item.maintenanceSchedule || 'Not set'}
                      {item.fuelCost ? <div className="text-slate-500 mt-1">Cost: ₹{item.fuelCost.toLocaleString()}</div> : null}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                        item.status === 'In Use' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status === 'Available' && <Power size={12} />}
                        {item.status === 'Under Maintenance' && <CalendarClock size={12} />}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleOpenManage(item)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
                      >
                        <Settings2 size={14} /> Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
