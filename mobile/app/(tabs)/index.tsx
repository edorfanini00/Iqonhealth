import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Alert, Image } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Flame, CheckCircle, Activity, AlertTriangle, Scale, Zap, Plus, ArrowUpRight, ChevronRight, Calendar, Clock, Droplets, BookOpen, Sparkles } from 'lucide-react-native';
import Svg, { Circle as SvgCircle, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import { peptidesDB } from '@/data/peptides';
import { getProtocols, getDoseLogs, saveDoseLogs, getVialInventory, saveVialInventory } from '@/utils/storage';
import { isScheduledForDate } from '@/utils/scheduling';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RING_SIZE = 240;
const STROKE_WIDTH = 8;
const RING_RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Helper: build dose info string showing vial content, syringe units, and calculated dose
const doseInfo = (comp) => {
  if (!comp) return '';
  const amt = comp.amount;
  const unit = comp.unit || 'mcg';
  const vialMl = comp.vialSizeMl;
  const doseMl = comp.dosePerUseMl;
  if (!doseMl || !vialMl || !amt) return `${amt} ${unit}`;
  const syringeUnits = Math.round(doseMl * 100);
  // actual dose = (peptide content / bac water volume) * injection volume
  const actualDose = (amt / vialMl) * doseMl;
  // Format nicely: if result < 1, show as mcg
  let doseStr;
  if (unit === 'mg' && actualDose < 1) {
    doseStr = `${Math.round(actualDose * 1000)} mcg`;
  } else {
    doseStr = `${parseFloat(actualDose.toFixed(2))} ${unit}`;
  }
  return `${amt} ${unit} vial · ${syringeUnits} units · ${doseStr}`;
};

export default function Today() {
  const router = useRouter();
  const [todayComps, setTodayComps] = useState([]);
  const [logs, setLogs] = useState({});
  const todayStr = new Date().toISOString().split('T')[0];
  const displayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });

  // Calculate time until next dose from actual protocol schedule
  const [hoursLeft, setHoursLeft] = useState('--');
  const [minsLeft, setMinsLeft] = useState('--');
  const [secsLeft, setSecsLeft] = useState('--');
  const [timeProgress, setTimeProgress] = useState(1); // 1 = full, 0 = time's up
  const [nextTimerComp, setNextTimerComp] = useState(null); // compound the timer is counting to

  useEffect(() => {
    const updateCountdown = () => {
      if (todayComps.length === 0) return;
      
      const now = new Date();
      const currentSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      
      // Find next undone compound's dose time
      const nextUndone = todayComps.find(c => !logs[c.compound]);
      
      if (nextUndone) {
        // There's a pending dose today — count down to it
        let nextDoseSecs = 21 * 3600;
        if (nextUndone.doseTime) {
          const [dh, dm] = nextUndone.doseTime.split(':').map(Number);
          nextDoseSecs = dh * 3600 + (dm || 0) * 60;
        }
        setNextTimerComp(nextUndone);
        
        if (currentSecs >= nextDoseSecs) {
          setHoursLeft('00');
          setMinsLeft('00');
          setSecsLeft('00');
          setTimeProgress(0);
          return;
        }
        
        const diff = nextDoseSecs - currentSecs;
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const sec = diff % 60;
        setHoursLeft(String(h).padStart(2, '0'));
        setMinsLeft(String(m).padStart(2, '0'));
        setSecsLeft(String(sec).padStart(2, '0'));
        
        const totalWindow = Math.min(nextDoseSecs, 12 * 3600);
        const remaining = Math.min(diff, totalWindow);
        setTimeProgress(remaining / totalWindow);
      } else {
        // All today's doses done — count down to tomorrow's first dose
        const sorted = [...todayComps].sort((a, b) => {
          const tA = a.doseTime ? a.doseTime.split(':').map(Number) : [21, 0];
          const tB = b.doseTime ? b.doseTime.split(':').map(Number) : [21, 0];
          return (tA[0] * 60 + (tA[1] || 0)) - (tB[0] * 60 + (tB[1] || 0));
        });
        const firstTomorrow = sorted[0];
        setNextTimerComp(firstTomorrow);
        
        let tomorrowDoseSecs = 21 * 3600;
        if (firstTomorrow?.doseTime) {
          const [dh, dm] = firstTomorrow.doseTime.split(':').map(Number);
          tomorrowDoseSecs = dh * 3600 + (dm || 0) * 60;
        }
        
        // Seconds until midnight + dose time tomorrow
        const secsUntilMidnight = 86400 - currentSecs;
        const diff = secsUntilMidnight + tomorrowDoseSecs;
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const sec = diff % 60;
        setHoursLeft(String(h).padStart(2, '0'));
        setMinsLeft(String(m).padStart(2, '0'));
        setSecsLeft(String(sec).padStart(2, '0'));
        
        const totalWindow = 24 * 3600;
        setTimeProgress(diff / totalWindow);
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [todayComps, logs]);

  const loadData = useCallback(async () => {
    const protocols = await getProtocols();
    let scheduled = [];
    protocols.filter(p => p.status === 'active').forEach(p => {
      p.compounds.forEach(comp => {
        if (isScheduledForDate(comp, todayStr)) {
          scheduled.push({ ...comp, protocolName: p.name });
        }
      });
    });
    setTodayComps(scheduled);
    const history = await getDoseLogs();
    setLogs(history[todayStr] || {});
  }, [todayStr]);

  useFocusEffect(useCallback(() => {
    loadData();
  }, [loadData]));

  // Check for missed doses when user returns to app
  useFocusEffect(useCallback(() => {
    const checkMissed = async () => {
      if (todayComps.length === 0) return;
      const nextUndone = todayComps.find(c => !logs[c.compound]);
      if (!nextUndone) return;

      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      let doseMin = 21 * 60;
      if (nextUndone.doseTime) {
        const [dh, dm] = nextUndone.doseTime.split(':').map(Number);
        doseMin = dh * 60 + (dm || 0);
      }

      if (currentMins > doseMin + 5) {
        // Dose time has passed — ask user
        Alert.alert(
          'Missed Dose?',
          `It's past time for ${nextUndone.compound} (${nextUndone.amount || ''} ${nextUndone.unit || 'mcg'}).\n\nDid you take this dose?`,
          [
            { text: 'No, I missed it', style: 'cancel' },
            { text: 'Yes, I took it', onPress: () => toggleLog(nextUndone) },
          ]
        );
      }
    };
    // Small delay so data loads first
    const timer = setTimeout(checkMissed, 1500);
    return () => clearTimeout(timer);
  }, [todayComps, logs]));

  const toggleLog = async (comp) => {
    const history = await getDoseLogs();
    if (!history[todayStr]) history[todayStr] = {};
    const wasLogged = history[todayStr][comp.compound];
    history[todayStr][comp.compound] = !wasLogged;
    setLogs({ ...history[todayStr] });
    await saveDoseLogs(history);

    // Deduct from vial when LOGGING (not unchecking)
    if (!wasLogged) {
      const inventory = await getVialInventory();
      const vial = inventory[comp.compound];
      if (vial) {
        vial.currentVialMl = Math.max(0, (vial.currentVialMl || 0) - (vial.dosePerUseMl || 0.1));
        vial.currentVialMl = Math.round(vial.currentVialMl * 1000) / 1000; // fix float

        if (vial.currentVialMl <= 0) {
          // Current vial is empty
          if (vial.vialCount > 1) {
            vial.vialCount -= 1;
            vial.currentVialMl = vial.vialSizeMl || 3;
            Alert.alert('New Vial Opened', `Opened a new vial of ${comp.compound}. ${vial.vialCount} vial${vial.vialCount > 1 ? 's' : ''} remaining in stock.`);
          } else {
            vial.vialCount = 0;
            Alert.alert('\ud83d\udea8 Out of Stock', `You\'ve used your last vial of ${comp.compound}. Please reorder.`);
          }
        } else if (vial.vialCount <= 1 && vial.currentVialMl < (vial.vialSizeMl || 3) * 0.25) {
          Alert.alert('\u26a0\ufe0f Low Stock', `Running low on ${comp.compound}. Only ${vial.currentVialMl.toFixed(1)}mL left in your last vial. Consider reordering.`);
        }

        inventory[comp.compound] = vial;
        await saveVialInventory(inventory);
      }
    }
  };

  const completedCount = Object.values(logs).filter(Boolean).length;
  const totalCount = todayComps.length || 1;

  // Ring uses time-based progress (green → yellow as it depletes)
  const ringProgress = timeProgress; // 1.0 = full circle, 0.0 = empty
  const ringOffset = CIRCUMFERENCE * (1 - ringProgress);
  // Color: green when >10% remaining, yellow when close to dose time
  const ringColor = timeProgress > 0.1 ? '#34C759' : '#FFCC00';

  // Find next undone compound for today
  const nextComp = todayComps.find(c => !logs[c.compound]) || null;
  const allDoneToday = todayComps.length > 0 && !nextComp;
  // The compound to display in the timer (either today's next or tomorrow's first)
  const timerComp = nextComp || nextTimerComp;

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <View style={s.logoClip}>
              <Image source={require('@/assets/images/iqon-logo.png')} style={s.brandLogo} resizeMode="contain" />
            </View>
            <Text style={s.subtitle}>{displayDate}</Text>
          </View>
          <TouchableOpacity style={s.profileBtn} activeOpacity={0.7}>
            <Droplets size={18} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>

        {/* Circular Next Dose Ring */}
        <View style={s.ringCard}>
          {todayComps.length === 0 ? (
            /* ── Empty state: no protocol ── */
            <>
              <View style={s.ringContainer}>
                <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
                  <SvgCircle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RING_RADIUS}
                    stroke="rgba(200,205,210,0.3)"
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                    strokeDasharray={`${6} ${6}`}
                  />
                </Svg>
                <View style={s.ringCenter}>
                  <Calendar size={32} color={Colors.grey400} />
                </View>
              </View>
              <Text style={s.ringTitle}>No schedule set</Text>
              <Text style={s.ringSubtitle}>Create a protocol to start tracking doses</Text>
              <TouchableOpacity style={s.addScheduleCTA} onPress={() => router.push('/protocol-wizard')} activeOpacity={0.85}>
                <Plus size={16} color="#FFF" />
                <Text style={s.addScheduleCTAText}>Add Schedule</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* ── Active state: countdown ring ── */
            <>
              <View style={s.ringContainer}>
                <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
                  {/* Background track */}
                  <SvgCircle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RING_RADIUS}
                    stroke="rgba(200,205,210,0.3)"
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                    strokeDasharray={`${6} ${6}`}
                  />
                  {/* Progress arc */}
                  <SvgCircle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RING_RADIUS}
                    stroke={nextComp ? ringColor : '#34C759'}
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${CIRCUMFERENCE}`}
                    strokeDashoffset={nextComp ? ringOffset : 0}
                    transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                  />
                  {/* End dot */}
                  {nextComp && ringProgress > 0 && (
                    <SvgCircle
                      cx={RING_SIZE / 2}
                      cy={STROKE_WIDTH / 2}
                      r={5}
                      fill={ringColor}
                      transform={`rotate(${ringProgress * 360 - 90} ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                    />
                  )}
                </Svg>

                {/* Center content — always show timer */}
                <View style={s.ringCenter}>
                  <View style={s.ringTimeRow}>
                    <Text style={s.ringTime}>{hoursLeft}:{minsLeft}</Text>
                    <Text style={s.ringSecs}>:{secsLeft}</Text>
                  </View>
                  <Text style={s.ringUnit}>NEXT DOSE</Text>
                  {timerComp && (
                    <Text style={s.ringCompound}>{timerComp.compound}</Text>
                  )}
                  {timerComp && (
                    <Text style={s.ringDose}>{doseInfo(timerComp)}</Text>
                  )}
                </View>
              </View>

              {/* Ring label */}
              {allDoneToday && (
                <Text style={s.ringTitle}>All Done Today ✓</Text>
              )}
              {timerComp && (
                <Text style={allDoneToday ? s.ringSubtitle : s.ringTitle}>Next — {timerComp.compound}{allDoneToday ? ' (tomorrow)' : ''}</Text>
              )}
              {timerComp && !allDoneToday && (
                <Text style={s.ringSubtitle}>{doseInfo(timerComp)}</Text>
              )}

              {/* Controls — show check when dose is due */}
              <View style={s.ringControls}>
                {nextComp && hoursLeft === '00' && minsLeft === '00' && secsLeft === '00' && (
                  <TouchableOpacity
                    style={[s.controlBtn, { backgroundColor: '#34C759', borderColor: '#34C759' }]}
                    activeOpacity={0.7}
                    onPress={() => toggleLog(nextComp)}
                  >
                    <CheckCircle size={18} color="#FFF" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={s.controlBtn} activeOpacity={0.7} onPress={() => router.push('/protocol-wizard')}>
                  <Plus size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* ── Coming Up Today — only pending doses ── */}
        {(() => {
          const pendingComps = todayComps.filter(c => !logs[c.compound]);
          const doneComps = todayComps.filter(c => logs[c.compound]);
          return (
            <>
              {pendingComps.length > 0 && (
                <View style={s.comingUpCard}>
                  <Text style={s.comingUpTitle}>{pendingComps.length} SCHEDULED TODAY</Text>
                  {[...pendingComps]
                    .sort((a, b) => {
                      const timeA = a.doseTime ? a.doseTime.split(':').map(Number) : [21, 0];
                      const timeB = b.doseTime ? b.doseTime.split(':').map(Number) : [21, 0];
                      return (timeA[0] * 60 + (timeA[1] || 0)) - (timeB[0] * 60 + (timeB[1] || 0));
                    })
                    .map((comp, i) => {
                      const timeStr = comp.doseTime || '21:00';
                      const [th, tm] = timeStr.split(':').map(Number);
                      const ampm = th >= 12 ? 'PM' : 'AM';
                      const hr = th % 12 || 12;
                      const formattedTime = `${hr}:${String(tm || 0).padStart(2, '0')} ${ampm}`;
                      const isNext = nextComp && comp.compound === nextComp.compound;

                      return (
                        <View key={i} style={[s.comingUpRow, isNext && s.comingUpRowNext]}>
                          <View style={[s.comingUpDot, { backgroundColor: comp.color || '#999' }]} />
                          <View style={{ flex: 1 }}>
                            <Text style={s.comingUpName}>{comp.compound}</Text>
                            <Text style={s.comingUpMeta}>{doseInfo(comp)}</Text>
                          </View>
                          <View style={s.comingUpTimeWrap}>
                            <Text style={[s.comingUpTime, isNext && { color: '#34C759', fontWeight: '700' }]}>{formattedTime}</Text>
                            {isNext && <Text style={s.comingUpNextBadge}>NEXT</Text>}
                          </View>
                        </View>
                      );
                    })}
                </View>
              )}

              {/* Quick stat cards row */}
              <View style={s.statRow}>
                <View style={s.statCard}>
                  <View style={s.statIconWrap}>
                    <Zap size={14} color={Colors.danger} />
                  </View>
                  <Text style={s.statLabel}>LEVEL</Text>
                  <Text style={s.statValue}>
                    {completedCount > 0 ? `${completedCount} dose${completedCount > 1 ? 's' : ''}\nlogged` : 'No dose\nlogged yet'}
                  </Text>
                </View>
                <View style={s.statCardLarge}>
                  <View style={s.scheduleCircle}>
                    <Calendar size={24} color={Colors.grey400} />
                  </View>
                  {todayComps.length > 0 ? (
                    <Text style={s.scheduleText}>{todayComps.length} scheduled today</Text>
                  ) : (
                    <>
                      <Text style={s.scheduleText}>No schedule set</Text>
                      <TouchableOpacity style={s.addScheduleBtn} onPress={() => router.push('/protocol-wizard')} activeOpacity={0.7}>
                        <Plus size={14} color={Colors.textPrimary} />
                        <Text style={s.addScheduleText}>Add Schedule</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>

              {/* ── Today's Doses — only completed ── */}
              {doneComps.length > 0 && (
                <View style={s.section}>
                  <Text style={s.sectionLabel}>TODAY'S DOSES • {doneComps.length} TAKEN</Text>
                  <View style={s.sectionLine} />
                  {doneComps.map((comp, i) => (
                    <TouchableOpacity
                      key={i}
                      style={s.doseRow}
                      onPress={() => toggleLog(comp)}
                      activeOpacity={0.7}
                    >
                      <View style={[s.doseIndicator, { backgroundColor: Colors.success }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[s.doseName, { opacity: 0.5, textDecorationLine: 'line-through' }]}>{comp.compound}</Text>
                        <Text style={s.doseMeta}>{doseInfo(comp)}</Text>
                      </View>
                      <View style={[s.doseCheck, s.doseCheckDone]}>
                        <CheckCircle size={16} color="#FFF" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          );
        })()}

        {/* Dose Calendar link */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>DOSE CALENDAR</Text>
          <View style={s.sectionLine} />
          <TouchableOpacity style={s.menuRow} activeOpacity={0.7}>
            <Activity size={18} color={Colors.textPrimary} />
            <Text style={s.menuText}>Dose Calendar</Text>
            <ChevronRight size={18} color={Colors.grey400} />
          </TouchableOpacity>
          <TouchableOpacity style={s.menuRow} activeOpacity={0.7}>
            <Sparkles size={18} color={Colors.textPrimary} />
            <Text style={s.menuText}>AI Insights</Text>
            <ChevronRight size={18} color={Colors.grey400} />
          </TouchableOpacity>
        </View>

        {/* Learn section */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>LEARN</Text>
          <View style={s.sectionLine} />
          <TouchableOpacity style={s.menuRow} onPress={() => router.push('/learn')} activeOpacity={0.7}>
            <BookOpen size={18} color={Colors.textPrimary} />
            <Text style={s.menuText}>Pep Learn</Text>
            <ChevronRight size={18} color={Colors.grey400} />
          </TouchableOpacity>
          <TouchableOpacity style={s.menuRow} onPress={() => router.push('/(tabs)/library')} activeOpacity={0.7}>
            <Droplets size={18} color={Colors.textPrimary} />
            <Text style={s.menuText}>Research Library</Text>
            <ChevronRight size={18} color={Colors.grey400} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => router.push('/protocol-wizard')}
        activeOpacity={0.9}
      >
        <Plus size={28} color={Colors.textInverse} />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingTop: 60 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.xl },
  brandName: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, letterSpacing: 2 },
  logoClip: { width: 95, height: 38, overflow: 'hidden' },
  brandLogo: { width: 200, height: 200, marginLeft: -56, marginTop: -78 },
  subtitle: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  profileBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.cardDark, alignItems: 'center', justifyContent: 'center' },

  // Circular ring card
  ringCard: {
    backgroundColor: Colors.panelBg,
    borderRadius: 28,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    ...Shadows.card,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringTimeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  ringTime: {
    fontSize: 34,
    fontWeight: '300',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  ringSecs: {
    fontSize: 18,
    fontWeight: '300',
    color: Colors.textSecondary,
  },
  ringUnit: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 2,
    marginTop: 4,
  },
  ringTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  ringSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  ringCompound: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  ringDose: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.grey400,
    marginTop: 1,
  },
  ringControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: Spacing.lg,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(200,205,210,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnActive: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
  },
  controlIcon: {
    fontSize: 16,
  },

  // Empty state CTA
  addScheduleCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardDark,
    borderRadius: 14,
    paddingHorizontal: 24,
    height: 44,
    gap: 8,
    marginTop: Spacing.lg,
    ...Shadows.button,
  },
  addScheduleCTAText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },

  // Coming Up Today
  comingUpCard: {
    backgroundColor: Colors.panelBg,
    borderRadius: 20,
    padding: 16,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  comingUpTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  comingUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 12,
  },
  comingUpRowNext: {
    backgroundColor: 'rgba(52,199,89,0.08)',
  },
  comingUpDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingUpName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  comingUpMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  comingUpTimeWrap: {
    alignItems: 'flex-end',
  },
  comingUpTime: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  comingUpNextBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34C759',
    letterSpacing: 1,
    marginTop: 2,
  },
  comingUpNameDone: {
    opacity: 0.4,
    textDecorationLine: 'line-through',
  },
  comingUpTimeDone: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.success,
  },

  // Quick stat cards
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 0.45,
    backgroundColor: Colors.panelBg,
    borderRadius: 24,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    ...Shadows.card,
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,59,48,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  statCardLarge: {
    flex: 0.55,
    backgroundColor: Colors.panelBg,
    borderRadius: 24,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    ...Shadows.card,
  },
  scheduleCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(200,205,210,0.4)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  scheduleText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  addScheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: 'rgba(200,205,210,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.4)',
  },
  addScheduleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // Sections
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 2,
    marginBottom: 6,
  },
  sectionLine: {
    width: 24,
    height: 2,
    backgroundColor: Colors.textPrimary,
    marginBottom: Spacing.md,
    borderRadius: 1,
  },

  // Dose rows
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.panelBg,
    borderRadius: 20,
    padding: 16,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    ...Shadows.card,
  },
  doseIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  doseName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  doseMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  doseCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(200,205,210,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(200,205,210,0.4)',
  },
  doseCheckDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  doseCheckEmpty: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(200,205,210,0.3)',
  },

  // Menu rows
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.panelBg,
    borderRadius: 20,
    padding: 18,
    marginBottom: 8,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    ...Shadows.card,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.layered,
  },
});
