import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
  TextInput, KeyboardAvoidingView, ScrollView, ActivityIndicator, Image,
} from 'react-native';
import { useAuth } from '@/contexts/auth';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

export default function SignIn() {
  const { signInWithApple, signInWithGoogle, signInWithEmail, continueAsGuest } = useAuth();
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password.trim(), isSignUp);
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    setLoading(true);
    try { await signInWithApple(); } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try { await signInWithGoogle(); } finally { setLoading(false); }
  };

  const handleGuest = async () => {
    setLoading(true);
    try { await continueAsGuest(); } finally { setLoading(false); }
  };

  return (
    <View style={s.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ───── Logo Section ───── */}
          <View style={s.logoSection}>
            <Image
              source={require('@/assets/images/iqon-logo.png')}
              style={s.logoImage}
              resizeMode="contain"
            />
            <Text style={s.tagline}>Peptide tracking, simplified.</Text>
          </View>

          {/* ───── Auth Section ───── */}
          <View style={s.authSection}>
            {/* Apple Sign In */}
            <TouchableOpacity style={s.appleBtn} onPress={handleApple} activeOpacity={0.85} disabled={loading}>
              <Text style={s.appleIcon}>&#63743;</Text>
              <Text style={s.appleBtnText}>Continue with Apple</Text>
            </TouchableOpacity>

            {/* Google Sign In */}
            <TouchableOpacity style={s.googleBtn} onPress={handleGoogle} activeOpacity={0.85} disabled={loading}>
              <View style={s.googleIconWrap}>
                <Text style={s.googleG}>G</Text>
              </View>
              <Text style={s.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>or</Text>
              <View style={s.dividerLine} />
            </View>

            {/* Email / Password */}
            {!showEmail ? (
              <TouchableOpacity style={s.emailBtn} onPress={() => setShowEmail(true)} activeOpacity={0.85} disabled={loading}>
                <Text style={s.emailBtnText}>Sign up with Email</Text>
              </TouchableOpacity>
            ) : (
              <View style={s.emailForm}>
                <TextInput
                  style={s.input}
                  placeholder="Email address"
                  placeholderTextColor={Colors.grey400}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!loading}
                />
                <TextInput
                  style={s.input}
                  placeholder="Password"
                  placeholderTextColor={Colors.grey400}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                  editable={!loading}
                />
                <TouchableOpacity style={s.submitBtn} onPress={handleEmailSubmit} activeOpacity={0.85} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={s.submitBtnText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} activeOpacity={0.7} disabled={loading}>
                  <Text style={s.toggleText}>
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ───── Guest ───── */}
          <TouchableOpacity style={s.guestBtn} onPress={handleGuest} activeOpacity={0.7} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.textSecondary} />
            ) : (
              <Text style={s.guestBtnText}>Continue as Guest</Text>
            )}
          </TouchableOpacity>

          {/* ───── Legal ───── */}
          <Text style={s.legal}>
            By continuing, you agree to our{' '}
            <Text style={s.legalLink}>Terms of Service</Text> and{' '}
            <Text style={s.legalLink}>Privacy Policy</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 40,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoImage: {
    width: 360,
    height: 160,
  },
  tagline: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 8,
    letterSpacing: 0.5,
  },

  // Auth Buttons
  authSection: {
    gap: 12,
    marginBottom: 24,
  },

  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardDark,
    borderRadius: 16,
    height: 56,
    gap: 10,
    ...Shadows.button,
  },
  appleIcon: {
    fontSize: 22,
    color: '#FFF',
    marginTop: -2,
  },
  appleBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
  },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.panelBg,
    borderRadius: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.5)',
    gap: 10,
    ...Shadows.button,
  },
  googleIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
  googleBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(200,205,210,0.4)',
  },
  dividerText: {
    fontSize: 13,
    color: Colors.grey400,
    paddingHorizontal: 16,
    fontWeight: '500',
  },

  // Email
  emailBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardDark,
    borderRadius: 16,
    height: 56,
    ...Shadows.button,
  },
  emailBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
  },

  emailForm: {
    gap: 10,
  },
  input: {
    backgroundColor: Colors.panelBg,
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 18,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(200,205,210,0.5)',
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardDark,
    borderRadius: 16,
    height: 56,
    marginTop: 4,
    ...Shadows.button,
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
  },
  toggleText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 8,
  },

  // Guest
  guestBtn: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  guestBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // Legal
  legal: {
    fontSize: 11,
    color: Colors.grey400,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
  },
  legalLink: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
