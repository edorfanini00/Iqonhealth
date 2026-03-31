import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, AlertTriangle, Info, ChevronRight, Beaker, BookOpen, Check } from 'lucide-react';
import { peptidesDB, calcConcentration, calcDrawVolume, calcSyringeUnits, calcDosesPerVial, calcVialsNeeded } from '../data/peptides';

const compoundNames = Object.keys(peptidesDB);

export default function ProtocolBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedComps, setSelectedComps] = useState([]); // multi-select
  const [currentCompIdx, setCurrentCompIdx] = useState(0);
  
  // Per-compound config
  const [configs, setConfigs] = useState({});

  const toggleCompound = (name) => {
    setSelectedComps(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const updateConfig = (compound, key, value) => {
    setConfigs(prev => ({
      ...prev,
      [compound]: { ...prev[compound], [key]: value }
    }));
  };

  const getConfig = (compound) => {
    const data = peptidesDB[compound];
    return {
      vialMg: configs[compound]?.vialMg || data.defaultVial.toString(),
      waterMl: configs[compound]?.waterMl || '2',
      tier: configs[compound]?.tier || 'med',
      ...configs[compound]
    };
  };

  const currentComp = selectedComps[currentCompIdx];
  const currentData = currentComp ? peptidesDB[currentComp] : null;
  const currentConfig = currentComp ? getConfig(currentComp) : null;

  // Auto-calc for current compound
  const concentration = currentConfig ? calcConcentration(parseFloat(currentConfig.vialMg || 0), parseFloat(currentConfig.waterMl || 0)) : 0;

  const saveProtocol = () => {
    const protocol = selectedComps.map(comp => {
      const cfg = getConfig(comp);
      const data = peptidesDB[comp];
      const tier = data.doses[cfg.tier];
      const conc = calcConcentration(parseFloat(cfg.vialMg || 0), parseFloat(cfg.waterMl || 0));
      return {
        compound: comp,
        vialMg: cfg.vialMg,
        waterMl: cfg.waterMl,
        tier: cfg.tier,
        doseMcg: tier.mcg,
        units: calcSyringeUnits(calcDrawVolume(tier.mcg, conc)),
        schedule: data.schedule,
        weeks: data.typicalCycle
      };
    });
    const existing = JSON.parse(localStorage.getItem('protocols') || '[]');
    existing.push({ id: Date.now(), name: `Stack ${existing.length + 1}`, compounds: protocol, createdAt: new Date().toISOString() });
    localStorage.setItem('protocols', JSON.stringify(existing));
    navigate('/app/protocols');
  };

  return (
    <div className="p-lg pt-xl flex-col h-full animate-fade-in pb-xl w-full max-w-[500px] mx-auto bg-[var(--bg-primary)]">
      
      {/* Header */}
      <div className="flex items-center gap-md mb-lg pl-xs">
        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/10 text-white cursor-pointer" onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}>
          <ArrowLeft size={16} />
        </button>
        <span className="text-lg font-medium text-white">
          {step === 1 ? 'Build Protocol' : step === 2 ? `Setup: ${currentComp}` : 'Review Stack'}
        </span>
      </div>

      {/* Progress */}
      <div className="px-xs mb-lg">
        <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(step / 3) * 100}%`, background: 'linear-gradient(90deg, var(--accent-dark), var(--accent-light))' }}></div>
        </div>
      </div>

      {/* ========== STEP 1: Select Compounds ========== */}
      {step === 1 && (
        <div className="flex-col gap-md animate-fade-in">
          <h2 className="text-3xl font-light text-white mb-xs">Select Compounds</h2>
          <p className="text-sm text-secondary mb-sm leading-relaxed">Tap to add to your stack. You can select multiple for a combined protocol.</p>
          
          <div className="flex gap-sm flex-wrap mt-sm">
            {compoundNames.map(name => {
              const data = peptidesDB[name];
              const isSelected = selectedComps.includes(name);
              return (
                <div 
                  key={name}
                  className="glass-card flex-col items-center justify-center cursor-pointer transition-all border relative overflow-hidden"
                  onClick={() => toggleCompound(name)}
                  style={{ 
                    padding: '16px 12px',
                    borderColor: isSelected ? data.color : 'rgba(255,255,255,0.05)',
                    background: isSelected ? `${data.color}15` : 'rgba(0,0,0,0.2)',
                    width: 'calc(50% - 6px)', // 2 columns
                    height: '110px',
                    textAlign: 'center'
                  }}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full" style={{ background: data.color }}>
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                  <div className="w-8 h-8 rounded-full mb-xs mx-auto" style={{ background: isSelected ? data.color : 'rgba(255,255,255,0.05)' }}></div>
                  <span className="font-semibold text-white text-sm leading-tight">{name}</span>
                  <span className="text-[10px] text-secondary mt-[2px]">{data.schedule}</span>
                </div>
              );
            })}
          </div>

          <button 
            className="btn-primary mt-lg shadow-2xl" 
            disabled={selectedComps.length === 0}
            onClick={() => { setCurrentCompIdx(0); setStep(2); }}
            style={{ padding: '18px', opacity: selectedComps.length === 0 ? 0.4 : 1 }}
          >
            Configure {selectedComps.length > 0 ? `${selectedComps.length} Compound${selectedComps.length > 1 ? 's' : ''}` : 'Stack'} →
          </button>
        </div>
      )}

      {/* ========== STEP 2: Configure Each Compound ========== */}
      {step === 2 && currentData && (
        <div className="flex-col gap-md animate-fade-in overflow-y-auto hide-scrollbar pb-[100px]">
          {/* Compound Header */}
          <div className="flex items-center gap-md">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: currentData.color }}>
              <Beaker size={20} className="text-white" />
            </div>
            <div className="flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">{currentCompIdx + 1} of {selectedComps.length}</span>
              <h2 className="text-2xl font-light text-white">{currentComp}</h2>
            </div>
          </div>

          {/* What it does */}
          <div className="glass-card flex-col gap-sm border-white/5" style={{ background: '#0a0a0c', padding: '20px' }}>
            <div className="flex items-center gap-sm text-accent-light">
              <BookOpen size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">About This Compound</span>
            </div>
            <p className="text-sm text-secondary leading-relaxed">{currentData.desc}</p>
            <p className="text-sm text-secondary leading-relaxed"><strong className="text-white">Best Time:</strong> {currentData.timing}</p>
            <p className="text-sm text-secondary leading-relaxed"><strong className="text-white">Administration:</strong> {currentData.administration}</p>
          </div>

          {/* Reconstitution inputs */}
          <div className="glass-card flex-col gap-md border-white/5 mt-sm" style={{ background: '#0d0d0f', padding: '20px' }}>
            <div className="flex items-center gap-sm text-accent-light mb-xs">
              <Info size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Reconstitution Setup</span>
            </div>
            <p className="text-xs text-secondary leading-relaxed mb-sm">{currentData.reconstitution}</p>
            
            <div className="flex-col gap-[4px]">
              <label className="text-[10px] font-bold uppercase tracking-widest text-secondary pl-xs">Vial Size</label>
              <div className="flex items-center bg-white/5 rounded-xl border border-white/5" style={{ padding: '14px 16px' }}>
                <input type="number" value={currentConfig.vialMg} onChange={e => updateConfig(currentComp, 'vialMg', e.target.value)} style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', padding: 0, fontSize: '1.1rem', color: '#fff', fontWeight: 500 }} />
                <span className="text-secondary font-medium text-sm ml-sm">mg</span>
              </div>
            </div>
            <div className="flex-col gap-[4px]">
              <label className="text-[10px] font-bold uppercase tracking-widest text-secondary pl-xs">Bacteriostatic Water</label>
              <div className="flex items-center bg-white/5 rounded-xl border border-white/5" style={{ padding: '14px 16px' }}>
                <input type="number" value={currentConfig.waterMl} onChange={e => updateConfig(currentComp, 'waterMl', e.target.value)} style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', padding: 0, fontSize: '1.1rem', color: '#fff', fontWeight: 500 }} />
                <span className="text-secondary font-medium text-sm ml-sm">ml</span>
              </div>
            </div>
          </div>

          {/* Auto-calculated Dose Tiers */}
          <div className="flex-col gap-sm mt-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary pl-xs">Select Dosage — Auto-Calculated</span>
            {Object.entries(currentData.doses).map(([tier, data]) => {
              const tierDraw = calcDrawVolume(data.mcg, concentration);
              const tierUnits = calcSyringeUnits(tierDraw);
              const dosesVial = calcDosesPerVial(parseFloat(currentConfig.vialMg || 0), data.mcg);
              const isHigh = tier === 'high';
              const isMed = tier === 'med';
              const isSelected = currentConfig.tier === tier;
              return (
                <div 
                  key={tier}
                  className="glass-card flex justify-between items-center cursor-pointer transition-all"
                  onClick={() => updateConfig(currentComp, 'tier', tier)}
                  style={{ 
                    padding: '18px 20px',
                    borderColor: isSelected ? (isHigh ? 'var(--danger)' : isMed ? 'var(--accent)' : 'rgba(255,255,255,0.2)') : 'rgba(255,255,255,0.05)',
                    background: isSelected ? (isHigh ? 'rgba(255,69,58,0.08)' : isMed ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.05)') : 'rgba(0,0,0,0.2)',
                    transform: isSelected ? 'scale(1.01)' : 'scale(1)'
                  }}
                >
                  <div className="flex-col gap-[3px]">
                    <span className={`font-semibold text-sm ${isHigh ? 'text-danger' : isMed ? 'text-accent-light' : 'text-white'}`}>
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      {isMed && <span className="text-[8px] bg-accent/30 px-[6px] py-[2px] rounded-full ml-sm text-accent-light tracking-widest">RECOMMENDED</span>}
                      {isHigh && <span className="text-[8px] bg-danger/30 px-[6px] py-[2px] rounded-full ml-sm text-danger tracking-widest">⚠ RISK</span>}
                    </span>
                    <span className="text-[11px] text-secondary">{data.label} • {data.mcg}mcg</span>
                    <span className="text-[10px] text-secondary mt-[2px]">{data.risk}</span>
                  </div>
                  <div className="flex-col items-end">
                    <span className={`text-2xl font-semibold ${isHigh ? 'text-danger' : isMed ? 'text-accent-light' : 'text-white'}`}>
                      {concentration > 0 ? tierUnits.toFixed(1) : '—'}
                    </span>
                    <span className="text-[9px] text-secondary font-medium">UNITS</span>
                    <span className="text-[9px] text-secondary mt-[2px]">{dosesVial > 0 ? Math.floor(dosesVial) : '—'} doses/vial</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* High Risk Warning */}
          {currentConfig.tier === 'high' && (
            <div className="flex items-start gap-md bg-danger/10 border border-danger/30 rounded-xl p-md mt-sm animate-fade-in">
              <AlertTriangle size={20} className="text-danger flex-shrink-0 mt-[2px]" />
              <p className="text-xs text-danger/90 leading-relaxed">
                <strong>High Risk Warning:</strong> {currentData.doses.high.risk} The OS strongly recommends starting at Low or Medium and monitoring your response for at least 2 weeks before titrating up.
              </p>
            </div>
          )}

          {/* Next / Done */}
          <button 
            className="btn-primary mt-lg shadow-2xl"
            style={{ padding: '18px' }}
            onClick={() => {
              if (currentCompIdx < selectedComps.length - 1) {
                setCurrentCompIdx(currentCompIdx + 1);
              } else {
                setStep(3);
              }
            }}
          >
            {currentCompIdx < selectedComps.length - 1 ? `Next: ${selectedComps[currentCompIdx + 1]} →` : 'Review Full Stack →'}
          </button>
        </div>
      )}

      {/* ========== STEP 3: Review & Save ========== */}
      {step === 3 && (
        <div className="flex-col gap-md animate-fade-in overflow-y-auto hide-scrollbar pb-[100px]">
          <h2 className="text-3xl font-light text-white mb-xs">Review Stack</h2>
          <p className="text-sm text-secondary mb-sm">Your protocol is ready. Review the auto-calculated details below and save.</p>

          {selectedComps.map(comp => {
            const data = peptidesDB[comp];
            const cfg = getConfig(comp);
            const tierData = data.doses[cfg.tier];
            const conc = calcConcentration(parseFloat(cfg.vialMg || 0), parseFloat(cfg.waterMl || 0));
            const tierUnits = calcSyringeUnits(calcDrawVolume(tierData.mcg, conc));
            const vialsNeeded = calcVialsNeeded(tierData.mcg, data.schedule === 'Daily' ? 7 : data.schedule === 'Weekly' ? 1 : data.schedule === '2x per week' ? 2 : 5, data.typicalCycle, parseFloat(cfg.vialMg));
            
            return (
              <div key={comp} className="glass-card flex-col gap-sm border-white/5" style={{ padding: '20px', borderLeft: `3px solid ${data.color}` }}>
                <div className="flex justify-between items-start">
                  <div className="flex-col">
                    <span className="text-lg font-medium text-white">{comp}</span>
                    <span className="text-[11px] text-secondary">{data.schedule} • {data.typicalCycle} weeks</span>
                  </div>
                  <div className="flex-col items-end">
                    <span className="text-2xl font-semibold text-white">{tierUnits.toFixed(1)}</span>
                    <span className="text-[9px] text-secondary">UNITS / dose</span>
                  </div>
                </div>
                
                <div className="flex gap-xs flex-wrap mt-xs">
                  <span className="bg-white/5 border border-white/5 px-sm py-[3px] rounded text-[10px] text-secondary">{tierData.mcg}mcg {cfg.tier}</span>
                  <span className="bg-white/5 border border-white/5 px-sm py-[3px] rounded text-[10px] text-secondary">{cfg.vialMg}mg / {cfg.waterMl}ml</span>
                  <span className="bg-white/5 border border-white/5 px-sm py-[3px] rounded text-[10px] text-secondary">{vialsNeeded} vials needed</span>
                </div>

                <p className="text-[11px] text-secondary mt-xs leading-relaxed"><strong className="text-white">Timing:</strong> {data.timing}</p>
              </div>
            );
          })}

          <button className="btn-primary mt-lg shadow-2xl" style={{ padding: '18px' }} onClick={saveProtocol}>
            Save Protocol & Start Tracking
          </button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
