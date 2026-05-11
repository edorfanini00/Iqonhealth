import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Dimensions, Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, TrendingUp, HelpCircle, Wallet, BarChart3, CalendarDays, FlaskConical, ShoppingBag } from 'lucide-react-native';
import Svg, { Rect, Line, Text as SvgText, Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { Colors, Spacing } from '@/constants/theme';
import { getProtocols, getDoseLogs, getVialInventory } from '@/utils/storage';
import { peptidesDB } from '@/data/peptides';

const SCREEN_W = Dimensions.get('window').width;
const CHART_W = SCREEN_W - 64;
const CHART_H = 150;
const PAD_TOP = 20;

export default function SpendingDetail() {
  const router = useRouter();
  const [protocols, setProtocols] = useState<any[]>([]);
  const [allLogs, setAllLogs] = useState<Record<string, Record<string, boolean>>>({});
  const [inventory, setInventory] = useState<Record<string, any>>({});

  useFocusEffect(useCallback(() => {
    (async () => {
      setProtocols(await getProtocols());
      setAllLogs(await getDoseLogs());
      setInventory(await getVialInventory());
    })();
  }, []));

  const data = useMemo(() => {
    // Per-compound info from protocols — relaxed: only needs pricePerVial
    const compInfo: Record<string, { pricePerVial: number; vialSizeMl: number; dosePerUseMl: number; costPerDose: number; frequency: string; color: string; repeatDays: number; weeklyDays: any[]; dosesPerVial: number; cycleWeeks: number }> = {};
    protocols.forEach((p: any) => {
      (p.compounds || []).forEach((c: any) => {
        if (c.pricePerVial && c.pricePerVial > 0) {
          const vialMl = parseFloat(c.vialSizeMl) || 0;
          const doseMl = parseFloat(c.dosePerUseMl) || 0;
          const dpv = (vialMl && doseMl) ? vialMl / doseMl : 0;
          const pep = (peptidesDB as any)[c.compound];
          compInfo[c.compound] = {
            pricePerVial: c.pricePerVial,
            vialSizeMl: vialMl,
            dosePerUseMl: doseMl,
            costPerDose: dpv > 0 ? c.pricePerVial / dpv : 0,
            dosesPerVial: dpv,
            frequency: c.frequency || 'daily',
            color: c.color || pep?.color || '#999',
            repeatDays: parseInt(c.repeatDays) || 1,
            weeklyDays: c.weeklyDays || [],
            cycleWeeks: pep?.typicalCycle || 0,
          };
        }
      });
    });

    // ── Total Spent = vials purchased × price (upfront cost) ──
    let totalSpent = 0;
    const perCompound: { name: string; vialsPurchased: number; pricePerVial: number; totalSpent: number; costPerDose: number; dosesPerVial: number; color: string; vialsOnHand: number; cycleWeeks: number; costPerWeek: number; costPerMonth: number }[] = [];

    Object.entries(inventory).forEach(([compound, inv]: [string, any]) => {
      const ci = compInfo[compound];
      if (!ci) return;
      const purchased = inv.totalPurchased || inv.vialCount || 0;
      const spent = purchased * ci.pricePerVial;
      totalSpent += spent;
      // Calculate doses per day for this compound
      let dpd = 1;
      if (ci.frequency === 'weekly') dpd = (ci.weeklyDays.length || 1) / 7;
      else if (ci.frequency === 'everyX') dpd = 1 / ci.repeatDays;
      const weekCost = ci.costPerDose * dpd * 7;
      const monthCost = ci.costPerDose * dpd * 30;
      perCompound.push({
        name: compound,
        vialsPurchased: purchased,
        pricePerVial: ci.pricePerVial,
        totalSpent: spent,
        costPerDose: ci.costPerDose,
        dosesPerVial: ci.dosesPerVial,
        color: ci.color,
        vialsOnHand: inv.vialCount || 0,
        cycleWeeks: ci.cycleWeeks,
        costPerWeek: weekCost,
        costPerMonth: monthCost,
      });
    });

    // Also include compounds that have pricePerVial but aren't in inventory yet
    Object.entries(compInfo).forEach(([compound, ci]) => {
      if (perCompound.find(p => p.name === compound)) return;
      let dpd2 = 1;
      if (ci.frequency === 'weekly') dpd2 = (ci.weeklyDays.length || 1) / 7;
      else if (ci.frequency === 'everyX') dpd2 = 1 / ci.repeatDays;
      perCompound.push({
        name: compound,
        vialsPurchased: 0,
        pricePerVial: ci.pricePerVial,
        totalSpent: 0,
        costPerDose: ci.costPerDose,
        dosesPerVial: ci.dosesPerVial,
        color: ci.color,
        vialsOnHand: 0,
        cycleWeeks: ci.cycleWeeks,
        costPerWeek: ci.costPerDose * dpd2 * 7,
        costPerMonth: ci.costPerDose * dpd2 * 30,
      });
    });

    perCompound.sort((a, b) => b.totalSpent - a.totalSpent);

    // ── Vial purchase spending by month (for trend) ──
    // Allocate each compound's total purchase cost to the month its first dose was logged
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let totalDoses = 0;
    const monthly: { label: string; total: number }[] = [];
    for (let m = 5; m >= 0; m--) {
      const d = new Date(today.getFullYear(), today.getMonth() - m, 1);
      monthly.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), total: 0 });
    }

    // Find the first dose date for each compound
    const compFirstDose: Record<string, string> = {};
    Object.entries(allLogs).forEach(([dateStr, dayLog]) => {
      if (!dayLog) return;
      Object.entries(dayLog).forEach(([compound, logged]) => {
        if (!logged || !compInfo[compound]) return;
        totalDoses++;
        if (!compFirstDose[compound] || dateStr < compFirstDose[compound]) {
          compFirstDose[compound] = dateStr;
        }
      });
    });

    // Allocate each compound's total vial spend to the month it was first dosed
    Object.entries(compFirstDose).forEach(([compound, firstDate]) => {
      const ci = compInfo[compound];
      if (!ci || ci.pricePerVial <= 0) return;
      const inv = inventory[compound];
      const purchased = inv ? (inv.totalPurchased || inv.vialCount || 0) : 0;
      if (purchased <= 0) return;
      const spentOnCompound = purchased * ci.pricePerVial;
      const logDate = new Date(firstDate);
      const logMonth = logDate.getMonth();
      const logYear = logDate.getFullYear();
      const bucket = monthly.find((_, i) => {
        const bd = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
        return bd.getMonth() === logMonth && bd.getFullYear() === logYear;
      });
      if (bucket) bucket.total += spentOnCompound;
    });
    const maxHist = Math.max(...monthly.map(m => m.total), 1);

    // ── Projection (cycle-aware) ──
    // If a compound has a typicalCycle of N weeks, it costs money N/52 of the year
    let dailyCost = 0;
    Object.entries(compInfo).forEach(([, ci]) => {
      if (ci.costPerDose <= 0) return;
      let dpd = 1;
      if (ci.frequency === 'weekly') dpd = (ci.weeklyDays.length || 1) / 7;
      else if (ci.frequency === 'everyX') dpd = 1 / ci.repeatDays;
      // Adjust for cycle: if 8-week cycle, on average you're dosing 8/52 of the year (with breaks)
      // But since some people run back-to-back, use a generous 80% uptime estimate
      const cycleMultiplier = ci.cycleWeeks > 0 ? Math.min(1, ci.cycleWeeks / (ci.cycleWeeks + 4)) : 1;
      dailyCost += ci.costPerDose * dpd * cycleMultiplier;
    });
    const projMonthly = dailyCost * 30;
    const projAnnual = dailyCost * 365;

    // 12-month cumulative projection
    const projection: { label: string; monthly: number; cumulative: number }[] = [];
    let cum = totalSpent;
    for (let m = 0; m < 12; m++) {
      cum += projMonthly;
      const d = new Date(today.getFullYear(), today.getMonth() + m + 1, 1);
      projection.push({
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        monthly: projMonthly,
        cumulative: cum,
      });
    }
    const maxCum = projection.length > 0 ? projection[projection.length - 1].cumulative : 1;

    // ── This Month stats (use vial-based monthly bucket) ──
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthBucket = monthly[monthly.length - 1];
    const thisMonthSpent = thisMonthBucket ? thisMonthBucket.total : 0;

    // Count doses logged this month for the explainer
    let thisMonthDoses = 0;
    Object.entries(allLogs).forEach(([dateStr, dayLog]) => {
      if (!dayLog) return;
      const logDate = new Date(dateStr);
      if (logDate >= thisMonthStart && logDate <= today) {
        Object.entries(dayLog).forEach(([compound, logged]) => {
          if (!logged || !compInfo[compound]) return;
          thisMonthDoses++;
        });
      }
    });

    // Extrapolate remaining days in month
    const dayOfMonth = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - dayOfMonth;
    const estFullMonthCost = projMonthly > 0 ? projMonthly : (dayOfMonth > 0 ? (thisMonthSpent / dayOfMonth) * daysInMonth : 0);

    // Vials bought this month
    let vialsBoughtThisMonth = 0;
    Object.entries(inventory).forEach(([compound, inv]: [string, any]) => {
      if (!compInfo[compound]) return;
      // Use purchaseLog if available, otherwise fall back to total
      if (inv.purchaseLog && Array.isArray(inv.purchaseLog)) {
        inv.purchaseLog.forEach((log: any) => {
          const purchaseDate = new Date(log.date);
          if (purchaseDate >= thisMonthStart && purchaseDate <= today) {
            vialsBoughtThisMonth += log.quantity || 1;
          }
        });
      }
    });

    // Total vials on hand
    let totalVialsOnHand = 0;
    Object.entries(inventory).forEach(([compound, inv]: [string, any]) => {
      if (!compInfo[compound]) return;
      totalVialsOnHand += inv.vialCount || 0;
    });

    // Days until reorder (based on remaining doses across all vials)
    let totalRemainingDoses = 0;
    Object.entries(inventory).forEach(([compound, inv]: [string, any]) => {
      const ci = compInfo[compound];
      if (!ci || ci.dosesPerVial <= 0) return;
      const remainingUses = (inv.vialCount || 0) * ci.dosesPerVial - (inv.usedDoses || 0);
      totalRemainingDoses += Math.max(0, remainingUses);
    });
    // Estimate days until reorder from daily dose frequency
    const totalDailyDoses = Object.values(compInfo).reduce((sum, ci) => {
      if (ci.costPerDose <= 0) return sum;
      let dpd = 1;
      if (ci.frequency === 'weekly') dpd = (ci.weeklyDays.length || 1) / 7;
      else if (ci.frequency === 'everyX') dpd = 1 / ci.repeatDays;
      return sum + dpd;
    }, 0);
    const daysUntilReorder = totalDailyDoses > 0 ? Math.floor(totalRemainingDoses / totalDailyDoses) : 0;

    return { totalSpent, totalDoses, perCompound, monthly, maxHist, projMonthly, projAnnual, dailyCost, projection, maxCum, thisMonthSpent, thisMonthDoses, estFullMonthCost, vialsBoughtThisMonth, totalVialsOnHand, daysUntilReorder, remainingDays };
  }, [protocols, allLogs, inventory]);

  const hasData = data.totalSpent > 0 || data.projAnnual > 0;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={s.backBtn}>
          <ArrowLeft size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Spending</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {!hasData ? (
          <View style={s.card}>
            <Text style={s.emptyText}>Add a price per vial when creating or editing a protocol to start tracking your spending.</Text>
          </View>
        ) : (
          <>
            {/* ── Total Spent Hero ── */}
            <View style={s.card}>
              <Text style={s.heroLabel}>TOTAL SPENT</Text>
              <Text style={s.heroBig}><Text style={s.heroDollar}>$</Text>{data.totalSpent.toFixed(0)}</Text>
            </View>

            {/* ── Key Metrics 2×2 ── */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={[s.card, { flex: 1, gap: 4 }]}>
                <View style={s.cardLabelRow}>
                  <Text style={s.miniLabel}>Spent This Month</Text>
                  <Wallet size={13} color={Colors.grey400} />
                </View>
                <Text style={s.miniBig}><Text style={s.dollarMini}>$</Text>{data.thisMonthSpent.toFixed(0)}</Text>
              </View>
              <TouchableOpacity
                style={[s.card, { flex: 1, gap: 4 }]}
                activeOpacity={0.7}
                onPress={() => Alert.alert(
                  'Estimated Monthly Cost',
                  `This is your estimated cost for ${new Date().toLocaleDateString('en-US', { month: 'long' })}, based on your actual doses logged so far (${data.thisMonthDoses} doses = $${data.thisMonthSpent.toFixed(0)}) extrapolated across the full month (${data.remainingDays} days remaining).\n\nFor example, if a vial lasts 20 doses and you dose daily, your monthly cost accounts for all 30 days — including the portion of a new vial you'll need for the remaining 10 days.`)}
              >
                <View style={s.cardLabelRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={s.miniLabel}>Est. Full Month</Text>
                    <HelpCircle size={10} color={Colors.grey400} />
                  </View>
                  <BarChart3 size={13} color={Colors.grey400} />
                </View>
                <Text style={s.miniBig}><Text style={s.dollarMini}>$</Text>{data.estFullMonthCost.toFixed(0)}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={[s.card, { flex: 1, gap: 4 }]}>
                <View style={s.cardLabelRow}>
                  <Text style={s.miniLabel}>Proj. Annual</Text>
                  <TrendingUp size={13} color={Colors.grey400} />
                </View>
                <Text style={s.miniBig}><Text style={s.dollarMini}>$</Text>{data.projAnnual.toFixed(0)}</Text>
              </View>
              <View style={[s.card, { flex: 1, gap: 4 }]}>
                <View style={s.cardLabelRow}>
                  <Text style={s.miniLabel}>Cost / Day</Text>
                  <CalendarDays size={13} color={Colors.grey400} />
                </View>
                <Text style={s.miniBig}><Text style={s.dollarMini}>$</Text>{data.dailyCost.toFixed(2)}</Text>
              </View>
            </View>

            {/* ── Vial Stats ── */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={[s.card, { flex: 1, gap: 4 }]}>
                <View style={s.cardLabelRow}>
                  <Text style={s.miniLabel}>Vials On Hand</Text>
                  <FlaskConical size={13} color={Colors.grey400} />
                </View>
                <Text style={s.miniBig}>{data.totalVialsOnHand}</Text>
              </View>
              <View style={[s.card, { flex: 1, gap: 4 }]}>
                <View style={s.cardLabelRow}>
                  <Text style={s.miniLabel}>Bought This Mo.</Text>
                  <ShoppingBag size={13} color={Colors.grey400} />
                </View>
                <Text style={s.miniBig}>{data.vialsBoughtThisMonth}</Text>
              </View>
            </View>

            {/* ── Spending Trend (SVG area chart) ── */}
            {data.monthly.some(m => m.total > 0) && (
              <View style={s.card}>
                <Text style={s.cardTitle}>Spending Trend</Text>
                <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: -8, marginBottom: 4 }}>Vial cost by month based on usage</Text>
                <Svg width={CHART_W} height={CHART_H + 24}>
                  <Defs>
                    <LinearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor={Colors.cardDark} stopOpacity="0.2" />
                      <Stop offset="1" stopColor={Colors.cardDark} stopOpacity="0.02" />
                    </LinearGradient>
                  </Defs>
                  {/* Grid lines */}
                  {[0, 0.5, 1].map((r, i) => (
                    <Line key={i} x1={0} y1={PAD_TOP + (CHART_H - PAD_TOP) * (1 - r)} x2={CHART_W} y2={PAD_TOP + (CHART_H - PAD_TOP) * (1 - r)} stroke="rgba(200,205,210,0.08)" strokeWidth={1} />
                  ))}

                  {/* Area fill */}
                  {(() => {
                    const pts = data.monthly.map((m, i) => {
                      const x = (i / (data.monthly.length - 1)) * CHART_W;
                      const y = PAD_TOP + (CHART_H - PAD_TOP) * (1 - m.total / data.maxHist);
                      return { x, y };
                    });
                    // Smooth cubic Bézier curve (clamped to chart bounds)
                    const smoothLine = (points: {x:number,y:number}[]) => {
                      if (points.length < 2) return `M${points[0].x},${points[0].y}`;
                      const clampY = (v: number) => Math.max(PAD_TOP, Math.min(CHART_H, v));
                      let d = `M${points[0].x},${points[0].y}`;
                      for (let i = 0; i < points.length - 1; i++) {
                        const p0 = points[Math.max(i - 1, 0)];
                        const p1 = points[i];
                        const p2 = points[i + 1];
                        const p3 = points[Math.min(i + 2, points.length - 1)];
                        const cp1x = p1.x + (p2.x - p0.x) / 6;
                        const cp1y = clampY(p1.y + (p2.y - p0.y) / 6);
                        const cp2x = p2.x - (p3.x - p1.x) / 6;
                        const cp2y = clampY(p2.y - (p3.y - p1.y) / 6);
                        d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
                      }
                      return d;
                    };
                    const linePath = smoothLine(pts);
                    const areaPath = `${linePath} L${CHART_W},${CHART_H} L0,${CHART_H} Z`;
                    return (
                      <>
                        <Path d={areaPath} fill="url(#trendFill)" />
                        <Path d={linePath} stroke={Colors.cardDark} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        {pts.map((p, i) => (
                          <React.Fragment key={i}>
                            <Circle cx={p.x} cy={p.y} r={4} fill={Colors.panelBg} stroke={Colors.cardDark} strokeWidth={2} />
                            {data.monthly[i].total > 0 && (
                              <SvgText x={p.x} y={p.y - 12} fontSize={10} fontWeight="700" fill={Colors.textPrimary} textAnchor="middle">
                                {`$${data.monthly[i].total.toFixed(0)}`}
                              </SvgText>
                            )}
                          </React.Fragment>
                        ))}
                      </>
                    );
                  })()}
                  {/* Month labels */}
                  {data.monthly.map((m, i) => {
                    const x = (i / (data.monthly.length - 1)) * CHART_W;
                    return <SvgText key={i} x={x} y={CHART_H + 16} fontSize={9} fontWeight="600" fill={Colors.grey400} textAnchor="middle">{m.label}</SvgText>;
                  })}
                </Svg>
              </View>
            )}

            {/* ── Compound Breakdown ── */}
            {data.perCompound.length > 0 && (
              <View style={s.card}>
                <Text style={s.cardTitle}>Cost by Peptide</Text>
                {data.perCompound.map((c, i) => {
                  const pct = data.totalSpent > 0 ? (c.totalSpent / data.totalSpent) * 100 : 0;
                  const hasDoseData = c.costPerDose > 0 && c.dosesPerVial > 0;
                  return (
                    <View key={i} style={s.compCard}>
                      <View style={s.compHeader}>
                        <View style={s.compLeft}>
                          <View style={[s.compDot, { backgroundColor: c.color }]} />
                          <View>
                            <Text style={s.compName}>{c.name}</Text>
                            <Text style={s.compSub}>
                              {c.vialsPurchased} vial{c.vialsPurchased !== 1 ? 's' : ''} purchased · {c.vialsOnHand} on hand
                              {c.cycleWeeks > 0 ? ` · ${c.cycleWeeks}wk cycle` : ''}
                            </Text>
                          </View>
                        </View>
                        <Text style={s.compTotal}>${c.totalSpent.toFixed(0)}</Text>
                      </View>
                      {data.totalSpent > 0 && (
                        <View style={s.compBarBg}>
                          <View style={[s.compBarFill, { width: `${Math.max(4, pct)}%`, backgroundColor: c.color }]} />
                        </View>
                      )}
                      <View style={s.compMeta}>
                        <View style={s.metaItem}>
                          <Text style={s.metaLabel}>Dose</Text>
                          <Text style={s.metaVal}>{hasDoseData ? `$${c.costPerDose.toFixed(2)}` : '—'}</Text>
                        </View>
                        <View style={s.metaSep} />
                        <View style={s.metaItem}>
                          <Text style={s.metaLabel}>Week</Text>
                          <Text style={s.metaVal}>{hasDoseData ? `$${c.costPerWeek.toFixed(0)}` : '—'}</Text>
                        </View>
                        <View style={s.metaSep} />
                        <View style={s.metaItem}>
                          <Text style={s.metaLabel}>Month</Text>
                          <Text style={s.metaVal}>{hasDoseData ? `$${c.costPerMonth.toFixed(0)}` : '—'}</Text>
                        </View>
                        <View style={s.metaSep} />
                        <View style={s.metaItem}>
                          <Text style={s.metaLabel}>Vial</Text>
                          <Text style={s.metaVal}>${c.pricePerVial.toFixed(0)}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* ── Projected Spending ── */}
            {data.projAnnual > 0 && (
              <View style={s.card}>
                <View style={s.projHead}>
                  <TrendingUp size={14} color={Colors.textSecondary} />
                  <Text style={s.cardTitle}>12-Month Projection</Text>
                </View>
                <View style={s.statsRow}>
                  <View style={s.statItem}>
                    <Text style={s.statBig}><Text style={s.dollarSign}>$</Text>{data.dailyCost.toFixed(2)}</Text>
                    <Text style={s.statSub}>Daily</Text>
                  </View>
                  <View style={s.statDiv} />
                  <View style={s.statItem}>
                    <Text style={s.statBig}><Text style={s.dollarSign}>$</Text>{data.projMonthly.toFixed(0)}</Text>
                    <Text style={s.statSub}>Monthly</Text>
                  </View>
                  <View style={s.statDiv} />
                  <View style={s.statItem}>
                    <Text style={[s.statBig, { fontSize: 22 }]}><Text style={s.dollarSign}>$</Text>{data.projAnnual.toFixed(0)}</Text>
                    <Text style={s.statSub}>Annual</Text>
                  </View>
                </View>

                {/* Cumulative projection area chart */}
                <Svg width={CHART_W} height={CHART_H + 24}>
                  <Defs>
                    <LinearGradient id="projFill" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor={Colors.cardDark} stopOpacity="0.12" />
                      <Stop offset="1" stopColor={Colors.cardDark} stopOpacity="0.01" />
                    </LinearGradient>
                  </Defs>
                  {[0, 0.5, 1].map((r, i) => (
                    <Line key={i} x1={0} y1={PAD_TOP + (CHART_H - PAD_TOP) * (1 - r)} x2={CHART_W} y2={PAD_TOP + (CHART_H - PAD_TOP) * (1 - r)} stroke="rgba(200,205,210,0.08)" strokeWidth={1} />
                  ))}
                  {(() => {
                    const pts = data.projection.map((m, i) => {
                      const x = (i / (data.projection.length - 1)) * CHART_W;
                      const y = PAD_TOP + (CHART_H - PAD_TOP) * (1 - m.cumulative / data.maxCum);
                      return { x, y };
                    });
                    const smoothLine = (points: {x:number,y:number}[]) => {
                      if (points.length < 2) return `M${points[0].x},${points[0].y}`;
                      const clampY = (v: number) => Math.max(PAD_TOP, Math.min(CHART_H, v));
                      let d = `M${points[0].x},${points[0].y}`;
                      for (let i = 0; i < points.length - 1; i++) {
                        const p0 = points[Math.max(i - 1, 0)];
                        const p1 = points[i];
                        const p2 = points[i + 1];
                        const p3 = points[Math.min(i + 2, points.length - 1)];
                        const cp1x = p1.x + (p2.x - p0.x) / 6;
                        const cp1y = clampY(p1.y + (p2.y - p0.y) / 6);
                        const cp2x = p2.x - (p3.x - p1.x) / 6;
                        const cp2y = clampY(p2.y - (p3.y - p1.y) / 6);
                        d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
                      }
                      return d;
                    };
                    const linePath = smoothLine(pts);
                    const areaPath = `${linePath} L${CHART_W},${CHART_H} L0,${CHART_H} Z`;
                    return (
                      <>
                        <Path d={areaPath} fill="url(#projFill)" />
                        <Path d={linePath} stroke={Colors.cardDark} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6,3" />
                        {pts.filter((_, i) => i === 0 || i === 5 || i === 11).map((p, idx) => {
                          const origIdx = [0, 5, 11][idx];
                          return (
                            <React.Fragment key={idx}>
                              <Circle cx={p.x} cy={p.y} r={3.5} fill={Colors.cardDark} />
                              <SvgText x={p.x} y={p.y - 10} fontSize={10} fontWeight="700" fill={Colors.textPrimary} textAnchor="middle">
                                {`$${data.projection[origIdx].cumulative.toFixed(0)}`}
                              </SvgText>
                            </React.Fragment>
                          );
                        })}
                      </>
                    );
                  })()}
                  {data.projection.map((m, i) => {
                    const x = (i / (data.projection.length - 1)) * CHART_W;
                    return <SvgText key={i} x={x} y={CHART_H + 16} fontSize={8} fontWeight="600" fill={Colors.grey400} textAnchor="middle">{m.label}</SvgText>;
                  })}
                </Svg>
              </View>
            )}
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.panelBg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(200,205,210,0.2)',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: 8, gap: 14 },

  card: {
    backgroundColor: Colors.panelBg, borderRadius: 16, padding: 16, gap: 14,
    borderWidth: 1, borderColor: 'rgba(200,205,210,0.2)',
  },
  cardTitle: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18, paddingVertical: 10 },

  statsRow: { flexDirection: 'row', alignItems: 'center' } as any,
  statItem: { flex: 1, alignItems: 'center', gap: 2 } as any,
  statBig: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary } as any,
  statSub: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.3 } as any,
  statDiv: { width: 1, height: 30, backgroundColor: 'rgba(200,205,210,0.15)' },

  // Compound cards
  compCard: { gap: 8, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(200,205,210,0.15)' },
  compHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } as any,
  compLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 } as any,
  compDot: { width: 10, height: 10, borderRadius: 5 },
  compName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary } as any,
  compSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 } as any,
  compTotal: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary } as any,
  compBarBg: { height: 5, backgroundColor: 'rgba(200,205,210,0.12)', borderRadius: 3, overflow: 'hidden' } as any,
  compBarFill: { height: '100%', borderRadius: 3 },
  compMeta: { flexDirection: 'row', alignItems: 'center' } as any,
  metaItem: { flex: 1, alignItems: 'center', gap: 1 } as any,
  metaLabel: { fontSize: 9, fontWeight: '600', color: Colors.grey400, textTransform: 'uppercase' } as any,
  metaVal: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary } as any,
  metaSep: { width: 1, height: 20, backgroundColor: 'rgba(200,205,210,0.12)' },

  projHead: { flexDirection: 'row', alignItems: 'center', gap: 6 } as any,

  heroLabel: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1.5 } as any,
  heroBig: { fontSize: 36, fontWeight: '700', color: Colors.textPrimary, marginTop: 4 } as any,
  heroDollar: { fontSize: 22, fontWeight: '400', color: Colors.textSecondary } as any,

  miniLabel: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.3 } as any,
  miniBig: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary } as any,
  dollarSign: { fontSize: 14, fontWeight: '400', color: Colors.textSecondary } as any,
  dollarMini: { fontSize: 14, fontWeight: '400', color: Colors.textSecondary } as any,
  cardLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } as any,
});
