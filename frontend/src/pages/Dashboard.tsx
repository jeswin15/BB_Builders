import React, { useMemo } from 'react';
import { useAuth } from '../store/useAuth';
import { useProjects } from '../store/useProjects';
import { useFinance } from '../store/useFinance';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, TrendingUp, TrendingDown, IndianRupee, Layers, CheckCircle2,
  AlertCircle, Activity, ArrowUpRight, ArrowDownRight, ArrowRight
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const projects = useProjects(state => state.projects);
  const transactions = useFinance(state => state.transactions);

  // Dynamic calculations
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status !== 'Completed').length;

  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
  
  const materialCost = transactions.filter(t => t.category === 'Material').reduce((acc, curr) => acc + curr.amount, 0);
  const labourCost = transactions.filter(t => t.category === 'Payroll').reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const recentTx = transactions.slice(0, 5).map(t => ({
    date: t.date,
    type: t.category,
    desc: t.description,
    project: 'Multiple',
    amt: `${t.type === 'Income' ? '+' : '-'} ₹ ${t.amount.toLocaleString()}`,
    ptype: 'Bank Transfer'
  }));

  const pieData = [
    { name: 'Income', value: totalIncome, color: '#10b981' }, 
    { name: 'Expense', value: totalExpense, color: '#f96b07' }, 
  ];

  const topProjects = projects.slice(0, 5).map(p => ({
    name: p.name,
    cost: `₹ ${p.budget.toLocaleString()}`,
    pl: 'N/A', // Require complex linking of transactions to projects for exact PL
    status: p.status
  }));

  // Dummy line chart data since we need historical aggregated data which requires complex grouping
  const lineChartData = [
    { name: 'Latest', material: materialCost, labour: labourCost, other: totalExpense - materialCost - labourCost }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium">Home / Dashboard</p>
        </div>
      </div>

      {user?.role === 'Super Admin' || user?.role === 'Admin' ? (
        <>
          {/* TIER 1: Top Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Projects */}
            <div 
              onClick={() => navigate('/projects')}
              className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-slate-500">Total Projects</p>
                <div className="text-blue-500"><Building2 size={20} /></div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{totalProjects}</p>
              <p className="text-xs text-slate-400 mt-2">{activeProjects} Active Projects</p>
            </div>
            
            {/* Total Expense */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-slate-500">Total Expense</p>
                <div className="text-rose-500"><ArrowDownRight size={20} /></div>
              </div>
              <p className="text-3xl font-bold text-slate-800">₹ {totalExpense.toLocaleString()}</p>
              <p className="text-xs font-semibold text-slate-400 mt-2 flex items-center gap-1">
                 Total logged expenses
              </p>
            </div>

            {/* Material Cost */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-slate-500">Material Cost</p>
                <div className="text-amber-500"><Layers size={20} /></div>
              </div>
              <p className="text-3xl font-bold text-slate-800">₹ {materialCost.toLocaleString()}</p>
              <p className="text-xs font-semibold text-slate-400 mt-2 flex items-center gap-1">
                 Total logged materials
              </p>
            </div>

            {/* Labour Cost */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-slate-500">Labour Cost</p>
                <div className="text-rose-500"><Activity size={20} /></div>
              </div>
              <p className="text-3xl font-bold text-slate-800">₹ {labourCost.toLocaleString()}</p>
              <p className="text-xs font-semibold text-slate-400 mt-2 flex items-center gap-1">
                 Total logged payroll
              </p>
            </div>

            {/* Profit / Loss */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-slate-500">Net Profit</p>
                <div className="text-emerald-500"><ArrowUpRight size={20} /></div>
              </div>
              <p className="text-3xl font-bold text-slate-800">₹ {netProfit.toLocaleString()}</p>
              <p className="text-xs font-semibold text-slate-400 mt-2 flex items-center gap-1">
                 Total Income - Expenses
              </p>
            </div>
          </div>

          {/* TIER 2: Charts and Tables */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            
            {/* Expenses Overview Line Chart */}
            <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
              <h3 className="text-sm font-semibold text-slate-800 mb-6">Expenses Overview</h3>
              <div className="flex-1 min-h-[250px] w-full">
                {transactions.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹ ${val}`} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="material" name="Material Cost" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="labour" name="Labour Cost" stroke="#f96b07" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="other" name="Other Expenses" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">No data available</div>
                )}
              </div>
            </div>

            {/* Project Profit/Loss Donut Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Income vs Expense</h3>
              <div className="flex-1 relative flex items-center justify-center min-h-[200px]">
                {transactions.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                ) : (
                  <div className="text-slate-400">No data available</div>
                )}
                {/* Centered text inside Donut */}
                {transactions.length > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-xs text-slate-500 font-medium">Net Profit</p>
                  <p className="text-sm font-bold text-slate-800">₹ {netProfit.toLocaleString()}</p>
                </div>
                )}
              </div>
              <div className="mt-4 space-y-3">
                {transactions.length > 0 && pieData.map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                      <span className="text-slate-600 font-medium">{d.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">₹ {d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Project Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Project Summary</h3>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="pb-3 font-medium">Project</th>
                      <th className="pb-3 font-medium text-right">Budget</th>
                      <th className="pb-3 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {topProjects.length > 0 ? topProjects.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-3 font-medium text-slate-800 whitespace-nowrap pr-2">{p.name}</td>
                        <td className="py-3 text-slate-600 text-right whitespace-nowrap pr-2">{p.cost}</td>
                        <td className="py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                            p.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={3} className="py-4 text-center text-slate-400">No projects found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-center">
                <button 
                  onClick={() => navigate('/projects')}
                  className="text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors border border-blue-200 rounded px-4 py-1"
                >
                  View All Projects
                </button>
              </div>
            </div>

          </div>

          {/* TIER 3: Ledgers and Cash Flow */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Transactions Table */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-slate-800">Recent Transactions</h3>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium rounded-l-lg">Date</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium text-right">Amount</th>
                      <th className="px-4 py-3 font-medium rounded-r-lg">Project</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentTx.length > 0 ? recentTx.map((tx, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{tx.date}</td>
                        <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{tx.type}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{tx.desc}</td>
                        <td className={`px-4 py-3 font-bold text-right whitespace-nowrap ${tx.amt.startsWith('+') ? 'text-emerald-500' : 'text-slate-800'}`}>
                          {tx.amt}
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{tx.project}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="py-4 text-center text-slate-400">No transactions recorded</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cash Flow Summary Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
              <h3 className="text-sm font-semibold text-slate-800 mb-6">Cash Flow</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-xs font-semibold text-slate-500">Total Inflow</p>
                    <p className="text-sm font-bold text-emerald-500">₹ {totalIncome.toLocaleString()}</p>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-400 h-2 rounded-full" style={{ width: totalIncome > 0 ? '100%' : '0%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-xs font-semibold text-slate-500">Total Outflow</p>
                    <p className="text-sm font-bold text-rose-500">₹ {totalExpense.toLocaleString()}</p>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-rose-400 h-2 rounded-full" style={{ width: totalExpense > 0 ? (totalExpense / Math.max(totalIncome, totalExpense) * 100) + '%' : '0%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center">
                <p className="text-sm font-bold text-slate-700">Net Cash Flow</p>
                <p className={`text-lg font-black ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>₹ {netProfit.toLocaleString()}</p>
              </div>
            </div>

          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 bg-slate-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome to BB Builders</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            You are logged in as {user?.role}. Please use the sidebar to navigate to your assigned modules.
          </p>
        </div>
      )}
      
    </div>
  );
}
