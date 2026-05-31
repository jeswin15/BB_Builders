import React, { useState } from 'react';
import { useAuth } from '../store/useAuth';
import { useWorkers } from '../store/useWorkers';
import { Calendar as CalendarIcon, IndianRupee, Clock, Briefcase, AlertCircle, TrendingUp, HandCoins, PiggyBank, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const { workers } = useWorkers();
  const [selectedWorker, setSelectedWorker] = useState<any>(null);

  // We add a default status to the workers for display if they aren't marked present yet today.
  const workersList = workers.map(w => ({
    ...w,
    status: w.status === 'Active' ? 'Present' : w.status
  }));

  const stats = [
    { label: 'Pending Payment', value: '₹4,500', icon: IndianRupee, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Advance Taken', value: '₹1,500', icon: HandCoins, color: 'text-rose-600', bg: 'bg-rose-100' },
    { label: 'Net Payable (This Week)', value: '₹3,000', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Total Earnings (May)', value: '₹22,400', icon: PiggyBank, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  // Simple mock for calendar rendering
  const daysInMonth = 31;
  const startDay = 5; // Friday
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const day = i - startDay + 1;
    if (day > 0 && day <= daysInMonth) return day;
    return null;
  });

  const getAttendanceStatus = (day: number) => {
    if ([5, 12, 19, 26].includes(day)) return 'sunday';
    if ([4, 11, 18, 25].includes(day)) return 'payday';
    if (day > 28) return 'future';
    if (day === 15) return 'absent';
    if (day === 22) return 'half';
    return 'present';
  };

  if (!selectedWorker) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Worker Roster</h1>
            <p className="text-sm text-slate-500 font-medium">Click on a worker to view their detailed attendance and payroll portal.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Worker Name</th>
                <th className="px-6 py-4 font-semibold">Worker ID</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Daily Wage</th>
                <th className="px-6 py-4 font-semibold">Today's Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workersList.map((worker, i) => (
                <tr 
                  key={i} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedWorker(worker)}
                >
                  <td className="px-6 py-4 font-bold text-blue-600">{worker.name}</td>
                  <td className="px-6 py-4 font-medium text-slate-600">{worker.id}</td>
                  <td className="px-6 py-4 text-slate-500">{worker.role}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">₹{worker.wage}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      worker.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {worker.status === 'Present' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {worker.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- DETAILED WORKER VIEW ---
  return (
    <div className="space-y-6">
      <button 
        onClick={() => setSelectedWorker(null)}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition-colors mb-4"
      >
        <ArrowLeft size={20} />
        Back to Worker List
      </button>

      {/* Alert Banner */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm flex items-start gap-3">
        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-semibold text-amber-800">Weekly Salary Reminder</h3>
          <p className="text-sm text-amber-700">Every week on <strong>Saturday</strong> is Salary Day. Please ensure all your attendance is properly logged by Friday evening.</p>
        </div>
      </div>

      {/* Header */}
      <div className="bg-slate-900 rounded-xl p-8 text-white shadow-md flex justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <div>
          <h1 className="text-3xl font-bold mb-2">{selectedWorker.name}'s Portal</h1>
          <p className="text-slate-400">Worker ID: {selectedWorker.id} | Skill: {selectedWorker.role}</p>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Current Site</p>
          <p className="text-xl font-bold text-blue-400">Downtown Commercial</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <Icon size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-slate-800">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="text-blue-600" /> Attendance Calendar
            </h2>
            <div className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              May 2026
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-slate-500 mb-2">
            <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div className="text-emerald-600">Sat</div><div className="text-rose-500">Sun</div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, i) => {
              if (!day) return <div key={i} className="aspect-square bg-slate-50/50 rounded-lg"></div>;
              
              const status = getAttendanceStatus(day);
              let bg = 'bg-slate-50 text-slate-400';
              let badge = null;
              
              if (status === 'present') bg = 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200';
              if (status === 'absent') bg = 'bg-rose-50 text-rose-700 font-bold border border-rose-200';
              if (status === 'half') bg = 'bg-amber-50 text-amber-700 font-bold border border-amber-200';
              if (status === 'sunday') bg = 'bg-slate-100 text-slate-400';
              if (status === 'payday') {
                bg = 'bg-blue-50 text-blue-700 font-bold border-2 border-blue-300';
                badge = <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>;
              }

              return (
                <div key={i} className={`relative aspect-square rounded-lg flex items-center justify-center text-lg ${bg} transition-transform hover:scale-105 cursor-pointer`}>
                  {day}
                  {badge}
                  {status === 'half' && <div className="absolute bottom-1 w-3/4 h-1 bg-amber-300 rounded-full"></div>}
                  {status === 'present' && <div className="absolute bottom-1 w-3/4 h-1 bg-emerald-400 rounded-full"></div>}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600 justify-center">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-400"></div> Present</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-300"></div> Half-Day</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-400"></div> Absent</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Payday (Sat)</div>
          </div>
        </div>

        {/* History List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800">Recent Logs</h2>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {[
              { date: 'May 28, Thu', status: 'Present', val: `₹${selectedWorker.wage}` },
              { date: 'May 27, Wed', status: 'Present', val: `₹${selectedWorker.wage}` },
              { date: 'May 26, Tue', status: 'Advance', val: '-₹1500', isAdvance: true },
              { date: 'May 25, Mon', status: 'Present', val: `₹${selectedWorker.wage}` },
              { date: 'May 23, Sat', status: 'Salary Paid', val: '₹4,500', isPaid: true },
            ].map((log, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-slate-50">
                <div>
                  <p className="font-semibold text-slate-800">{log.date}</p>
                  <p className={`text-xs font-bold uppercase tracking-wider ${
                    log.isAdvance ? 'text-rose-600' : log.isPaid ? 'text-blue-600' : 'text-emerald-600'
                  }`}>{log.status}</p>
                </div>
                <div className={`font-black ${log.isAdvance ? 'text-rose-600' : 'text-slate-800'}`}>
                  {log.val}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
