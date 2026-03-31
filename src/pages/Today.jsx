import React from 'react';
import { Flame, CheckCircle, XCircle, Droplet, Moon, Activity, AlertTriangle } from 'lucide-react';
import CalendarGrid from '../components/CalendarGrid';

export default function Today() {
  return (
    <div className="p-lg pt-xl flex-col gap-lg animate-fade-in pb-xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-semibold text-white tracking-tight">Analytics</h1>
          <p className="text-secondary text-sm mt-xs px-xs">Tuesday, 14 Nov</p>
        </div>
      </div>
      
      {/* Pill Filters */}
      <div className="flex gap-sm overflow-x-auto hide-scrollbar mt-xs">
        <span className="pill-filter active">Last Month</span>
        <span className="pill-filter">Last Year</span>
        <span className="pill-filter">All Time</span>
        <span className="pill-filter">Custom Period</span>
      </div>

      {/* Main Action Card */}
      <div className="glass-panel p-lg flex-col gap-md mt-sm relative overflow-hidden bg-[#121214] border-white/10 shadow-2xl">
        <Droplet size={140} className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] text-white" />
        
        <div className="flex justify-between items-start relative z-10">
          <div className="flex-col">
             <span className="text-[10px] font-bold text-accent-light uppercase tracking-widest mb-xs">Next up • 8:00 PM</span>
             <span className="text-4xl font-semibold leading-none text-white tracking-tight">BPC-157</span>
             <span className="text-secondary mt-sm text-sm">250mcg • SubQ Belly</span>
          </div>
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md">
            <Activity size={20} className="text-white" />
          </div>
        </div>

        <div className="flex gap-sm mt-md relative z-10">
          <button className="btn-primary shadow-lg" style={{ padding: '16px', background: '#fff', color: '#000' }}>
            <CheckCircle size={18} />
            Log Dose
          </button>
          <button className="btn-glass flex items-center justify-center flex-shrink-0 shadow-lg" style={{ padding: '16px', borderRadius: '50%', width: '56px', height: '56px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
            <XCircle size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Integration (Dream Lucidity Style) */}
      <CalendarGrid />

      {/* Quick Metrics */}
      <div className="flex-col gap-xs mt-md border-t border-white/10 pt-lg">
        <div className="flex justify-between items-end mb-xs px-xs">
           <h2 className="text-2xl font-semibold tracking-tight text-white">Sleep Quality</h2>
           <button className="text-xs font-semibold uppercase tracking-wider text-accent-light bg-transparent border-none p-0 cursor-pointer">Edit</button>
        </div>
        
        <div className="flex gap-sm overflow-x-auto pb-sm hide-scrollbar mt-sm" style={{ margin: '0 -24px', padding: '0 24px' }}>
          <MetricCard title="Averange" value="4" unit="Previous 5" icon={<Moon size={16} />} />
          <MetricCard title="REM" value="2.5" unit="hrs" icon={<Activity size={16} />} />
          <MetricCard title="Deep" value="1.8" unit="hrs" icon={<Activity size={16} />} />
        </div>
      </div>
      
      {/* Inventory Warning */}
      <div className="glass-card flex items-center justify-between p-sm px-md mt-sm bg-danger-bg border-danger/20">
        <div className="flex items-center gap-md">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-danger/20">
            <AlertTriangle size={18} className="text-danger" />
          </div>
          <div className="flex-col">
            <span className="text-sm font-semibold text-danger">Low Inventory</span>
            <span className="text-xs text-danger/70 mt-[2px]">1 vial BPC-157 left</span>
          </div>
        </div>
        <button className="btn-glass text-xs px-md py-xs font-semibold" style={{ borderColor: 'rgba(255,69,58,0.3)', color: 'var(--danger)' }}>Reorder</button>
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
    <div className="glass-card flex-col min-w-[140px] flex-shrink-0 border-white/5 bg-[#141415]" style={{ padding: '20px' }}>
      <div className="flex justify-between items-start text-secondary mb-xl">
        <span className="text-xs font-semibold tracking-wider">{title}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-xs">
        <span className="text-4xl font-semibold text-white tracking-tight">{value}</span>
        <span className="text-[11px] text-danger font-medium">{unit}</span>
      </div>
    </div>
  );
}
