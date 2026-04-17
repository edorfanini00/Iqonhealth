// ═══════════════════════════════════════════════════════════════
// PEPTIDE KNOWLEDGE BASE — Research-Referenced Dosing Data
// Sources: FDA labels, clinical titration protocols, peer-reviewed
// animal studies extrapolated to common wellness-clinic practice.
// THIS IS NOT MEDICAL ADVICE.
// ═══════════════════════════════════════════════════════════════

export const peptidesDB = {

  // ───────────────────────────────────────────────────────────
  // RECOVERY & HEALING
  // ───────────────────────────────────────────────────────────

  "BPC-157": {
    category: "Recovery & Healing",
    desc: "A pentadecapeptide (15 amino acids) isolated from human gastric juice. Studied extensively in animal models for tendon, ligament, muscle, gut, and nerve repair. Not FDA-approved.",
    timing: "Evening (8–9 PM) to align with overnight tissue repair. Can also be taken morning or near training. Twice-daily split dosing (AM + PM) is common at higher tiers.",
    administration: "Subcutaneous (SubQ) injection into abdominal fat, or locally near the injury site. Rotate injection sites daily.",
    defaultVial: 5,
    schedule: "Daily",
    typicalCycle: 8,
    color: "#a855f7",
    reconstitution: "Add bacteriostatic water slowly along the inside glass wall of the vial. Never spray directly on the powder. Swirl very gently — never shake. Solution must be perfectly clear before use. Store in refrigerator (2–8°C) after reconstitution. Discard after 28 days.",
    doses: {
      low:  { mcg: 250, label: "Maintenance / Mild Support", riskLevel: "standard", risk: "Very well-tolerated. Minimal side effects expected. Good starting point for first-time users.", source: "Common wellness clinic starting dose" },
      med:  { mcg: 500, label: "Standard Healing Protocol", riskLevel: "standard", risk: "Well-tolerated. Mild injection-site redness possible. Most commonly prescribed dose in clinical settings.", source: "Standard wellness clinic protocol" },
      high: { mcg: 750, label: "Acute Injury / Aggressive", riskLevel: "elevated", risk: "Increased injection-site reactions. Some report mild nausea or dizziness. Split into 2 daily doses recommended. Monitor closely for 2 weeks.", source: "Upper range used for acute injury protocols" }
    }
  },

  "TB-500": {
    category: "Recovery & Healing",
    desc: "A synthetic fragment of Thymosin Beta-4 (Tβ4). Acts systemically to reduce inflammation, promote angiogenesis, and accelerate tissue repair. Often stacked with BPC-157 for synergistic recovery. Not FDA-approved.",
    timing: "Evening or post-workout. Injection site location is less critical than BPC-157 because TB-500 acts systemically.",
    administration: "Subcutaneous injection. Abdomen or upper arm. Since it works systemically, injection proximity to injury is not necessary.",
    defaultVial: 5,
    schedule: "2x per week",
    typicalCycle: 6,
    color: "#6366f1",
    reconstitution: "Standard reconstitution with bacteriostatic water. Aim water along the glass wall. Swirl gently. Store refrigerated. Use within 28 days.",
    doses: {
      low:  { mcg: 2000, label: "Maintenance Phase (post-loading)", riskLevel: "standard", risk: "Well-tolerated at this dose. Suitable for ongoing maintenance after initial loading.", source: "Standard maintenance protocol" },
      med:  { mcg: 5000, label: "Loading Phase — Standard", riskLevel: "standard", risk: "Mild lethargy or brief head rush possible in first few injections. Generally well-tolerated.", source: "Common loading phase dose (2x/week)" },
      high: { mcg: 7500, label: "Aggressive Loading", riskLevel: "elevated", risk: "Increased lethargy and possible headaches. Not recommended without prior experience at lower doses. Reduce if side effects persist.", source: "Upper loading range — advanced users only" }
    }
  },

  // ───────────────────────────────────────────────────────────
  // FAT LOSS & METABOLIC
  // ───────────────────────────────────────────────────────────

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
    doses: {
      low:  { mcg: 2500, label: "Starting Titration (Weeks 1–4)", riskLevel: "standard", risk: "Nausea is common in first 1–2 weeks — this is normal and expected. Eat slowly, stay well-hydrated, avoid large fatty meals.", source: "FDA-approved starting dose (Mounjaro/Zepbound)" },
      med:  { mcg: 5000, label: "Standard Maintenance (Weeks 5–8)", riskLevel: "elevated", risk: "GI side effects (nausea, constipation) may reappear at titration. Stay at this dose 4+ weeks before increasing.", source: "FDA titration step 2" },
      high: { mcg: 10000, label: "Advanced Dose (Weeks 12+)", riskLevel: "high", risk: "Significant nausea and vomiting risk. Should only be reached after gradual titration from 2.5mg over 12+ weeks. Clinical supervision required.", source: "FDA titration — only after tolerance established" }
    }
  },

  "Semaglutide": {
    category: "Fat Loss & Metabolic",
    desc: "A GLP-1 receptor agonist. FDA-approved as Ozempic (T2D, up to 2mg/week) and Wegovy (weight management, up to 2.4mg/week). Suppresses appetite by slowing gastric emptying and acting on brain satiety centers.",
    timing: "Same day each week. Time of day is flexible — pick a consistent schedule. Can be taken with or without food.",
    administration: "Subcutaneous injection. Abdomen, thigh, or upper arm. Rotate injection sites weekly.",
    defaultVial: 5,
    schedule: "Weekly",
    typicalCycle: 16,
    color: "#f43f5e",
    reconstitution: "If using lyophilized powder: reconstitute with 2ml bacteriostatic water along the glass wall. Swirl gently. Refrigerate after mixing.",
    doses: {
      low:  { mcg: 250, label: "Starting Titration (Weeks 1–4)", riskLevel: "standard", risk: "Mild nausea expected. Eat smaller meals. Stay hydrated. This is the standard medical starting dose.", source: "FDA-approved Wegovy starting dose (0.25mg)" },
      med:  { mcg: 500, label: "Titration Step 2 (Weeks 5–8)", riskLevel: "standard", risk: "GI effects may increase temporarily. If persistent, stay at this dose an extra 4 weeks before escalating.", source: "FDA Wegovy dose escalation (0.5mg)" },
      high: { mcg: 1000, label: "Mid-Titration (Weeks 9–12)", riskLevel: "elevated", risk: "Noticeable appetite suppression. Risk of rapid weight loss if caloric intake drops too low. Ensure adequate protein intake (1g/lb). Monitor regularly.", source: "FDA Wegovy dose escalation (1.0mg)" }
    }
  },

  "AOD-9604": {
    category: "Fat Loss & Metabolic",
    desc: "A modified fragment of human growth hormone (amino acids 177-191). Stimulates lipolysis (fat breakdown) without the growth-promoting or diabetogenic effects of full HGH. Originally researched for obesity treatment. Not FDA-approved.",
    timing: "Morning on an empty stomach, or before exercise. Avoid eating for 30 minutes after injection.",
    administration: "Subcutaneous injection into abdominal fat. Rotate injection sites.",
    defaultVial: 5,
    schedule: "Daily",
    typicalCycle: 12,
    color: "#f97316",
    reconstitution: "Standard reconstitution with bacteriostatic water. Store refrigerated. Use within 28 days.",
    doses: {
      low:  { mcg: 250, label: "Starting / Maintenance", riskLevel: "standard", risk: "Very well-tolerated. Minimal side effects reported at this dose.", source: "Conservative starting protocol" },
      med:  { mcg: 300, label: "Standard Fat Loss", riskLevel: "standard", risk: "Standard effective dose. Some report mild headaches in the first week. Stay well-hydrated.", source: "Standard clinical fat loss protocol" },
      high: { mcg: 500, label: "Aggressive Protocol", riskLevel: "elevated", risk: "Higher dose may not proportionally increase fat loss. Risk of headaches and injection site irritation increases.", source: "Upper range — advanced users" }
    }
  },

  // ───────────────────────────────────────────────────────────
  // GROWTH HORMONE SECRETION
  // ───────────────────────────────────────────────────────────

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
    doses: {
      low:  { mcg: 100, label: "Introductory / Sleep-Focused", riskLevel: "standard", risk: "Very well-tolerated. Vivid dreams are common and expected. Mild tingling in fingertips possible.", source: "Standard beginner protocol (100mcg each)" },
      med:  { mcg: 200, label: "Standard Body Recomp", riskLevel: "standard", risk: "Mild water retention and occasional hand/wrist tingling possible. Generally well-tolerated.", source: "Standard clinical protocol (200mcg each)" },
      high: { mcg: 300, label: "Aggressive GH Optimization", riskLevel: "elevated", risk: "Water retention, joint stiffness, and carpal tunnel-like symptoms possible. Reduce dose if numbness persists. Monitor IGF-1 levels.", source: "Upper clinical range (300mcg each)" }
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
    color: "#0ea5e9",
    reconstitution: "Standard reconstitution. Store refrigerated.",
    doses: {
      low:  { mcg: 100, label: "Anti-Aging / Sleep", riskLevel: "standard", risk: "Very well tolerated. Often combined with CJC-1295.", source: "Conservative starting dose" },
      med:  { mcg: 200, label: "Standard Optimization", riskLevel: "standard", risk: "Standard dose for body recomp and recovery. Mild tingling possible.", source: "Standard clinical protocol" },
      high: { mcg: 300, label: "Aggressive Hypertrophy", riskLevel: "elevated", risk: "Higher risk of water retention. Usually split into 2-3 injections per day rather than taken all at once.", source: "Upper limit single dose" }
    }
  },

  "MK-677 (Ibutamoren)": {
    category: "Growth Hormone Secretion",
    desc: "An oral GH secretagogue (not a peptide, but commonly grouped with them). Stimulates ghrelin receptors to increase growth hormone and IGF-1. One of the few orally bioavailable GH boosters. Not FDA-approved.",
    timing: "Bedtime to align with natural GH pulse. Can cause increased appetite — taking at night minimizes this impact. Some users take in the morning if hunger management is not an issue.",
    administration: "Oral (capsule or liquid). No injection required.",
    defaultVial: 0,
    schedule: "Daily",
    typicalCycle: 12,
    color: "#8b5cf6",
    reconstitution: "N/A — oral compound. Store in a cool, dry place away from direct sunlight.",
    doses: {
      low:  { mcg: 10000, label: "Starting / Anti-Aging (10mg)", riskLevel: "standard", risk: "Increased appetite and mild water retention expected. Sleep quality often improves dramatically.", source: "Standard starting dose" },
      med:  { mcg: 20000, label: "Standard GH Boost (20mg)", riskLevel: "elevated", risk: "Significant appetite increase. Water retention and mild lethargy possible. May elevate fasting blood glucose — monitor if diabetic/pre-diabetic.", source: "Standard bodybuilding protocol" },
      high: { mcg: 25000, label: "Aggressive (25mg)", riskLevel: "high", risk: "Strong appetite increase. Elevated blood glucose risk. Joint stiffness and water retention. Monitor HbA1c and fasting glucose regularly. Not recommended for diabetics.", source: "Upper research range" }
    }
  },

  "Sermorelin": {
    category: "Growth Hormone Secretion",
    desc: "A bioidentical GHRH analog (first 29 amino acids of GHRH). Stimulates the pituitary to release growth hormone naturally. One of the most studied and well-tolerated GH peptides. Previously FDA-approved (Geref) for GH deficiency diagnosis.",
    timing: "Bedtime on an empty stomach. Same timing principles as CJC-1295/Ipamorelin.",
    administration: "Subcutaneous injection into abdominal fat.",
    defaultVial: 5,
    schedule: "Daily (5 days on / 2 off)",
    typicalCycle: 12,
    color: "#06b6d4",
    reconstitution: "Standard reconstitution with bacteriostatic water. Store refrigerated.",
    doses: {
      low:  { mcg: 100, label: "Anti-Aging Starter", riskLevel: "standard", risk: "Very well-tolerated. Improved sleep quality is the most common early benefit.", source: "Conservative anti-aging dose" },
      med:  { mcg: 200, label: "Standard Optimization", riskLevel: "standard", risk: "Mild injection-site redness possible. Some report vivid dreams.", source: "Standard clinical protocol" },
      high: { mcg: 300, label: "Aggressive GH Support", riskLevel: "elevated", risk: "Mild water retention and tingling possible. Generally well-tolerated but diminishing returns beyond 300mcg.", source: "Upper range clinical dose" }
    }
  },

  "Tesamorelin": {
    category: "Growth Hormone Secretion",
    desc: "A GHRH analog FDA-approved as Egrifta for reducing visceral adipose tissue (belly fat) in HIV-associated lipodystrophy. Also used off-label for body composition optimization. Stimulates natural GH release.",
    timing: "Bedtime on an empty stomach or morning before food.",
    administration: "Subcutaneous injection into abdomen.",
    defaultVial: 2,
    schedule: "Daily",
    typicalCycle: 12,
    color: "#0d9488",
    reconstitution: "Reconstitute with provided diluent or bacteriostatic water. Use within 7 days of reconstitution.",
    doses: {
      low:  { mcg: 1000, label: "Starting / Conservative", riskLevel: "standard", risk: "Well-tolerated at starting dose. Mild injection-site reactions possible.", source: "Conservative starting protocol" },
      med:  { mcg: 2000, label: "Standard (FDA-Approved)", riskLevel: "standard", risk: "Standard FDA-approved dose. Injection-site reactions (redness, itching) are common but mild. Joint pain possible.", source: "FDA-approved dose (Egrifta)" },
      high: { mcg: 3000, label: "Aggressive Recomp", riskLevel: "elevated", risk: "Higher risk of joint pain, water retention, and injection-site reactions. Not FDA-studied at this dose.", source: "Off-label upper range" }
    }
  },

  "Hexarelin": {
    category: "Growth Hormone Secretion",
    desc: "A potent GH secretagogue (GHRP family). Produces one of the strongest acute GH releases among secretagogues but also raises cortisol and prolactin more than Ipamorelin. Short-cycle use recommended. Not FDA-approved.",
    timing: "Bedtime or pre-workout on an empty stomach.",
    administration: "Subcutaneous injection.",
    defaultVial: 5,
    schedule: "3x daily (for short cycles)",
    typicalCycle: 4,
    color: "#7c3aed",
    reconstitution: "Standard reconstitution. Store refrigerated. Sensitive to heat degradation.",
    doses: {
      low:  { mcg: 100, label: "Single Pulse", riskLevel: "standard", risk: "Well-tolerated for single doses. Mild hunger increase expected.", source: "Standard single-dose protocol" },
      med:  { mcg: 200, label: "Standard Protocol", riskLevel: "elevated", risk: "Strong GH pulse. Elevated cortisol and prolactin possible. Keep cycles short (4–8 weeks max). Monitor for hunger spikes.", source: "Standard clinical dose" },
      high: { mcg: 300, label: "Maximum Acute GH", riskLevel: "high", risk: "Very strong GH release but also significantly raises cortisol and prolactin. Only use short cycles (2–4 weeks). Desensitization occurs rapidly at this dose. Not recommended for prolonged use.", source: "Upper research ceiling" }
    }
  },

  // ───────────────────────────────────────────────────────────
  // SKIN, HAIR & AESTHETICS
  // ───────────────────────────────────────────────────────────

  "GHK-Cu": {
    category: "Skin, Hair & Aesthetics",
    desc: "Copper tripeptide-1. Promotes collagen synthesis, skin elasticity, hair growth, and dampens systemic inflammation. Not FDA-approved.",
    timing: "Morning or Evening. Time of day is not critical.",
    administration: "Subcutaneous injection into abdominal fat or thigh. Rotate sites frequently as GHK-Cu can cause localized injection site pain/redness.",
    defaultVial: 50,
    schedule: "Daily",
    typicalCycle: 8,
    color: "#3b82f6",
    reconstitution: "Add bacteriostatic water carefully. The solution will turn bright blue. Store refrigerated. If experiencing injection site pain, dilute with more water or inject deeper SubQ.",
    doses: {
      low:  { mcg: 1000, label: "Starting Dose (1mg)", riskLevel: "standard", risk: "Well tolerated. Lowest risk of copper accumulation or injection site pain.", source: "Conservative research protocol" },
      med:  { mcg: 2000, label: "Standard Dose (2mg)", riskLevel: "standard", risk: "Standard effective dose for skin/healing. Monitor for injection site irritation.", source: "Standard wellness protocol" },
      high: { mcg: 3000, label: "Aggressive Healing (3mg+)", riskLevel: "elevated", risk: "Higher risk of localized pain and theoretical copper toxicity if not cycled properly. Do not exceed 8 weeks.", source: "Advanced targeted healing protocol" }
    }
  },

  "GLOW Blend": {
    category: "Skin, Hair & Aesthetics",
    desc: "A compounded blend typically containing GHK-Cu, BPC-157, and sometimes TB-500. Designed for skin elasticity, hair growth, and overall tissue rejuvenation. Not FDA-approved.",
    timing: "Morning or Evening. Consistent daily dosing.",
    administration: "Subcutaneous injection. Rotate sites as the GHK-Cu component can cause localized irritation.",
    defaultVial: 50,
    schedule: "Daily",
    typicalCycle: 8,
    color: "#f59e0b",
    reconstitution: "Standard reconstitution. Solution may be blue due to GHK-Cu. If injection stings, dilute with additional bacteriostatic water.",
    doses: {
      low:  { mcg: 500, label: "Starter Dose", riskLevel: "standard", risk: "Lowest risk of injection site pain.", source: "Introductory blend dose" },
      med:  { mcg: 1000, label: "Standard Dose", riskLevel: "standard", risk: "Monitor injection sites for redness/swelling due to copper content.", source: "Standard clinical blend dose" },
      high: { mcg: 2000, label: "Aggressive Protocol", riskLevel: "elevated", risk: "High risk of localized pain. Consider splitting into two daily injections.", source: "Advanced blend dosing" }
    }
  },

  "Melanotan II": {
    category: "Skin, Hair & Aesthetics",
    desc: "A synthetic analog of α-melanocyte-stimulating hormone (α-MSH). Induces skin tanning without UV exposure. Also has libido-enhancing effects. Carries significant side-effect risks including nausea, mole darkening, and facial flushing. Not FDA-approved.",
    timing: "Evening before bed (nausea is a common side effect). Some users take before UV exposure for enhanced tanning response.",
    administration: "Subcutaneous injection. Start with very low doses due to nausea risk.",
    defaultVial: 10,
    schedule: "Loading: daily for 7–10 days, then maintenance 1–2x/week",
    typicalCycle: 4,
    color: "#d97706",
    reconstitution: "Standard reconstitution with bacteriostatic water. Store refrigerated away from light.",
    doses: {
      low:  { mcg: 100, label: "Test Dose", riskLevel: "elevated", risk: "Even at low doses, nausea, facial flushing, and appetite suppression are common. Test tolerance before increasing.", source: "Threshold test dose" },
      med:  { mcg: 250, label: "Standard Loading", riskLevel: "elevated", risk: "Nausea is very common, especially in the first few doses. Anti-nausea medication may be helpful. Watch for new or darkening moles — report to a dermatologist immediately.", source: "Standard loading protocol" },
      high: { mcg: 500, label: "Aggressive Loading", riskLevel: "high", risk: "SIGNIFICANT nausea, vomiting, and facial flushing. Mole darkening/proliferation risk. Potential blood pressure changes. Requires close monitoring. Dermatologist skin check recommended before starting.", source: "Upper range — experienced users only" }
    }
  },

  // ───────────────────────────────────────────────────────────
  // COGNITION & NOOTROPICS
  // ───────────────────────────────────────────────────────────

  "Semax": {
    category: "Cognition & Nootropics",
    desc: "Synthetic peptide derived from ACTH. Modulates BDNF and supports cognitive enhancement, focus, and neuroprotection. Not FDA-approved.",
    timing: "Morning or early afternoon. AVOID evening use as it can cause insomnia due to its stimulant-like properties.",
    administration: "Subcutaneous injection (though intranasal is also popular).",
    defaultVial: 30,
    schedule: "Daily (or 5 days on / 2 off)",
    typicalCycle: 4,
    color: "#eab308",
    reconstitution: "Standard reconstitution. Store refrigerated. Degrades quickly if exposed to heat or vigorous shaking.",
    doses: {
      low:  { mcg: 150, label: "Threshold / Subtle Focus", riskLevel: "standard", risk: "Very low risk. Good starting dose to test sensitivity.", source: "Threshold cognitive dose" },
      med:  { mcg: 300, label: "Standard Nootropic Dose", riskLevel: "standard", risk: "Clean focus and energy. Can cause mild anxiety in sensitive individuals.", source: "Standard cognitive protocol" },
      high: { mcg: 600, label: "Deep Work / High Stress", riskLevel: "elevated", risk: "Stimulant-like effects. Higher risk of anxiety, restlessness, and insomnia if taken late.", source: "Advanced acute focus protocol" }
    }
  },

  "Dihexa": {
    category: "Cognition & Nootropics",
    desc: "An oligopeptide derived from Angiotensin IV. Potent nootropic that enhances BDNF-driven synaptogenesis (new neural connections). Research shows it is 7 orders of magnitude more potent than BDNF itself in some assays. Very limited human data. Not FDA-approved.",
    timing: "Morning. Very potent — start with lowest dose.",
    administration: "Subcutaneous injection or oral (sublingual capsules).",
    defaultVial: 10,
    schedule: "Daily (short cycles only)",
    typicalCycle: 4,
    color: "#a3e635",
    reconstitution: "Standard reconstitution if injectable. Oral capsules require no preparation.",
    doses: {
      low:  { mcg: 10, label: "Threshold / Test Dose (10mcg)", riskLevel: "elevated", risk: "Very limited human safety data. Start here and monitor for any adverse effects before increasing. Headaches possible.", source: "Threshold research dose" },
      med:  { mcg: 20, label: "Standard Cognitive (20mcg)", riskLevel: "elevated", risk: "Improved focus and memory reported. Headaches and mild overstimulation possible. Keep cycles very short (2–4 weeks).", source: "Common research-community dose" },
      high: { mcg: 50, label: "Aggressive (50mcg)", riskLevel: "high", risk: "Very limited safety data at this dose. Theoretical concerns about uncontrolled synaptogenesis. Short cycles only (2 weeks max). Not recommended without physician supervision.", source: "Upper research community range" }
    }
  },

  "PE-22-28": {
    category: "Cognition & Nootropics",
    desc: "A peptide fragment that modulates neurogenesis (brain cell growth). Studied for depression, cognitive enhancement, and neuroprotection. Very limited human data. Derived from spadin research. Not FDA-approved.",
    timing: "Morning or early afternoon.",
    administration: "Subcutaneous injection or intranasal.",
    defaultVial: 10,
    schedule: "Daily",
    typicalCycle: 4,
    color: "#84cc16",
    reconstitution: "Standard reconstitution. Store refrigerated.",
    doses: {
      low:  { mcg: 50, label: "Starter / Test", riskLevel: "elevated", risk: "Very limited human data. Start low and assess tolerance.", source: "Threshold research dose" },
      med:  { mcg: 100, label: "Standard Protocol", riskLevel: "elevated", risk: "Antidepressant-like effects reported. Monitor mood changes closely.", source: "Common research dose" },
      high: { mcg: 200, label: "Aggressive", riskLevel: "high", risk: "Insufficient safety data. Use extreme caution. Short cycles only.", source: "Upper research limit" }
    }
  },

  // ───────────────────────────────────────────────────────────
  // ANXIETY & MOOD
  // ───────────────────────────────────────────────────────────

  "Selank": {
    category: "Anxiety & Mood",
    desc: "Anxiolytic peptide closely related to Tuftsin. Promotes relaxation, reduces anxiety, and stabilizes mood without the sedative effects of traditional anxiolytics. Not FDA-approved.",
    timing: "Morning or evening. Does not typically cause drowsiness, but calms the nervous system.",
    administration: "Subcutaneous injection. Rotate sites.",
    defaultVial: 10,
    schedule: "Daily or As Needed",
    typicalCycle: 4,
    color: "#22c55e",
    reconstitution: "Standard reconstitution with bacteriostatic water. Keep refrigerated.",
    doses: {
      low:  { mcg: 250, label: "Mild Anxiety / Baseline", riskLevel: "standard", risk: "Very well tolerated. No sedative effects.", source: "Standard starting protocol" },
      med:  { mcg: 500, label: "Standard Anxiolytic Dose", riskLevel: "standard", risk: "Effective for managing daily stress. Some users split this into 250mcg twice daily.", source: "Common clinical recommendation" },
      high: { mcg: 1000, label: "Acute Stress Response", riskLevel: "standard", risk: "High dose. Diminishing returns reported beyond this level. No significant toxicity observed, but unnecessary for daily use.", source: "Upper ceiling limit" }
    }
  },

  // ───────────────────────────────────────────────────────────
  // SLEEP & RECOVERY
  // ───────────────────────────────────────────────────────────

  "DSIP": {
    category: "Sleep & Recovery",
    desc: "Delta Sleep-Inducing Peptide. A naturally occurring neuropeptide that promotes delta-wave (deep) sleep. Also reported to modulate stress response and normalize circadian rhythm. Not FDA-approved.",
    timing: "30–60 minutes before bedtime. Consistent nightly use recommended during the cycle.",
    administration: "Subcutaneous injection or intranasal.",
    defaultVial: 5,
    schedule: "Daily (evening)",
    typicalCycle: 4,
    color: "#6d28d9",
    reconstitution: "Standard reconstitution with bacteriostatic water. Store refrigerated.",
    doses: {
      low:  { mcg: 100, label: "Gentle Sleep Support", riskLevel: "standard", risk: "Very well-tolerated. Subtle improvement in sleep quality and depth.", source: "Conservative starting dose" },
      med:  { mcg: 200, label: "Standard Sleep Protocol", riskLevel: "standard", risk: "Improved deep sleep onset. Some users report morning grogginess during the first 2–3 days — this typically passes.", source: "Standard clinical sleep dose" },
      high: { mcg: 400, label: "Aggressive Sleep Recovery", riskLevel: "elevated", risk: "Potential for excessive drowsiness. Morning grogginess likely during initial use. Reduce if daytime fatigue persists beyond 1 week.", source: "Upper therapeutic range" }
    }
  },

  // ───────────────────────────────────────────────────────────
  // LONGEVITY & ANTI-AGING
  // ───────────────────────────────────────────────────────────

  "Epithalon (Epitalon)": {
    category: "Longevity & Anti-Aging",
    desc: "A synthetic tetrapeptide (Ala-Glu-Asp-Gly) based on Epithalamin, a natural extract from the pineal gland. Studied primarily for telomerase activation and telomere elongation. May support circadian rhythm regulation and melatonin production. Not FDA-approved.",
    timing: "Evening to align with melatonin cycle. Some protocols use morning dosing.",
    administration: "Subcutaneous injection.",
    defaultVial: 10,
    schedule: "Daily for 10–20 days, then cycle off 4–6 months",
    typicalCycle: 2,
    color: "#be185d",
    reconstitution: "Standard reconstitution. Store refrigerated.",
    doses: {
      low:  { mcg: 3000, label: "Conservative Cycle (3mg)", riskLevel: "standard", risk: "Well-tolerated. Minimal side effects expected. Most commonly reported benefit is improved sleep quality.", source: "Conservative anti-aging dose" },
      med:  { mcg: 5000, label: "Standard Anti-Aging (5mg)", riskLevel: "standard", risk: "Standard dose used in most protocols. Improved sleep and energy commonly reported within 5–7 days.", source: "Standard 10-day protocol" },
      high: { mcg: 10000, label: "Aggressive Telomere (10mg)", riskLevel: "elevated", risk: "Limited data on higher doses. Theoretical benefit for telomere support but unclear dose-response. Stay within 10–20 day cycle.", source: "Upper research range" }
    }
  },

  "NAD+": {
    category: "Longevity & Anti-Aging",
    desc: "Nicotinamide adenine dinucleotide. A coenzyme critical for cellular energy production, DNA repair, and sirtuin activation. Declines with age. Injectable NAD+ bypasses gut degradation for direct cellular uptake. Not FDA-approved for anti-aging.",
    timing: "Morning or early afternoon. Can cause alertness — avoid evening dosing.",
    administration: "Subcutaneous or intramuscular injection. IV infusions available but require clinical setting.",
    defaultVial: 100,
    schedule: "2–3x per week",
    typicalCycle: 8,
    color: "#059669",
    reconstitution: "Reconstitute with bacteriostatic water. Store refrigerated. Some formulations are pre-mixed.",
    doses: {
      low:  { mcg: 50000, label: "Maintenance (50mg)", riskLevel: "standard", risk: "Well-tolerated. Mild warmth or flushing at injection site possible.", source: "Standard SubQ maintenance dose" },
      med:  { mcg: 100000, label: "Standard Anti-Aging (100mg)", riskLevel: "standard", risk: "Injection-site discomfort common (stinging). Mild nausea possible. Some users dilute with extra bacteriostatic water.", source: "Standard clinical protocol" },
      high: { mcg: 200000, label: "Aggressive Cellular (200mg)", riskLevel: "elevated", risk: "Increased injection-site pain and warmth. Split into multiple injection sites recommended. Nausea possible.", source: "Upper SubQ range" }
    }
  },

  // ───────────────────────────────────────────────────────────
  // IMMUNE SYSTEM
  // ───────────────────────────────────────────────────────────

  "Thymosin Alpha-1": {
    category: "Immune System",
    desc: "A naturally occurring thymic peptide crucial for immune system modulation. Enhances T-cell function, dendritic cell maturation, and antibody response. FDA-approved in over 30 countries (as Zadaxin) for hepatitis B/C. Not FDA-approved in the US.",
    timing: "Morning or evening. Consistent timing preferred.",
    administration: "Subcutaneous injection.",
    defaultVial: 5,
    schedule: "2–3x per week",
    typicalCycle: 8,
    color: "#10b981",
    reconstitution: "Standard reconstitution. Store refrigerated.",
    doses: {
      low:  { mcg: 900, label: "Immune Maintenance (0.9mg)", riskLevel: "standard", risk: "Very well-tolerated. One of the safest peptides in clinical use.", source: "Conservative immune protocol" },
      med:  { mcg: 1600, label: "Standard Immune (1.6mg)", riskLevel: "standard", risk: "Standard clinical dose. Mild injection-site reactions possible. Generally excellent safety profile.", source: "Standard clinical dose (Zadaxin equivalent)" },
      high: { mcg: 3200, label: "Acute Immune Challenge", riskLevel: "elevated", risk: "Higher dose for acute illness support. Limited data on long-term use at this level.", source: "Acute immune support range" }
    }
  },

  "LL-37": {
    category: "Immune System",
    desc: "A human cathelicidin antimicrobial peptide. Part of the innate immune defense. Exhibits broad-spectrum antimicrobial, antibiofilm, and immune-modulating activity. Used off-label for chronic infections, Lyme disease, and biofilm disruption. Not FDA-approved.",
    timing: "Morning. Can be taken with other peptides.",
    administration: "Subcutaneous injection. Can also be used topically for wound healing.",
    defaultVial: 5,
    schedule: "Daily (short cycles)",
    typicalCycle: 4,
    color: "#16a34a",
    reconstitution: "Standard reconstitution with bacteriostatic water. Store refrigerated. Handle carefully — sensitive to degradation.",
    doses: {
      low:  { mcg: 50, label: "Immune Support (50mcg)", riskLevel: "standard", risk: "Well-tolerated at low doses. Mild injection-site irritation possible.", source: "Conservative immune protocol" },
      med:  { mcg: 100, label: "Standard Antimicrobial (100mcg)", riskLevel: "elevated", risk: "Effective antimicrobial dose. Herxheimer-like reaction possible if targeting biofilm infections (flu-like symptoms as bacteria die off).", source: "Standard antimicrobial protocol" },
      high: { mcg: 200, label: "Aggressive Biofilm (200mcg)", riskLevel: "high", risk: "Strong antimicrobial activity. Significant Herxheimer reaction risk. Start at low dose and titrate up over 1–2 weeks. Physician supervision recommended for high-dose protocols.", source: "Advanced biofilm disruption" }
    }
  },

  // ───────────────────────────────────────────────────────────
  // GUT & INFLAMMATION
  // ───────────────────────────────────────────────────────────

  "KPV": {
    category: "Gut & Inflammation",
    desc: "A tripeptide (Lys-Pro-Val) derived from α-MSH. Potent anti-inflammatory with particular targeting for gut inflammation. Studied for IBD, colitis, and general intestinal healing. Not FDA-approved.",
    timing: "Morning on an empty stomach, or split into AM/PM doses.",
    administration: "Subcutaneous injection. Also available as oral capsules (less studied bioavailability).",
    defaultVial: 10,
    schedule: "Daily",
    typicalCycle: 8,
    color: "#65a30d",
    reconstitution: "Standard reconstitution. Store refrigerated.",
    doses: {
      low:  { mcg: 200, label: "Mild Gut Support", riskLevel: "standard", risk: "Very well-tolerated. Minimal side effects.", source: "Conservative gut health dose" },
      med:  { mcg: 500, label: "Standard Anti-Inflammatory", riskLevel: "standard", risk: "Effective for gut inflammation. Some users report mild fatigue initially.", source: "Standard clinical protocol" },
      high: { mcg: 1000, label: "Aggressive Gut Healing", riskLevel: "elevated", risk: "Higher dose for acute inflammatory conditions. Monitor for any unusual fatigue or immune suppression.", source: "Upper clinical range" }
    }
  },

  // ───────────────────────────────────────────────────────────
  // METABOLIC & EXERCISE PERFORMANCE
  // ───────────────────────────────────────────────────────────

  "MOTS-c": {
    category: "Metabolic & Exercise",
    desc: "A mitochondrial-derived peptide that regulates metabolic homeostasis and enhances exercise capacity. Activates AMPK pathway (the body's master metabolic switch). Improves insulin sensitivity and glucose uptake. Not FDA-approved.",
    timing: "Morning or pre-workout (30–60 mins before exercise).",
    administration: "Subcutaneous injection.",
    defaultVial: 5,
    schedule: "3x per week",
    typicalCycle: 8,
    color: "#ea580c",
    reconstitution: "Standard reconstitution. Store refrigerated.",
    doses: {
      low:  { mcg: 5000, label: "Metabolic Support (5mg)", riskLevel: "standard", risk: "Well-tolerated. Improved exercise tolerance commonly reported within 1–2 weeks.", source: "Conservative metabolic dose" },
      med:  { mcg: 10000, label: "Standard Performance (10mg)", riskLevel: "standard", risk: "Standard dose for metabolic optimization. Mild injection-site reactions possible. Enhanced exercise recovery.", source: "Standard clinical protocol" },
      high: { mcg: 15000, label: "Aggressive Performance (15mg)", riskLevel: "elevated", risk: "Limited data on higher doses. Theoretical benefit for advanced athletes. Monitor for any GI discomfort.", source: "Upper research range" }
    }
  },

  // ───────────────────────────────────────────────────────────
  // SEXUAL HEALTH
  // ───────────────────────────────────────────────────────────

  "PT-141 (Bremelanotide)": {
    category: "Sexual Health",
    desc: "A synthetic melanocortin receptor agonist. FDA-approved as Vyleesi for hypoactive sexual desire disorder (HSDD) in premenopausal women. Works centrally in the brain (not vascular like PDE5 inhibitors). Used off-label for both male and female sexual dysfunction.",
    timing: "45 minutes before anticipated sexual activity. Do NOT use more than once in 24 hours or more than 8 times per month.",
    administration: "Subcutaneous injection into abdomen or thigh.",
    defaultVial: 10,
    schedule: "As Needed (max 8x/month)",
    typicalCycle: 0,
    color: "#e11d48",
    reconstitution: "Standard reconstitution. Store refrigerated.",
    doses: {
      low:  { mcg: 500, label: "Mild / Sensitive Users", riskLevel: "standard", risk: "Mild nausea is the most common side effect. Facial flushing possible. Test tolerance at this dose first.", source: "Sub-clinical starting dose" },
      med:  { mcg: 1750, label: "Standard (FDA Dose)", riskLevel: "standard", risk: "Nausea occurs in ~40% of users (usually mild and temporary). Facial flushing, headache possible. Do not combine with high-fat meals.", source: "FDA-approved dose (Vyleesi)" },
      high: { mcg: 2500, label: "Above FDA Dose", riskLevel: "high", risk: "Increased nausea and vomiting risk. Blood pressure elevation possible. Should not exceed FDA-recommended dose without physician guidance. Max 8 doses per month.", source: "Above FDA range — physician supervision required" }
    }
  },

};

// ═══════════════════════════════════════════════════════════════
// CATEGORY HELPERS
// ═══════════════════════════════════════════════════════════════

export const CATEGORIES = [
  "All",
  "Recovery & Healing",
  "Fat Loss & Metabolic",
  "Growth Hormone Secretion",
  "Skin, Hair & Aesthetics",
  "Cognition & Nootropics",
  "Anxiety & Mood",
  "Sleep & Recovery",
  "Longevity & Anti-Aging",
  "Immune System",
  "Gut & Inflammation",
  "Metabolic & Exercise",
  "Sexual Health",
];

export function getPeptidesByCategory(category) {
  if (category === "All") return Object.entries(peptidesDB);
  return Object.entries(peptidesDB).filter(([_, data]) => data.category === category);
}

export function getRiskColor(riskLevel) {
  switch (riskLevel) {
    case 'standard': return '#22c55e';
    case 'elevated': return '#f59e0b';
    case 'high': return '#ef4444';
    default: return '#6b7280';
  }
}

export function getRiskLabel(riskLevel) {
  switch (riskLevel) {
    case 'standard': return 'Standard';
    case 'elevated': return 'Elevated';
    case 'high': return 'High Risk';
    default: return 'Unknown';
  }
}

// ═══════════════════════════════════════════════════════════════
// CALCULATOR MATH
// ═══════════════════════════════════════════════════════════════

export function calcConcentration(vialMg, waterMl) {
  if (!vialMg || !waterMl || waterMl <= 0) return 0;
  return (vialMg * 1000) / waterMl;
}

export function calcDrawVolume(targetMcg, concentrationMcgPerMl) {
  if (!concentrationMcgPerMl || concentrationMcgPerMl <= 0) return 0;
  return targetMcg / concentrationMcgPerMl;
}

export function calcSyringeUnits(drawVolumeMl) {
  return drawVolumeMl * 100;
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

// ═══════════════════════════════════════════════════════════════
// SUGGESTED PROTOCOL DATA — Evidence-Based Timing
// ═══════════════════════════════════════════════════════════════

export const suggestedProtocols = {
  'BPC-157': {
    frequency: 'daily',
    bestTime: '21:00',
    bestTimeLabel: 'Evening (9 PM)',
    explanation: 'BPC-157 works best taken in the evening to align with overnight tissue repair cycles. Growth hormone peaks during sleep, enhancing its regenerative effects. Can also be split AM/PM for acute injuries.',
    dosePerDay: 1,
    cycleWeeks: 8,
    splitDose: true,
    splitNote: 'For acute injuries, split into 250mcg AM + 250mcg PM',
  },
  'TB-500': {
    frequency: 'everyX',
    repeatDays: 3,
    bestTime: '21:00',
    bestTimeLabel: 'Evening (9 PM)',
    explanation: 'TB-500 acts systemically and has a long active half-life (~6 days). Standard protocol is 2x per week during a 4-6 week loading phase, then reduce to maintenance. Evening dosing supports overnight recovery.',
    dosePerDay: 1,
    cycleWeeks: 6,
  },
  'Tirzepatide': {
    frequency: 'everyX',
    repeatDays: 7,
    bestTime: '09:00',
    bestTimeLabel: 'Morning (9 AM)',
    explanation: 'Once-weekly injection. Choose the same day each week. Morning injection helps manage appetite throughout the day. Start at lowest dose (2.5mg) for 4 weeks before titrating up.',
    dosePerDay: 1,
    cycleWeeks: 16,
  },
  'Semaglutide': {
    frequency: 'everyX',
    repeatDays: 7,
    bestTime: '09:00',
    bestTimeLabel: 'Morning (9 AM)',
    explanation: 'Once-weekly injection. Same day each week for consistency. Morning dosing helps with all-day appetite suppression. Start at 0.25mg for 4 weeks, then increase gradually.',
    dosePerDay: 1,
    cycleWeeks: 16,
  },
  'AOD-9604': {
    frequency: 'daily',
    bestTime: '06:00',
    bestTimeLabel: 'Morning fasted (6 AM)',
    explanation: 'AOD-9604 mimics the fat-burning fragment of growth hormone. Most effective on an empty stomach, first thing in the morning. Do not eat for 30 minutes after injection.',
    dosePerDay: 1,
    cycleWeeks: 12,
  },
  'CJC-1295 / Ipamorelin': {
    frequency: 'daily',
    bestTime: '21:00',
    bestTimeLabel: 'Before bed (9 PM)',
    explanation: 'This combination stimulates natural GH release. Best taken before bed on an empty stomach to amplify the natural GH pulse during deep sleep. Avoid eating 2 hours before and after.',
    dosePerDay: 1,
    cycleWeeks: 12,
  },
  'Ipamorelin': {
    frequency: 'daily',
    bestTime: '21:00',
    bestTimeLabel: 'Before bed (9 PM)',
    explanation: 'Ipamorelin is the most selective GHRP with minimal cortisol/prolactin increase. Best before bed on empty stomach to amplify nocturnal GH pulse. Can also split into 2-3 doses per day.',
    dosePerDay: 1,
    cycleWeeks: 12,
    splitDose: true,
    splitNote: 'Advanced: 100mcg 3x/day (morning fasted, post-workout, before bed)',
  },
  'MK-677 (Ibutamoren)': {
    frequency: 'daily',
    bestTime: '21:00',
    bestTimeLabel: 'Before bed (9 PM)',
    explanation: 'Oral GH secretagogue with 24hr half-life. Take before bed to amplify natural nocturnal GH pulse. Some prefer morning to avoid hunger spike at night. Take with or without food.',
    dosePerDay: 1,
    cycleWeeks: 12,
  },
  'Sermorelin': {
    frequency: 'daily',
    bestTime: '21:00',
    bestTimeLabel: 'Before bed (9 PM)',
    explanation: 'GHRH analog that stimulates pituitary GH release. Most effective before bed on an empty stomach. The natural GH pulse during sleep is amplified. Avoid food 90 min before.',
    dosePerDay: 1,
    cycleWeeks: 12,
  },
  'Tesamorelin': {
    frequency: 'daily',
    bestTime: '21:00',
    bestTimeLabel: 'Before bed (9 PM)',
    explanation: 'FDA-approved GHRH analog for reducing visceral fat. Best taken before bed on empty stomach. Works by restoring natural GH pulsatility during sleep.',
    dosePerDay: 1,
    cycleWeeks: 26,
  },
  'Hexarelin': {
    frequency: 'daily',
    bestTime: '21:00',
    bestTimeLabel: 'Before bed (9 PM)',
    explanation: 'Potent GHRP that strongly stimulates GH release. Best before bed on empty stomach. Note: may increase cortisol and prolactin at higher doses. Desensitization can occur after 8 weeks.',
    dosePerDay: 1,
    cycleWeeks: 8,
  },
  'GHK-Cu': {
    frequency: 'daily',
    bestTime: '09:00',
    bestTimeLabel: 'Morning (9 AM)',
    explanation: 'Copper peptide primarily for skin/hair/tissue remodeling. Can be taken any time of day. Morning dosing allows for daytime cellular repair processes. Also available topically.',
    dosePerDay: 1,
    cycleWeeks: 12,
  },
  'GLOW Blend': {
    frequency: 'daily',
    bestTime: '09:00',
    bestTimeLabel: 'Morning (9 AM)',
    explanation: 'Cosmetic peptide blend for skin rejuvenation. Morning dosing supports daytime collagen synthesis. Consistent daily use for 8-12 weeks produces best visible results.',
    dosePerDay: 1,
    cycleWeeks: 12,
  },
  'Melanotan II': {
    frequency: 'daily',
    bestTime: '18:00',
    bestTimeLabel: 'Evening (6 PM)',
    explanation: 'Start with very low dose (100mcg) to assess tolerance. Evening dosing preferred — nausea is the most common side effect, and fading occurs during sleep. Loading phase: daily for 2-3 weeks, then maintenance 2x/week.',
    dosePerDay: 1,
    cycleWeeks: 4,
  },
  'Semax': {
    frequency: 'daily',
    bestTime: '09:00',
    bestTimeLabel: 'Morning (9 AM)',
    explanation: 'Nootropic peptide administered as nasal spray. Best in the morning for cognitive enhancement throughout the day. Can take a second dose midday if needed. Do not use before bed — may interfere with sleep.',
    dosePerDay: 1,
    cycleWeeks: 4,
    splitDose: true,
    splitNote: 'Can split: 200mcg AM + 200mcg early afternoon',
  },
  'Dihexa': {
    frequency: 'daily',
    bestTime: '09:00',
    bestTimeLabel: 'Morning (9 AM)',
    explanation: 'Extremely potent nootropic (10 million times more potent than BDNF). Oral administration. Morning dosing for cognitive benefits throughout the day. Use at lowest effective dose.',
    dosePerDay: 1,
    cycleWeeks: 4,
  },
  'PE-22-28': {
    frequency: 'daily',
    bestTime: '09:00',
    bestTimeLabel: 'Morning (9 AM)',
    explanation: 'Nootropic peptide that enhances BDNF signaling. Morning dosing for daytime cognitive enhancement. Cycle 4 weeks on, 2 weeks off.',
    dosePerDay: 1,
    cycleWeeks: 4,
  },
  'Selank': {
    frequency: 'daily',
    bestTime: '09:00',
    bestTimeLabel: 'Morning (9 AM)',
    explanation: 'Anxiolytic peptide administered as nasal spray. Best in the morning for all-day anti-anxiety effect without sedation. Can split into 2-3 doses throughout the day.',
    dosePerDay: 1,
    cycleWeeks: 4,
    splitDose: true,
    splitNote: '250mcg AM + 250mcg afternoon for sustained effect',
  },
  'DSIP': {
    frequency: 'daily',
    bestTime: '21:00',
    bestTimeLabel: 'Before bed (9 PM)',
    explanation: 'Delta Sleep-Inducing Peptide — take 30-60 minutes before bed. Promotes deep delta-wave sleep. Most effective when used consistently for 2-4 weeks.',
    dosePerDay: 1,
    cycleWeeks: 4,
  },
  'Epithalon (Epitalon)': {
    frequency: 'daily',
    bestTime: '21:00',
    bestTimeLabel: 'Evening (9 PM)',
    explanation: 'Telomerase-activating peptide for longevity. Traditional protocol: 10-day cycles, 2-3 times per year. Evening dosing aligns with melatonin production, which it also supports.',
    dosePerDay: 1,
    cycleWeeks: 2,
  },
  'NAD+': {
    frequency: 'daily',
    bestTime: '09:00',
    bestTimeLabel: 'Morning (9 AM)',
    explanation: 'Cellular energy and DNA repair molecule. SubQ injection in the morning for all-day energy support. IV infusions are typically 2-4 hours. Avoid late afternoon/evening — may interfere with sleep.',
    dosePerDay: 1,
    cycleWeeks: 4,
  },
  'Thymosin Alpha-1': {
    frequency: 'everyX',
    repeatDays: 3,
    bestTime: '09:00',
    bestTimeLabel: 'Morning (9 AM)',
    explanation: 'Immune-modulating peptide. Standard protocol is 2-3x per week. Morning dosing allows immune system support throughout the day. Can use daily during acute illness.',
    dosePerDay: 1,
    cycleWeeks: 8,
  },
  'LL-37': {
    frequency: 'daily',
    bestTime: '09:00',
    bestTimeLabel: 'Morning (9 AM)',
    explanation: 'Antimicrobial peptide. Morning dosing supports immune defense throughout the day. Short cycles (2-4 weeks) recommended. Monitor for injection site reactions.',
    dosePerDay: 1,
    cycleWeeks: 4,
  },
  'KPV': {
    frequency: 'daily',
    bestTime: '09:00',
    bestTimeLabel: 'Morning (9 AM)',
    explanation: 'Anti-inflammatory tripeptide derived from alpha-MSH. Morning dosing supports daytime anti-inflammatory activity. Well-tolerated for longer cycles. Also available orally for gut inflammation.',
    dosePerDay: 1,
    cycleWeeks: 8,
  },
  'MOTS-c': {
    frequency: 'everyX',
    repeatDays: 3,
    bestTime: '09:00',
    bestTimeLabel: 'Morning fasted (9 AM)',
    explanation: 'Mitochondrial-derived peptide. Best on an empty stomach in the morning. Enhances exercise-induced metabolic benefits. Standard protocol: 3x per week. Can take daily during intensive training.',
    dosePerDay: 1,
    cycleWeeks: 8,
  },
  'PT-141 (Bremelanotide)': {
    frequency: 'everyX',
    repeatDays: 3,
    bestTime: '18:00',
    bestTimeLabel: '45 min before activity',
    explanation: 'Take 45-60 minutes before desired effect. NOT for daily use — max 8 doses per month. Common side effects include nausea and flushing. Start at lowest dose.',
    dosePerDay: 1,
    cycleWeeks: 4,
  },
};

// Helper to get suggested protocol for a peptide
export function getSuggestedProtocol(name) {
  return suggestedProtocols[name] || null;
}

