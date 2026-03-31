import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, CheckCircle, ChevronDown, ArrowRight, BookOpen, GraduationCap } from 'lucide-react';

export default function Library() {
  const navigate = useNavigate();

  return (
    <div className="p-lg pt-xl flex-col gap-lg animate-fade-in pb-xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Library</h1>
          <p className="text-secondary text-sm mt-xs">Learn before you start</p>
        </div>
      </div>

      {/* Beginner Course Entry Point */}
      <div 
        className="glass-card flex items-center gap-md cursor-pointer hover:bg-white/5 transition-colors border-accent/30 bg-accent/5 shadow-[0_0_30px_rgba(168,85,247,0.08)]"
        style={{ padding: '24px' }}
        onClick={() => navigate('/app/learn')}
      >
        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
          <GraduationCap size={24} className="text-accent-light" />
        </div>
        <div className="flex-col flex-1">
          <span className="font-semibold text-white text-[15px]">Peptides 101 — Beginner Course</span>
          <span className="text-sm text-accent-light mt-[2px]">6 lessons • ~8 min total</span>
        </div>
        <ArrowRight size={18} className="text-accent-light opacity-60" />
      </div>

      <div className="relative mt-sm">
        <Search size={18} className="absolute left-[16px] top-[14px] text-secondary" />
        <input 
          type="text" 
          placeholder="Search peptides, goals, or effects..." 
          style={{ paddingLeft: '44px' }}
        />
      </div>

      <div className="flex gap-sm overflow-x-auto hide-scrollbar pb-xs">
        <span className="pill-filter active">All</span>
        <span className="pill-filter">Fat Loss</span>
        <span className="pill-filter">Recovery</span>
        <span className="pill-filter">Longevity</span>
        <span className="pill-filter">Cognition</span>
      </div>

      <div className="flex-col gap-md mt-sm">
        <PeptideCard 
          name="BPC-157" 
          goal="Recovery & Healing"
          desc="A pentadecapeptide found in human gastric juice. Known for accelerating healing of tendons, muscles, and the nervous system."
          evidence="High"
          safety="High"
          navigate={navigate}
        />
        <PeptideCard 
          name="Tirzepatide" 
          goal="Fat Loss & Metabolic"
          desc="A dual GIP and GLP-1 receptor agonist. Highly effective for weight loss and improving metabolic markers."
          evidence="Very High (FDA Approved)"
          safety="High (with supervision)"
          navigate={navigate}
        />
        <PeptideCard 
          name="TB-500" 
          goal="Healing & Inflammation"
          desc="Synthetic fraction of Thymosin Beta-4. Often stacked with BPC-157 to reduce inflammation and promote tissue repair."
          evidence="Moderate"
          safety="High"
          navigate={navigate}
        />
        <PeptideCard 
          name="Semaglutide" 
          goal="Fat Loss & Appetite"
          desc="GLP-1 receptor agonist originally developed for type 2 diabetes. Widely used for significant weight loss."
          evidence="Very High (FDA Approved)"
          safety="High (with supervision)"
          navigate={navigate}
        />
        <PeptideCard 
          name="CJC-1295 / Ipamorelin" 
          goal="Growth Hormone Secretion"
          desc="A combination stack that stimulates natural growth hormone release. Used for recovery, sleep quality, and body composition."
          evidence="Moderate"
          safety="Moderate"
          navigate={navigate}
        />
      </div>
      
      <div style={{ height: '100px' }}></div>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

function PeptideCard({ name, goal, desc, evidence, safety, navigate }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="glass-card flex flex-col transition-all overflow-hidden border-white/5" style={{ padding: '20px' }}>
      <div className="flex justify-between items-start" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
        <div className="flex-col">
          <span className="text-xl font-medium text-white">{name}</span>
          <span className="text-xs text-secondary mt-[2px]">{goal}</span>
        </div>
        <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 cursor-pointer">
          <ChevronDown size={16} className="text-white" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}/>
        </button>
      </div>

      {expanded && (
        <div className="flex flex-col gap-md mt-md pt-md border-t border-white/5 animate-fade-in">
          <p className="text-sm text-secondary leading-relaxed">{desc}</p>
          
          <div className="flex gap-xs">
            <div className="flex-1 bg-white/5 rounded-lg p-sm border border-white/5">
              <div className="flex items-center gap-xs text-[10px] uppercase tracking-wider text-secondary mb-xs">
                 <Shield size={12} /> Evidence
              </div>
              <span className="text-xs font-medium text-white">{evidence}</span>
            </div>
            <div className="flex-1 bg-white/5 rounded-lg p-sm border border-white/5">
              <div className="flex items-center gap-xs text-[10px] uppercase tracking-wider text-secondary mb-xs">
                 <CheckCircle size={12} /> Safety
              </div>
              <span className="text-xs font-medium text-white">{safety}</span>
            </div>
          </div>

          <div className="flex gap-sm mt-sm">
            <button className="flex-1 btn-primary text-sm" style={{ padding: '12px' }} onClick={() => navigate('/app/protocol-wizard')}>Add to Protocol</button>
            <button className="btn-glass text-sm px-md flex items-center justify-center gap-xs" onClick={() => navigate('/app/calculator')}>
               Calc <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
