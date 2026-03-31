import React from 'react';
import { Flame, CheckCircle, XCircle, Droplet, Activity, AlertTriangle, Scale, Zap } from 'lucide-react';
import CalendarGrid from '../components/CalendarGrid';

export default function Today() {
  return (
    <div className="p-lg pt-xl flex-col gap-lg animate-fade-in pb-xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-semibold text-white tracking-tight">Today</h1>
          <p className="text-secondary text-sm mt-xs px-xs">Tuesday, 14 Nov</p>
        </div>
      </div>
      
      {/* Pill Filters */}
      <div className="flex gap-sm overflow-x-auto hide-scrollbar mt-xs">
        <span className="pill-filter active">Daily Plan</span>
        <span className="pill-filter">Active Cycles</span>
        <span className="pill-filter">History</span>
        <span className="pill-filter">Insights</span>
      </div>

      {/* Main Action Card - Sleek dark layout inspired by the reference but displaying peptide data */}
      <div className="glass-panel p-lg flex-col gap-md mt-sm relative overflow-hidden bg-[#121214] border-white/10 shadow-2xl">
        <Droplet size={140} className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] text-white" />
        
        <div className="flex justify-between items-start relative z-10">
          <div className="flex-col">
             <span className="text-[10px] font-bold text-accent-light uppercase tracking-widest mb-xs">Next Dose • 8:00 PM</span>
             <span className="text-4xl font-semibold leading-none text-white tracking-tight">BPC-157</span>
             <span className="text-secondary mt-sm text-sm">250mcg • SubQ Belly</span>
          </div>
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md">
            <Activity size={20} className="text-white" />
          </div>
        </div>

        <div className="flex gap-sm mt-md relative z-10">
          <button className="btn-primary shadow-lg transition-transform hover:scale-105 active:scale-95" style={{ padding: '16px', background: '#fff', color: '#000' }}>
            <CheckCircle size={18} />
            Log Dose
          </button>
          <button className="btn-glass flex items-center justify-center flex-shrink-0 shadow-lg transition-transform hover:scale-105 active:scale-95" style={{ padding: '16px', borderRadius: '50%', width: '56px', height: '56px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
            <XCircle size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Peptide Calendar Grid (Modeled after the 'Dream Lucidity' grid) */}
      <CalendarGrid />

      {/* Quick Metrics (Replacing Sleep Quality text with Peptide trackers) */}
      <div className="flex-col gap-xs mt-md border-t border-white/10 pt-lg">
        <div className="flex justify-between items-end mb-xs px-xs">
           <h2 className="text-2xl font-semibold tracking-tight text-white">Daily Logs</h2>
           <button className="text-xs font-semibold uppercase tracking-wider text-accent-light bg-transparent border-none p-0 cursor-pointer">Edit</button>
        </div>
        
        <div className="flex gap-sm overflow-x-auto pb-sm hide-scrollbar mt-sm" style={{ margin: '0 -24px', padding: '0 24px' }}>
          <MetricCard title="Current Streak" value="12" unit="days" icon={<Flame size={16} className="text-accent-light" />} />
          <MetricCard title="Body Weight" value="84" unit="kg" icon={<Scale size={16} className="text-white/50" />} />
          <MetricCard title="Side Effects" value="None" unit="" icon={<AlertTriangle size={16} className="text-white/50" />} />
          <MetricCard title="Energy Level" value="8" unit="/10" icon={<Zap size={16} className="text-white/50" />} />
        </div>
      </div>
      
      {/* Inventory Warning */}
      <div className="glass-card flex items-center justify-between p-sm px-md mt-sm bg-danger-bg border-danger/20">
        <div className="flex items-center gap-md">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-danger/20">
            <AlertTriangle size={18} className="text-danger" />
          </div>
          <div className="flex-col">
            <span className="text-sm font-semibold text-danger tracking-wide">Low Inventory</span>
            <span className="text-xs text-danger/70 mt-[2px]">1 vial BPC-157 remaining</span>
          </div>
        </div>
        <button className="btn-glass text-xs px-md py-xs font-semibold hover:bg-danger/10 transition-colors" style={{ borderColor: 'rgba(255,69,58,0.3)', color: 'var(--danger)' }}>Reorder</button>
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
  return (
    <div className="glass-card flex-col min-w-[140px] flex-shrink-0 border-white/5 bg-[#141415] hover:bg-white/5 transition-colors" style={{ padding: '20px' }}>
      <div className="flex justify-between items-start text-secondary mb-xl">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-white/60">{title}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-xs">
        <span className="text-4xl font-semibold text-white tracking-tight">{value}</span>
        <span className="text-[11px] text-accent font-medium uppercase tracking-wider">{unit}</span>
      </div>
    </div>
  );
}
