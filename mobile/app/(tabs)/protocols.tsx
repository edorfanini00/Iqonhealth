import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Platform, Alert } from 'react-native';
import { PlusCircle, Calendar, Edit3, ArrowRight, X, Minus, Plus, Droplets } from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Svg, { Rect, Line, Defs, LinearGradient as SvgLG, Stop } from 'react-native-svg';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import { getProtocols, getVialInventory, saveVialInventory } from '@/utils/storage';

export default function Protocols() {
  const router = useRouter();
  const [protocols, setProtocols] = useState([]);
  const [inventory, setInventory] = useState({});
  const [selectedComp, setSelectedComp] = useState(null);
  const [showVialModal, setShowVialModal] = useState(false);

  const loadData = useCallback(async () => {
    const p = await getProtocols();
    setProtocols(p);
    const inv = await getVialInventory();
    setInventory(inv);
  }, []);

  useFocusEffect(useCallback(() => {
    loadData();
  }, [loadData]));

  // Calculate week number from createdAt
  const getWeek = (createdAt) => {
    if (!createdAt) return 1;
    const start = new Date(createdAt);
    const now = new Date();
    const diff = Math.floor((now - start) / (7 * 24 * 3600 * 1000));
    return Math.max(1, diff + 1);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const openVialDetail = (comp) => {
    setSelectedComp(comp);
    setShowVialModal(true);
  };

  const updateVialCount = async (compName, delta) => {
    const inv = { ...inventory };
    if (!inv[compName]) {
      inv[compName] = { vialCount: 1, currentVialMl: 3, vialSizeMl: 3, dosePerUseMl: 0.1 };
    }
    inv[compName].vialCount = Math.max(0, (inv[compName].vialCount || 0) + delta);
    setInventory(inv);
    await saveVialInventory(inv);
  };

  const activeProtocols = protocols.filter(p => p.status === 'active');

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
      <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View>
            <Text style={s.title}>Protocols</Text>
            <Text style={s.subtitle}>Manage your cycles</Text>
          </View>
          <TouchableOpacity style={s.newBtn} activeOpacity={0.7} onPress={() => router.push('/protocol-wizard')}>
            <PlusCircle size={16} color={Colors.textPrimary} />
            <Text style={s.newBtnText}>New</Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: Spacing.sm }}>
          <Text style={s.sectionTitle}>Active Cycles</Text>

          {activeProtocols.length === 0 && (
            <View style={s.emptyCard}>
              <Droplets size={28} color={Colors.grey400} />
              <Text style={s.emptyText}>No active protocols yet</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/protocol-wizard')} activeOpacity={0.7}>
                <Text style={s.emptyBtnText}>Create Schedule</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeProtocols.map((proto) => {
            const week = getWeek(proto.createdAt);
            const allComps = proto.compounds || [];
            // Get total vials for this protocol
            const totalVials = allComps.reduce((sum, c) => {
              const v = inventory[c.compound];
              return sum + (v ? v.vialCount : (c.vialsOnHand || 0));
            }, 0);

            return (
              <TouchableOpacity
                key={proto.id}
                style={[s.cycleCard, { borderLeftColor: allComps[0]?.color || Colors.accentDark }]}
                activeOpacity={0.7}
                onPress={() => {
                  if (allComps.length > 0) openVialDetail(allComps[0]);
                }}
              >
                <View style={s.cycleHeader}>
                  <View>
                    <Text style={s.cycleName}>{proto.name}</Text>
                    <Text style={s.cycleWeek}>Week {week}</Text>
                  </View>
                  <TouchableOpacity style={s.editBtn}>
                    <Edit3 size={14} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Compound tags */}
                <View style={s.tagRow}>
                  {allComps.map((c, ci) => (
                    <TouchableOpacity
                      key={ci}
                      style={[s.compTag, { borderColor: c.color || Colors.grey200 }]}
                      onPress={() => openVialDetail(c)}
                      activeOpacity={0.7}
                    >
                      <Text style={s.compTagText}>{c.compound}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Info row: daily dose + vials */}
                <View style={s.infoRow}>
                  {allComps.map((c, ci) => (
                    <Text key={ci} style={s.infoPill}>{c.amount} {c.unit}/{c.frequency === 'daily' ? 'day' : c.frequency}</Text>
                  ))}
                </View>

                <View style={s.cycleFoot}>
                  <View style={s.cycleFootLeft}>
                    <Calendar size={14} color={Colors.textSecondary} />
                    <Text style={s.cycleFootText}>Started {formatDate(proto.createdAt)}</Text>
                  </View>
                  <View style={s.vialBadge}>
                    <Text style={s.vialBadgeText}>🧪 {totalVials} vial{totalVials !== 1 ? 's' : ''}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
          <Text style={[s.sectionTitle, { color: Colors.textSecondary }]}>Templates</Text>
          <TemplateCard title="Healing & Recovery Basics" desc="BPC-157 + TB-500 standard 8-week protocol." onPress={() => router.push('/protocol-wizard')} />
          <TemplateCard title="GLP-1 Beginner" desc="Tirzepatide slow titration schedule." onPress={() => router.push('/protocol-wizard')} />
          <TemplateCard title="Longevity Intro" desc="Epitalon 10-day cycle." onPress={() => router.push('/protocol-wizard')} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ═══ Vial Detail Modal ═══ */}
      <Modal visible={showVialModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            {selectedComp && (() => {
              const vial = inventory[selectedComp.compound] || {
                vialCount: selectedComp.vialsOnHand || 1,
                currentVialMl: selectedComp.vialSizeMl || 3,
                vialSizeMl: selectedComp.vialSizeMl || 3,
                dosePerUseMl: selectedComp.dosePerUseMl || 0.1,
              };
              const fillPct = Math.max(0, Math.min(1, vial.currentVialMl / vial.vialSizeMl));
              const fillColor = fillPct > 0.5 ? '#34C759' : fillPct > 0.25 ? '#FFCC00' : '#FF3B30';
              const totalMl = vial.vialSizeMl || 3;

              return (
                <>
                  {/* Header */}
                  <View style={s.modalHeader}>
                    <Text style={s.modalTitle}>{selectedComp.compound}</Text>
                    <TouchableOpacity onPress={() => setShowVialModal(false)} style={s.modalClose}>
                      <X size={20} color={Colors.textPrimary} />
                    </TouchableOpacity>
                  </View>

                  {/* 2D Vial SVG */}
                  <View style={s.vialContainer}>
                    <Svg width={120} height={200} viewBox="0 0 120 200">
                      <Defs>
                        <SvgLG id="fillGrad" x1="0" y1="1" x2="0" y2="0">
                          <Stop offset="0" stopColor={fillColor} stopOpacity="0.9" />
                          <Stop offset="1" stopColor={fillColor} stopOpacity="0.5" />
                        </SvgLG>
                      </Defs>

                      {/* Vial body */}
                      <Rect x="20" y="30" width="80" height="150" rx="12" ry="12" fill="none" stroke={Colors.grey400} strokeWidth="2" />
                      {/* Vial neck */}
                      <Rect x="40" y="10" width="40" height="25" rx="6" ry="6" fill="none" stroke={Colors.grey400} strokeWidth="2" />
                      {/* Cap */}
                      <Rect x="42" y="5" width="36" height="10" rx="4" ry="4" fill={Colors.cardDark} />

                      {/* Liquid fill */}
                      {fillPct > 0 && (
                        <Rect
                          x="22"
                          y={32 + 146 * (1 - fillPct)}
                          width="76"
                          height={146 * fillPct}
                          rx="10"
                          ry="10"
                          fill="url(#fillGrad)"
                        />
                      )}

                      {/* ML graduation lines */}
                      {Array.from({ length: Math.floor(totalMl) + 1 }, (_, i) => {
                        const y = 178 - (i / totalMl) * 146;
                        return (
                          <React.Fragment key={i}>
                            <Line x1="100" y1={y} x2="108" y2={y} stroke={Colors.grey400} strokeWidth="1" />
                          </React.Fragment>
                        );
                      })}
                    </Svg>

                    {/* ML labels */}
                    <View style={s.mlLabels}>
                      {Array.from({ length: Math.floor(totalMl) + 1 }, (_, i) => (
                        <Text key={i} style={[s.mlLabel, { position: 'absolute', top: 178 - (i / totalMl) * 146 - 7 }]}>{i}</Text>
                      ))}
                    </View>
                  </View>

                  {/* Stats */}
                  <View style={s.statRow}>
                    <View style={s.statItem}>
                      <Text style={s.statValue}>{vial.currentVialMl?.toFixed(1) || '0.0'}</Text>
                      <Text style={s.statLabel}>mL left</Text>
                    </View>
                    <View style={[s.statItem, { borderLeftWidth: 1, borderLeftColor: Colors.grey200 }]}>
                      <Text style={s.statValue}>{vial.vialSizeMl}</Text>
                      <Text style={s.statLabel}>mL total</Text>
                    </View>
                    <View style={[s.statItem, { borderLeftWidth: 1, borderLeftColor: Colors.grey200 }]}>
                      <Text style={s.statValue}>{vial.dosePerUseMl}</Text>
                      <Text style={s.statLabel}>mL/dose</Text>
                    </View>
                  </View>

                  {/* Doses remaining */}
                  <View style={s.dosesRow}>
                    <Text style={s.dosesLabel}>Doses left in vial</Text>
                    <Text style={s.dosesValue}>{Math.floor((vial.currentVialMl || 0) / (vial.dosePerUseMl || 0.1))}</Text>
                  </View>

                  {/* Vials in stock */}
                  <View style={s.stockRow}>
                    <Text style={s.stockLabel}>Vials in Stock</Text>
                    <View style={s.stockStepper}>
                      <TouchableOpacity
                        style={[s.stepperBtn, (vial.vialCount || 0) <= 0 && { opacity: 0.3 }]}
                        onPress={() => updateVialCount(selectedComp.compound, -1)}
                        disabled={(vial.vialCount || 0) <= 0}
                        activeOpacity={0.7}
                      >
                        <Minus size={18} color="#FFF" />
                      </TouchableOpacity>
                      <Text style={s.stockCount}>{vial.vialCount || 0}</Text>
                      <TouchableOpacity
                        style={s.stepperBtn}
                        onPress={() => updateVialCount(selectedComp.compound, 1)}
                        activeOpacity={0.7}
                      >
                        <Plus size={18} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Dose info */}
                  <View style={s.doseInfoRow}>
                    <Text style={s.doseInfoLabel}>Daily Dose</Text>
                    <Text style={s.doseInfoValue}>{selectedComp.amount} {selectedComp.unit}</Text>
                  </View>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function TemplateCard({ title, desc, onPress }) {
  return (
    <TouchableOpacity style={s.templateCard} activeOpacity={0.7} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={s.templateTitle}>{title}</Text>
        <Text style={s.templateDesc}>{desc}</Text>
      </View>
      <ArrowRight size={16} color={Colors.textSecondary} style={{ opacity: 0.5 }} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  content: { padding: Spacing.lg, paddingTop: 60, gap: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: Typography['4xl'], fontWeight: '600', color: Colors.textPrimary, letterSpacing: -1 },
  subtitle: { color: Colors.textSecondary, fontSize: Typography.sm, marginTop: Spacing.xs },
  
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.panelBg, borderWidth: 1, borderColor: Colors.grey200, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, ...Shadows.button },
  newBtnText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '500' },
  
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  
  // Empty state
  emptyCard: { backgroundColor: Colors.panelBg, borderRadius: Radius.xl, padding: 32, alignItems: 'center', gap: 12, ...Shadows.card },
  emptyText: { fontSize: 15, color: Colors.textSecondary },
  emptyBtn: { backgroundColor: Colors.cardDark, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
  emptyBtnText: { fontSize: 14, fontWeight: '600', color: '#FFF' },

  cycleCard: { backgroundColor: Colors.panelBg, borderRadius: Radius.xl, borderLeftWidth: 4, padding: Spacing.xl, gap: Spacing.sm, ...Shadows.card },
  cycleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cycleName: { fontSize: 20, fontWeight: '600', color: Colors.textPrimary },
  cycleWeek: { fontSize: 14, color: Colors.textSecondary },
  editBtn: { width: 36, height: 36, borderRadius: Radius.full, backgroundColor: Colors.grey100, borderWidth: 1, borderColor: Colors.grey200, alignItems: 'center', justifyContent: 'center' },
  
  tagRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs, flexWrap: 'wrap' },
  compTag: { backgroundColor: Colors.grey100, borderWidth: 1, borderColor: Colors.grey200, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: 6 },
  compTagText: { fontSize: 11, fontWeight: '600', color: Colors.textPrimary, letterSpacing: 0.5 },
  
  infoRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  infoPill: { fontSize: 12, color: Colors.textSecondary, backgroundColor: 'rgba(200,205,210,0.12)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },

  cycleFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.grey100, paddingTop: Spacing.md, marginTop: Spacing.xs },
  cycleFootLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  cycleFootText: { fontSize: 12, color: Colors.textSecondary },

  vialBadge: { backgroundColor: 'rgba(52,199,89,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  vialBadgeText: { fontSize: 12, fontWeight: '600', color: '#34C759' },
  
  templateCard: { backgroundColor: Colors.panelBg, borderRadius: Radius.xl, padding: 20, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, ...Shadows.card },
  templateTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  templateDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginTop: 4, paddingRight: Spacing.md },

  // ── Vial Modal ──
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  modalClose: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.grey100, alignItems: 'center', justifyContent: 'center' },

  // Vial SVG
  vialContainer: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 8, marginBottom: 20 },
  mlLabels: { width: 24, height: 200, position: 'relative' },
  mlLabel: { fontSize: 11, color: Colors.grey400, fontWeight: '500' },

  // Stats
  statRow: { flexDirection: 'row', marginBottom: 16 },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  statValue: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  // Doses remaining
  dosesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(200,205,210,0.1)', borderRadius: 14, padding: 16, marginBottom: 12 },
  dosesLabel: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  dosesValue: { fontSize: 20, fontWeight: '700', color: '#34C759' },

  // Stock stepper
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(200,205,210,0.1)', borderRadius: 14, padding: 16, marginBottom: 12 },
  stockLabel: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  stockStepper: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepperBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.cardDark, alignItems: 'center', justifyContent: 'center' },
  stockCount: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, minWidth: 30, textAlign: 'center' },

  // Dose info
  doseInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(200,205,210,0.1)', borderRadius: 14, padding: 16 },
  doseInfoLabel: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  doseInfoValue: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
});
