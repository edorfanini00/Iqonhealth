import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput,
  ScrollView, Modal, Platform, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Plus, Pencil, Clock, Calendar as CalIcon, ChevronDown, Search, Lightbulb, Info, Shield } from 'lucide-react-native';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';
import { peptidesDB, getSuggestedProtocol } from '@/data/peptides';
import { getProtocols, saveProtocols, getVialInventory, saveVialInventory } from '@/utils/storage';
import { scheduleProtocolReminders } from '@/utils/notifications';
import { useAuth } from '@/contexts/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DoseSelector from '@/components/DoseSelector';
import { protocolTemplates } from '@/data/protocolTemplates';

// ═══════════════════════════════════════════════════════════════
// PROTOCOL WIZARD (New Schedule) — with Suggested Timing
// ═══════════════════════════════════════════════════════════════

const genId = () => Math.random().toString(36).slice(2, 10);

export default function ProtocolWizard() {
  const router = useRouter();
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [items, setItems] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);
  const [showItemEditor, setShowItemEditor] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [disclaimerDontAsk, setDisclaimerDontAsk] = useState(false);
  const [pendingCreate, setPendingCreate] = useState(false);
  const [selectedSuggestedOption, setSelectedSuggestedOption] = useState(null);
  const [selectedDoseTier, setSelectedDoseTier] = useState(null);
  const [selectedDoseMcg, setSelectedDoseMcg] = useState(null);

  // Item editor state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompound, setSelectedCompound] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('mg');
  const [frequency, setFrequency] = useState('daily');
  const [repeatDays, setRepeatDays] = useState('1');
  const [weeklyDays, setWeeklyDays] = useState([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [doseTime, setDoseTime] = useState('09:00');
  const [showCompoundPicker, setShowCompoundPicker] = useState(false);
  const [showSuggested, setShowSuggested] = useState(false);
  const [showFreqDropdown, setShowFreqDropdown] = useState(false);

  // Vial tracking state
  const [vialSizeMl, setVialSizeMl] = useState('3');
  const [dosePerUseMl, setDosePerUseMl] = useState('0.1');
  const [vialsOnHand, setVialsOnHand] = useState(1);
  const [pricePerVial, setPricePerVial] = useState('');

  // ── Pre-fill from template if templateId is provided ──
  useEffect(() => {
    if (!templateId) return;
    const template = protocolTemplates.find(t => t.id === templateId);
    if (!template) return;

    setName(template.name);

    const prefilled = template.compounds.map((tc) => {
      const pep = (peptidesDB as any)[tc.compound];
      const doseData = pep?.doses?.[tc.doseTier];
      const doseMcg = doseData?.mcg || 0;
      const defaultVial = pep?.defaultVial || 5;
      const vialMl = 3;
      const vialAmtMcg = defaultVial * 1000;
      const doseML = vialAmtMcg > 0 ? (doseMcg * vialMl) / vialAmtMcg : 0.1;

      return {
        compound: tc.compound,
        amount: defaultVial,
        unit: 'mg',
        frequency: tc.frequency,
        repeatDays: tc.repeatDays || 1,
        weeklyDays: tc.weeklyDays || [],
        startDate: new Date().toISOString().split('T')[0],
        doseTime: tc.doseTime,
        color: pep?.color || '#999',
        doseMcg,
        units: defaultVial,
        scheduleType: tc.frequency === 'daily' ? 'daily' : tc.frequency === 'weekly' ? 'custom' : 'everyX',
        scheduleDays: tc.weeklyDays || [],
        scheduleInterval: String(tc.repeatDays || 1),
        vialSizeMl: vialMl,
        dosePerUseMl: parseFloat(doseML.toFixed(3)) || 0.1,
        vialsOnHand: 1,
        pricePerVial: 0,
      };
    });

    setItems(prefilled);
  }, [templateId]);

  const peptideNames = Object.keys(peptidesDB);
  const filteredPeptides = peptideNames.filter(n =>
    n.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const suggested = selectedCompound ? getSuggestedProtocol(selectedCompound) : null;

  const resetEditor = () => {
    setSearchQuery('');
    setSelectedCompound('');
    setAmount('');
    setUnit('mg');
    setFrequency('daily');
    setRepeatDays('1');
    setWeeklyDays([]);
    setStartDate(new Date().toISOString().split('T')[0]);
    setDoseTime('09:00');
    setEditingIdx(null);
    setShowCompoundPicker(false);
    setShowSuggested(false);
    setShowFreqDropdown(false);
    setVialSizeMl('3');
    setDosePerUseMl('0.1');
    setVialsOnHand(1);
    setPricePerVial('');
    setSelectedSuggestedOption(null);
    setSelectedDoseTier(null);
    setSelectedDoseMcg(null);
  };

  // Auto-calculate dosePerUseMl from a target dose in mcg + current vial info
  const applyDoseTier = (tier: string, dose: any) => {
    setSelectedDoseTier(tier);
    setSelectedDoseMcg(dose.mcg);
    const vialAmt = parseFloat(amount);
    const vialMl = parseFloat(vialSizeMl);
    if (vialAmt && vialMl) {
      const vialAmtMcg = unit === 'mg' ? vialAmt * 1000 : vialAmt;
      const doseML = (dose.mcg * vialMl) / vialAmtMcg;
      setDosePerUseMl(parseFloat(doseML.toFixed(3)).toString());
    }
  };

  // Recalculate dosePerUseMl whenever vial info changes after a tier has been selected
  React.useEffect(() => {
    if (!selectedDoseMcg) return;
    const vialAmt = parseFloat(amount);
    const vialMl = parseFloat(vialSizeMl);
    if (!vialAmt || !vialMl) return;
    const vialAmtMcg = unit === 'mg' ? vialAmt * 1000 : vialAmt;
    const doseML = (selectedDoseMcg * vialMl) / vialAmtMcg;
    setDosePerUseMl(parseFloat(doseML.toFixed(3)).toString());
  }, [amount, vialSizeMl, unit, selectedDoseMcg]);

  const applySuggested = () => {
    if (!suggested) return;
    const opt = selectedSuggestedOption || (suggested.options ? suggested.options[0] : suggested);
    setFrequency(opt.frequency || suggested.frequency);
    setDoseTime(opt.bestTime || suggested.bestTime);
    if (opt.frequency === 'weekly' && opt.scheduleDays) {
      setWeeklyDays(opt.scheduleDays);
    } else if (opt.repeatDays) {
      setRepeatDays(String(opt.repeatDays));
    } else if (suggested.repeatDays) {
      setRepeatDays(String(suggested.repeatDays));
    }
    setShowSuggested(false);
  };

  const openAddItem = () => {
    resetEditor();
    setShowItemEditor(true);
  };

  const openEditItem = (idx) => {
    const item = items[idx];
    setSelectedCompound(item.compound);
    setAmount(String(item.amount));
    setUnit(item.unit);
    setFrequency(item.frequency);
    setRepeatDays(String(item.repeatDays || 1));
    setWeeklyDays(item.weeklyDays || []);
    setStartDate(item.startDate);
    setDoseTime(item.doseTime);
    setVialSizeMl(String(item.vialSizeMl || 3));
    setDosePerUseMl(String(item.dosePerUseMl || 0.1));
    setVialsOnHand(item.vialsOnHand || 1);
    setPricePerVial(item.pricePerVial ? String(item.pricePerVial) : '');
    setEditingIdx(idx);
    setShowItemEditor(true);
  };

  const saveItem = () => {
    if (!selectedCompound) { Alert.alert('Missing', 'Please select a peptide.'); return; }
    if (!amount.trim()) { Alert.alert('Missing', 'Please enter an amount.'); return; }

    const item = {
      compound: selectedCompound,
      amount: parseFloat(amount),
      unit,
      frequency,
      repeatDays: parseInt(repeatDays) || 1,
      weeklyDays,
      startDate,
      doseTime,
      color: peptidesDB[selectedCompound]?.color || '#999',
      doseMcg: unit === 'mg' ? parseFloat(amount) * 1000 : parseFloat(amount),
      units: unit === 'mg' ? parseFloat(amount) : (parseFloat(amount) / 1000).toFixed(2),
      scheduleType: frequency === 'daily' ? 'daily' : frequency === 'weekly' ? 'custom' : 'everyX',
      scheduleDays: weeklyDays,
      scheduleInterval: repeatDays,
      vialSizeMl: parseFloat(vialSizeMl) || 3,
      dosePerUseMl: parseFloat(dosePerUseMl) || 0.1,
      vialsOnHand: vialsOnHand,
      pricePerVial: parseFloat(pricePerVial) || 0,
    };

    if (editingIdx !== null) {
      const updated = [...items];
      updated[editingIdx] = item;
      setItems(updated);
    } else {
      setItems([...items, item]);
    }
    setShowItemEditor(false);
    resetEditor();
  };

  const deleteItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const createSchedule = async () => {
    if (!name.trim()) { Alert.alert('Missing', 'Please enter a schedule name.'); return; }
    if (items.length === 0) { Alert.alert('Missing', 'Please add at least one item.'); return; }

    // Check if disclaimer was already accepted
    const accepted = await AsyncStorage.getItem('disclaimerAccepted');
    if (accepted !== 'true') {
      setShowDisclaimerModal(true);
      return;
    }
    await doCreate();
  };

  const handleDisclaimerAgree = async () => {
    if (disclaimerDontAsk) {
      await AsyncStorage.setItem('disclaimerAccepted', 'true');
    }
    setShowDisclaimerModal(false);
    await doCreate();
  };

  const doCreate = async () => {

    const protocol = {
      id: genId(),
      name: name.trim(),
      status: 'active',
      compounds: items,
      createdAt: new Date().toISOString(),
    };

    const existing = await getProtocols();
    await saveProtocols([...existing, protocol]);

    // Initialize vial inventory for each compound
    const inventory = await getVialInventory();
    items.forEach(item => {
      if (!inventory[item.compound]) {
        inventory[item.compound] = {
          vialCount: item.vialsOnHand || 1,
          currentVialMl: item.vialSizeMl || 3,
          vialSizeMl: item.vialSizeMl || 3,
          dosePerUseMl: item.dosePerUseMl || 0.1,
          totalPurchased: item.vialsOnHand || 1,
        };
      }
    });
    await saveVialInventory(inventory);

    // Schedule push notifications for dose reminders
    const userName = user?.name || 'there';
    await scheduleProtocolReminders(items, userName);

    router.back();
  };

  const formatTime = (t) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const formatDate = (d) => {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const freqLabel = (item) => {
    if (item.frequency === 'daily') return 'Every day';
    if (item.frequency === 'weekly') return item.weeklyDays?.join(', ') || 'Weekly';
    return `Every ${item.repeatDays} days`;
  };

  const freqDisplayLabel = () => {
    if (frequency === 'daily') return 'Daily';
    if (frequency === 'weekly') return 'Weekly';
    return `Every ${repeatDays} days`;
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={s.closeBtn}>
          <X size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>New Schedule</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Schedule Name */}
        <Text style={s.label}>Schedule Name</Text>
        <TextInput
          style={s.input}
          placeholder="e.g. Morning Protocol"
          placeholderTextColor={Colors.grey400}
          value={name}
          onChangeText={setName}
        />

        {/* Items Section */}
        <Text style={s.sectionTitle}>Items</Text>
        <Text style={s.sectionDesc}>You can add multiple peptides to the same schedule.</Text>

        {items.map((item, idx) => (
          <View key={idx} style={s.itemCard}>
            <View style={s.itemHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[s.itemDot, { borderColor: item.color }]} />
                <Text style={s.itemName}>{item.compound}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => openEditItem(idx)} activeOpacity={0.7} style={s.itemActionBtn}>
                  <Pencil size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteItem(idx)} activeOpacity={0.7} style={s.itemActionBtn}>
                  <X size={16} color="#E53E3E" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={s.itemMeta}>
              <Text style={s.itemDetail}>{item.amount} {item.unit}</Text>
              <Text style={s.itemDetail}>{freqLabel(item)}</Text>
              <Text style={[s.itemDetail, { fontWeight: '700' }]}>{formatTime(item.doseTime)}</Text>
            </View>
            <View style={s.itemMeta}>
              <Text style={s.itemDetail}>🧪 {item.vialsOnHand || 1} vial{(item.vialsOnHand || 1) > 1 ? 's' : ''}</Text>
              <Text style={s.itemDetail}>{item.vialSizeMl || 3}mL vial</Text>
              <Text style={s.itemDetail}>{item.dosePerUseMl || 0.1}mL/dose</Text>
              {item.pricePerVial > 0 && <Text style={s.itemDetail}>${item.pricePerVial}/vial</Text>}
            </View>
            <Text style={s.itemHint}>Tap the pencil to edit the dose, vial, or schedule.</Text>
          </View>
        ))}

        {/* Add Item Button */}
        <TouchableOpacity style={s.addItemBtn} onPress={openAddItem} activeOpacity={0.7}>
          <Plus size={16} color={Colors.textPrimary} />
          <Text style={s.addItemText}>Add Item</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Create Button */}
      <View style={s.bottomBar}>
        <TouchableOpacity style={s.createBtn} onPress={createSchedule} activeOpacity={0.85}>
          <Text style={s.createBtnText}>Create Schedule</Text>
        </TouchableOpacity>
      </View>

      {/* ═══ Item Editor Modal ═══ */}
      <Modal visible={showItemEditor} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHeaderRow}>
              <TouchableOpacity onPress={() => { resetEditor(); setShowItemEditor(false); }} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={s.modalTitleCenter}>{editingIdx !== null ? 'Edit Item' : 'Add Item'}</Text>
              <View style={{ width: 20 }} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* Compound Picker */}
              <Text style={s.label}>Peptide</Text>
              <TouchableOpacity
                style={s.pickerBtn}
                onPress={() => setShowCompoundPicker(!showCompoundPicker)}
                activeOpacity={0.7}
              >
                <Text style={selectedCompound ? s.pickerText : s.pickerPlaceholder}>
                  {selectedCompound || 'Select a peptide...'}
                </Text>
                <ChevronDown size={16} color={Colors.textSecondary} />
              </TouchableOpacity>

              {showCompoundPicker && (
                <View style={s.compoundList}>
                  <View style={s.searchRow}>
                    <Search size={14} color={Colors.grey400} />
                    <TextInput
                      style={s.searchInput}
                      placeholder="Search..."
                      placeholderTextColor={Colors.grey400}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                  </View>
                  <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
                    {filteredPeptides.map(p => (
                      <TouchableOpacity
                        key={p}
                        style={[s.compoundOption, selectedCompound === p && s.compoundOptionActive]}
                        onPress={() => {
                          setSelectedCompound(p);
                          setShowCompoundPicker(false);
                          setSearchQuery('');
                          // Auto-fill vial defaults from peptide database
                          const pData = peptidesDB[p];
                          if (pData?.defaultVial) {
                            setAmount(String(pData.defaultVial));
                            setUnit('mg');
                            // Recalculate dosePerUseMl if a dose tier is already selected
                            if (selectedDoseMcg) {
                              const vialAmtMcg = pData.defaultVial * 1000;
                              const vialMl = parseFloat(vialSizeMl) || 3;
                              const doseML = (selectedDoseMcg * vialMl) / vialAmtMcg;
                              setDosePerUseMl(parseFloat(doseML.toFixed(3)).toString());
                            }
                          }
                          // Auto-show suggested timing when picking a compound
                          const sug = getSuggestedProtocol(p);
                          if (sug) setShowSuggested(true);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={[s.compoundDot, { backgroundColor: peptidesDB[p]?.color || '#999' }]} />
                        <Text style={s.compoundOptionText}>{p}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* ── Dose Tier Selector ── */}
              {selectedCompound && peptidesDB[selectedCompound]?.doses && (
                <View style={{ marginTop: 12 }}>
                  <DoseSelector
                    peptideName={selectedCompound}
                    doses={peptidesDB[selectedCompound].doses}
                    onSelect={applyDoseTier}
                    selectedTier={selectedDoseTier}
                    suggestedTimeLabel={suggested?.bestTimeLabel || null}
                    cycleWeeks={suggested?.cycleWeeks || null}
                  />
                </View>
              )}

              {/* ── Vial Amount (mg/mcg in vial) ── */}
              {selectedCompound && selectedDoseMcg && selectedDoseMcg > 0 && (
                <View style={{ marginTop: 16 }}>
                  <Text style={s.label}>Vial Amount</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <TextInput
                        style={s.input}
                        placeholder={String(peptidesDB[selectedCompound]?.defaultVial || '5')}
                        placeholderTextColor={Colors.grey400}
                        keyboardType="decimal-pad"
                        value={amount}
                        onChangeText={setAmount}
                      />
                    </View>
                    <View style={{ flexDirection: 'row', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(200,205,210,0.2)' }}>
                      <TouchableOpacity
                        style={[s.unitBtn, unit === 'mg' && s.unitBtnActive]}
                        onPress={() => setUnit('mg')}
                        activeOpacity={0.7}
                      >
                        <Text style={[s.unitBtnText, unit === 'mg' && s.unitBtnTextActive]}>mg</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[s.unitBtn, unit === 'mcg' && s.unitBtnActive]}
                        onPress={() => setUnit('mcg')}
                        activeOpacity={0.7}
                      >
                        <Text style={[s.unitBtnText, unit === 'mcg' && s.unitBtnTextActive]}>mcg</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={s.hintText}>Total peptide content per vial (e.g. 500mg = large vial)</Text>
                </View>
              )}

              {/* ── Suggested Protocol Card ── */}
              {selectedCompound && suggested && showSuggested && (
                <View style={s.suggestedCard}>
                  <View style={s.suggestedHeader}>
                    <Lightbulb size={16} color={Colors.textSecondary} />
                    <Text style={s.suggestedTitle}>Suggested Protocol</Text>
                  </View>
                  <Text style={s.suggestedExplanation}>{suggested.explanation}</Text>

                  {/* Schedule Options */}
                  {suggested.options ? (
                    <View style={{ gap: 8, marginBottom: 12 }}>
                      <Text style={[s.suggestedExplanation, { fontWeight: '700', marginBottom: 0 }]}>Choose a schedule:</Text>
                      {suggested.options.map(opt => {
                        const isSelected = (selectedSuggestedOption?.id || suggested.options[0].id) === opt.id;
                        return (
                          <TouchableOpacity
                            key={opt.id}
                            style={[s.optionCard, isSelected && s.optionCardActive]}
                            onPress={() => setSelectedSuggestedOption(opt)}
                            activeOpacity={0.75}
                          >
                            <View style={[s.optionRadio, isSelected && s.optionRadioActive]}>
                              {isSelected && <View style={s.optionRadioDot} />}
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={[s.optionLabel, isSelected && { color: Colors.textPrimary }]}>{opt.label}</Text>
                              <Text style={s.optionShortDesc}>{opt.shortDesc}</Text>
                              {opt.bestTimeLabel && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                  <Clock size={10} color="#34C759" />
                                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#34C759' }}>{opt.bestTimeLabel}</Text>
                                </View>
                              )}
                              {isSelected && <Text style={s.optionExplanation}>{opt.explanation}</Text>}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : (
                    <View style={s.suggestedMeta}>
                      <View style={s.suggestedTag}>
                        <Clock size={12} color="#34C759" />
                        <Text style={s.suggestedTagText}>{suggested.bestTimeLabel}</Text>
                      </View>
                      <View style={s.suggestedTag}>
                        <CalIcon size={12} color="#007AFF" />
                        <Text style={s.suggestedTagText}>
                          {suggested.frequency === 'daily' ? 'Daily' : `Every ${suggested.repeatDays} days`}
                        </Text>
                      </View>
                      <View style={s.suggestedTag}>
                        <Info size={12} color="#8B5CF6" />
                        <Text style={s.suggestedTagText}>{suggested.cycleWeeks} week cycle</Text>
                      </View>
                    </View>
                  )}

                  {/* Resolved time summary */}
                  {(() => {
                    const opt = selectedSuggestedOption || (suggested.options ? suggested.options[0] : suggested);
                    const timeLabel = opt?.bestTimeLabel || suggested.bestTimeLabel;
                    if (!timeLabel) return null;
                    return (
                      <View style={s.timeSummaryRow}>
                        <Clock size={13} color="#34C759" />
                        <Text style={s.timeSummaryText}>Suggested time: <Text style={{ fontWeight: '700', color: Colors.textPrimary }}>{timeLabel}</Text></Text>
                      </View>
                    );
                  })()}

                  {/* Hint: must select dosage first */}
                  {!selectedDoseTier && (
                    <View style={s.doseHintRow}>
                      <Shield size={13} color={Colors.textSecondary} />
                      <Text style={s.doseHintText}>Select a recommended dosage above before applying</Text>
                    </View>
                  )}

                  <View style={s.suggestedActions}>
                    <TouchableOpacity
                      style={[s.suggestedApplyBtn, !selectedDoseTier && { backgroundColor: Colors.grey300, opacity: 0.6 }]}
                      onPress={selectedDoseTier ? applySuggested : undefined}
                      activeOpacity={selectedDoseTier ? 0.85 : 1}
                      disabled={!selectedDoseTier}
                    >
                      <Text style={[s.suggestedApplyText, !selectedDoseTier && { color: Colors.grey500 }]}>Apply Suggested</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.suggestedDismissBtn} onPress={() => setShowSuggested(false)} activeOpacity={0.7}>
                      <Text style={s.suggestedDismissText}>Custom</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ── Cycle & Vials Needed Summary (live updates based on selected option) ── */}
              {selectedCompound && selectedDoseMcg && parseFloat(amount) > 0 && (() => {
                const pep = peptidesDB[selectedCompound];
                if (!pep) return null;
                const cycleWeeks = pep.typicalCycle || 8;

                const userVialAmt = parseFloat(amount) || pep.defaultVial || 5;
                const userVialMg = unit === 'mg' ? userVialAmt : userVialAmt / 1000;

                // Use selected suggested option's frequency if available, else user's manual frequency
                const activeOpt = selectedSuggestedOption || (suggested?.options ? suggested.options[0] : null);
                let dosesPerWeek = 7;
                const activeFreq = activeOpt?.frequency || frequency;
                const activeWeeklyDays = activeOpt?.weeklyDays || weeklyDays;
                const activeRepeatDays = activeOpt?.repeatDays || parseInt(repeatDays) || 1;

                if (activeFreq === 'weekly') {
                  dosesPerWeek = (activeWeeklyDays?.length) || 1;
                } else if (activeFreq === 'everyX') {
                  dosesPerWeek = 7 / activeRepeatDays;
                }

                const totalDoses = Math.round(dosesPerWeek * cycleWeeks);
                const doseMg = selectedDoseMcg / 1000;
                const totalMgNeeded = totalDoses * doseMg;
                const vialsNeeded = Math.ceil(totalMgNeeded / userVialMg);
                const dosesPerVial = Math.floor(userVialMg / doseMg);
                const freqLabel = dosesPerWeek === 7 ? 'daily' : `${dosesPerWeek.toFixed(dosesPerWeek % 1 === 0 ? 0 : 1)}×/wk`;

                return (
                  <View style={s.cycleSummaryCard}>
                    <Text style={s.cycleSummaryTitle}>Cycle Overview</Text>
                    <View style={s.cycleSummaryGrid}>
                      <View style={s.cycleSummaryItem}>
                        <CalIcon size={14} color="#007AFF" />
                        <Text style={s.cycleSummaryVal}>{cycleWeeks} weeks</Text>
                        <Text style={s.cycleSummaryLbl}>Cycle Length</Text>
                      </View>
                      <View style={s.cycleSummaryDivider} />
                      <View style={s.cycleSummaryItem}>
                        <Clock size={14} color="#34C759" />
                        <Text style={s.cycleSummaryVal}>{totalDoses}</Text>
                        <Text style={s.cycleSummaryLbl}>Total Doses</Text>
                      </View>
                      <View style={s.cycleSummaryDivider} />
                      <View style={s.cycleSummaryItem}>
                        <Info size={14} color="#F59E0B" />
                        <Text style={s.cycleSummaryVal}>{vialsNeeded}</Text>
                        <Text style={s.cycleSummaryLbl}>{vialsNeeded === 1 ? 'Vial Needed' : 'Vials Needed'}</Text>
                      </View>
                    </View>
                    <Text style={s.cycleSummaryNote}>
                      {selectedDoseMcg >= 1000 ? `${doseMg}mg` : `${selectedDoseMcg}mcg`}/dose × {freqLabel} × {userVialMg}mg vials ({dosesPerVial} doses/vial)
                    </Text>
                  </View>
                );
              })()}


              {/* Frequency — dropdown-style */}
              <Text style={s.label}>Frequency</Text>
              <TouchableOpacity
                style={s.freqDropdownBtn}
                onPress={() => setShowFreqDropdown(!showFreqDropdown)}
                activeOpacity={0.7}
              >
                <Text style={s.freqDropdownText}>{freqDisplayLabel()}</Text>
                <ChevronDown size={16} color={Colors.textSecondary} style={showFreqDropdown ? { transform: [{ rotate: '180deg' }] } : {}} />
              </TouchableOpacity>

              {showFreqDropdown && (
                <View style={s.freqOptions}>
                  {[
                    { id: 'daily', label: 'Daily', desc: 'Every day' },
                    { id: 'weekly', label: 'Weekly', desc: 'Select specific days' },
                    { id: 'everyX', label: 'Every X Days', desc: 'Custom interval' },
                  ].map(f => (
                    <TouchableOpacity
                      key={f.id}
                      style={[s.freqOption, frequency === f.id && s.freqOptionActive]}
                      onPress={() => {
                        setFrequency(f.id);
                        setShowFreqDropdown(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={[s.freqRadio, frequency === f.id && s.freqRadioActive]}>
                        {frequency === f.id && <View style={s.freqRadioDot} />}
                      </View>
                      <View>
                        <Text style={[s.freqOptionLabel, frequency === f.id && s.freqOptionLabelActive]}>{f.label}</Text>
                        <Text style={s.freqOptionDesc}>{f.desc}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Weekly day selector — only shows when weekly selected */}
              {frequency === 'weekly' && (
                <>
                  <Text style={s.label}>Days</Text>
                  <View style={s.dayRow}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                      <TouchableOpacity
                        key={d}
                        style={[s.dayBtn, weeklyDays.includes(d) && s.dayBtnActive]}
                        onPress={() => setWeeklyDays(prev =>
                          prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
                        )}
                      >
                        <Text style={[s.dayBtnText, weeklyDays.includes(d) && s.dayBtnTextActive]}>{d[0]}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Every X Days — only shows when everyX selected */}
              {frequency === 'everyX' && (
                <>
                  <Text style={s.label}>Repeat every</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TextInput
                      style={[s.input, { width: 80 }]}
                      placeholder="2"
                      placeholderTextColor={Colors.grey400}
                      keyboardType="number-pad"
                      value={repeatDays}
                      onChangeText={setRepeatDays}
                    />
                    <Text style={s.hintText}>days</Text>
                  </View>
                </>
              )}

              {/* Start Date */}
              <Text style={s.label}>Start Date</Text>
              <TouchableOpacity style={s.dateBtn} activeOpacity={0.7}>
                <CalIcon size={16} color={Colors.textSecondary} />
                <Text style={s.dateText}>{formatDate(startDate)}</Text>
              </TouchableOpacity>

              {/* Time */}
              <Text style={s.label}>Time</Text>
              <TouchableOpacity style={s.dateBtn} activeOpacity={0.7}>
                <Clock size={16} color={Colors.textSecondary} />
                <Text style={s.dateText}>{formatTime(doseTime)}</Text>
              </TouchableOpacity>
              {/* Quick time presets */}
              <View style={s.timePresets}>
                {['06:00', '09:00', '12:00', '18:00', '21:00'].map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[s.timePresetBtn, doseTime === t && s.timePresetActive]}
                    onPress={() => setDoseTime(t)}
                  >
                    <Text style={[s.timePresetText, doseTime === t && s.timePresetTextActive]}>
                      {formatTime(t)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── Vial Tracking ── */}
              <Text style={[s.label, { marginTop: 24 }]}>Vial Info</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.hintText, { marginBottom: 6 }]}>Vial Size (mL)</Text>
                  <TextInput
                    style={s.input}
                    placeholder="3"
                    placeholderTextColor={Colors.grey400}
                    keyboardType="decimal-pad"
                    value={vialSizeMl}
                    onChangeText={setVialSizeMl}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.hintText, { marginBottom: 6 }]}>Dose / Use (mL)</Text>
                  <TextInput
                    style={s.input}
                    placeholder="0.1"
                    placeholderTextColor={Colors.grey400}
                    keyboardType="decimal-pad"
                    value={dosePerUseMl}
                    onChangeText={setDosePerUseMl}
                  />
                </View>
              </View>

              <Text style={[s.hintText, { marginTop: 12, marginBottom: 6 }]}>Vials on Hand</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <TouchableOpacity
                  style={[s.stepperBtn, vialsOnHand <= 1 && { opacity: 0.3 }]}
                  onPress={() => setVialsOnHand(Math.max(1, vialsOnHand - 1))}
                  activeOpacity={0.7}
                  disabled={vialsOnHand <= 1}
                >
                  <Text style={s.stepperBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.textPrimary, minWidth: 30, textAlign: 'center' }}>{vialsOnHand}</Text>
                <TouchableOpacity
                  style={s.stepperBtn}
                  onPress={() => setVialsOnHand(vialsOnHand + 1)}
                  activeOpacity={0.7}
                >
                  <Text style={s.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              <Text style={[s.hintText, { marginTop: 12, marginBottom: 6 }]}>Price per Vial ($)</Text>
              <TextInput
                style={s.input}
                value={pricePerVial}
                onChangeText={setPricePerVial}
                placeholder="0.00"
                placeholderTextColor={Colors.grey400}
                keyboardType="decimal-pad"
              />

              {/* ── Syringe Visualizer ── */}
              <SyringeViz
                amount={amount}
                unit={unit}
                vialSizeMl={vialSizeMl}
                dosePerUseMl={dosePerUseMl}
                color={peptidesDB[selectedCompound]?.color || '#007AFF'}
              />

              {/* Show suggested again button if dismissed */}
              {selectedCompound && suggested && !showSuggested && (
                <TouchableOpacity
                  style={s.showSuggestedBtn}
                  onPress={() => setShowSuggested(true)}
                  activeOpacity={0.7}
                >
                  <Lightbulb size={14} color={Colors.textSecondary} />
                  <Text style={s.showSuggestedText}>View suggested timing for {selectedCompound}</Text>
                </TouchableOpacity>
              )}

              {/* Actions */}
              <View style={s.editorActions}>
                <TouchableOpacity
                  style={s.cancelBtn}
                  onPress={() => { setShowItemEditor(false); resetEditor(); }}
                  activeOpacity={0.7}
                >
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.addBtn} onPress={saveItem} activeOpacity={0.85}>
                  <Text style={s.addBtnText}>{editingIdx !== null ? 'Save' : 'Add'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* ═══ Disclaimer Modal ═══ */}
      <Modal visible={showDisclaimerModal} animationType="fade" transparent>
        <View style={s.disclaimerOverlay}>
          <View style={s.disclaimerSheet}>
            <View style={s.disclaimerIconWrap}>
              <Shield size={28} color="#F59E0B" />
            </View>
            <Text style={s.disclaimerTitle}>Research Disclaimer</Text>
            <Text style={s.disclaimerBody}>
              The information in this app is based on published scientific research and
              community wellness protocols. It is{' '}
              <Text style={s.disclaimerBold}>NOT medical advice</Text> and is not a
              substitute for guidance from a qualified healthcare provider.{'\n\n'}
              By creating this protocol, you confirm that you are choosing to follow it{' '}
              <Text style={s.disclaimerBold}>entirely at your own discretion and risk</Text>.
              Always consult a licensed physician before starting any new health regimen,
              especially involving injectable compounds.
            </Text>

            <TouchableOpacity
              style={s.disclaimerCheckRow}
              onPress={() => setDisclaimerDontAsk(prev => !prev)}
              activeOpacity={0.7}
            >
              <View style={[s.disclaimerCheck, disclaimerDontAsk && s.disclaimerCheckActive]}>
                {disclaimerDontAsk && <Text style={s.disclaimerCheckMark}>✓</Text>}
              </View>
              <Text style={s.disclaimerCheckLabel}>Don't ask again</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.disclaimerAgreeBtn} onPress={handleDisclaimerAgree} activeOpacity={0.85}>
              <Text style={s.disclaimerAgreeBtnText}>I Understand & Agree</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowDisclaimerModal(false)} activeOpacity={0.7} style={{ marginTop: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: Colors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SyringeViz({ amount, unit, vialSizeMl, dosePerUseMl, color }) {
  const vialMcg = unit === 'mg' ? parseFloat(amount || 0) * 1000 : parseFloat(amount || 0);
  const vialMl = parseFloat(vialSizeMl || 0);
  const doseMl = parseFloat(dosePerUseMl || 0);
  if (!vialMcg || !vialMl || !doseMl || doseMl <= 0) return null;

  const concentration = vialMcg / vialMl; // mcg/mL
  const syringeUnits = Math.round(doseMl * 100);
  const doseMcg = Math.round(concentration * doseMl);
  const fillPct = Math.min(syringeUnits, 100);
  const doseLabel = doseMcg >= 1000
    ? `${(doseMcg / 1000).toFixed(2)} mg`
    : `${doseMcg} mcg`;

  const ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  return (
    <View style={[sv.container, { borderLeftColor: color, borderLeftWidth: 4, backgroundColor: color + '0D' }]}>
      <Text style={sv.title}>💉 Syringe Guide</Text>

      {/* Ruler */}
      <View style={sv.rulerWrap}>
        {/* Track + fill */}
        <View style={sv.track}>
          <View style={[sv.fill, { width: `${fillPct}%`, backgroundColor: color }]} />
          {/* Tick lines inside track */}
          {ticks.map(n => (
            <View key={n} style={[sv.tickLine, { left: `${n}%` }]} />
          ))}
        </View>
        {/* Tick labels below */}
        <View style={sv.tickLabelRow}>
          {ticks.map(n => (
            <Text key={n} style={sv.tickLabel}>{n}</Text>
          ))}
        </View>
        <Text style={sv.rulerCaption}><Text style={{ color, fontWeight: '700' }}>{syringeUnits} units</Text>  ·  draw to this mark on a U-100 insulin syringe</Text>
      </View>

      {/* Summary row */}
      <View style={sv.summaryRow}>
        <View style={sv.summaryBox}>
          <Text style={[sv.summaryVal, { color }]}>{syringeUnits}</Text>
          <Text style={sv.summaryLbl}>units</Text>
        </View>
        <View style={sv.divider} />
        <View style={sv.summaryBox}>
          <Text style={[sv.summaryVal, { color }]}>{doseMl.toFixed(2)}</Text>
          <Text style={sv.summaryLbl}>mL draw</Text>
        </View>
        <View style={sv.divider} />
        <View style={sv.summaryBox}>
          <Text style={[sv.summaryVal, { color }]}>{doseLabel}</Text>
          <Text style={sv.summaryLbl}>dose</Text>
        </View>
      </View>

      <Text style={sv.hint}>
        Concentration: {(concentration / 1000).toFixed(2)} mg/mL ({concentration.toFixed(0)} mcg/mL)
      </Text>
    </View>
  );
}

const sv = StyleSheet.create({
  container: { marginTop: 20, backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(200,205,210,0.4)' },
  title: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 14 },
  rulerWrap: { marginBottom: 14 },
  track: { height: 22, backgroundColor: '#E5E7EB', borderRadius: 11, overflow: 'hidden', position: 'relative' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 11 },
  tickLine: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.5)' },
  tickLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  tickLabel: { fontSize: 9, color: Colors.grey400, fontWeight: '600' },
  rulerCaption: { fontSize: 10, color: Colors.grey400, textAlign: 'center', marginTop: 2 },
  summaryRow: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(200,205,210,0.3)', overflow: 'hidden' },
  summaryBox: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  summaryVal: { fontSize: 18, fontWeight: '700' },
  summaryLbl: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, fontWeight: '500' },
  divider: { width: 1, backgroundColor: 'rgba(200,205,210,0.3)' },
  hint: { fontSize: 11, color: Colors.grey400, textAlign: 'center', marginTop: 10 },
});


const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200,205,210,0.3)',
  },
  closeBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },

  content: { padding: 24, paddingTop: 32 },

  label: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6, marginTop: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.5)',
  },

  sectionTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginTop: 32, letterSpacing: -0.5 },
  sectionDesc: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, marginBottom: 16, lineHeight: 20 },

  // Item cards
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.5)',
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
  itemName: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  itemActionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(200,205,210,0.15)', alignItems: 'center', justifyContent: 'center' },
  itemMeta: { flexDirection: 'row', gap: 16, marginTop: 12, alignItems: 'center' },
  itemDetail: { fontSize: 14, color: Colors.textSecondary },
  itemHint: { fontSize: 12, color: Colors.grey400, marginTop: 10, lineHeight: 18 },

  // Add item button
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(200,205,210,0.5)',
    marginTop: 8,
  },
  addItemText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(200,205,210,0.3)',
  },
  createBtn: {
    backgroundColor: Colors.cardDark,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
  },
  createBtnText: { fontSize: 17, fontWeight: '600', color: '#FFF' },

  // ── Modal ──
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6, textAlign: 'center' },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitleCenter: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', flex: 1 },

  // Compound picker
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.5)',
  },
  pickerText: { fontSize: 16, color: Colors.textPrimary, fontWeight: '500' },
  pickerPlaceholder: { fontSize: 16, color: Colors.grey400 },

  compoundList: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.5)',
    marginTop: 8,
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200,205,210,0.3)',
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  compoundOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(200,205,210,0.2)',
  },
  compoundOptionActive: { backgroundColor: 'rgba(200,205,210,0.1)' },
  compoundDot: { width: 8, height: 8, borderRadius: 4 },
  compoundOptionText: { fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },

  // ── Suggested Protocol Card ──
  suggestedCard: {
    backgroundColor: 'rgba(200,205,210,0.08)',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.3)',
  },
  suggestedHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  suggestedTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  suggestedExplanation: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17, marginBottom: 8 },
  suggestedMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 10 },
  suggestedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.panelBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.3)',
  },
  suggestedTagText: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  suggestedSplit: { fontSize: 12, color: Colors.textSecondary, marginBottom: 10, fontStyle: 'italic' },
  cycleSummaryCard: {
    backgroundColor: 'rgba(0,122,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.15)',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    gap: 10,
  },
  cycleSummaryTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cycleSummaryGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.panelBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.2)',
    overflow: 'hidden',
  },
  cycleSummaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  cycleSummaryVal: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cycleSummaryLbl: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cycleSummaryDivider: {
    width: 1,
    backgroundColor: 'rgba(200,205,210,0.3)',
  },
  cycleSummaryNote: {
    fontSize: 10,
    color: Colors.grey400,
    textAlign: 'center',
    lineHeight: 14,
  },
  timeSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(52,199,89,0.08)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(52,199,89,0.2)',
  },
  timeSummaryText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    flex: 1,
  },
  doseHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(200,205,210,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.3)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  doseHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  suggestedActions: { flexDirection: 'row', gap: 10 },
  suggestedApplyBtn: {
    flex: 1,
    backgroundColor: Colors.cardDark || '#1C1C1E',
    borderRadius: 12,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedApplyText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  suggestedDismissBtn: {
    flex: 0.6,
    borderRadius: 12,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.4)',
  },
  suggestedDismissText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  showSuggestedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(200,205,210,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.3)',
  },
  showSuggestedText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },

  // Schedule option cards
  optionCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 10, borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(200,205,210,0.3)', backgroundColor: Colors.panelBg },
  optionCardActive: { borderColor: Colors.cardDark || '#1C1C1E', backgroundColor: 'rgba(200,205,210,0.1)' },
  optionRadio: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: Colors.grey400, alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 },
  optionRadioActive: { borderColor: Colors.cardDark || '#1C1C1E', backgroundColor: Colors.cardDark || '#1C1C1E' },
  optionRadioDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FFF' },
  optionLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  optionShortDesc: { fontSize: 11, color: Colors.grey400, marginTop: 1 },
  optionExplanation: { fontSize: 11, color: Colors.textSecondary, lineHeight: 16, marginTop: 4 },

  // Unit toggle
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(200,205,210,0.15)',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.5)',
  },
  unitBtn: { paddingHorizontal: 20, height: 50, alignItems: 'center', justifyContent: 'center' },
  unitBtnActive: { backgroundColor: Colors.cardDark },
  unitBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  unitBtnTextActive: { color: '#FFF' },

  // Frequency dropdown
  freqDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.5)',
  },
  freqDropdownText: { fontSize: 16, fontWeight: '500', color: Colors.textPrimary },
  freqOptions: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.5)',
    marginTop: 8,
    overflow: 'hidden',
  },
  freqOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(200,205,210,0.3)',
  },
  freqOptionActive: { backgroundColor: 'rgba(200,205,210,0.08)' },
  freqRadio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: 'rgba(200,205,210,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  freqRadioActive: { borderColor: Colors.cardDark },
  freqRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.cardDark },
  freqOptionLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  freqOptionLabelActive: { color: Colors.cardDark },
  freqOptionDesc: { fontSize: 12, color: Colors.grey400, marginTop: 1 },

  // Day selector
  dayRow: { flexDirection: 'row', gap: 6, justifyContent: 'space-between' },
  dayBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(200,205,210,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(200,205,210,0.4)',
  },
  dayBtnActive: { backgroundColor: Colors.cardDark, borderColor: Colors.cardDark },
  dayBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  dayBtnTextActive: { color: '#FFF' },

  hintText: { fontSize: 14, color: Colors.textSecondary },

  // Date / Time
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(200,205,210,0.1)',
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.4)',
  },
  dateText: { fontSize: 16, color: Colors.textPrimary, fontWeight: '500' },
  timePresets: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  timePresetBtn: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, backgroundColor: 'rgba(200,205,210,0.15)',
    borderWidth: 1, borderColor: 'rgba(200,205,210,0.3)',
  },
  timePresetActive: { backgroundColor: Colors.cardDark, borderColor: Colors.cardDark },
  timePresetText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  timePresetTextActive: { color: '#FFF' },

  // Actions
  editorActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: {
    flex: 1, borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(200,205,210,0.15)',
    borderWidth: 1, borderColor: 'rgba(200,205,210,0.4)',
  },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  addBtn: {
    flex: 1, borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.cardDark,
    ...Shadows.button,
  },
  addBtnText: { fontSize: 16, fontWeight: '600', color: '#FFF' },

  // Stepper
  stepperBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.cardDark,
    alignItems: 'center', justifyContent: 'center',
  },
  stepperBtnText: { fontSize: 22, fontWeight: '600', color: '#FFF', lineHeight: 24 },

  // ── Disclaimer Modal ──
  disclaimerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  disclaimerSheet: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 400,
  },
  disclaimerIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#FFFBEB',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  disclaimerTitle: {
    fontSize: 20, fontWeight: '700', color: Colors.textPrimary,
    textAlign: 'center', marginBottom: 14,
  },
  disclaimerBody: {
    fontSize: 14, color: Colors.textSecondary,
    lineHeight: 22, textAlign: 'center', marginBottom: 20,
  },
  disclaimerBold: { fontWeight: '700', color: Colors.textPrimary },
  disclaimerCheckRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 20,
  },
  disclaimerCheck: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: Colors.grey400,
    alignItems: 'center', justifyContent: 'center',
  },
  disclaimerCheckActive: { backgroundColor: Colors.cardDark, borderColor: Colors.cardDark },
  disclaimerCheckMark: { fontSize: 13, color: '#FFF', fontWeight: '700' },
  disclaimerCheckLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  disclaimerAgreeBtn: {
    backgroundColor: Colors.cardDark,
    borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.button,
  },
  disclaimerAgreeBtnText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});
