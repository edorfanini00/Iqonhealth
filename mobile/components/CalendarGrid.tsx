import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight, X, BookOpen, Activity } from 'lucide-react-native';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';
import { isScheduledForDate } from '@/utils/scheduling';
import { peptidesDB } from '@/data/peptides';
import { getProtocols } from '@/utils/storage';
import { useFocusEffect } from 'expo-router';

export default function CalendarGrid() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [protocols, setProtocols] = useState([]);
  const [viewDate, setViewDate] = useState(new Date());

  useFocusEffect(useCallback(() => {
    getProtocols().then(p => setProtocols(p.filter(pr => pr.status === 'active')));
  }, []));

  const calendarDays = useMemo(() => {
    const today = new Date();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const days = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false, dateStr: `${year}-${String(month).padStart(2, '0')}-${String(prevMonthLastDay - i).padStart(2, '0')}` });
    }

    for (let i = 1; i <= lastDay; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const scheduled = [];
      protocols.forEach(p => {
        p.compounds.forEach(comp => {
          if (isScheduledForDate(comp, dateStr)) scheduled.push(comp);
        });
      });
      days.push({ day: i, isCurrentMonth: true, dateStr, scheduled, isToday: dateStr === today.toISOString().split('T')[0] });
    }

    const remaining = 35 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrentMonth: false, dateStr: `${year}-${String(month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}` });
    }
    return days;
  }, [protocols, viewDate]);

  const currentMonthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Activity Grid</Text>
        <View style={s.navPills}>
          <TouchableOpacity onPress={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
            <ChevronLeft size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={s.monthLabel}>{currentMonthName}</Text>
          <TouchableOpacity onPress={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
            <ChevronRight size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.card}>
        {/* Weekday header */}
        <View style={s.weekRow}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <View key={i} style={s.weekCell}>
              <Text style={s.weekText}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Grid */}
        <View style={s.grid}>
          {calendarDays.map((item, i) => {
            const hasProtocol = item.scheduled?.length > 0;
            let bg = Colors.panelBg;
            if (hasProtocol) bg = Colors.grey100;
            if (item.isToday) bg = Colors.panelBg;

            return (
              <View key={i} style={s.dayCellWrapper}>
                <TouchableOpacity
                  style={[s.dayCell, { backgroundColor: bg }, item.isToday && s.todayCell]}
                  onPress={() => hasProtocol && setSelectedDay(item)}
                  activeOpacity={hasProtocol ? 0.7 : 1}
                >
                  <Text style={[s.dayText, !item.isCurrentMonth && { opacity: 0.3 }]}>{item.day}</Text>
                  {hasProtocol && (
                    <View style={s.dotRow}>
                      {item.scheduled.slice(0, 3).map((comp, idx) => (
                        <View key={idx} style={[s.dot, { backgroundColor: comp.color || Colors.accentDark }]} />
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={s.footer}>
          <BookOpen size={18} color={Colors.textSecondary} style={{ opacity: 0.6 }} />
          <Activity size={18} color={Colors.textSecondary} style={{ opacity: 0.6 }} />
        </View>
      </View>

      {/* Day Detail Modal */}
      <Modal visible={!!selectedDay} transparent animationType="fade" onRequestClose={() => setSelectedDay(null)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setSelectedDay(null)}>
          <View style={s.modalCard} onStartShouldSetResponder={() => true}>
            <TouchableOpacity style={s.modalClose} onPress={() => setSelectedDay(null)}>
              <X size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={s.modalTitle}>
              Scheduled Details • {selectedDay && new Date(selectedDay.dateStr).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {selectedDay?.scheduled?.map((comp, i) => {
                const data = peptidesDB[comp.compound];
                return (
                  <View key={i} style={s.modalItem}>
                    <View style={[s.modalStripe, { backgroundColor: comp.color || Colors.accentDark }]} />
                    <View style={s.modalItemHeader}>
                      <Text style={s.modalCompName}>{comp.compound}</Text>
                      <Text style={s.modalDose}>{comp.doseMcg}mcg</Text>
                    </View>
                    {comp.timingTags?.length > 0 && (
                      <View style={s.tagRow}>
                        {comp.timingTags.map(tag => (
                          <View key={tag} style={s.tag}>
                            <Text style={s.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {data?.desc && <Text style={s.modalDesc}>{data.desc}</Text>}
                  </View>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={s.modalCloseBtn} onPress={() => setSelectedDay(null)}>
              <Text style={s.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginTop: Spacing.md, gap: Spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xs, marginBottom: Spacing.xs },
  title: { fontSize: 20, fontWeight: '500', color: Colors.textPrimary, letterSpacing: -0.3 },
  navPills: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.panelBg, borderRadius: Radius.full, paddingHorizontal: Spacing.xs, paddingVertical: 2, borderWidth: 1, borderColor: Colors.grey200 },
  monthLabel: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary, minWidth: 100, textAlign: 'center' },
  
  card: { backgroundColor: Colors.panelBg, borderRadius: Radius.xl, overflow: 'hidden', ...Shadows.card },
  weekRow: { flexDirection: 'row', paddingHorizontal: 2, paddingVertical: 8, backgroundColor: Colors.grey100, borderBottomWidth: 1, borderBottomColor: Colors.grey200 },
  weekCell: { flex: 1, alignItems: 'center' },
  weekText: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 2, backgroundColor: Colors.grey200 },
  dayCellWrapper: { width: '14.285%', padding: 1 },
  dayCell: { aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 4, position: 'relative' },
  todayCell: { borderWidth: 2, borderColor: Colors.textPrimary },
  dayText: { fontSize: 12, fontWeight: '500', color: Colors.textPrimary },
  dotRow: { flexDirection: 'row', gap: 2, position: 'absolute', bottom: 6 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, backgroundColor: Colors.panelBg, borderTopWidth: 1, borderTopColor: Colors.grey200 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  modalCard: { backgroundColor: Colors.panelBg, borderRadius: Radius.xl, padding: Spacing.lg, width: '100%', maxWidth: 400, ...Shadows.layered },
  modalClose: { position: 'absolute', top: 16, right: 16, backgroundColor: Colors.panelBg, borderRadius: Radius.full, padding: 8, borderWidth: 1, borderColor: Colors.grey200, zIndex: 10, ...Shadows.button },
  modalTitle: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, color: Colors.textSecondary, marginBottom: Spacing.md },
  
  modalItem: { backgroundColor: Colors.grey100, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.grey200, padding: Spacing.md, marginBottom: Spacing.sm, overflow: 'hidden' },
  modalStripe: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 3 },
  modalItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: Spacing.xs },
  modalCompName: { fontSize: 18, fontWeight: '500', color: Colors.textPrimary },
  modalDose: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  
  tagRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginTop: 4, paddingLeft: Spacing.xs },
  tag: { backgroundColor: Colors.grey200, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: Colors.grey300 },
  tagText: { fontSize: 9, color: Colors.textSecondary },
  modalDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, marginTop: Spacing.sm, paddingLeft: Spacing.xs },
  
  modalCloseBtn: { backgroundColor: Colors.cardDark, borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center', marginTop: Spacing.lg },
  modalCloseBtnText: { fontSize: 16, fontWeight: '600', color: Colors.textInverse },
});
