import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Platform, Alert, TextInput } from 'react-native';
import { PlusCircle, Calendar, Edit3, Trash2, ArrowRight, X, Minus, Plus, Droplets, ChevronDown } from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Svg, { Rect, Line, Defs, LinearGradient as SvgLG, Stop } from 'react-native-svg';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import { getProtocols, saveProtocols, getVialInventory, saveVialInventory } from '@/utils/storage';
import { doseInfo, doseBreakdown } from '@/utils/doseFormat';
import { peptidesDB } from '@/data/peptides';
import DoseSelector from '@/components/DoseSelector';

export default function Protocols() {
  const router = useRouter();
  const [protocols, setProtocols] = useState([]);
  const [inventory, setInventory] = useState({});
  const [selectedComp, setSelectedComp] = useState(null);
  const [showVialModal, setShowVialModal] = useState(false);
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProto, setEditingProto] = useState<any>(null);
  const [editProtoName, setEditProtoName] = useState('');
  const [editVialDeltas, setEditVialDeltas] = useState<Record<string,number>>({});
  const [editDoseMcg, setEditDoseMcg] = useState<Record<string,number>>({});
  const [editPrices, setEditPrices] = useState<Record<string,string>>({});

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

  const openEditProtocol = (proto: any) => {
    setEditingProto(proto);
    setEditProtoName(proto.name);
    setEditVialDeltas({});
    setEditDoseMcg({});
    // Pre-fill prices from existing compound data
    const prices: Record<string, string> = {};
    (proto.compounds || []).forEach((c: any) => {
      if (c.pricePerVial && c.pricePerVial > 0) prices[c.compound] = String(c.pricePerVial);
    });
    setEditPrices(prices);
    setShowEditModal(true);
  };

  const saveEditedProtocol = async () => {
    if (!editingProto) return;
    const updatedProtocols = protocols.map((p: any) => {
      if (p.id !== editingProto.id) return p;
      const updatedCompounds = p.compounds.map((c: any) => {
        const mcg = editDoseMcg[c.compound];
        const newPrice = parseFloat(editPrices[c.compound] || '0') || c.pricePerVial || 0;
        if (!mcg) return { ...c, pricePerVial: newPrice };
        const vialAmt = parseFloat(c.amount);
        const vialMl = parseFloat(c.vialSizeMl) || 3;
        const vialAmtMcg = c.unit === 'mg' ? vialAmt * 1000 : vialAmt;
        const newDosePerUseMl = (mcg * vialMl) / vialAmtMcg;
        return { ...c, dosePerUseMl: parseFloat(newDosePerUseMl.toFixed(3)), pricePerVial: newPrice };
      });
      return { ...p, name: editProtoName.trim() || p.name, compounds: updatedCompounds };
    });
    const inv = { ...inventory };
    for (const [compound, delta] of Object.entries(editVialDeltas)) {
      if (!delta) continue;
      if (!inv[compound]) {
        const comp = editingProto.compounds.find((c: any) => c.compound === compound);
        inv[compound] = { vialCount: Math.max(0, delta), currentVialMl: parseFloat(comp?.vialSizeMl) || 3, vialSizeMl: parseFloat(comp?.vialSizeMl) || 3, dosePerUseMl: parseFloat(comp?.dosePerUseMl) || 0.1, totalPurchased: Math.max(0, delta) };
      } else {
        inv[compound] = { ...inv[compound], vialCount: Math.max(0, (inv[compound].vialCount || 0) + delta) };
        if (delta > 0) inv[compound].totalPurchased = (inv[compound].totalPurchased || 0) + delta;
      }
    }
    setProtocols(updatedProtocols);
    setInventory(inv);
    await saveProtocols(updatedProtocols);
    await saveVialInventory(inv);
    setShowEditModal(false);
  };

  const updateVialCount = async (compName, delta) => {
    const inv = { ...inventory };
    if (!inv[compName]) {
      inv[compName] = { vialCount: 1, currentVialMl: 3, vialSizeMl: 3, dosePerUseMl: 0.1, totalPurchased: delta > 0 ? 1 : 0 };
    } else {
      inv[compName].vialCount = Math.max(0, (inv[compName].vialCount || 0) + delta);
      if (delta > 0) inv[compName].totalPurchased = (inv[compName].totalPurchased || 0) + delta;
    }
    setInventory(inv);
    await saveVialInventory(inv);
  };

  const deleteProtocol = (protoId: string, protoName: string) => {
    Alert.alert(
      'Delete Protocol',
      `Are you sure you want to delete "${protoName}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = protocols.filter(p => p.id !== protoId);
            setProtocols(updated);
            await saveProtocols(updated);
          },
        },
      ]
    );
  };



  // Collect all unique compounds with inventory across all protocols
  const allCompounds = useMemo(() => {
    const map: Record<string, any> = {};
    protocols.forEach((p: any) => {
      (p.compounds || []).forEach((c: any) => {
        if (!map[c.compound]) map[c.compound] = { ...c };
      });
    });
    return Object.values(map);
  }, [protocols]);



  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
      <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View>
            <Text style={s.title}>My Vials</Text>
            <Text style={s.subtitle}>{allCompounds.length} PEPTIDE{allCompounds.length !== 1 ? 'S' : ''}</Text>
          </View>
          <TouchableOpacity style={s.newBtn} activeOpacity={0.7} onPress={() => router.push('/protocol-wizard')}>
            <PlusCircle size={16} color={Colors.textPrimary} />
            <Text style={s.newBtnText}>New</Text>
          </TouchableOpacity>
        </View>



        {/* ═══ Visual Vials ═══ */}
        {allCompounds.length === 0 ? (
          <View style={s.emptySmall}>
            <Text style={s.emptySmallText}>No vials tracked yet</Text>
          </View>
        ) : (
          <View style={{ marginBottom: 20 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4, gap: 12, paddingBottom: 4 }}>
              {allCompounds.map((c: any) => {
                const db = peptidesDB[c.compound];
                const v = inventory[c.compound];
                const fillPct = v ? Math.max(0, Math.min(1, v.currentVialMl / (v.vialSizeMl || 3))) : 1;
                const vialCount = v ? v.vialCount : (c.vialsOnHand || 0);
                const isLow = fillPct < 0.25;
                const pctNum = Math.round(fillPct * 100);
                const fillColor = pctNum >= 70 ? (db?.color || '#34C759') : pctNum >= 30 ? '#F59E0B' : '#EF4444';
                const vialW = 90;
                const vialH = 130;
                const bodyTop = 30;
                const bodyH = vialH - bodyTop - 8;
                const liquidH = bodyH * fillPct;
                const liquidY = bodyTop + (bodyH - liquidH);

                return (
                  <TouchableOpacity key={c.compound} style={s.vialCard} activeOpacity={0.7} onPress={() => openVialDetail(c)}>
                    <Svg width={vialW} height={vialH} viewBox={`0 0 ${vialW} ${vialH}`}>
                      <Defs>
                        <SvgLG id={`vf_${c.compound.replace(/[^a-zA-Z]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0" stopColor={fillColor} stopOpacity="0.8" />
                          <Stop offset="1" stopColor={fillColor} stopOpacity="0.4" />
                        </SvgLG>
                      </Defs>
                      {/* Cap */}
                      <Rect x={28} y={2} width={34} height={12} rx={3} fill="rgba(180,185,190,0.6)" />
                      {/* Neck */}
                      <Rect x={34} y={14} width={22} height={16} rx={2} fill="rgba(200,205,210,0.15)" stroke="rgba(200,205,210,0.25)" strokeWidth={1} />
                      {/* Body */}
                      <Rect x={16} y={bodyTop} width={58} height={bodyH} rx={8} fill="rgba(200,205,210,0.08)" stroke="rgba(200,205,210,0.2)" strokeWidth={1} />
                      {/* Liquid fill */}
                      {fillPct > 0 && (
                        <Rect x={17} y={liquidY} width={56} height={liquidH} rx={7} fill={`url(#vf_${c.compound.replace(/[^a-zA-Z]/g, '')})`} />
                      )}
                      {/* Measurement lines */}
                      {[0.25, 0.5, 0.75].map((ln, i) => (
                        <Line key={i} x1={20} y1={bodyTop + bodyH * (1 - ln)} x2={28} y2={bodyTop + bodyH * (1 - ln)} stroke="rgba(200,205,210,0.2)" strokeWidth={0.5} />
                      ))}
                    </Svg>
                    <Text style={s.vialCardName} numberOfLines={1}>{c.compound}</Text>
                    <Text style={s.vialCardMg}>{c.amount || db?.defaultVial || '—'} mg</Text>
                    <Text style={[s.vialCardPct, { color: fillColor }]}>{pctNum}%</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ═══ Start a Protocol ═══ */}
        <TouchableOpacity
          style={s.startProtoBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/protocol-templates')}
        >
          <PlusCircle size={18} color="#fff" />
          <Text style={s.startProtoBtnText}>Start a Protocol</Text>
        </TouchableOpacity>

        {/* ═══ Protocols ═══ */}
        <View style={{ gap: 10 }}>
          <Text style={s.sectionTitle}>My Protocols</Text>

          {protocols.length === 0 ? (
            <View style={s.emptyCard}>
              <Text style={s.emptyText}>No protocols yet</Text>
              <Text style={[s.emptyText, { fontSize: 12, marginTop: 4 }]}>Tap "Start a Protocol" above to get started</Text>
            </View>
          ) : (
            protocols.map((proto) => {
              const week = getWeek(proto.createdAt);
              const allComps = proto.compounds || [];
              const totalVials = allComps.reduce((sum, c) => {
                const v = inventory[c.compound];
                return sum + (v ? v.vialCount : (c.vialsOnHand || 0));
              }, 0);

              return (
                <View key={proto.id} style={s.cycleCard}>
                  <View style={s.cycleHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.cycleName}>{proto.name}</Text>
                      <View style={s.weekRow}>
                        <Text style={s.cycleWeek}>Week {week}</Text>
                        {(() => {
                          const maxCycle = allComps.reduce((max, c) => {
                            const pep = peptidesDB[c.compound];
                            return Math.max(max, pep?.typicalCycle || 0);
                          }, 0);
                          if (!maxCycle) return null;
                          const remaining = Math.max(0, maxCycle - week);
                          return (
                            <>
                              <Text style={s.weekDot}>·</Text>
                              <Text style={[s.weeksLeft, remaining === 0 && { color: '#34C759' }]}>
                                {remaining === 0 ? 'Complete' : `${remaining}w left`}
                              </Text>
                            </>
                          );
                        })()}
                        <Text style={s.weekDot}>·</Text>
                        <Text style={s.cycleStarted}>{formatDate(proto.createdAt)}</Text>
                      </View>
                    </View>
                    <View style={s.cardActions}>
                      <TouchableOpacity style={s.editBtn} onPress={(e) => { e.stopPropagation?.(); openEditProtocol(proto); }} activeOpacity={0.7}>
                        <Edit3 size={13} color={Colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity style={s.editBtn} onPress={(e) => { e.stopPropagation?.(); deleteProtocol(proto.id, proto.name); }} activeOpacity={0.7}>
                        <Trash2 size={13} color={Colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Compounds */}
                  <View style={s.compList}>
                    {allComps.map((c, ci) => {
                      const v = inventory[c.compound];
                      const fillPct = v ? Math.max(0, Math.min(1, v.currentVialMl / (v.vialSizeMl || 3))) : null;
                      const pctColor = fillPct === null ? Colors.textSecondary : fillPct > 0.5 ? '#34C759' : fillPct > 0.25 ? '#FFCC00' : '#FF3B30';
                      const inv = inventory[c.compound];
                      const richC = inv ? { ...c, dosePerUseMl: c.dosePerUseMl || inv.dosePerUseMl || 0, vialSizeMl: c.vialSizeMl || inv.vialSizeMl || 3, amount: c.amount || inv.amount || 0, unit: c.unit || inv.unit || 'mg' } : c;
                      const info = doseInfo(richC);
                      return (
                        <TouchableOpacity key={ci} style={s.compRow} onPress={() => openVialDetail(c)} activeOpacity={0.7}>
                          <View style={s.compRowLeft}>
                            <View style={[s.compDot, { backgroundColor: c.color || '#999' }]} />
                            <View>
                              <Text style={s.compRowName}>{c.compound}</Text>
                              {info && <Text style={s.compRowDose}>{info}</Text>}
                            </View>
                          </View>
                          {fillPct !== null && <Text style={[s.compRowPct, { color: pctColor }]}>{Math.round(fillPct * 100)}%</Text>}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={s.cycleFoot}>
                    <Text style={s.cycleFootText}>{totalVials} vial{totalVials !== 1 ? 's' : ''} in stock</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ═══ Vial Detail Modal ═══ */}
      <Modal visible={showVialModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { maxHeight: '92%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
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

                  {/* Low stock warning banner */}
                  {fillPct < 0.25 && (
                    <View style={s.lowBanner}>
                      <Text style={s.lowBannerText}>
                        {vial.vialCount === 0
                          ? '🚨 Out of Stock — Please reorder'
                          : `⚠️ Low Stock — ${vial.currentVialMl?.toFixed(1)} mL remaining (${Math.floor((vial.currentVialMl || 0) / (vial.dosePerUseMl || 0.1))} doses left)`}
                      </Text>
                    </View>
                  )}

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

                  {/* Dose info — uses inventory-enriched comp for NAD+ compatibility */}
                  {(() => {
                    const richComp = {
                      ...selectedComp,
                      dosePerUseMl: selectedComp.dosePerUseMl || vial.dosePerUseMl || 0,
                      vialSizeMl: selectedComp.vialSizeMl || vial.vialSizeMl || 3,
                      amount: selectedComp.amount || vial.amount || 0,
                      unit: selectedComp.unit || vial.unit || 'mg',
                    };
                    const bd = doseBreakdown(richComp);
                    return bd ? (
                      <View style={s.doseInfoCard}>
                        <Text style={s.doseInfoTitle}>Dose Breakdown</Text>
                        <View style={s.doseInfoGrid}>
                          <View style={s.doseInfoItem}>
                            <Text style={s.doseInfoVal}>{bd.syringeUnits}</Text>
                            <Text style={s.doseInfoLbl}>units</Text>
                          </View>
                          <View style={s.doseInfoDivider} />
                          <View style={s.doseInfoItem}>
                            <Text style={s.doseInfoVal}>{bd.drawMl.toFixed(2)}</Text>
                            <Text style={s.doseInfoLbl}>mL draw</Text>
                          </View>
                          <View style={s.doseInfoDivider} />
                          <View style={s.doseInfoItem}>
                            <Text style={s.doseInfoVal}>{bd.actualDoseStr}</Text>
                            <Text style={s.doseInfoLbl}>dose</Text>
                          </View>
                        </View>
                        <Text style={s.doseInfoConc}>Concentration: {bd.concentration}</Text>
                      </View>
                    ) : (
                      <View style={s.doseInfoRow}>
                        <Text style={s.doseInfoLabel}>Vial Content</Text>
                        <Text style={s.doseInfoValue}>{selectedComp.amount} {selectedComp.unit}</Text>
                      </View>
                    );
                  })()}

                  {/* Protocol & Schedule Info */}
                  {(() => {
                    const db = peptidesDB[selectedComp.compound];
                    const richComp2 = {
                      ...selectedComp,
                      dosePerUseMl: selectedComp.dosePerUseMl || vial.dosePerUseMl || 0,
                      vialSizeMl: selectedComp.vialSizeMl || vial.vialSizeMl || 3,
                      amount: selectedComp.amount || vial.amount || 0,
                      unit: selectedComp.unit || vial.unit || 'mg',
                    };
                    const bd2 = doseBreakdown(richComp2);
                    const proto = protocols.find((p: any) => p.status === 'active' && (p.compounds || []).some((c: any) => c.compound === selectedComp.compound));
                    const protoComp = proto ? (proto as any).compounds.find((c: any) => c.compound === selectedComp.compound) : null;
                    const currentWeek = proto ? getWeek((proto as any).createdAt) : null;
                    const cycleWeeks = db?.typicalCycle || 8;
                    const weeksLeft = currentWeek ? Math.max(0, cycleWeeks - currentWeek) : null;

                    return (
                      <>
                        {/* Week & Cycle */}
                        {currentWeek && (
                          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                            <View style={[s.infoChip, { flex: 1 }]}>
                              <Text style={s.infoChipLabel}>CURRENT WEEK</Text>
                              <Text style={s.infoChipValue}>Week {currentWeek} <Text style={{ fontSize: 13, fontWeight: '400', color: Colors.textSecondary }}>of {cycleWeeks}</Text></Text>
                            </View>
                            <View style={[s.infoChip, { flex: 1 }]}>
                              <Text style={s.infoChipLabel}>WEEKS LEFT</Text>
                              <Text style={[s.infoChipValue, weeksLeft !== null && weeksLeft <= 2 && { color: '#EF4444' }]}>{weeksLeft ?? '—'}</Text>
                            </View>
                          </View>
                        )}

                        {/* Dosage Details */}
                        <View style={s.infoChip}>
                          <Text style={s.infoChipLabel}>DOSAGE</Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 }}>
                            <View>
                              <Text style={{ fontSize: 11, color: Colors.grey400 }}>Amount</Text>
                              <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary }}>{protoComp?.dose || selectedComp.dose || '—'}{protoComp?.unit || selectedComp.unit || ''}</Text>
                            </View>
                            <View>
                              <Text style={{ fontSize: 11, color: Colors.grey400 }}>Units</Text>
                              <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary }}>{bd2 ? bd2.syringeUnits : '—'} IU</Text>
                            </View>
                            <View>
                              <Text style={{ fontSize: 11, color: Colors.grey400 }}>Draw</Text>
                              <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary }}>{bd2 ? bd2.drawMl.toFixed(2) : '—'} mL</Text>
                            </View>
                          </View>
                        </View>

                        {/* Schedule */}
                        <View style={[s.infoChip, { marginTop: 8 }]}>
                          <Text style={s.infoChipLabel}>SCHEDULE</Text>
                          <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginTop: 4 }}>{protoComp?.frequency || selectedComp.frequency || db?.schedule || '—'}</Text>
                          {db?.timing && <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 }}>🕐 {db.timing}</Text>}
                          {db?.administration && <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>💉 {db.administration.split('.')[0]}</Text>}
                        </View>

                        {/* Learn More */}
                        {db && (
                          <TouchableOpacity style={s.learnMoreBtn} activeOpacity={0.7} onPress={() => { setShowVialModal(false); router.push('/library'); }}>
                            <Text style={s.learnMoreText}>Learn more about {selectedComp.compound}</Text>
                            <ArrowRight size={14} color={Colors.textPrimary} />
                          </TouchableOpacity>
                        )}
                      </>
                    );
                  })()}
                </>
              );
            })()}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ═══ Edit Protocol Modal ═══ */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { maxHeight: '92%' }]}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Edit Protocol</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)} style={s.modalClose}>
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Protocol Name */}
              <Text style={s.editLabel}>Protocol Name</Text>
              <TextInput
                style={s.editInput}
                value={editProtoName}
                onChangeText={setEditProtoName}
                placeholder="e.g. Healing Cycle"
                placeholderTextColor={Colors.grey400}
              />

              {editingProto?.compounds?.map((c: any) => {
                const inv = inventory[c.compound] || {};
                const currentCount = inv.vialCount ?? c.vialsOnHand ?? 0;
                const delta = editVialDeltas[c.compound] || 0;
                const selectedMcgTier = editDoseMcg[c.compound]
                  ? Object.entries(peptidesDB[c.compound]?.doses || {}).find(([, d]: any) => d.mcg === editDoseMcg[c.compound])?.[0]
                  : null;

                return (
                  <View key={c.compound} style={s.editCompSection}>
                    <View style={s.editCompHeader}>
                      <View style={[s.editCompDot, { backgroundColor: c.color || '#999' }]} />
                      <Text style={s.editCompName}>{c.compound}</Text>
                    </View>

                    {/* Dose adjustment */}
                    {peptidesDB[c.compound]?.doses && (
                      <View>
                        <Text style={s.editSectionLabel}>Daily Dose</Text>
                        <DoseSelector
                          peptideName={c.compound}
                          doses={peptidesDB[c.compound].doses}
                          onSelect={(tier: string, dose: any) => setEditDoseMcg(prev => ({ ...prev, [c.compound]: dose.mcg }))}
                          selectedTier={selectedMcgTier as string | null}
                        />
                      </View>
                    )}

                    {/* Add vials */}
                    <Text style={s.editSectionLabel}>Vials in Stock</Text>
                    <View style={s.editStockRow}>
                      <Text style={s.editStockCurrent}>Current: {currentCount} vial{currentCount !== 1 ? 's' : ''}</Text>
                      <View style={s.editStockStepper}>
                        <TouchableOpacity
                          style={s.editStepBtn}
                          onPress={() => setEditVialDeltas(prev => ({ ...prev, [c.compound]: Math.max(-currentCount, (prev[c.compound] || 0) - 1) }))}
                          activeOpacity={0.7}
                        >
                          <Minus size={14} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={s.editVialDelta}>{delta >= 0 ? `+${delta}` : delta}</Text>
                        <TouchableOpacity
                          style={s.editStepBtn}
                          onPress={() => setEditVialDeltas(prev => ({ ...prev, [c.compound]: (prev[c.compound] || 0) + 1 }))}
                          activeOpacity={0.7}
                        >
                          <Plus size={14} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                      <Text style={s.editVialTotal}>→ {Math.max(0, currentCount + delta)} total</Text>
                    </View>

                    {/* Price per vial */}
                    <Text style={s.editSectionLabel}>Price per Vial ($)</Text>
                    <TextInput
                      style={s.editInput}
                      value={editPrices[c.compound] || ''}
                      onChangeText={(v) => setEditPrices(prev => ({ ...prev, [c.compound]: v }))}
                      placeholder={c.pricePerVial ? String(c.pricePerVial) : '0.00'}
                      placeholderTextColor={Colors.grey400}
                      keyboardType="decimal-pad"
                    />
                  </View>
                );
              })}

              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Action buttons */}
            <View style={s.editActions}>
              <TouchableOpacity style={s.editCancelBtn} onPress={() => setShowEditModal(false)} activeOpacity={0.7}>
                <Text style={s.editCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.editSaveBtn} onPress={saveEditedProtocol} activeOpacity={0.85}>
                <Text style={s.editSaveText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  // Empty state
  emptyCard: { backgroundColor: Colors.panelBg, borderRadius: 16, padding: 28, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(200,205,210,0.2)' },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
  emptyBtn: { backgroundColor: Colors.cardDark, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 9, marginTop: 4 },
  emptyBtnText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  emptySmall: { backgroundColor: Colors.panelBg, borderRadius: 14, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(200,205,210,0.2)' },
  emptySmallText: { fontSize: 13, color: Colors.textSecondary },

  // Vial list
  vialList: {
    backgroundColor: Colors.panelBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.2)',
    overflow: 'hidden',
  },
  vialRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  vialDivider: { height: 1, backgroundColor: 'rgba(200,205,210,0.15)', marginLeft: 16 },
  vialRowName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  vialRowSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  vialPctWrap: { alignItems: 'flex-end', gap: 4, width: 80 },
  vialBarBg: { width: '100%', height: 4, backgroundColor: 'rgba(200,205,210,0.2)', borderRadius: 2, overflow: 'hidden' },
  vialBarFill: { height: '100%', backgroundColor: '#34C759', borderRadius: 2 },
  vialPctText: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },

  // Visual vial cards
  vialCard: { width: 110, backgroundColor: '#FFFFFF', borderRadius: 16, paddingTop: 10, paddingBottom: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  vialCardName: { fontSize: 11, fontWeight: '700', color: Colors.textPrimary, marginTop: 6, textAlign: 'center', paddingHorizontal: 6 },
  vialCardMg: { fontSize: 10, color: Colors.textSecondary, marginTop: 1 },
  vialCardPct: { fontSize: 13, fontWeight: '700', marginTop: 4 },

  // Tab switcher
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(200,205,210,0.1)',
    borderRadius: 10,
    padding: 3,
  },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: Colors.panelBg, ...Shadows.button },
  tabBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabBtnTextActive: { color: Colors.textPrimary },

  // Protocol card
  cycleCard: { backgroundColor: Colors.panelBg, borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: 'rgba(200,205,210,0.2)' },
  cycleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cycleName: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.2 },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  cycleWeek: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  weekDot: { fontSize: 12, color: Colors.grey400 },
  weeksLeft: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  cycleStarted: { fontSize: 12, color: Colors.grey400 },
  editBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(200,205,210,0.1)', alignItems: 'center', justifyContent: 'center' },
  cardActions: { flexDirection: 'row', gap: 4, alignItems: 'center' },

  // Compound rows in protocol
  compList: { gap: 2 },
  compRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 4 },
  compRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  compDot: { width: 8, height: 8, borderRadius: 4 },
  compRowName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  compRowDose: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  compRowPct: { fontSize: 13, fontWeight: '700' },

  // Footer
  cycleFoot: { borderTopWidth: 1, borderTopColor: 'rgba(200,205,210,0.15)', paddingTop: 10, marginTop: 2 },
  cycleFootText: { fontSize: 12, color: Colors.textSecondary },

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

  doseInfoCard: { backgroundColor: 'rgba(200,205,210,0.08)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(200,205,210,0.3)' },
  doseInfoTitle: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' },
  doseInfoGrid: { flexDirection: 'row', borderRadius: 10, overflow: 'hidden', backgroundColor: Colors.panelBg, borderWidth: 1, borderColor: 'rgba(200,205,210,0.2)' },
  doseInfoItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  doseInfoVal: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  doseInfoLbl: { fontSize: 10, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
  doseInfoDivider: { width: 1, backgroundColor: 'rgba(200,205,210,0.3)' },
  doseInfoConc: { fontSize: 11, color: Colors.grey400, textAlign: 'center', marginTop: 10 },

  // ── Edit Protocol Modal ──
  editLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6, marginTop: 16 },
  editInput: { backgroundColor: Colors.grey100, borderRadius: 14, height: 50, paddingHorizontal: 16, fontSize: 16, fontWeight: '500', color: Colors.textPrimary, borderWidth: 1, borderColor: 'rgba(200,205,210,0.4)' },
  editCompSection: { backgroundColor: 'rgba(200,205,210,0.07)', borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 1, borderColor: 'rgba(200,205,210,0.25)', gap: 12 },
  editCompHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  editCompDot: { width: 12, height: 12, borderRadius: 6 },
  editCompName: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  editSectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  editStockRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(200,205,210,0.1)', borderRadius: 14, padding: 14, gap: 12 },
  editStockCurrent: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500', flex: 1 },
  editStockStepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  editStepBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.cardDark, alignItems: 'center', justifyContent: 'center' },
  editVialDelta: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, minWidth: 36, textAlign: 'center' },
  editVialTotal: { fontSize: 13, fontWeight: '600', color: '#34C759', marginLeft: 4 },
  editActions: { flexDirection: 'row', gap: 10, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(200,205,210,0.3)', marginTop: 8 },
  editCancelBtn: { flex: 0.5, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(200,205,210,0.5)' },
  editCancelText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  editSaveBtn: { flex: 1, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.cardDark },
  editSaveText: { fontSize: 15, fontWeight: '600', color: '#FFF' },

  // Info chips
  infoChip: { backgroundColor: 'rgba(200,205,210,0.1)', borderRadius: 14, padding: 14, marginBottom: 4 },
  infoChipLabel: { fontSize: 9, fontWeight: '700', color: Colors.grey400, letterSpacing: 0.6 },
  infoChipValue: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginTop: 4 },

  // Learn more
  learnMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, marginTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(200,205,210,0.15)' },
  learnMoreText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },

  // Start a Protocol
  startProtoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.cardDark, paddingVertical: 16, borderRadius: 14, marginBottom: 20 },
  startProtoBtnText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
});

