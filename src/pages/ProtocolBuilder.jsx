import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, AlertTriangle, Info, ChevronRight, Beaker, BookOpen, Check, CalendarDays, Clock, Settings2, TrendingUp } from 'lucide-react';
import { peptidesDB, calcConcentration, calcDrawVolume, calcSyringeUnits, calcDosesPerVial, calcVialsNeeded } from '../data/peptides';

const compoundNames = Object.keys(peptidesDB);

const TIMING_TAGS = ['Morning', 'Pre-Workout', 'Bedtime', 'Fasted', 'With Food'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ProtocolBuilder() {
  const navigate = useNavigate();
  // Steps: 1 (Select), 2 (Dose), 3 (Schedule), 4 (Review)
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

  const toggleArrayItem = (compound, key, value) => {
    setConfigs(prev => {
      const arr = prev[compound]?.[key] || [];
      const newArr = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
      return { ...prev, [compound]: { ...prev[compound], [key]: newArr } };
    });
  };

  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  const getFutureStr = (weeks) => {
    const d = new Date();
    d.setDate(d.getDate() + (weeks * 7));
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  const getConfig = (compound) => {
    const data = peptidesDB[compound];
    return {
      vialMg: configs[compound]?.vialMg || data.defaultVial.toString(),
      waterMl: configs[compound]?.waterMl || '2',
      tier: configs[compound]?.tier || 'med',
      scheduleType: configs[compound]?.scheduleType || 'daily', // daily, everyX, custom
      scheduleInterval: configs[compound]?.scheduleInterval || '2', // for everyX
      scheduleDays: configs[compound]?.scheduleDays || [], // for custom
      startDate: configs[compound]?.startDate || getTodayStr(),
      endDate: configs[compound]?.endDate || getFutureStr(data.typicalCycle),
      timingTags: configs[compound]?.timingTags || [],
      rampUp: configs[compound]?.rampUp || false,
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
        scheduleType: cfg.scheduleType,
        scheduleInterval: cfg.scheduleInterval,
        scheduleDays: cfg.scheduleDays,
        startDate: cfg.startDate,
        endDate: cfg.endDate,
        timingTags: cfg.timingTags,
        rampUp: cfg.rampUp,
        color: data.color
      };
    });
    
    const existing = JSON.parse(localStorage.getItem('protocols') || '[]');
    existing.push({ 
      id: Date.now(), 
      name: `Stack ${existing.length + 1}`, 
      compounds: protocol, 
      createdAt: new Date().toISOString(), 
      status: 'active' 
    });
    localStorage.setItem('protocols', JSON.stringify(existing));
    navigate('/app/today'); // Route to Today to see the calendar sync!
  };

  return (
    <div className="p-lg pt-xl flex-col h-full animate-fade-in pb-xl w-full max-w-[500px] mx-auto bg-[var(--bg-primary)]">
      
      {/* Header */}
      <div className="flex items-center gap-md mb-lg pl-xs">
        <button 
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/10 text-white cursor-pointer" 
          onClick={() => {
            if (step === 3) setStep(2);
            else if (step === 2 && currentCompIdx > 0) { setCurrentCompIdx(currentCompIdx - 1); setStep(3); } // back to prev comp scheduling
            else if (step === 2) setStep(1);
            else if (step === 4) setStep(3);
            else navigate(-1);
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">{selectedComps.length > 0 ? `Compound ${currentCompIdx + 1} of ${selectedComps.length}` : 'Builder'}</span>
          <span className="text-lg font-medium text-white">
            {step === 1 ? 'Select Compounds' : step === 2 ? `Dosing: ${currentComp}` : step === 3 ? `Schedule: ${currentComp}` : 'Review Phase'}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="px-xs mb-lg">
        <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%`, background: 'linear-gradient(90deg, var(--accent-dark), var(--accent-light))' }}></div>
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
                    width: 'calc(50% - 6px)',
                    height: '110px',
                    textAlign: 'center'
                  }}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full" style={{ background: data.color }}>
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                  <div className="w-8 h-8 rounded-full mb-xs mx-auto flex items-center justify-center" style={{ background: isSelected ? data.color : 'rgba(255,255,255,0.05)' }}>
                     {!isSelected && <div className="w-3 h-3 rounded-full" style={{ background: data.color }}></div>}
                  </div>
                  <span className="font-semibold text-white text-sm leading-tight">{name}</span>
                  <span className="text-[10px] text-secondary mt-[2px]">{data.typicalCycle} wks</span>
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

      {/* ========== STEP 2: Configure Dosing (Compound loop) ========== */}
      {step === 2 && currentData && (
        <div className="flex-col gap-md animate-fade-in overflow-y-auto hide-scrollbar pb-[100px]">
          
          <div className="glass-card flex-col gap-sm border-white/5" style={{ background: '#0a0a0c', padding: '20px', borderLeft: `3px solid ${currentData.color}` }}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Step 1 of 2: Reconstitution & Dose</span>
            <p className="text-sm text-secondary leading-relaxed"><strong className="text-white">Prep Notes:</strong> {currentData.reconstitution}</p>
          </div>

          <div className="glass-card flex-col gap-md border-white/5 mt-xs" style={{ background: '#0d0d0f', padding: '20px' }}>
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

          <div className="flex-col gap-sm mt-xs">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary pl-xs">Select Dosage Tier (Auto-Calculated)</span>
            {Object.entries(currentData.doses).map(([tier, data]) => {
              const tierDraw = calcDrawVolume(data.mcg, concentration);
              const tierUnits = calcSyringeUnits(tierDraw);
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
                  }}
                >
                  <div className="flex-col gap-[3px]">
                    <span className={`font-semibold text-sm ${isHigh ? 'text-danger' : isMed ? 'text-accent-light' : 'text-white'}`}>
                      {tier.charAt(0).toUpperCase() + tier.slice(1)} Dose
                    </span>
                    <span className="text-[11px] text-secondary">{data.label}</span>
                    <span className="text-[10px] text-secondary mt-[2px] opacity-70">{data.risk}</span>
                  </div>
                  <div className="flex-col items-end flex-shrink-0 pl-md">
                    <span className={`text-2xl font-semibold ${isHigh ? 'text-danger' : isMed ? 'text-accent-light' : 'text-white'}`}>
                      {concentration > 0 ? tierUnits.toFixed(1) : '—'}
                    </span>
                    <span className="text-[9px] text-secondary font-medium">UNITS</span>
                    <span className="text-[10px] text-secondary mt-1">{data.mcg} mcg</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="btn-primary mt-lg shadow-2xl" style={{ padding: '18px' }} onClick={() => setStep(3)}>
            Next: Configure Schedule →
          </button>
        </div>
      )}

      {/* ========== STEP 3: Configure Schedule (Compound loop) ========== */}
      {step === 3 && currentData && (
        <div className="flex-col gap-md animate-fade-in overflow-y-auto hide-scrollbar pb-[100px]">
          
          <div className="glass-card flex-col gap-sm border-white/5" style={{ background: '#0a0a0c', padding: '20px', borderLeft: `3px solid ${currentData.color}` }}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Step 2 of 2: Advanced Scheduling</span>
            <p className="text-sm text-secondary leading-relaxed"><strong className="text-white">Typical Protocol:</strong> {currentData.schedule}. {currentData.timing}</p>
          </div>

          {/* Schedule Type */}
          <div className="flex-col gap-sm mt-xs">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary pl-xs">Injection Frequency</span>
            <div className="flex gap-[6px] overflow-x-auto hide-scrollbar">
              {['daily', 'everyX', 'custom'].map(type => (
                <div 
                  key={type}
                  onClick={() => updateConfig(currentComp, 'scheduleType', type)}
                  className="glass-card flex-1 flex justify-center items-center cursor-pointer transition-all border"
                  style={{ 
                    padding: '14px 12px',
                    borderColor: currentConfig.scheduleType === type ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                    background: currentConfig.scheduleType === type ? 'var(--accent-hover)' : 'rgba(0,0,0,0.2)'
                  }}
                >
                  <span className={`text-sm font-medium ${currentConfig.scheduleType === type ? 'text-accent-light' : 'text-secondary'}`}>
                    {type === 'daily' ? 'Daily' : type === 'everyX' ? 'Every X Days' : 'Custom Days'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Conditional Schedules */}
          {currentConfig.scheduleType === 'everyX' && (
            <div className="flex-col gap-[4px] animate-fade-in">
              <label className="text-[10px] font-bold uppercase tracking-widest text-secondary pl-xs">Inject Every</label>
              <div className="flex items-center bg-white/5 rounded-xl border border-white/5" style={{ padding: '14px 16px' }}>
                <input type="number" value={currentConfig.scheduleInterval} onChange={e => updateConfig(currentComp, 'scheduleInterval', e.target.value)} style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', padding: 0, fontSize: '1.1rem', color: '#fff', fontWeight: 500 }} />
                <span className="text-secondary font-medium text-sm ml-sm">days</span>
              </div>
            </div>
          )}

          {currentConfig.scheduleType === 'custom' && (
            <div className="flex-col gap-[4px] animate-fade-in">
              <label className="text-[10px] font-bold uppercase tracking-widest text-secondary pl-xs mb-xs">Select Days of Week</label>
              <div className="flex gap-[6px] flex-wrap">
                {WEEKDAYS.map(day => {
                  const isActive = currentConfig.scheduleDays.includes(day);
                  return (
                    <div 
                      key={day}
                      onClick={() => toggleArrayItem(currentComp, 'scheduleDays', day)}
                      className="cursor-pointer border rounded-lg flex items-center justify-center transition-all bg-white/5"
                      style={{ 
                        padding: '10px 0', width: 'calc(25% - 4.5px)',
                        borderColor: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                        color: isActive ? 'var(--accent-light)' : 'rgba(255,255,255,0.5)',
                        background: isActive ? 'var(--accent-hover)' : 'rgba(0,0,0,0.2)'
                      }}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="flex gap-md mt-sm">
            <div className="flex-col gap-[4px] flex-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-secondary pl-xs">Start Date</label>
              <input type="date" value={currentConfig.startDate} onChange={e => updateConfig(currentComp, 'startDate', e.target.value)} className="bg-white/5 border border-white/5 rounded-xl text-white outline-none w-full" style={{ padding: '14px 16px', colorScheme: 'dark' }} />
            </div>
            <div className="flex-col gap-[4px] flex-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-secondary pl-xs">End Date</label>
              <input type="date" value={currentConfig.endDate} onChange={e => updateConfig(currentComp, 'endDate', e.target.value)} className="bg-white/5 border border-white/5 rounded-xl text-white outline-none w-full" style={{ padding: '14px 16px', colorScheme: 'dark' }} />
            </div>
          </div>

          {/* Timing Tags */}
          <div className="flex-col gap-sm mt-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary pl-xs">Timing Notes</span>
            <div className="flex gap-[6px] flex-wrap">
              {TIMING_TAGS.map(tag => {
                const isActive = currentConfig.timingTags.includes(tag);
                return (
                  <div 
                    key={tag}
                    onClick={() => toggleArrayItem(currentComp, 'timingTags', tag)}
                    className="cursor-pointer border rounded-full flex items-center px-md py-xs transition-all text-xs"
                    style={{ 
                      borderColor: isActive ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.05)',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                      background: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)'
                    }}
                  >
                    {tag}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Power Feature: Ramp Up */}
          <div className="flex-col gap-sm mt-sm border-t border-white/5 pt-md">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => updateConfig(currentComp, 'rampUp', !currentConfig.rampUp)}
            >
               <div className="flex items-center gap-sm">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentConfig.rampUp ? 'bg-accent/20 text-accent-light' : 'bg-white/5 text-secondary'}`}>
                   <TrendingUp size={20} />
                 </div>
                 <div className="flex-col">
                   <span className={`font-medium ${currentConfig.rampUp ? 'text-white' : 'text-secondary'}`}>Ramp-Up Schedule</span>
                   <span className="text-[10px] text-secondary">Start at 50% dose for week 1</span>
                 </div>
               </div>
               <div className={`w-12 h-6 rounded-full flex items-center p-1 transition-all ${currentConfig.rampUp ? 'bg-accent' : 'bg-white/10'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-all ${currentConfig.rampUp ? 'translate-x-[24px]' : 'translate-x-0'}`}></div>
               </div>
            </div>
          </div>

          <button 
            className="btn-primary mt-lg shadow-2xl"
            style={{ padding: '18px' }}
            onClick={() => {
              if (currentCompIdx < selectedComps.length - 1) {
                setCurrentCompIdx(currentCompIdx + 1);
                setStep(2); // back to dose config for next comp
              } else {
                setStep(4);
              }
            }}
          >
            {currentCompIdx < selectedComps.length - 1 ? `Next Compound: ${selectedComps[currentCompIdx + 1]} →` : 'Review Full Stack Phase →'}
          </button>
        </div>
      )}

      {/* ========== STEP 4: Review Phase View & Save ========== */}
      {step === 4 && (
        <div className="flex-col gap-md animate-fade-in overflow-y-auto hide-scrollbar pb-[100px]">
          <h2 className="text-3xl font-light text-white mb-sm">Phase Overview</h2>
          
          {selectedComps.map(comp => {
            const data = peptidesDB[comp];
            const cfg = getConfig(comp);
            const tierData = data.doses[cfg.tier];
            const conc = calcConcentration(parseFloat(cfg.vialMg || 0), parseFloat(cfg.waterMl || 0));
            const tierUnits = calcSyringeUnits(calcDrawVolume(tierData.mcg, conc));
            
            // Format dates simply
            const startD = new Date(cfg.startDate).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' });
            const endD = new Date(cfg.endDate).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' });

            return (
              <div key={comp} className="glass-card flex-col border-white/5 relative overflow-hidden" style={{ background: '#0a0a0c' }}>
                <div className="absolute top-0 left-0 bottom-0 w-[4px]" style={{ background: data.color }}></div>
                
                <div className="p-md border-b border-white/5 pl-[20px] flex justify-between items-center bg-black/20">
                   <div className="flex-col">
                     <span className="text-lg font-medium text-white">{comp}</span>
                     <span className="text-[11px] text-secondary mt-[2px]">{cfg.vialMg}mg vial (reconstituted to {concentration.toFixed(0)}mcg/ml)</span>
                   </div>
                   <div className="flex-col items-end">
                     <span className="text-xl font-bold text-white">{tierUnits.toFixed(1)} <span className="text-[10px] font-medium text-secondary">U</span></span>
                     <span className="text-[10px] text-secondary mt-[2px]">{tierData.mcg}mcg {cfg.rampUp ? '(Ramp Up)' : ''}</span>
                   </div>
                </div>

                <div className="p-md pl-[20px] flex gap-sm flex-wrap">
                   <div className="flex items-center gap-[6px] bg-white/5 px-sm py-xs rounded border border-white/5 text-[11px] text-secondary">
                     <CalendarDays size={12} className="text-white/40" />
                     {cfg.scheduleType === 'daily' ? 'Daily' : cfg.scheduleType === 'everyX' ? `Every ${cfg.scheduleInterval} Days` : cfg.scheduleDays.join(', ')}
                   </div>
                   <div className="flex items-center gap-[6px] bg-white/5 px-sm py-xs rounded border border-white/5 text-[11px] text-secondary">
                     <Clock size={12} className="text-white/40" />
                     {startD} – {endD}
                   </div>
                   {cfg.timingTags.map(tag => (
                     <span key={tag} className="text-[11px] text-accent-light bg-accent/10 px-sm py-[4px] rounded">{tag}</span>
                   ))}
                </div>
              </div>
            );
          })}

          <div className="glass-card flex items-start gap-md p-md mt-xs bg-white/5 border border-white/10">
             <Settings2 size={16} className="text-secondary mt-[2px]" />
             <p className="text-[11px] text-secondary leading-relaxed">
               Saving this protocol will automatically inject these schedules into your <strong>Today</strong> view calendar. Doses will appear as actionable items on their scheduled days.
             </p>
          </div>

          <button className="btn-primary mt-md shadow-2xl" style={{ padding: '18px' }} onClick={saveProtocol}>
            Activate Protocol & Sync
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
