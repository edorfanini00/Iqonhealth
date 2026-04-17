import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Beaker, ChevronRight, BookOpen, Tag, ClipboardList, ShieldAlert } from 'lucide-react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

const lessons = [
  { id: 1, title: "Peptides 101", iconName: 'book',
    content: "Peptides are short chains of amino acids — the same building blocks your body already uses. Researchers have isolated specific sequences that can signal your body to heal faster, burn fat, or reduce inflammation. They are not steroids.",
    diagram: { type: "chain", label: "Amino Acid Chain → Signal → Biological Response", items: ["Amino Acids", "→", "Peptide Sequence", "→", "Cell Receptor", "→", "Healing / Fat Loss / Recovery"] },
    tip: "Think of peptides as text messages to your cells. Each sequence tells your body to do something specific." },
  { id: 2, title: "How Dosing Works", iconName: 'syringe',
    content: "Peptide doses are measured in micrograms (mcg) or milligrams (mg). 1mg = 1,000mcg. Most peptides are dosed between 100mcg and 500mcg per injection.",
    diagram: { type: "math", label: "Dose Calculation", items: ["5mg vial", "+", "2ml water", "=", "2,500mcg/ml", "→", "For 250mcg: draw 0.1ml (10 units)"] },
    tip: "Never guess your dose. Always use a calculator to convert mcg into syringe units." },
  { id: 3, title: "How Reconstitution Works", iconName: 'beaker',
    content: "Peptides ship as a freeze-dried powder (lyophilized). You must add bacteriostatic water to dissolve it before use. Aim the water stream at the glass wall of the vial — never spray directly onto the powder.",
    diagram: { type: "steps", label: "Reconstitution Steps", items: ["1. Clean vial top with alcohol", "2. Draw bacteriostatic water into syringe", "3. Inject water slowly along glass wall", "4. Swirl gently until fully dissolved", "5. Store refrigerated (2–8°C)"] },
    tip: "Go slow. Aggressive mixing can damage the peptide structure and reduce effectiveness." },
  { id: 4, title: "How to Read a Vial Label", iconName: 'tag',
    content: "Every vial label tells you two critical things: the compound name and the total amount in milligrams. Always verify the compound name matches what you ordered.",
    diagram: { type: "label", label: "Reading a Vial Label", items: ["Compound: BPC-157", "Amount: 5mg", "Lot: #A2024-0331", "Exp: 2027-03", "Form: Lyophilized Powder"] },
    tip: "Photograph every vial label before use. This helps you track batches if you ever need to report a side effect." },
  { id: 5, title: "How to Log Safely", iconName: 'clipboard',
    content: "Logging is how you know if something is working — or if something is wrong. Every time you inject, record: the date, compound, dose, injection site, and how you feel.",
    diagram: { type: "log", label: "What to Log Every Time", items: ["Date & Time", "Compound & Dose", "Injection Site (rotate!)", "Side Effects (even mild)", "Energy / Sleep / Mood Score"] },
    tip: "Consistency matters more than detail. A simple log every day beats a detailed log once a week." },
  { id: 6, title: "How to Spot Risky Sources", iconName: 'shield',
    content: "Not all peptide vendors are trustworthy. Legitimate sources provide third-party testing certificates (COAs), list purity percentages (99%+ is standard), and use proper cold-chain shipping.",
    diagram: { type: "compare", label: "Red Flags vs. Green Flags", items: [
      { bad: "No third-party COA", good: "Published COA per batch" },
      { bad: "Prices 50%+ below market", good: "Competitive but realistic pricing" },
      { bad: "Vague or missing labels", good: "Clear compound, mg, lot number" },
      { bad: '"Limited stock!" pressure', good: "Transparent inventory" }
    ]},
    tip: "If a deal looks too good to be true, it probably is. Your health is not worth saving $20." },
];

export default function Learn() {
  const router = useRouter();
  const [currentLesson, setCurrentLesson] = useState(0);
  const [viewMode, setViewMode] = useState('list');

  const lesson = lessons[currentLesson];
  const progress = ((currentLesson + 1) / lessons.length) * 100;

  if (viewMode === 'list') {
    return (
      <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm }}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={16} color="#fff" />
          </TouchableOpacity>
          <Text style={s.pageTitle}>Peptides 101</Text>
        </View>
        <Text style={{ color: Colors.textSecondary, fontSize: 14, lineHeight: 22, paddingHorizontal: Spacing.xs }}>
          Six short lessons to get you from zero to confident. Each takes about 60–90 seconds.
        </Text>
        <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
          {lessons.map((l, i) => (
            <TouchableOpacity key={l.id} style={s.lessonRow} onPress={() => { setCurrentLesson(i); setViewMode('lesson'); }} activeOpacity={0.7}>
              <View style={s.lessonIcon}>
                <BookOpen size={20} color={Colors.accentLight} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '500', color: '#fff', fontSize: 15 }}>Lesson {l.id}</Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 2 }}>{l.title}</Text>
              </View>
              <ChevronRight size={18} color={Colors.textSecondary} style={{ opacity: 0.4 }} />
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    );
  }

  return (
    <View style={s.lessonContainer}>
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => setViewMode('list')}>
          <ArrowLeft size={16} color="#fff" />
        </TouchableOpacity>
        <Text style={s.lessonCount}>Lesson {lesson.id} of {lessons.length}</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/calculator')}>
          <Text style={{ fontSize: 12, color: Colors.textSecondary, fontWeight: '500' }}>Skip All</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={{ paddingHorizontal: Spacing.lg, marginTop: Spacing.sm }}>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.lessonContent} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
          <BookOpen size={32} color={Colors.accentLight} />
          <Text style={s.lessonTitle}>{lesson.title}</Text>
        </View>
        <Text style={s.lessonText}>{lesson.content}</Text>

        {/* Diagram */}
        <View style={s.diagramCard}>
          <Text style={s.diagramLabel}>{lesson.diagram.label}</Text>
          {lesson.diagram.type === 'compare' ? (
            <View style={{ gap: Spacing.sm }}>
              {lesson.diagram.items.map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: Spacing.sm }}>
                  <View style={s.badBox}><Text style={s.badText}>✗ {item.bad}</Text></View>
                  <View style={s.goodBox}><Text style={s.goodText}>✓ {item.good}</Text></View>
                </View>
              ))}
            </View>
          ) : lesson.diagram.type === 'steps' || lesson.diagram.type === 'log' ? (
            <View style={{ gap: 4 }}>
              {lesson.diagram.items.map((item, i) => (
                <View key={i} style={[s.stepRow, i < lesson.diagram.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: Colors.white05 }]}>
                  <View style={s.stepNum}><Text style={s.stepNumText}>{i + 1}</Text></View>
                  <Text style={{ fontSize: 14, color: Colors.white80, flex: 1 }}>{item.replace(/^\d+\.\s*/, '')}</Text>
                </View>
              ))}
            </View>
          ) : lesson.diagram.type === 'label' ? (
            <View style={s.labelBox}>
              {lesson.diagram.items.map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary, width: 80 }}>{item.split(':')[0]}:</Text>
                  <Text style={{ fontSize: 14, color: '#fff', fontWeight: '500' }}>{item.split(':').slice(1).join(':').trim()}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.xs }}>
              {lesson.diagram.items.map((item, i) => (
                item === '→' || item === '+' || item === '=' ? (
                  <Text key={i} style={{ color: Colors.accentLight, fontSize: 18, fontWeight: '300', paddingHorizontal: Spacing.xs }}>{item}</Text>
                ) : (
                  <View key={i} style={s.chainItem}><Text style={{ fontSize: 12, color: '#fff', fontWeight: '500' }}>{item}</Text></View>
                )
              ))}
            </View>
          )}
        </View>

        {/* Pro Tip */}
        <View style={s.tipCard}>
          <Text style={{ fontSize: 18, marginTop: -2 }}>💡</Text>
          <Text style={{ fontSize: 14, color: Colors.white80, lineHeight: 22, flex: 1 }}>{lesson.tip}</Text>
        </View>
        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Bottom Controls */}
      <View style={s.bottomControls}>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {currentLesson > 0 && (
            <TouchableOpacity style={s.prevBtn} onPress={() => setCurrentLesson(currentLesson - 1)}>
              <ArrowLeft size={18} color="#fff" />
            </TouchableOpacity>
          )}
          {currentLesson < lessons.length - 1 ? (
            <TouchableOpacity style={[s.nextBtn, { flex: 1 }]} onPress={() => setCurrentLesson(currentLesson + 1)} activeOpacity={0.8}>
              <Text style={s.nextBtnText}>Next Lesson</Text>
              <ArrowRight size={18} color="#000" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[s.nextBtn, { flex: 1, backgroundColor: Colors.accent }]} onPress={() => router.push('/(tabs)/calculator')} activeOpacity={0.8}>
              <Text style={[s.nextBtnText, { color: '#fff' }]}>Try It Now — Open Calculator</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/calculator')} style={{ paddingVertical: Spacing.sm }}>
          <Text style={{ fontSize: 12, color: Colors.textSecondary, fontWeight: '500', textAlign: 'center' }}>Skip to Calculator →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  content: { padding: Spacing.lg, paddingTop: 60, gap: Spacing.lg },
  pageTitle: { fontSize: Typography['3xl'], fontWeight: '600', color: '#fff', letterSpacing: -1 },
  backBtn: { width: 32, height: 32, borderRadius: Radius.full, backgroundColor: Colors.white10, borderWidth: 1, borderColor: Colors.white05, alignItems: 'center', justifyContent: 'center' },
  lessonRow: { backgroundColor: Colors.panelBg, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.white05, padding: 20, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  lessonIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(168,85,247,0.15)', alignItems: 'center', justifyContent: 'center' },
  lessonContainer: { flex: 1, backgroundColor: Colors.bgPrimary },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, paddingTop: 60 },
  lessonCount: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, color: Colors.accentLight },
  progressTrack: { width: '100%', height: 3, backgroundColor: Colors.white05, borderRadius: Radius.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: Radius.full, backgroundColor: Colors.accentLight },
  lessonContent: { padding: Spacing.lg, gap: Spacing.lg, marginTop: Spacing.md, paddingBottom: 200 },
  lessonTitle: { fontSize: 28, fontWeight: '300', color: '#fff', letterSpacing: -0.5 },
  lessonText: { fontSize: 15, color: '#fff', lineHeight: 24, opacity: 0.9 },
  diagramCard: { backgroundColor: '#0d0d0f', borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.white05, padding: Spacing.lg, gap: Spacing.md },
  diagramLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, color: Colors.accentLight, marginBottom: Spacing.xs },
  badBox: { flex: 1, backgroundColor: 'rgba(255,69,58,0.1)', borderWidth: 1, borderColor: 'rgba(255,69,58,0.2)', borderRadius: 12, padding: Spacing.sm },
  badText: { fontSize: 12, color: Colors.danger, fontWeight: '500' },
  goodBox: { flex: 1, backgroundColor: 'rgba(50,215,75,0.1)', borderWidth: 1, borderColor: 'rgba(50,215,75,0.2)', borderRadius: 12, padding: Spacing.sm },
  goodText: { fontSize: 12, color: Colors.success, fontWeight: '500' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingVertical: 6 },
  stepNum: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(168,85,247,0.2)', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepNumText: { fontSize: 10, fontWeight: '700', color: Colors.accentLight },
  labelBox: { backgroundColor: Colors.white05, borderWidth: 1, borderColor: Colors.white10, borderRadius: 12, padding: Spacing.md, gap: Spacing.xs },
  chainItem: { backgroundColor: Colors.white05, borderWidth: 1, borderColor: Colors.white10, borderRadius: 12, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, backgroundColor: 'rgba(168,85,247,0.1)', borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)', borderRadius: 12, padding: Spacing.md },
  bottomControls: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.lg, paddingBottom: 40, gap: Spacing.sm },
  prevBtn: { backgroundColor: Colors.glassBg, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.full, paddingHorizontal: 20, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  nextBtn: { backgroundColor: '#fff', borderRadius: Radius.full, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  nextBtnText: { fontSize: 16, fontWeight: '600', color: '#000' },
});
