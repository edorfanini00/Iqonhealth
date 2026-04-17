import { ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '@/contexts/auth';
import { Colors } from '@/constants/theme';
import { useEffect } from 'react';
import { registerForNotifications } from '@/utils/notifications';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Light theme to match our metallic design
const LightTheme = {
  dark: false,
  colors: {
    primary: Colors.textPrimary,
    background: Colors.bgPrimary,
    card: '#FFFFFF',
    text: Colors.textPrimary,
    border: 'rgba(200,205,210,0.4)',
    notification: Colors.danger,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '900' as const },
  },
};

function RootNavigation() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'sign-in';
    const inOnboarding = segments[0] === 'onboarding';

    if (!user) {
      // Not logged in → sign-in
      if (!inAuthGroup) {
        router.replace('/sign-in');
      }
    } else if (!user.onboardingComplete) {
      // Logged in but hasn't completed onboarding
      if (!inOnboarding) {
        router.replace('/onboarding');
      }
    } else {
      // Logged in + onboarded → main app
      if (inAuthGroup || inOnboarding) {
        router.replace('/(tabs)');
      }
    }
  }, [user, isLoading, segments]);

  // Request notification permissions when user logs in
  useEffect(() => {
    if (user && !isLoading) {
      registerForNotifications();
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bgPrimary }}>
        <ActivityIndicator size="large" color={Colors.textPrimary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={LightTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="sign-in" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="protocol-wizard" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="shop" options={{ presentation: 'modal' }} />
        <Stack.Screen name="learn" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
