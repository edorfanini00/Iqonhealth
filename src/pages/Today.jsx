import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle, XCircle, Droplet, Activity, AlertTriangle, Scale, Zap, Info, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CalendarGrid from '../components/CalendarGrid';
import { peptidesDB } from '../data/peptides';

// Helper to check if a compound is scheduled for a specific date string (YYYY-MM-DD)
export const isScheduledForDate = (comp, dateStr) => {
  if (!comp.startDate) return false;
  
  const d = new Date(dateStr + 'T00:00:00'); // Local timezone parsing
  const startD = new Date(comp.startDate + 'T00:00:00');
  const endD = comp.endDate ? new Date(comp.endDate + 'T00:00:00') : new Date('2099-01-01');

  if (d < startD || d > endD) return false;

  if (comp.scheduleType === 'daily') return true;

  if (comp.scheduleType === 'custom' && comp.scheduleDays?.length > 0) {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = weekdays[d.getDay()];
    return comp.scheduleDays.includes(dayName);
  }

  if (comp.scheduleType === 'everyX' && comp.scheduleInterval) {
    const diffTime = Math.abs(d - startD);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays % parseInt(comp.scheduleInterval) === 0;
  }

  return false;
};

export default function Today() {
  const navigate = useNavigate();
  const [todayComps, setTodayComps] = useState([]);
  const [logs, setLogs] = useState({}); // { [compId]: true/false }

  const todayStr = new Date().toISOString().split('T')[0];
  const displayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });

  useEffect(() => {
    const raw = localStorage.getItem('protocols') || '[]';
    const protocols = JSON.parse(raw);
    
    // Find all compounds scheduled for today across all active protocols
    let scheduled = [];
    protocols.filter(p => p.status === 'active').forEach(p => {
      p.compounds.forEach(comp => {
        if (isScheduledForDate(comp, todayStr)) {
          scheduled.push({ ...comp, protocolName: p.name });
        }
      });
    });
    setTodayComps(scheduled);

    // Load logs for today
    const history = JSON.parse(localStorage.getItem('doseLogs') || '{}');
    setLogs(history[todayStr] || {});
  }, []);

  const toggleLog = (comp) => {
    const history = JSON.parse(localStorage.getItem('doseLogs') || '{}');
    if (!history[todayStr]) history[todayStr] = {};
    
    // toggle
    history[todayStr][comp.compound] = !history[todayStr][comp.compound];
    setLogs(history[todayStr]);
    localStorage.setItem('doseLogs', JSON.stringify(history));
  };

  return (
    <div className="p-lg pt-xl flex-col gap-lg animate-fade-in pb-xl w-full max-w-[500px] mx-auto bg-[var(--bg-primary)]">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-semibold text-white tracking-tight">Today</h1>
          <p className="text-secondary text-sm mt-xs px-xs">{displayDate}</p>
        </div>
      </div>
      
      {/* Pill Filters */}
      <div className="flex gap-sm overflow-x-auto hide-scrollbar mt-xs">
        <span className="pill-filter active">Daily Plan</span>
        <span className="pill-filter">Active Cycles</span>
        <span className="pill-filter">History</span>
      </div>

      {/* Dynamic Action Cards for Today */}
      <div className="flex-col gap-md mt-sm">
        {todayComps.length === 0 ? (
          <div className="glass-panel p-lg flex-col items-center justify-center text-center gap-sm mt-md bg-[#121214] border-white/5 opacity-70 shadow-2xl">
            <CheckCircle size={40} className="text-white/20 mb-xs" />
            <span className="text-lg font-medium text-white">All Clear</span>
            <span className="text-sm text-secondary">No compounds scheduled for today.</span>
          </div>
        ) : (
          todayComps.map((comp, i) => {
            const isLogged = logs[comp.compound];
            const data = peptidesDB[comp.compound];
            return (
              <div key={i} className={`glass-panel p-lg flex-col gap-md relative overflow-hidden bg-[#121214] shadow-2xl transition-all duration-300 ${isLogged ? 'opacity-50 border-accent/20' : 'border-white/10'}`}>
                {/* Background accent color */}
                <div className="absolute top-0 right-0 w-[150px] h-[150px] rounded-full blur-[80px] opacity-20 pointer-events-none" style={{ background: comp.color || 'var(--accent)', transition: 'background 0.3s' }}></div>
                
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex-col">
                     <span className="text-[10px] font-bold text-accent-light uppercase tracking-widest mb-xs">
                       {comp.timingTags?.length > 0 ? comp.timingTags.join(' • ') : 'Standard Dose'}
                     </span>
                     <span className={`text-4xl font-semibold leading-none tracking-tight transition-all duration-300 ${isLogged ? 'text-white/40 line-through' : 'text-white'}`}>
                       {comp.compound}
                     </span>
                     <span className={`text-sm mt-sm transition-all duration-300 ${isLogged ? 'text-white/30' : 'text-secondary'}`}>
                       {comp.doseMcg}mcg ({comp.units} Units) • SubQ
                     </span>
                  </div>
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center backdrop-blur-md transition-all duration-300 ${isLogged ? 'bg-accent/20 border-accent/30 text-accent-light' : 'border-white/10 bg-white/5 text-white'}`}>
                    {isLogged ? <CheckCircle size={20} /> : <Activity size={20} />}
                  </div>
                </div>

                <div className="flex gap-sm mt-md relative z-10">
                  <button 
                    onClick={() => toggleLog(comp)}
                    className="btn-primary shadow-lg transition-transform hover:scale-105 active:scale-95 flex-1" 
                    style={{ padding: '16px', background: isLogged ? 'transparent' : '#fff', color: isLogged ? '#fff' : '#000', border: isLogged ? '1px solid rgba(255,255,255,0.2)' : 'none' }}
                  >
                    {isLogged ? 'Unmark' : 'Log Dose'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Peptide Calendar Grid */}
      <CalendarGrid />

      {/* Quick Metrics */}
      <div className="flex-col gap-xs mt-md border-t border-white/10 pt-lg">
        <div className="flex justify-between items-center mb-xs px-xs">
           <h2 className="text-2xl font-semibold tracking-tight text-white">Daily Logs</h2>
           <button className="flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-secondary hover:text-white bg-white/5 border border-white/10 px-md py-xs rounded-full cursor-pointer transition-colors backdrop-blur-md">
             Edit 
           </button>
        </div>
        
        <div className="flex gap-md overflow-x-auto pb-md hide-scrollbar mt-sm" style={{ margin: '0 -24px', padding: '0 24px' }}>
          <MetricCard title="Current Streak" value="12" unit="days" icon={<Flame size={16} className="text-accent-light" />} />
          <MetricCard title="Body Weight" value="84" unit="kg" icon={<Scale size={16} className="text-white/50" />} />
          <MetricCard title="Side Effects" value="None" unit="" icon={<AlertTriangle size={16} className="text-white/50" />} />
          <MetricCard title="Energy Level" value="8" unit="/10" icon={<Zap size={16} className="text-white/50" />} />
        </div>
      </div>
      
      {/* Inventory Warning */}
      <div className="glass-card flex items-center justify-between p-md mt-sm bg-danger/10 border-danger/20 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-danger rounded-l-2xl"></div>
        <div className="flex items-center gap-md pl-xs">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-danger/20 border border-danger/30">
            <AlertTriangle size={18} className="text-danger" />
          </div>
          <div className="flex-col">
            <span className="text-sm font-semibold text-danger tracking-wide">Low Inventory</span>
            <span className="text-xs text-danger/70 mt-[2px] font-medium">1 vial BPC-157 remaining</span>
          </div>
        </div>
        <button className="btn-glass text-[11px] uppercase tracking-wider px-md py-xs font-bold hover:bg-danger/20 transition-colors" style={{ borderColor: 'rgba(255,69,58,0.3)', color: '#ff453a', background: 'rgba(255,69,58,0.05)' }}>
          Reorder
        </button>
      </div>

      {/* Floating Action Button for Add Protocol */}
      <div className="fixed bottom-[100px] right-[24px] z-50">
         <button 
           onClick={() => navigate('/app/protocol-wizard')}
           className="w-14 h-14 rounded-full flex items-center justify-center bg-white text-black shadow-[0_8px_30px_rgb(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-transform"
         >
           <Plus size={24} />
         </button>
      </div>

      <div style={{ height: '100px' }}></div>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

function MetricCard({ title, value, unit, icon }) {
  const isString = isNaN(value);
  return (
    <div className="glass-card flex-col flex-shrink-0 border-white/5 bg-[#141415] hover:bg-white/5 transition-colors relative overflow-hidden shadow-xl" style={{ padding: '20px', minWidth: '150px', height: '140px' }}>
      <div className="flex justify-between items-start text-secondary mb-auto">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-white/50 w-[70%] leading-tight">{title}</span>
        <div className="bg-white/5 p-[8px] rounded-[10px] border border-white/10 text-white/70">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-[6px] mt-md">
        <span className={`${isString ? 'text-3xl' : 'text-5xl'} font-semibold text-white tracking-tight leading-none`}>{value}</span>
        {unit && <span className="text-[11px] text-accent font-semibold uppercase tracking-wider">{unit}</span>}
      </div>
    </div>
  );
}
