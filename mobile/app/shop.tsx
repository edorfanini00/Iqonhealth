import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingBag, Box, Droplet, ArrowRight, Info } from 'lucide-react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

export default function Shop() {
  const router = useRouter();

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Shop</Text>
          <Text style={s.subtitle}>Supplies for your protocols</Text>
        </View>
        <View style={s.cartIcon}>
          <ShoppingBag size={18} color="#fff" />
          <View style={s.cartBadge} />
        </View>
      </View>

      {/* Smart Cart Info */}
      <View style={s.infoCard}>
        <Info size={20} color={Colors.textSecondary} />
        <Text style={s.infoText}>
          These items are intelligently selected based on your <Text style={{ color: '#fff', fontWeight: '500' }}>Recovery Stack</Text> and <Text style={{ color: '#fff', fontWeight: '500' }}>Fat Loss Phase 1</Text> to ensure you stay supplied.
        </Text>
      </View>

      {/* Calculated Cart */}
      <View style={{ gap: Spacing.xs }}>
        <Text style={s.sectionTitle}>Calculated Cart</Text>
        <View style={s.cartCard}>
          <View style={[s.cartRow, { borderBottomWidth: 1, borderBottomColor: Colors.white10 }]}>
            <View style={{ flexDirection: 'row', gap: Spacing.md, alignItems: 'center' }}>
              <View style={s.itemIcon}><Box size={18} color={Colors.accentLight} /></View>
              <View>
                <Text style={s.itemName}>BPC-157 (5mg)</Text>
                <Text style={s.itemSub}>Need 2 vials to finish cycle</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.itemPrice}>$68.00</Text>
              <Text style={s.itemQty}>Qty: 2</Text>
            </View>
          </View>
          <View style={[s.cartRow, { borderBottomWidth: 1, borderBottomColor: Colors.white10, backgroundColor: 'rgba(0,0,0,0.1)' }]}>
            <View style={{ flexDirection: 'row', gap: Spacing.md, alignItems: 'center' }}>
              <View style={s.itemIcon}><Droplet size={18} color="#fff" /></View>
              <View>
                <Text style={s.itemName}>Bacteriostatic Water</Text>
                <Text style={s.itemSub}>30ml bottle</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.itemPrice}>$9.00</Text>
              <Text style={s.itemQty}>Qty: 1</Text>
            </View>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Estimated Total</Text>
            <Text style={s.totalValue}>$145.00</Text>
          </View>
        </View>

        <TouchableOpacity style={s.checkoutBtn} activeOpacity={0.8}>
          <Text style={s.checkoutText}>Checkout • $145.00</Text>
        </TouchableOpacity>
      </View>

      {/* Common Supplies */}
      <View style={{ gap: Spacing.sm }}>
        <Text style={[s.sectionTitle, { color: Colors.textSecondary }]}>Common Supplies</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Spacing.lg }}>
          <View style={{ flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg }}>
            <SupplyCard name="U-100 Syringes" count="100 pack" price="$14" />
            <SupplyCard name="Alcohol Prep" count="200 wipes" price="$6" />
            <SupplyCard name="Sharps Bin" count="Small 1qt" price="$8" />
          </View>
        </ScrollView>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function SupplyCard({ name, count, price }) {
  return (
    <View style={s.supplyCard}>
      <View>
        <Text style={{ fontWeight: '500', fontSize: 14, color: '#fff', lineHeight: 18 }}>{name}</Text>
        <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: Spacing.xs }}>{count}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.white10, paddingTop: Spacing.sm }}>
        <Text style={{ fontWeight: '500', fontSize: 14, color: Colors.accentLight }}>{price}</Text>
        <TouchableOpacity style={s.addSmBtn}><ArrowRight size={12} color="#fff" /></TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  content: { padding: Spacing.lg, paddingTop: 60, gap: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: Typography['3xl'], fontWeight: '300', color: '#fff', letterSpacing: -1 },
  subtitle: { color: Colors.textSecondary, fontSize: Typography.sm, marginTop: Spacing.xs },
  cartIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white10, borderWidth: 1, borderColor: Colors.white20, alignItems: 'center', justifyContent: 'center' },
  cartBadge: { position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.accent },
  infoCard: { backgroundColor: Colors.panelBg, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.white10, padding: Spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  infoText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 20, flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '500', color: '#fff', paddingHorizontal: Spacing.xs },
  cartCard: { backgroundColor: Colors.panelBg, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.white20, overflow: 'hidden' },
  cartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md },
  itemIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white05, borderWidth: 1, borderColor: Colors.white10, alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 14, fontWeight: '500', color: '#fff' },
  itemSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  itemPrice: { fontWeight: '600', fontSize: 14, color: '#fff' },
  itemQty: { fontSize: 10, color: Colors.textSecondary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, backgroundColor: Colors.white05 },
  totalLabel: { fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 1, color: Colors.textSecondary },
  totalValue: { fontSize: 24, fontWeight: '300', color: '#fff' },
  checkoutBtn: { backgroundColor: '#1c1c1e', borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center', marginTop: Spacing.md },
  checkoutText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  supplyCard: { backgroundColor: Colors.panelBg, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.white10, padding: 16, minWidth: 130, minHeight: 130, justifyContent: 'space-between' },
  addSmBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.white10, alignItems: 'center', justifyContent: 'center' },
});
