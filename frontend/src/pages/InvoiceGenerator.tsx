import React, { useState } from 'react';
import { Printer, Download, Building, Plus, Trash2, Save, History, FileText, ArrowLeft } from 'lucide-react';
import { useProjects } from '../store/useProjects';
import { useWorkers } from '../store/useWorkers';
import { useInvoices } from '../store/useInvoices';
import type { SavedInvoice, InvoiceLineItem } from '../store/useInvoices';

import logoImg from '../assets/BB Builder Logo.png';

export default function InvoiceGenerator() {
  const { projects } = useProjects();
  const { workers } = useWorkers();
  const { invoices, saveInvoice, deleteInvoice } = useInvoices();

  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'view'>('create');
  const [viewingInvoice, setViewingInvoice] = useState<SavedInvoice | null>(null);

  const [invoiceType, setInvoiceType] = useState('Client Invoice');
  const [selectedEntity, setSelectedEntity] = useState('');
  
  const [items, setItems] = useState<InvoiceLineItem[]>([
    { id: 1, description: 'Foundation Phase Completion', qty: 1, rate: 1200000, gstPercent: 18 },
  ]);

  const isPayslip = invoiceType === 'Worker Payslip';

  const handlePrint = () => {
    window.print();
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', qty: 1, rate: 0, gstPercent: isPayslip ? 0 : 18 }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: number, field: keyof InvoiceLineItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Calculations for Create Mode
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  const totalGst = isPayslip ? 0 : items.reduce((sum, item) => {
    const itemTotal = item.qty * item.rate;
    return sum + (itemTotal * (item.gstPercent / 100));
  }, 0);
  const total = subtotal + totalGst;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const targetProject = projects.find(p => p.id === selectedEntity);
  const targetWorker = workers.find(w => w.id === selectedEntity);

  const handleSaveInvoice = () => {
    if (!selectedEntity) {
      alert(`Please select a ${isPayslip ? 'Worker' : 'Project'} first.`);
      return;
    }

    const newId = `${isPayslip ? 'PAY' : 'INV'}-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    const invoiceToSave: SavedInvoice = {
      id: newId,
      invoiceType,
      date: new Date().toISOString().split('T')[0],
      targetId: selectedEntity,
      targetName: isPayslip ? (targetWorker?.name || '') : (targetProject?.client || ''),
      targetRoleOrProject: isPayslip ? (targetWorker?.skill || '') : (targetProject?.name || ''),
      targetLocationOrSite: isPayslip ? (targetWorker?.site || '') : (targetProject?.location || ''),
      items: [...items],
      subtotal,
      totalGst,
      total
    };

    saveInvoice(invoiceToSave);
    alert(`Document ${newId} saved successfully! You can view it in the History tab.`);
    setActiveTab('history');
  };

  const handleViewInvoice = (inv: SavedInvoice) => {
    setViewingInvoice(inv);
    setActiveTab('view');
  };

  // ================= RENDER HISTORY =================
  if (activeTab === 'history') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Invoice History</h1>
            <p className="text-slate-500 mt-1">Review and reprint past generated documents.</p>
          </div>
          <button 
            onClick={() => setActiveTab('create')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            <span>Create New Document</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Document ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No invoices saved yet.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-blue-600">{inv.id}</td>
                    <td className="px-6 py-4 text-slate-600">{inv.date}</td>
                    <td className="px-6 py-4 text-slate-600">{inv.invoiceType}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{inv.targetName}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">{formatCurrency(inv.total)}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <button 
                        onClick={() => handleViewInvoice(inv)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        View / Print
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this document?')) {
                            deleteInvoice(inv.id);
                          }
                        }}
                        className="text-sm font-medium text-rose-600 hover:text-rose-800 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ================= RENDER VIEW (READ ONLY) =================
  if (activeTab === 'view' && viewingInvoice) {
    const isViewPayslip = viewingInvoice.invoiceType === 'Worker Payslip';
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <button 
            onClick={() => setActiveTab('history')}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            Back to History
          </button>
          <div className="flex gap-3">
            <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors">
              <Printer size={18} />
              <span>Print</span>
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <Download size={18} />
              <span>Save as PDF</span>
            </button>
          </div>
        </div>

        <div id="invoice-content" className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-4xl mx-auto print:shadow-none print:border-none print:w-full">
          <div className="p-10">
            <div className="flex justify-between items-start border-b border-slate-200 pb-8">
              <div className="flex items-center gap-3">
                <img src={logoImg} alt="BB Builders Logo" className="h-20 object-contain" />
                <div>
                  <p className="text-sm text-slate-500 font-medium">Enterprise Construction & Management</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-light text-slate-400 uppercase tracking-widest">{viewingInvoice.invoiceType}</h2>
                <p className="text-slate-800 font-semibold mt-2">No: <span className="font-mono text-slate-600">{viewingInvoice.id}</span></p>
                <p className="text-sm text-slate-500">Date: {viewingInvoice.date}</p>
              </div>
            </div>

            <div className="flex justify-between mt-8 mb-12">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">From</h3>
                <p className="font-bold text-slate-800">BB Builders ERP</p>
                <p className="text-sm text-slate-600 mt-1">123 Construction Avenue</p>
                <p className="text-sm text-slate-600">Tech Park, Bangalore 560001</p>
                <p className="text-sm text-slate-600">GSTIN: 29ABCDE1234F1Z5</p>
              </div>
              <div className="text-right">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">To</h3>
                <p className="font-bold text-slate-800">{viewingInvoice.targetName}</p>
                <p className="text-sm text-slate-600 mt-1">{isViewPayslip ? 'Role:' : 'Project:'} {viewingInvoice.targetRoleOrProject}</p>
                <p className="text-sm text-slate-600">{isViewPayslip ? 'Site:' : 'Location:'} {viewingInvoice.targetLocationOrSite}</p>
              </div>
            </div>

            <table className="w-full text-left mb-8">
              <thead className="border-b-2 border-slate-800">
                <tr>
                  <th className="py-3 text-sm font-bold text-slate-800 uppercase tracking-wider w-2/5">Description</th>
                  <th className="py-3 text-sm font-bold text-slate-800 uppercase tracking-wider text-center w-1/6">Qty</th>
                  <th className="py-3 text-sm font-bold text-slate-800 uppercase tracking-wider text-right w-1/6">Rate</th>
                  {!isViewPayslip && (
                    <th className="py-3 text-sm font-bold text-slate-800 uppercase tracking-wider text-right w-1/6">GST %</th>
                  )}
                  <th className="py-3 text-sm font-bold text-slate-800 uppercase tracking-wider text-right w-1/6">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {viewingInvoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 font-medium text-slate-800">{item.description}</td>
                    <td className="py-3 text-center text-slate-600">{item.qty}</td>
                    <td className="py-3 text-right text-slate-600">{formatCurrency(item.rate)}</td>
                    {!isViewPayslip && (
                      <td className="py-3 text-right text-slate-600">{item.gstPercent}%</td>
                    )}
                    <td className="py-3 text-right font-medium text-slate-800">{formatCurrency(item.qty * item.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end border-t border-slate-200 pt-6">
              <div className="w-1/2 max-w-sm">
                <div className="flex justify-between py-2 text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(viewingInvoice.subtotal)}</span>
                </div>
                {!isViewPayslip && (
                  <>
                    <div className="flex justify-between py-2 text-sm text-slate-600">
                      <span>CGST</span>
                      <span className="font-medium">{formatCurrency(viewingInvoice.totalGst / 2)}</span>
                    </div>
                    <div className="flex justify-between py-2 text-sm text-slate-600 border-b border-slate-200">
                      <span>SGST</span>
                      <span className="font-medium">{formatCurrency(viewingInvoice.totalGst / 2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between py-4 text-lg font-bold text-slate-800">
                  <span>{isViewPayslip ? 'Net Payable' : 'Total Amount'}</span>
                  <span>{formatCurrency(viewingInvoice.total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-slate-200">
              {!isViewPayslip ? (
                <>
                  <p className="text-sm font-semibold text-slate-800 mb-2">Bank Details for Transfer:</p>
                  <p className="text-xs text-slate-600">Bank: HDFC Bank | Account Name: BB Builders Pvt Ltd | A/C No: 50100012345678 | IFSC: HDFC0001234</p>
                </>
              ) : (
                <p className="text-xs text-slate-600">This payslip is a record of your salary distribution for the specified period.</p>
              )}
              <p className="text-xs text-slate-400 mt-6 italic text-center">Thank you. This is a computer-generated document and does not require a signature.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= RENDER CREATE (DEFAULT) =================
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Invoice Generation Center</h1>
          <p className="text-slate-500 mt-1">Generate professional invoices, purchase orders, and payslips.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('history')}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-sm rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            <History size={16} />
            <span>History</span>
          </button>
          <button 
            onClick={handleSaveInvoice}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-sm rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            <Save size={16} />
            <span>Generate & Save</span>
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-sm rounded-lg font-medium transition-colors whitespace-nowrap">
            <Printer size={16} />
            <span>Print Now</span>
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm rounded-lg font-medium transition-colors whitespace-nowrap">
            <Download size={16} />
            <span>Save as PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-4 print:hidden">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="font-semibold text-slate-700 whitespace-nowrap">Type:</label>
          <select 
            value={invoiceType}
            onChange={(e) => {
              setInvoiceType(e.target.value);
              setSelectedEntity('');
            }}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Client Invoice</option>
            <option>Material Purchase Order</option>
            <option>Worker Payslip</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 w-full">
          <label className="font-semibold text-slate-700 whitespace-nowrap">
            {isPayslip ? 'Worker:' : 'Project:'}
          </label>
          <select 
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select {isPayslip ? 'Worker' : 'Project'} --</option>
            {isPayslip 
              ? workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.skill})</option>)
              : projects.map(p => <option key={p.id} value={p.id}>{p.name} - {p.client}</option>)
            }
          </select>
        </div>
      </div>

      {/* The Printable Invoice Area */}
      <div id="invoice-content" className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-4xl mx-auto print:shadow-none print:border-none print:w-full">
        <div className="p-10">
          
          <div className="flex justify-between items-start border-b border-slate-200 pb-8">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="BB Builders Logo" className="h-20 object-contain" />
              <div>
                <p className="text-sm text-slate-500 font-medium">Enterprise Construction & Management</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-light text-slate-400 uppercase tracking-widest">{invoiceType}</h2>
              <p className="text-slate-800 font-semibold mt-2">No: <span className="font-mono text-slate-600">DRAFT</span></p>
              <p className="text-sm text-slate-500">Date: {new Date().toISOString().split('T')[0]}</p>
            </div>
          </div>

          <div className="flex justify-between mt-8 mb-12">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">From</h3>
              <p className="font-bold text-slate-800">BB Builders ERP</p>
              <p className="text-sm text-slate-600 mt-1">123 Construction Avenue</p>
              <p className="text-sm text-slate-600">Tech Park, Bangalore 560001</p>
              <p className="text-sm text-slate-600">GSTIN: 29ABCDE1234F1Z5</p>
            </div>
            <div className="text-right">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">To</h3>
              {isPayslip ? (
                <>
                  <p className="font-bold text-slate-800">{targetWorker ? targetWorker.name : 'Worker Name'}</p>
                  <p className="text-sm text-slate-600 mt-1">Role: {targetWorker ? targetWorker.skill : 'Skill'}</p>
                  <p className="text-sm text-slate-600">Site: {targetWorker ? targetWorker.site : 'Assigned Site'}</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-slate-800">{targetProject ? targetProject.client : 'Client/Vendor Name'}</p>
                  <p className="text-sm text-slate-600 mt-1">Project: {targetProject ? targetProject.name : 'Project Name'}</p>
                  <p className="text-sm text-slate-600">Location: {targetProject ? targetProject.location : 'Project Location'}</p>
                </>
              )}
            </div>
          </div>

          <table className="w-full text-left mb-4">
            <thead className="border-b-2 border-slate-800">
              <tr>
                <th className="py-3 text-sm font-bold text-slate-800 uppercase tracking-wider w-2/5">Description</th>
                <th className="py-3 text-sm font-bold text-slate-800 uppercase tracking-wider text-center w-1/6">Qty</th>
                <th className="py-3 text-sm font-bold text-slate-800 uppercase tracking-wider text-right w-1/6">Rate</th>
                {!isPayslip && (
                  <th className="py-3 text-sm font-bold text-slate-800 uppercase tracking-wider text-right w-1/6">GST %</th>
                )}
                <th className="py-3 text-sm font-bold text-slate-800 uppercase tracking-wider text-right w-1/6">Amount</th>
                <th className="py-3 w-10 print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="group">
                  <td className="py-3">
                    <input 
                      type="text" 
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                      className="w-full bg-transparent font-medium text-slate-800 focus:outline-none focus:border-b focus:border-blue-300 print:border-none"
                    />
                  </td>
                  <td className="py-3 text-center">
                    <input 
                      type="number" 
                      value={item.qty}
                      onChange={(e) => updateItem(item.id, 'qty', Number(e.target.value))}
                      className="w-full text-center bg-transparent text-slate-600 focus:outline-none focus:border-b focus:border-blue-300 print:border-none"
                    />
                  </td>
                  <td className="py-3 text-right">
                    <input 
                      type="number" 
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                      className="w-full text-right bg-transparent text-slate-600 focus:outline-none focus:border-b focus:border-blue-300 print:border-none"
                    />
                  </td>
                  {!isPayslip && (
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <input 
                          type="number" 
                          value={item.gstPercent}
                          onChange={(e) => updateItem(item.id, 'gstPercent', Number(e.target.value))}
                          className="w-12 text-right bg-transparent text-slate-600 focus:outline-none focus:border-b focus:border-blue-300 print:border-none"
                        />
                        <span className="text-slate-500">%</span>
                      </div>
                    </td>
                  )}
                  <td className="py-3 text-right font-medium text-slate-800">
                    {formatCurrency(item.qty * item.rate)}
                  </td>
                  <td className="py-3 text-right print:hidden">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <button 
            onClick={addItem}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors print:hidden mb-8"
          >
            <Plus size={16} /> Add Line Item
          </button>

          <div className="flex justify-end border-t border-slate-200 pt-6">
            <div className="w-1/2 max-w-sm">
              <div className="flex justify-between py-2 text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              
              {!isPayslip && (
                <>
                  <div className="flex justify-between py-2 text-sm text-slate-600">
                    <span>CGST</span>
                    <span className="font-medium">{formatCurrency(totalGst / 2)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm text-slate-600 border-b border-slate-200">
                    <span>SGST</span>
                    <span className="font-medium">{formatCurrency(totalGst / 2)}</span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between py-4 text-lg font-bold text-slate-800">
                <span>{isPayslip ? 'Net Payable' : 'Total Amount'}</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-200">
            {!isPayslip ? (
              <>
                <p className="text-sm font-semibold text-slate-800 mb-2">Bank Details for Transfer:</p>
                <p className="text-xs text-slate-600">Bank: HDFC Bank | Account Name: BB Builders Pvt Ltd | A/C No: 50100012345678 | IFSC: HDFC0001234</p>
              </>
            ) : (
              <p className="text-xs text-slate-600">This payslip is a record of your salary distribution for the specified period.</p>
            )}
            <p className="text-xs text-slate-400 mt-6 italic text-center">Thank you. This is a computer-generated document and does not require a signature.</p>
          </div>

        </div>
      </div>
      
    </div>
  );
}
