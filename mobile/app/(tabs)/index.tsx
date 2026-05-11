import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Alert, Image, FlatList, Modal } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Flame, CheckCircle, Activity, AlertTriangle, Scale, Zap, Plus, ArrowUpRight, ChevronRight, ChevronDown, Calendar, Clock, Droplets, BookOpen, Sparkles, Star, X, Award, Target, TrendingUp, Lock, Layers, HelpCircle, AlertCircle, RefreshCw, StopCircle, ShieldCheck } from 'lucide-react-native';
import Svg, { Circle as SvgCircle, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import { peptidesDB } from '@/data/peptides';
import { getProtocols, getDoseLogs, saveDoseLogs, getVialInventory, saveVialInventory } from '@/utils/storage';
import { isScheduledForDate } from '@/utils/scheduling';
import { doseInfo } from '@/utils/doseFormat';
import { useAuth } from '@/contexts/auth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RING_SIZE = 240;
const STROKE_WIDTH = 8;
const RING_RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;


export default function Today() {
  const router = useRouter();
  const { user } = useAuth();
  const [todayComps, setTodayComps] = useState<any[]>([]);
  const [logs, setLogs] = useState<Record<string, boolean>>({});
  const [allProtocols, setAllProtocols] = useState<any[]>([]);
  const [allLogs, setAllLogs] = useState<Record<string, Record<string, boolean>>>({});
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [stackCompound, setStackCompound] = useState<any>(null);
  const [stackOpen, setStackOpen] = useState(false);
  const [whatIfExpanded, setWhatIfExpanded] = useState<string | null>(null);
  const [showInteractions, setShowInteractions] = useState(false);
  const [interactionExpanded, setInteractionExpanded] = useState<string | null>(null);
  const displayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });

  // Derive selectedComps from allProtocols + selectedDate
  const selectedComps = useMemo(() => {
    const comps: any[] = [];
    allProtocols.filter((p: any) => p.status === 'active').forEach((p: any) => {
      p.compounds.forEach((c: any) => {
        if (isScheduledForDate(c, selectedDate)) comps.push({ ...c, protocolName: p.name });
      });
    });
    return comps;
  }, [allProtocols, selectedDate]);

  const selectedLogs = allLogs[selectedDate] || {};

  // ── Spending calculation (vial-purchase based) ──
  const [vialInventory, setVialInventory] = useState<Record<string, any>>({});
  const spending = useMemo(() => {
    // Collect compound pricing info from protocols
    const compPricing: Record<string, { pricePerVial: number }> = {};
    allProtocols.forEach((p: any) => {
      (p.compounds || []).forEach((c: any) => {
        if (c.pricePerVial && c.pricePerVial > 0) {
          compPricing[c.compound] = { pricePerVial: c.pricePerVial };
        }
      });
    });

    // Total spent = vials purchased × price per vial (upfront cost)
    let allTime = 0;
    Object.entries(vialInventory).forEach(([compound, inv]: [string, any]) => {
      const pricing = compPricing[compound];
      if (!pricing) return;
      const purchased = inv.totalPurchased || inv.vialCount || 0;
      allTime += purchased * pricing.pricePerVial;
    });

    // Projection based on dosing frequency (cycle-aware)
    let dailyCost = 0;
    allProtocols.filter((p: any) => p.status === 'active').forEach((p: any) => {
      (p.compounds || []).forEach((c: any) => {
        if (!c.pricePerVial || c.pricePerVial <= 0 || !c.vialSizeMl || !c.dosePerUseMl) return;
        const costPerDose = c.pricePerVial / (c.vialSizeMl / c.dosePerUseMl);
        const freq = c.frequency || 'daily';
        let dpd = 1;
        if (freq === 'weekly') dpd = (c.weeklyDays?.length || 1) / 7;
        else if (freq === 'everyX') dpd = 1 / (parseInt(c.repeatDays) || 1);
        const cycleWeeks = (peptidesDB as any)[c.compound]?.typicalCycle || 0;
        const cycleMult = cycleWeeks > 0 ? Math.min(1, cycleWeeks / (cycleWeeks + 4)) : 1;
        dailyCost += costPerDose * dpd * cycleMult;
      });
    });

    const projectedMonthly = dailyCost * 30;
    const projectedAnnual = dailyCost * 365;

    return { allTime, projectedMonthly, projectedAnnual };
  }, [allLogs, allProtocols, vialInventory]);

  // 7-day strip centered on today
  const DAY_ITEM_WIDTH = (SCREEN_WIDTH - 72) / 7;
  const dayStripRef = useRef<ScrollView>(null);

  // Earliest protocol start date — red missed markers only show after this
  const earliestStart = useMemo(() => {
    let earliest = todayStr;
    allProtocols.forEach((p: any) => {
      if (p.createdAt && p.createdAt < earliest) earliest = p.createdAt.split('T')[0];
    });
    return earliest;
  }, [allProtocols, todayStr]);

  // Streak & adherence
  const [showAdherence, setShowAdherence] = useState(false);
  const adherence = useMemo(() => {
    // Current streak: consecutive days (ending today or yesterday) with at least 1 logged dose
    let streak = 0;
    const d = new Date(todayStr);
    for (let i = 0; i < 365; i++) {
      const ds = d.toISOString().split('T')[0];
      const dayLogs = allLogs[ds];
      const anyLogged = dayLogs && Object.values(dayLogs).some(Boolean);
      // Skip today if nothing logged yet (streak can still be alive)
      if (i === 0 && !anyLogged) { d.setDate(d.getDate() - 1); continue; }
      if (anyLogged) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }

    // Total injections across all time
    let totalInjections = 0;
    const compCounts: Record<string, number> = {};
    let scheduledTotal = 0;
    let loggedTotal = 0;

    // Count scheduled & logged for each past day
    const startD = new Date(earliestStart);
    const endD = new Date(todayStr);
    for (let dt = new Date(startD); dt <= endD; dt.setDate(dt.getDate() + 1)) {
      const ds = dt.toISOString().split('T')[0];
      const dayLog = allLogs[ds] || {};

      // For each active protocol compound, check if it was scheduled for this day
      allProtocols.filter((p: any) => p.status === 'active').forEach((p: any) => {
        (p.compounds || []).forEach((c: any) => {
          if (isScheduledForDate(c, ds)) {
            scheduledTotal++;
            // Check if this specific compound was logged on this day
            if (dayLog[c.compound]) {
              loggedTotal++;
            }
          }
        });
      });

      // Also count total injections and compound breakdown from logs
      Object.entries(dayLog).forEach(([compound, logged]) => {
        if (logged) {
          totalInjections++;
          compCounts[compound] = (compCounts[compound] || 0) + 1;
        }
      });
    }

    // Top compound
    let topCompound = '';
    let topCount = 0;
    Object.entries(compCounts).forEach(([comp, count]) => {
      if (count > topCount) { topCompound = comp; topCount = count; }
    });

    // Cap at 100%
    const adherenceRate = scheduledTotal > 0 ? Math.min(100, Math.round((loggedTotal / scheduledTotal) * 100)) : 0;

    return { streak, totalInjections, topCompound, topCount, adherenceRate, compCounts };
  }, [allLogs, allProtocols, todayStr, earliestStart]);

  const getDayStrip = useCallback(() => {
    const letters = ['S','M','T','W','T','F','S'];
    const today = new Date(); today.setHours(0,0,0,0);
    const dayOfWeek = today.getDay(); // 0=Sun
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday); d.setDate(monday.getDate() + i);
      return { dateStr: d.toISOString().split('T')[0], letter: letters[d.getDay()], dayNum: d.getDate() };
    });
  }, []);

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
    const allP = await getProtocols();
    setAllProtocols(allP);
    let scheduled: any[] = [];
    allP.filter((p: any) => p.status === 'active').forEach((p: any) => {
      p.compounds.forEach((comp: any) => {
        if (isScheduledForDate(comp, todayStr)) scheduled.push({ ...comp, protocolName: p.name });
      });
    });
    setTodayComps(scheduled);
    const history = await getDoseLogs();
    setAllLogs(history);
    setLogs(history[todayStr] || {});
    setVialInventory(await getVialInventory());
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

  const toggleLog = async (comp: any) => {
    const history = await getDoseLogs();
    if (!history[selectedDate]) history[selectedDate] = {};
    const wasLogged = history[selectedDate][comp.compound];
    history[selectedDate][comp.compound] = !wasLogged;
    setAllLogs({ ...history });
    setLogs({ ...(history[todayStr] || {}) });
    await saveDoseLogs(history);

    // Find the earliest protocol start date for this compound
    const compProto = allProtocols.find((p: any) =>
      p.status === 'active' && (p.compounds || []).some((c: any) => c.compound === comp.compound)
    );
    const protoStart = compProto?.createdAt ? compProto.createdAt.split('T')[0] : null;
    const dateAllowed = protoStart && selectedDate >= protoStart;

    // Vial deduction when checking a dose (any date on/after protocol start)
    if (dateAllowed && !wasLogged) {
      const inventory = await getVialInventory();
      let vial = inventory[comp.compound];
      if (!vial) {
        vial = {
          vialCount: comp.vialsOnHand || 1,
          currentVialMl: parseFloat(comp.vialSizeMl) || 3,
          vialSizeMl: parseFloat(comp.vialSizeMl) || 3,
          dosePerUseMl: parseFloat(comp.dosePerUseMl) || 0.1,
        };
      }
      const doseML = vial.dosePerUseMl || parseFloat(comp.dosePerUseMl) || 0.1;
      vial.currentVialMl = Math.max(0, (vial.currentVialMl || 0) - doseML);
      vial.currentVialMl = Math.round(vial.currentVialMl * 1000) / 1000;
      if (vial.currentVialMl <= 0) {
        if (vial.vialCount > 1) {
          vial.vialCount -= 1; vial.currentVialMl = vial.vialSizeMl || 3;
          Alert.alert('New Vial Opened', `Opened a new vial of ${comp.compound}. ${vial.vialCount} vial${vial.vialCount > 1 ? 's' : ''} remaining in stock.`);
        } else {
          vial.vialCount = 0;
          Alert.alert('🚨 Out of Stock', `You've used your last vial of ${comp.compound}. Please reorder.`);
        }
      } else if (selectedDate === todayStr && vial.vialCount <= 1 && vial.currentVialMl < (vial.vialSizeMl || 3) * 0.25) {
        Alert.alert('⚠️ Low Stock', `Running low on ${comp.compound}. Only ${vial.currentVialMl.toFixed(1)}mL left in your last vial.`);
      }
      inventory[comp.compound] = vial;
      await saveVialInventory(inventory);
    }
    // Re-add dose to vial when unchecking (any date on/after protocol start)
    else if (dateAllowed && wasLogged) {
      const inventory = await getVialInventory();
      const vial = inventory[comp.compound];
      if (vial) {
        const doseML = vial.dosePerUseMl || parseFloat(comp.dosePerUseMl) || 0.1;
        const maxMl = vial.vialSizeMl || 3;
        vial.currentVialMl = Math.min(maxMl, Math.round(((vial.currentVialMl || 0) + doseML) * 1000) / 1000);
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
          <TouchableOpacity style={s.profileBtn} activeOpacity={0.7} onPress={() => router.push('/profile')}>
            <Text style={s.profileInitial}>{user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'G'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Scrollable Day Strip ── */}
        {allProtocols.length > 0 && (
          <View style={s.dayStrip}>
            <Text style={s.dayStripLabel}>This Week</Text>
            <View style={s.dayStripRow}>
              {getDayStrip().map(({ dateStr, letter, dayNum }) => {
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === todayStr;
                const isPast = dateStr < todayStr;
                let count = 0;
                allProtocols.filter((p: any) => p.status === 'active').forEach((p: any) => {
                  p.compounds.forEach((c: any) => { if (isScheduledForDate(c, dateStr)) count++; });
                });
                const logged = Object.values(allLogs[dateStr] || {}).filter(Boolean).length;
                const anyLogged = count > 0 && logged > 0;
                const allGreen = count > 0 && logged >= count;
                const missed = isPast && dateStr >= earliestStart && count > 0 && logged === 0;
                return (
                  <TouchableOpacity key={dateStr} style={[s.dayItem, { width: DAY_ITEM_WIDTH }]} onPress={() => setSelectedDate(dateStr)} activeOpacity={0.7}>
                    <Text style={[s.dayLetter, { color: isToday ? Colors.textPrimary : Colors.grey400, fontWeight: isToday ? '700' : '400' }]}>{letter}</Text>
                    <View style={[
                      s.dayCircle,
                      isToday && !isSelected && { borderColor: Colors.textPrimary, borderWidth: 2 },
                      isSelected && { backgroundColor: Colors.cardDark, borderColor: Colors.cardDark },
                      !isSelected && anyLogged && { backgroundColor: 'rgba(52,199,89,0.15)', borderColor: '#34C759' },
                      !isSelected && missed && { borderColor: '#FF3B30' },
                    ]}>
                      <Text style={[
                        s.dayNum,
                        isSelected && { color: '#FFF', fontWeight: '700' },
                        !isSelected && anyLogged && { color: '#34C759', fontWeight: '700' },
                        !isSelected && missed && { color: '#FF3B30', fontWeight: '700' },
                      ]}>
                        {dayNum}
                      </Text>
                    </View>
                    {allGreen && <View style={s.dayDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

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
                    strokeLinecap="butt"
                    strokeDasharray={`${CIRCUMFERENCE}`}
                    strokeDashoffset={nextComp ? ringOffset : 0}
                    transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                  />

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

        {/* ── Unified dose list for selected date ── */}
        {selectedComps.length > 0 && (() => {
          const selDateLabel = selectedDate === todayStr
            ? 'TODAY'
            : new Date(selectedDate + 'T12:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();
          const doneCount = selectedComps.filter(c => selectedLogs[c.compound]).length;
          const isPastDay = selectedDate < todayStr;
          return (
            <View style={s.unifiedDoseCard}>
              <View style={s.unifiedDoseHeader}>
                <Text style={s.unifiedDoseLabel}>{selDateLabel}</Text>
                {isPastDay && doneCount < selectedComps.length && (
                  <Text style={s.missedBadge}>⚠ {selectedComps.length - doneCount} not logged</Text>
                )}
                {doneCount === selectedComps.length && selectedComps.length > 0 && (
                  <Text style={s.allDoneBadge}>✓ All logged</Text>
                )}
              </View>
              {selectedComps.map((comp, i) => {
                const isDone = !!selectedLogs[comp.compound];
                const timeStr = comp.doseTime ? (() => {
                  const [h, m] = comp.doseTime.split(':').map(Number);
                  const ampm = h >= 12 ? 'PM' : 'AM';
                  const hr = h % 12 || 12;
                  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
                })() : null;
                return (
                  <View key={i} style={[s.doseItem, i > 0 && { borderTopWidth: 1, borderTopColor: Colors.grey100 }]}>
                    <TouchableOpacity
                      style={[s.doseCircleBtn, isDone && s.doseCircleBtnDone]}
                      onPress={() => toggleLog(comp)}
                      activeOpacity={0.7}
                    >
                      {isDone && <CheckCircle size={14} color="#FFF" />}
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[s.doseItemName, isDone && { textDecorationLine: 'line-through', opacity: 0.5 }]}>
                          {comp.compound}
                        </Text>
                        {timeStr && (
                          <View style={s.timeBadge}>
                            <Clock size={9} color={Colors.grey400} />
                            <Text style={s.timeBadgeText}>{timeStr}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={s.doseItemMeta}>{doseInfo(comp) || `${comp.amount} ${comp.unit}`}</Text>
                    </View>
                    {isDone ? (
                      <TouchableOpacity onPress={() => toggleLog(comp)} style={s.loggedBadge} activeOpacity={0.7}>
                        <CheckCircle size={12} color="#34C759" />
                        <Text style={s.loggedText}>Logged</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={s.markDoneBtn} onPress={() => toggleLog(comp)} activeOpacity={0.8}>
                        <Text style={s.markDoneText}>Mark as Done</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })()}

        {/* Quick stat cards row */}
        <View style={s.statRow}>
          <TouchableOpacity style={s.statCard} activeOpacity={0.75} onPress={() => setShowAdherence(true)}>
            <View style={s.statIconWrap}>
              <Flame size={14} color="#FF6B00" />
            </View>
            <Text style={s.statLabel}>STREAK</Text>
            <Text style={s.statValue}>
              {adherence.streak > 0 ? `${adherence.streak} day${adherence.streak > 1 ? 's' : ''}` : 'Start\ntoday'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.statCardLarge} activeOpacity={0.8} onPress={() => router.push('/calendar')}>
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
          </TouchableOpacity>
        </View>


        {/* Dose Calendar link */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>DOSE CALENDAR</Text>
          <View style={s.sectionLine} />
          <TouchableOpacity style={s.menuRow} activeOpacity={0.7} onPress={() => router.push('/calendar')}>
            <Activity size={18} color={Colors.textPrimary} />
            <Text style={s.menuText}>Dose Calendar</Text>
            <ChevronRight size={18} color={Colors.grey400} />
          </TouchableOpacity>
          <TouchableOpacity style={s.menuRow} activeOpacity={0.7} onPress={() => Alert.alert('Coming Soon', 'AI-powered insights are currently in development. Stay tuned.')}>
            <Sparkles size={18} color={Colors.textPrimary} />
            <Text style={[s.menuText, { flex: 1 }]}>AI Insights</Text>
            <Lock size={14} color={Colors.grey400} style={{ marginRight: 6 }} />
            <ChevronRight size={18} color={Colors.grey400} />
          </TouchableOpacity>
        </View>

        {/* My Stack — Collapsible */}
        {allProtocols.filter((p: any) => p.status === 'active').some((p: any) => p.compounds?.length > 0) && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>MY STACK</Text>
            <View style={s.sectionLine} />
            <TouchableOpacity style={s.menuRow} activeOpacity={0.7} onPress={() => setStackOpen(!stackOpen)}>
              <Layers size={18} color={Colors.textPrimary} />
              <View style={{ flex: 1 }}>
                <Text style={s.menuText}>Active Compounds</Text>
                <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
                  {allProtocols.filter((p: any) => p.status === 'active').reduce((n: number, p: any) => n + (p.compounds?.length || 0), 0)} compounds
                </Text>
              </View>
              <ChevronDown size={18} color={Colors.grey400} style={{ transform: [{ rotate: stackOpen ? '180deg' : '0deg' }] }} />
            </TouchableOpacity>
            {stackOpen && allProtocols.filter((p: any) => p.status === 'active').flatMap((p: any) =>
              (p.compounds || []).map((c: any) => {
                const db = (peptidesDB as any)[c.compound];
                return (
                  <TouchableOpacity key={`${p.id}-${c.compound}`} style={s.stackRow} activeOpacity={0.7} onPress={() => { setWhatIfExpanded(null); setStackCompound({ ...c, protocolName: p.name, db }); }}>
                    <View style={[s.stackDot, { backgroundColor: db?.color || '#888' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.stackName}>{c.compound}</Text>
                      <Text style={s.stackSub}>{c.dose}{c.unit} · {c.frequency}</Text>
                    </View>
                    <ChevronRight size={16} color={Colors.grey400} />
                  </TouchableOpacity>
                );
              })
            )}
            {stackOpen && (
              <TouchableOpacity style={s.menuRow} activeOpacity={0.7} onPress={() => { setInteractionExpanded(null); setShowInteractions(true); }}>
                <ShieldCheck size={18} color={Colors.textPrimary} />
                <View style={{ flex: 1 }}>
                  <Text style={s.menuText}>Interaction Check</Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary }}>Warnings, timing & synergies</Text>
                </View>
                <ChevronRight size={18} color={Colors.grey400} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Spending */}
        {allProtocols.filter((p: any) => p.status === 'active').length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>SPENDING</Text>
            <View style={s.sectionLine} />
            <TouchableOpacity style={s.menuRow} activeOpacity={0.7} onPress={() => router.push('/spending')}>
              <Scale size={18} color={Colors.textPrimary} />
              <View style={{ flex: 1 }}>
                <Text style={s.menuText}>Spending Tracker</Text>
                {(spending.allTime > 0 || spending.projectedAnnual > 0) ? (
                  <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>
                    ${spending.allTime.toFixed(0)} spent · ${spending.projectedMonthly.toFixed(0)}/mo projected
                  </Text>
                ) : (
                  <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>Add vial prices to track</Text>
                )}
              </View>
              <ChevronRight size={18} color={Colors.grey400} />
            </TouchableOpacity>
          </View>
        )}

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

      {/* ── Adherence Modal ── */}
      <Modal visible={showAdherence} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAdherence(false)}>
        <View style={s.adhScreen}>
          {/* Fixed header */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: Colors.bgPrimary, paddingTop: 16, paddingBottom: 12 }}>
            <View style={[s.adhTopBar, { marginBottom: 0 }]}>
              <TouchableOpacity onPress={() => setShowAdherence(false)} style={s.adhBackBtn} activeOpacity={0.7}>
                <X size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text style={s.adhScreenTitle}>Adherence</Text>
              <View style={{ width: 32 }} />
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 64, paddingBottom: 48 }}>
            {/* Hero — percentage */}
            <View style={s.adhHero}>
              <Text style={s.adhHeroNum}>{adherence.adherenceRate}<Text style={s.adhHeroPct}>%</Text></Text>
              <View style={s.adhHeroBar}>
                <View style={[s.adhHeroBarFill, { width: `${adherence.adherenceRate}%` }]} />
              </View>
              <Text style={s.adhHeroSub}>{adherence.totalInjections} of {adherence.adherenceRate > 0 ? Math.round(adherence.totalInjections / (adherence.adherenceRate / 100)) : 0} scheduled doses completed</Text>
            </View>

            {/* Metrics */}
            <View style={s.adhMetrics}>
              <View style={s.adhMetric}>
                <Text style={s.adhMetricNum}>{adherence.streak}</Text>
                <Text style={s.adhMetricLbl}>Day streak</Text>
              </View>
              <View style={s.adhMetricDiv} />
              <View style={s.adhMetric}>
                <Text style={s.adhMetricNum}>{adherence.totalInjections}</Text>
                <Text style={s.adhMetricLbl}>Total doses</Text>
              </View>
              <View style={s.adhMetricDiv} />
              <View style={s.adhMetric}>
                <Text style={s.adhMetricNum}>{Object.keys(adherence.compCounts).length}</Text>
                <Text style={s.adhMetricLbl}>Compounds</Text>
              </View>
            </View>

            {/* Most used */}
            {adherence.topCompound ? (
              <View style={s.adhMostUsed}>
                <Text style={s.adhMostUsedLabel}>Most administered</Text>
                <View style={s.adhMostUsedRow}>
                  <View style={[s.adhMostUsedDot, { backgroundColor: (peptidesDB as any)[adherence.topCompound]?.color || Colors.cardDark }]} />
                  <Text style={s.adhMostUsedName}>{adherence.topCompound}</Text>
                  <Star size={14} color="#D4A800" fill="#D4A800" style={{ marginRight: 8 }} />
                  <Text style={s.adhMostUsedCount}>{adherence.topCount}</Text>
                </View>
              </View>
            ) : null}

            {/* Compound breakdown */}
            {Object.keys(adherence.compCounts).length > 1 && (
              <View style={s.adhBreakdown}>
                <Text style={s.adhBreakdownTitle}>By compound</Text>
                {Object.entries(adherence.compCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([comp, count]) => {
                    const pct = adherence.totalInjections > 0 ? Math.round((count / adherence.totalInjections) * 100) : 0;
                    const color = (peptidesDB as any)[comp]?.color || Colors.grey400;
                    return (
                      <View key={comp} style={s.adhBreakdownRow}>
                        <View style={[s.adhBreakdownDot, { backgroundColor: color }]} />
                        <Text style={s.adhBreakdownName} numberOfLines={1}>{comp}</Text>
                        <Text style={s.adhBreakdownVal}>{count}</Text>
                        <View style={s.adhBreakdownBarBg}>
                          <View style={[s.adhBreakdownBarFill, { width: `${pct}%`, backgroundColor: color }]} />
                        </View>
                        <Text style={s.adhBreakdownPct}>{pct}%</Text>
                      </View>
                    );
                  })}
            </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* ═══ INTERACTION CHECK MODAL ═══ */}
      <Modal visible={showInteractions} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowInteractions(false)}>
        <View style={s.adhScreen}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: Colors.bgPrimary, paddingTop: 16, paddingBottom: 12 }}>
            <View style={[s.adhTopBar, { marginBottom: 0 }]}>
              <TouchableOpacity style={s.adhBackBtn} onPress={() => setShowInteractions(false)}>
                <X size={16} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={s.adhScreenTitle}>Interactions</Text>
              <View style={{ width: 32 }} />
            </View>
          </View>
          <ScrollView contentContainerStyle={{ paddingTop: 64, paddingBottom: 80, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
            {(() => {
              const activeComps = allProtocols.filter((p: any) => p.status === 'active').flatMap((p: any) => (p.compounds || []).map((c: any) => c.compound));
              const uniqueComps = [...new Set(activeComps)] as string[];
              const timingData = [
                { compound: 'CJC-1295 / Ipamorelin', type: 'required', detail: 'Must be taken on an empty stomach. Food — especially carbs and fats — blunts GH release by elevating insulin. Fast 2h before and 30 min after.' },
                { compound: 'Ipamorelin', type: 'required', detail: 'Fasting required for optimal GH pulse. Insulin from food directly suppresses ghrelin-mediated GH release. Take before bed or morning on empty stomach.' },
                { compound: 'Sermorelin', type: 'required', detail: 'GHRH analog requires fasting state. Elevated blood glucose inhibits the GHRH-GH axis. Inject 30 min before sleep on empty stomach.' },
                { compound: 'Tesamorelin', type: 'required', detail: 'As a GHRH analog, fasting maximizes GH response. FDA-approved studies used fasting protocol. Administer on empty stomach.' },
                { compound: 'Hexarelin', type: 'required', detail: 'Ghrelin mimetic requiring fasting for full GH secretion. Food intake attenuates the GH pulse by 40-60%.' },
                { compound: 'GHRP-2', type: 'required', detail: 'Potent GH secretagogue — fasting essential. Studies show GH output reduced by up to 50% post-meal. Best on empty stomach before bed.' },
                { compound: 'GHRP-6', type: 'required', detail: 'Strong GH secretagogue requiring fasting. Also stimulates appetite (ghrelin pathway). Fast 2h before, eat 30min after.' },
                { compound: 'MK-677 (Ibutamoren)', type: 'recommended', detail: 'Oral GH secretagogue. Works with food but fasting enhances the GH pulse. Many take before bed on empty stomach.' },
                { compound: 'Semaglutide', type: 'recommended', detail: 'GLP-1 agonist works independently of food but fasting before injection may reduce nausea. Take weekly in the morning.' },
                { compound: 'Tirzepatide', type: 'recommended', detail: 'Dual GIP/GLP-1 agonist. Fasting not required but recommended to minimize GI side effects.' },
                { compound: 'AOD-9604', type: 'recommended', detail: 'Fat-loss HGH fragment. Fasting enhances lipolytic activity as insulin inhibits fat oxidation. Take morning fasted.' },
                { compound: 'MOTS-c', type: 'recommended', detail: 'Mitochondrial peptide. Fasted or pre-exercise may enhance AMPK activation and metabolic benefits.' },
              ];
              const activeTimings = timingData.filter(t => uniqueComps.includes(t.compound));
              const warningsDB = [
                { compounds: ['Semaglutide', 'Tirzepatide'], title: 'Do Not Combine GLP-1 Agonists', severity: 'warning', detail: 'Using both simultaneously increases risk of severe nausea, pancreatitis, and dangerous hypoglycemia. They target overlapping pathways. Use only one.' },
                { compounds: ['GHRP-6', 'MK-677 (Ibutamoren)'], title: 'Excessive Appetite Stimulation', severity: 'caution', detail: 'Both strongly stimulate ghrelin receptors, causing intense hunger. Consider replacing GHRP-6 with Ipamorelin if appetite control matters.' },
                { compounds: ['Hexarelin', 'GHRP-2', 'GHRP-6'], title: 'Cortisol & Prolactin Elevation', severity: 'caution', detail: 'These GHRPs raise cortisol and prolactin at higher doses. Stacking amplifies this. Ipamorelin is a safer alternative.' },
                { compounds: ['Melanotan II', 'PT-141 (Bremelanotide)'], title: 'Melanocortin Receptor Overlap', severity: 'caution', detail: 'Both act on MC3/MC4 receptors. Combining causes excessive nausea and BP changes. Melanotan II already has libido effects — PT-141 is redundant.' },
                { compounds: ['NAD+', 'Semaglutide'], title: 'GI Sensitivity Stack', severity: 'caution', detail: 'High-dose NAD+ causes nausea/flushing. Combined with GLP-1 GI effects, discomfort amplified. Space 4+ hours apart.' },
              ];
              const activeWarnings = warningsDB.filter(w => { const m = w.compounds.filter(c => uniqueComps.includes(c)); return m.length >= 2; });
              const synergiesDB = [
                { a: 'CJC-1295 / Ipamorelin', b: 'Ipamorelin', title: 'Synergistic GH Stack', type: 'Growth Hormone', detail: 'CJC-1295 extends the GH release window while Ipamorelin triggers the pulse. Together they produce up to 3x greater GH output vs monotherapy.', tip: 'Inject together before bed on empty stomach for optimal GH pulse.' },
                { a: 'CJC-1295 / Ipamorelin', b: 'Sermorelin', title: 'Dual GHRH Amplification', type: 'Growth Hormone', detail: 'CJC-1295 DAC has a long half-life (~8 days) for baseline stimulation, Sermorelin provides acute pulses. Together they mimic natural pulsatile GH secretion.', tip: 'CJC-1295 2-3x/week, Sermorelin nightly before bed.' },
                { a: 'GHK-Cu', b: 'BPC-157', title: 'Recovery & Collagen Synergy', type: 'Tissue Repair', detail: 'BPC-157 accelerates healing via VEGF upregulation. GHK-Cu stimulates collagen synthesis and activates stem cells via TGF-β. Together they dramatically accelerate tissue regeneration.', tip: 'Can be injected at the same site near injury.' },
                { a: 'BPC-157', b: 'TB-500', title: 'Ultimate Recovery Stack', type: 'Tissue Repair', detail: 'BPC-157 promotes angiogenesis locally, TB-500 works systemically to reduce inflammation and promote cell migration. Most widely used recovery combination in peptide therapy.', tip: 'BPC-157 near injury, TB-500 subcutaneously in abdomen. Can be taken simultaneously.' },
                { a: 'Semaglutide', b: 'AOD-9604', title: 'Dual Fat Loss Pathway', type: 'Metabolic', detail: 'Semaglutide suppresses appetite centrally via GLP-1. AOD-9604 directly stimulates fat breakdown. Together they attack fat from appetite reduction AND direct lipolysis.', tip: 'Semaglutide weekly, AOD-9604 daily fasted. Space by 1 hour.' },
                { a: 'Tirzepatide', b: 'AOD-9604', title: 'Enhanced Metabolic Stack', type: 'Metabolic', detail: 'Tirzepatide dual GIP/GLP-1 provides superior appetite suppression. AOD-9604 adds direct fat cell lipolysis. Maximizes caloric deficit while mobilizing stored fat.', tip: 'Tirzepatide weekly, AOD-9604 daily fasted. Monitor blood glucose.' },
                { a: 'Semax', b: 'Selank', title: 'Cognitive & Mood Stack', type: 'Neuroprotective', detail: 'Semax enhances BDNF for focus and neuroplasticity. Selank modulates GABA for anxiety reduction without sedation. Clean cognitive enhancement with anxiolytic benefits.', tip: 'Semax in the morning for focus, Selank as needed for calm. Both intranasal.' },
                { a: 'Semax', b: 'Dihexa', title: 'Neurotrophin Amplification', type: 'Neuroprotective', detail: 'Semax boosts BDNF while Dihexa potentiates HGF activity in the brain by up to 10 million-fold. Maximal neurotrophic support for learning and memory.', tip: 'Dihexa is extremely potent — use conservative doses.' },
                { a: 'Thymosin Alpha-1', b: 'LL-37', title: 'Immune Defense Stack', type: 'Immune Support', detail: 'TA1 primes T-cells (adaptive immunity). LL-37 directly kills pathogens and modulates inflammation (innate immunity). Comprehensive immune coverage.', tip: 'Ideal during illness. TA1 and LL-37 both subcutaneously.' },
                { a: 'Thymosin Alpha-1', b: 'KPV', title: 'Anti-Inflammatory Immune', type: 'Immune Support', detail: 'TA1 activates immune surveillance while KPV suppresses NF-κB inflammation. Balanced immune activation without autoimmune flares.', tip: 'Excellent for autoimmune conditions. KPV can be taken orally for gut effects.' },
                { a: 'MOTS-c', b: 'NAD+', title: 'Mitochondrial Longevity Stack', type: 'Longevity', detail: 'MOTS-c activates AMPK for mitochondrial metabolism. NAD+ fuels sirtuins for DNA repair. Together they optimize cellular energy and repair mechanisms.', tip: 'MOTS-c fasted or pre-exercise, NAD+ subcutaneous. Space by 2 hours.' },
                { a: 'Epithalon (Epitalon)', b: 'NAD+', title: 'Telomere & Repair Stack', type: 'Longevity', detail: 'Epithalon activates telomerase protecting chromosome ends. NAD+ fuels PARP DNA repair. Addresses aging at telomere maintenance and DNA damage repair levels.', tip: 'Epithalon cycled (10 days on, 6 months off). NAD+ can be continuous.' },
                { a: 'DSIP', b: 'CJC-1295 / Ipamorelin', title: 'Sleep & GH Optimization', type: 'Recovery', detail: 'DSIP promotes deep slow-wave sleep — the phase of maximum natural GH release. CJC/Ipa amplifies the nocturnal GH pulse during enhanced deep sleep.', tip: 'Both 30 minutes before bed on empty stomach.' },
                { a: 'BPC-157', b: 'KPV', title: 'Gut Healing Stack', type: 'Gut Health', detail: 'BPC-157 heals gut lining and repairs leaky gut. KPV reduces intestinal inflammation via NF-κB suppression. Together they heal damage AND reduce the inflammatory cascade.', tip: 'BPC-157 subcutaneously near abdomen. KPV orally for direct gut contact.' },
                { a: 'GHK-Cu', b: 'Epithalon (Epitalon)', title: 'Cellular Rejuvenation', type: 'Longevity', detail: 'GHK-Cu resets 1,584 genes toward a younger expression pattern. Epithalon maintains telomere length. Together they address aging at epigenetic and genomic levels.', tip: 'GHK-Cu daily. Epithalon in 10-day cycles.' },
                { a: 'Ipamorelin', b: 'GHRP-2', title: 'Enhanced GH Secretion', type: 'Growth Hormone', detail: 'Ipamorelin is cleaner (no cortisol/prolactin rise) while GHRP-2 provides a stronger initial pulse. Combined, they maximize GH output with moderated side effects.', tip: 'Use lower doses of each when stacking. Inject together fasted before bed.' },
              ];
              const activeSynergies = synergiesDB.filter(s => uniqueComps.includes(s.a) && uniqueComps.includes(s.b));

              return (
                <>
                  {/* Summary */}
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 28 }}>
                    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6 }}>
                      <Text style={{ fontSize: 28, fontWeight: '700', color: activeWarnings.length > 0 ? '#DC2626' : Colors.textPrimary }}>{activeWarnings.length}</Text>
                      <Text style={{ fontSize: 10, color: Colors.textSecondary, marginTop: 4, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' }}>Warnings</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6 }}>
                      <Text style={{ fontSize: 28, fontWeight: '700', color: Colors.textPrimary }}>{activeTimings.length}</Text>
                      <Text style={{ fontSize: 10, color: Colors.textSecondary, marginTop: 4, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' }}>Timing</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6 }}>
                      <Text style={{ fontSize: 28, fontWeight: '700', color: Colors.textPrimary }}>{activeSynergies.length}</Text>
                      <Text style={{ fontSize: 10, color: Colors.textSecondary, marginTop: 4, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' }}>Synergies</Text>
                    </View>
                  </View>

                  {/* Warnings */}
                  {activeWarnings.length > 0 && (
                    <View style={{ marginBottom: 28 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1, marginBottom: 12 }}>WARNINGS</Text>
                      {activeWarnings.map((w, i) => (
                        <View key={i} style={{ backgroundColor: '#FFF', borderRadius: 14, marginBottom: 8, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6 }}>
                          <TouchableOpacity activeOpacity={0.7} onPress={() => setInteractionExpanded(interactionExpanded === `w${i}` ? null : `w${i}`)} style={{ padding: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary, flex: 1 }}>{w.title}</Text>
                              <ChevronDown size={14} color={Colors.grey400} style={{ transform: [{ rotate: interactionExpanded === `w${i}` ? '180deg' : '0deg' }] }} />
                            </View>
                          </TouchableOpacity>
                          {interactionExpanded === `w${i}` && (
                            <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                              <View style={{ height: 1, backgroundColor: Colors.grey100, marginBottom: 12 }} />
                              <Text style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 20 }}>{w.detail}</Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Timing */}
                  <View style={{ marginBottom: 28 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1, marginBottom: 12 }}>TIMING CONSIDERATIONS</Text>
                    {activeTimings.length === 0 ? (
                      <View style={{ backgroundColor: '#FFF', borderRadius: 14, padding: 20, alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, color: Colors.textSecondary }}>No timing-sensitive compounds in your stack</Text>
                      </View>
                    ) : activeTimings.map((t, i) => (
                      <View key={i} style={{ backgroundColor: '#FFF', borderRadius: 14, marginBottom: 8, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6 }}>
                        <TouchableOpacity activeOpacity={0.7} onPress={() => setInteractionExpanded(interactionExpanded === `t${i}` ? null : `t${i}`)} style={{ padding: 16 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 12, fontWeight: '500', color: Colors.textSecondary, marginBottom: 2 }}>{t.compound}</Text>
                              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary }}>Fasting {t.type === 'required' ? 'Required' : 'Recommended'}</Text>
                            </View>
                            <ChevronDown size={14} color={Colors.grey400} style={{ transform: [{ rotate: interactionExpanded === `t${i}` ? '180deg' : '0deg' }] }} />
                          </View>
                        </TouchableOpacity>
                        {interactionExpanded === `t${i}` && (
                          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                            <View style={{ height: 1, backgroundColor: Colors.grey100, marginBottom: 12 }} />
                            <Text style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 20 }}>{t.detail}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>

                  {/* Synergies */}
                  <View style={{ marginBottom: 28 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1, marginBottom: 12 }}>SYNERGIES</Text>
                    {activeSynergies.length === 0 ? (
                      <View style={{ backgroundColor: '#FFF', borderRadius: 14, padding: 20, alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, color: Colors.textSecondary }}>No known synergies in your current stack</Text>
                      </View>
                    ) : activeSynergies.map((syn, i) => {
                      const colorA = (peptidesDB as any)[syn.a]?.color || '#6366f1';
                      const colorB = (peptidesDB as any)[syn.b]?.color || '#14b8a6';
                      return (
                      <View key={i} style={{ backgroundColor: '#FFF', borderRadius: 14, marginBottom: 10, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6 }}>
                        <TouchableOpacity activeOpacity={0.7} onPress={() => setInteractionExpanded(interactionExpanded === `s${i}` ? null : `s${i}`)} style={{ padding: 16 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                            <View style={{ backgroundColor: colorA + '18', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: colorA + '30' }}>
                              <Text style={{ fontSize: 12, fontWeight: '600', color: colorA }}>{syn.a}</Text>
                            </View>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.grey400 }}>+</Text>
                            <View style={{ backgroundColor: colorB + '18', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: colorB + '30' }}>
                              <Text style={{ fontSize: 12, fontWeight: '600', color: colorB }}>{syn.b}</Text>
                            </View>
                            <View style={{ flex: 1 }} />
                            <ChevronDown size={14} color={Colors.grey400} style={{ transform: [{ rotate: interactionExpanded === `s${i}` ? '180deg' : '0deg' }] }} />
                          </View>
                          <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary }}>{syn.title}</Text>
                          <Text style={{ fontSize: 11, fontWeight: '500', color: Colors.textSecondary, marginTop: 2 }}>{syn.type}</Text>
                        </TouchableOpacity>
                        {interactionExpanded === `s${i}` && (
                          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                            <View style={{ height: 1, backgroundColor: Colors.grey100, marginBottom: 12 }} />
                            <Text style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 20 }}>{syn.detail}</Text>
                            <View style={{ backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, marginTop: 12 }}>
                              <Text style={{ fontSize: 12, color: Colors.textSecondary, lineHeight: 18 }}>{syn.tip}</Text>
                            </View>
                          </View>
                        )}
                      </View>
                      );
                    })}
                  </View>

                  <Text style={{ textAlign: 'center', fontSize: 11, color: Colors.grey400, marginHorizontal: 20, marginBottom: 20 }}>
                    Interaction data sourced from published pharmacological literature. See Peptide Library for full citations.
                  </Text>
                </>
              );
            })()}
          </ScrollView>
        </View>
      </Modal>

      {/* ═══ COMPOUND DETAIL MODAL ═══ */}
      <Modal visible={!!stackCompound} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setStackCompound(null)}>
        <View style={s.adhScreen}>
          {/* Fixed header */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: Colors.bgPrimary, paddingTop: 16, paddingBottom: 12 }}>
            <View style={[s.adhTopBar, { marginBottom: 0 }]}>
              <TouchableOpacity style={s.adhBackBtn} onPress={() => setStackCompound(null)}>
                <X size={16} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={s.adhScreenTitle}>{stackCompound?.compound}</Text>
              <View style={{ width: 32 }} />
            </View>
          </View>
          <ScrollView contentContainerStyle={{ paddingTop: 64, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>

            {/* ── Saturation Card ── */}
            {stackCompound?.db?.pharmacokinetics && (() => {
              const pk = stackCompound.db.pharmacokinetics;
              // Parse half-life to hours for calculation
              const hlStr = pk.halfLife || '';
              let hlHours = 4;
              if (hlStr.includes('day')) hlHours = parseFloat(hlStr.replace(/[^0-9.]/g, '')) * 24;
              else if (hlStr.includes('hr')) hlHours = parseFloat(hlStr.replace(/[^0-9.]/g, ''));
              else if (hlStr.includes('min')) hlHours = parseFloat(hlStr.replace(/[^0-9.]/g, '')) / 60;

              // Get dose logs for this compound
              const compLogs = Object.entries(allLogs).filter(([date, logs]) => (logs as any)[stackCompound.compound]).sort(([a], [b]) => a.localeCompare(b));
              const totalDoses = compLogs.length;
              const lastDoseDate = compLogs.length > 0 ? compLogs[compLogs.length - 1][0] : null;
              const hoursSinceLastDose = lastDoseDate ? (Date.now() - new Date(lastDoseDate).getTime()) / (1000 * 60 * 60) : 999;

              // Saturation = sum of remaining fractions from each dose
              let saturation = 0;
              compLogs.forEach(([date]) => {
                const hoursAgo = (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60);
                saturation += Math.pow(0.5, hoursAgo / hlHours);
              });
              // Steady state reference = 1/(1 - 0.5^(dosing_interval/half_life))
              const ssStr = pk.steadyStateIn || '';
              const satPct = totalDoses > 0 ? Math.min(Math.round(saturation * 100), 100) : 0;
              const statusLabel = satPct >= 85 ? 'At steady state' : satPct > 0 ? 'Building up' : 'No doses logged';
              const statusColor = satPct >= 85 ? '#34C759' : satPct > 0 ? Colors.accent : Colors.grey400;
              const daysAgo = lastDoseDate ? Math.round(hoursSinceLastDose / 24) : null;

              return (
                <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
                  <LinearGradient colors={['#2a2a2e', '#3a3a40', '#4a4a50']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.satCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View>
                        <Text style={s.satLabel}>SATURATION</Text>
                        <Text style={s.satValue}>{satPct}<Text style={s.satUnit}>%</Text></Text>
                      </View>
                      <TouchableOpacity onPress={() => Alert.alert('Saturation', 'Saturation estimates the current compound level in your body based on your dose history and the compound\'s half-life.\n\n• 0% — No active compound detected\n• 1–84% — Building up toward steady state\n• 85–100% — At or near steady state\n\nCalculated using exponential decay: each dose contributes a fraction that halves every half-life period.')}>
                        <HelpCircle size={18} color="rgba(255,255,255,0.4)" />
                      </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <View style={[s.satStatusDot, { backgroundColor: statusColor }]} />
                      <Text style={s.satStatus}><Text style={{ color: statusColor, fontWeight: '600' }}>{statusLabel}</Text>{satPct > 0 && satPct < 85 ? '  ·  of steady state' : ''}</Text>
                    </View>
                  </LinearGradient>

                  {/* Quick stats pills */}
                  <View style={s.quickRow}>
                    <View style={s.quickPill}>
                      <Text style={s.quickPillValue}>{pk.halfLife}</Text>
                      <Text style={s.quickPillLabel}>t½</Text>
                    </View>
                    <View style={s.quickPill}>
                      <Text style={s.quickPillValue}>{pk.steadyStateIn}</Text>
                      <Text style={s.quickPillLabel}>To steady state</Text>
                    </View>
                    <View style={s.quickPill}>
                      <Text style={s.quickPillValue}>{daysAgo !== null ? `${daysAgo}d ago` : '—'}</Text>
                      <Text style={s.quickPillLabel}>Last dose</Text>
                    </View>
                  </View>

                  {/* Cumulative Saturation Graph */}
                  {totalDoses > 0 && (() => {
                    const gW = SCREEN_WIDTH - 40;
                    const gH = 130;
                    const days = 30;
                    const nowMs = Date.now();
                    const startMs = nowMs - (days * 86400000);
                    const pts: {x:number;y:number}[] = [];
                    let mY = 1;
                    for (let i = 0; i <= days; i++) {
                      const t = startMs + (i * 86400000);
                      let lv = 0;
                      compLogs.forEach(([d]) => { const dt = new Date(d).getTime(); if (dt <= t) lv += Math.pow(0.5, (t - dt) / (hlHours * 3600000)); });
                      if (lv > mY) mY = lv;
                      pts.push({ x: (i / days) * gW, y: lv });
                    }
                    const nPts = pts.map(p => ({ x: p.x, y: gH - (mY > 0 ? (p.y / mY) * (gH - 16) : 0) - 8 }));
                    let pD = nPts.length > 0 ? `M ${nPts[0].x} ${nPts[0].y}` : '';
                    for (let i = 1; i < nPts.length; i++) { const cx = (nPts[i-1].x + nPts[i].x) / 2; pD += ` C ${cx} ${nPts[i-1].y}, ${cx} ${nPts[i].y}, ${nPts[i].x} ${nPts[i].y}`; }
                    const fD = pD + ` L ${gW} ${gH} L 0 ${gH} Z`;
                    const dLbls = [0,1,2,3,4].map(i => new Date(startMs + (i * (days/4) * 86400000)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                    const cc = stackCompound.db.color || Colors.accent;
                    return (
                      <View style={{ marginTop: 16 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 8 }}>CUMULATIVE SATURATION</Text>
                        <Svg width={gW} height={gH} viewBox={`0 0 ${gW} ${gH}`}>
                          <Defs>
                            <SvgLinearGradient id="gFill" x1="0" y1="0" x2="0" y2="1">
                              <Stop offset="0" stopColor={cc} stopOpacity="0.25" />
                              <Stop offset="1" stopColor={cc} stopOpacity="0.02" />
                            </SvgLinearGradient>
                          </Defs>
                          {[0,0.25,0.5,0.75,1].map((p,i) => <Path key={i} d={`M 0 ${8+(gH-16)*(1-p)} H ${gW}`} stroke="rgba(200,205,210,0.08)" strokeWidth={0.5} />)}
                          <Path d={fD} fill="url(#gFill)" />
                          <Path d={pD} fill="none" stroke={cc} strokeWidth={2} strokeLinecap="round" />
                          {nPts.length > 0 && <SvgCircle cx={nPts[nPts.length-1].x} cy={nPts[nPts.length-1].y} r={4} fill={cc} stroke="#fff" strokeWidth={1.5} />}
                        </Svg>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                          {dLbls.map((l,i) => <Text key={i} style={{ fontSize: 9, color: Colors.grey400 }}>{l}</Text>)}
                        </View>
                      </View>
                    );
                  })()}
                </View>
              );
            })()}

            {/* ── Pharmacokinetic Summary ── */}
            {stackCompound?.db?.pharmacokinetics && (
              <View style={s.sectionCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary }}>Pharmacokinetic Summary</Text>
                  <TouchableOpacity onPress={() => Alert.alert('Pharmacokinetics', 'Pharmacokinetic (PK) data describes how your body absorbs, distributes, metabolizes, and eliminates a compound.\n\n• Half-life: Time for blood levels to decrease by 50%\n• Time to Peak: Time to reach maximum concentration\n• Steady State: When input rate equals elimination rate\n• Bioavailability: % of dose reaching systemic circulation\n• Accumulation: Build-up factor with repeated dosing\n• Full Clearance: ~5 half-lives for complete elimination')}>
                    <HelpCircle size={14} color={Colors.grey400} />
                  </TouchableOpacity>
                </View>
                <View style={s.pkGridDark}>
                  {[
                    { label: 'HALF-LIFE', value: stackCompound.db.pharmacokinetics.halfLife },
                    { label: 'TIME TO PEAK', value: stackCompound.db.pharmacokinetics.timeToPeak },
                    { label: 'STEADY STATE IN', value: stackCompound.db.pharmacokinetics.steadyStateIn },
                    { label: 'DOSES TO SS', value: stackCompound.db.pharmacokinetics.dosesToSteadyState },
                    { label: 'BIOAVAILABILITY', value: stackCompound.db.pharmacokinetics.bioavailability },
                    { label: 'FULL CLEARANCE', value: stackCompound.db.pharmacokinetics.fullClearance },
                    { label: 'ACCUMULATION', value: stackCompound.db.pharmacokinetics.accumulation },
                    { label: 'DOSE (WT-ADJ)', value: `${stackCompound.dose || '—'}${stackCompound.unit || ''}` },
                  ].map((item, i) => (
                    <View key={item.label} style={s.pkCellDark}>
                      <Text style={s.pkCellDarkLabel}>{item.label}</Text>
                      <Text style={s.pkCellDarkValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>
                <View style={[s.pkMetaRow, { marginTop: 8 }]}>
                  <Text style={s.pkMetaLabel}>METABOLISM</Text>
                  <Text style={s.pkMetaValue}>{stackCompound.db.pharmacokinetics.metabolism}</Text>
                </View>
              </View>
            )}

            {/* ── Dose Impact ── */}
            {(() => {
              const compLogs = Object.entries(allLogs)
                .filter(([, logs]) => (logs as any)[stackCompound?.compound])
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 5);
              if (compLogs.length === 0) return null;

              const pk = stackCompound?.db?.pharmacokinetics;
              const hlStr = pk?.halfLife || '';
              let hlHours = 4;
              if (hlStr.includes('day')) hlHours = parseFloat(hlStr.replace(/[^0-9.]/g, '')) * 24;
              else if (hlStr.includes('hr')) hlHours = parseFloat(hlStr.replace(/[^0-9.]/g, ''));
              else if (hlStr.includes('min')) hlHours = parseFloat(hlStr.replace(/[^0-9.]/g, '')) / 60;

              return (
                <View style={s.sectionCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary }}>Dose Impact</Text>
                    <TouchableOpacity onPress={() => Alert.alert('Dose Impact', 'Shows how much of each recent dose remains active in your body right now.\n\nEach dose decays by 50% every half-life period. The percentage shown is the estimated remaining compound from that specific dose based on time elapsed.\n\nThis helps you understand the cumulative effect of your dosing schedule.')}>
                      <HelpCircle size={14} color={Colors.grey400} />
                    </TouchableOpacity>
                  </View>
                  <View>
                    {compLogs.map(([date], idx) => {
                      const hoursAgo = (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60);
                      const remaining = Math.max(0, Math.round(Math.pow(0.5, hoursAgo / hlHours) * 100));
                      const dAgo = Math.round(hoursAgo / 24);
                      const dateLabel = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      const barColor = remaining === 0 ? Colors.textPrimary : remaining >= 50 ? '#34C759' : remaining >= 15 ? '#F59E0B' : '#EF4444';
                      return (
                        <View key={date} style={{ marginBottom: idx < compLogs.length - 1 ? 14 : 0 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textPrimary }}>Dose {compLogs.length - idx}  <Text style={{ fontWeight: '400', color: Colors.textSecondary }}>({dateLabel})</Text></Text>
                            <Text style={{ fontSize: 13, color: barColor, fontWeight: '600' }}>{remaining}%  <Text style={{ color: Colors.textSecondary, fontWeight: '400' }}>{dAgo}d ago</Text></Text>
                          </View>
                          <View style={{ height: 4, backgroundColor: 'rgba(200,205,210,0.12)', borderRadius: 2, overflow: 'hidden' }}>
                            <View style={{ height: '100%', width: `${remaining}%`, backgroundColor: barColor, borderRadius: 2 }} />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })()}

            {/* ── What If... ── */}
            {stackCompound?.db?.whatIf && (
              <View style={s.sectionCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <HelpCircle size={16} color={Colors.textSecondary} />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary }}>What if...</Text>
                </View>
                  {[
                    { key: 'miss', icon: <Calendar size={16} color={Colors.textSecondary} />, label: 'I miss my next dose?' },
                    { key: 'double', icon: <AlertCircle size={16} color={Colors.textSecondary} />, label: 'I double my dose?' },
                    { key: 'changeSchedule', icon: <RefreshCw size={16} color={Colors.textSecondary} />, label: 'I change my schedule?' },
                    { key: 'stop', icon: <StopCircle size={16} color={Colors.textSecondary} />, label: 'I stop completely?' },
                  ].map((item, i) => (
                    <View key={item.key}>
                      <TouchableOpacity
                        style={s.whatIfRow}
                        activeOpacity={0.7}
                        onPress={() => setWhatIfExpanded(whatIfExpanded === item.key ? null : item.key)}
                      >
                        {item.icon}
                        <Text style={s.whatIfLabel}>{item.label}</Text>
                        <ChevronDown size={14} color={Colors.grey400} style={{ transform: [{ rotate: whatIfExpanded === item.key ? '180deg' : '0deg' }] }} />
                      </TouchableOpacity>
                      {whatIfExpanded === item.key && (
                        <Text style={s.whatIfContent}>{(stackCompound.db.whatIf as any)[item.key]}</Text>
                      )}
                      {i < 3 && <View style={{ height: 1, backgroundColor: 'rgba(200,205,210,0.08)', marginVertical: 2 }} />}
                    </View>
                  ))}
              </View>
            )}


            <Text style={{ textAlign: 'center', fontSize: 11, color: Colors.grey400, marginTop: 8, marginHorizontal: 40 }}>
              Pharmacokinetic data based on published half-life research. See Peptide Library for full citations.
            </Text>
          </ScrollView>
        </View>
      </Modal>

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
  profileInitial: { fontSize: 16, fontWeight: '700', color: '#FFF', letterSpacing: 0.5 },

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

  sectionGlass: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  menuRowDark: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  menuTextDark: {
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

  // ── Day Strip ──
  dayStrip: {
    backgroundColor: Colors.panelBg,
    borderRadius: Radius.xl,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.3)',
    ...Shadows.card,
  },
  dayStripLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  dayStripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayItem: { alignItems: 'center', gap: 4 },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.grey200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dayNum: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  dayLetter: { fontSize: 10, color: Colors.grey400 },
  dayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#34C759' },

  // ── Unified Dose Card ──
  unifiedDoseCard: {
    backgroundColor: Colors.panelBg,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    ...Shadows.card,
  },
  unifiedDoseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  unifiedDoseLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1 },
  missedBadge: { fontSize: 11, fontWeight: '600', color: '#FF3B30' },
  allDoneBadge: { fontSize: 11, fontWeight: '600', color: '#34C759' },
  doseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  doseCircleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.grey200,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  doseCircleBtnDone: { backgroundColor: '#34C759', borderColor: '#34C759' },
  doseItemName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  doseItemMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  markDoneBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.grey200,
    backgroundColor: Colors.grey100,
  },
  markDoneText: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  loggedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: 'rgba(52,199,89,0.10)' },
  loggedText: { fontSize: 12, fontWeight: '600', color: '#34C759' },

  // ── Spending ──
  spendCard: {
    backgroundColor: Colors.panelBg,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.2)',
  },
  spendStatsRow: { flexDirection: 'row', alignItems: 'center' },
  spendStatItem: { flex: 1, alignItems: 'center', gap: 2 },
  spendStatVal: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  spendStatLabel: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.3 },
  spendStatDivider: { width: 1, height: 28, backgroundColor: 'rgba(200,205,210,0.2)' },
  chartArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 110, paddingTop: 10 },
  chartCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  chartVal: { fontSize: 9, fontWeight: '600', color: Colors.textSecondary },
  chartBar: { width: 20, borderRadius: 4, backgroundColor: Colors.cardDark },
  chartBarProjection: { backgroundColor: 'rgba(200,205,210,0.35)' },
  chartLabel: { fontSize: 10, fontWeight: '600', color: Colors.grey400 },
  chartSectionHeader: { borderTopWidth: 1, borderTopColor: 'rgba(200,205,210,0.15)', paddingTop: 12 },
  chartSectionTitle: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },

  // Breakdown
  breakdownList: { gap: 10, borderTopWidth: 1, borderTopColor: 'rgba(200,205,210,0.15)', paddingTop: 14 },
  breakdownTitle: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  breakdownName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  breakdownBarBg: { height: 4, backgroundColor: 'rgba(200,205,210,0.2)', borderRadius: 2, overflow: 'hidden' },
  breakdownBarFill: { height: '100%', backgroundColor: Colors.cardDark, borderRadius: 2 },
  breakdownVal: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, minWidth: 44, textAlign: 'right' },
  // ── Section Card ──
  sectionCard: { marginHorizontal: 20, marginBottom: 16, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18 },

  // ── Adherence Modal ──
  adhScreen: { flex: 1, backgroundColor: Colors.bgPrimary },
  adhTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 24 },
  adhBackBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.grey100, justifyContent: 'center', alignItems: 'center' },
  adhScreenTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary, letterSpacing: -0.2 },

  adhHero: { alignItems: 'center', paddingVertical: 24, marginHorizontal: 20, marginBottom: 8 },
  adhHeroNum: { fontSize: 56, fontWeight: '300', color: Colors.textPrimary, letterSpacing: -3 },
  adhHeroPct: { fontSize: 28, fontWeight: '300', color: Colors.textSecondary },
  adhHeroBar: { width: '100%', height: 6, backgroundColor: 'rgba(200,205,210,0.15)', borderRadius: 3, overflow: 'hidden', marginTop: 12, marginBottom: 8 },
  adhHeroBarFill: { height: '100%', backgroundColor: Colors.cardDark, borderRadius: 3 },
  adhHeroSub: { fontSize: 13, fontWeight: '400', color: Colors.textSecondary },

  adhMetrics: { flexDirection: 'row', marginHorizontal: 20, paddingVertical: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(200,205,210,0.12)', marginBottom: 28 },
  adhMetric: { flex: 1, alignItems: 'center' },
  adhMetricNum: { fontSize: 24, fontWeight: '600', color: Colors.textPrimary, letterSpacing: -0.5 },
  adhMetricLbl: { fontSize: 12, fontWeight: '400', color: Colors.textSecondary, marginTop: 2 },
  adhMetricDiv: { width: 1, backgroundColor: 'rgba(200,205,210,0.15)' },

  adhMostUsed: { marginHorizontal: 20, marginBottom: 28 },
  adhMostUsedLabel: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  adhMostUsedRow: { flexDirection: 'row', alignItems: 'center' },
  adhMostUsedDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  adhMostUsedName: { flex: 1, fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  adhMostUsedCount: { fontSize: 17, fontWeight: '600', color: Colors.textSecondary },

  adhBreakdown: { marginHorizontal: 20 },
  adhBreakdownTitle: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 },
  adhBreakdownRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: 'rgba(200,205,210,0.08)' },
  adhBreakdownDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  adhBreakdownName: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  adhBreakdownVal: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, minWidth: 24, textAlign: 'right', marginRight: 12 },
  adhBreakdownBarBg: { width: 48, height: 3, backgroundColor: 'rgba(200,205,210,0.15)', borderRadius: 2, overflow: 'hidden', marginRight: 10 },
  adhBreakdownBarFill: { height: '100%', borderRadius: 2 },
  adhBreakdownPct: { fontSize: 13, fontWeight: '400', color: Colors.textSecondary, minWidth: 32, textAlign: 'right' },

  // ── My Stack ──
  stackDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  stackRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 18, marginLeft: 30, borderLeftWidth: 1, borderLeftColor: 'rgba(200,205,210,0.12)' },
  stackName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  stackSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },

  // ── Saturation Card ──
  satCard: { borderRadius: 18, padding: 22, paddingBottom: 18, marginBottom: 14 },
  satLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 1.2, marginBottom: 4 },
  satValue: { fontSize: 56, fontWeight: '200', color: '#FFFFFF', letterSpacing: -2, lineHeight: 62 },
  satUnit: { fontSize: 28, fontWeight: '300', color: 'rgba(255,255,255,0.6)' },
  satStatusDot: { width: 6, height: 6, borderRadius: 3 },
  satStatus: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },

  // ── Quick Stats Pills ──
  quickRow: { flexDirection: 'row', gap: 8 },
  quickPill: { flex: 1, backgroundColor: Colors.grey100, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  quickPillValue: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  quickPillLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '500' },

  // ── Compound Detail Modal ──
  pkSectionLabel: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6 },
  pkGridDark: { flexDirection: 'row', flexWrap: 'wrap', borderRadius: 14, gap: 6 },
  pkCellDark: { width: '47%', backgroundColor: Colors.grey100, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 14 },
  pkCellDarkLabel: { fontSize: 9, fontWeight: '700', color: Colors.grey400, letterSpacing: 0.6, marginBottom: 6 },
  pkCellDarkValue: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3 },
  pkGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: Colors.grey100, borderRadius: 14, overflow: 'hidden' },
  pkCell: { width: '50%', paddingVertical: 14, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(200,205,210,0.1)' },
  pkCellLabel: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
  pkCellValue: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  pkMetaRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.grey100, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  pkMetaLabel: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5, marginRight: 10 },
  pkMetaValue: { flex: 1, fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  pkNoteCard: { backgroundColor: Colors.grey100, borderRadius: 14, padding: 16 },
  pkRiskBadge: { backgroundColor: 'rgba(52,199,89,0.12)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  pkRiskText: { fontSize: 9, fontWeight: '700', color: '#34C759', letterSpacing: 0.5 },

  // ── What If Expandable Rows ──
  whatIfRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 10 },
  whatIfLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  whatIfContent: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, paddingBottom: 12, paddingLeft: 26 },

  // ── Half-Life Footer ──
  hlFooter: { marginHorizontal: 20, marginBottom: 24, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: Colors.grey100, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hlFooterText: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },

  // ── Dose Time Badge ──
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.grey100, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  timeBadgeText: { fontSize: 10, fontWeight: '600', color: Colors.grey400 },
});
