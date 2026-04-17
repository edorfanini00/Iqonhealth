import React, { useState, useEffect, useMemo } from 'react';
import { Info, ArrowRight, Activity, Moon, Sun, X, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { isScheduledForDate } from '../pages/Today';
import { peptidesDB } from '../data/peptides';

export default function CalendarGrid() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [protocols, setProtocols] = useState([]);
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    const raw = localStorage.getItem('protocols') || '[]';
    setProtocols(JSON.parse(raw).filter(p => p.status === 'active'));
  }, []);

  // Generate a standard 28 or 35 day grid for the current month
  const calendarDays = useMemo(() => {
    const today = new Date();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    // Get first day of month
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay(); // 0 is Sunday
    
    // Get last day of month
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ 
        day: prevMonthLastDay - i, 
        isCurrentMonth: false,
        dateStr: `${year}-${String(month).padStart(2,'0')}-${String(prevMonthLastDay - i).padStart(2,'0')}`
      });
    }
    
    // Current month
    for (let i = 1; i <= lastDay; i++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        // Find which compounds fall on this date
        const scheduled = [];
        protocols.forEach(p => {
            p.compounds.forEach(comp => {
                if (isScheduledForDate(comp, dateStr)) {
                    scheduled.push(comp);
                }
            });
        });

        days.push({ 
            day: i, 
            isCurrentMonth: true,
            dateStr,
            scheduled,
            isToday: dateStr === today.toISOString().split('T')[0]
        });
    }
    
    // Next month padding to complete 35 squares (5 rows)
    const remaining = 35 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ 
        day: i, 
        isCurrentMonth: false,
        dateStr: `${year}-${String(month+2).padStart(2,'0')}-${String(i).padStart(2,'0')}`
      });
    }
    
    return days;
  }, [protocols, viewDate]);

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const currentMonthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex-col gap-sm w-full mt-md animate-fade-in">
      <div className="flex justify-between items-center mb-xs px-xs">
        <h2 className="text-xl font-medium tracking-tight text-white">Activity Grid</h2>
        <div className="flex items-center gap-sm bg-white/5 rounded-full px-xs py-[2px] border border-white/5">
           <button onClick={handlePrevMonth} className="p-xs text-secondary hover:text-white transition-colors cursor-pointer bg-transparent border-none">
             <ChevronLeft size={16} />
           </button>
           <span className="text-xs font-semibold text-white min-w-[100px] text-center">{currentMonthName}</span>
           <button onClick={handleNextMonth} className="p-xs text-secondary hover:text-white transition-colors cursor-pointer bg-transparent border-none">
             <ChevronRight size={16} />
           </button>
        </div>
      </div>

      <div className="glass-card p-0 overflow-hidden flex-col gap-0 border-white/10 shadow-2xl" style={{ background: '#0d0d0f' }}>
        
        {/* Days of week header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '8px 2px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-secondary">{d}</div>
            ))}
        </div>

        {/* Date grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', padding: '2px', background: 'rgba(0,0,0,0.8)' }}>
          {calendarDays.map((item, i) => {
             const hasProtocol = item.scheduled?.length > 0;
             // Define cell styling
             let bg = 'rgba(255,255,255,0.02)';
             if (hasProtocol) {
                 // If there's 1 compound, give a subtle background of its color
                 bg = `${item.scheduled[0].color || '#a855f7'}20`;
             }
             if (item.isToday) {
                 bg = 'rgba(255,255,255,0.1)';
             }

             return (
              <div 
                key={i} 
                onClick={() => hasProtocol && setSelectedDay(item)}
                className="flex-col items-center justify-center relative transition-colors hover:bg-white/5"
                style={{ 
                  background: bg, 
                  aspectRatio: '1 / 1',
                  cursor: hasProtocol ? 'pointer' : 'default',
                  border: item.isToday ? '1px solid rgba(255,255,255,0.3)' : 'none'
                }}
              >
                <span className={`text-[12px] font-medium pointer-events-none ${item.isCurrentMonth ? 'text-white' : 'text-white/20'}`}>
                  {item.day}
                </span>
                
                {/* Dots container below the number */}
                {hasProtocol && (
                  <div className="flex gap-[2px] mt-[4px] absolute bottom-[6px] w-full justify-center px-[2px]">
                     {item.scheduled.slice(0, 3).map((comp, idx) => (
                         <div key={idx} className="w-[4px] h-[4px] rounded-full" style={{ background: comp.color || 'var(--accent)' }}></div>
                     ))}
                     {item.scheduled.length > 3 && <span className="text-[6px] text-secondary ml-[1px] leading-none">+</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between items-center p-md bg-black/40">
          <BookOpen size={18} className="text-secondary opacity-60" />
          <Activity size={18} className="text-secondary opacity-60" />
        </div>
      </div>

      {/* Modal Popup for viewing day details */}
      {selectedDay && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
          className="px-lg pb-[100px] animate-fade-in"
          onClick={() => setSelectedDay(null)}
        >
          <div 
            className="glass-card w-full flex-col p-lg border-white/10 relative shadow-2xl max-w-[400px] max-h-[80vh] overflow-y-auto hide-scrollbar" 
            style={{ background: '#1c1c1e' }} 
            onClick={e => e.stopPropagation()}
          >
            <button className="absolute top-4 right-4 text-secondary scale-90 bg-white/10 rounded-full border border-white/10 p-2 cursor-pointer transition-colors hover:text-white" onClick={() => setSelectedDay(null)}>
              <X size={16} />
            </button>
            
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary mt-xs mb-md">
              Scheduled Details • {new Date(selectedDay.dateStr).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            
            <div className="flex-col gap-sm">
                {selectedDay.scheduled.map((comp, i) => {
                    const data = peptidesDB[comp.compound];
                    return (
                        <div key={i} className="bg-black/40 p-md rounded-xl border border-white/5 relative overflow-hidden flex-col gap-[4px]">
                            <div className="absolute top-0 left-0 bottom-0 w-[3px]" style={{ background: comp.color }}></div>
                            
                            <div className="flex justify-between items-start pl-xs">
                               <span className="text-lg font-medium text-white">{comp.compound}</span>
                               <span className="text-sm font-semibold text-white">{comp.doseMcg}mcg</span>
                            </div>
                            
                            <div className="flex gap-xs flex-wrap mt-[4px] pl-xs">
                                {comp.timingTags?.map(tag => (
                                    <span key={tag} className="text-[9px] text-accent-light bg-accent/10 px-sm py-[2px] rounded border border-accent/20">{tag}</span>
                                ))}
                            </div>
                            
                            <p className="text-xs text-secondary leading-relaxed mt-sm pl-xs">
                                {data?.desc}
                            </p>
                        </div>
                    );
                })}
            </div>
            
            <button className="btn-primary mt-lg shadow-lg" style={{ padding: '16px', background: '#fff', color: '#000' }} onClick={() => setSelectedDay(null)}>
                Close
            </button>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
