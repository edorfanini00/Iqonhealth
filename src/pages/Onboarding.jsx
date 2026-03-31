import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, BookOpen, Target, Activity, CheckCircle, ArrowRight } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('');
  const [exp, setExp] = useState('');

  const finishOnboarding = () => {
    localStorage.setItem('onboardingComplete', 'true');
    navigate('/app/calculator');
  };

  const skipToApp = () => {
    localStorage.setItem('onboardingComplete', 'true');
    navigate('/app/today');
  };

  const nextStep = () => setStep(s => s + 1);

  return (
    <div className="flex-col h-[100vh] w-full" style={{ position: 'absolute', top: 0, left: 0, zIndex: 100, background: 'var(--bg-primary)' }}>
      {step === 0 && (
        <div className="p-lg pt-xl flex-col h-full justify-center gap-lg animate-fade-in relative z-10 w-full max-w-[500px] mx-auto">
          <div className="absolute top-[20%] left-1/2 w-[300px] h-[300px] bg-white/20 blur-[100px] rounded-full translate-x-[-50%]"></div>
          
          <div className="flex-col gap-md relative z-10 items-center justify-center text-center">
            <h1 className="text-5xl font-light text-white tracking-tight">Peptide OS</h1>
            <p className="text-xl text-secondary px-md font-light">One place to learn, calculate, plan, and track.</p>
          </div>
          
          <button className="btn-primary mt-xl w-full shadow-lg" onClick={nextStep} style={{ padding: '18px' }}>
            Get Started
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="p-lg pt-[80px] flex-col h-full gap-lg animate-fade-in w-full max-w-[500px] mx-auto">
          <h2 className="text-3xl font-light px-sm">What's your main goal?</h2>
          
          <div className="flex-col gap-sm mt-md">
            <GoalCard 
              icon={<Target size={24} />} title="Fat Loss" 
              desc="GLP-1s, Tirzepatide, Semaglutide" 
              active={goal === 'fatloss'} 
              onClick={() => { setGoal('fatloss'); nextStep(); }}
            />
            <GoalCard 
              icon={<Activity size={24} />} title="Recovery / Injury" 
              desc="BPC-157, TB-500" 
              active={goal === 'recovery'} 
              onClick={() => { setGoal('recovery'); nextStep(); }}
            />
            <GoalCard 
              icon={<ShieldAlert size={24} />} title="Longevity" 
              desc="Epitalon, MOTS-C" 
              active={goal === 'longevity'} 
              onClick={() => { setGoal('longevity'); nextStep(); }}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="p-lg pt-[80px] flex-col h-full gap-lg animate-fade-in w-full max-w-[500px] mx-auto">
          <h2 className="text-3xl font-light px-sm">Experience Level</h2>
          
          <div className="flex-col gap-sm mt-md">
            <GoalCard 
              title="Beginner" 
              desc="I need help with dosing and reconstitution math." 
              active={exp === 'beginner'} 
              onClick={() => { setExp('beginner'); nextStep(); }}
            />
            <GoalCard 
              title="Intermediate" 
              desc="I know the basics but want to track stacks." 
              active={exp === 'intermediate'} 
              onClick={() => { setExp('intermediate'); nextStep(); }}
            />
            <GoalCard 
              title="Advanced" 
              desc="I run complex cycles and need an OS." 
              active={exp === 'advanced'} 
              onClick={() => { setExp('advanced'); nextStep(); }}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="p-lg pt-[80px] flex-col h-full justify-between animate-fade-in pb-xl w-full max-w-[500px] mx-auto">
           <div className="flex-col gap-md">
             <div className="flex items-center gap-md mb-sm text-white px-xs">
               <ShieldAlert size={36} />
               <h2 className="text-4xl font-light tracking-tight">Safety First</h2>
             </div>
             
             <div className="glass-panel p-md flex-col gap-md border-white/20">
               <p className="font-semibold text-lg text-white">This is not medical advice.</p>
               <p className="text-secondary text-base leading-relaxed">
                 Peptide OS provides calculators and tracking tools. Always operate under clinician supervision.
               </p>
               
               <div className="flex flex-col gap-md mt-sm bg-black/10 p-md rounded-lg border border-white/10">
                 <div className="flex flex-start gap-sm">
                    <input type="checkbox" id="ack1" className="w-6 h-6 mt-[2px] flex-shrink-0" style={{ accentColor: 'var(--btn-bg)', cursor: 'pointer' }} />
                    <label htmlFor="ack1" className="text-sm font-medium text-white leading-tight cursor-pointer pb-[4px]">I am not pregnant or nursing.</label>
                 </div>
                 <div className="flex flex-start gap-sm">
                    <input type="checkbox" id="ack2" className="w-6 h-6 mt-[2px] flex-shrink-0" style={{ accentColor: 'var(--btn-bg)', cursor: 'pointer' }} />
                    <label htmlFor="ack2" className="text-sm font-medium text-white leading-tight cursor-pointer pb-[4px]">I understand the risks of usage.</label>
                 </div>
               </div>
             </div>
           </div>
           
           <button className="btn-primary w-full shadow-lg" onClick={nextStep} style={{ background: '#1c1c1e', padding: '16px' }}>
             I Agree
           </button>
        </div>
      )}

      {step === 4 && exp === 'beginner' && (
        <div className="p-lg pt-[60px] flex-col h-full animate-fade-in pb-xl w-full max-w-[500px] mx-auto">
           <div className="flex justify-between items-center mb-md px-xs">
             <h2 className="text-3xl font-light">Peptides 101</h2>
             <span className="text-xs font-semibold uppercase tracking-wider text-secondary bg-white/10 px-md py-xs rounded-full border border-white/10">Lesson 1</span>
           </div>
           
           <div className="flex-1 overflow-y-auto hide-scrollbar flex-col gap-lg px-xs">
             <div className="glass-card flex-col items-center justify-center py-xl bg-black/5 border-white/10">
               <BookOpen size={48} className="text-white opacity-80 mb-md" />
               <h3 className="text-xl font-medium">How Dosing Works</h3>
             </div>
             
             <p className="text-white text-base leading-relaxed opacity-90">
               Most peptides come as a freeze-dried powder in a vial. You must mix a liquid, usually Bacteriostatic Water, into the vial. This is called <strong className="text-white font-semibold">reconstitution</strong>.
             </p>
             
             <div className="glass-panel p-md border-l-4 border-l-accent border-r-0 border-t-0 border-b-0 rounded-l-none bg-black/10">
                <p className="text-sm text-secondary leading-relaxed">If you add <strong className="text-white">2ml of water</strong> to a <strong className="text-white">5mg vial</strong>, the concentration becomes <strong className="text-white">2.5mg per 1ml</strong>.</p>
             </div>
             
             <p className="text-white text-base leading-relaxed opacity-90 pb-xl">
               Because math is the easiest place to make a mistake, we built a visual calculator. Never guess your syringe units again.
             </p>
           </div>
           
           <button className="btn-primary w-full shadow-2xl mt-auto z-10 relative" onClick={finishOnboarding} style={{ background: '#1c1c1e', padding: '16px' }}>
             Try the Calculator <ArrowRight size={18} />
           </button>
        </div>
      )}
      
      {step === 4 && exp !== 'beginner' && (
         <div className="p-lg pt-[30vh] flex-col h-full animate-fade-in w-full max-w-[500px] mx-auto text-center">
             <CheckCircle size={80} className="text-accent mx-auto mb-lg opacity-80" />
             <h2 className="text-4xl font-light">You're all set</h2>
             <p className="text-secondary mt-md px-lg text-lg">Welcome to Peptide OS. Your secure workspace is ready.</p>
             
             <button className="btn-primary w-full mt-xl shadow-lg" onClick={skipToApp} style={{ padding: '18px', background: '#1c1c1e' }}>
               Enter App
             </button>
         </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

function GoalCard({ icon, title, desc, active, onClick }) {
  return (
    <div 
      className="glass-card flex items-center gap-md cursor-pointer transition-all border"
      onClick={onClick}
      style={{ 
        padding: '24px',
        borderColor: active ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
        background: active ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)',
        transform: active ? 'scale(1.02)' : 'scale(1)'
      }}
    >
      {icon && <div className={`transition-colors ${active ? 'text-accent' : 'text-white opacity-80'}`}>{icon}</div>}
      <div className="flex-col">
        <span className="font-medium text-lg text-white">{title}</span>
        <span className="text-sm text-secondary mt-[4px] leading-snug pr-sm">{desc}</span>
      </div>
    </div>
  );
}
