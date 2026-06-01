import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle, XCircle, Clock, AlertCircle, MapPin, CheckCircle2, Unlock } from 'lucide-react';
import { useWorkers } from '../store/useWorkers';
import { useSites } from '../store/useSites';
import { useAuth } from '../store/useAuth';
import { useFinance } from '../store/useFinance';

export default function Attendance() {
  const { workers, updateWorker } = useWorkers();
  const { sites } = useSites();
  const { user } = useAuth();
  const { addTransaction } = useFinance();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [records, setRecords] = useState<any[]>([]);

  // 1. Derive isProcessed directly from Database State
  // A day is processed if any active worker has an attendance log for this date.
  const isProcessedForDate = workers.length > 0 && workers.some(w => w.attendance?.some(a => a.date === date));
  const isProcessed = isProcessedForDate && !isUnlocked;
  
  // Reload records whenever date changes or worker list is updated
  useEffect(() => {
    setRecords(
      workers.map(w => {
        const pastRecord = w.attendance?.find(a => a.date === date);
        return {
          id: w.id,
          name: w.name,
          skill: w.skill,
          site: w.site,
          baseWage: w.dailyRate,
          status: pastRecord ? pastRecord.status : (w.status === 'On Leave' ? 'Absent' : 'Present'),
          overtime: 0
        };
      })
    );
    setIsUnlocked(false);
  }, [workers, date]);

  const activeSiteNames = ['Unassigned', ...sites.filter(s => s.status === 'Active').map(s => s.name)];

  const handleStatusChange = (id: string, newStatus: string) => {
    if (isProcessed) return;
    setRecords(records.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const handleSiteChange = (id: string, newSite: string) => {
    if (isProcessed) return;
    setRecords(records.map(r => r.id === id ? { ...r, site: newSite } : r));
  };

  const calculateWage = (record: any, customStatus?: string) => {
    const status = customStatus || record.status;
    if (status === 'Absent') return 0;
    let base = status === 'Half-Day' ? record.baseWage / 2 : record.baseWage;
    let otPay = record.overtime * (record.baseWage / 8); 
    return Math.round(base + otPay);
  };

  const handleSaveChanges = (isEOD = false, isEdit = false) => {
    const siteLaborCosts: Record<string, number> = {};

    records.forEach(record => {
      const currentWorker = workers.find(w => w.id === record.id);
      if (!currentWorker) return;

      let updatePayload: any = {
        site: record.site,
        status: record.status === 'Absent' ? 'On Leave' : 'Active'
      };

      const calculatedWage = calculateWage(record);

      if (isEOD) {
        // Standard Checkout: Log Salary and Add to History
        updatePayload.balance = (currentWorker.balance || 0) + calculatedWage;
        updatePayload.attendance = [
            ...(currentWorker.attendance || []), 
            { date: date, status: record.status, paid: false, wage: calculatedWage, site: record.site }
        ];

        if (record.site && record.site !== 'Unassigned' && calculatedWage > 0) {
          siteLaborCosts[record.site] = (siteLaborCosts[record.site] || 0) + calculatedWage;
        }
      } else if (isEdit) {
        // Admin Historical Override: Recalculate difference and update History
        const oldRecord = currentWorker.attendance?.find(a => a.date === date);
        if (oldRecord) {
           const oldWage = calculateWage(record, oldRecord.status);
           const newWage = calculateWage(record);
           const diff = newWage - oldWage;
           
           updatePayload.balance = (currentWorker.balance || 0) + diff;
           updatePayload.attendance = currentWorker.attendance?.map(a => a.date === date ? { date, status: record.status, paid: a.paid, wage: newWage, site: record.site } : a);
        } else {
           // If somehow they had no record, treat as new
           updatePayload.balance = (currentWorker.balance || 0) + calculateWage(record);
           updatePayload.attendance = [...(currentWorker.attendance || []), { date: date, status: record.status, paid: false, wage: calculateWage(record), site: record.site }];
        }
      }

      updateWorker(record.id, updatePayload);
    });
    
    if (isEOD) {
      alert('End of day processed! Worker histories locked and daily salaries added to their accounts.');
      setIsUnlocked(false);
    } else if (isEdit) {
      alert('Historical attendance updated and balances corrected successfully!');
      setIsUnlocked(false);
    } else {
      alert('Attendance and site assignments saved temporarily!');
    }
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isPast5PM = () => {
    const istHour = parseInt(
      currentTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour12: false, hour: 'numeric' })
    );
    return istHour >= 17;
  };

  // Only check time if we are looking at TODAY. Past days can't be EOD processed again.
  const isToday = date === new Date().toISOString().split('T')[0];
  const canProcess = isPast5PM() && isToday && !isProcessedForDate;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daily Attendance & Site Assignment</h1>
          <p className="text-slate-500 mt-1">Assign workers to sites and manage daily logs.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-300">
            <CalendarIcon size={18} className="text-slate-500" />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none"
            />
          </div>
          
          {!isProcessed && !isUnlocked && isToday && (
            <button 
              onClick={() => handleSaveChanges(false, false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-sm"
            >
              Save Draft
            </button>
          )}

          {isUnlocked && (
            <button 
              onClick={() => handleSaveChanges(false, true)}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-sm"
            >
              Save Admin Override
            </button>
          )}
        </div>
      </div>

      {isProcessedForDate && !isUnlocked && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg flex justify-between items-center">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-emerald-800">Day Locked</h3>
              <p className="text-sm text-emerald-700">Wages have been calculated and histories updated. No further edits can be made.</p>
            </div>
          </div>
          
          {/* Admin Unlock Button */}
          {(user?.role === 'Admin' || user?.role === 'Super Admin') && (
            <button 
              onClick={() => setIsUnlocked(true)}
              className="flex items-center gap-2 text-rose-700 bg-rose-100 hover:bg-rose-200 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <Unlock size={16} /> Unlock (Admin)
            </button>
          )}
        </div>
      )}

      {!isProcessed && !canProcess && isToday && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start gap-3">
          <Clock className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-amber-800">Checkout Locked</h3>
            <p className="text-sm text-amber-700">Daily processing and salary logging is only available after <strong>5:00 PM IST</strong>. Please wait until the end of the workday.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Worker ID & Name</th>
                <th className="px-6 py-4">Assigned Site</th>
                <th className="px-6 py-4">Attendance Status</th>
                <th className="px-6 py-4">OT (Hrs)</th>
                <th className="px-6 py-4 text-right">EOD Salary (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-blue-600">{record.name}</p>
                    <p className="text-xs font-medium text-slate-500">{record.id} • {record.skill}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-slate-400" />
                      <select 
                        value={record.site}
                        onChange={(e) => handleSiteChange(record.id, e.target.value)}
                        disabled={isProcessed || record.status === 'Absent'}
                        className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer disabled:opacity-50 w-full"
                      >
                        {activeSiteNames.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatusChange(record.id, 'Present')}
                        disabled={isProcessed}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${record.status === 'Present' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'} disabled:opacity-50`}
                      >
                        <CheckCircle size={14} /> P
                      </button>
                      <button 
                        onClick={() => handleStatusChange(record.id, 'Absent')}
                        disabled={isProcessed}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${record.status === 'Absent' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'} disabled:opacity-50`}
                      >
                        <XCircle size={14} /> A
                      </button>
                      <button 
                        onClick={() => handleStatusChange(record.id, 'Half-Day')}
                        disabled={isProcessed}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${record.status === 'Half-Day' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'} disabled:opacity-50`}
                      >
                        <Clock size={14} /> HD
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="number" 
                      min="0"
                      max="12"
                      value={record.overtime}
                      disabled={isProcessed || record.status === 'Absent'}
                      className="w-16 px-2 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 text-center"
                      onChange={(e) => {
                        if (!isProcessed) {
                          setRecords(records.map(r => r.id === record.id ? { ...r, overtime: Number(e.target.value) } : r));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-bold text-lg ${record.status === 'Absent' ? 'text-slate-400' : 'text-slate-800'}`}>
                      ₹{calculateWage(record)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* End of Day Processor Button */}
        {!isProcessed && isToday && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button 
              onClick={() => handleSaveChanges(true, false)}
              disabled={!canProcess}
              className={`px-6 py-2.5 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-md ${
                canProcess 
                  ? 'bg-slate-900 hover:bg-slate-800 text-white' 
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Clock size={18} />
              Process 5:00 PM Checkout & Log Salary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
