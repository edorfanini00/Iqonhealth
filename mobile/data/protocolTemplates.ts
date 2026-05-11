// ═══════════════════════════════════════════════════════════════
// PREBUILT PROTOCOL TEMPLATES — Research-Backed Peptide Stacks
// Each template maps to compounds in peptidesDB.
// THIS IS NOT MEDICAL ADVICE.
// ═══════════════════════════════════════════════════════════════

export interface TemplateCompound {
  compound: string;       // must match a key in peptidesDB
  doseTier: 'low' | 'med' | 'high';
  frequency: 'daily' | 'weekly' | 'everyX';
  repeatDays?: number;
  weeklyDays?: string[];
  doseTime: string;       // HH:mm
}

export interface ProtocolTemplate {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
  icon: string;           // emoji
  peptideCount: number;
  cycleWeeks: number;
  description: string;
  compounds: TemplateCompound[];
}

export const protocolTemplates: ProtocolTemplate[] = [

  // ─────────────────────────────────────────────────────────
  // 1. THE HEALING STACK
  // ─────────────────────────────────────────────────────────
  {
    id: 'healing-stack',
    name: 'The Healing Stack',
    category: 'Injury Recovery',
    categoryColor: '#a855f7',
    icon: '💊',
    peptideCount: 2,
    cycleWeeks: 8,
    description: 'The gold standard healing protocol for tendon, ligament, muscle, and joint repair. BPC-157 targets local tissue regeneration while TB-500 acts systemically to reduce inflammation and promote angiogenesis. Widely used post-surgery and for chronic injury recovery.',
    compounds: [
      {
        compound: 'BPC-157',
        doseTier: 'med',
        frequency: 'daily',
        doseTime: '21:00',
      },
      {
        compound: 'TB-500',
        doseTier: 'med',
        frequency: 'weekly',
        weeklyDays: ['Mon', 'Thu'],
        doseTime: '21:00',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 2. FAT LOSS PROTOCOL
  // ─────────────────────────────────────────────────────────
  {
    id: 'fat-loss',
    name: 'Fat Loss Protocol',
    category: 'Weight Management',
    categoryColor: '#ec4899',
    icon: '💧',
    peptideCount: 2,
    cycleWeeks: 12,
    description: 'Clinically-backed GLP-1 therapy with gut protection. Tirzepatide suppresses appetite and improves insulin sensitivity while BPC-157 protects the GI tract from common side effects like nausea. Start Tirzepatide at the lowest dose and titrate every 4 weeks.',
    compounds: [
      {
        compound: 'Tirzepatide',
        doseTier: 'low',
        frequency: 'weekly',
        weeklyDays: ['Mon'],
        doseTime: '09:00',
      },
      {
        compound: 'BPC-157',
        doseTier: 'low',
        frequency: 'daily',
        doseTime: '09:00',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 3. ANTI-AGING STACK
  // ─────────────────────────────────────────────────────────
  {
    id: 'anti-aging',
    name: 'Anti-Aging Stack',
    category: 'Longevity',
    categoryColor: '#059669',
    icon: '✨',
    peptideCount: 3,
    cycleWeeks: 12,
    description: 'Comprehensive anti-aging protocol targeting collagen synthesis, telomere maintenance, and cellular energy. GHK-Cu rejuvenates skin and hair, Epithalon activates telomerase for cellular longevity, and NAD+ fuels mitochondrial energy production and DNA repair.',
    compounds: [
      {
        compound: 'GHK-Cu',
        doseTier: 'med',
        frequency: 'daily',
        doseTime: '21:00',
      },
      {
        compound: 'Epithalon (Epitalon)',
        doseTier: 'med',
        frequency: 'daily',
        doseTime: '21:00',
      },
      {
        compound: 'NAD+',
        doseTier: 'med',
        frequency: 'weekly',
        weeklyDays: ['Mon', 'Wed', 'Fri'],
        doseTime: '09:00',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 4. PERFORMANCE & MUSCLE
  // ─────────────────────────────────────────────────────────
  {
    id: 'performance-muscle',
    name: 'Performance & Muscle',
    category: 'Athletic Performance',
    categoryColor: '#14b8a6',
    icon: '🏋️',
    peptideCount: 3,
    cycleWeeks: 12,
    description: 'Optimize growth hormone output for performance athletes. CJC-1295/Ipamorelin amplifies natural GH pulses for lean mass and recovery, BPC-157 accelerates training-related tissue repair, and MK-677 boosts appetite and IGF-1 for sustained anabolic support.',
    compounds: [
      {
        compound: 'CJC-1295 / Ipamorelin',
        doseTier: 'med',
        frequency: 'daily',
        doseTime: '21:00',
      },
      {
        compound: 'BPC-157',
        doseTier: 'med',
        frequency: 'daily',
        doseTime: '21:00',
      },
      {
        compound: 'MK-677 (Ibutamoren)',
        doseTier: 'low',
        frequency: 'daily',
        doseTime: '21:00',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 5. SLEEP & RECOVERY
  // ─────────────────────────────────────────────────────────
  {
    id: 'sleep-recovery',
    name: 'Sleep & Recovery',
    category: 'Sleep Quality',
    categoryColor: '#6d28d9',
    icon: '🌙',
    peptideCount: 2,
    cycleWeeks: 8,
    description: 'Deep sleep optimization stack. CJC-1295/Ipamorelin triggers the body\'s largest natural GH pulse during sleep for overnight recovery, while DSIP (Delta Sleep-Inducing Peptide) promotes delta-wave deep sleep and normalizes circadian rhythm.',
    compounds: [
      {
        compound: 'CJC-1295 / Ipamorelin',
        doseTier: 'low',
        frequency: 'daily',
        doseTime: '21:00',
      },
      {
        compound: 'DSIP',
        doseTier: 'med',
        frequency: 'daily',
        doseTime: '21:00',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 6. COGNITIVE EDGE
  // ─────────────────────────────────────────────────────────
  {
    id: 'cognitive-edge',
    name: 'Cognitive Edge',
    category: 'Focus & Brain',
    categoryColor: '#eab308',
    icon: '🧠',
    peptideCount: 2,
    cycleWeeks: 4,
    description: 'Nootropic peptide stack for mental clarity and stress resilience. Semax boosts BDNF for sharper focus, learning, and neuroprotection, while Selank calms the nervous system and reduces anxiety without sedation. Short cycles recommended.',
    compounds: [
      {
        compound: 'Semax',
        doseTier: 'med',
        frequency: 'daily',
        doseTime: '09:00',
      },
      {
        compound: 'Selank',
        doseTier: 'med',
        frequency: 'daily',
        doseTime: '09:00',
      },
    ],
  },
];
