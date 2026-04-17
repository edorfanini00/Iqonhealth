// ═══════════════════════════════════════════════════════════════
// PEPTIDE KNOWLEDGE BASE — Research-Referenced Dosing Data
// Sources: FDA labels, clinical titration protocols, peer-reviewed
// animal studies extrapolated to common wellness-clinic practice.
// THIS IS NOT MEDICAL ADVICE.
// ═══════════════════════════════════════════════════════════════

export const peptidesDB = {

  "BPC-157": {
    category: "Recovery & Healing",
    desc: "A pentadecapeptide (15 amino acids) isolated from human gastric juice. Studied extensively in animal models for tendon, ligament, muscle, gut, and nerve repair. Not FDA-approved.",
    timing: "Evening (8–9 PM) to align with overnight tissue repair. Can also be taken morning or near training. Twice-daily split dosing (AM + PM) is common at higher tiers.",
    administration: "Subcutaneous (SubQ) injection into abdominal fat, or locally near the injury site. Rotate injection sites daily.",
    defaultVial: 5, // mg
    schedule: "Daily",
    typicalCycle: 8, // weeks
    color: "#a855f7",
    reconstitution: "Add bacteriostatic water slowly along the inside glass wall of the vial. Never spray directly on the powder. Swirl very gently — never shake. Solution must be perfectly clear before use. Store in refrigerator (2–8°C) after reconstitution. Discard after 28 days.",
    // Research basis: Animal studies use ~10 mcg/kg. Wellness clinics commonly prescribe 200–800 mcg/day for humans.
    // Weight-based: ~2.5–10 mcg/kg/day is the extrapolated range.
    doses: {
      low:  { mcg: 250, label: "Maintenance / Mild Support", risk: "Very well-tolerated. Minimal side effects expected. Good starting point for first-time users.", source: "Common wellness clinic starting dose" },
      med:  { mcg: 500, label: "Standard Healing Protocol", risk: "Well-tolerated. Mild injection-site redness possible. Most commonly prescribed dose in clinical settings.", source: "Standard wellness clinic protocol" },
      high: { mcg: 750, label: "Acute Injury / Aggressive", risk: "Increased injection-site reactions. Some report mild nausea or dizziness. Split into 2 daily doses recommended. Monitor closely for 2 weeks.", source: "Upper range used for acute injury protocols" }
    }
  },

  "TB-500": {
    category: "Healing & Inflammation",
    desc: "A synthetic fragment of Thymosin Beta-4 (Tβ4). Acts systemically to reduce inflammation, promote angiogenesis, and accelerate tissue repair. Often stacked with BPC-157 for synergistic recovery. Not FDA-approved.",
    timing: "Evening or post-workout. Injection site location is less critical than BPC-157 because TB-500 acts systemically.",
    administration: "Subcutaneous injection. Abdomen or upper arm. Since it works systemically, injection proximity to injury is not necessary.",
    defaultVial: 5,
    schedule: "2x per week",
    typicalCycle: 6,
    color: "#6366f1",
    reconstitution: "Standard reconstitution with bacteriostatic water. Aim water along the glass wall. Swirl gently. Store refrigerated. Use within 28 days.",
    // Research basis: Loading phase 2–5mg 2x/week for 4–6 weeks, then maintenance 2–5mg 1x/week.
    doses: {
      low:  { mcg: 2000, label: "Maintenance Phase (post-loading)", risk: "Well-tolerated at this dose. Suitable for ongoing maintenance after initial loading.", source: "Standard maintenance protocol" },
      med:  { mcg: 5000, label: "Loading Phase — Standard", risk: "Mild lethargy or brief head rush possible in first few injections. Generally well-tolerated.", source: "Common loading phase dose (2x/week)" },
      high: { mcg: 7500, label: "Aggressive Loading", risk: "Increased lethargy and possible headaches. Not recommended without prior experience at lower doses. Reduce if side effects persist.", source: "Upper loading range — advanced users only" }
    }
  },

  "Tirzepatide": {
    category: "Fat Loss & Metabolic",
    desc: "A dual GIP/GLP-1 receptor agonist. FDA-approved as Mounjaro (T2D) and Zepbound (weight management). Once-weekly injection. Requires slow titration over months to minimize GI side effects.",
    timing: "Same day each week. Morning or evening — consistency matters more than time of day. Take on a planned schedule.",
    administration: "Subcutaneous injection. Rotate between abdomen, thigh, and upper arm. Never inject into the same spot consecutively.",
    defaultVial: 10,
    schedule: "Weekly",
    typicalCycle: 16,
    color: "#ec4899",
    reconstitution: "If using lyophilized powder: reconstitute with 2ml bacteriostatic water. Some compounding pharmacies ship pre-mixed solutions. Store refrigerated.",
    // FDA titration: Start 2.5mg x4wks → 5mg x4wks → 7.5mg → 10mg → 12.5mg → max 15mg
    doses: {
      low:  { mcg: 2500, label: "Starting Titration (Weeks 1–4)", risk: "Nausea is common in first 1–2 weeks — this is normal and expected. Eat slowly, stay well-hydrated, avoid large fatty meals.", source: "FDA-approved starting dose (Mounjaro/Zepbound)" },
      med:  { mcg: 5000, label: "Standard Maintenance (Weeks 5–8)", risk: "GI side effects (nausea, constipation) may reappear at titration. Stay at this dose 4+ weeks before increasing.", source: "FDA titration step 2" },
      high: { mcg: 10000, label: "Advanced Dose (Weeks 12+)", risk: "Significant nausea and vomiting risk. Should only be reached after gradual titration from 2.5mg over 12+ weeks. Clinical supervision required.", source: "FDA titration — only after tolerance established" }
    }
  },

  "Semaglutide": {
    category: "Fat Loss & Appetite",
    desc: "A GLP-1 receptor agonist. FDA-approved as Ozempic (T2D, up to 2mg/week) and Wegovy (weight management, up to 2.4mg/week). Suppresses appetite by slowing gastric emptying and acting on brain satiety centers.",
    timing: "Same day each week. Time of day is flexible — pick a consistent schedule. Can be taken with or without food.",
    administration: "Subcutaneous injection. Abdomen, thigh, or upper arm. Rotate injection sites weekly.",
    defaultVial: 5,
    schedule: "Weekly",
    typicalCycle: 16,
    color: "#f43f5e",
    reconstitution: "If using lyophilized powder: reconstitute with 2ml bacteriostatic water along the glass wall. Swirl gently. Refrigerate after mixing.",
    // FDA Wegovy titration: 0.25mg→0.5mg→1.0mg→1.7mg→2.4mg (each step 4 weeks)
    doses: {
      low:  { mcg: 250, label: "Starting Titration (Weeks 1–4)", risk: "Mild nausea expected. Eat smaller meals. Stay hydrated. This is the standard medical starting dose.", source: "FDA-approved Wegovy starting dose (0.25mg)" },
      med:  { mcg: 500, label: "Titration Step 2 (Weeks 5–8)", risk: "GI effects may increase temporarily. If persistent, stay at this dose an extra 4 weeks before escalating.", source: "FDA Wegovy dose escalation (0.5mg)" },
      high: { mcg: 1000, label: "Mid-Titration (Weeks 9–12)", risk: "Noticeable appetite suppression. Risk of rapid weight loss if caloric intake drops too low. Ensure adequate protein intake (1g/lb). Monitor regularly.", source: "FDA Wegovy dose escalation (1.0mg)" }
    }
  },

  "CJC-1295 / Ipamorelin": {
    category: "Growth Hormone Secretion",
    desc: "A combination stack: CJC-1295 (GHRH analog) extends growth hormone pulses while Ipamorelin (GH secretagogue) amplifies them. Together they promote natural GH release for recovery, sleep, body composition, and anti-aging.",
    timing: "Bedtime on an empty stomach (no food for 2 hours before). Aligns with the body's largest natural GH pulse during deep sleep. Avoid eating 30–60 minutes after injection.",
    administration: "Subcutaneous injection. Abdominal fat. Some protocols also use inner thigh or deltoid.",
    defaultVial: 5,
    schedule: "5 days on / 2 off",
    typicalCycle: 12,
    color: "#14b8a6",
    reconstitution: "Standard reconstitution. Add bacteriostatic water along the inside wall of the vial. Swirl gently. Refrigerate. Use within 21 days for best potency.",
    // Common: 100–300mcg of each peptide per administration. Often 100mcg each for beginners.
    doses: {
      low:  { mcg: 100, label: "Introductory / Sleep-Focused", risk: "Very well-tolerated. Vivid dreams are common and expected. Mild tingling in fingertips possible.", source: "Standard beginner protocol (100mcg each)" },
      med:  { mcg: 200, label: "Standard Body Recomp", risk: "Mild water retention and occasional hand/wrist tingling possible. Generally well-tolerated.", source: "Standard clinical protocol (200mcg each)" },
      high: { mcg: 300, label: "Aggressive GH Optimization", risk: "Water retention, joint stiffness, and carpal tunnel-like symptoms possible. Reduce dose if numbness persists. Monitor IGF-1 levels.", source: "Upper clinical range (300mcg each)" }
    }
  },

  "GHK-Cu": {
    category: "Skin, Hair & Healing",
    desc: "Copper tripeptide-1. Promotes collagen synthesis, skin elasticity, hair growth, and dampens systemic inflammation. Not FDA-approved.",
    timing: "Morning or Evening. Time of day is not critical.",
    administration: "Subcutaneous injection into abdominal fat or thigh. Rotate sites frequently as GHK-Cu can cause localized injection site pain/redness.",
    defaultVial: 50,
    schedule: "Daily",
    typicalCycle: 8, // Often cycled 30-60 days on, then an equal off period
    color: "#3b82f6", // Blue
    reconstitution: "Add bacteriostatic water carefully. The solution will turn bright blue. Store refrigerated. If experiencing injection site pain, dilute with more water or inject deeper SubQ.",
    doses: {
      low:  { mcg: 1000, label: "Starting Dose (1mg)", risk: "Well tolerated. Lowest risk of copper accumulation or injection site pain.", source: "Conservative research protocol" },
      med:  { mcg: 2000, label: "Standard Dose (2mg)", risk: "Standard effective dose for skin/healing. Monitor for injection site irritation.", source: "Standard wellness protocol" },
      high: { mcg: 3000, label: "Aggressive Healing (3mg+)", risk: "Higher risk of localized pain and theoretical copper toxicity if not cycled properly. Do not exceed 8 weeks.", source: "Advanced targeted healing protocol" }
    }
  },

  "Semax": {
    category: "Cognition & Nootropics",
    desc: "Synthetic peptide derived from ACTH. Modulates BDNF and supports cognitive enhancement, focus, and neuroprotection. Not FDA-approved.",
    timing: "Morning or early afternoon. AVOID evening use as it can cause insomnia due to its stimulant-like properties.",
    administration: "Subcutaneous injection (though intranasal is also popular).",
    defaultVial: 30, // Often 10mg to 30mg vials
    schedule: "Daily (or 5 days on / 2 off)",
    typicalCycle: 4,
    color: "#eab308", // Yellow
    reconstitution: "Standard reconstitution. Store refrigerated. Degrades quickly if exposed to heat or vigorous shaking.",
    doses: {
      low:  { mcg: 150, label: "Threshold / Subtle Focus", risk: "Very low risk. Good starting dose to test sensitivity.", source: "Threshold cognitive dose" },
      med:  { mcg: 300, label: "Standard Nootropic Dose", risk: "Clean focus and energy. Can cause mild anxiety in sensitive individuals.", source: "Standard cognitive protocol" },
      high: { mcg: 600, label: "Deep Work / High Stress", risk: "Stimulant-like effects. Higher risk of anxiety, restlessness, and insomnia if taken late.", source: "Advanced acute focus protocol" }
    }
  },

  "Selank": {
    category: "Anxiety & Mood",
    desc: "Anxiolytic peptide closely related to Tuftsin. Promotes relaxation, reduces anxiety, and stabilizes mood without the sedative effects of traditional anxiolytics. Not FDA-approved.",
    timing: "Morning or evening. Does not typically cause drowsiness, but calms the nervous system.",
    administration: "Subcutaneous injection. Rotate sites.",
    defaultVial: 10,
    schedule: "Daily or As Needed",
    typicalCycle: 4,
    color: "#22c55e", // Green
    reconstitution: "Standard reconstitution with bacteriostatic water. Keep refrigerated.",
    doses: {
      low:  { mcg: 250, label: "Mild Anxiety / Baseline", risk: "Very well tolerated. No sedative effects.", source: "Standard starting protocol" },
      med:  { mcg: 500, label: "Standard Anxiolytic Dose", risk: "Effective for managing daily stress. Some users split this into 250mcg twice daily.", source: "Common clinical recommendation" },
      high: { mcg: 1000, label: "Acute Stress Response", risk: "High dose. Diminishing returns reported beyond this level. No significant toxicity observed, but unnecessary for daily use.", source: "Upper ceiling limit" }
    }
  },

  "Ipamorelin": {
    category: "Growth Hormone Secretion",
    desc: "A highly selective GH secretagogue. Simulates a natural growth hormone pulse without significantly increasing cortisol or prolactin. Not FDA-approved.",
    timing: "Bedtime (empty stomach, 2 hrs post-meal) or before fasted cardio. Aligns with natural GH release.",
    administration: "Subcutaneous injection into abdominal fat.",
    defaultVial: 5,
    schedule: "5 days on / 2 off",
    typicalCycle: 12,
    color: "#0ea5e9", // Light blue
    reconstitution: "Standard reconstitution. Store refrigerated.",
    doses: {
      low:  { mcg: 100, label: "Anti-Aging / Sleep", risk: "Very well tolerated. Often combined with CJC-1295.", source: "Conservative starting dose" },
      med:  { mcg: 200, label: "Standard Optimization", risk: "Standard dose for body recomp and recovery. Mild tingling possible.", source: "Standard clinical protocol" },
      high: { mcg: 300, label: "Aggressive Hypertrophy", risk: "Higher risk of water retention. Usually split into 2-3 injections per day rather than taken all at once.", source: "Upper limit single dose" }
    }
  },

  "GLOW Blend": {
    category: "Aesthetics & Repair",
    desc: "A compounded blend typically containing GHK-Cu, BPC-157, and sometimes TB-500. Designed for skin elasticity, hair growth, and overall tissue rejuvenation. Not FDA-approved.",
    timing: "Morning or Evening. Consistent daily dosing.",
    administration: "Subcutaneous injection. Rotate sites as the GHK-Cu component can cause localized irritation.",
    defaultVial: 50, // Vials vary wildly in total mg, using 50 as a placeholder for GLOW blends
    schedule: "Daily",
    typicalCycle: 8,
    color: "#f59e0b", // Amber
    reconstitution: "Standard reconstitution. Solution may be blue due to GHK-Cu. If injection stings, dilute with additional bacteriostatic water.",
    doses: {
      low:  { mcg: 500, label: "Starter Dose", risk: "Lowest risk of injection site pain.", source: "Introductory blend dose" },
      med:  { mcg: 1000, label: "Standard Dose", risk: "Monitor injection sites for redness/swelling due to copper content.", source: "Standard clinical blend dose" },
      high: { mcg: 2000, label: "Aggressive Protocol", risk: "High risk of localized pain. Consider splitting into two daily injections.", source: "Advanced blend dosing" }
    }
  }

};

// ═══════════════════════════════════════════════════════════════
// CALCULATOR MATH
// ═══════════════════════════════════════════════════════════════

export function calcConcentration(vialMg, waterMl) {
  if (!vialMg || !waterMl || waterMl <= 0) return 0;
  return (vialMg * 1000) / waterMl; // mcg per ml
}

export function calcDrawVolume(targetMcg, concentrationMcgPerMl) {
  if (!concentrationMcgPerMl || concentrationMcgPerMl <= 0) return 0;
  return targetMcg / concentrationMcgPerMl; // ml
}

export function calcSyringeUnits(drawVolumeMl) {
  return drawVolumeMl * 100; // U-100 insulin syringe
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

export function lbsToKg(lbs) {
  return lbs * 0.453592;
}

export function kgToLbs(kg) {
  return kg / 0.453592;
}
