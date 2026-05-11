import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronDown, ArrowRight, BookOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import { peptidesDB, calcConcentration, calcDrawVolume, calcSyringeUnits, calcDosesPerVial, calcVialsNeeded } from '@/data/peptides';

const compoundNames = Object.keys(peptidesDB);

export default function CalculatorScreen() {
  const router = useRouter();
  const [mode, setMode] = useState('reconstitution');
  const [compound, setCompound] = useState('BPC-157');
  const [vialMg, setVialMg] = useState('5');
  const [waterMl, setWaterMl] = useState('2');
  const [supplyWeeks, setSupplyWeeks] = useState('8');
  const [dosesPerWeek, setDosesPerWeek] = useState('7');
  const [showPicker, setShowPicker] = useState(false);
  const [expandedTier, setExpandedTier] = useState<string | null>(null);

  const compData = peptidesDB[compound];
  const concentration = calcConcentration(parseFloat(vialMg || 0), parseFloat(waterMl || 0));

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View>
        <Text style={s.title}>Calculator</Text>
        <Text style={s.subtitle}>Research-backed dosing math</Text>
      </View>

      {/* Mode Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 8 }}>
          {[{ id: 'reconstitution', label: 'Reconstitution' }, { id: 'supply', label: 'Supply Estimator' }].map(m => {
            const isActive = mode === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                onPress={() => setMode(m.id)}
                style={[s.modeTab, isActive && s.modeTabActive]}
                activeOpacity={0.7}
              >
                <Text style={[s.modeTabText, isActive && s.modeTabTextActive]}>{m.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Compound Picker */}
      <View style={{ gap: 6, zIndex: 10 }}>
        <Text style={s.label}>Compound</Text>
        <TouchableOpacity style={s.pickerBtn} onPress={() => setShowPicker(!showPicker)} activeOpacity={0.7}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[s.colorDot, { backgroundColor: compData?.color || Colors.accentDark }]} />
            <Text style={{ fontWeight: '600', color: Colors.textPrimary, fontSize: 16 }}>{compound}</Text>
            <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{compData?.category}</Text>
          </View>
          <ChevronDown size={16} color={Colors.textSecondary} style={{ transform: [{ rotate: showPicker ? '180deg' : '0deg' }] }} />
        </TouchableOpacity>

        {showPicker && (
          <View style={s.pickerList}>
            {compoundNames.map(name => (
              <TouchableOpacity
                key={name}
                style={[s.pickerItem, compound === name && { backgroundColor: Colors.grey100 }]}
                onPress={() => { setCompound(name); setVialMg(peptidesDB[name].defaultVial.toString()); setShowPicker(false); }}
              >
                <View style={[s.colorDotSm, { backgroundColor: peptidesDB[name].color || Colors.accentDark }]} />
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary }}>{name}</Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{peptidesDB[name].category}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* ═══ RECONSTITUTION MODE ═══ */}
      {mode === 'reconstitution' && (
        <View style={{ gap: 16 }}>
          <View style={s.inputCard}>
            <InputRow label="Vial Size" value={vialMg} onChange={setVialMg} unit="mg" />
            <InputRow label="Bacteriostatic Water" value={waterMl} onChange={setWaterMl} unit="ml" />
          </View>

          {concentration > 0 && (
            <LinearGradient colors={['#2a2a2e', '#3a3a40', '#4a4a50']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.resultRow}>
              <View>
                <Text style={s.resultLabel}>Concentration</Text>
                <Text style={s.resultValue}>{(concentration / 1000).toFixed(2)} <Text style={s.resultUnit}>mg/ml</Text></Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.resultLabel}>{concentration.toFixed(0)}</Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>mcg per ml</Text>
              </View>
            </LinearGradient>
          )}

          {concentration > 0 && compData && (
            <View style={{ gap: 10, marginTop: 8 }}>
              <Text style={s.label}>Auto-Calculated Dosages for {compound}</Text>
              {Object.entries(compData.doses).map(([tier, data]) => {
                const doseMcg = data.mcg;
                const drawMl = calcDrawVolume(doseMcg, concentration);
                const units = calcSyringeUnits(drawMl);
                const dosesVial = calcDosesPerVial(parseFloat(vialMg), doseMcg);
                const isHigh = tier === 'high';
                const isMed = tier === 'med';
                const isExpanded = expandedTier === tier;

                return (
                  <TouchableOpacity key={tier} style={[s.tierCard, isHigh && s.tierCardHigh, isMed && s.tierCardMed]} activeOpacity={0.7} onPress={() => setExpandedTier(isExpanded ? null : tier)}>
                    {isHigh && <View style={[s.tierStripe, { backgroundColor: Colors.danger }]} />}
                    {isMed && <View style={[s.tierStripe, { backgroundColor: Colors.textPrimary }]} />}
                    <View style={{ flex: 1, paddingLeft: (isHigh || isMed) ? 8 : 0, paddingRight: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={[s.tierName, isHigh && { color: Colors.danger }]}>
                          {tier === 'low' ? 'Low' : tier === 'med' ? 'Medium' : 'High'}
                        </Text>
                        {isMed && <View style={s.recBadge}><Text style={s.recBadgeText}>RECOMMENDED</Text></View>}
                        {isHigh && <View style={[s.recBadge, { backgroundColor: 'rgba(239,68,68,0.1)' }]}><Text style={[s.recBadgeText, { color: Colors.danger }]}>⚠ CAUTION</Text></View>}
                        <View style={{ flex: 1 }} />
                        <ChevronDown size={14} color={Colors.grey400} style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }} />
                      </View>
                      <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>{data.label}</Text>
                      {isExpanded && (
                        <View style={{ marginTop: 8 }}>
                          <Text style={{ fontSize: 12, color: isHigh ? Colors.danger : Colors.textPrimary, lineHeight: 18 }}>{data.risk}</Text>
                          <Text style={{ fontSize: 10, color: Colors.textSecondary, marginTop: 4, fontStyle: 'italic' }}>{data.source}</Text>
                          <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 6 }}>{Math.floor(dosesVial)} doses per vial</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                      <Text style={[s.tierUnits, isHigh && { color: Colors.danger }]}>{units.toFixed(1)}</Text>
                      <Text style={{ fontSize: 9, color: Colors.textSecondary, fontWeight: '700', marginTop: 4 }}>UNITS</Text>
                      <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 8 }}>{doseMcg}mcg</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Reconstitution Guide — Collapsible */}
          {compData && (() => {
            const [reconOpen, setReconOpen] = React.useState(false);
            const [infoExpanded, setInfoExpanded] = React.useState<string | null>(null);
            const infoItems = [
              { key: 'timing', label: 'Best Time', value: compData.timing, icon: '🕐' },
              { key: 'schedule', label: 'Schedule', value: compData.schedule, icon: '📅' },
              { key: 'admin', label: 'Administration', value: compData.administration, icon: '💉' },
              { key: 'cycle', label: 'Typical Cycle', value: `${compData.typicalCycle} weeks`, icon: '🔄' },
            ];

            return (
              <View style={s.guideCard}>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} activeOpacity={0.7} onPress={() => setReconOpen(!reconOpen)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <BookOpen size={14} color={Colors.textPrimary} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textPrimary }}>How to Reconstitute</Text>
                  </View>
                  <ChevronDown size={14} color={Colors.grey400} style={{ transform: [{ rotate: reconOpen ? '180deg' : '0deg' }] }} />
                </TouchableOpacity>

                {reconOpen && (
                  <View style={{ gap: 14, marginTop: 14 }}>
                    <Text style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 20 }}>{compData.reconstitution}</Text>

                    <View style={{ gap: 0 }}>
                      {infoItems.map((item, i) => (
                        <View key={item.key}>
                          <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13 }}
                            activeOpacity={0.7}
                            onPress={() => setInfoExpanded(infoExpanded === item.key ? null : item.key)}
                          >
                            <Text style={{ fontSize: 15, marginRight: 10 }}>{item.icon}</Text>
                            <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: Colors.textPrimary }}>{item.label}</Text>
                            <ChevronDown size={14} color={Colors.grey400} style={{ transform: [{ rotate: infoExpanded === item.key ? '180deg' : '0deg' }] }} />
                          </TouchableOpacity>
                          {infoExpanded === item.key && (
                            <Text style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 19, paddingBottom: 10, paddingLeft: 25 }}>{item.value}</Text>
                          )}
                          {i < infoItems.length - 1 && <View style={{ height: 1, backgroundColor: 'rgba(200,205,210,0.12)' }} />}
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            );
          })()}

          <TouchableOpacity style={s.actionBtn} onPress={() => router.push('/protocol-wizard')} activeOpacity={0.8}>
            <ArrowRight size={16} color={Colors.textInverse} />
            <Text style={s.actionBtnText}>Add to Protocol</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ═══ SUPPLY ESTIMATOR MODE ═══ */}
      {mode === 'supply' && (
        <View style={{ gap: 16 }}>
          <View style={s.inputCard}>
            <InputRow label="Vial Size" value={vialMg} onChange={setVialMg} unit="mg" />
            <InputRow label="Dose per injection" value={(compData?.doses?.med?.mcg || 500).toString()} onChange={() => {}} unit="mcg" />
            <InputRow label="Doses per Week" value={dosesPerWeek} onChange={setDosesPerWeek} unit="doses" />
            <InputRow label="Cycle Length" value={supplyWeeks} onChange={setSupplyWeeks} unit="weeks" />
          </View>

          {(() => {
            const medDose = compData?.doses?.med?.mcg || 500;
            const needed = calcVialsNeeded(medDose, parseFloat(dosesPerWeek || 0), parseFloat(supplyWeeks || 0), parseFloat(vialMg || 0));
            return (
              <View style={s.supplyResult}>
                <Text style={s.supplyLabel}>You Will Need</Text>
                <Text style={s.supplyValue}>{needed > 0 ? needed : '—'}</Text>
                <Text style={{ color: Colors.textPrimary, fontWeight: '500', fontSize: 14, marginTop: 8 }}>vials of {compound} ({vialMg}mg each)</Text>
                <Text style={{ color: Colors.textSecondary, fontSize: 12, marginTop: 12 }}>for {supplyWeeks} weeks at {medDose}mcg × {dosesPerWeek}x/week</Text>
              </View>
            );
          })()}
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function InputRow({ label, value, onChange, unit }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={s.label}>{label}</Text>
      <View style={s.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          style={s.input}
          placeholderTextColor={Colors.grey400}
          placeholder="0"
        />
        <Text style={{ color: Colors.textSecondary, fontWeight: '600', fontSize: 14 }}>{unit}</Text>
      </View>
    </View>
  );
}



const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  content: { padding: Spacing.lg, paddingTop: 60, gap: 20, paddingBottom: 140 },
  title: { fontSize: Typography['4xl'], fontWeight: '600', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginTop: 4 },
  
  label: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: Colors.textSecondary, paddingLeft: 4 },
  
  modeTab: { backgroundColor: Colors.panelBg, borderWidth: 1, borderColor: Colors.grey200, borderRadius: Radius.full, paddingHorizontal: 20, paddingVertical: 10, ...Shadows.button },
  modeTabActive: { backgroundColor: Colors.cardDark, borderColor: Colors.cardDark },
  modeTabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  modeTabTextActive: { color: Colors.textInverse },
  
  pickerBtn: { backgroundColor: Colors.panelBg, borderRadius: Radius.xl, paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, ...Shadows.card },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  colorDotSm: { width: 8, height: 8, borderRadius: 4 },
  pickerList: { backgroundColor: Colors.panelBg, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.grey200, overflow: 'hidden', position: 'absolute', top: 78, left: 0, right: 0, zIndex: 20, ...Shadows.layered },
  pickerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.grey100 },
  
  inputCard: { backgroundColor: Colors.panelBg, borderRadius: Radius.xl, padding: Spacing.lg, gap: 16, zIndex: 1, ...Shadows.card },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgSecondary, borderRadius: 14, borderWidth: 1, borderColor: 'transparent', paddingHorizontal: 16, paddingVertical: 14 },
  input: { flex: 1, fontSize: 18, color: Colors.textPrimary, fontWeight: '600', padding: 0 },
  
  resultRow: { borderRadius: 18, padding: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: Colors.textInverseSec },
  resultValue: { fontSize: 24, fontWeight: '600', color: Colors.textInverse, marginTop: 4 },
  resultUnit: { fontSize: 14, fontWeight: '400', color: Colors.textInverseSec },
  
  tierCard: { backgroundColor: Colors.panelBg, borderRadius: Radius.xl, padding: 20, borderWidth: 1, borderColor: Colors.grey200, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', overflow: 'hidden', ...Shadows.button },
  tierCardHigh: { backgroundColor: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' },
  tierCardMed: { borderColor: Colors.grey300, ...Shadows.card },
  tierStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  tierName: { fontWeight: '600', fontSize: 15, color: Colors.textPrimary },
  tierUnits: { fontSize: 28, fontWeight: '600', color: Colors.textPrimary, lineHeight: 28 },
  
  recBadge: { backgroundColor: 'rgba(52,199,89,0.12)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  recBadgeText: { fontSize: 8, color: '#34C759', fontWeight: '700', letterSpacing: 1 },
  
  guideCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, marginTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 3 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: Colors.grey200, marginTop: 4 },
  infoGridItem: { width: '50%', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.grey200 },
  infoLabel: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  infoValue: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary, lineHeight: 18 },
  actionBtn: { backgroundColor: Colors.cardDark, borderRadius: Radius.full, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, ...Shadows.layered },
  actionBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textInverse },
  
  supplyResult: { backgroundColor: Colors.panelBg, borderRadius: Radius.xl, paddingVertical: 40, paddingHorizontal: Spacing.lg, alignItems: 'center', ...Shadows.layered },
  supplyLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: Colors.textSecondary },
  supplyValue: { fontSize: 56, fontWeight: '700', color: Colors.textPrimary, marginTop: 8, lineHeight: 56 },
});
