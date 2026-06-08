import React, { useState } from 'react';
import { Plus, Search, Package, AlertTriangle, Layers, ArrowLeft, Save, Send, History, Edit2 } from 'lucide-react';
import { useMaterials } from '../store/useMaterials';
import type { Material } from '../store/useMaterials';
import { useSites } from '../store/useSites';
import { useFinance } from '../store/useFinance';

export default function Materials() {
  const { materials, addMaterial, updateMaterial } = useMaterials();
  const { sites } = useSites();
  const { addTransaction } = useFinance();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<Material | null>(null);
  const [distributeMaterial, setDistributeMaterial] = useState<Material | null>(null);
  const [historyMaterial, setHistoryMaterial] = useState<Material | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  
  const [distributeForm, setDistributeForm] = useState({
    site: '',
    quantity: 0
  });

  const [formItem, setFormItem] = useState({
    name: '', code: '', category: 'Cement', stock: 0, unit: 'kg', minStock: 10, location: '',
    supplier: '', price: 0, lastRestocked: new Date().toISOString().split('T')[0]
  });

  const handleOpenAdd = () => {
    setFormItem({ name: '', code: '', category: 'Cement', stock: 0, unit: 'kg', minStock: 10, location: '', supplier: '', price: 0, lastRestocked: new Date().toISOString().split('T')[0] });
    setIsAdding(true);
  };

  const handleOpenEdit = (item: Material) => {
    setFormItem({
      name: item.name,
      code: item.code,
      category: item.category,
      stock: item.stock,
      unit: item.unit,
      minStock: item.minStock,
      location: item.location,
      supplier: item.supplier || '',
      price: item.price || 0,
      lastRestocked: item.lastRestocked || new Date().toISOString().split('T')[0]
    });
    setEditingItem(item);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      // Calculate stock difference to log history
      const stockDiff = Number(formItem.stock) - editingItem.stock;
      const newHistory = [...(editingItem.history || [])];
      
      if (stockDiff !== 0) {
        newHistory.push({
          date: new Date().toISOString().split('T')[0],
          type: stockDiff > 0 ? 'In' : 'Out',
          quantity: Math.abs(stockDiff),
          description: `Manual stock adjustment (${stockDiff > 0 ? 'Added' : 'Removed'})`
        });
      }

      await updateMaterial(editingItem.id, {
        name: formItem.name,
        code: formItem.code,
        category: formItem.category,
        stock: Number(formItem.stock),
        unit: formItem.unit,
        minStock: Number(formItem.minStock),
        location: formItem.location,
        supplier: formItem.supplier,
        price: Number(formItem.price),
        lastRestocked: formItem.lastRestocked,
        history: newHistory
      });
      
      setEditingItem(null);
      alert('Material updated successfully!');
    } else if (isAdding) {
      await addMaterial({
        id: `MAT-${Date.now().toString().slice(-4)}`,
        code: formItem.code,
        name: formItem.name,
        category: formItem.category,
        stock: Number(formItem.stock),
        unit: formItem.unit,
        minStock: Number(formItem.minStock),
        location: formItem.location,
        supplier: formItem.supplier,
        price: Number(formItem.price),
        lastRestocked: formItem.lastRestocked,
        history: [{
          date: new Date().toISOString().split('T')[0],
          type: 'In',
          quantity: Number(formItem.stock),
          description: 'Initial stock entry'
        }]
      });
      setIsAdding(false);
      alert('Material added successfully!');
    }
  };

  const handleDistribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distributeMaterial) return;

    if (!distributeMaterial.price || distributeMaterial.price <= 0) {
      alert("Error: Cannot distribute material because it does not have a Unit Price set. Please update the material price first to calculate expenses.");
      return;
    }

    if (distributeForm.quantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (distributeForm.quantity > distributeMaterial.stock) {
      alert(`Error: Cannot distribute ${distributeForm.quantity} ${distributeMaterial.unit}. Only ${distributeMaterial.stock} ${distributeMaterial.unit} available in stock.`);
      return;
    }

    if (!distributeForm.site) {
      alert("Please select a target site.");
      return;
    }

    const totalCost = distributeForm.quantity * distributeMaterial.price;

    // 1. Log transaction
    await addTransaction({
      id: `TXN-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      type: 'Expense',
      category: 'Material Distribution',
      description: `${distributeForm.quantity} ${distributeMaterial.unit} of ${distributeMaterial.name} issued.`,
      amount: totalCost,
      site: distributeForm.site
    });

    // 2. Update material stock and history
    const newHistory = [...(distributeMaterial.history || [])];
    newHistory.push({
      date: new Date().toISOString().split('T')[0],
      type: 'Out',
      quantity: distributeForm.quantity,
      site: distributeForm.site,
      description: `Issued to ${distributeForm.site}`
    });

    await updateMaterial(distributeMaterial.id, {
      stock: distributeMaterial.stock - distributeForm.quantity,
      history: newHistory
    });

    setDistributeMaterial(null);
    setDistributeForm({ site: '', quantity: 0 });
    alert(`Successfully distributed ${distributeForm.quantity} ${distributeMaterial.unit} to ${distributeForm.site}. A total expense of ₹${totalCost.toLocaleString()} was logged.`);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormItem({ ...formItem, [field]: value });
  };

  const filteredMaterials = materials.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (isAdding || editingItem) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <button 
          onClick={() => { setIsAdding(false); setEditingItem(null); }}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Back to Inventory
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h1 className="text-2xl font-bold text-slate-800">{editingItem ? 'Edit Material Details' : 'Add New Material'}</h1>
            <p className="text-slate-500 mt-1">{editingItem ? 'Update stock levels, pricing, and supplier info.' : 'Add material details to your central inventory catalog.'}</p>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Material Name</label>
                <input type="text" value={formItem.name} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Material Code</label>
                <input type="text" value={formItem.code} onChange={(e) => handleInputChange('code', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Category</label>
                <select value={formItem.category} onChange={(e) => handleInputChange('category', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Cement</option>
                  <option>Steel</option>
                  <option>Bricks</option>
                  <option>Wood</option>
                  <option>Plumbing</option>
                  <option>Electrical</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Unit of Measurement</label>
                <input type="text" placeholder="e.g. bags, kg, tons, pcs" value={formItem.unit} onChange={(e) => handleInputChange('unit', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Current Stock Quantity</label>
                <input type="number" value={formItem.stock} onChange={(e) => handleInputChange('stock', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Minimum Stock Alert Level</label>
                <input type="number" value={formItem.minStock} onChange={(e) => handleInputChange('minStock', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Storage Location (Warehouse/Site)</label>
                <input type="text" value={formItem.location} onChange={(e) => handleInputChange('location', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Supplier Name</label>
                <input type="text" value={formItem.supplier} onChange={(e) => handleInputChange('supplier', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Unit Price (₹)</label>
                <input type="number" value={formItem.price} onChange={(e) => handleInputChange('price', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Last Restocked Date</label>
                <input type="date" value={formItem.lastRestocked} onChange={(e) => handleInputChange('lastRestocked', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
              <button type="button" onClick={() => { setIsAdding(false); setEditingItem(null); }} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"><Save size={18} />{editingItem ? 'Save Updates' : 'Save Material'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const lowStockCount = materials.filter(m => m.stock <= m.minStock).length;

  return (
    <div className="space-y-6">
      
      {/* Distribution Modal */}
      {distributeMaterial && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Send size={18} className="text-blue-600"/> Issue Stock to Site</h3>
              <button onClick={() => setDistributeMaterial(null)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleDistribute} className="p-6 space-y-4">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-2 border border-blue-100">
                <p><strong>Item:</strong> {distributeMaterial.name} ({distributeMaterial.code})</p>
                <p><strong>Available Stock:</strong> {distributeMaterial.stock} {distributeMaterial.unit}</p>
                <p><strong>Unit Price:</strong> ₹{distributeMaterial.price || 'Not Set'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Select Target Site</label>
                <select 
                  value={distributeForm.site} 
                  onChange={(e) => setDistributeForm({...distributeForm, site: e.target.value})} 
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required
                >
                  <option value="">-- Select a Site --</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.name}>{site.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Quantity to Issue ({distributeMaterial.unit})</label>
                <input 
                  type="number" 
                  value={distributeForm.quantity} 
                  onChange={(e) => setDistributeForm({...distributeForm, quantity: Number(e.target.value)})} 
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required 
                />
              </div>
              {distributeForm.quantity > 0 && distributeMaterial.price ? (
                <div className="text-sm text-slate-500 text-right pt-2">
                  Estimated Expense: <span className="font-bold text-slate-800">₹{(distributeForm.quantity * distributeMaterial.price).toLocaleString()}</span>
                </div>
              ) : null}
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setDistributeMaterial(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Confirm & Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyMaterial && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><History size={18} className="text-blue-600"/> Stock History: {historyMaterial.name}</h3>
              <button onClick={() => setHistoryMaterial(null)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto">
              {!historyMaterial.history || historyMaterial.history.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No history recorded for this item.</p>
              ) : (
                <div className="space-y-4">
                  {historyMaterial.history.map((log, index) => (
                    <div key={index} className="flex gap-4 p-4 border border-slate-100 rounded-lg bg-slate-50/50">
                      <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${log.type === 'In' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {log.type === 'In' ? '+' : '-'}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className={`font-bold ${log.type === 'In' ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {log.quantity} {historyMaterial.unit}
                          </span>
                          <span className="text-sm font-medium text-slate-800">
                            {log.type === 'In' ? 'Added to stock' : `Issued to ${log.site || 'Site'}`}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{log.date} • {log.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 shrink-0 text-right">
               <button onClick={() => setHistoryMaterial(null)} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory & Materials</h1>
          <p className="text-slate-500 mt-1">Manage material catalog, distribute to sites, and track stock.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto">
            <Layers size={18} />
            <span>Warehouses</span>
          </button>
          <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto">
            <Plus size={18} />
            <span>Add Material</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Materials Catalogued</p>
            <p className="text-2xl font-bold text-slate-800">{materials.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Low Stock Alerts</p>
            <p className="text-2xl font-bold text-slate-800">{lowStockCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search materials..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option>All Categories</option>
            <option>Cement</option>
            <option>Steel</option>
            <option>Bricks</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {filteredMaterials.length === 0 ? (
             <div className="p-12 text-center flex flex-col items-center">
               <Package size={48} className="text-slate-300 mb-4" />
               <h3 className="text-lg font-semibold text-slate-800">No Inventory Found</h3>
               <p className="text-slate-500 mt-2 max-w-md mx-auto">Try adjusting your search criteria or add new materials.</p>
             </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Location & Supplier</th>
                  <th className="px-6 py-4">Current Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredMaterials.map((item) => {
                  const isLowStock = item.stock <= item.minStock;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{item.code} • {item.category}</p>
                        {item.price ? <p className="text-xs text-emerald-600 font-medium mt-1">₹{item.price}/{item.unit}</p> : null}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-800 font-medium">{item.location}</div>
                        {item.supplier && <div className="text-xs text-slate-500 mt-1">Supplier: {item.supplier}</div>}
                        {item.lastRestocked && <div className="text-xs text-slate-400 mt-0.5">Restocked: {item.lastRestocked}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">{item.stock}</span> {item.unit}
                        <div className="text-xs text-slate-400 mt-1">Min: {item.minStock} {item.unit}</div>
                      </td>
                      <td className="px-6 py-4">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                            <AlertTriangle size={12} />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            Healthy
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => handleOpenEdit(item)}
                            className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200"
                            title="Edit Material"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button 
                            onClick={() => setDistributeMaterial(item)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
                            title="Issue to Site"
                          >
                            <Send size={14} /> Issue
                          </button>
                          <button 
                            onClick={() => setHistoryMaterial(item)}
                            className="flex items-center gap-1 text-slate-600 hover:text-slate-800 font-medium text-sm transition-colors bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
                            title="View History"
                          >
                            <History size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
