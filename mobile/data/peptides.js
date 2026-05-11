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
    },
    pharmacokinetics: {
      halfLife: "~4 hrs",
      timeToPeak: "~1 hr",
      steadyStateIn: "~2 days",
      dosesToSteadyState: "~8",
      fullClearance: "~20 hrs",
      bioavailability: "~75%",
      accumulation: "1.2x",
      metabolism: "Enzymatic proteolysis"
    },
    whatIf: {
      miss: "With a ~4 hour half-life, BPC-157 clears quickly. Missing one daily dose means tissue levels drop to near-zero within 20 hours. Resume your normal schedule — no need to double up. One missed dose has minimal impact on healing progress over a multi-week cycle.",
      double: "Doubling to ~1000mcg is within the studied safety margin for BPC-157. You may experience mild nausea or injection-site irritation. Do NOT make this a habit. Return to your regular dose on the next injection.",
      changeSchedule: "BPC-157's short half-life means it doesn't accumulate significantly. Switching from daily to every-other-day will roughly halve your average tissue exposure. If changing frequency, allow 2–3 days for levels to stabilize at the new pattern.",
      stop: "BPC-157 clears from your system within ~20 hours (5 half-lives). There is no withdrawal or rebound effect. Any healing benefits already achieved (tissue repair, angiogenesis) are retained. You can restart a cycle after a break."
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
    },
    pharmacokinetics: {
      halfLife: "~2 hrs",
      timeToPeak: "~30 min",
      steadyStateIn: "~1 week",
      dosesToSteadyState: "~4",
      fullClearance: "~10 hrs",
      bioavailability: "~80%",
      accumulation: "1.1x",
      metabolism: "Proteolytic degradation"
    },
    whatIf: {
      miss: "TB-500 acts systemically with a ~2 hour half-life but its tissue-repair effects last much longer. Missing one dose during a loading phase may slightly delay reaching optimal tissue saturation. Resume your next scheduled dose — don't double up.",
      double: "Doubling TB-500 (to ~10,000mcg) may increase lethargy and headache risk. The compound works systemically, so a single high dose won't proportionally speed healing. Stick to your loading schedule.",
      changeSchedule: "TB-500 is typically dosed 2x/week during loading, then 1x/week for maintenance. Changing frequency affects tissue accumulation. Allow 1–2 weeks to observe effects at a new schedule.",
      stop: "TB-500 clears rapidly but its tissue-repair effects persist. No withdrawal. Healing benefits from completed loading phases are retained. Maintenance dosing can be resumed anytime."
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
    },
    pharmacokinetics: {
      halfLife: "~5 days",
      timeToPeak: "8–72 hrs",
      steadyStateIn: "~5 weeks",
      dosesToSteadyState: "~5",
      fullClearance: "~25 days",
      bioavailability: "~80%",
      accumulation: "1.4x",
      metabolism: "Proteolytic cleavage, renal"
    },
    whatIf: {
      miss: "With a ~5 day half-life, missing one weekly dose means levels drop ~50% but don't disappear. If within 4 days of your missed dose, take it. If closer to your next scheduled dose, skip it. Do NOT double up — GI side effects would be severe.",
      double: "DANGEROUS. Doubling Tirzepatide dramatically increases nausea, vomiting, and potential pancreatitis risk. If accidentally doubled, skip your next scheduled dose and monitor for severe GI symptoms. Seek medical attention if vomiting persists.",
      changeSchedule: "Tirzepatide requires consistent weekly dosing. Changing your injection day is fine — just ensure at least 3 days between doses. Changing dose requires slow titration over 4+ weeks per FDA guidelines.",
      stop: "Tirzepatide takes ~25 days to fully clear (5 half-lives). Appetite suppression effects fade over 2–3 weeks. Weight regain is common if diet/exercise aren't maintained. Taper gradually if possible rather than abrupt cessation."
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
    },
    pharmacokinetics: {
      halfLife: "~7 days",
      timeToPeak: "1–3 days",
      steadyStateIn: "~5 weeks",
      dosesToSteadyState: "~5",
      fullClearance: "~35 days",
      bioavailability: "~89%",
      accumulation: "1.3x",
      metabolism: "Proteolytic degradation, renal"
    },
    whatIf: {
      miss: "With a ~7 day half-life, missing one dose still leaves significant drug in your system. Take the missed dose if within 5 days, then resume your regular schedule. If closer to the next dose, skip it. Never double up.",
      double: "DANGEROUS. Doubling semaglutide causes severe nausea, vomiting, and diarrhea. Risk of pancreatitis increases. If accidentally doubled, skip the next dose and monitor symptoms. Seek medical attention for persistent vomiting.",
      changeSchedule: "You can change your injection day — just ensure 2+ days between doses during the transition. Dose changes should follow the FDA titration schedule (4 weeks minimum per step).",
      stop: "Semaglutide takes ~35 days to clear. Appetite returns gradually over 2–4 weeks. Weight regain is likely without lifestyle changes. Consider tapering down through dose steps rather than stopping abruptly."
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
    },
    pharmacokinetics: {
      halfLife: "~30 min",
      timeToPeak: "~15 min",
      steadyStateIn: "N/A",
      dosesToSteadyState: "N/A",
      fullClearance: "~2.5 hrs",
      bioavailability: "~50%",
      accumulation: "1.0x",
      metabolism: "Rapid proteolysis"
    },
    whatIf: {
      miss: "AOD-9604 has a very short ~30 minute half-life and clears within 2.5 hours. Missing a dose has negligible impact — it doesn't accumulate. Simply resume your next scheduled dose.",
      double: "Doubling AOD-9604 is unlikely to cause significant issues due to its rapid clearance. However, it won't proportionally increase fat loss either. Headache risk increases slightly. Return to normal dosing.",
      changeSchedule: "Due to its rapid clearance, AOD-9604 must be dosed daily for effect. Reducing frequency will reduce efficacy proportionally. No adjustment period needed when changing schedule.",
      stop: "AOD-9604 clears within hours. No withdrawal or rebound effects. Any metabolic effects are transient. Can be restarted anytime without loading."
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
    },
    pharmacokinetics: {
      halfLife: "~8 days",
      timeToPeak: "~55 hrs",
      steadyStateIn: "~6 weeks",
      dosesToSteadyState: "~12",
      fullClearance: "~40 days",
      bioavailability: "~90%",
      accumulation: "3.8x",
      metabolism: "Proteolytic degradation"
    },
    whatIf: {
      miss: "CJC-1295 has a long ~8 day half-life, so one missed dose has minimal impact on accumulated levels. Resume your next scheduled dose. If mid-cycle, the long half-life means substantial drug remains in your system.",
      double: "Doubling may increase water retention, joint stiffness, and carpal tunnel-like symptoms. The long half-life means effects compound over days. Monitor for numbness/tingling and reduce next dose if symptoms appear.",
      changeSchedule: "The 5-on/2-off schedule is designed to prevent receptor desensitization. Switching to daily may cause diminishing returns. Allow 2–3 weeks for levels to stabilize at any new frequency.",
      stop: "CJC-1295 takes ~40 days to fully clear due to its long half-life. GH levels gradually return to baseline over 4–6 weeks. No withdrawal, but sleep quality improvements may fade. IGF-1 levels normalize within 6–8 weeks."
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
    },
    pharmacokinetics: {
      halfLife: "~2 hrs",
      timeToPeak: "~30 min",
      steadyStateIn: "~1 day",
      dosesToSteadyState: "~5",
      fullClearance: "~10 hrs",
      bioavailability: "~80%",
      accumulation: "1.0x",
      metabolism: "Hepatic proteolysis"
    },
    whatIf: {
      miss: "Ipamorelin has a short ~2 hour half-life. Missing one dose simply means one fewer GH pulse. No accumulation issues. Resume your next scheduled dose normally.",
      double: "Doubling Ipamorelin may cause increased water retention and stronger GH pulse but also higher cortisol. Not dangerous short-term but unnecessary. Return to normal dosing.",
      changeSchedule: "Ipamorelin is flexible — can be dosed 1–3x daily. Best results when taken on empty stomach at bedtime. Frequency changes take effect immediately due to short half-life.",
      stop: "Clears within 10 hours. No withdrawal. GH pulse patterns return to baseline within 1–2 days. Sleep benefits may diminish. Can restart anytime."
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
    },
    pharmacokinetics: {
      halfLife: "~5 hrs",
      timeToPeak: "2–4 hrs",
      steadyStateIn: "~2 weeks",
      dosesToSteadyState: "~14",
      fullClearance: "~25 hrs",
      bioavailability: "~60%",
      accumulation: "1.1x",
      metabolism: "Hepatic (CYP3A4)"
    },
    whatIf: {
      miss: "MK-677 has a ~5 hour half-life but its IGF-1 elevating effects persist for 24 hours. Missing one dose causes a temporary dip. Resume your normal schedule — no need to compensate.",
      double: "Doubling MK-677 significantly increases appetite, water retention, and blood glucose elevation. May cause lethargy and joint pain. If diabetic or pre-diabetic, monitor glucose closely. Return to normal dosing immediately.",
      changeSchedule: "MK-677 is typically taken daily. Switching to every-other-day reduces average IGF-1 elevation by ~40%. Effects on appetite and water retention also decrease. Takes ~2 weeks to stabilize at new frequency.",
      stop: "MK-677 clears within 25 hours but IGF-1 levels take 2–4 weeks to fully normalize. Appetite returns to baseline within days. Water retention resolves within 1 week. No physical withdrawal."
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
    },
    pharmacokinetics: {
      halfLife: "~12 min",
      timeToPeak: "~5 min",
      steadyStateIn: "N/A",
      dosesToSteadyState: "N/A",
      fullClearance: "~60 min",
      bioavailability: "~5%",
      accumulation: "1.0x",
      metabolism: "Rapid enzymatic degradation"
    },
    whatIf: {
      miss: "Sermorelin has a very short ~12 minute half-life. Each dose produces an acute GH pulse. Missing one dose simply means one fewer pulse. No accumulation to worry about.",
      double: "Doubling Sermorelin is generally well-tolerated but produces only marginally more GH release. Diminishing returns apply. Mild facial flushing possible. Return to normal dosing.",
      changeSchedule: "Due to ultra-short half-life, each dose is an independent GH pulse. Frequency directly correlates with total GH stimulation. Changes take effect immediately.",
      stop: "Clears within 60 minutes. No withdrawal. GH patterns return to baseline immediately. Previous benefits to sleep and recovery may gradually fade over 1–2 weeks."
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
    },
    pharmacokinetics: {
      halfLife: "~26 min",
      timeToPeak: "~15 min",
      steadyStateIn: "~1 week",
      dosesToSteadyState: "~7",
      fullClearance: "~2 hrs",
      bioavailability: "~80%",
      accumulation: "1.0x",
      metabolism: "Proteolytic cleavage"
    },
    whatIf: {
      miss: "Tesamorelin has a ~26 minute half-life but its GH-releasing effects trigger downstream IGF-1 elevation lasting hours. Missing one dose slightly reduces average GH output. Resume normally.",
      double: "Doubling may increase injection-site reactions and joint pain. Not clinically dangerous at 2x the FDA dose short-term. Return to standard dosing.",
      changeSchedule: "FDA-approved for daily use. Reducing frequency proportionally reduces visceral fat loss benefits. Takes 2–4 weeks to observe effects at new frequency.",
      stop: "Clears within 2 hours. GH and IGF-1 levels return to baseline within days. Visceral fat reduction benefits may partially reverse over months without continued use."
    }
  },

  "Hexarelin": {
    category: "Growth Hormone Secretion",
    desc: "A potent GH secretagogue (GHRP family). Produces one of the strongest acute GH releases among secretagogues but also raises cortisol and prolactin more than Ipamorelin. Short-cycle use recommended. Not FDA-approved.",
    timing: "Bedtime or pre-workout on an empty stomach.",
    administration: "Subcutaneous injection.",
    defaultVial: 5,
    schedule: "Daily injection. Advanced: split into 2–3 doses/day",
    typicalCycle: 4,
    color: "#7c3aed",
    reconstitution: "Standard reconstitution. Store refrigerated. Sensitive to heat degradation.",
    doses: {
      low:  { mcg: 100, label: "Single Pulse", riskLevel: "standard", risk: "Well-tolerated for single doses. Mild hunger increase expected.", source: "Standard single-dose protocol" },
      med:  { mcg: 200, label: "Standard Protocol", riskLevel: "elevated", risk: "Strong GH pulse. Elevated cortisol and prolactin possible. Keep cycles short (4–8 weeks max). Monitor for hunger spikes.", source: "Standard clinical dose" },
      high: { mcg: 300, label: "Maximum Acute GH", riskLevel: "high", risk: "Very strong GH release but also significantly raises cortisol and prolactin. Only use short cycles (2–4 weeks). Desensitization occurs rapidly at this dose. Not recommended for prolonged use.", source: "Upper research ceiling" }
    },
    pharmacokinetics: {
      halfLife: "~70 min",
      timeToPeak: "~20 min",
      steadyStateIn: "~3 days",
      dosesToSteadyState: "~6",
      fullClearance: "~6 hrs",
      bioavailability: "~75%",
      accumulation: "1.0x",
      metabolism: "Hepatic proteolysis"
    },
    whatIf: {
      miss: "Hexarelin has a ~70 minute half-life. Missing one dose means one fewer GH pulse. More importantly, Hexarelin causes rapid receptor desensitization — breaks are actually beneficial.",
      double: "Doubling significantly increases cortisol and prolactin. Strong GH pulse but with diminishing returns and increased side effects. Not recommended. Accelerates receptor desensitization.",
      changeSchedule: "Short cycles (4–8 weeks) are essential due to desensitization. Reducing frequency may help extend cycle length. Always include off-periods.",
      stop: "Clears within 6 hours. Receptor sensitivity recovers over 2–4 weeks off. GH levels return to baseline within 1–2 days. No withdrawal."
    }
  },

  "GHRP-2": {
    category: "Growth Hormone Secretion",
    desc: "Growth Hormone Releasing Peptide-2. A synthetic hexapeptide that binds ghrelin receptors to stimulate strong GH pulses. More potent than Ipamorelin and less desensitizing than Hexarelin. Often stacked with CJC-1295 for synergistic GH amplification. Increases cortisol and prolactin moderately. Not FDA-approved.",
    timing: "Bedtime on an empty stomach (primary). Can also be used morning fasted and/or pre-workout for additional GH pulses. Must be taken on an empty stomach — food blunts the GH response.",
    administration: "Subcutaneous injection into abdominal fat. Rotate injection sites.",
    defaultVial: 5,
    schedule: "1–3x daily",
    typicalCycle: 12,
    color: "#2563eb",
    reconstitution: "Standard reconstitution with bacteriostatic water. Store refrigerated. Sensitive to heat — do not shake vigorously.",
    doses: {
      low:  { mcg: 100, label: "Introductory Dose", riskLevel: "standard", risk: "Well-tolerated. Mild hunger increase and tingling at injection site possible. Good starting dose to assess tolerance.", source: "Standard beginner protocol" },
      med:  { mcg: 200, label: "Standard Protocol", riskLevel: "standard", risk: "Moderate cortisol and prolactin increase. Noticeable hunger 30–60 min post-injection. Water retention possible with prolonged use.", source: "Standard clinical protocol" },
      high: { mcg: 300, label: "Aggressive GH Protocol", riskLevel: "elevated", risk: "Significant cortisol/prolactin increase. Strong hunger and possible water retention. Monitor for joint stiffness. Not recommended daily at this dose — limit to 2x/day.", source: "Upper clinical range" }
    },
    pharmacokinetics: {
      halfLife: "~25 min",
      timeToPeak: "~15 min",
      steadyStateIn: "~2 days",
      dosesToSteadyState: "~6",
      fullClearance: "~2 hrs",
      bioavailability: "~70%",
      accumulation: "1.0x",
      metabolism: "Enzymatic hydrolysis"
    },
    whatIf: {
      miss: "GHRP-2 has a ~25 minute half-life. Each dose is an independent GH pulse. Missing one has zero cumulative impact. Resume normally.",
      double: "Doubling causes significant cortisol and prolactin spikes plus intense hunger. GH release is only marginally higher. Not worth the side effects. Return to normal dosing.",
      changeSchedule: "Can be dosed 1–3x daily. Each dose is independent. More frequent dosing = more GH pulses but also more cortisol/prolactin. Best combined with CJC-1295 for sustained effect.",
      stop: "Clears within 2 hours. No withdrawal. GH patterns normalize immediately. Hunger returns to baseline within 1 dose cycle."
    }
  },

  "GHRP-6": {
    category: "Growth Hormone Secretion",
    desc: "Growth Hormone Releasing Peptide-6. One of the original GHRPs, extensively studied. Strong ghrelin agonist producing robust GH release combined with intense appetite stimulation. Lower GH potency than GHRP-2 but strongest hunger effect of all GHRPs. Useful in muscle-building protocols where caloric surplus is desired. Not FDA-approved.",
    timing: "Bedtime on an empty stomach. Morning fasted or pre-workout for additional pulses. Warning: intense hunger will follow each injection — plan meals accordingly.",
    administration: "Subcutaneous injection into abdominal fat. Rotate injection sites.",
    defaultVial: 5,
    schedule: "1–3x daily",
    typicalCycle: 8,
    color: "#1d4ed8",
    reconstitution: "Standard reconstitution with bacteriostatic water. Store refrigerated.",
    doses: {
      low:  { mcg: 100, label: "Introductory Dose", riskLevel: "standard", risk: "Hunger increase is the most prominent effect — expect strong appetite 20–40 min after injection. GH pulse begins at this dose.", source: "Standard beginning dose" },
      med:  { mcg: 200, label: "Standard Protocol", riskLevel: "elevated", risk: "Significant appetite stimulation lasting 30–60 min. Cortisol and prolactin increase. Best used with a structured caloric surplus. Not suitable for fat loss goals.", source: "Standard clinical protocol" },
      high: { mcg: 300, label: "Aggressive Bulking Protocol", riskLevel: "elevated", risk: "Very strong appetite, GH release, cortisol/prolactin increase. Only appropriate for intentional mass-building phases. Monitor fasting blood glucose. Not recommended for cutting.", source: "Upper clinical range" }
    },
    pharmacokinetics: {
      halfLife: "~20 min",
      timeToPeak: "~15 min",
      steadyStateIn: "~2 days",
      dosesToSteadyState: "~6",
      fullClearance: "~1.5 hrs",
      bioavailability: "~65%",
      accumulation: "1.0x",
      metabolism: "Enzymatic hydrolysis"
    },
    whatIf: {
      miss: "GHRP-6 has a ~20 minute half-life. Missing one dose simply means one fewer GH pulse and one fewer hunger spike. No accumulation issues.",
      double: "Doubling causes extreme hunger within 20–40 minutes plus significant cortisol/prolactin elevation. GH release plateaus. Return to normal dosing.",
      changeSchedule: "Like GHRP-2, each dose is independent. Reducing frequency reduces total GH stimulation proportionally. Changes take effect immediately.",
      stop: "Clears within 1.5 hours. Appetite-stimulating effects stop immediately. No withdrawal. GH patterns return to baseline within hours."
    }
  },

  // ───────────────────────────────────────────────────────────
  // SKIN, HAIR & AESTHETICS
  // ───────────────────────────────────────────────────────────

  "GHK-Cu": {
    category: "Skin, Hair & Aesthetics",
    desc: "Copper tripeptide-1. Promotes collagen synthesis, skin elasticity, hair growth, and dampens systemic inflammation. Not FDA-approved.",
    timing: "Evening, before bed. GHK-Cu works best during the body's nocturnal repair cycle.",
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
    },
    pharmacokinetics: {
      halfLife: "~30 min",
      timeToPeak: "~15 min",
      steadyStateIn: "~2 days",
      dosesToSteadyState: "~8",
      fullClearance: "~2.5 hrs",
      bioavailability: "~70%",
      accumulation: "1.0x",
      metabolism: "Peptidase degradation"
    },
    whatIf: {
      miss: "GHK-Cu has a ~30 minute half-life but its collagen-stimulating effects persist at the tissue level. Missing one dose has minimal impact on a multi-week cycle. Resume normally.",
      double: "Doubling increases risk of injection-site pain and theoretical copper accumulation. Not recommended. Return to standard dosing.",
      changeSchedule: "Daily dosing is standard. Reducing to every-other-day halves average tissue exposure. Skin/hair benefits may take longer to manifest. Allow 2+ weeks to assess.",
      stop: "Clears within 2.5 hours. Collagen-stimulating effects at the cellular level persist after stopping. Benefits to skin elasticity and hair may be retained for weeks. No withdrawal."
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
    },
    pharmacokinetics: {
      halfLife: "~2 hrs",
      timeToPeak: "~30 min",
      steadyStateIn: "~3 days",
      dosesToSteadyState: "~6",
      fullClearance: "~10 hrs",
      bioavailability: "~70%",
      accumulation: "1.1x",
      metabolism: "Mixed proteolysis"
    },
    whatIf: {
      miss: "As a combination blend, missing one dose has minimal impact. The longest-acting component (BPC-157 at ~4 hrs) still clears quickly. Resume your next dose normally.",
      double: "Doubling increases GHK-Cu injection-site pain risk significantly. The blend components are individually safe at 2x but combined effects on injection sites may be uncomfortable.",
      changeSchedule: "Daily dosing is optimal for skin/hair results. Reducing frequency delays visible results. Takes 4+ weeks to see effects at any schedule.",
      stop: "All blend components clear within hours. Cellular-level benefits to collagen and healing persist. No withdrawal. Results from completed cycles are largely retained."
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
    },
    pharmacokinetics: {
      halfLife: "~1 hr",
      timeToPeak: "~30 min",
      steadyStateIn: "~5 days",
      dosesToSteadyState: "~7",
      fullClearance: "~5 hrs",
      bioavailability: "~75%",
      accumulation: "1.2x",
      metabolism: "Hepatic proteolysis"
    },
    whatIf: {
      miss: "During loading phase, missing a dose slows the tanning process. During maintenance, one missed dose has minimal impact as melanin production has already been upregulated.",
      double: "CAUTION. Doubling significantly increases nausea, facial flushing, and blood pressure changes. May cause prolonged erections in males. Not recommended. Monitor moles closely.",
      changeSchedule: "Loading (daily for 7–10 days) should be completed consistently. Maintenance can be flexible (1–2x/week). Tan will fade gradually if frequency is reduced too much.",
      stop: "Clears within 5 hours. Tan fades gradually over 4–8 weeks without UV exposure. Mole darkening may persist longer. Get a dermatological check after stopping. No physical withdrawal."
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
    },
    pharmacokinetics: {
      halfLife: "~5 min",
      timeToPeak: "~1 min",
      steadyStateIn: "N/A",
      dosesToSteadyState: "N/A",
      fullClearance: "~25 min",
      bioavailability: "~90%",
      accumulation: "1.0x",
      metabolism: "Rapid enzymatic cleavage"
    },
    whatIf: {
      miss: "Semax has a ~5 minute half-life — each dose is an acute cognitive boost. Missing one dose simply means no boost for that session. No accumulation to worry about.",
      double: "Doubling may cause overstimulation, anxiety, and restlessness. Similar to drinking too much coffee. Effects pass within 30 minutes. Return to normal dosing.",
      changeSchedule: "Each dose is independent. Daily use builds consistent BDNF support. As-needed use works for acute focus. No adjustment period.",
      stop: "Clears within 25 minutes. No withdrawal. BDNF levels gradually normalize over 1–2 weeks. Cognitive baseline returns. Can restart anytime."
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
    },
    pharmacokinetics: {
      halfLife: "~30 min",
      timeToPeak: "~15 min",
      steadyStateIn: "~3 days",
      dosesToSteadyState: "~6",
      fullClearance: "~2.5 hrs",
      bioavailability: "~55%",
      accumulation: "1.0x",
      metabolism: "Hepatic proteolysis"
    },
    whatIf: {
      miss: "Dihexa has a ~30 minute half-life. Missing one dose during a short cycle may slow neurogenic effects. Resume normally — don't double up given the limited safety data.",
      double: "NOT RECOMMENDED. Very limited human safety data. Theoretical risk of uncontrolled synaptogenesis. If accidentally doubled, skip the next dose and monitor for headaches.",
      changeSchedule: "Keep cycles very short (2–4 weeks). Daily dosing is standard. Extending cycle length is riskier than changing frequency. Always cycle off.",
      stop: "Clears within 2.5 hours. Neural connections formed during the cycle are retained. No withdrawal. Cognitive benefits may persist for weeks to months after stopping."
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
    },
    pharmacokinetics: {
      halfLife: "~15 min",
      timeToPeak: "~5 min",
      steadyStateIn: "~2 days",
      dosesToSteadyState: "~6",
      fullClearance: "~75 min",
      bioavailability: "~60%",
      accumulation: "1.0x",
      metabolism: "Enzymatic degradation"
    },
    whatIf: {
      miss: "PE-22-28 has a ~15 minute half-life. Missing one dose has negligible impact. Very limited human data — consistency matters more than any single dose.",
      double: "NOT RECOMMENDED due to very limited safety data. Stick to studied doses. If accidentally doubled, skip next dose.",
      changeSchedule: "Keep cycles short (2–4 weeks). Daily dosing during cycles. Limited data on frequency optimization.",
      stop: "Clears within 75 minutes. Antidepressant-like effects may persist for days to weeks. No known withdrawal. Can restart after a break."
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
    },
    pharmacokinetics: {
      halfLife: "~5 min",
      timeToPeak: "~1 min",
      steadyStateIn: "N/A",
      dosesToSteadyState: "N/A",
      fullClearance: "~25 min",
      bioavailability: "~92%",
      accumulation: "1.0x",
      metabolism: "Rapid aminopeptidase cleavage"
    },
    whatIf: {
      miss: "Selank has a ~5 minute half-life. Missing one dose simply means less anxiolytic coverage for that period. No accumulation or rebound anxiety.",
      double: "Doubling Selank is generally safe — it has a very wide therapeutic window. May cause mild drowsiness. Return to normal dosing.",
      changeSchedule: "Can be used daily or as-needed. No adjustment period needed. Anxiolytic effects are acute and dose-dependent.",
      stop: "Clears within 25 minutes. No withdrawal or rebound anxiety (unlike benzodiazepines). Anxiolytic effects stop when dosing stops. Very safe discontinuation profile."
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
    },
    pharmacokinetics: {
      halfLife: "~15 min",
      timeToPeak: "~10 min",
      steadyStateIn: "~3 days",
      dosesToSteadyState: "~6",
      fullClearance: "~75 min",
      bioavailability: "~80%",
      accumulation: "1.0x",
      metabolism: "Aminopeptidase degradation"
    },
    whatIf: {
      miss: "Missing one nightly dose may result in less restful sleep that night. DSIP's short half-life (~15 min) means no accumulation issues. Resume the next evening.",
      double: "Doubling may cause excessive drowsiness and prolonged morning grogginess. Not dangerous but uncomfortable. Take at least 9 hours before needing to wake.",
      changeSchedule: "Must be taken evening/bedtime. Daily use during cycles is standard. Skipping weekends is an option if experiencing morning grogginess.",
      stop: "Clears within 75 minutes. Sleep patterns may take 2–3 nights to readjust. No physical withdrawal. Any circadian rhythm benefits may fade over 1–2 weeks."
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
    },
    pharmacokinetics: {
      halfLife: "~30 min",
      timeToPeak: "~15 min",
      steadyStateIn: "~3 days",
      dosesToSteadyState: "~6",
      fullClearance: "~2.5 hrs",
      bioavailability: "~80%",
      accumulation: "1.0x",
      metabolism: "Peptidase degradation"
    },
    whatIf: {
      miss: "Epithalon cycles are short (10–20 days). Missing a dose shortens your effective cycle. Make up the dose the next day to maintain cycle length if possible.",
      double: "Limited data at higher doses. Doubling is likely well-tolerated given the short cycle length. Not necessary — just extend the cycle by one day instead.",
      changeSchedule: "Standard protocol is daily for 10–20 days, then 4–6 months off. Consistency during the short cycle is important. Don't extend beyond 20 days.",
      stop: "Clears within 2.5 hours. Telomerase activation effects may persist for months (the basis for long off-periods). Melatonin support effects fade within days. No withdrawal."
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
    },
    pharmacokinetics: {
      halfLife: "~30 min",
      timeToPeak: "~15 min",
      steadyStateIn: "N/A",
      dosesToSteadyState: "N/A",
      fullClearance: "~2.5 hrs",
      bioavailability: "~30%",
      accumulation: "1.0x",
      metabolism: "Cellular enzymatic conversion"
    },
    whatIf: {
      miss: "NAD+ has a ~30 minute half-life (SubQ). Missing one dose is inconsequential — cellular NAD+ pools are maintained by multiple pathways. Resume your next dose.",
      double: "Doubling significantly increases injection-site stinging and potential nausea. Split into two injection sites if needed. Not clinically dangerous but very uncomfortable.",
      changeSchedule: "2–3x weekly is standard. Daily is more aggressive but increases injection-site discomfort burden. 1x weekly provides maintenance-level support.",
      stop: "Clears within 2.5 hours. Cellular NAD+ levels gradually decline to pre-supplementation baseline over 2–4 weeks. No withdrawal. Energy and cognitive benefits fade gradually."
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
    },
    pharmacokinetics: {
      halfLife: "~2 hrs",
      timeToPeak: "~2 hrs",
      steadyStateIn: "~1 week",
      dosesToSteadyState: "~3",
      fullClearance: "~10 hrs",
      bioavailability: "~85%",
      accumulation: "1.1x",
      metabolism: "Serine protease degradation"
    },
    whatIf: {
      miss: "With a ~2 hour half-life, missing one dose of TA1 temporarily reduces immune modulation. However, T-cell priming effects from previous doses persist. Resume normally.",
      double: "TA1 has an excellent safety profile even at double doses. One of the safest peptides in clinical use. Mild injection-site reaction possible. Return to normal dosing.",
      changeSchedule: "Standard is 2–3x/week. Daily dosing during acute immune challenges is acceptable. Can reduce to 1x/week for long-term maintenance.",
      stop: "Clears within 10 hours. Immune priming effects persist for weeks after stopping. T-cell and dendritic cell improvements are retained. No withdrawal or immune rebound."
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
    },
    pharmacokinetics: {
      halfLife: "~4 hrs",
      timeToPeak: "~1 hr",
      steadyStateIn: "~2 days",
      dosesToSteadyState: "~4",
      fullClearance: "~20 hrs",
      bioavailability: "~70%",
      accumulation: "1.1x",
      metabolism: "Proteolytic degradation"
    },
    whatIf: {
      miss: "LL-37 has a ~4 hour half-life. Missing one dose during an antimicrobial cycle may allow partial biofilm re-establishment. Try to maintain consistency during short cycles.",
      double: "Doubling significantly increases Herxheimer reaction risk (flu-like symptoms from bacteria die-off). If targeting biofilm infections, increase gradually, not by doubling.",
      changeSchedule: "Daily dosing during short cycles (2–4 weeks) is standard. Extending to longer cycles requires physician supervision due to theoretical immune modulation effects.",
      stop: "Clears within 20 hours. Antimicrobial effects stop but bacteria already killed remain eliminated. If treating chronic biofilm infections, premature stopping may allow regrowth."
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
    },
    pharmacokinetics: {
      halfLife: "~30 min",
      timeToPeak: "~15 min",
      steadyStateIn: "~2 days",
      dosesToSteadyState: "~8",
      fullClearance: "~2.5 hrs",
      bioavailability: "~65%",
      accumulation: "1.0x",
      metabolism: "Enzymatic peptidase cleavage"
    },
    whatIf: {
      miss: "KPV has a ~30 minute half-life but its anti-inflammatory effects on gut tissue persist longer. Missing one dose has minimal impact on ongoing gut healing.",
      double: "Doubling KPV is generally well-tolerated. May cause mild fatigue. Return to normal dosing. Anti-inflammatory effect doesn't scale linearly with dose.",
      changeSchedule: "Daily dosing is standard for gut inflammation. Can split into AM/PM for more consistent coverage. As-needed use is less studied.",
      stop: "Clears within 2.5 hours. Anti-inflammatory effects at the gut-tissue level may persist for days. No withdrawal. Gut healing achieved during the cycle is retained."
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
    },
    pharmacokinetics: {
      halfLife: "~4 hrs",
      timeToPeak: "~1 hr",
      steadyStateIn: "~2 weeks",
      dosesToSteadyState: "~6",
      fullClearance: "~20 hrs",
      bioavailability: "~75%",
      accumulation: "1.2x",
      metabolism: "Mitochondrial processing"
    },
    whatIf: {
      miss: "MOTS-c has a ~4 hour half-life. Missing one dose (typically 3x/week) has minimal impact. The metabolic benefits accumulate over weeks. Resume your next scheduled dose.",
      double: "Doubling is likely well-tolerated but not well-studied at higher doses. May cause mild GI discomfort. Return to normal dosing.",
      changeSchedule: "3x/week is standard. Daily dosing is more aggressive. 1–2x/week provides maintenance-level AMPK activation. Allow 2 weeks to assess effect at new frequency.",
      stop: "Clears within 20 hours. Metabolic improvements (insulin sensitivity, exercise capacity) gradually return to baseline over 2–4 weeks. No withdrawal."
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
    },
    pharmacokinetics: {
      halfLife: "~2.7 hrs",
      timeToPeak: "~1 hr",
      steadyStateIn: "N/A",
      dosesToSteadyState: "N/A",
      fullClearance: "~14 hrs",
      bioavailability: "~80%",
      accumulation: "1.0x",
      metabolism: "Hepatic hydrolysis"
    },
    whatIf: {
      miss: "PT-141 is used as-needed, not on a schedule. There is no 'missed dose' — simply use it when needed, with at least 24 hours between doses and max 8x/month.",
      double: "DANGEROUS. Doubling significantly increases nausea, vomiting, and blood pressure changes. May cause severe headache and prolonged flushing. Seek medical attention if symptomatic.",
      changeSchedule: "No fixed schedule — use as needed. FDA limit is 8 doses per month with 24+ hours between doses. Do not use to 'build up' effects.",
      stop: "Clears within 14 hours. No withdrawal or dependency. Sexual function returns to baseline. No physical rebound effects."
    }
  },

  "SS-31 (Elamipretide)": {
    category: "Longevity & Anti-Aging",
    desc: "A mitochondria-targeted tetrapeptide that concentrates in the inner mitochondrial membrane, stabilizing cardiolipin and improving electron transport chain efficiency. FDA-approved (as Forzinity) for Barth syndrome. Studied for age-related mitochondrial dysfunction, primary mitochondrial myopathy, and heart failure. Enhances cellular energy production and reduces oxidative stress.",
    timing: "Morning, subcutaneous injection. Can be taken daily. Consistent timing recommended.",
    administration: "Subcutaneous injection into abdomen or thigh. Rotate injection sites to minimize site reactions.",
    defaultVial: 40,
    schedule: "Daily",
    typicalCycle: 12,
    color: "#7c3aed",
    reconstitution: "Supplied as lyophilized powder. Reconstitute with bacteriostatic water. Store refrigerated. Some formulations are pre-mixed.",
    doses: {
      low:  { mcg: 10000, label: "Starting Dose (10mg)", riskLevel: "standard", risk: "Well-tolerated. Mild injection site reactions (redness, warmth) possible. Start here to assess tolerance.", source: "Lower clinical trial dose" },
      med:  { mcg: 40000, label: "Standard Clinical (40mg)", riskLevel: "standard", risk: "Most studied dose. Injection site reactions are the most common side effect (redness, pain, swelling). Generally well-tolerated in clinical trials up to 36 weeks.", source: "FDA-approved / clinical trial standard dose" },
      high: { mcg: 80000, label: "High Research (80mg)", riskLevel: "elevated", risk: "Above standard dosing. Increased injection site reactions likely. Limited long-term safety data at this dose. Physician supervision required.", source: "Upper research range" }
    },
    pharmacokinetics: {
      halfLife: "~4 hrs",
      timeToPeak: "~30 min",
      steadyStateIn: "~2 days",
      dosesToSteadyState: "~4",
      fullClearance: "~20 hrs",
      bioavailability: "~90%",
      accumulation: "1.1x",
      metabolism: "Renal clearance, proteolysis"
    },
    whatIf: {
      miss: "SS-31 has a ~4 hour half-life. Missing one daily dose temporarily reduces mitochondrial support. Resume your next dose — no need to double up.",
      double: "Doubling may increase injection-site reactions (redness, swelling, pain). The mitochondrial targeting mechanism saturates, so doubling provides diminishing returns.",
      changeSchedule: "Daily dosing is standard for clinical benefit. Reducing to every-other-day halves mitochondrial support. Allow 1–2 weeks to assess impact of schedule changes.",
      stop: "Clears within 20 hours. Mitochondrial membrane stabilization effects persist briefly. Cellular energy improvements fade over 1–2 weeks. No withdrawal or rebound."
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
  return '';
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
    explanation: 'BPC-157 works best taken in the evening to align with overnight tissue repair cycles. Growth hormone peaks during sleep, enhancing its regenerative effects.',
    dosePerDay: 1,
    cycleWeeks: 8,
    options: [
      {
        id: 'daily_evening',
        label: 'Once Daily (Evening)',
        shortDesc: 'Standard maintenance & healing',
        frequency: 'daily',
        bestTime: '21:00',
        bestTimeLabel: 'Evening (9 PM)',
        explanation: 'One injection at night aligns with overnight tissue repair and the natural GH pulse during sleep. Easiest to maintain consistency. Best for general healing and maintenance.',
      },
      {
        id: 'twice_daily',
        label: 'Twice Daily (AM + PM)',
        shortDesc: 'Acute injury — faster healing',
        frequency: 'daily',
        bestTime: '09:00',
        bestTimeLabel: 'Morning (9 AM) + Evening (9 PM)',
        explanation: 'Split dosing for acute injuries. Half the daily dose in the morning, half at night. Maintains more consistent blood levels throughout the day and accelerates the healing response. Commonly used for tendon/ligament injuries.',
      },
    ],
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
    explanation: 'Ipamorelin is the most selective GHRP with minimal cortisol/prolactin increase. Best before bed to amplify nocturnal GH pulse.',
    dosePerDay: 1,
    cycleWeeks: 12,
    options: [
      {
        id: 'once_bedtime',
        label: 'Once Nightly',
        shortDesc: 'Standard — sleep-focused GH release',
        frequency: 'daily',
        bestTime: '21:00',
        bestTimeLabel: 'Before bed (9 PM)',
        explanation: 'One injection before bed on an empty stomach. Amplifies the body\'s natural GH pulse during deep sleep. Best for anti-aging, recovery, and sleep quality. Easiest to follow consistently.',
      },
      {
        id: 'three_daily',
        label: '3× Daily',
        shortDesc: 'Advanced — maximum GH output',
        frequency: 'daily',
        bestTime: '07:00',
        bestTimeLabel: 'AM fasted + post-workout + bedtime',
        explanation: 'Three injections per day (morning fasted, post-workout, and bedtime) creates three separate GH pulses for maximum secretion. For advanced users focused on body recomposition or performance. Each dose must be on an empty stomach.',
      },
    ],
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
    explanation: 'GHRH analog that stimulates pituitary GH release. Most effective before bed on an empty stomach. Avoid food 90 min before.',
    dosePerDay: 1,
    cycleWeeks: 12,
    options: [
      {
        id: 'daily',
        label: 'Daily (7 days/week)',
        shortDesc: 'Maximum pituitary stimulation',
        frequency: 'daily',
        bestTime: '21:00',
        bestTimeLabel: 'Before bed (9 PM)',
        explanation: 'Daily use provides continuous pituitary stimulation for maximum GH output. Best for body composition, recovery, and anti-aging goals where response speed matters.',
      },
      {
        id: '5on2off',
        label: '5 Days On, 2 Off',
        shortDesc: 'Prevents receptor desensitization',
        frequency: 'weekly',
        scheduleDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        bestTime: '21:00',
        bestTimeLabel: 'Before bed (9 PM)',
        explanation: 'Taking Sat/Sun off prevents pituitary receptor desensitization — the classic clinical protocol for extended cycles. The 2-day rest helps maintain long-term effectiveness and is recommended for cycles longer than 3 months.',
      },
    ],
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
  'GHRP-2': {
    frequency: 'daily',
    bestTime: '21:00',
    bestTimeLabel: 'Before bed (9 PM)',
    explanation: 'GHRP-2 stimulates strong GH pulses via ghrelin receptors. Must be taken on a fully empty stomach — food significantly blunts the GH response. Often combined with CJC-1295 for synergistic effect.',
    dosePerDay: 1,
    cycleWeeks: 12,
    options: [
      {
        id: 'once_bedtime',
        label: 'Once Nightly',
        shortDesc: 'Standard — beginner / anti-aging',
        frequency: 'daily',
        bestTime: '21:00',
        bestTimeLabel: 'Before bed (9 PM)',
        explanation: 'Single nightly injection on an empty stomach. Simple, effective, and the standard starting point. Works well stacked with CJC-1295 at the same time.',
      },
      {
        id: 'twice_daily',
        label: 'Twice Daily',
        shortDesc: 'Advanced — body recomp / performance',
        frequency: 'daily',
        bestTime: '07:00',
        bestTimeLabel: 'Morning fasted + Before bed',
        explanation: 'Two GH pulses per day (morning fasted and bedtime). Maximizes total daily GH output and fat-burning effects. Both injections must be on a completely empty stomach. More cortisol/prolactin increase than once-daily.',
      },
    ],
  },
  'GHRP-6': {
    frequency: 'daily',
    bestTime: '21:00',
    bestTimeLabel: 'Before bed (9 PM)',
    explanation: 'GHRP-6 is best before bed for the GH pulse. Intense hunger will follow — plan a small protein-rich meal nearby. Ideal for users in a muscle-building phase who want appetite support alongside GH.',
    dosePerDay: 1,
    cycleWeeks: 8,
    options: [
      {
        id: 'once_bedtime',
        label: 'Once Nightly',
        shortDesc: 'Standard — simplest approach',
        frequency: 'daily',
        bestTime: '21:00',
        bestTimeLabel: 'Before bed (9 PM)',
        explanation: 'Single bedtime injection. Strong GH pulse + appetite stimulation. Have a high-protein snack ready post-injection if hunger becomes uncomfortable.',
      },
      {
        id: 'twice_daily',
        label: 'Twice Daily',
        shortDesc: 'Aggressive bulking protocol',
        frequency: 'daily',
        bestTime: '07:00',
        bestTimeLabel: 'Morning fasted + Before bed',
        explanation: 'Two injections per day for maximum GH secretion and appetite stimulation throughout the day. Only appropriate for dedicated bulk/mass-gaining phases with structured high-calorie nutrition. Not suitable for fat loss.',
      },
    ],
  },

  'GHK-Cu': {
    frequency: 'daily',
    bestTime: '21:00',
    bestTimeLabel: 'Evening (9 PM)',
    explanation: 'Copper peptide for skin/hair/tissue remodeling. Evening dosing aligns with the body\'s nocturnal repair and collagen synthesis cycle.',
    dosePerDay: 1,
    cycleWeeks: 12,
    options: [
      {
        id: 'daily',
        label: 'Daily',
        shortDesc: 'Maximum cumulative collagen benefit',
        frequency: 'daily',
        bestTime: '09:00',
        bestTimeLabel: 'Morning (9 AM)',
        explanation: 'Daily injection maximizes cumulative collagen stimulation and tissue remodeling. Best for aggressive aesthetic or healing goals. Monitor injection sites as the copper component can cause localized redness with daily use.',
      },
      {
        id: '5on2off',
        label: '5 Days On, 2 Off',
        shortDesc: 'Reduces injection site irritation',
        frequency: 'weekly',
        scheduleDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        bestTime: '09:00',
        bestTimeLabel: 'Morning (9 AM)',
        explanation: '5-on/2-off reduces injection site irritation from the copper component and prevents local receptor desensitization. Recommended for longer cycles (12+ weeks) or if you experience persistent skin reactions at the injection site.',
      },
    ],
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
    frequency: 'weekly',
    weeklyDays: [1, 3, 5],
    bestTime: '09:00',
    bestTimeLabel: 'Morning (9 AM)',
    explanation: 'Cellular energy and DNA repair molecule. SubQ injection in the morning for all-day energy. Standard protocol is 3× per week (Mon/Wed/Fri) — avoid consecutive days. Evening dosing may disrupt sleep due to alerting effect.',
    dosePerDay: 1,
    cycleWeeks: 8,
    options: [
      {
        id: '3x_week',
        label: '3× Per Week (Mon/Wed/Fri)',
        shortDesc: 'Standard protocol — recommended',
        frequency: 'weekly',
        weeklyDays: [1, 3, 5],
        bestTime: '09:00',
        bestTimeLabel: 'Morning (9 AM)',
        explanation: 'The standard clinical protocol. 3 non-consecutive days per week maintains meaningful NAD+ elevation while spacing injections to reduce site irritation. Recommended for both initial and maintenance phases.',
      },
      {
        id: '2x_week',
        label: '2× Per Week',
        shortDesc: 'Maintenance — lower injection burden',
        frequency: 'weekly',
        weeklyDays: [1, 4],
        bestTime: '09:00',
        bestTimeLabel: 'Morning (9 AM)',
        explanation: 'Twice-weekly maintenance dosing for long-term use after an initial 3×/week phase. Spaced 3–4 days apart for steady NAD+ levels with minimal injection burden.',
      },
      {
        id: 'daily',
        label: 'Daily (Loading Phase)',
        shortDesc: 'Short-term intensive — 1-2 weeks only',
        frequency: 'daily',
        bestTime: '09:00',
        bestTimeLabel: 'Morning (9 AM)',
        explanation: 'Daily dosing is only recommended for a short 1–2 week loading phase to rapidly elevate NAD+ levels, then transition to 3× or 2× per week for maintenance. Not intended for long-term use.',
      },
    ],
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
  'SS-31 (Elamipretide)': {
    frequency: 'daily',
    bestTime: '09:00',
    bestTimeLabel: 'Morning (9 AM)',
    explanation: 'Mitochondria-targeted peptide for cellular energy. Daily SubQ injection in the morning. Clinical trials used 40mg/day for 8–12+ weeks. Injection site reactions are common — rotate sites.',
    dosePerDay: 1,
    cycleWeeks: 12,
    options: [
      {
        id: 'daily',
        label: 'Daily',
        shortDesc: 'Standard clinical protocol',
        frequency: 'daily',
        bestTime: '09:00',
        bestTimeLabel: 'Morning (9 AM)',
        explanation: 'The standard protocol used in clinical trials. Daily dosing maintains consistent mitochondrial support. Used for 8–12 week cycles, some trials extended to 24–36 weeks.',
      },
      {
        id: '5x_week',
        label: '5× Per Week (Weekdays)',
        shortDesc: 'Maintenance with weekends off',
        frequency: 'weekly',
        weeklyDays: [1, 2, 3, 4, 5],
        bestTime: '09:00',
        bestTimeLabel: 'Morning (9 AM)',
        explanation: 'Weekday dosing with weekends off. Reduces injection burden while maintaining most of the mitochondrial benefits. Good for long-term maintenance phases.',
      },
    ],
  },
};

// Helper to get suggested protocol for a peptide
export function getSuggestedProtocol(name) {
  return suggestedProtocols[name] || null;
}

