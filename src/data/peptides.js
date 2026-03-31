// Shared peptide database used by Calculator, Protocol Builder, and Library
export const peptidesDB = {
  "BPC-157": {
    category: "Recovery & Healing",
    desc: "Accelerates healing of tendons, muscles, gut lining, and the nervous system. Found naturally in human gastric juice.",
    timing: "Best taken at night (8–9 PM) to align with natural recovery during sleep. Can also be taken morning or post-workout.",
    administration: "SubQ injection into belly fat or near injury site. Rotate injection sites.",
    defaultVial: 5,
    reconstitution: "Add bacteriostatic water slowly along the glass wall. Swirl gently — never shake. Solution should be perfectly clear.",
    doses: {
      low:  { mcg: 250, label: "Maintenance / Mild Support", risk: "Minimal side effects at this dose." },
      med:  { mcg: 500, label: "Standard Protocol", risk: "Well-tolerated. Mild injection site redness possible." },
      high: { mcg: 750, label: "Acute Injury / Aggressive Healing", risk: "Higher doses increase injection site reactions. Monitor closely." }
    },
    schedule: "Daily",
    typicalCycle: 8, // weeks
    color: "#a855f7"
  },
  "TB-500": {
    category: "Healing & Inflammation",
    desc: "Synthetic fraction of Thymosin Beta-4. Reduces systemic inflammation and promotes tissue repair. Often stacked with BPC-157.",
    timing: "Evening or post-workout. Can be taken alongside BPC-157.",
    administration: "SubQ injection. Belly or upper arm.",
    defaultVial: 5,
    reconstitution: "Standard reconstitution. Add 2ml bacteriostatic water for a 2.5mg/ml concentration.",
    doses: {
      low:  { mcg: 2000, label: "Maintenance Phase", risk: "Minimal risk. Well-studied at this range." },
      med:  { mcg: 5000, label: "Loading / Active Recovery", risk: "Mild lethargy or head rush possible in first week." },
      high: { mcg: 10000, label: "Aggressive Loading", risk: "Higher risk of lethargy. Not recommended without experience." }
    },
    schedule: "2x per week",
    typicalCycle: 6,
    color: "#6366f1"
  },
  "Tirzepatide": {
    category: "Fat Loss & Metabolic",
    desc: "Dual GIP/GLP-1 receptor agonist. FDA-approved for type 2 diabetes. Widely used off-label for significant weight loss.",
    timing: "Morning, fasted. Once weekly injection. Same day each week.",
    administration: "SubQ injection. Rotate between belly, thigh, and upper arm.",
    defaultVial: 10,
    reconstitution: "Reconstitute with 2ml bacteriostatic water. Some formulations come pre-mixed.",
    doses: {
      low:  { mcg: 2500, label: "Starting Titration (Week 1–4)", risk: "Nausea common in first 2 weeks. Start here." },
      med:  { mcg: 5000, label: "Maintenance Dose", risk: "GI side effects possible. Eat slowly, stay hydrated." },
      high: { mcg: 10000, label: "Advanced Metabolic Correction", risk: "Significant nausea, vomiting risk. Only with clinical oversight." }
    },
    schedule: "Weekly",
    typicalCycle: 12,
    color: "#ec4899"
  },
  "Semaglutide": {
    category: "Fat Loss & Appetite",
    desc: "GLP-1 receptor agonist. Originally for type 2 diabetes, now FDA-approved for weight management (Wegovy).",
    timing: "Morning or evening. Once weekly. Same day each week.",
    administration: "SubQ injection. Belly, thigh, or upper arm.",
    defaultVial: 5,
    reconstitution: "Add 2ml bacteriostatic water. Swirl gently.",
    doses: {
      low:  { mcg: 250, label: "Starting (Month 1)", risk: "Mild nausea. Take with small meals." },
      med:  { mcg: 500, label: "Titration (Month 2–3)", risk: "GI effects may increase. Stay hydrated." },
      high: { mcg: 1000, label: "Maintenance / Target", risk: "Strong appetite suppression. Risk of rapid weight loss." }
    },
    schedule: "Weekly",
    typicalCycle: 16,
    color: "#f43f5e"
  },
  "CJC-1295 / Ipamorelin": {
    category: "Growth Hormone",
    desc: "Combination stack stimulating natural GH release. Improves sleep, recovery, body composition, and skin quality.",
    timing: "Before bed on an empty stomach (no food 2hrs prior). GH pulses strongest during deep sleep.",
    administration: "SubQ injection. Belly fat.",
    defaultVial: 5,
    reconstitution: "Standard reconstitution with 2ml bacteriostatic water.",
    doses: {
      low:  { mcg: 100, label: "Introductory / Sleep Focus", risk: "Very well-tolerated. Vivid dreams common." },
      med:  { mcg: 200, label: "Standard Protocol", risk: "Mild water retention, tingling in hands possible." },
      high: { mcg: 300, label: "Aggressive Body Recomp", risk: "Increased water retention. Joint stiffness possible." }
    },
    schedule: "5 days on / 2 days off",
    typicalCycle: 12,
    color: "#14b8a6"
  }
};

// Calculator math utilities
export function calcConcentration(vialMg, waterMl) {
  if (!vialMg || !waterMl || waterMl <= 0) return 0;
  return (vialMg * 1000) / waterMl; // mcg per ml
}

export function calcDrawVolume(targetMcg, concentrationMcgPerMl) {
  if (!concentrationMcgPerMl || concentrationMcgPerMl <= 0) return 0;
  return targetMcg / concentrationMcgPerMl; // ml
}

export function calcSyringeUnits(drawVolumeMl) {
  return drawVolumeMl * 100; // U-100 syringe
}

export function calcDosesPerVial(vialMg, targetMcg) {
  if (!targetMcg || targetMcg <= 0) return 0;
  return (vialMg * 1000) / targetMcg;
}

export function calcVialsNeeded(targetMcg, dosesPerWeek, weeks, vialMg) {
  if (!vialMg || !targetMcg) return 0;
  const totalDoses = dosesPerWeek * weeks;
  const dosesPerVial = calcDosesPerVial(vialMg, targetMcg);
  return Math.ceil(totalDoses / dosesPerVial);
}
