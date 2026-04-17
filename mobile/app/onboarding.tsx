import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Dimensions, Animated, Platform, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';
import { ChevronRight, Target, Zap, Heart, Shield, Sparkles, Moon, Brain, Droplets, CheckCircle } from 'lucide-react-native';

const { width: SCREEN_W } = Dimensions.get('window');

const GOALS = [
  { id: 'fat_loss', label: 'Fat Loss', icon: Target, color: '#FF3B30' },
  { id: 'recovery', label: 'Recovery & Healing', icon: Zap, color: '#34C759' },
  { id: 'longevity', label: 'Longevity & Anti-Aging', icon: Heart, color: '#FF9500' },
  { id: 'cognition', label: 'Cognition & Focus', icon: Brain, color: '#5856D6' },
  { id: 'sleep', label: 'Sleep & Relaxation', icon: Moon, color: '#6d28d9' },
  { id: 'immune', label: 'Immune Support', icon: Shield, color: '#34C759' },
  { id: 'aesthetics', label: 'Skin, Hair & Beauty', icon: Sparkles, color: '#ec4899' },
  { id: 'performance', label: 'Athletic Performance', icon: Droplets, color: '#0ea5e9' },
];

const EXPERIENCE = [
  { id: 'new', label: 'New to Peptides', desc: "I've never used peptides before" },
  { id: 'some', label: 'Some Experience', desc: "I've tried a few peptides" },
  { id: 'advanced', label: 'Advanced User', desc: 'I have significant experience with peptides' },
];

const CONDITIONS = [
  'None',
  'Diabetes / Pre-Diabetes',
  'Heart Condition',
  'High Blood Pressure',
  'Thyroid Issues',
  'Autoimmune Disorder',
  'Pregnancy / Nursing',
  'Cancer History',
  'Other',
];

export default function Onboarding() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);

  const totalSteps = 5;

  const goNext = () => {
    if (step < totalSteps - 1) {
      const next = step + 1;
      setStep(next);
      scrollRef.current?.scrollTo({ x: next * SCREEN_W, animated: true });
    }
  };

  const finish = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const toggleCondition = (c: string) => {
    if (c === 'None') {
      setConditions(['None']);
      return;
    }
    setConditions(prev => {
      const filtered = prev.filter(x => x !== 'None');
      return filtered.includes(c) ? filtered.filter(x => x !== c) : [...filtered, c];
    });
  };

  return (
    <View style={s.container}>
      {/* Progress bar */}
      <View style={s.progressWrap}>
        <View style={[s.progressBar, { width: `${((step + 1) / totalSteps) * 100}%` }]} />
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
      >
        {/* ── Step 1: Welcome ── */}
        <View style={s.slide}>
          <View style={s.slideContent}>
            <Image source={require('@/assets/images/iqon-logo.png')} style={s.welcomeLogo} resizeMode="contain" />
            <Text style={s.slideTitle}>Welcome to IQON</Text>
            <Text style={s.slideDesc}>
              Your personal peptide companion. We'll ask a few questions to personalize your experience.
            </Text>
            <Text style={s.slideNote}>
              This is not medical advice. Always consult a healthcare professional before starting any peptide protocol.
            </Text>
          </View>
          <TouchableOpacity style={s.nextBtn} onPress={goNext} activeOpacity={0.85}>
            <Text style={s.nextBtnText}>Get Started</Text>
            <ChevronRight size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* ── Step 2: Goals ── */}
        <View style={s.slide}>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={s.slideContentTop}>
              <Text style={s.slideTitle}>What are your goals?</Text>
              <Text style={s.slideDesc}>Select all that apply. This helps us recommend the right peptides.</Text>
              <View style={s.goalGrid}>
                {GOALS.map(g => {
                  const Icon = g.icon;
                  const selected = goals.includes(g.id);
                  return (
                    <TouchableOpacity
                      key={g.id}
                      style={[s.goalCard, selected && s.goalCardSelected]}
                      onPress={() => toggleGoal(g.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[s.goalIcon, { backgroundColor: g.color + '15' }]}>
                        <Icon size={20} color={g.color} />
                      </View>
                      <Text style={s.goalLabel}>{g.label}</Text>
                      {selected && (
                        <View style={s.goalCheck}>
                          <CheckCircle size={16} color={Colors.success} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>
          <TouchableOpacity
            style={[s.nextBtn, goals.length === 0 && s.nextBtnDisabled]}
            onPress={goNext}
            activeOpacity={0.85}
            disabled={goals.length === 0}
          >
            <Text style={s.nextBtnText}>Continue</Text>
            <ChevronRight size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* ── Step 3: Experience ── */}
        <View style={s.slide}>
          <View style={s.slideContent}>
            <Text style={s.slideTitle}>Experience Level</Text>
            <Text style={s.slideDesc}>How familiar are you with peptides?</Text>
            <View style={{ gap: 10, width: '100%' }}>
              {EXPERIENCE.map(e => {
                const selected = experience === e.id;
                return (
                  <TouchableOpacity
                    key={e.id}
                    style={[s.expCard, selected && s.expCardSelected]}
                    onPress={() => setExperience(e.id)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={s.expLabel}>{e.label}</Text>
                      <Text style={s.expDesc}>{e.desc}</Text>
                    </View>
                    {selected && <CheckCircle size={20} color={Colors.success} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <TouchableOpacity
            style={[s.nextBtn, !experience && s.nextBtnDisabled]}
            onPress={goNext}
            activeOpacity={0.85}
            disabled={!experience}
          >
            <Text style={s.nextBtnText}>Continue</Text>
            <ChevronRight size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* ── Step 4: Health Conditions ── */}
        <View style={s.slide}>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={s.slideContentTop}>
              <Text style={s.slideTitle}>Health Check</Text>
              <Text style={s.slideDesc}>Do you have any of the following? This helps us flag safety considerations.</Text>
              <View style={{ gap: 8, width: '100%' }}>
                {CONDITIONS.map(c => {
                  const selected = conditions.includes(c);
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[s.condRow, selected && s.condRowSelected]}
                      onPress={() => toggleCondition(c)}
                      activeOpacity={0.7}
                    >
                      <Text style={s.condLabel}>{c}</Text>
                      <View style={[s.condCheck, selected && s.condCheckActive]}>
                        {selected && <CheckCircle size={14} color="#FFF" />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>
          <TouchableOpacity
            style={[s.nextBtn, conditions.length === 0 && s.nextBtnDisabled]}
            onPress={goNext}
            activeOpacity={0.85}
            disabled={conditions.length === 0}
          >
            <Text style={s.nextBtnText}>Continue</Text>
            <ChevronRight size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* ── Step 5: Done ── */}
        <View style={s.slide}>
          <View style={s.slideContent}>
            <View style={[s.iconCircle, { backgroundColor: 'rgba(52,199,89,0.1)' }]}>
              <CheckCircle size={40} color={Colors.success} />
            </View>
            <Text style={s.slideTitle}>You're All Set!</Text>
            <Text style={s.slideDesc}>
              We've personalized your experience. You can always update your preferences later in Settings.
            </Text>
            <View style={s.summaryCard}>
              <Text style={s.summaryLabel}>YOUR PROFILE</Text>
              <Text style={s.summaryItem}>Goals: {goals.length} selected</Text>
              <Text style={s.summaryItem}>Experience: {EXPERIENCE.find(e => e.id === experience)?.label || '—'}</Text>
              <Text style={s.summaryItem}>Health: {conditions.join(', ') || '—'}</Text>
            </View>
          </View>
          <TouchableOpacity style={s.nextBtn} onPress={finish} activeOpacity={0.85}>
            <Text style={s.nextBtnText}>Enter IQON</Text>
            <ChevronRight size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary, paddingTop: 60 },

  progressWrap: {
    height: 3,
    backgroundColor: 'rgba(200,205,210,0.3)',
    marginHorizontal: 28,
    borderRadius: 2,
    marginBottom: 20,
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.textPrimary,
    borderRadius: 2,
  },

  slide: { width: SCREEN_W, flex: 1, paddingHorizontal: 28, paddingBottom: 40 },
  slideContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  slideContentTop: { paddingTop: 20, alignItems: 'center' },

  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(200,205,210,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  welcomeLogo: {
    width: 280,
    height: 90,
    marginBottom: 28,
  },

  slideTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  slideDesc: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  slideNote: {
    fontSize: 12,
    color: Colors.grey400,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },

  // Goals
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
  },
  goalCard: {
    width: '47%',
    backgroundColor: Colors.panelBg,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(200,205,210,0.4)',
    ...Shadows.card,
  },
  goalCardSelected: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(52,199,89,0.05)',
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  goalCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  // Experience
  expCard: {
    backgroundColor: Colors.panelBg,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(200,205,210,0.4)',
    ...Shadows.card,
  },
  expCardSelected: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(52,199,89,0.05)',
  },
  expLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  expDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Conditions
  condRow: {
    backgroundColor: Colors.panelBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'rgba(200,205,210,0.4)',
  },
  condRowSelected: {
    borderColor: Colors.textPrimary,
    backgroundColor: 'rgba(30,36,41,0.03)',
  },
  condLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  condCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(200,205,210,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(200,205,210,0.4)',
  },
  condCheckActive: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },

  // Summary
  summaryCard: {
    backgroundColor: Colors.panelBg,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.4)',
    gap: 6,
    ...Shadows.card,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 2,
    marginBottom: 6,
  },
  summaryItem: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },

  // Next button
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardDark,
    borderRadius: 16,
    height: 56,
    gap: 8,
    ...Shadows.button,
  },
  nextBtnDisabled: {
    opacity: 0.3,
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
  },
});
