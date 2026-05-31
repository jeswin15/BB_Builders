import React, { useState } from 'react';
import { Plus, Receipt, IndianRupee, FileText, Download, TrendingUp, HandCoins, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../store/useFinance';
import type { Transaction } from '../store/useFinance';
import { useWorkers } from '../store/useWorkers';
import { useClients } from '../store/useClients';
import { useSites } from '../store/useSites';

export default function Finance() {
  const { transactions, addTransaction } = useFinance();
  const { workers, updateWorker } = useWorkers();
  const { clients } = useClients();
  const { sites } = useSites();
  const [activeTab, setActiveTab] = useState('payroll');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    type: 'Expense',
    category: 'Other',
    description: '',
    amount: 0,
    site: ''
  });

  const tabs = [
    { id: 'payroll', label: 'Payroll & Advances' },
    { id: 'expenses', label: 'Expenses log' },
    { id: 'invoices', label: 'Income Log' },
  ];

  // Derived Metrics
  const totalInvoiced = transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingPayroll = workers.reduce((sum, w) => sum + ((w.balance || 0) - (w.advances || 0)), 0);
  const activeAdvances = workers.reduce((sum, w) => sum + (w.advances || 0), 0);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    return `₹${val.toLocaleString()}`;
  };

  const handleProcessPayroll = (worker: any) => {
    const netPayable = (worker.balance || 0) - (worker.advances || 0);
    
    if (netPayable <= 0 && worker.balance <= 0) {
      alert("No pending balance to process for this worker.");
      return;
    }

    if (window.confirm(`Process payroll of ₹${netPayable.toLocaleString()} for ${worker.name}?`)) {
      // 1. Log Transaction
      if (netPayable > 0) {
        addTransaction({
          id: `TRX-${Date.now().toString().slice(-5)}`,
          date: new Date().toISOString().split('T')[0],
          type: 'Expense',
          category: 'Payroll',
          description: `Payroll processed for ${worker.name} (${worker.id})`,
          amount: netPayable
        });
      }

      // 2. Reset Worker Balance
      updateWorker(worker.id, {
        balance: 0,
        advances: 0
      });

      alert(`Payroll processed successfully for ${worker.name}!`);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await addTransaction({
      id: `TRX-${Date.now().toString().slice(-5)}`,
      date: newTx.date || new Date().toISOString().split('T')[0],
      type: newTx.type || 'Expense',
      category: newTx.category || 'Other',
      description: newTx.description || '',
      amount: Number(newTx.amount) || 0,
      site: newTx.site || undefined
    } as Transaction);
    setIsSubmitting(false);
    setIsModalOpen(false);
    setNewTx({
      date: new Date().toISOString().split('T')[0],
      type: 'Expense',
      category: 'Other',
      description: '',
      amount: 0,
      site: ''
    });
  };

  const handleGiveAdvance = (worker: any) => {
    const amountStr = window.prompt(`Enter cash advance amount for ${worker.name}:`);
    if (!amountStr) return;
    
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    // Log the advance as an expense
    addTransaction({
      id: `TRX-${Date.now().toString().slice(-5)}`,
      date: new Date().toISOString().split('T')[0],
      type: 'Expense',
      category: 'Payroll',
      description: `Cash Advance given to ${worker.name} (${worker.id})`,
      amount: amount
    });

    // Update worker's advances total
    updateWorker(worker.id, {
      advances: (worker.advances || 0) + amount
    });

    alert(`Advance of ₹${amount.toLocaleString()} recorded for ${worker.name}.`);
  };

  const expenses = transactions.filter(t => t.type === 'Expense');
  const incomes = transactions.filter(t => t.type === 'Income');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Financial Operations</h1>
          <p className="text-slate-500 mt-1">Manage payroll, expenses, and automated client invoicing.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto">
            <Download size={18} />
            <span>Export Report</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto"
          >
            <Plus size={18} />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Income</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(totalInvoiced)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Expenses Logged</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Receipt size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Payroll</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(pendingPayroll)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
            <HandCoins size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Advances</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(activeAdvances)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-4">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'payroll' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Worker Ledger & Payroll</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Worker</th>
                      <th className="px-4 py-3">Gross Balance</th>
                      <th className="px-4 py-3 text-rose-600">Advances Deducted</th>
                      <th className="px-4 py-3 font-semibold">Net Payable</th>
                      <th className="px-4 py-3 rounded-r-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {workers.map(worker => {
                      const balance = worker.balance || 0;
                      const advances = worker.advances || 0;
                      const netPayable = balance - advances;
                      
                      return (
                        <tr key={worker.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800">{worker.name}</p>
                            <p className="text-xs text-slate-500">{worker.skill}</p>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-700">₹{balance.toLocaleString()}</td>
                          <td className="px-4 py-3 text-rose-600">{advances > 0 ? `-₹${advances.toLocaleString()}` : '₹0'}</td>
                          <td className="px-4 py-3 font-bold text-slate-800">
                            {netPayable < 0 ? <span className="text-rose-600">-₹{Math.abs(netPayable).toLocaleString()}</span> : `₹${netPayable.toLocaleString()}`}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleGiveAdvance(worker)}
                                className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1"
                              >
                                <HandCoins size={16} /> Advance
                              </button>
                              {balance > 0 || advances > 0 ? (
                                <button 
                                  onClick={() => handleProcessPayroll(worker)}
                                  className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                                >
                                  <CheckCircle2 size={16} /> Pay
                                </button>
                              ) : (
                                <span className="text-xs text-slate-400 font-medium px-3 py-1.5">Settled</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Expense Log</h2>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Date</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No expenses logged yet.</td>
                    </tr>
                  ) : (
                    expenses.map(exp => (
                      <tr key={exp.id}>
                        <td className="px-4 py-3">{exp.date}</td>
                        <td className="px-4 py-3">
                          <span className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600">{exp.category}</span>
                        </td>
                        <td className="px-4 py-3">{exp.description}</td>
                        <td className="px-4 py-3 font-semibold text-rose-600">-₹{exp.amount.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Income Log</h2>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Transaction ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right rounded-r-lg">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incomes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No income logged yet.</td>
                    </tr>
                  ) : (
                    incomes.map(inc => (
                      <tr key={inc.id}>
                        <td className="px-4 py-3 font-medium text-blue-600">{inc.id}</td>
                        <td className="px-4 py-3">{inc.date}</td>
                        <td className="px-4 py-3">{inc.description}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-600 text-right">+₹{inc.amount.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">New Transaction</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Type</label>
                  <select 
                    value={newTx.type}
                    onChange={(e) => setNewTx({...newTx, type: e.target.value as any})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Date</label>
                  <input 
                    type="date" 
                    value={newTx.date}
                    onChange={(e) => setNewTx({...newTx, date: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Category</label>
                  <select 
                    value={newTx.category}
                    onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Payroll">Payroll</option>
                    <option value="Material">Material</option>
                    <option value="Client Payment">Client Payment</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Assign to Site (Optional)</label>
                  <select 
                    value={newTx.site || ''}
                    onChange={(e) => setNewTx({...newTx, site: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">-- General / None --</option>
                    {sites.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Amount (₹)</label>
                <input 
                  type="number" 
                  value={newTx.amount || ''}
                  onChange={(e) => setNewTx({...newTx, amount: Number(e.target.value)})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 5000"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <textarea 
                  value={newTx.description}
                  onChange={(e) => setNewTx({...newTx, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief details about the transaction..."
                  rows={3}
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
