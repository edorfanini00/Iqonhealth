import React, { useState } from 'react';
import { Search, Shield, BookOpen, AlertTriangle, ChevronDown, CheckCircle, ArrowRight } from 'lucide-react';

export default function Library() {
  return (
    <div className="p-lg pt-xl flex-col gap-lg animate-fade-in pb-xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light">Library</h1>
          <p className="text-secondary text-sm mt-xs">Learn before you start</p>
        </div>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-[16px] top-[14px] text-secondary" />
        <input 
          type="text" 
          placeholder="Search peptides, goals, or effects..." 
          className="pl-[44px] bg-black/10 border-white/20"
        />
      </div>

      <div className="flex gap-sm overflow-x-auto hide-scrollbar pb-xs">
        <span className="bg-white/20 text-xs px-md py-xs rounded-full whitespace-nowrap">All</span>
        <span className="bg-black/10 border border-white/10 text-xs px-md py-xs rounded-full whitespace-nowrap text-secondary">Fat Loss</span>
        <span className="bg-black/10 border border-white/10 text-xs px-md py-xs rounded-full whitespace-nowrap text-secondary">Recovery</span>
        <span className="bg-black/10 border border-white/10 text-xs px-md py-xs rounded-full whitespace-nowrap text-secondary">Longevity</span>
        <span className="bg-black/10 border border-white/10 text-xs px-md py-xs rounded-full whitespace-nowrap text-secondary">Cognition</span>
      </div>

      <div className="flex-col gap-md mt-sm">
        <PeptideCard 
          name="BPC-157" 
          goal="Recovery & Healing"
          desc="A pentadecapeptide sequence found in human gastric juice. Known for accelerating healing of tendons, muscles, and the nervous system."
          evidence="High"
          safety="High"
        />
        <PeptideCard 
          name="Tirzepatide" 
          goal="Fat Loss & Metabolic"
          desc="A dual GIP and GLP-1 receptor agonist. Highly effective for weight loss and improving metabolic markers."
          evidence="Very High (FDA Approved)"
          safety="High (with supervision)"
        />
        <PeptideCard 
          name="TB-500" 
          goal="Healing & Inflammation"
          desc="Synthetic fraction of Thymosin Beta-4. Often stacked with BPC-157 to reduce inflammation and promote tissue repair."
          evidence="Moderate"
          safety="High"
        />
      </div>
      
      <div style={{ height: '60px' }}></div>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

function PeptideCard({ name, goal, desc, evidence, safety }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="glass-card p-md flex flex-col transition-all overflow-hidden" style={{ padding: '20px' }}>
      <div className="flex justify-between items-start" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
        <div className="flex-col">
          <span className="text-xl font-medium">{name}</span>
          <span className="text-xs text-secondary mt-[2px]">{goal}</span>
        </div>
        <button className="btn-icon w-8 h-8 bg-black/10 border border-white/10">
          <ChevronDown size={16} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}/>
        </button>
      </div>

      {expanded && (
        <div className="flex flex-col gap-md mt-md pt-md border-t border-white/10 animate-fade-in">
          <p className="text-sm text-secondary leading-relaxed">{desc}</p>
          
          <div className="flex gap-xs">
            <div className="flex-1 bg-black/5 rounded-lg p-sm border border-white/10">
              <div className="flex items-center gap-xs text-[10px] uppercase tracking-wider text-secondary mb-xs">
                 <Shield size={12} /> Evidence
              </div>
              <span className="text-xs font-medium">{evidence}</span>
            </div>
            <div className="flex-1 bg-black/5 rounded-lg p-sm border border-white/10">
              <div className="flex items-center gap-xs text-[10px] uppercase tracking-wider text-secondary mb-xs">
                 <CheckCircle size={12} /> Safety
              </div>
              <span className="text-xs font-medium">{safety}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-xs mt-xs bg-black/5 p-sm rounded-lg border border-white/10">
            <span className="text-[10px] text-secondary uppercase tracking-wider">Common Side Effects</span>
            <span className="text-xs text-white">Mild injection site reaction, transient nausea.</span>
          </div>

          <div className="flex gap-sm mt-sm">
            <button className="flex-1 btn-primary text-sm py-sm" style={{ padding: '12px' }}>Add to Protocol</button>
            <button className="btn-glass text-sm py-sm px-md flex items-center justify-center gap-xs border-white/20">
               Calc <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
