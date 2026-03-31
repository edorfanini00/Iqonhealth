import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Beaker, Save, AlertCircle, ChevronDown, ArrowRight, Scale, Package, BookOpen, Bookmark } from 'lucide-react';
import { peptidesDB, calcConcentration, calcDrawVolume, calcSyringeUnits, calcDosesPerVial, calcVialsNeeded } from '../data/peptides';

const compoundNames = Object.keys(peptidesDB);

const EXAMPLES = [
  { compound: "BPC-157", vial: 5, water: 2, dose: 250, label: "Standard healing protocol" },
  { compound: "Tirzepatide", vial: 10, water: 2, dose: 2500, label: "GLP-1 starting titration" },
  { compound: "Semaglutide", vial: 5, water: 2, dose: 250, label: "Semaglutide beginner" },
  { compound: "TB-500", vial: 5, water: 2, dose: 5000, label: "TB-500 loading phase" },
];

export default function Calculator() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('reconstitution'); // reconstitution | weight | supply | examples
  const [compound, setCompound] = useState('BPC-157');
  const [vialMg, setVialMg] = useState('5');
  const [waterMl, setWaterMl] = useState('2');
  const [targetDose, setTargetDose] = useState('250');
  const [bodyWeight, setBodyWeight] = useState('80');
  const [dosePerKg, setDosePerKg] = useState('5');
  const [supplyWeeks, setSupplyWeeks] = useState('8');
  const [dosesPerWeek, setDosesPerWeek] = useState('7');
  const [showCompoundPicker, setShowCompoundPicker] = useState(false);

  const compData = peptidesDB[compound];

  // Core math
  const concentration = calcConcentration(parseFloat(vialMg || 0), parseFloat(waterMl || 0));
  const drawVolume = calcDrawVolume(parseFloat(targetDose || 0), concentration);
  const units = calcSyringeUnits(drawVolume);
  const doses = calcDosesPerVial(parseFloat(vialMg || 0), parseFloat(targetDose || 0));

  // Weight-based
  const weightDose = parseFloat(bodyWeight || 0) * parseFloat(dosePerKg || 0);
  const weightUnits = calcSyringeUnits(calcDrawVolume(weightDose, concentration));

  // Supply
  const vialsNeeded = calcVialsNeeded(parseFloat(targetDose || 0), parseFloat(dosesPerWeek || 0), parseFloat(supplyWeeks || 0), parseFloat(vialMg || 0));

  const loadExample = (ex) => {
    setCompound(ex.compound);
    setVialMg(ex.vial.toString());
    setWaterMl(ex.water.toString());
    setTargetDose(ex.dose.toString());
    setMode('reconstitution');
  };

  return (
    <div className="p-lg pt-xl flex-col gap-lg animate-fade-in pb-xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Calculator</h1>
          <p className="text-secondary text-sm mt-xs">Dosing math, simplified</p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-xs overflow-x-auto hide-scrollbar mt-xs">
        {[
          { id: 'reconstitution', label: 'Reconstitution' },
          { id: 'weight', label: 'Weight-Based' },
          { id: 'supply', label: 'Supply Est.' },
          { id: 'examples', label: 'Examples' },
        ].map(m => (
          <button 
            key={m.id}
            className={`pill-filter ${mode === m.id ? 'active' : ''}`}
            onClick={() => setMode(m.id)}
            style={mode === m.id ? { background: 'rgba(255,255,255,0.2)' } : {}}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Compound Picker */}
      <div className="flex-col gap-xs mt-sm">
        <label className="text-[10px] font-bold uppercase tracking-widest text-secondary pl-xs">Compound</label>
        <div 
          className="glass-card flex items-center justify-between cursor-pointer border-white/5"
          style={{ padding: '16px 20px' }}
          onClick={() => setShowCompoundPicker(!showCompoundPicker)}
        >
          <div className="flex items-center gap-md">
            <div className="w-3 h-3 rounded-full" style={{ background: compData?.color || '#fff' }}></div>
            <span className="font-medium text-white">{compound}</span>
          </div>
          <ChevronDown size={16} className="text-secondary" style={{ transform: showCompoundPicker ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
        </div>
        
        {showCompoundPicker && (
          <div className="glass-card flex-col gap-0 p-0 overflow-hidden border-white/5 animate-fade-in mt-xs" style={{ padding: 0 }}>
            {compoundNames.map(name => (
              <div 
                key={name}
                className="flex items-center gap-md p-md cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                onClick={() => { 
                  setCompound(name); 
                  setVialMg(peptidesDB[name].defaultVial.toString());
                  setShowCompoundPicker(false); 
                }}
              >
                <div className="w-3 h-3 rounded-full" style={{ background: peptidesDB[name].color }}></div>
                <div className="flex-col">
                  <span className="text-sm font-medium text-white">{name}</span>
                  <span className="text-[11px] text-secondary">{peptidesDB[name].category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========== RECONSTITUTION MODE ========== */}
      {mode === 'reconstitution' && (
        <div className="flex-col gap-md animate-fade-in">
          {/* Big Result Display */}
          <div className="flex justify-between items-end mt-xs px-xs">
            <div className="flex-col">
              <span className="text-5xl font-semibold text-white" style={{ lineHeight: 1 }}>{units > 0 ? units.toFixed(1) : '—'}</span>
              <span className="text-secondary text-xs mt-xs uppercase tracking-wider font-medium">Syringe Units</span>
            </div>
            <div className="flex-col items-end">
              <span className="text-2xl font-light text-white">{doses > 0 ? Math.floor(doses) : '—'}</span>
              <span className="text-secondary text-[10px] uppercase tracking-wider font-medium">Doses / Vial</span>
            </div>
          </div>

          {/* Inputs */}
          <div className="glass-card flex-col gap-md border-white/5 relative overflow-hidden" style={{ background: '#0d0d0f' }}>
            <Beaker size={120} className="absolute right-[-15px] bottom-[-15px] opacity-[0.03] text-white" />
            
            <InputRow label="Vial Size" value={vialMg} onChange={setVialMg} unit="mg" />
            <InputRow label="Bacteriostatic Water" value={waterMl} onChange={setWaterMl} unit="ml" />
            <InputRow label="Target Dose" value={targetDose} onChange={setTargetDose} unit="mcg" />
          </div>

          {/* Explanation */}
          <div className="glass-card flex items-start gap-md border-white/5" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px 20px' }}>
            <AlertCircle size={20} className="text-secondary flex-shrink-0 mt-[2px]" />
            <p className="text-sm text-secondary leading-relaxed">
              {concentration > 0 ? (
                <>Concentration: <strong className="text-white">{(concentration / 1000).toFixed(2)}mg/ml</strong>. Draw to the <strong className="text-white">{units.toFixed(1)}</strong> tick on a U-100 syringe for <strong className="text-white">{targetDose}mcg</strong>.</>
              ) : (
                <>Enter vial size, water volume, and target dose to calculate.</>
              )}
            </p>
          </div>

          {/* Dose Tier Cards */}
          {compData && (
            <div className="flex-col gap-sm mt-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary pl-xs">Recommended Tiers for {compound}</span>
              {Object.entries(compData.doses).map(([tier, data]) => {
                const tierConc = concentration;
                const tierDraw = calcDrawVolume(data.mcg, tierConc);
                const tierUnits = calcSyringeUnits(tierDraw);
                const isHigh = tier === 'high';
                const isMed = tier === 'med';
                return (
                  <div 
                    key={tier}
                    className={`glass-card flex justify-between items-center cursor-pointer transition-colors border-white/5 ${isHigh ? 'border-danger/30 bg-danger/5' : isMed ? 'border-accent/30 bg-accent/5' : 'hover:bg-white/5'}`}
                    style={{ padding: '16px 20px' }}
                    onClick={() => setTargetDose(data.mcg.toString())}
                  >
                    <div className="flex-col gap-[2px]">
                      <span className={`font-semibold text-sm ${isHigh ? 'text-danger' : isMed ? 'text-accent-light' : 'text-white'}`}>
                        {tier.charAt(0).toUpperCase() + tier.slice(1)} {isMed && <span className="text-[8px] bg-accent/30 px-[6px] py-[2px] rounded-full ml-xs text-accent-light tracking-widest">REC</span>}
                        {isHigh && <span className="text-[8px] bg-danger/30 px-[6px] py-[2px] rounded-full ml-xs text-danger tracking-widest">⚠ RISK</span>}
                      </span>
                      <span className="text-[11px] text-secondary">{data.label} • {data.mcg}mcg</span>
                    </div>
                    <div className="flex-col items-end">
                      <span className={`text-xl font-semibold ${isHigh ? 'text-danger' : isMed ? 'text-accent-light' : 'text-white'}`}>
                        {tierConc > 0 ? tierUnits.toFixed(1) : '—'}
                      </span>
                      <span className="text-[9px] text-secondary font-medium">UNITS</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reconstitution Guide */}
          {compData && (
            <div className="glass-card flex-col gap-sm border-white/5 mt-sm" style={{ background: '#0a0a0c', padding: '20px' }}>
              <div className="flex items-center gap-sm text-accent-light">
                <BookOpen size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Reconstitution Guide</span>
              </div>
              <p className="text-sm text-secondary leading-relaxed">{compData.reconstitution}</p>
              <p className="text-sm text-secondary leading-relaxed mt-xs"><strong className="text-white">Best Time:</strong> {compData.timing}</p>
              <p className="text-sm text-secondary leading-relaxed"><strong className="text-white">Admin:</strong> {compData.administration}</p>
            </div>
          )}

          <div className="flex gap-sm mt-md">
            <button className="flex-1 btn-primary shadow-lg" style={{ padding: '14px' }}>
              <Save size={18} /> Save Recipe
            </button>
            <button className="btn-glass flex items-center gap-xs px-md" onClick={() => navigate('/app/protocol-wizard')}>
              <ArrowRight size={16} /> Add to Protocol
            </button>
          </div>
        </div>
      )}

      {/* ========== WEIGHT-BASED MODE ========== */}
      {mode === 'weight' && (
        <div className="flex-col gap-md animate-fade-in">
          <div className="glass-card flex-col gap-md border-white/5" style={{ background: '#0d0d0f' }}>
            <Scale size={100} className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] text-white" />
            <InputRow label="Body Weight" value={bodyWeight} onChange={setBodyWeight} unit="kg" />
            <InputRow label="Dose per kg" value={dosePerKg} onChange={setDosePerKg} unit="mcg/kg" />
            <InputRow label="Vial Size" value={vialMg} onChange={setVialMg} unit="mg" />
            <InputRow label="Water Added" value={waterMl} onChange={setWaterMl} unit="ml" />
          </div>

          <div className="flex justify-between items-end mt-sm px-xs">
            <div className="flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Calculated Dose</span>
              <span className="text-3xl font-semibold text-white">{weightDose > 0 ? weightDose.toFixed(0) : '—'} <span className="text-sm text-secondary font-normal">mcg</span></span>
            </div>
            <div className="flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Draw</span>
              <span className="text-3xl font-semibold text-accent-light">{weightUnits > 0 ? weightUnits.toFixed(1) : '—'} <span className="text-sm text-secondary font-normal">units</span></span>
            </div>
          </div>

          <div className="glass-card flex items-start gap-md border-white/5" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px 20px' }}>
            <AlertCircle size={20} className="text-secondary flex-shrink-0 mt-[2px]" />
            <p className="text-sm text-secondary leading-relaxed">
              At {bodyWeight}kg × {dosePerKg}mcg/kg = <strong className="text-white">{weightDose.toFixed(0)}mcg</strong> per dose. Draw <strong className="text-white">{weightUnits.toFixed(1)} units</strong> on a U-100 syringe.
            </p>
          </div>
        </div>
      )}

      {/* ========== SUPPLY ESTIMATOR MODE ========== */}
      {mode === 'supply' && (
        <div className="flex-col gap-md animate-fade-in">
          <div className="glass-card flex-col gap-md border-white/5" style={{ background: '#0d0d0f' }}>
            <Package size={100} className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] text-white" />
            <InputRow label="Vial Size" value={vialMg} onChange={setVialMg} unit="mg" />
            <InputRow label="Target Dose" value={targetDose} onChange={setTargetDose} unit="mcg" />
            <InputRow label="Doses per Week" value={dosesPerWeek} onChange={setDosesPerWeek} unit="doses" />
            <InputRow label="Cycle Length" value={supplyWeeks} onChange={setSupplyWeeks} unit="weeks" />
          </div>

          <div className="glass-card flex-col items-center justify-center border-accent/20 bg-accent/5" style={{ padding: '32px' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent-light mb-sm">You Will Need</span>
            <span className="text-5xl font-bold text-white">{vialsNeeded > 0 ? vialsNeeded : '—'}</span>
            <span className="text-secondary text-sm mt-xs">vials of {compound} ({vialMg}mg each)</span>
            <span className="text-secondary text-xs mt-md">for {supplyWeeks} weeks at {targetDose}mcg × {dosesPerWeek}x/week</span>
          </div>
        </div>
      )}

      {/* ========== EXAMPLES MODE ========== */}
      {mode === 'examples' && (
        <div className="flex-col gap-sm animate-fade-in">
          <p className="text-secondary text-sm px-xs">Tap any example to load it into the calculator.</p>
          {EXAMPLES.map((ex, i) => (
            <div 
              key={i}
              className="glass-card flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors border-white/5"
              style={{ padding: '20px' }}
              onClick={() => loadExample(ex)}
            >
              <div className="flex items-center gap-md">
                <div className="w-3 h-3 rounded-full" style={{ background: peptidesDB[ex.compound]?.color || '#fff' }}></div>
                <div className="flex-col">
                  <span className="font-medium text-white text-sm">{ex.compound}</span>
                  <span className="text-[11px] text-secondary mt-[2px]">{ex.label}</span>
                </div>
              </div>
              <div className="flex-col items-end">
                <span className="text-sm text-white font-medium">{ex.dose}mcg</span>
                <span className="text-[10px] text-secondary">{ex.vial}mg / {ex.water}ml</span>
              </div>
            </div>
          ))}
          
          <div className="glass-card flex items-start gap-md border-white/5 mt-md" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px 20px' }}>
            <Bookmark size={18} className="text-accent-light flex-shrink-0 mt-[2px]" />
            <p className="text-xs text-secondary leading-relaxed">
              These are common community-referenced protocols. Always verify dosages with your clinician before starting.
            </p>
          </div>
        </div>
      )}

      <div style={{ height: '100px' }}></div>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

function InputRow({ label, value, onChange, unit }) {
  return (
    <div className="flex-col gap-[4px] relative z-10">
      <label className="text-[10px] font-bold uppercase tracking-widest text-secondary pl-xs">{label}</label>
      <div className="flex items-center bg-white/5 rounded-xl border border-white/5" style={{ padding: '14px 16px' }}>
        <input 
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', padding: 0, margin: 0, fontSize: '1.15rem', color: '#fff', fontWeight: 500 }}
          placeholder="0"
        />
        <span className="text-secondary font-medium text-sm ml-sm flex-shrink-0">{unit}</span>
      </div>
    </div>
  );
}
