import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, AlertTriangle, Info } from 'lucide-react';

const peptidesDB = {
  "BPC-157": {
    desc: "Accelerates healing of tendons, muscles, and the nervous system.",
    time: "Best taken at night (8:00 - 9:00 PM) to align with natural recovery processes during sleep.",
    defaultVial: 5, // mg
    doses: {
      low: { mcg: 250, desc: "Maintenance / Mild Injury" },
      med: { mcg: 500, desc: "Standard Protocol" },
      high: { mcg: 1000, desc: "Acute Severe Injury" }
    }
  },
  "Tirzepatide": {
    desc: "Dual GIP/GLP-1 receptor agonist for metabolism and appetite control.",
    time: "Morning, fasted. Once weekly administration.",
    defaultVial: 10,
    doses: {
      low: { mcg: 2500, desc: "Starting Titration" },
      med: { mcg: 5000, desc: "Maintenance" },
      high: { mcg: 10000, desc: "Advanced Metabolic Correction" }
    }
  }
};

export default function ProtocolBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedComp, setSelectedComp] = useState(null);
  
  // Reconstitution state
  const [vialMg, setVialMg] = useState('');
  const [waterMl, setWaterMl] = useState('2');

  const compData = selectedComp ? peptidesDB[selectedComp] : null;

  // Math
  const vialMcg = parseFloat(vialMg || 0) * 1000;
  const diluentMl = parseFloat(waterMl || 0);
  const concentration = diluentMl > 0 ? vialMcg / diluentMl : 0; // mcg per ml

  const getUnits = (targetMcg) => {
    if (concentration === 0) return 0;
    return ((targetMcg / concentration) * 100).toFixed(1);
  };

  return (
    <div className="p-lg pt-xl flex-col h-full animate-fade-in pb-xl w-full max-w-[500px] mx-auto bg-[var(--bg-primary)]">
      
      {/* Header */}
      <div className="flex items-center gap-md mb-lg pl-xs">
        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/10 text-white cursor-pointer" onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}>
          <ArrowLeft size={16} />
        </button>
        <span className="text-lg font-medium text-white">Add to Protocol</span>
      </div>

      {step === 1 && (
        <div className="flex-col gap-md animate-fade-in">
          <h2 className="text-3xl font-light mb-sm text-white">Select Compound</h2>
          
          <div className="flex-col gap-sm">
            {Object.entries(peptidesDB).map(([name, data]) => (
              <div 
                key={name}
                className="glass-card flex-col p-md cursor-pointer hover:bg-white/5 transition-colors border-white/5"
                onClick={() => {
                  setSelectedComp(name);
                  setVialMg(data.defaultVial.toString());
                  setStep(2);
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xl font-medium text-white">{name}</span>
                  <span className="text-xs bg-white/10 px-md py-[4px] rounded-full text-white font-medium">Select</span>
                </div>
                <p className="text-sm text-secondary mt-xs pr-md leading-relaxed">{data.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex-col gap-md animate-fade-in">
          <h2 className="text-3xl font-light text-white mb-xs">Vial Setup</h2>
          
          <div className="bg-accent/10 p-md rounded-xl border border-accent/20 flex gap-sm items-start mb-sm">
            <Info size={20} className="text-accent flex-shrink-0 mt-[2px]" />
            <p className="text-sm text-white leading-relaxed opacity-90">
              Before setting a schedule for <strong className="text-accent">{selectedComp}</strong>, we need to reconstitute it. Enter the amounts below carefully.
            </p>
          </div>

          <div className="flex-col gap-xs">
            <label className="text-xs font-semibold uppercase tracking-wider text-secondary pl-xs">Vial Size (mg)</label>
            <input 
              type="number" 
              value={vialMg} 
              onChange={e => setVialMg(e.target.value)} 
              placeholder="e.g. 5"
              className="text-white text-lg"
            />
          </div>

          <div className="flex-col gap-xs mt-sm">
            <label className="text-xs font-semibold uppercase tracking-wider text-secondary pl-xs">Bacteriostatic Water Added (ml)</label>
            <input 
              type="number" 
              value={waterMl} 
              onChange={e => setWaterMl(e.target.value)} 
              placeholder="e.g. 2"
              className="text-white text-lg"
            />
          </div>

          <button 
            className="btn-primary mt-lg shadow-2xl" 
            disabled={!vialMg || !waterMl}
            onClick={() => setStep(3)}
            style={{ padding: '18px', opacity: (!vialMg || !waterMl) ? 0.5 : 1 }}
          >
            Calculate Dosages
          </button>
        </div>
      )}

      {step === 3 && compData && (
        <div className="flex-col gap-md animate-fade-in pb-xl">
           <div className="flex justify-between items-end mb-xs">
             <div className="flex-col">
               <h2 className="text-3xl font-light text-white">{selectedComp} Guide</h2>
               <p className="text-sm text-secondary tracking-wide">Based on {vialMg}mg / {waterMl}ml mixture</p>
             </div>
           </div>

           <div className="glass-panel p-md border-white/10 flex-col gap-md rounded-xl bg-black/40">
             <div className="flex items-center gap-sm text-accent-light">
               <Moon size={20} />
               <span className="font-semibold text-sm uppercase tracking-wider">Protocol Overview</span>
             </div>
             <p className="text-[15px] text-white leading-relaxed">{compData.desc}</p>
             <p className="text-sm text-secondary leading-relaxed bg-black/60 p-md rounded-lg border border-white/5">
               <strong className="text-white block mb-[2px]">Timing:</strong> {compData.time}
             </p>
           </div>

           <h3 className="text-lg font-medium mt-md px-sm text-white">Select Dosage Tier</h3>
           
           <div className="flex-col gap-sm">
             {/* Low */}
             <div className="glass-card p-md border-white/10 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors" onClick={() => navigate('/app/today')}>
               <div className="flex-col gap-xs">
                 <span className="font-semibold text-white">Low</span>
                 <span className="text-[11px] text-secondary uppercase tracking-wider">{compData.doses.low.desc} ({compData.doses.low.mcg}mcg)</span>
               </div>
               <div className="flex-col items-end">
                 <span className="text-2xl font-light text-white">{getUnits(compData.doses.low.mcg)}</span>
                 <span className="text-[10px] text-secondary font-medium">UNITS</span>
               </div>
             </div>
             
             {/* Med */}
             <div className="glass-card p-md border-accent/40 bg-accent/10 flex justify-between items-center cursor-pointer hover:bg-accent/20 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.1)]" onClick={() => navigate('/app/today')}>
               <div className="flex-col gap-xs">
                 <span className="font-semibold text-white flex items-center gap-sm">Medium <span className="bg-accent text-[9px] px-[8px] py-[3px] rounded-full text-white tracking-widest leading-none">RECOMMENDED</span></span>
                 <span className="text-[11px] text-accent-light uppercase tracking-wider">{compData.doses.med.desc} ({compData.doses.med.mcg}mcg)</span>
               </div>
               <div className="flex-col items-end text-accent-light">
                 <span className="text-2xl font-bold">{getUnits(compData.doses.med.mcg)}</span>
                 <span className="text-[10px] font-medium">UNITS</span>
               </div>
             </div>

             {/* High Risk */}
             <div className="glass-card p-md border-danger/30 bg-danger/10 flex justify-between items-center cursor-pointer hover:bg-danger/20 transition-colors relative overflow-hidden" onClick={() => navigate('/app/today')}>
               <div className="absolute top-0 left-0 w-[4px] h-full bg-danger"></div>
               <div className="flex-col gap-xs pl-sm">
                 <span className="font-semibold text-danger flex items-center gap-xs"><AlertTriangle size={16}/> High Risk</span>
                 <span className="text-[11px] text-danger/80 uppercase tracking-wider">{compData.doses.high.desc} ({compData.doses.high.mcg}mcg)</span>
               </div>
               <div className="flex-col items-end text-danger">
                 <span className="text-2xl font-medium">{getUnits(compData.doses.high.mcg)}</span>
                 <span className="text-[10px] font-medium">UNITS</span>
               </div>
             </div>
           </div>

           <div className="bg-black/50 p-md rounded-xl mt-sm flex gap-sm items-start border border-danger/20">
             <AlertTriangle size={20} className="text-danger flex-shrink-0" />
             <p className="text-xs text-secondary leading-relaxed">
               <strong className="text-danger">Safety Notice:</strong> High dosages carry elevated risks of side effects including injection site reactions and systemic fatigue. The OS explicitly recommends starting at the Low or Medium tier and monitoring biological response before titrating up.
             </p>
           </div>
           
           <div style={{ height: '80px' }}></div>
        </div>
      )}
    </div>
  );
}
