import React, { useState } from 'react';
import { Beaker, Settings, Save, AlertCircle } from 'lucide-react';

export default function Calculator() {
  const [vialAmount, setVialAmount] = useState('5'); // mg
  const [diluentAmount, setDiluentAmount] = useState('2'); // ml
  const [targetDose, setTargetDose] = useState('250'); // mcg

  // Math
  const vialMcg = parseFloat(vialAmount || 0) * 1000;
  const diluentMl = parseFloat(diluentAmount || 0);
  const doseMcg = parseFloat(targetDose || 0);

  let concentration = 0; // mcg per ml
  let drawVolume = 0; // ml
  let units = 0; // U-100 units
  let dosesPerVial = 0;

  if (diluentMl > 0 && vialMcg > 0 && doseMcg > 0) {
    concentration = vialMcg / diluentMl;
    drawVolume = doseMcg / concentration;
    units = drawVolume * 100;
    dosesPerVial = vialMcg / doseMcg;
  }

  return (
    <div className="p-lg pt-xl flex-col gap-lg animate-fade-in w-full pb-xl">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-light">Calculator</h1>
          <p className="text-secondary text-sm mt-xs">Reconstitution Math</p>
        </div>
        <button className="btn-icon" style={{ width: '40px', height: '40px' }}>
          <Settings size={18} />
        </button>
      </div>

      {/* Main Result Display - Inspired by the water app UI */}
      <div className="flex justify-between items-end mt-sm px-sm">
        <div className="flex-col">
          <span className="text-5xl font-light" style={{ lineHeight: '1' }}>{units > 0 ? units.toFixed(1) : '0.0'}</span>
          <span className="text-secondary text-sm mt-xs">Syringe Units (U-100)</span>
        </div>
        <div className="flex-col items-end pb-xs">
          <span className="text-2xl font-light">{dosesPerVial > 0 ? Math.floor(dosesPerVial) : '0'}</span>
          <span className="text-secondary text-xs">Full Doses</span>
        </div>
      </div>

      <div className="glass-panel p-lg flex-col gap-md mt-sm relative overflow-hidden">
        <Beaker size={140} className="absolute right-[-20px] bottom-[-20px] opacity-10" />
        
        <div className="flex-col gap-sm relative z-10">
          <label className="text-sm text-secondary">Vial Size (mg)</label>
          <div className="flex items-center" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.2)' }}>
             <input 
               type="number" 
               value={vialAmount}
               onChange={(e) => setVialAmount(e.target.value)}
               style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', padding: 0, margin: 0, fontSize: '1.25rem', color: '#fff' }}
               placeholder="e.g. 5"
             />
             <span className="text-secondary font-medium ml-sm">mg</span>
          </div>
        </div>

        <div className="flex-col gap-sm mt-sm relative z-10">
          <label className="text-sm text-secondary">Bacteriostatic Water (ml)</label>
          <div className="flex items-center" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.2)' }}>
             <input 
               type="number" 
               value={diluentAmount}
               onChange={(e) => setDiluentAmount(e.target.value)}
               style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', padding: 0, margin: 0, fontSize: '1.25rem', color: '#fff' }}
               placeholder="e.g. 2"
             />
             <span className="text-secondary font-medium ml-sm">ml</span>
          </div>
        </div>

        <div className="flex-col gap-sm mt-sm relative z-10">
          <label className="text-sm text-secondary">Target Dose (mcg)</label>
           <div className="flex items-center" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.2)' }}>
             <input 
               type="number" 
               value={targetDose}
               onChange={(e) => setTargetDose(e.target.value)}
               style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', padding: 0, margin: 0, fontSize: '1.25rem', color: '#fff' }}
               placeholder="e.g. 250"
             />
             <span className="text-secondary font-medium ml-sm">mcg</span>
          </div>
        </div>
      </div>

      <div className="glass-card flex items-start gap-md mt-sm" style={{ background: 'rgba(0,0,0,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <AlertCircle size={24} className="text-secondary flex-shrink-0" />
        <p className="text-sm text-secondary leading-relaxed">
          {concentration > 0 ? (
            <>Based on {vialAmount}mg with {diluentAmount}ml water, the concentration is <strong>{(concentration / 1000).toFixed(2)}mg per 1ml</strong>. Draw to the <strong>{units.toFixed(1)}</strong> tick mark on a standard U-100 insulin syringe to get exactly {targetDose}mcg.</>
          ) : (
            <>Enter parameters above to calculate your dosage.</>
          )}
        </p>
      </div>

      <button className="btn-primary mt-lg" style={{ background: '#1c1c1e' }}>
        <Save size={20} />
        Save as Recipe
      </button>
      
      {/* Scroll spacer */}
      <div style={{ height: '40px' }}></div>
    </div>
  );
}
