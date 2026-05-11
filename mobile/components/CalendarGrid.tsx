import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react-native';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';
import { isScheduledForDate } from '@/utils/scheduling';
import { peptidesDB } from '@/data/peptides';
import { getProtocols, getVialInventory } from '@/utils/storage';
import { doseInfo, doseBreakdown } from '@/utils/doseFormat';
import { useFocusEffect } from 'expo-router';

export default function CalendarGrid() {
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [selectedComp, setSelectedComp] = useState<any>(null);
  const [protocols, setProtocols] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any>({});
  const [viewDate, setViewDate] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  useFocusEffect(useCallback(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    Promise.all([
      getProtocols(),
      getVialInventory(),
    ]).then(([allProtocols, inv]) => {
      const active = allProtocols.filter((pr: any) => pr.status === 'active');
      setProtocols(active);
      setInventory(inv);

      // Auto-select today if it has scheduled compounds
      const todayScheduled: any[] = [];
      active.forEach((p: any) => {
        p.compounds.forEach((comp: any) => {
          if (isScheduledForDate(comp, todayStr)) todayScheduled.push(comp);
        });
      });
      if (todayScheduled.length > 0) {
        setSelectedDay({ dateStr: todayStr, scheduled: todayScheduled, isToday: true });
        setSelectedComp(null);
      }
    });
  }, []));

  const calendarDays = useMemo(() => {
    const today = new Date();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const days: any[] = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
    }
    for (let i = 1; i <= lastDay; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const scheduled: any[] = [];
      protocols.forEach(p => {
        p.compounds.forEach((comp: any) => {
          if (isScheduledForDate(comp, dateStr)) scheduled.push(comp);
        });
      });
      days.push({
        day: i,
        isCurrentMonth: true,
        dateStr,
        scheduled,
        isToday: dateStr === today.toISOString().split('T')[0],
      });
    }
    const remaining = 35 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }
    return days;
  }, [protocols, viewDate]);

  const formatTime = (doseTime: string) => {
    if (!doseTime) return null;
    const [th, tm] = doseTime.split(':').map(Number);
    const ampm = th >= 12 ? 'PM' : 'AM';
    const hr = th % 12 || 12;
    return `${hr}:${String(tm || 0).padStart(2, '0')} ${ampm}`;
  };

  // Calculate actual dose from protocol compound data

  const getVialInfo = (comp: any) => {
    const vial = inventory[comp.compound];
    if (!vial) return null;
    const doseML = vial.dosePerUseMl || comp.dosePerUseMl || 0.1;
    return {
      vialsLeft: vial.vialCount || 0,
      mlLeft: (vial.currentVialMl || 0).toFixed(1),
      dosesLeft: Math.floor((vial.currentVialMl || 0) / doseML),
      doseML,
    };
  };

  // Enrich compound with inventory data so doseBreakdown works for all compounds (e.g. NAD+)
  const enrichComp = (comp: any) => {
    const inv = inventory[comp.compound];
    if (!inv) return comp;
    return {
      ...comp,
      dosePerUseMl: comp.dosePerUseMl || inv.dosePerUseMl || 0,
      vialSizeMl: comp.vialSizeMl || inv.vialSizeMl || 3,
      amount: comp.amount || inv.amount || 0,
      unit: comp.unit || inv.unit || 'mg',
    };
  };


  const handleDayPress = (item: any) => {
    if (!item.scheduled?.length) return;
    setSelectedDay(item);
    setSelectedComp(null);
  };

  const currentMonthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <View style={s.container}>
      {/* Month nav */}
      <View style={s.navRow}>
        <TouchableOpacity
          onPress={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
          style={s.navBtn}
        >
          <ChevronLeft size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={s.monthLabelBtn}
          onPress={() => { setPickerYear(viewDate.getFullYear()); setShowMonthPicker(v => !v); }}
          activeOpacity={0.7}
        >
          <Text style={s.monthLabel}>{currentMonthName}</Text>
          <ChevronDown size={14} color={Colors.textSecondary}
            style={{ transform: [{ rotate: showMonthPicker ? '180deg' : '0deg' }] }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
          style={s.navBtn}
        >
          <ChevronRight size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Month / Year Picker Dropdown */}
      {showMonthPicker && (
        <View style={s.monthPickerCard}>
          <View style={s.pickerYearRow}>
            <TouchableOpacity style={s.pickerNavBtn} onPress={() => setPickerYear(y => y - 1)} activeOpacity={0.7}>
              <ChevronLeft size={16} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={s.pickerYearText}>{pickerYear}</Text>
            <TouchableOpacity style={s.pickerNavBtn} onPress={() => setPickerYear(y => y + 1)} activeOpacity={0.7}>
              <ChevronRight size={16} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <View style={s.monthGrid}>
            {MONTHS.map((m, i) => {
              const isSelected = i === viewDate.getMonth() && pickerYear === viewDate.getFullYear();
              const isCurrentMonth = i === new Date().getMonth() && pickerYear === new Date().getFullYear();
              return (
                <TouchableOpacity
                  key={i}
                  style={[s.monthCell, isSelected && s.monthCellSelected, isCurrentMonth && !isSelected && s.monthCellToday]}
                  onPress={() => { setViewDate(new Date(pickerYear, i, 1)); setShowMonthPicker(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[s.monthCellText, isSelected && s.monthCellTextSelected]}>{m}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Calendar card */}
      <View style={s.card}>
        <View style={s.weekRow}>
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <View key={i} style={s.weekCell}>
              <Text style={s.weekText}>{d}</Text>
            </View>
          ))}
        </View>
        <View style={s.grid}>
          {calendarDays.map((item, i) => {
            const hasProtocol = item.scheduled?.length > 0;
            const isSelected = selectedDay?.dateStr && selectedDay.dateStr === item.dateStr;
            return (
              <View key={i} style={s.dayCellWrapper}>
                <TouchableOpacity
                  style={[s.dayCell, item.isToday && s.todayCell, isSelected && s.selectedCell]}
                  onPress={() => handleDayPress(item)}
                  activeOpacity={hasProtocol ? 0.7 : 1}
                >
                  <Text style={[s.dayText, !item.isCurrentMonth && { opacity: 0.25 }, isSelected && s.selectedDayText, item.isToday && !isSelected && s.todayText]}>
                    {item.day}
                  </Text>
                  {hasProtocol && (
                    <View style={s.dotRow}>
                      {item.scheduled.slice(0, 3).map((comp: any, idx: number) => (
                        <View key={idx} style={[s.dot, { backgroundColor: comp.color || Colors.accentDark }]} />
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      {/* Inline day detail */}
      {selectedDay && (
        <View style={s.dayDetail}>
          <View style={s.dayDetailHeader}>
            <Text style={s.dayDetailDate}>
              {new Date(selectedDay.dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
          </View>

          {[...selectedDay.scheduled]
            .sort((a: any, b: any) => {
              const tA = a.doseTime ? a.doseTime.split(':').map(Number) : [21, 0];
              const tB = b.doseTime ? b.doseTime.split(':').map(Number) : [21, 0];
              return (tA[0] * 60 + (tA[1] || 0)) - (tB[0] * 60 + (tB[1] || 0));
            })
            .map((comp: any, i: number) => {
              const time = formatTime(comp.doseTime);
              const vialInfo = getVialInfo(comp);
              const bd = doseBreakdown(comp);
              const isExpanded = selectedComp?.compound === comp.compound;
              const data = peptidesDB[comp.compound];

              return (
                <View key={i} style={s.compBlock}>
                  <TouchableOpacity
                    style={[s.compRow, { borderLeftColor: comp.color || Colors.accentDark }]}
                    onPress={() => setSelectedComp(isExpanded ? null : comp)}
                    activeOpacity={0.75}
                  >
                    <View style={[s.compDot, { backgroundColor: comp.color || Colors.accentDark }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.compName}>{comp.compound}</Text>
                      <Text style={s.compMeta}>
                        {(() => { const ebd = doseBreakdown(enrichComp(comp)); return ebd ? `${ebd.syringeUnits} units · ${ebd.drawMl.toFixed(2)} mL` : `${comp.amount ?? ''} ${comp.unit ?? 'mcg'}`; })()} {time ? `· ${time}` : ''}
                      </Text>
                    </View>
                    <ChevronDown size={16} color={Colors.grey400} style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }} />
                  </TouchableOpacity>

                  {isExpanded && (() => {
                    const richComp = enrichComp(comp);
                    const bd = doseBreakdown(richComp);
                    const vial = getVialInfo(comp);
                    const data = peptidesDB[comp.compound];
                    return (
                      <View style={s.compDetail}>
                        {bd && (
                          <>
                            <View style={s.detailRow}>
                              <Text style={s.detailLabel}>Syringe units</Text>
                              <Text style={s.detailValue}>{bd.syringeUnits} units</Text>
                            </View>
                            <View style={s.detailRow}>
                              <Text style={s.detailLabel}>Draw volume</Text>
                              <Text style={s.detailValue}>{bd.drawMl.toFixed(2)} mL</Text>
                            </View>
                            <View style={s.detailRow}>
                              <Text style={s.detailLabel}>Actual dose</Text>
                              <Text style={s.detailValue}>{bd.actualDoseStr}</Text>
                            </View>
                            <View style={s.detailRow}>
                              <Text style={s.detailLabel}>Concentration</Text>
                              <Text style={s.detailValue}>{bd.concentration}</Text>
                            </View>
                          </>
                        )}
                        {time && (
                          <View style={s.detailRow}>
                            <Text style={s.detailLabel}>Time</Text>
                            <Text style={s.detailValue}>{time}</Text>
                          </View>
                        )}
                        {vial && (
                          <>
                            <View style={s.detailDivider} />
                            <View style={s.detailRow}>
                              <Text style={s.detailLabel}>Vials in stock</Text>
                              <Text style={[s.detailValue, { color: vial.vialsLeft <= 1 ? '#FF3B30' : '#34C759' }]}>
                                {vial.vialsLeft} vial{vial.vialsLeft !== 1 ? 's' : ''}
                              </Text>
                            </View>
                            <View style={s.detailRow}>
                              <Text style={s.detailLabel}>mL remaining</Text>
                              <Text style={s.detailValue}>{vial.mlLeft} mL</Text>
                            </View>
                            <View style={s.detailRow}>
                              <Text style={s.detailLabel}>Doses left in vial</Text>
                              <Text style={s.detailValue}>{vial.dosesLeft}</Text>
                            </View>
                          </>
                        )}
                        {data?.timing && (
                          <>
                            <View style={s.detailDivider} />
                            <View style={s.detailRow}>
                              <Text style={s.detailLabel}>Best timing</Text>
                              <Text style={s.detailValue}>{data.timing}</Text>
                            </View>
                          </>
                        )}
                      </View>
                    );
                  })()}
                </View>
              );
            })}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: Spacing.md },

  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xs },
  navBtn: { width: 36, height: 36, borderRadius: Radius.full, backgroundColor: Colors.panelBg, borderWidth: 1, borderColor: Colors.grey200, alignItems: 'center', justifyContent: 'center', ...Shadows.button },
  monthLabelBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  monthLabel: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },

  // Month / Year picker
  monthPickerCard: { backgroundColor: Colors.panelBg, borderRadius: 18, padding: 16, ...Shadows.card, borderWidth: 1, borderColor: Colors.grey200 },
  pickerYearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  pickerNavBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.grey100, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.grey200 },
  pickerYearText: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  monthCell: { width: '22%', paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.grey100 },
  monthCellSelected: { backgroundColor: Colors.cardDark },
  monthCellToday: { borderWidth: 1.5, borderColor: Colors.cardDark, backgroundColor: 'transparent' },
  monthCellText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  monthCellTextSelected: { color: '#FFF' },

  card: { backgroundColor: Colors.panelBg, borderRadius: Radius.xl, overflow: 'hidden', ...Shadows.card },
  weekRow: { flexDirection: 'row', paddingVertical: 8, backgroundColor: Colors.grey100, borderBottomWidth: 1, borderBottomColor: Colors.grey200 },
  weekCell: { flex: 1, alignItems: 'center' },
  weekText: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary },

  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 2, backgroundColor: Colors.grey200, gap: 0 },
  dayCellWrapper: { width: '14.285%', padding: 1 },
  dayCell: { aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: Colors.panelBg },
  todayCell: { borderWidth: 2, borderColor: Colors.textPrimary },
  selectedCell: { backgroundColor: Colors.cardDark },
  dayText: { fontSize: 12, fontWeight: '500', color: Colors.textPrimary },
  todayText: { fontWeight: '700' },
  selectedDayText: { color: Colors.textInverse, fontWeight: '700' },
  dotRow: { flexDirection: 'row', gap: 2, position: 'absolute', bottom: 4 },
  dot: { width: 5, height: 5, borderRadius: 3 },

  dayDetail: { backgroundColor: Colors.panelBg, borderRadius: Radius.xl, padding: Spacing.md, gap: Spacing.sm, ...Shadows.card },
  dayDetailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  dayDetailDate: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  closeBtn: { width: 28, height: 28, borderRadius: Radius.full, backgroundColor: Colors.grey100, alignItems: 'center', justifyContent: 'center' },

  compBlock: { borderRadius: Radius.md, overflow: 'hidden' },
  compRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.sm, backgroundColor: Colors.grey100, borderRadius: Radius.md, borderLeftWidth: 3 },
  compDot: { width: 10, height: 10, borderRadius: 5 },
  compName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  compMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  compDetail: { backgroundColor: Colors.grey100, borderRadius: Radius.md, padding: Spacing.md, marginTop: 2, gap: 6 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  detailLabel: { fontSize: 12, color: Colors.textSecondary, flex: 1 },
  detailValue: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary, textAlign: 'right', flexShrink: 0 },
  detailDivider: { height: 1, backgroundColor: Colors.grey200, marginVertical: 2 },
});
