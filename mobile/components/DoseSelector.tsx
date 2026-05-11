import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle, Check, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';
import { getRiskColor, getRiskLabel } from '@/data/peptides';
import RiskConfirmModal from './RiskConfirmModal';

export default function DoseSelector({ peptideName, doses, onSelect, selectedTier, suggestedTimeLabel = null, cycleWeeks = null }) {
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

  const formatDose = (dose) =>
    dose.mcg >= 1000
      ? `${(dose.mcg / 1000).toFixed(dose.mcg % 1000 === 0 ? 0 : 1)}mg/day`
      : `${dose.mcg}mcg/day`;

  return (
    <View style={s.container}>
      {/* Title */}
      <Text style={s.title}>Recommended Dosages</Text>

      {Object.entries(doses).map(([tier, dose]) => {
        const isSelected = selectedTier === tier;
        const riskColor = getRiskColor(dose.riskLevel);
        const isElevated = dose.riskLevel === 'elevated' || dose.riskLevel === 'high';

        return (
          <TouchableOpacity
            key={tier}
            style={[s.tierCard, isSelected && s.tierCardSelected]}
            onPress={() => handleSelect(tier, dose)}
            activeOpacity={0.7}
          >
            {/* Single row: label + dose + chevron/check */}
            <View style={s.tierRow}>
              <View style={s.tierInfo}>
                <Text style={s.tierLabel}>{tierLabels[tier]}</Text>
                <Text style={s.tierName} numberOfLines={2}>{dose.label}</Text>
              </View>
              <View style={s.tierRight}>
                <Text style={s.tierDose}>{formatDose(dose)}</Text>
                {isSelected ? (
                  <View style={s.checkCircle}>
                    <Check size={11} color="#FFF" />
                  </View>
                ) : (
                  <ChevronRight size={14} color={Colors.grey400} />
                )}
              </View>
            </View>

            {/* Recommended badge — for standard dose */}
            {tier === 'med' && (
              <View style={s.badgeRow}>
                <View style={[s.riskBadge, { backgroundColor: 'rgba(52,199,89,0.12)' }]}>
                  <Text style={[s.riskBadgeText, { color: '#34C759' }]}>RECOMMENDED</Text>
                </View>
              </View>
            )}

            {/* Risk badge — only for elevated/high */}
            {isElevated && (
              <View style={s.badgeRow}>
                <View style={[s.riskBadge, { backgroundColor: riskColor + '18' }]}>
                  <AlertTriangle size={9} color={riskColor} />
                  <Text style={[s.riskBadgeText, { color: riskColor }]}>{getRiskLabel(dose.riskLevel)}</Text>
                </View>
              </View>
            )}

            {/* Risk description only when selected */}
            {isSelected && (
              <Text style={s.riskDesc}>{dose.risk}</Text>
            )}

            {/* High risk warning banner */}
            {dose.riskLevel === 'high' && isSelected && (
              <View style={s.highRiskBanner}>
                <AlertTriangle size={11} color="#dc2626" />
                <Text style={s.highRiskText}>Requires risk acknowledgment before adding</Text>
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
    gap: 8,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },

  tierCard: {
    backgroundColor: Colors.panelBg,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.3)',
    ...Shadows.card,
  },
  tierCardSelected: {
    borderWidth: 1.5,
    borderColor: Colors.cardDark || '#1C1C1E',
  },

  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tierInfo: {
    flex: 1,
    gap: 2,
  },
  tierLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tierName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  tierRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  tierDose: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.cardDark || '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  riskBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  riskDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },

  highRiskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  highRiskText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#dc2626',
    flex: 1,
  },
});
