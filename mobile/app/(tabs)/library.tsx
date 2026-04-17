import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Shield, CheckCircle, ChevronDown, ArrowRight, GraduationCap, AlertTriangle } from 'lucide-react-native';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import { peptidesDB, CATEGORIES, getPeptidesByCategory, getRiskColor, getRiskLabel } from '@/data/peptides';

export default function Library() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPeptides = getPeptidesByCategory(activeCategory).filter(([name, data]) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(q) ||
      data.category.toLowerCase().includes(q) ||
      data.desc.toLowerCase().includes(q)
    );
  });

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Text style={s.title}>Library</Text>
        <Text style={s.subtitle}>{Object.keys(peptidesDB).length} peptides • Research-backed data</Text>
      </View>

      {/* Beginner Course */}
      <TouchableOpacity style={s.courseCard} onPress={() => router.push('/learn')} activeOpacity={0.7}>
        <View style={s.courseIcon}>
          <GraduationCap size={24} color={Colors.accentDark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.courseTitle}>Peptides 101 — Beginner Course</Text>
          <Text style={s.courseSubtitle}>6 lessons • ~8 min total</Text>
        </View>
        <ArrowRight size={18} color={Colors.accentDark} style={{ opacity: 0.6 }} />
      </TouchableOpacity>

      {/* Search */}
      <View style={s.searchWrap}>
        <Search size={18} color={Colors.textSecondary} style={{ position: 'absolute', left: 16, top: 16, zIndex: 1 }} />
        <TextInput
          placeholder="Search peptides, goals, or effects..."
          placeholderTextColor={Colors.grey400}
          style={s.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        <View style={{ flexDirection: 'row', gap: Spacing.sm, paddingBottom: 8 }}>
          {CATEGORIES.map((label) => {
            const isActive = activeCategory === label;
            return (
              <TouchableOpacity
                key={label}
                onPress={() => setActiveCategory(label)}
                style={[s.pill, isActive && s.pillActive]}
                activeOpacity={0.7}
              >
                <Text style={[s.pillText, isActive && s.pillTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Results Count */}
      <Text style={s.resultsCount}>{filteredPeptides.length} result{filteredPeptides.length !== 1 ? 's' : ''}</Text>

      {/* Peptide Cards */}
      <View style={{ gap: Spacing.md }}>
        {filteredPeptides.map(([name, data]) => (
          <PeptideCard
            key={name}
            name={name}
            data={data}
            router={router}
          />
        ))}

        {filteredPeptides.length === 0 && (
          <View style={s.emptyState}>
            <Text style={s.emptyTitle}>No results</Text>
            <Text style={s.emptySubtitle}>Try a different search or category filter.</Text>
          </View>
        )}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function PeptideCard({ name, data, router }) {
  const [expanded, setExpanded] = useState(false);

  // Determine the overall risk badge for the card
  const hasHighRisk = Object.values(data.doses).some(d => d.riskLevel === 'high');
  const hasElevated = Object.values(data.doses).some(d => d.riskLevel === 'elevated');
  const overallRisk = hasHighRisk ? 'high' : hasElevated ? 'elevated' : 'standard';

  return (
    <TouchableOpacity style={s.peptideCard} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[s.colorDot, { backgroundColor: data.color }]} />
            <Text style={{ fontSize: 20, fontWeight: '600', color: Colors.textPrimary }}>{name}</Text>
          </View>
          <Text style={{ fontSize: 13, fontWeight: '500', color: Colors.textSecondary, marginTop: 4, marginLeft: 20 }}>{data.category}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {overallRisk !== 'standard' && (
            <View style={[s.riskBadge, { backgroundColor: getRiskColor(overallRisk) + '18' }]}>
              <AlertTriangle size={10} color={getRiskColor(overallRisk)} />
              <Text style={[s.riskBadgeText, { color: getRiskColor(overallRisk) }]}>{getRiskLabel(overallRisk)}</Text>
            </View>
          )}
          <View style={s.chevronBtn}>
            <ChevronDown size={16} color={Colors.textSecondary} style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }} />
          </View>
        </View>
      </View>

      {expanded && (
        <View style={{ gap: Spacing.md, marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.grey100 }}>
          <Text style={{ fontSize: 14, color: Colors.textSecondary, lineHeight: 22 }}>{data.desc}</Text>

          {/* Quick Facts */}
          <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
            <View style={s.infoBox}>
              <Text style={s.infoLabel}>Schedule</Text>
              <Text style={s.infoValue}>{data.schedule}</Text>
            </View>
            <View style={s.infoBox}>
              <Text style={s.infoLabel}>Cycle</Text>
              <Text style={s.infoValue}>{data.typicalCycle ? `${data.typicalCycle} weeks` : 'As needed'}</Text>
            </View>
          </View>

          {/* Dose Tiers */}
          <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textPrimary, textTransform: 'uppercase', letterSpacing: 1 }}>Dosing Tiers</Text>
          {Object.entries(data.doses).map(([tier, dose]) => (
            <View key={tier} style={[s.doseTierCard, { borderLeftColor: getRiskColor(dose.riskLevel) }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={s.doseTierName}>{dose.label}</Text>
                  <Text style={s.doseTierMcg}>{dose.mcg >= 1000 ? `${(dose.mcg / 1000).toFixed(dose.mcg % 1000 === 0 ? 0 : 1)}mg` : `${dose.mcg}mcg`}</Text>
                </View>
                <View style={[s.riskPill, { backgroundColor: getRiskColor(dose.riskLevel) + '18' }]}>
                  <Text style={[s.riskPillText, { color: getRiskColor(dose.riskLevel) }]}>{getRiskLabel(dose.riskLevel)}</Text>
                </View>
              </View>
              <Text style={s.doseTierRisk}>{dose.risk}</Text>
              <Text style={s.doseTierSource}>Source: {dose.source}</Text>
            </View>
          ))}

          {/* Timing & Administration */}
          <View style={s.infoBox}>
            <Text style={s.infoLabel}>Timing</Text>
            <Text style={[s.infoValue, { fontSize: 13, lineHeight: 18 }]}>{data.timing}</Text>
          </View>
          <View style={s.infoBox}>
            <Text style={s.infoLabel}>Administration</Text>
            <Text style={[s.infoValue, { fontSize: 13, lineHeight: 18 }]}>{data.administration}</Text>
          </View>
          <View style={s.infoBox}>
            <Text style={s.infoLabel}>Reconstitution</Text>
            <Text style={[s.infoValue, { fontSize: 13, lineHeight: 18 }]}>{data.reconstitution}</Text>
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm }}>
            <TouchableOpacity style={s.addBtn} onPress={() => router.push('/protocol-wizard')} activeOpacity={0.8}>
              <Text style={s.addBtnText}>Add to Protocol</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.calcBtn} onPress={() => router.push('/(tabs)/calculator')} activeOpacity={0.7}>
              <Text style={{ color: Colors.textPrimary, fontSize: 14, fontWeight: '600' }}>Calc</Text>
              <ArrowRight size={14} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  content: { padding: Spacing.lg, paddingTop: 60, gap: Spacing.lg },
  header: {},
  title: { fontSize: Typography['4xl'], fontWeight: '600', color: Colors.textPrimary, letterSpacing: -1 },
  subtitle: { color: Colors.textSecondary, fontSize: Typography.sm, marginTop: Spacing.xs },

  courseCard: { backgroundColor: 'rgba(168,85,247,0.05)', borderRadius: Radius.xl, borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)', padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, ...Shadows.card },
  courseIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.panelBg, borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)', alignItems: 'center', justifyContent: 'center', ...Shadows.button },
  courseTitle: { fontWeight: '600', color: Colors.textPrimary, fontSize: 15 },
  courseSubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },

  searchWrap: { position: 'relative' },
  searchInput: { backgroundColor: Colors.panelBg, borderWidth: 1, borderColor: Colors.grey200, borderRadius: Radius.xl, paddingVertical: 16, paddingLeft: 44, paddingRight: 16, fontSize: 16, color: Colors.textPrimary, ...Shadows.layered },

  pill: { backgroundColor: Colors.panelBg, borderWidth: 1, borderColor: Colors.grey200, borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 8, ...Shadows.button },
  pillActive: { backgroundColor: Colors.cardDark, borderColor: Colors.cardDark },
  pillText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: Colors.textInverse },

  resultsCount: { fontSize: 13, color: Colors.grey400, fontWeight: '500' },

  peptideCard: { backgroundColor: Colors.panelBg, borderRadius: Radius.xl, padding: 20, overflow: 'hidden', ...Shadows.card },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  chevronBtn: { width: 36, height: 36, borderRadius: Radius.full, backgroundColor: Colors.grey100, borderWidth: 1, borderColor: Colors.grey200, alignItems: 'center', justifyContent: 'center' },

  riskBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  riskBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  infoBox: { flex: 1, backgroundColor: Colors.bgSecondary, borderRadius: 12, padding: Spacing.md },
  infoLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: Colors.textSecondary, marginBottom: 4 },
  infoValue: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },

  doseTierCard: { backgroundColor: Colors.bgSecondary, borderRadius: 12, padding: Spacing.md, borderLeftWidth: 3, gap: 6 },
  doseTierName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  doseTierMcg: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  doseTierRisk: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  doseTierSource: { fontSize: 10, color: Colors.grey400, fontStyle: 'italic' },

  riskPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  riskPillText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  addBtn: { flex: 1, backgroundColor: Colors.cardDark, borderRadius: Radius.full, paddingVertical: 14, alignItems: 'center', ...Shadows.layered },
  addBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textInverse },
  calcBtn: { backgroundColor: Colors.panelBg, borderWidth: 1, borderColor: Colors.grey200, borderRadius: Radius.full, paddingHorizontal: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, ...Shadows.button },

  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
});
