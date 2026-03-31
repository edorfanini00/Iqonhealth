import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Beaker, Syringe, Tag, ClipboardList, ShieldAlert, BookOpen, ChevronRight } from 'lucide-react';

const lessons = [
  {
    id: 1,
    title: "Peptides 101",
    icon: <BookOpen size={32} />,
    content: "Peptides are short chains of amino acids — the same building blocks your body already uses. Researchers have isolated specific sequences that can signal your body to heal faster, burn fat, or reduce inflammation. They are not steroids. Most are naturally occurring and simply administered in concentrated form via injection.",
    diagram: {
      type: "chain",
      label: "Amino Acid Chain → Signal → Biological Response",
      items: ["Amino Acids", "→", "Peptide Sequence", "→", "Cell Receptor", "→", "Healing / Fat Loss / Recovery"]
    },
    tip: "Think of peptides as text messages to your cells. Each sequence tells your body to do something specific."
  },
  {
    id: 2,
    title: "How Dosing Works",
    icon: <Syringe size={32} />,
    content: "Peptide doses are measured in micrograms (mcg) or milligrams (mg). 1mg = 1,000mcg. Most peptides are dosed between 100mcg and 500mcg per injection. The dose you draw depends on how much water you added to the vial — this is called the concentration. A higher concentration means you draw less liquid for the same dose.",
    diagram: {
      type: "math",
      label: "Dose Calculation",
      items: ["5mg vial", "+", "2ml water", "=", "2,500mcg/ml", "→", "For 250mcg: draw 0.1ml (10 units)"]
    },
    tip: "Never guess your dose. Always use a calculator to convert mcg into syringe units."
  },
  {
    id: 3,
    title: "How Reconstitution Works",
    icon: <Beaker size={32} />,
    content: "Peptides ship as a freeze-dried powder (lyophilized). You must add bacteriostatic water to dissolve it before use. This is called reconstitution. Aim the water stream at the glass wall of the vial — never spray directly onto the powder. Gently swirl, never shake. The solution should be clear. If it's cloudy, do not use it.",
    diagram: {
      type: "steps",
      label: "Reconstitution Steps",
      items: ["1. Clean vial top with alcohol", "2. Draw bacteriostatic water into syringe", "3. Inject water slowly along glass wall", "4. Swirl gently until fully dissolved", "5. Store refrigerated (2–8°C)"]
    },
    tip: "Go slow. Aggressive mixing can damage the peptide structure and reduce effectiveness."
  },
  {
    id: 4,
    title: "How to Read a Vial Label",
    icon: <Tag size={32} />,
    content: "Every vial label tells you two critical things: the compound name and the total amount in milligrams. For example, 'BPC-157 5mg' means the vial contains 5 milligrams of BPC-157 in powder form. Some labels also show a lot number (for tracking) and an expiry date. Always verify the compound name matches what you ordered.",
    diagram: {
      type: "label",
      label: "Reading a Vial Label",
      items: ["Compound: BPC-157", "Amount: 5mg", "Lot: #A2024-0331", "Exp: 2027-03", "Form: Lyophilized Powder"]
    },
    tip: "Photograph every vial label before use. This helps you track batches if you ever need to report a side effect."
  },
  {
    id: 5,
    title: "How to Log Safely",
    icon: <ClipboardList size={32} />,
    content: "Logging is how you know if something is working — or if something is wrong. Every time you inject, record: the date, compound, dose, injection site, and how you feel. Track side effects immediately, even mild ones like redness or nausea. Over time, your log becomes the single most valuable tool for adjusting your protocol.",
    diagram: {
      type: "log",
      label: "What to Log Every Time",
      items: ["Date & Time", "Compound & Dose", "Injection Site (rotate!)", "Side Effects (even mild)", "Energy / Sleep / Mood Score"]
    },
    tip: "Consistency matters more than detail. A simple log every day beats a detailed log once a week."
  },
  {
    id: 6,
    title: "How to Spot Risky Sources",
    icon: <ShieldAlert size={32} />,
    content: "Not all peptide vendors are trustworthy. Legitimate sources provide third-party testing certificates (COAs), list purity percentages (99%+ is standard), and use proper cold-chain shipping. Red flags include: no COA available, prices significantly below market, vague labeling, no customer service, and aggressive marketing with fake urgency or scarcity tactics.",
    diagram: {
      type: "compare",
      label: "Red Flags vs. Green Flags",
      items: [
        { bad: "No third-party COA", good: "Published COA per batch" },
        { bad: "Prices 50%+ below market", good: "Competitive but realistic pricing" },
        { bad: "Vague or missing labels", good: "Clear compound, mg, lot number" },
        { bad: "\"Limited stock!\" pressure", good: "Transparent inventory" }
      ]
    },
    tip: "If a deal looks too good to be true, it probably is. Your health is not worth saving $20."
  }
];

export default function Learn() {
  const navigate = useNavigate();
  const [currentLesson, setCurrentLesson] = useState(0);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'lesson'
  
  const lesson = lessons[currentLesson];
  const progress = ((currentLesson + 1) / lessons.length) * 100;

  const goNext = () => {
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    }
  };

  const goPrev = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="p-lg pt-xl flex-col gap-lg animate-fade-in pb-xl">
        <div className="flex items-center gap-md mb-sm">
          <button className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/5 text-white cursor-pointer" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Peptides 101</h1>
        </div>
        <p className="text-secondary text-sm px-xs leading-relaxed">Six short lessons to get you from zero to confident. Each takes about 60–90 seconds.</p>
        
        <div className="flex-col gap-sm mt-md">
          {lessons.map((l, i) => (
            <div 
              key={l.id} 
              className="glass-card flex items-center gap-md cursor-pointer hover:bg-white/5 transition-colors border-white/5"
              style={{ padding: '20px' }}
              onClick={() => { setCurrentLesson(i); setViewMode('lesson'); }}
            >
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0 text-accent-light">
                {l.icon ? React.cloneElement(l.icon, { size: 20 }) : <BookOpen size={20} />}
              </div>
              <div className="flex-col flex-1">
                <span className="font-medium text-white text-[15px]">Lesson {l.id}</span>
                <span className="text-sm text-secondary mt-[2px]">{l.title}</span>
              </div>
              <ChevronRight size={18} className="text-secondary opacity-40" />
            </div>
          ))}
        </div>
        <div style={{ height: '100px' }}></div>
      </div>
    );
  }

  return (
    <div className="flex-col h-full animate-fade-in" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between p-lg pt-xl">
        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/5 text-white cursor-pointer" onClick={() => setViewMode('list')}>
          <ArrowLeft size={16} />
        </button>
        <span className="text-[10px] font-bold uppercase tracking-widest text-accent-light">
          Lesson {lesson.id} of {lessons.length}
        </span>
        <button 
          className="text-xs text-secondary bg-transparent border-none cursor-pointer font-medium"
          onClick={() => navigate('/app/calculator')}
        >
          Skip All
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-lg mt-sm">
        <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500" 
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent-dark), var(--accent-light))' }}
          ></div>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar p-lg flex-col gap-lg mt-md pb-[200px]">
        <div className="flex items-center gap-md text-accent-light">
          {lesson.icon}
          <h2 className="text-3xl font-light text-white tracking-tight">{lesson.title}</h2>
        </div>
        
        <p className="text-[15px] text-white leading-relaxed opacity-90 mt-sm">{lesson.content}</p>

        {/* Diagram / Visual */}
        <div className="glass-card flex-col gap-md mt-md border-white/5" style={{ background: '#0d0d0f', padding: '24px' }}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent-light mb-xs">{lesson.diagram.label}</span>
          
          {lesson.diagram.type === 'compare' ? (
            <div className="flex-col gap-sm">
              {lesson.diagram.items.map((item, i) => (
                <div key={i} className="flex gap-sm">
                  <div className="flex-1 bg-danger/10 border border-danger/20 rounded-lg p-sm">
                    <span className="text-xs text-danger font-medium">✗ {item.bad}</span>
                  </div>
                  <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-lg p-sm" style={{ background: 'rgba(50,215,75,0.1)', borderColor: 'rgba(50,215,75,0.2)' }}>
                    <span className="text-xs font-medium" style={{ color: '#32d74b' }}>✓ {item.good}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : lesson.diagram.type === 'steps' || lesson.diagram.type === 'log' ? (
            <div className="flex-col gap-xs">
              {lesson.diagram.items.map((item, i) => (
                <div key={i} className="flex items-start gap-sm py-[6px] border-b border-white/5 last:border-b-0" style={{ borderBottom: i < lesson.diagram.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-[1px]">
                    <span className="text-[10px] font-bold text-accent-light">{i + 1}</span>
                  </div>
                  <span className="text-sm text-white/80">{item.replace(/^\d+\.\s*/, '')}</span>
                </div>
              ))}
            </div>
          ) : lesson.diagram.type === 'label' ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-md flex-col gap-xs">
              {lesson.diagram.items.map((item, i) => (
                <div key={i} className="flex items-center gap-sm">
                  <span className="text-[11px] text-secondary w-[80px] flex-shrink-0">{item.split(':')[0]}:</span>
                  <span className="text-sm text-white font-medium">{item.split(':').slice(1).join(':').trim()}</span>
                </div>
              ))}
            </div>
          ) : (
            /* chain / math diagrams */
            <div className="flex flex-wrap items-center gap-xs">
              {lesson.diagram.items.map((item, i) => (
                <span 
                  key={i} 
                  className={item === '→' || item === '+' || item === '=' 
                    ? 'text-accent-light text-lg font-light px-xs' 
                    : 'bg-white/5 border border-white/10 rounded-lg px-sm py-xs text-xs text-white font-medium'}
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pro Tip */}
        <div className="flex items-start gap-md bg-accent/10 border border-accent/20 rounded-xl p-md mt-sm">
          <span className="text-accent-light text-lg mt-[-2px]">💡</span>
          <p className="text-sm text-white/80 leading-relaxed">{lesson.tip}</p>
        </div>
      </div>

      {/* Bottom Controls - Fixed */}
      <div className="flex-col gap-sm p-lg pb-xl" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: '500px', margin: '0 auto', background: 'linear-gradient(to top, var(--bg-primary) 70%, transparent)', paddingTop: '40px' }}>
        <div className="flex gap-sm">
          {currentLesson > 0 && (
            <button className="btn-glass flex items-center justify-center px-md" onClick={goPrev} style={{ flex: '0 0 auto', padding: '16px 20px' }}>
              <ArrowLeft size={18} />
            </button>
          )}
          {currentLesson < lessons.length - 1 ? (
            <button className="btn-primary flex-1 shadow-2xl" onClick={goNext} style={{ padding: '16px' }}>
              Next Lesson <ArrowRight size={18} />
            </button>
          ) : (
            <button className="btn-primary flex-1 shadow-2xl" onClick={() => navigate('/app/calculator')} style={{ padding: '16px', background: 'var(--accent)', color: '#fff' }}>
              Try It Now — Open Calculator
            </button>
          )}
        </div>
        <button 
          className="w-full text-center text-xs text-secondary bg-transparent border-none cursor-pointer py-sm font-medium"
          onClick={() => navigate('/app/calculator')}
        >
          Skip to Calculator →
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
