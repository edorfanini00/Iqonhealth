import React from 'react';
import { PlusCircle, Calendar, Edit3, ArrowRight } from 'lucide-react';

export default function Protocols() {
  return (
    <div className="p-lg pt-xl flex-col gap-lg animate-fade-in pb-xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light">Protocols</h1>
          <p className="text-secondary text-sm mt-xs">Manage your cycles</p>
        </div>
        <button className="btn-glass flex items-center gap-xs px-md py-xs">
          <PlusCircle size={16} />
          <span>New</span>
        </button>
      </div>

      <div className="flex-col gap-sm">
        <h2 className="text-lg font-medium">Active Cycles</h2>
        
        <div className="glass-panel p-md flex-col gap-sm" style={{ borderLeft: '3px solid var(--accent)' }}>
          <div className="flex justify-between items-start">
             <div className="flex-col">
               <span className="text-xl font-medium">Recovery Stack</span>
               <span className="text-sm text-secondary">Week 3 of 8</span>
             </div>
             <button className="btn-icon w-8 h-8 bg-white/10 border border-white/20">
               <Edit3 size={14} />
             </button>
          </div>
          
          <div className="flex gap-sm mt-xs">
            <span className="bg-white/10 border border-white/10 px-sm py-[2px] rounded text-[11px] font-medium tracking-wide">BPC-157</span>
            <span className="bg-white/10 border border-white/10 px-sm py-[2px] rounded text-[11px] font-medium tracking-wide">TB-500</span>
          </div>
          
          <div className="flex justify-between items-center mt-sm text-xs text-secondary border-t border-white/10 pt-sm">
             <div className="flex items-center gap-xs">
               <Calendar size={14} />
               <span>Ends Dec 12</span>
             </div>
             <span className="text-accent">100% Compliance</span>
          </div>
        </div>
        
        <div className="glass-panel p-md flex-col gap-sm" style={{ borderLeft: '3px solid #fff' }}>
          <div className="flex justify-between items-start">
             <div className="flex-col">
               <span className="text-xl font-medium">Fat Loss Phase 1</span>
               <span className="text-sm text-secondary">Week 1 of 12</span>
             </div>
             <button className="btn-icon w-8 h-8 bg-white/10 border border-white/20">
               <Edit3 size={14} />
             </button>
          </div>
          
          <div className="flex gap-sm mt-xs">
            <span className="bg-white/10 border border-white/10 px-sm py-[2px] rounded text-[11px] font-medium tracking-wide">Tirzepatide</span>
          </div>
          
          <div className="flex justify-between items-center mt-sm text-xs text-secondary border-t border-white/10 pt-sm">
             <div className="flex items-center gap-xs">
               <Calendar size={14} />
               <span>Ends Feb 01</span>
             </div>
             <span>Just started</span>
          </div>
        </div>
      </div>

      <div className="flex-col gap-sm mt-md">
        <h2 className="text-lg font-medium text-secondary">Templates</h2>
        
        <TemplateCard title="Healing & Recovery Basics" desc="BPC-157 + TB-500 standard 8-week protocol." />
        <TemplateCard title="GLP-1 Beginner" desc="Tirzepatide slow titration schedule." />
        <TemplateCard title="Longevity Intro" desc="Epitalon 10-day cycle." />
      </div>
      
      <div style={{ height: '60px' }}></div>
    </div>
  );
}

function TemplateCard({ title, desc }) {
  return (
    <div className="glass-card p-md flex flex-col gap-xs cursor-pointer active:bg-white/10 transition-colors bg-black/5" style={{ padding: '16px' }}>
      <div className="flex justify-between items-center">
        <span className="font-medium text-[15px]">{title}</span>
        <ArrowRight size={16} className="text-secondary opacity-50" />
      </div>
      <span className="text-[13px] text-secondary leading-snug pr-md">{desc}</span>
    </div>
  );
}
