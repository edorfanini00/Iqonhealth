import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, Alert, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth';
import { Colors, Shadows } from '@/constants/theme';
import { CheckCircle, ChevronRight, Shield, Bell, LogIn, Users, Plus, Scale, Activity, Sparkles, FlaskConical } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { ScrollPicker } from '@/components/onboarding/Pickers';
import { CircularProgress } from '@/components/onboarding/CircularProgress';

// ── Constants ─────────────────────────────────────────────────
const EXPERIENCE = [
  { id: 'researching', label: 'Researching / Learning', desc: "I'm learning about peptides and considering starting.", icon: '🍃' },
  { id: 'first_protocol', label: 'Running my first protocol', desc: "I've started or about to start my first peptide.", icon: '🔥' },
  { id: 'experienced', label: 'Experienced', desc: "I've run multiple protocols and know my way around.", icon: '⚡' },
];
const COMPOUNDS = ['BPC-157','TB-500','Semaglutide','Tirzepatide','Retatrutide','GHK-Cu','CJC-1295','Ipamorelin','PT-141','Selank','Sermorelin','MK-677','AOD-9604','Tesamorelin','Other'];
const GOALS = [
  { id: 'recovery', label: 'Recovery & Healing', desc: 'Injury recovery, tissue repair, joint health', Icon: Plus },
  { id: 'weight', label: 'Weight Management', desc: 'Fat loss, appetite regulation, metabolic support', Icon: Scale },
  { id: 'performance', label: 'Performance & Muscle', desc: 'Strength, hypertrophy, athletic performance', Icon: Activity },
  { id: 'longevity', label: 'Longevity & Wellness', desc: 'Anti-aging, cognitive function, overall health', Icon: Sparkles },
  { id: 'hormone', label: 'Hormone Optimization', desc: 'TRT support, GH secretagogues, hormonal balance', Icon: FlaskConical },
];
const HEIGHTS = Array.from({length:37},(_,i)=>{const ft=Math.floor((i+48)/12);const inch=(i+48)%12;return `${ft}'${inch}"`;});
const WEIGHTS = Array.from({length:321},(_,i)=>`${i+80} lbs`);
const SEX_OPTIONS = ['Male','Female','Other'];
const FREQ_OPTIONS = ['Once Daily','Twice Daily','Every Other Day','3× Weekly','Twice Weekly','Once Weekly'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const HOURS = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const MINUTES = ['00','15','30','45'];

type CompoundSetup = {
  started: boolean|null;
  vialMg: string;
  doseMcg: string;
  frequency: string;
  days: string[];
  hour: string;
  minute: string;
  period: 'AM'|'PM';
};

const defaultSetup = (): CompoundSetup => ({
  started: null, vialMg: '', doseMcg: '', frequency: 'Once Daily',
  days: [], hour: '9', minute: '00', period: 'AM',
});

const needsDays = (f: string) => ['3× Weekly','Twice Weekly','Once Weekly'].includes(f);

export default function Onboarding() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [experience, setExperience] = useState('');
  const [compounds, setCompounds] = useState<string[]>([]);
  const [noneYet, setNoneYet] = useState(false);
  const [goal, setGoal] = useState('');
  const [height, setHeight] = useState("5'9\"");
  const [weight, setWeight] = useState('170 lbs');
  const [sex, setSex] = useState('');
  const [cIdx, setCIdx] = useState(0);
  const [cPhase, setCPhase] = useState<'vial'|'setup'>('vial');
  const [setups, setSetups] = useState<Record<string,CompoundSetup>>({});
  const [progress, setProgress] = useState(0);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

  const LOADING_MESSAGES = [
    'Setting up your tracker...',
    'Building your protocol dashboard...',
    'Calibrating dose calculations...',
    'Syncing your compounds...',
    'Personalizing your experience...',
    'Almost ready...',
  ];

  const activeCompounds = noneYet ? [] : compounds;
  const inCompoundPhase = step === 6 && activeCompounds.length > 0;
  const totalSteps = 9 + activeCompounds.length * 2;

  const getProgress = () => {
    if (step < 6) return ((step + 1) / totalSteps) * 100;
    if (step === 6) {
      const done = cIdx * 2 + (cPhase === 'setup' ? 1 : 0);
      return ((6 + done + 1) / totalSteps) * 100;
    }
    const compDone = activeCompounds.length * 2;
    return ((6 + compDone + (step - 5)) / totalSteps) * 100;
  };

  const fade = (cb: () => void) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      cb();
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    });
  };

  const goNext = () => fade(() => setStep(s => s + 1));

  const goNextCompound = () => {
    if (cPhase === 'vial') {
      fade(() => setCPhase('setup'));
    } else {
      if (cIdx < activeCompounds.length - 1) {
        fade(() => { setCIdx(i => i + 1); setCPhase('vial'); });
      } else {
        fade(() => setStep(7));
      }
    }
  };

  const updateSetup = (compound: string, patch: Partial<CompoundSetup>) => {
    setSetups(prev => ({ ...prev, [compound]: { ...(prev[compound] || defaultSetup()), ...patch } }));
  };

  const toggleCompound = (c: string) => { setNoneYet(false); setCompounds(p => p.includes(c) ? p.filter(x=>x!==c) : [...p,c]); };
  const toggleDay = (compound: string, d: string) => {
    const cur = setups[compound]?.days || [];
    updateSetup(compound, { days: cur.includes(d) ? cur.filter(x=>x!==d) : [...cur,d] });
  };

  const handleNext = () => {
    if (step === 5 && activeCompounds.length === 0) { fade(() => setStep(7)); return; }
    if (step === 6) { goNextCompound(); return; }
    goNext();
  };

  const requestReminders = async () => {
    try {
      await Notifications.requestPermissionsAsync();
    } catch (_) {}
    startLoading();
  };

  const startLoading = () => {
    setStep(8);
    setProgress(0);
    setLoadingMsg(0);

    // Pulse dot animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    let p = 0;
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = Math.min(msgIdx + 1, 5);
      setLoadingMsg(msgIdx);
    }, 400);

    const interval = setInterval(() => {
      p += 1;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        clearInterval(msgInterval);
        dotAnim.stopAnimation();
        setTimeout(async () => {
          await AsyncStorage.setItem('@iqon_display_name', name.trim() || 'User');
          await AsyncStorage.setItem('@iqon_onboarding_setup', JSON.stringify(setups));
          await completeOnboarding();
          router.replace('/(tabs)');
        }, 300);
      }
    }, 25);
  };

  const compound = activeCompounds[cIdx];
  const setup = setups[compound] || defaultSetup();

  const renderStep = () => {
    // Step 0: Privacy
    if (step === 0) return (
      <View style={s.center}>
        <View style={s.shieldCircle}><Shield size={38} color={Colors.textPrimary} /></View>
        <Text style={s.title}>Your information{'\n'}stays with you.</Text>
        <Text style={s.desc}>Everything you enter — your protocols, doses, and body stats — is stored only on your device. Nothing is shared, sold, or stored on external servers.</Text>
        <View style={s.privacyCards}>
          {[{Icon:LogIn,t:'On-device only',d:'Your data never leaves your phone. No cloud, no servers.'},{Icon:Users,t:'No accounts required',d:'No email, no login, no tracking by default.'},{Icon:Shield,t:'No data selling. Ever.',d:'We earn from subscriptions, not your health data.'}].map(({Icon,t,d},i)=>(
            <View key={i} style={s.privacyRow}>
              <View style={s.privacyIcon}><Icon size={16} color={Colors.textPrimary} /></View>
              <View style={{flex:1}}><Text style={s.privacyTitle}>{t}</Text><Text style={s.privacyDesc}>{d}</Text></View>
            </View>
          ))}
        </View>
        <TouchableOpacity style={s.btn} onPress={goNext} activeOpacity={0.85}>
          <Text style={s.btnText}>I understand</Text><ChevronRight size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    );

    // Step 1: Name
    if (step === 1) return (
      <View style={s.center}>
        <View style={s.avatarCircle}><Text style={s.avatarLetter}>{name.trim() ? name.trim()[0].toUpperCase() : '?'}</Text></View>
        <Text style={s.title}>What should we{'\n'}call you?</Text>
        <TextInput style={s.input} placeholder="Your name..." placeholderTextColor={Colors.grey400} value={name} onChangeText={setName} autoCapitalize="words" returnKeyType="done" />
        <TouchableOpacity style={[s.btn, !name.trim() && s.btnOff]} onPress={goNext} disabled={!name.trim()} activeOpacity={0.85}>
          <Text style={s.btnText}>Continue</Text><ChevronRight size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    );

    // Step 2: Experience
    if (step === 2) return (
      <View style={s.center}>
        <Text style={s.title}>How experienced{'\n'}are you?</Text>
        <View style={{gap:10,width:'100%'}}>
          {EXPERIENCE.map(e=>{const sel=experience===e.id;return(
            <TouchableOpacity key={e.id} style={[s.card,sel&&s.cardSel]} onPress={()=>setExperience(e.id)} activeOpacity={0.7}>
              <View style={s.cardIcon}><Text style={{fontSize:20}}>{e.icon}</Text></View>
              <View style={{flex:1}}><Text style={s.cardLabel}>{e.label}</Text><Text style={s.cardDesc}>{e.desc}</Text></View>
              {sel&&<CheckCircle size={20} color={Colors.success}/>}
            </TouchableOpacity>
          );})}
        </View>
        <TouchableOpacity style={[s.btn,s.btnMt,!experience&&s.btnOff]} onPress={goNext} disabled={!experience} activeOpacity={0.85}>
          <Text style={s.btnText}>Continue</Text><ChevronRight size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    );

    // Step 3: Compounds
    if (step === 3) return (
      <ScrollView style={{flex:1}} showsVerticalScrollIndicator={false}>
        <View style={s.slideContentTop}>
          <Text style={s.title}>What are you{'\n'}currently using?</Text>
          <Text style={s.desc}>Select individual compounds. You can build stacks once you're in the app.</Text>
          <View style={s.chipGrid}>
            {COMPOUNDS.map(c=>{const sel=compounds.includes(c);return(
              <TouchableOpacity key={c} style={[s.chip,sel&&s.chipSel]} onPress={()=>toggleCompound(c)} activeOpacity={0.7}>
                <Text style={[s.chipText,sel&&s.chipTextSel]}>{c}</Text>
              </TouchableOpacity>
            );})}
          </View>
          <TouchableOpacity style={[s.noneBtn,noneYet&&s.noneBtnSel]} onPress={()=>{setCompounds([]);setNoneYet(true);}} activeOpacity={0.7}>
            <Text style={[s.noneText,noneYet&&{color:Colors.textPrimary,fontWeight:'700'}]}>None yet</Text>
          </TouchableOpacity>
        </View>
        <View style={{paddingHorizontal:28,paddingBottom:40,paddingTop:12}}>
          <TouchableOpacity style={[s.btn,(compounds.length===0&&!noneYet)&&s.btnOff]} onPress={goNext} disabled={compounds.length===0&&!noneYet} activeOpacity={0.85}>
            <Text style={s.btnText}>Continue</Text><ChevronRight size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );

    // Step 4: Goal
    if (step === 4) return (
      <ScrollView style={{flex:1}} showsVerticalScrollIndicator={false}>
        <View style={s.slideContentTop}>
          <Text style={s.title}>What's your{'\n'}primary goal?</Text>
          <View style={{gap:10,width:'100%'}}>
            {GOALS.map(({id,label,desc,Icon})=>{const sel=goal===id;return(
              <TouchableOpacity key={id} style={[s.card,sel&&s.cardSel]} onPress={()=>setGoal(id)} activeOpacity={0.7}>
                <View style={[s.cardIcon,sel&&{backgroundColor:'rgba(52,199,89,0.1)'}]}><Icon size={18} color={sel?Colors.success:Colors.textSecondary}/></View>
                <View style={{flex:1}}><Text style={s.cardLabel}>{label}</Text><Text style={s.cardDesc}>{desc}</Text></View>
                {sel&&<CheckCircle size={20} color={Colors.success}/>}
              </TouchableOpacity>
            );})}
          </View>
        </View>
        <View style={{paddingHorizontal:28,paddingBottom:40,paddingTop:12}}>
          <TouchableOpacity style={[s.btn,!goal&&s.btnOff]} onPress={goNext} disabled={!goal} activeOpacity={0.85}>
            <Text style={s.btnText}>Continue</Text><ChevronRight size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );

    // Step 5: Stats
    if (step === 5) return (
      <View style={s.center}>
        <Text style={s.title}>Your stats</Text>
        <Text style={s.desc}>Used to personalize your dose recommendations.</Text>
        <View style={{flexDirection:'row',gap:16,width:'100%',marginBottom:24}}>
          <View style={{flex:1,alignItems:'center'}}>
            <Text style={s.pickerLabel}>HEIGHT</Text>
            <View style={s.pickerBox}><ScrollPicker items={HEIGHTS} value={height} onChange={setHeight}/></View>
          </View>
          <View style={{flex:1,alignItems:'center'}}>
            <Text style={s.pickerLabel}>WEIGHT</Text>
            <View style={s.pickerBox}><ScrollPicker items={WEIGHTS} value={weight} onChange={setWeight}/></View>
          </View>
        </View>
        <Text style={s.pickerLabel}>BIOLOGICAL SEX</Text>
        <View style={{flexDirection:'row',gap:10,width:'100%',marginBottom:28}}>
          {SEX_OPTIONS.map(o=>(
            <TouchableOpacity key={o} style={[s.sexBtn,sex===o&&s.sexBtnSel]} onPress={()=>setSex(o)} activeOpacity={0.7}>
              <Text style={[s.sexText,sex===o&&s.sexTextSel]}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={[s.btn,!sex&&s.btnOff]} onPress={handleNext} disabled={!sex} activeOpacity={0.85}>
          <Text style={s.btnText}>Continue</Text><ChevronRight size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    );

    // Step 6: Per-compound (vial started + setup)
    if (step === 6 && activeCompounds.length > 0) {
      if (cPhase === 'vial') return (
        <View style={s.center}>
          <Text style={s.compoundBadge}>{compound}</Text>
          <Text style={s.title}>Have you already{'\n'}started this vial?</Text>
          <View style={{gap:12,width:'100%'}}>
            {[{val:true,label:'Yes, it\'s partially used',desc:'I\'ve already drawn from this vial.'},{val:false,label:'No, it\'s brand new',desc:'The vial is still sealed and full.'}].map(opt=>{
              const sel=setup.started===opt.val;
              return(
                <TouchableOpacity key={String(opt.val)} style={[s.card,sel&&s.cardSel]} onPress={()=>{updateSetup(compound,{started:opt.val});}} activeOpacity={0.7}>
                  <View style={{flex:1}}><Text style={s.cardLabel}>{opt.label}</Text><Text style={s.cardDesc}>{opt.desc}</Text></View>
                  {sel&&<CheckCircle size={20} color={Colors.success}/>}
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity style={[s.btn,s.btnMt,setup.started===null&&s.btnOff]} onPress={goNextCompound} disabled={setup.started===null} activeOpacity={0.85}>
            <Text style={s.btnText}>Continue</Text><ChevronRight size={18} color="#FFF"/>
          </TouchableOpacity>
        </View>
      );

      // Peptide setup
      return (
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
          <ScrollView style={{flex:1}} showsVerticalScrollIndicator={false}>
            <View style={s.slideContentTop}>
              <Text style={s.compoundBadge}>{compound}</Text>
              <Text style={s.title}>Set up your{'\n'}protocol</Text>
              <View style={s.setupCard}>
                <Text style={s.setupLabel}>VIAL SIZE (mg)</Text>
                <TextInput style={s.setupInput} placeholder="e.g. 5" placeholderTextColor={Colors.grey400} value={setup.vialMg} onChangeText={v=>updateSetup(compound,{vialMg:v})} keyboardType="decimal-pad"/>
              </View>
              <View style={s.setupCard}>
                <Text style={s.setupLabel}>YOUR DOSE (mcg)</Text>
                <TextInput style={s.setupInput} placeholder="e.g. 250" placeholderTextColor={Colors.grey400} value={setup.doseMcg} onChangeText={v=>updateSetup(compound,{doseMcg:v})} keyboardType="decimal-pad"/>
              </View>
              <View style={s.setupCard}>
                <Text style={s.setupLabel}>FREQUENCY</Text>
                <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:6}}>
                  {FREQ_OPTIONS.map(f=>(
                    <TouchableOpacity key={f} style={[s.chip,setup.frequency===f&&s.chipSel]} onPress={()=>updateSetup(compound,{frequency:f,days:[]})} activeOpacity={0.7}>
                      <Text style={[s.chipText,setup.frequency===f&&s.chipTextSel]}>{f}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {needsDays(setup.frequency)&&(
                <View style={s.setupCard}>
                  <Text style={s.setupLabel}>INJECTION DAYS</Text>
                  <View style={{flexDirection:'row',gap:6,marginTop:6,flexWrap:'wrap'}}>
                    {DAYS.map(d=>{const sel=(setup.days||[]).includes(d);return(
                      <TouchableOpacity key={d} style={[s.dayBtn,sel&&s.dayBtnSel]} onPress={()=>toggleDay(compound,d)} activeOpacity={0.7}>
                        <Text style={[s.dayText,sel&&s.dayTextSel]}>{d}</Text>
                      </TouchableOpacity>
                    );})}
                  </View>
                </View>
              )}
              <View style={s.setupCard}>
                <Text style={s.setupLabel}>INJECTION TIME</Text>
                <View style={{flexDirection:'row',alignItems:'center',gap:8,marginTop:6}}>
                  <View style={{flex:1}}><ScrollPicker items={HOURS} value={setup.hour} onChange={v=>updateSetup(compound,{hour:v})}/></View>
                  <Text style={{fontSize:22,fontWeight:'700',color:Colors.textPrimary}}>:</Text>
                  <View style={{flex:1}}><ScrollPicker items={MINUTES} value={setup.minute} onChange={v=>updateSetup(compound,{minute:v})}/></View>
                  <View style={{gap:6}}>
                    {(['AM','PM'] as const).map(p=>(
                      <TouchableOpacity key={p} style={[s.periodBtn,setup.period===p&&s.periodBtnSel]} onPress={()=>updateSetup(compound,{period:p})} activeOpacity={0.7}>
                        <Text style={[s.periodText,setup.period===p&&s.periodTextSel]}>{p}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>
            <View style={{paddingHorizontal:28,paddingBottom:40,paddingTop:12}}>
              <TouchableOpacity style={[s.btn,(!setup.vialMg||!setup.doseMcg)&&s.btnOff]} onPress={goNextCompound} disabled={!setup.vialMg||!setup.doseMcg} activeOpacity={0.85}>
                <Text style={s.btnText}>{cIdx<activeCompounds.length-1?`Next: ${activeCompounds[cIdx+1]}`:'Continue'}</Text><ChevronRight size={18} color="#FFF"/>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      );
    }

    // Step 7: Reminders
    if (step === 7) return (
      <View style={s.center}>
        <View style={s.shieldCircle}><Bell size={38} color={Colors.textPrimary}/></View>
        <Text style={s.title}>Never miss{'\n'}a dose.</Text>
        <Text style={s.desc}>Allow IQON to send you reminders at your scheduled injection times. You can adjust or disable these anytime in settings.</Text>
        <TouchableOpacity style={s.btn} onPress={requestReminders} activeOpacity={0.85}>
          <Bell size={16} color="#FFF"/><Text style={s.btnText}>Enable Reminders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.skipBtn} onPress={startLoading} activeOpacity={0.7}>
          <Text style={s.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    );

    // Step 8: Loading
    if (step === 8) return (
      <View style={s.center}>
        <CircularProgress progress={progress}/>
        <Animated.Text style={[s.loadingMsg, { opacity: dotAnim.interpolate({ inputRange:[0,1], outputRange:[0.5,1] }) }]}>
          {LOADING_MESSAGES[loadingMsg]}
        </Animated.Text>
        <Text style={s.loadingSubMsg}>{Math.round(progress)}% complete</Text>
      </View>
    );

    return null;
  };

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
      <View style={s.container}>
        <View style={s.progressWrap}>
          <Animated.View style={[s.progressBar,{width:`${getProgress()}%`}]}/>
        </View>
        <Animated.View style={[{flex:1},{ opacity: fadeAnim }]}>
          {renderStep()}
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:Colors.bgPrimary,paddingTop:60},
  progressWrap:{height:3,backgroundColor:'rgba(200,205,210,0.35)',marginHorizontal:28,borderRadius:2,marginBottom:24},
  progressBar:{height:3,backgroundColor:Colors.textPrimary,borderRadius:2},
  center:{flex:1,paddingHorizontal:28,paddingBottom:40,justifyContent:'center',alignItems:'center'},
  slideContentTop:{paddingTop:8,paddingHorizontal:28,alignItems:'center'},
  title:{fontSize:28,fontWeight:'700',color:Colors.textPrimary,textAlign:'center',letterSpacing:-0.5,lineHeight:34,marginBottom:12},
  desc:{fontSize:15,color:Colors.textSecondary,textAlign:'center',lineHeight:22,marginBottom:24,paddingHorizontal:8},
  avatarCircle:{width:72,height:72,borderRadius:36,backgroundColor:Colors.cardDark,alignItems:'center',justifyContent:'center',marginBottom:24},
  avatarLetter:{fontSize:28,fontWeight:'700',color:'#FFF'},
  input:{width:'100%',height:52,backgroundColor:Colors.panelBg,borderRadius:14,paddingHorizontal:18,fontSize:16,color:Colors.textPrimary,borderWidth:1.5,borderColor:'rgba(200,205,210,0.4)',marginBottom:28,...Shadows.card},
  shieldCircle:{width:80,height:80,borderRadius:40,backgroundColor:'rgba(30,36,41,0.06)',alignItems:'center',justifyContent:'center',marginBottom:20},
  privacyCards:{gap:14,width:'100%',marginBottom:28},
  privacyRow:{flexDirection:'row',alignItems:'flex-start',gap:14},
  privacyIcon:{width:36,height:36,borderRadius:10,backgroundColor:Colors.panelBg,borderWidth:1,borderColor:'rgba(200,205,210,0.4)',alignItems:'center',justifyContent:'center'},
  privacyTitle:{fontSize:14,fontWeight:'700',color:Colors.textPrimary,marginBottom:2},
  privacyDesc:{fontSize:12,color:Colors.textSecondary,lineHeight:17},
  card:{backgroundColor:Colors.panelBg,borderRadius:20,padding:16,flexDirection:'row',alignItems:'center',gap:12,borderWidth:1.5,borderColor:'rgba(200,205,210,0.4)',width:'100%',...Shadows.card},
  cardSel:{borderColor:Colors.success,backgroundColor:'rgba(52,199,89,0.05)'},
  cardIcon:{width:40,height:40,borderRadius:12,backgroundColor:'rgba(200,205,210,0.2)',alignItems:'center',justifyContent:'center'},
  cardLabel:{fontSize:15,fontWeight:'600',color:Colors.textPrimary,marginBottom:2},
  cardDesc:{fontSize:12,color:Colors.textSecondary,lineHeight:17},
  chipGrid:{flexDirection:'row',flexWrap:'wrap',gap:8,justifyContent:'center',width:'100%',marginBottom:14},
  chip:{backgroundColor:Colors.panelBg,borderRadius:12,paddingHorizontal:14,paddingVertical:9,borderWidth:1.5,borderColor:'rgba(200,205,210,0.4)'},
  chipSel:{backgroundColor:Colors.cardDark,borderColor:Colors.cardDark},
  chipText:{fontSize:13,fontWeight:'500',color:Colors.textPrimary},
  chipTextSel:{color:'#FFF',fontWeight:'600'},
  noneBtn:{borderWidth:1.5,borderColor:'rgba(200,205,210,0.4)',borderRadius:999,paddingHorizontal:24,paddingVertical:10,marginTop:4},
  noneBtnSel:{borderColor:Colors.textPrimary},
  noneText:{fontSize:14,color:Colors.textSecondary,textAlign:'center'},
  pickerLabel:{fontSize:10,fontWeight:'700',color:Colors.textSecondary,letterSpacing:2,marginBottom:8},
  pickerBox:{backgroundColor:Colors.panelBg,borderRadius:16,borderWidth:1,borderColor:'rgba(200,205,210,0.4)',overflow:'hidden',width:'100%'},
  sexBtn:{flex:1,paddingVertical:14,borderRadius:14,backgroundColor:Colors.panelBg,borderWidth:1.5,borderColor:'rgba(200,205,210,0.4)',alignItems:'center'},
  sexBtnSel:{backgroundColor:Colors.cardDark,borderColor:Colors.cardDark},
  sexText:{fontSize:14,fontWeight:'600',color:Colors.textSecondary},
  sexTextSel:{color:'#FFF'},
  compoundBadge:{backgroundColor:Colors.cardDark,borderRadius:20,paddingHorizontal:14,paddingVertical:6,color:'#FFF',fontSize:12,fontWeight:'700',letterSpacing:1,marginBottom:16,overflow:'hidden'},
  setupCard:{width:'100%',backgroundColor:Colors.panelBg,borderRadius:16,padding:16,marginBottom:12,borderWidth:1,borderColor:'rgba(200,205,210,0.4)',...Shadows.card},
  setupLabel:{fontSize:10,fontWeight:'700',color:Colors.textSecondary,letterSpacing:2},
  setupInput:{height:44,borderRadius:10,backgroundColor:'rgba(200,205,210,0.15)',paddingHorizontal:14,fontSize:16,color:Colors.textPrimary,marginTop:6,borderWidth:1,borderColor:'rgba(200,205,210,0.3)'},
  dayBtn:{paddingHorizontal:10,paddingVertical:8,borderRadius:10,backgroundColor:'rgba(200,205,210,0.2)',borderWidth:1.5,borderColor:'rgba(200,205,210,0.3)'},
  dayBtnSel:{backgroundColor:Colors.cardDark,borderColor:Colors.cardDark},
  dayText:{fontSize:12,fontWeight:'600',color:Colors.textSecondary},
  dayTextSel:{color:'#FFF'},
  periodBtn:{paddingHorizontal:12,paddingVertical:8,borderRadius:10,backgroundColor:'rgba(200,205,210,0.2)',borderWidth:1.5,borderColor:'rgba(200,205,210,0.3)'},
  periodBtnSel:{backgroundColor:Colors.cardDark,borderColor:Colors.cardDark},
  periodText:{fontSize:13,fontWeight:'600',color:Colors.textSecondary},
  periodTextSel:{color:'#FFF'},
  btn:{flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:Colors.cardDark,borderRadius:16,height:56,gap:8,width:'100%',...Shadows.button},
  btnMt:{marginTop:28},
  btnOff:{opacity:0.3},
  btnText:{fontSize:17,fontWeight:'600',color:'#FFF'},
  skipBtn:{marginTop:16,paddingVertical:8},
  skipText:{fontSize:13,color:Colors.textSecondary,textDecorationLine:'underline'},
  loadingMsg:{fontSize:18,fontWeight:'600',color:Colors.textPrimary,textAlign:'center',marginTop:32,paddingHorizontal:24},
  loadingSubMsg:{fontSize:13,color:Colors.textSecondary,marginTop:8,textAlign:'center'},
});
