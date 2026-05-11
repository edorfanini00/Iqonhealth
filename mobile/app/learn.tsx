import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, ArrowRight, BookOpen, ChevronRight, CheckCircle, Lock, Play, RotateCcw } from 'lucide-react-native';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

const STORAGE_KEY = '@iqon_learn_progress';

import { lessons } from '@/data/learnLessons';

const RING_SIZE = 100;
const STROKE = 6;
const R = (RING_SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

export default function Learn() {
  const router = useRouter();
  const [completed, setCompleted] = useState<Record<number, boolean>>({});
  const [currentLesson, setCurrentLesson] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'lesson'>('list');

  const loadProgress = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setCompleted(JSON.parse(raw));
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => { loadProgress(); }, [loadProgress]));

  const markComplete = async (id: number) => {
    const next = { ...completed, [id]: true };
    setCompleted(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const resetProgress = async () => {
    setCompleted({});
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const completedCount = lessons.filter((l) => completed[l.id]).length;
  const totalCount = lessons.length;
  const pct = Math.round((completedCount / totalCount) * 100);
  const firstIncomplete = lessons.findIndex((l) => !completed[l.id]);
  const continueIndex = firstIncomplete >= 0 ? firstIncomplete : 0;

  const lesson = lessons[currentLesson];
  const isLessonDone = completed[lesson?.id];

  // ── List View ──
  if (viewMode === 'list') {
    return (
      <View style={s.container}>
        <ScrollView contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={s.listHeader}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={16} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.pageTitle}>Pep Learn</Text>
              <Text style={s.pageSubtitle}>{totalCount} chapters · {completedCount} completed</Text>
            </View>
          </View>

          {/* Progress ring card */}
          <View style={s.progressCard}>
            <View style={{ alignItems: 'center' }}>
              <Svg width={RING_SIZE} height={RING_SIZE}>
                <SvgCircle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={R} stroke={Colors.grey200} strokeWidth={STROKE} fill="none" />
                <SvgCircle
                  cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={R}
                  stroke={pct === 100 ? '#34C759' : Colors.cardDark}
                  strokeWidth={STROKE} fill="none" strokeLinecap="round"
                  strokeDasharray={`${CIRC}`}
                  strokeDashoffset={CIRC * (1 - pct / 100)}
                  transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                />
              </Svg>
              <View style={s.ringLabel}>
                <Text style={s.ringPct}>{pct}%</Text>
                <Text style={s.ringPctSub}>complete</Text>
              </View>
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={s.progressTitle}>
                {pct === 100 ? '🎉 All Done!' : pct === 0 ? 'Start Learning' : 'Keep Going!'}
              </Text>
              <Text style={s.progressSub}>
                {pct === 100
                  ? 'You\'ve completed all chapters. Tap any to review.'
                  : `${totalCount - completedCount} chapter${totalCount - completedCount > 1 ? 's' : ''} remaining. Each takes about 60–90 seconds.`}
              </Text>
              {pct < 100 ? (
                <TouchableOpacity
                  style={s.continueBtn}
                  onPress={() => { setCurrentLesson(continueIndex); setViewMode('lesson'); }}
                  activeOpacity={0.8}
                >
                  <Play size={14} color="#FFF" />
                  <Text style={s.continueBtnText}>
                    {pct === 0 ? 'Start' : 'Continue'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[s.continueBtn, { backgroundColor: Colors.grey400 }]} onPress={resetProgress} activeOpacity={0.8}>
                  <RotateCcw size={14} color="#FFF" />
                  <Text style={s.continueBtnText}>Reset Progress</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Chapter list */}
          <Text style={s.sectionLabel}>ALL CHAPTERS</Text>
          <View style={{ gap: 10 }}>
            {lessons.map((l, i) => {
              const done = !!completed[l.id];
              return (
                <TouchableOpacity
                  key={l.id}
                  style={[s.chapterRow, done && s.chapterRowDone]}
                  onPress={() => { setCurrentLesson(i); setViewMode('lesson'); }}
                  activeOpacity={0.7}
                >
                  <View style={[s.chapterNum, done && { backgroundColor: '#34C759', borderColor: '#34C759' }]}>
                    {done ? (
                      <CheckCircle size={16} color="#FFF" />
                    ) : (
                      <Text style={s.chapterNumText}>{l.chapter}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.chapterTitle, done && { color: Colors.grey400, textDecorationLine: 'line-through' }]}>{l.title}</Text>
                    <Text style={s.chapterSub}>{l.subtitle}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text style={s.chapterDuration}>{l.duration}</Text>
                    {done && <Text style={{ fontSize: 10, color: '#34C759', fontWeight: '600' }}>DONE</Text>}
                  </View>
                  <ChevronRight size={16} color={Colors.grey400} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }

  // ── Lesson View ──
  const progress = ((currentLesson + 1) / totalCount) * 100;

  return (
    <View style={s.container}>
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => setViewMode('list')}>
          <ArrowLeft size={16} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={s.lessonCount}>Chapter {lesson.chapter} of {totalCount}</Text>
          <Text style={s.lessonDuration}>{lesson.duration}</Text>
        </View>
        <TouchableOpacity onPress={() => setViewMode('list')}>
          <Text style={{ fontSize: 12, color: Colors.textSecondary, fontWeight: '500' }}>All Chapters</Text>
        </TouchableOpacity>
      </View>

      {/* Step dots */}
      <View style={s.stepDotsRow}>
        {lessons.map((l, i) => (
          <View
            key={l.id}
            style={[
              s.stepDot,
              i <= currentLesson && { backgroundColor: Colors.cardDark },
              completed[l.id] && { backgroundColor: '#34C759' },
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.lessonContent} showsVerticalScrollIndicator={false}>
        <View style={s.lessonHeader}>
          <View style={s.lessonIconWrap}>
            <BookOpen size={24} color={Colors.textPrimary} />
          </View>
          <Text style={s.lessonTitle}>{lesson.title}</Text>
        </View>
        <Text style={s.lessonSubtitle}>{lesson.subtitle}</Text>
        <Text style={s.lessonText}>{lesson.content}</Text>

        {/* Diagram */}
        <View style={s.diagramCard}>
          <Text style={s.diagramLabel}>{lesson.diagram.label}</Text>
          {lesson.diagram.type === 'compare' ? (
            <View style={{ gap: 8 }}>
              {(lesson.diagram.items as any[]).map((item: any, i: number) => (
                <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={s.badBox}><Text style={s.badText}>✗ {item.bad}</Text></View>
                  <View style={s.goodBox}><Text style={s.goodText}>✓ {item.good}</Text></View>
                </View>
              ))}
            </View>
          ) : lesson.diagram.type === 'steps' || lesson.diagram.type === 'log' ? (
            <View style={{ gap: 2 }}>
              {(lesson.diagram.items as string[]).map((item: string, i: number) => (
                <View key={i} style={s.stepRow}>
                  <View style={s.stepNum}><Text style={s.stepNumText}>{i + 1}</Text></View>
                  <Text style={s.stepText}>{item.replace(/^\d+\.\s*/, '')}</Text>
                </View>
              ))}
            </View>
          ) : lesson.diagram.type === 'label' ? (
            <View style={s.labelBox}>
              {(lesson.diagram.items as string[]).map((item: string, i: number) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={s.labelKey}>{item.split(':')[0]}:</Text>
                  <Text style={s.labelVal}>{item.split(':').slice(1).join(':').trim()}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
              {(lesson.diagram.items as string[]).map((item: string, i: number) =>
                item === '→' || item === '+' || item === '=' ? (
                  <Text key={i} style={s.chainArrow}>{item}</Text>
                ) : (
                  <View key={i} style={s.chainItem}><Text style={s.chainText}>{item}</Text></View>
                )
              )}
            </View>
          )}
        </View>

        {/* Pro Tip */}
        <View style={s.tipCard}>
          <Text style={{ fontSize: 18, marginTop: -2 }}>💡</Text>
          <Text style={s.tipText}>{lesson.tip}</Text>
        </View>

        {/* Completion stamp */}
        {isLessonDone && (
          <View style={s.completedBanner}>
            <CheckCircle size={16} color="#34C759" />
            <Text style={s.completedText}>Chapter completed</Text>
          </View>
        )}

        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Bottom Controls */}
      <View style={s.bottomControls}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {currentLesson > 0 && (
            <TouchableOpacity style={s.prevBtn} onPress={() => setCurrentLesson(currentLesson - 1)}>
              <ArrowLeft size={18} color={Colors.textPrimary} />
            </TouchableOpacity>
          )}
          {currentLesson < totalCount - 1 ? (
            <TouchableOpacity
              style={[s.nextBtn, { flex: 1 }]}
              onPress={() => {
                markComplete(lesson.id);
                setCurrentLesson(currentLesson + 1);
              }}
              activeOpacity={0.8}
            >
              <Text style={s.nextBtnText}>{isLessonDone ? 'Next Chapter' : 'Complete & Next'}</Text>
              <ArrowRight size={18} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[s.nextBtn, { flex: 1, backgroundColor: '#34C759' }]}
              onPress={() => {
                markComplete(lesson.id);
                setViewMode('list');
              }}
              activeOpacity={0.8}
            >
              <CheckCircle size={18} color="#FFF" />
              <Text style={s.nextBtnText}>{isLessonDone ? 'Back to Chapters' : 'Complete Course'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const { width: SW } = Dimensions.get('window');

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },

  // ── List View ──
  listContent: { padding: Spacing.lg, paddingTop: 60 },
  listHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: Spacing.lg },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.panelBg, borderWidth: 1, borderColor: 'rgba(200,205,210,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  pageTitle: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  progressCard: {
    flexDirection: 'row', alignItems: 'center', gap: 20,
    backgroundColor: Colors.panelBg, borderRadius: Radius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)', marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  ringLabel: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  ringPct: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  ringPctSub: { fontSize: 9, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  progressTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  progressSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  continueBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.cardDark, paddingVertical: 10, paddingHorizontal: 18,
    borderRadius: Radius.full, alignSelf: 'flex-start', marginTop: 4,
  },
  continueBtnText: { fontSize: 14, fontWeight: '600', color: '#FFF' },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1, marginBottom: 10, marginTop: 4 },
  chapterRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.panelBg, borderRadius: Radius.lg, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)', ...Shadows.card,
  },
  chapterRowDone: { borderColor: 'rgba(52,199,89,0.25)', backgroundColor: 'rgba(52,199,89,0.04)' },
  chapterNum: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 2, borderColor: Colors.grey200, alignItems: 'center', justifyContent: 'center',
  },
  chapterNumText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  chapterTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  chapterSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  chapterDuration: { fontSize: 11, color: Colors.grey400, fontWeight: '500' },

  // ── Lesson View ──
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.sm },
  lessonCount: { fontSize: 11, fontWeight: '700', color: Colors.textPrimary, letterSpacing: 1, textTransform: 'uppercase' },
  lessonDuration: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },

  stepDotsRow: { flexDirection: 'row', gap: 4, paddingHorizontal: Spacing.lg, marginBottom: 4 },
  stepDot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: Colors.grey200 },

  lessonContent: { padding: Spacing.lg, gap: 18, paddingBottom: 200 },
  lessonHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  lessonIconWrap: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: 'rgba(200,205,210,0.15)', borderWidth: 1, borderColor: 'rgba(200,205,210,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  lessonTitle: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5, flex: 1 },
  lessonSubtitle: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginTop: -8 },
  lessonText: { fontSize: 15, color: Colors.textPrimary, lineHeight: 24, opacity: 0.85 },

  diagramCard: {
    backgroundColor: 'rgba(200,205,210,0.08)', borderRadius: Radius.lg,
    borderWidth: 1, borderColor: 'rgba(200,205,210,0.3)', padding: Spacing.lg, gap: 12,
  },
  diagramLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: Colors.textSecondary, marginBottom: 4 },
  badBox: { flex: 1, backgroundColor: 'rgba(255,59,48,0.08)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.2)', borderRadius: 12, padding: 10 },
  badText: { fontSize: 12, color: '#FF3B30', fontWeight: '500' },
  goodBox: { flex: 1, backgroundColor: 'rgba(52,199,89,0.08)', borderWidth: 1, borderColor: 'rgba(52,199,89,0.2)', borderRadius: 12, padding: 10 },
  goodText: { fontSize: 12, color: '#34C759', fontWeight: '500' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 6 },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.cardDark, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepNumText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  stepText: { fontSize: 14, color: Colors.textPrimary, flex: 1, lineHeight: 20 },
  labelBox: { backgroundColor: Colors.panelBg, borderWidth: 1, borderColor: 'rgba(200,205,210,0.3)', borderRadius: 12, padding: 14, gap: 6 },
  labelKey: { fontSize: 11, color: Colors.textSecondary, width: 80, fontWeight: '600' },
  labelVal: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  chainArrow: { color: Colors.textSecondary, fontSize: 18, fontWeight: '300', paddingHorizontal: 4 },
  chainItem: { backgroundColor: Colors.panelBg, borderWidth: 1, borderColor: 'rgba(200,205,210,0.3)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  chainText: { fontSize: 12, color: Colors.textPrimary, fontWeight: '500' },

  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: 'rgba(255,149,0,0.08)', borderWidth: 1, borderColor: 'rgba(255,149,0,0.2)',
    borderRadius: 14, padding: 14,
  },
  tipText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 22, flex: 1, opacity: 0.85 },

  completedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center',
    paddingVertical: 10, borderRadius: 12,
    backgroundColor: 'rgba(52,199,89,0.08)', borderWidth: 1, borderColor: 'rgba(52,199,89,0.2)',
  },
  completedText: { fontSize: 13, fontWeight: '600', color: '#34C759' },

  bottomControls: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Spacing.lg, paddingBottom: 44,
    backgroundColor: Colors.bgPrimary,
    borderTopWidth: 1, borderTopColor: 'rgba(200,205,210,0.3)',
  },
  prevBtn: {
    backgroundColor: Colors.panelBg, borderWidth: 1, borderColor: 'rgba(200,205,210,0.4)',
    borderRadius: Radius.full, paddingHorizontal: 20, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  nextBtn: {
    backgroundColor: Colors.cardDark, borderRadius: Radius.full,
    paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  nextBtnText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});
