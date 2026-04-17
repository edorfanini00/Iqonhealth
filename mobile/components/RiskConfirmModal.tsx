import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react-native';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';

export default function RiskConfirmModal({ visible, onClose, onConfirm, peptideName, dose }) {
  const [accepted, setAccepted] = useState(false);

  const handleConfirm = () => {
    if (accepted) {
      onConfirm();
      setAccepted(false);
    }
  };

  const handleClose = () => {
    setAccepted(false);
    onClose();
  };

  if (!dose) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Close Button */}
            <TouchableOpacity style={s.closeBtn} onPress={handleClose} activeOpacity={0.7}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            {/* Warning Icon */}
            <View style={s.iconWrap}>
              <ShieldAlert size={36} color="#ef4444" />
            </View>

            {/* Title */}
            <Text style={s.title}>High-Risk Dosage</Text>
            <Text style={s.subtitle}>
              {peptideName} — {dose.label}
            </Text>

            {/* Dose Amount */}
            <View style={s.doseBox}>
              <Text style={s.doseAmount}>
                {dose.mcg >= 1000 ? `${(dose.mcg / 1000).toFixed(dose.mcg % 1000 === 0 ? 0 : 1)}mg` : `${dose.mcg}mcg`}
              </Text>
              <Text style={s.doseFreq}>per dose</Text>
            </View>

            {/* Risk Warning */}
            <View style={s.warningCard}>
              <View style={s.warningHeader}>
                <AlertTriangle size={16} color="#ef4444" />
                <Text style={s.warningTitle}>Risk Warning</Text>
              </View>
              <Text style={s.warningText}>{dose.risk}</Text>
              <Text style={s.warningSource}>Source: {dose.source}</Text>
            </View>

            {/* Disclaimer */}
            <View style={s.disclaimerBox}>
              <Text style={s.disclaimerText}>
                This dosage exceeds standard recommended ranges and carries increased risk of adverse effects. 
                This application is not a substitute for professional medical advice. Consult a qualified healthcare 
                provider before using any peptide at any dosage.
              </Text>
            </View>

            {/* Checkbox */}
            <TouchableOpacity 
              style={s.checkboxRow} 
              onPress={() => setAccepted(!accepted)} 
              activeOpacity={0.7}
            >
              <View style={[s.checkbox, accepted && s.checkboxChecked]}>
                {accepted && <Text style={s.checkmark}>✓</Text>}
              </View>
              <Text style={s.checkboxLabel}>
                I understand this dosage is at my own risk and that IQON does not provide medical advice.
              </Text>
            </TouchableOpacity>

            {/* Actions */}
            <View style={s.actions}>
              <TouchableOpacity style={s.cancelBtn} onPress={handleClose} activeOpacity={0.7}>
                <Text style={s.cancelBtnText}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[s.confirmBtn, !accepted && s.confirmBtnDisabled]} 
                onPress={handleConfirm} 
                activeOpacity={accepted ? 0.8 : 1}
                disabled={!accepted}
              >
                <Text style={[s.confirmBtnText, !accepted && { opacity: 0.4 }]}>
                  Accept & Continue
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.grey100,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },

  doseBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  doseAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ef4444',
  },
  doseFreq: {
    fontSize: 13,
    color: '#dc2626',
    marginTop: 2,
  },

  warningCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#dc2626',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  warningText: {
    fontSize: 14,
    color: '#7f1d1d',
    lineHeight: 22,
  },
  warningSource: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 8,
  },

  disclaimerBox: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
    paddingRight: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.grey300,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    fontWeight: '500',
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.grey100,
    borderRadius: Radius.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: Radius.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: '#fca5a5',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
