import React, { useState } from 'react';
import { Info, ArrowRight, Activity, Moon, Sun, X, BookOpen } from 'lucide-react';

// Hardcoded mock data for the calendar UI representation
const days = [
  ...Array(7).fill(0).map((_, i) => ({ day: 30 - i, active: 0, peptide: null })).reverse(),
  { day: 1, active: 1, peptide: 'BPC-157' },
  { day: 2, active: 1, peptide: 'BPC-157' },
  { day: 3, active: 0, peptide: null },
  { day: 4, active: 4, peptide: 'Tirzepatide' },
  { day: 5, active: 1, peptide: 'BPC-157' },
  { day: 6, active: 1, peptide: 'BPC-157' },
  { day: 7, active: 0, peptide: null },
  { day: 8, active: 2, peptide: 'TB-500' },
  { day: 9, active: 1, peptide: 'BPC-157' },
  { day: 10, active: 0, peptide: null },
  { day: 11, active: 4, peptide: 'Tirzepatide' },
  { day: 12, active: 1, peptide: 'BPC-157' },
  { day: 13, active: 0, peptide: null },
  { day: 14, active: 0, peptide: null }
];

// Activity levels mapped to colors matching the image
const colorMap = {
  0: 'rgba(255,255,255,0.02)', // empty
  1: 'rgba(126, 34, 206, 0.4)', // low purple
  2: 'rgba(168, 85, 247, 0.6)', // mid purple
  3: 'rgba(192, 132, 252, 0.9)', // high purple
  4: 'rgba(236, 72, 153, 0.7)', // pink (Tirzepatide)
};

const researchData = {
  'BPC-157': { time: '8:00 - 9:00 PM', desc: 'Best taken before bed for maximum recovery and remodeling while sleeping.' },
  'Tirzepatide': { time: 'Morning (Fasted)', desc: 'Take in the morning to align with natural GLP-1 rhythms and maximize appetite control.' },
  'TB-500': { time: 'Post-Workout / Evening', desc: 'Can be taken alongside BPC-157. Focuses on muscular recovery and systemic inflammation.' }
};

export default function CalendarGrid() {
  const [selectedDay, setSelectedDay] = useState(null);

  return (
    <div className="flex-col gap-sm w-full mt-md">
      <div className="flex justify-between items-end mb-xs px-xs">
        <h2 className="text-xl font-medium tracking-tight">Activity Grid</h2>
      </div>

      <div className="glass-card p-0 overflow-hidden flex-col gap-0 border-white/10 shadow-2xl" style={{ background: '#0d0d0f' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', padding: '2px', background: 'rgba(0,0,0,0.8)' }}>
          {days.map((item, i) => (
            <div 
              key={i} 
              onClick={() => item.peptide && setSelectedDay(item)}
              className="flex-col items-center justify-center relative transition-opacity"
              style={{ 
                background: colorMap[item.active], 
                aspectRatio: '1 / 1',
                cursor: item.peptide ? 'pointer' : 'default'
              }}
            >
              <span className="text-[11px] font-medium opacity-40 pointer-events-none text-white">
                {item.day}
              </span>
              {item.active > 0 && (
                <div className="w-1 h-1 rounded-full bg-white/70 mt-[2px] pointer-events-none"></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center p-md bg-black/40">
          <BookOpen size={18} className="text-secondary opacity-60" />
          <Activity size={18} className="text-secondary opacity-60" />
        </div>
      </div>

      {/* Modal Popup */}
      {selectedDay && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
          className="px-lg"
          onClick={() => setSelectedDay(null)}
        >
          <div 
            className="glass-card w-full flex-col p-lg border-white/10 animate-fade-in relative shadow-2xl max-w-[400px]" 
            style={{ background: '#1c1c1e' }} 
            onClick={e => e.stopPropagation()}
          >
            <button className="absolute top-4 right-4 text-secondary scale-90 bg-transparent border-none p-2 cursor-pointer" onClick={() => setSelectedDay(null)}>
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-md" style={{ color: 'var(--accent-light)' }}>
               {selectedDay.peptide === 'Tirzepatide' ? <Sun size={28} /> : <Moon size={28} />}
               <div className="flex-col">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Schedule • Day {selectedDay.day}</span>
                 <span className="text-3xl font-light text-white leading-tight mt-[2px]">{selectedDay.peptide}</span>
               </div>
            </div>
            
            <div className="bg-black/50 p-md rounded-xl mt-lg border border-white/5 flex flex-col gap-sm">
              <span className="font-semibold text-accent-light tracking-wide text-sm">Optimal Time: {researchData[selectedDay.peptide]?.time}</span>
               <p className="text-sm text-secondary leading-relaxed">
                 {researchData[selectedDay.peptide]?.desc}
               </p>
            </div>
            
            <button className="btn-primary mt-lg shadow-lg" style={{ padding: '14px', background: '#fff', color: '#000' }} onClick={() => setSelectedDay(null)}>Acknowledge</button>
          </div>
        </div>
      )}
    </div>
  );
}
