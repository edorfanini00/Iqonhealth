import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing } from '@/constants/theme';
import { protocolTemplates } from '@/data/protocolTemplates';

export default function ProtocolTemplates() {
  const router = useRouter();

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Protocol Templates</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {protocolTemplates.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={s.card}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/protocol-wizard', params: { templateId: t.id } })}
          >
            <View style={s.cardTop}>
              {/* Icon */}
              <View style={s.iconWrap}>
                <Text style={s.iconEmoji}>{t.icon}</Text>
              </View>

              {/* Content */}
              <View style={s.cardContent}>
                <Text style={s.cardName}>{t.name}</Text>
                <View style={s.metaRow}>
                  <View style={[s.badge, { backgroundColor: t.categoryColor + '22', borderColor: t.categoryColor + '44' }]}>
                    <Text style={[s.badgeText, { color: t.categoryColor }]}>{t.category}</Text>
                  </View>
                  <Text style={s.metaDot}>·</Text>
                  <Text style={s.metaText}>{t.peptideCount} Peptides</Text>
                  <Text style={s.metaDot}>·</Text>
                  <Text style={s.metaText}>{t.cycleWeeks} weeks</Text>
                </View>
                <Text style={s.cardDesc} numberOfLines={2}>{t.description}</Text>
              </View>

              {/* Arrow */}
              <ChevronRight size={18} color={Colors.grey400} style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  } as any,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.pagePx,
    marginBottom: 20,
  } as any,
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  } as any,
  content: {
    paddingHorizontal: Spacing.pagePx,
    gap: 14,
  } as any,

  card: {
    backgroundColor: Colors.panelBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.12)',
  } as any,
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  } as any,
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.cardDark + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  } as any,
  iconEmoji: {
    fontSize: 22,
  } as any,
  cardContent: {
    flex: 1,
  } as any,
  cardName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.2,
  } as any,
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 6,
  } as any,
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  } as any,
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  } as any,
  metaDot: {
    fontSize: 12,
    color: Colors.grey400,
  } as any,
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  } as any,
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  } as any,
});
