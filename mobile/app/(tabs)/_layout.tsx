import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { View } from 'react-native';
import { Home, Activity, Calculator, BookOpen } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.textPrimary,
        tabBarInactiveTintColor: Colors.grey400,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 82,
          borderTopWidth: 0,
          paddingTop: 10,
          paddingBottom: 26,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.2,
          marginTop: 2,
        },
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => <View style={{ flex: 1, backgroundColor: 'transparent' }} />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Home size={20} color={color} strokeWidth={focused ? 2.2 : 1.5} />
              {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.textPrimary, marginTop: 3 }} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="protocols"
        options={{
          title: 'Stack',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Activity size={20} color={color} strokeWidth={focused ? 2.2 : 1.5} />
              {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.textPrimary, marginTop: 3 }} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: 'Calculator',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Calculator size={20} color={color} strokeWidth={focused ? 2.2 : 1.5} />
              {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.textPrimary, marginTop: 3 }} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <BookOpen size={20} color={color} strokeWidth={focused ? 2.2 : 1.5} />
              {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.textPrimary, marginTop: 3 }} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
