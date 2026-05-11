import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Alert, Animated, Linking, ScrollView,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth';
import { Colors, Shadows } from '@/constants/theme';
import {
  CheckCircle, Activity, Shield, TrendingUp,
  BookOpen, Zap, Layers,
} from 'lucide-react-native';

const { width: W } = Dimensions.get('window');

const FEATURES = [
  { icon: Activity,   label: 'Dose Tracking & Reminders',      desc: 'Never miss a scheduled dose' },
  { icon: Shield,     label: 'Synergy & Interaction Analysis',   desc: 'Stay safe with compound checks' },
  { icon: TrendingUp, label: 'Spending & Inventory Tracker',     desc: 'Know exactly what you spend' },
  { icon: BookOpen,   label: 'Research Library',                 desc: 'Deep-dive into compound data' },
  { icon: Zap,        label: 'Unlimited Protocols',              desc: 'Build as many stacks as you need' },
  { icon: Layers,     label: 'Protocol Templates',               desc: 'Start fast with expert layouts' },
];

const PLANS = {
  monthly: { label: 'Monthly', price: '$9.99',  sub: 'per month', tag: null },
  yearly:  { label: 'Annual',  price: '$77.99', sub: 'per year',  tag: 'SAVE 35%' },
};

const STRIPE_LINKS = {
  yearly:  process.env.EXPO_PUBLIC_STRIPE_LINK_YEARLY  || '',
  monthly: process.env.EXPO_PUBLIC_STRIPE_LINK_MONTHLY || '',
};

export default function Paywall() {
  const router = useRouter();
  const { setUserPaid, completeOnboarding } = useAuth();
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);

  // Listen for deep link: iqon://payment-success
  useEffect(() => {
    const sub = Linking.addEventListener('url', async ({ url }) => {
      if (url.includes('payment-success')) {
        await handlePaymentSuccess();
      }
    });
    return () => sub.remove();
  }, []);

  const handlePaymentSuccess = async () => {
    await setUserPaid();
    router.replace('/(tabs)');
  };

  const handleSubscribe = async () => {
    const link = STRIPE_LINKS[plan]; // 'yearly' or 'monthly'
    if (!link || link.includes('YOUR')) {
      Alert.alert('Not Configured', `The ${plan} payment link isn't set up yet.`);
      return;
    }
    setLoading(true);
    try {
      await WebBrowser.openBrowserAsync(link, {
        dismissButtonStyle: 'cancel',
        preferEphemeralSession: false,
      });
    } catch {
      Alert.alert('Error', 'Unable to open payment page. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore Purchase',
      'Contact support@iqonhealth.com to restore your access.',
      [{ text: 'OK' }],
    );
  };

  const p = PLANS[plan];

  return (
    <View style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Badge */}
        <View style={s.badge}>
          <Text style={s.badgeText}>IQON PREMIUM</Text>
        </View>

        {/* Headline */}
        <Text style={s.headline}>Unlock Full Access</Text>
        <Text style={s.subline}>
          The complete peptide companion. Track, analyze, and optimize every protocol.
        </Text>

        {/* Plan toggle */}
        <View style={s.planRow}>
          {(['monthly', 'yearly'] as const).map(key => {
            const selected = plan === key;
            const pl = PLANS[key];
            return (
              <TouchableOpacity
                key={key}
                style={[s.planCard, selected && s.planCardSelected]}
                onPress={() => setPlan(key)}
                activeOpacity={0.8}
              >
                {pl.tag && (
                  <View style={s.saveBadge}>
                    <Text style={s.saveBadgeText}>{pl.tag}</Text>
                  </View>
                )}
                <Text style={[s.planLabel, selected && s.planLabelSelected]}>{pl.label}</Text>
                <Text style={[s.planPrice, selected && s.planPriceSelected]}>{pl.price}</Text>
                <Text style={[s.planSub, selected && s.planSubSelected]}>{pl.sub}</Text>
                {selected && (
                  <View style={s.planCheck}>
                    <CheckCircle size={16} color={Colors.success} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Features */}
        <View style={s.featuresCard}>
          <Text style={s.featuresTitle}>EVERYTHING INCLUDED</Text>
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <View
                key={i}
                style={[s.featureRow, i > 0 && { borderTopWidth: 1, borderTopColor: 'rgba(200,205,210,0.35)' }]}
              >
                <View style={s.featureIcon}>
                  <Icon size={16} color={Colors.textPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.featureLabel}>{f.label}</Text>
                  <Text style={s.featureDesc}>{f.desc}</Text>
                </View>
                <CheckCircle size={14} color={Colors.success} />
              </View>
            );
          })}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={s.cta}
          onPress={handleSubscribe}
          activeOpacity={0.88}
          disabled={loading}
        >
          <Text style={s.ctaText}>
            {loading ? 'Opening...' : `Subscribe — ${p.price} ${p.sub}`}
          </Text>
        </TouchableOpacity>

        <Text style={s.finePrint}>
          Cancel anytime. Secure payment via Stripe.
        </Text>

        <TouchableOpacity onPress={handleRestore} activeOpacity={0.7} style={s.restoreBtn}>
          <Text style={s.restoreText}>Restore Purchase</Text>
        </TouchableOpacity>

        {/* Skip — testing only */}
        <TouchableOpacity
          onPress={handlePaymentSuccess}
          activeOpacity={0.5}
          style={s.skipBtn}
        >
          <Text style={s.skipText}>Skip for now</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  scroll: { paddingHorizontal: 24, paddingTop: 80, alignItems: 'center' },

  badge: {
    backgroundColor: Colors.panelBg,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.5)',
    marginBottom: 20,
    ...Shadows.card,
  },
  badgeText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.5,
  },

  headline: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  subline: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 10,
  },

  // Plan cards
  planRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 20,
  },
  planCard: {
    flex: 1,
    backgroundColor: Colors.panelBg,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(200,205,210,0.4)',
    gap: 4,
    overflow: 'hidden',
    ...Shadows.card,
  },
  planCardSelected: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(52,199,89,0.04)',
  },
  planCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  saveBadge: {
    backgroundColor: Colors.cardDark,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  saveBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  planLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  planLabelSelected: { color: Colors.textPrimary },
  planPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  planPriceSelected: { color: Colors.textPrimary },
  planSub: { fontSize: 11, color: Colors.grey400 },
  planSubSelected: { color: Colors.textSecondary },

  // Features
  featuresCard: {
    width: '100%',
    backgroundColor: Colors.panelBg,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.4)',
    ...Shadows.card,
  },
  featuresTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 2,
    marginBottom: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(200,205,210,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  featureDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },

  // CTA
  cta: {
    width: W - 48,
    height: 56,
    backgroundColor: Colors.cardDark,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Shadows.button,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  finePrint: {
    fontSize: 12,
    color: Colors.grey400,
    textAlign: 'center',
    marginBottom: 16,
  },
  restoreBtn: { paddingVertical: 8 },
  restoreText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  skipBtn: { marginTop: 14, paddingVertical: 8 },
  skipText: {
    fontSize: 12,
    color: Colors.grey300,
    textAlign: 'center',
  },
});
