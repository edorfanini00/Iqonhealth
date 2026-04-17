import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput,
  ScrollView, Modal, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X, Plus, Pencil, Clock, Calendar as CalIcon, ChevronDown, Search, Lightbulb, Info } from 'lucide-react-native';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';
import { peptidesDB, getSuggestedProtocol } from '@/data/peptides';
import { getProtocols, saveProtocols, getVialInventory, saveVialInventory } from '@/utils/storage';
import { scheduleProtocolReminders } from '@/utils/notifications';
import { useAuth } from '@/contexts/auth';

// ═══════════════════════════════════════════════════════════════
// PROTOCOL WIZARD (New Schedule) — with Suggested Timing
// ═══════════════════════════════════════════════════════════════

const genId = () => Math.random().toString(36).slice(2, 10);

export default function ProtocolWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [items, setItems] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);
  const [showItemEditor, setShowItemEditor] = useState(false);

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
  };

  const applySuggested = () => {
    if (!suggested) return;
    setFrequency(suggested.frequency);
    setDoseTime(suggested.bestTime);
    if (suggested.repeatDays) setRepeatDays(String(suggested.repeatDays));
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
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={s.modalTitle}>{editingIdx !== null ? 'Edit Item' : 'Add Item'}</Text>

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
                          // Auto-show suggested when picking a compound
                          const sug = getSuggestedProtocol(p);
                          if (sug) {
                            setShowSuggested(true);
                          }
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

              {/* ── Suggested Protocol Card ── */}
              {selectedCompound && suggested && showSuggested && (
                <View style={s.suggestedCard}>
                  <View style={s.suggestedHeader}>
                    <Lightbulb size={16} color="#F59E0B" />
                    <Text style={s.suggestedTitle}>Suggested Protocol</Text>
                  </View>
                  <Text style={s.suggestedExplanation}>{suggested.explanation}</Text>
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
                  {suggested.splitDose && (
                    <Text style={s.suggestedSplit}>💡 {suggested.splitNote}</Text>
                  )}
                  <View style={s.suggestedActions}>
                    <TouchableOpacity style={s.suggestedApplyBtn} onPress={applySuggested} activeOpacity={0.85}>
                      <Text style={s.suggestedApplyText}>Apply Suggested</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.suggestedDismissBtn} onPress={() => setShowSuggested(false)} activeOpacity={0.7}>
                      <Text style={s.suggestedDismissText}>Custom</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Amount + Unit */}
              <Text style={s.label}>Amount</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  placeholder="10"
                  placeholderTextColor={Colors.grey400}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
                <View style={s.unitToggle}>
                  <TouchableOpacity
                    style={[s.unitBtn, unit === 'mg' && s.unitBtnActive]}
                    onPress={() => setUnit('mg')}
                  >
                    <Text style={[s.unitBtnText, unit === 'mg' && s.unitBtnTextActive]}>mg</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.unitBtn, unit === 'mcg' && s.unitBtnActive]}
                    onPress={() => setUnit('mcg')}
                  >
                    <Text style={[s.unitBtnText, unit === 'mcg' && s.unitBtnTextActive]}>mcg</Text>
                  </TouchableOpacity>
                </View>
              </View>

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

              {/* Show suggested again button if dismissed */}
              {selectedCompound && suggested && !showSuggested && (
                <TouchableOpacity
                  style={s.showSuggestedBtn}
                  onPress={() => setShowSuggested(true)}
                  activeOpacity={0.7}
                >
                  <Lightbulb size={14} color="#F59E0B" />
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
    </View>
  );
}

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

  label: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary, marginBottom: 8, marginTop: 20 },
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
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8, textAlign: 'center' },

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
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  suggestedHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  suggestedTitle: { fontSize: 15, fontWeight: '700', color: '#92400E' },
  suggestedExplanation: { fontSize: 13, color: '#78350F', lineHeight: 20, marginBottom: 12 },
  suggestedMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 10 },
  suggestedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  suggestedTagText: { fontSize: 12, fontWeight: '600', color: '#78350F' },
  suggestedSplit: { fontSize: 12, color: '#92400E', marginBottom: 10, fontStyle: 'italic' },
  suggestedActions: { flexDirection: 'row', gap: 10 },
  suggestedApplyBtn: {
    flex: 1,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedApplyText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  suggestedDismissBtn: {
    flex: 0.6,
    borderRadius: 12,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  suggestedDismissText: { fontSize: 14, fontWeight: '600', color: '#92400E' },
  showSuggestedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  showSuggestedText: { fontSize: 13, fontWeight: '500', color: '#92400E' },

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
});
