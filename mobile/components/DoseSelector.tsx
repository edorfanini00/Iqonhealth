import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle, Check, Shield, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';
import { getRiskColor, getRiskLabel } from '@/data/peptides';
import RiskConfirmModal from './RiskConfirmModal';

export default function DoseSelector({ peptideName, doses, onSelect, selectedTier }) {
  const [riskModalVisible, setRiskModalVisible] = useState(false);
  const [pendingTier, setPendingTier] = useState(null);

  const handleSelect = (tier, dose) => {
    if (dose.riskLevel === 'high') {
      setPendingTier(tier);
      setRiskModalVisible(true);
    } else {
      onSelect(tier, dose);
    }
  };

  const handleRiskConfirm = () => {
    if (pendingTier && doses[pendingTier]) {
      onSelect(pendingTier, doses[pendingTier]);
    }
    setRiskModalVisible(false);
    setPendingTier(null);
  };

  const tierLabels = { low: 'Conservative', med: 'Standard', high: 'Aggressive' };
  const tierIcons = {
    low: <Shield size={16} color="#22c55e" />,
    med: <Shield size={16} color="#f59e0b" />,
    high: <AlertTriangle size={16} color="#ef4444" />,
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Select Dosage</Text>
      <Text style={s.subtitle}>Choose your dosing tier for {peptideName}</Text>

      {Object.entries(doses).map(([tier, dose]) => {
        const isSelected = selectedTier === tier;
        const riskColor = getRiskColor(dose.riskLevel);

        return (
          <TouchableOpacity
            key={tier}
            style={[
              s.tierCard,
              { borderLeftColor: riskColor },
              isSelected && s.tierCardSelected,
            ]}
            onPress={() => handleSelect(tier, dose)}
            activeOpacity={0.7}
          >
            <View style={s.tierHeader}>
              <View style={s.tierLeft}>
                {tierIcons[tier]}
                <View>
                  <Text style={s.tierLabel}>{tierLabels[tier]}</Text>
                  <Text style={s.tierName}>{dose.label}</Text>
                </View>
              </View>
              <View style={s.tierRight}>
                <Text style={s.tierDose}>
                  {dose.mcg >= 1000 ? `${(dose.mcg / 1000).toFixed(dose.mcg % 1000 === 0 ? 0 : 1)}mg` : `${dose.mcg}mcg`}
                </Text>
                {isSelected ? (
                  <View style={[s.checkCircle, { backgroundColor: riskColor }]}>
                    <Check size={12} color="#FFF" />
                  </View>
                ) : (
                  <ChevronRight size={16} color={Colors.grey400} />
                )}
              </View>
            </View>

            {/* Risk description */}
            <Text style={s.riskDesc}>{dose.risk}</Text>

            {/* Risk badge */}
            <View style={[s.riskBadge, { backgroundColor: riskColor + '18' }]}>
              <Text style={[s.riskBadgeText, { color: riskColor }]}>
                {getRiskLabel(dose.riskLevel)} Risk
              </Text>
            </View>

            {/* High risk warning banner */}
            {dose.riskLevel === 'high' && (
              <View style={s.highRiskBanner}>
                <AlertTriangle size={12} color="#dc2626" />
                <Text style={s.highRiskText}>Requires risk acknowledgment</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      <RiskConfirmModal
        visible={riskModalVisible}
        onClose={() => { setRiskModalVisible(false); setPendingTier(null); }}
        onConfirm={handleRiskConfirm}
        peptideName={peptideName}
        dose={pendingTier ? doses[pendingTier] : null}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },

  tierCard: {
    backgroundColor: Colors.panelBg,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    gap: 10,
    ...Shadows.card,
  },
  tierCardSelected: {
    borderWidth: 1.5,
    borderColor: Colors.vibrantBlue || '#007AFF',
  },

  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tierLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tierName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  tierRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tierDose: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  riskDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },

  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  highRiskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  highRiskText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dc2626',
  },
});
