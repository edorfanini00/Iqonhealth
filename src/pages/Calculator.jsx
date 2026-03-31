import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Beaker, Save, ChevronDown, ArrowRight, Package, BookOpen, AlertTriangle } from 'lucide-react';
import { peptidesDB, calcConcentration, calcDrawVolume, calcSyringeUnits, calcDosesPerVial, calcVialsNeeded, lbsToKg, kgToLbs } from '../data/peptides';

const compoundNames = Object.keys(peptidesDB);

export default function Calculator() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('reconstitution');
  const [compound, setCompound] = useState('BPC-157');
  const [vialMg, setVialMg] = useState('5');
  const [waterMl, setWaterMl] = useState('2');
  const [weightVal, setWeightVal] = useState('80');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [supplyWeeks, setSupplyWeeks] = useState('8');
  const [dosesPerWeek, setDosesPerWeek] = useState('7');
  const [showPicker, setShowPicker] = useState(false);

  const compData = peptidesDB[compound];
  const weightKg = weightUnit === 'lbs' ? lbsToKg(parseFloat(weightVal || 0)) : parseFloat(weightVal || 0);
  const concentration = calcConcentration(parseFloat(vialMg || 0), parseFloat(waterMl || 0));

  const toggleWeightUnit = () => {
    const current = parseFloat(weightVal || 0);
    if (weightUnit === 'kg') {
      setWeightUnit('lbs');
      setWeightVal(kgToLbs(current).toFixed(0));
    } else {
      setWeightUnit('kg');
      setWeightVal(lbsToKg(current).toFixed(0));
    }
  };

  return (
    <div style={{ padding: '24px', paddingTop: '48px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '140px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.5px' }}>Calculator</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', marginTop: '4px' }}>Research-backed dosing math</p>
      </div>

      {/* Mode Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {[
          { id: 'reconstitution', label: 'Reconstitution' },
          { id: 'supply', label: 'Supply Estimator' },
        ].map(m => (
          <button 
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              background: mode === m.id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${mode === m.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'}`,
              borderRadius: '999px',
              padding: '10px 20px',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#fff',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit'
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Compound Picker */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.4)', paddingLeft: '4px' }}>Compound</label>
        <div 
          onClick={() => setShowPicker(!showPicker)}
          style={{
            background: '#141415',
            borderRadius: '16px',
            padding: '16px 20px',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: compData?.color || '#fff' }}></div>
            <span style={{ fontWeight: 500, color: '#fff' }}>{compound}</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{compData?.category}</span>
          </div>
          <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.3)', transform: showPicker ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
        </div>
        
        {showPicker && (
          <div style={{ background: '#141415', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            {compoundNames.map(name => (
              <div 
                key={name}
                onClick={() => { 
                  setCompound(name); 
                  setVialMg(peptidesDB[name].defaultVial.toString());
                  setShowPicker(false); 
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 20px', cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  background: compound === name ? 'rgba(255,255,255,0.05)' : 'transparent'
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: peptidesDB[name].color }}></div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#fff' }}>{name}</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{peptidesDB[name].category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════ RECONSTITUTION MODE ═══════ */}
      {mode === 'reconstitution' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Input Card */}
          <div style={{ background: '#0d0d0f', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <InputRow label="Vial Size" value={vialMg} onChange={setVialMg} unit="mg" />
            <InputRow label="Bacteriostatic Water" value={waterMl} onChange={setWaterMl} unit="ml" />
            
            {/* Weight with toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.4)', paddingLeft: '4px' }}>Body Weight</label>
                <button 
                  onClick={toggleWeightUnit}
                  style={{
                    background: 'rgba(168,85,247,0.15)',
                    border: '1px solid rgba(168,85,247,0.3)',
                    borderRadius: '999px',
                    padding: '4px 12px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#c084fc',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    letterSpacing: '1px'
                  }}
                >
                  {weightUnit === 'kg' ? 'Switch to lbs' : 'Switch to kg'}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', padding: '14px 16px' }}>
                <input 
                  type="number" value={weightVal} onChange={e => setWeightVal(e.target.value)}
                  style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', padding: 0, fontSize: '1.1rem', color: '#fff', fontWeight: 500, fontFamily: 'inherit' }}
                  placeholder="0"
                />
                <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 500, fontSize: '0.875rem', marginLeft: '8px', flexShrink: 0 }}>{weightUnit}</span>
              </div>
            </div>
          </div>

          {/* Concentration Result */}
          {concentration > 0 && (
            <div style={{ background: '#141415', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.4)' }}>Concentration</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff', marginTop: '4px' }}>{(concentration / 1000).toFixed(2)} <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>mg/ml</span></span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.4)' }}>{concentration.toFixed(0)}</span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>mcg per ml</span>
              </div>
            </div>
          )}

          {/* Auto-Recommended Dose Tiers */}
          {concentration > 0 && compData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.4)', paddingLeft: '4px', textTransform: 'uppercase' }}>
                Auto-Calculated Dosages for {compound}
                {compData.weightBased && weightKg > 0 && <span style={{ color: '#c084fc' }}> • {weightKg.toFixed(0)}kg</span>}
              </span>

              {Object.entries(compData.doses).map(([tier, data]) => {
                // If weight-based + weight provided, use weight calc. Otherwise use fixed dose.
                let doseMcg = data.mcg;
                if (compData.weightBased && weightKg > 0) {
                  doseMcg = Math.round(weightKg * compData.weightBased.mcgPerKg[tier]);
                }

                const drawMl = calcDrawVolume(doseMcg, concentration);
                const units = calcSyringeUnits(drawMl);
                const dosesVial = calcDosesPerVial(parseFloat(vialMg), doseMcg);
                const isHigh = tier === 'high';
                const isMed = tier === 'med';

                return (
                  <div 
                    key={tier}
                    style={{
                      background: isHigh ? 'rgba(255,69,58,0.06)' : isMed ? 'rgba(168,85,247,0.06)' : '#141415',
                      borderRadius: '16px',
                      padding: '20px',
                      border: `1px solid ${isHigh ? 'rgba(255,69,58,0.2)' : isMed ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.05)'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {isHigh && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#ff453a' }}></div>}
                    {isMed && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#a855f7' }}></div>}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: isHigh || isMed ? '8px' : '0', flex: 1, paddingRight: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: isHigh ? '#ff453a' : isMed ? '#c084fc' : '#fff' }}>
                          {tier === 'low' ? 'Low' : tier === 'med' ? 'Medium' : 'High'}
                        </span>
                        {isMed && <span style={{ fontSize: '8px', background: 'rgba(168,85,247,0.3)', padding: '2px 8px', borderRadius: '999px', color: '#c084fc', fontWeight: 700, letterSpacing: '1px' }}>RECOMMENDED</span>}
                        {isHigh && <span style={{ fontSize: '8px', background: 'rgba(255,69,58,0.2)', padding: '2px 8px', borderRadius: '999px', color: '#ff453a', fontWeight: 700, letterSpacing: '1px' }}>⚠ CAUTION</span>}
                      </div>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{data.label}</span>
                      <span style={{ fontSize: '12px', color: isHigh ? 'rgba(255,69,58,0.7)' : 'rgba(255,255,255,0.35)', marginTop: '4px', lineHeight: '1.5' }}>{data.risk}</span>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '2px', fontStyle: 'italic' }}>{data.source}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                      <span style={{ fontSize: '1.75rem', fontWeight: 600, color: isHigh ? '#ff453a' : isMed ? '#c084fc' : '#fff', lineHeight: 1 }}>{units.toFixed(1)}</span>
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: '4px' }}>UNITS</span>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>{doseMcg}mcg</span>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>{Math.floor(dosesVial)} doses/vial</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reconstitution Guide */}
          {compData && (
            <div style={{ background: '#0a0a0c', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc' }}>
                <BookOpen size={14} />
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>How to Reconstitute</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.7' }}>{compData.reconstitution}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                <InfoLine label="Best Time" value={compData.timing} />
                <InfoLine label="Administration" value={compData.administration} />
                <InfoLine label="Schedule" value={compData.schedule} />
                <InfoLine label="Typical Cycle" value={`${compData.typicalCycle} weeks`} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button 
              onClick={() => navigate('/app/protocol-wizard')}
              style={{ flex: 1, background: '#fff', color: '#000', border: 'none', borderRadius: '999px', padding: '16px', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <ArrowRight size={16} /> Add to Protocol
            </button>
          </div>
        </div>
      )}

      {/* ═══════ SUPPLY ESTIMATOR MODE ═══════ */}
      {mode === 'supply' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#0d0d0f', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <InputRow label="Vial Size" value={vialMg} onChange={setVialMg} unit="mg" />
            <InputRow label="Dose per injection" value={(compData?.doses?.med?.mcg || 500).toString()} onChange={() => {}} unit="mcg" />
            <InputRow label="Doses per Week" value={dosesPerWeek} onChange={setDosesPerWeek} unit="doses" />
            <InputRow label="Cycle Length" value={supplyWeeks} onChange={setSupplyWeeks} unit="weeks" />
          </div>

          {(() => {
            const medDose = compData?.doses?.med?.mcg || 500;
            const needed = calcVialsNeeded(medDose, parseFloat(dosesPerWeek || 0), parseFloat(supplyWeeks || 0), parseFloat(vialMg || 0));
            return (
              <div style={{ background: 'rgba(168,85,247,0.06)', borderRadius: '20px', padding: '40px 24px', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#c084fc' }}>You Will Need</span>
                <span style={{ fontSize: '3.5rem', fontWeight: 700, color: '#fff', marginTop: '8px', lineHeight: 1 }}>{needed > 0 ? needed : '—'}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', marginTop: '8px' }}>vials of {compound} ({vialMg}mg each)</span>
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', marginTop: '12px' }}>for {supplyWeeks} weeks at {medDose}mcg × {dosesPerWeek}x/week</span>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function InputRow({ label, value, onChange, unit }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.4)', paddingLeft: '4px' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', padding: '14px 16px' }}>
        <input 
          type="number" value={value} onChange={e => onChange(e.target.value)}
          style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', padding: 0, fontSize: '1.1rem', color: '#fff', fontWeight: 500, fontFamily: 'inherit' }}
          placeholder="0"
        />
        <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 500, fontSize: '0.875rem', marginLeft: '8px', flexShrink: 0 }}>{unit}</span>
      </div>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', minWidth: '90px', flexShrink: 0 }}>{label}:</span>
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>{value}</span>
    </div>
  );
}
