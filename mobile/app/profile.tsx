import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, Alert, Switch, Linking,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  ArrowLeft, User, Shield, Bell, Trash2,
  ChevronRight, LogOut, HelpCircle, FileText, Clock,
} from 'lucide-react-native';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/auth';
import { getProtocols, getDoseLogs } from '@/utils/storage';

export default function ProfileSettings() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [stats, setStats] = useState({ protocols: 0, totalDoses: 0, streak: 0, days: 0 });

  useFocusEffect(useCallback(() => { loadStats(); }, []));

  const loadStats = async () => {
    try {
      const protocols = await getProtocols();
      const logs = await getDoseLogs();
      const active = protocols.filter((p: any) => p.status === 'active').length;

      let totalDoses = 0;
      Object.values(logs).forEach((dayLog: any) => {
        totalDoses += Object.values(dayLog).filter(Boolean).length;
      });

      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLog = logs[dateStr];
        if (dayLog && Object.values(dayLog).some(Boolean)) { streak++; }
        else if (i > 0) { break; }
      }

      let days = 0;
      protocols.forEach((p: any) => {
        if (p.createdAt) {
          const diff = Math.floor((today.getTime() - new Date(p.createdAt).getTime()) / (24 * 3600 * 1000));
          days = Math.max(days, diff);
        }
      });

      setStats({ protocols: active, totalDoses, streak, days });
    } catch {}
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/sign-in'); } },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This will permanently delete your account and all data. This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Contact Support', 'Email support@iqonhealth.com to request account deletion.') },
    ]);
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email ? user.email[0].toUpperCase() : 'G';

  const providerLabel = ({ apple: 'Apple', google: 'Google', email: 'Email', guest: 'Guest' } as Record<string, string>)[user?.provider || ''] || '';

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={s.backBtn}>
          <ArrowLeft size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile header */}
        <View style={s.profileRow}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.userName}>{user?.name || 'Guest User'}</Text>
            {user?.email ? (
              <Text style={s.userSub}>{user.email}</Text>
            ) : (
              <Text style={s.userSub}>{providerLabel} account</Text>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <Stat value={stats.protocols} label="Active" />
          <Stat value={stats.totalDoses} label="Logged" />
          <Stat value={stats.streak} label="Streak" />
          <Stat value={stats.days} label="Days" />
        </View>

        {/* General */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>General</Text>
          <View style={s.card}>
            <Row icon={<Bell size={15} color={Colors.textSecondary} />} label="Dose Reminders"
              right={<Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: Colors.grey200, true: '#34C759' }} thumbColor="#FFF" />}
            />
          </View>
        </View>

        {/* Account */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Account</Text>
          <View style={s.card}>
            <Row icon={<User size={15} color={Colors.textSecondary} />} label="Edit Profile"
              onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available in a future update.')}
            />
            <View style={s.divider} />
            <Row icon={<Shield size={15} color={Colors.textSecondary} />} label="Privacy & Data"
              onPress={() => Alert.alert('Your Data', 'All data is stored locally on your device. No health data is sent to external servers.')}
            />
            <View style={s.divider} />
            <Row icon={<Clock size={15} color={Colors.textSecondary} />} label="Export Data"
              onPress={() => Alert.alert('Coming Soon', 'Data export will be available in a future update.')}
            />
          </View>
        </View>

        {/* Support */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Support</Text>
          <View style={s.card}>
            <Row icon={<HelpCircle size={15} color={Colors.textSecondary} />} label="Help & FAQ"
              onPress={() => Alert.alert('Help', 'For support, contact support@iqonhealth.com')}
            />
            <View style={s.divider} />
            <Row icon={<FileText size={15} color={Colors.textSecondary} />} label="Terms of Service"
              onPress={() => Linking.openURL('https://iqonhealth.com/terms')}
            />
            <View style={s.divider} />
            <Row icon={<Shield size={15} color={Colors.textSecondary} />} label="Privacy Policy"
              onPress={() => Linking.openURL('https://iqonhealth.com/privacy')}
            />
          </View>
        </View>

        {/* Sign Out / Delete */}
        <View style={s.section}>
          <View style={s.card}>
            <Row icon={<LogOut size={15} color="#FF3B30" />} label="Sign Out" labelColor="#FF3B30" onPress={handleSignOut} />
            <View style={s.divider} />
            <Row icon={<Trash2 size={15} color="#FF3B30" />} label="Delete Account" labelColor="#FF3B30" onPress={handleDeleteAccount} />
          </View>
        </View>

        <Text style={s.version}>IQON v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* ── Stat ── */
function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={s.statItem}>
      <Text style={s.statVal}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

/* ── Row ── */
function Row({ icon, label, labelColor, right, onPress }: any) {
  const content = (
    <View style={s.row}>
      <View style={s.rowLeft}>
        {icon}
        <Text style={[s.rowLabel, labelColor && { color: labelColor }]}>{label}</Text>
      </View>
      {right || <ChevronRight size={15} color={Colors.grey400} />}
    </View>
  );
  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity>;
  }
  return content;
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.panelBg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(200,205,210,0.2)',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },

  scroll: { paddingHorizontal: Spacing.lg, paddingTop: 8, gap: 24 },

  // Profile
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.cardDark,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#FFF', letterSpacing: 0.5 },
  userName: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.2 },
  userSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 1 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.panelBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.2)',
    overflow: 'hidden',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 2 },
  statVal: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.3 },

  // Sections
  section: { gap: 8 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 2,
  },

  // Card
  card: {
    backgroundColor: Colors.panelBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.2)',
    overflow: 'hidden',
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowLabel: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(200,205,210,0.3)', marginLeft: 40 },

  // Version
  version: { fontSize: 12, color: Colors.grey400, textAlign: 'center', marginTop: 4 },
});
