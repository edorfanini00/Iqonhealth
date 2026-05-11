// ═══════════════════════════════════════════════════════════════
// Shared dose display utility — used in Home, Calendar, Protocols
// Ensures consistent "X units · Y mL · Z mcg/mg" format everywhere
// ═══════════════════════════════════════════════════════════════

/**
 * Returns a compact one-line dose summary for any protocol compound.
 * Example: "50 units · 0.50 mL · 50 mg"
 * Falls back to: "100 mg" if vial/dose info is missing.
 */
export function doseInfo(comp) {
  if (!comp) return '';
  const amt = parseFloat(comp.amount) || 0;
  const unit = comp.unit || 'mcg';
  const vialMl = parseFloat(comp.vialSizeMl) || 0;
  const doseMl = parseFloat(comp.dosePerUseMl) || 0;

  if (!doseMl || !vialMl || !amt) return `${amt} ${unit}`;

  const syringeUnits = Math.round(doseMl * 100);
  const actualDose = (amt / vialMl) * doseMl;

  let doseStr;
  if (unit === 'mg' && actualDose < 1) {
    doseStr = `${Math.round(actualDose * 1000)} mcg`;
  } else {
    doseStr = `${parseFloat(actualDose.toFixed(2))} ${unit}`;
  }

  return `${syringeUnits} units · ${doseMl.toFixed(2)} mL · ${doseStr}`;
}

/**
 * Returns structured dose parts for detail views.
 * Allows each value to be styled/laid out separately.
 */
export function doseBreakdown(comp) {
  if (!comp) return null;
  const amt = parseFloat(comp.amount) || 0;
  const unit = comp.unit || 'mcg';
  const vialMl = parseFloat(comp.vialSizeMl) || 0;
  const doseMl = parseFloat(comp.dosePerUseMl) || 0;

  if (!doseMl || !vialMl || !amt) return null;

  const syringeUnits = Math.round(doseMl * 100);
  const actualDose = (amt / vialMl) * doseMl;
  const concentrationMcgPerMl = (amt / vialMl) * 1000; // mcg/mL when amt is in mg

  let doseStr;
  if (unit === 'mg' && actualDose < 1) {
    doseStr = `${Math.round(actualDose * 1000)} mcg`;
  } else {
    doseStr = `${parseFloat(actualDose.toFixed(2))} ${unit}`;
  }

  return {
    syringeUnits,           // e.g. 50
    drawMl: doseMl,         // e.g. 0.50
    actualDoseStr: doseStr, // e.g. "50 mg" or "250 mcg"
    concentration: unit === 'mg'
      ? `${(amt / vialMl).toFixed(1)} mg/mL`
      : `${Math.round(concentrationMcgPerMl)} mcg/mL`,
  };
}
