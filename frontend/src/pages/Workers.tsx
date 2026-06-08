import React, { useState } from 'react';
import { Plus, Search, UserCheck, Phone, IndianRupee, ShieldAlert, ArrowLeft, Save, Trash2, CalendarDays, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWorkers } from '../store/useWorkers';
import { useSites } from '../store/useSites';
import { useAuth } from '../store/useAuth';

export default function Workers() {
  const { user } = useAuth();
  const { workers, addWorker, updateWorker, deleteWorker } = useWorkers();
  const { sites } = useSites();
  const activeSiteNames = ['Unassigned', ...sites.filter(s => s.status === 'Active').map(s => s.name)];

  const [editingWorker, setEditingWorker] = useState<any>(null);
  const [viewingWorker, setViewingWorker] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('All Skills');
  
  // Calendar States for the View Log Modal
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);

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
    const nextIdNum = workers.length > 0 
      ? Math.max(...workers.map(w => parseInt(w.id.split('-')[2]) || 0)) + 1 
      : 1;
    const nextId = `WK-2026-${nextIdNum.toString().padStart(3, '0')}`;
    
    setNewWorker({
      id: nextId, name: '', skill: 'Helper', phone: '', site: 'Unassigned', dailyRate: 500, status: 'Active',
      joinDate: new Date().toISOString().split('T')[0], advances: 0, balance: 0, attendance: []
    });
    setIsRegistering(true);
  };

  const handleOpenViewLog = (worker: any) => {
    setViewingWorker(worker);
    setCalendarMonth(new Date());
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const activeWorker = isRegistering ? newWorker : editingWorker;

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = 
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.skill.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesSkill = skillFilter === 'All Skills' || worker.skill === skillFilter;
    
    return matchesSearch && matchesSkill;
  });

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
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Employee ID</label>
                <input type="text" value={activeWorker.id} disabled className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 font-medium cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <input type="text" value={activeWorker.name} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Trade / Skill</label>
                <select value={activeWorker.skill} onChange={(e) => handleInputChange('skill', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Mason</option>
                  <option>Electrician</option>
                  <option>Carpenter</option>
                  <option>Helper</option>
                  <option>Painter</option>
                  <option>Plumber</option>
                  <option>Centering</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Assigned Site</label>
                <select value={activeWorker.site} onChange={(e) => handleInputChange('site', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {activeSiteNames.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                <input type="text" value={activeWorker.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Daily Base Wage (₹)</label>
                <input type="number" value={activeWorker.dailyRate} onChange={(e) => handleInputChange('dailyRate', Number(e.target.value))} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Employment Status</label>
                <select value={activeWorker.status} onChange={(e) => handleInputChange('status', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Active</option>
                  <option>On Leave</option>
                  <option>Terminated</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
              <button type="button" onClick={() => { setEditingWorker(null); setIsRegistering(false); }} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"><Save size={18} />{isRegistering ? 'Register Worker' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- Calendar Helpers ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    if (!viewingWorker) return null;

    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const days = [];
    // Padding empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`pad-${i}`} className="h-10"></div>);
    }
    
    // Day cells
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      
      const record = viewingWorker.attendance?.find((a: any) => a.date === dateStr);
      const isSelected = selectedDate === dateStr;
      
      days.push(
        <div 
          key={dateStr} 
          onClick={() => setSelectedDate(dateStr)}
          className={`h-10 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all border ${
            isSelected 
              ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
              : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700'
          }`}
        >
          <span className="font-semibold text-sm">{i}</span>
          {record && (
            <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
              record.status === 'Present' ? (isSelected ? 'bg-emerald-300' : 'bg-emerald-500') :
              record.status === 'Absent' ? (isSelected ? 'bg-rose-300' : 'bg-rose-500') :
              (isSelected ? 'bg-amber-300' : 'bg-amber-500')
            }`}></div>
          )}
        </div>
      );
    }

    return (
      <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-4">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
            className="p-1.5 hover:bg-white rounded-md border border-transparent hover:border-slate-300 transition-colors"
          >
            <ChevronLeft size={18} className="text-slate-600" />
          </button>
          <h4 className="font-bold text-slate-800">{monthNames[month]} {year}</h4>
          <button 
            onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
            className="p-1.5 hover:bg-white rounded-md border border-transparent hover:border-slate-300 transition-colors"
          >
            <ChevronRight size={18} className="text-slate-600" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1.5">
          {days}
        </div>
      </div>
    );
  };

  const renderSelectedDateDetails = () => {
    if (!viewingWorker || !selectedDate) return null;
    
    const record = viewingWorker.attendance?.find((a: any) => a.date === selectedDate);
    const dateObj = new Date(selectedDate);
    const displayDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

    return (
      <div className="mt-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Log for {displayDate}</h4>
        
        {record ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Status</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-bold ${
                  record.status === 'Present' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                  record.status === 'Absent' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                  'bg-amber-100 text-amber-700 border border-amber-200'
                }`}>
                  {record.status}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 mb-1">Earned Wage</p>
                <p className="text-xl font-bold text-slate-800">
                  {record.wage > 0 ? `₹${record.wage}` : '-'}
                  {record.paid && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ml-2 border border-emerald-100">Paid</span>}
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                <MapPin size={16} className="text-slate-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Site Assigned</p>
                <p className="font-semibold text-slate-800">{record.site || 'Unknown'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CalendarDays size={20} className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">No work records logged for this date.</p>
            <p className="text-sm text-slate-400 mt-1">If the worker was present, their log has not been synced yet.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">

      {/* View Worker Profile & History Modal */}
      {viewingWorker && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <UserCheck size={18} className="text-blue-600"/> Worker Profile & Work Log
              </h3>
              <button onClick={() => setViewingWorker(null)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <UserCheck size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">{viewingWorker.name}</h2>
                      <p className="text-slate-500 font-medium">{viewingWorker.id} • {viewingWorker.skill}</p>
                      <p className="text-sm text-slate-400 flex items-center gap-1 mt-1"><Phone size={12}/> {viewingWorker.phone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <p className="text-xs text-slate-500 font-bold uppercase">Daily Rate</p>
                      <p className="text-lg font-bold text-slate-800">₹{viewingWorker.dailyRate}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <p className="text-xs text-slate-500 font-bold uppercase">Pending Balance</p>
                      <p className="text-lg font-bold text-slate-800">₹{viewingWorker.balance || 0}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 col-span-2">
                      <p className="text-xs text-slate-500 font-bold uppercase">Current Default Site</p>
                      <p className="text-lg font-bold text-slate-800 truncate">{viewingWorker.site}</p>
                    </div>
                  </div>
                </div>

                {/* Calendar View */}
                <div className="flex-1 border-l border-slate-100 pl-0 md:pl-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <CalendarDays size={18} /> Daily Work Calendar
                  </h3>
                  {renderCalendar()}
                  {renderSelectedDateDetails()}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 shrink-0 text-right bg-slate-50">
               <button onClick={() => setViewingWorker(null)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium">Close Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Controls */}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
          <select 
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option>All Skills</option>
            <option>Mason</option>
            <option>Electrician</option>
            <option>Carpenter</option>
            <option>Helper</option>
            <option>Painter</option>
            <option>Plumber</option>
            <option>Centering</option>
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
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredWorkers.map((worker) => (
                <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div 
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => handleOpenViewLog(worker)}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <UserCheck size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-blue-600 group-hover:underline">{worker.name}</p>
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
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenViewLog(worker)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-sm transition-colors border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-md"
                      >
                        View Log
                      </button>
                      <button 
                        onClick={() => setEditingWorker(worker)}
                        className="text-slate-600 hover:text-slate-800 font-bold text-sm transition-colors border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-md"
                      >
                        Edit
                      </button>
                      {(user?.role === 'Admin' || user?.role === 'Super Admin') && (
                        <button 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${worker.name}?`)) {
                              deleteWorker(worker.id);
                            }
                          }}
                          className="text-rose-600 hover:text-rose-800 transition-colors border border-rose-200 hover:bg-rose-50 p-1.5 rounded-md"
                          title="Delete Worker"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
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
