import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, BookOpen, Target, Activity, HeartPulse, UserCircle, Microscope, Settings, ShoppingBag, Calculator } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  
  // Intake data
  const [goal, setGoal] = useState('');
  const [exp, setExp] = useState('');
  const [firstAction, setFirstAction] = useState('');
  
  // Safety intake
  const [ack1, setAck1] = useState(false);
  const [ack2, setAck2] = useState(false);
  const [medicalDetails, setMedicalDetails] = useState('');

  const finishOnboarding = () => {
    localStorage.setItem('onboardingComplete', 'true');
    localStorage.setItem('userPlan', JSON.stringify({ goal, exp, firstAction, medicalDetails }));
    navigate('/app/' + (firstAction || 'today'));
  };

  const nextStep = () => setStep(s => s + 1);

  return (
    <div className="flex-col h-[100vh] w-full bg-[var(--bg-primary)]" style={{ position: 'absolute', top: 0, left: 0, zIndex: 100 }}>
      {step === 0 && (
        <div className="p-lg pt-xl flex-col h-full justify-center gap-lg animate-fade-in relative z-10 w-full max-w-[500px] mx-auto">
          <div className="absolute top-[20%] left-1/2 w-[300px] h-[300px] bg-white/5 blur-[100px] rounded-full translate-x-[-50%]"></div>
          
          <div className="flex-col gap-md relative z-10 items-center justify-center text-center">
            <h1 className="text-5xl font-light text-white tracking-tight leading-tight">Peptide OS</h1>
            <p className="text-lg text-secondary px-lg font-light leading-relaxed mt-sm">
              One central place to learn, calculate, plan, track, and buy.
            </p>
          </div>
          
          <button className="btn-primary mt-[60px] w-full shadow-2xl" onClick={nextStep} style={{ padding: '18px' }}>
            Get Started
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="p-lg pt-[80px] flex-col h-full gap-lg animate-fade-in w-full max-w-[500px] mx-auto">
          <h2 className="text-3xl font-light px-xs text-white">Choose main goal</h2>
          
          <div className="flex-col gap-sm overflow-y-auto pb-lg hide-scrollbar mt-sm">
            <GoalCard 
              icon={<Target size={24} />} title="Fat Loss" 
              active={goal === 'fat loss'} onClick={() => { setGoal('fat loss'); nextStep(); }}
            />
            <GoalCard 
              icon={<Activity size={24} />} title="Recovery / Injury" 
              active={goal === 'recovery'} onClick={() => { setGoal('recovery'); nextStep(); }}
            />
            <GoalCard 
              icon={<HeartPulse size={24} />} title="Longevity / Biohacking" 
              active={goal === 'longevity'} onClick={() => { setGoal('longevity'); nextStep(); }}
            />
            <GoalCard 
              icon={<Microscope size={24} />} title="GLP-1 / Metabolic Health" 
              active={goal === 'glp-1'} onClick={() => { setGoal('glp-1'); nextStep(); }}
            />
            <GoalCard 
              icon={<UserCircle size={24} />} title="Clinician-Guided Protocol" 
              active={goal === 'clinician'} onClick={() => { setGoal('clinician'); nextStep(); }}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="p-lg pt-[80px] flex-col h-full gap-lg animate-fade-in w-full max-w-[500px] mx-auto">
          <h2 className="text-3xl font-light px-xs text-white">Experience Level</h2>
          
          <div className="flex-col gap-sm mt-sm">
            <GoalCard 
              title="Beginner" 
              desc="I need help with basics and dosing math." 
              active={exp === 'beginner'} onClick={() => { setExp('beginner'); nextStep(); }}
            />
            <GoalCard 
              title="Intermediate" 
              desc="I know the basics but want to track stacks." 
              active={exp === 'intermediate'} onClick={() => { setExp('intermediate'); nextStep(); }}
            />
            <GoalCard 
              title="Advanced" 
              desc="I run complex cycles and need an OS." 
              active={exp === 'advanced'} onClick={() => { setExp('advanced'); nextStep(); }}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="p-lg pt-[80px] flex-col h-full gap-lg animate-fade-in w-full max-w-[500px] mx-auto">
          <h2 className="text-3xl font-light px-xs text-white">What do you want to do first?</h2>
          
          <div className="flex-col gap-sm mt-sm overflow-y-auto pb-lg hide-scrollbar">
            <GoalCard 
              icon={<BookOpen size={24} />} title="Learn Peptides" 
              active={firstAction === 'library'} onClick={() => { setFirstAction('library'); nextStep(); }}
            />
            <GoalCard 
              icon={<Calculator size={24} />} title="Calculate a Dose" 
              active={firstAction === 'calculator'} onClick={() => { setFirstAction('calculator'); nextStep(); }}
            />
            <GoalCard 
              icon={<Settings size={24} />} title="Build a Protocol" 
              active={firstAction === 'protocol-wizard'} onClick={() => { setFirstAction('protocol-wizard'); nextStep(); }}
            />
            <GoalCard 
              icon={<Activity size={24} />} title="Track Existing Protocol" 
              active={firstAction === 'protocols'} onClick={() => { setFirstAction('protocols'); nextStep(); }}
            />
            <GoalCard 
              icon={<ShoppingBag size={24} />} title="Shop Products" 
              active={firstAction === 'shop'} onClick={() => { setFirstAction('shop'); nextStep(); }}
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="p-lg pt-[60px] flex-col h-full justify-between animate-fade-in pb-xl w-full max-w-[500px] mx-auto overflow-y-auto hide-scrollbar">
           <div className="flex-col gap-md">
             <div className="flex items-center gap-md mb-xs text-danger px-xs">
               <ShieldAlert size={36} />
               <h2 className="text-4xl font-light tracking-tight">Safety Screen</h2>
             </div>
             
             <div className="glass-panel p-md flex-col gap-md border-danger/20 bg-[#120808]">
               <p className="font-semibold text-lg text-white">Not Medical Advice.</p>
               <p className="text-secondary text-sm leading-relaxed">
                 Peptide OS provides calculators and tracking tools. We strongly recommend operating entirely under clinician supervision.
               </p>
               
               <div className="flex flex-col gap-md mt-xs bg-black/40 p-md rounded-lg border border-white/5">
                 <div className="flex items-start gap-md">
                    <input type="checkbox" id="ack1" checked={ack1} onChange={e => setAck1(e.target.checked)} className="w-5 h-5 mt-[2px] flex-shrink-0 cursor-pointer" style={{ accentColor: 'var(--accent)' }} />
                    <label htmlFor="ack1" className="text-sm font-medium text-white leading-tight cursor-pointer">I am not pregnant or nursing.</label>
                 </div>
                 <div className="flex items-start gap-md">
                    <input type="checkbox" id="ack2" checked={ack2} onChange={e => setAck2(e.target.checked)} className="w-5 h-5 mt-[2px] flex-shrink-0 cursor-pointer" style={{ accentColor: 'var(--accent)' }} />
                    <label htmlFor="ack2" className="text-sm font-medium text-white leading-tight cursor-pointer">I understand the risks of usage and proceed at my own risk.</label>
                 </div>
               </div>
             </div>

             <div className="flex-col gap-sm px-xs mt-sm">
               <label className="text-secondary text-sm font-medium tracking-wide">Short Intake (Optional)</label>
               <textarea 
                 value={medicalDetails}
                 onChange={e => setMedicalDetails(e.target.value)}
                 className="bg-white/5 text-white min-h-[100px] p-md rounded-lg border border-white/10"
                 placeholder="Please list any allergies, medications, or existing conditions..."
               />
             </div>
           </div>
           
           <button 
             className="btn-primary w-full mt-lg transition-colors" 
             disabled={!ack1 || !ack2}
             onClick={finishOnboarding} 
             style={{ 
               background: (!ack1 || !ack2) ? 'rgba(255,255,255,0.1)' : '#fff', 
               color: (!ack1 || !ack2) ? 'rgba(255,255,255,0.3)' : '#000', 
               padding: '16px' 
             }}
           >
             Save Plan & Enter App
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
        borderColor: active ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
        background: active ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.2)',
        transform: active ? 'scale(1.01)' : 'scale(1)'
      }}
    >
      {icon && <div className={`transition-colors flex-shrink-0 ${active ? 'text-accent' : 'text-secondary'}`}>{icon}</div>}
      <div className="flex-col">
        <span className="font-medium text-lg text-white">{title}</span>
        {desc && <span className="text-sm text-secondary mt-[4px] leading-snug">{desc}</span>}
      </div>
    </div>
  );
}
