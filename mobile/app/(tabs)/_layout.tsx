import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Shadows } from '@/constants/theme';
import { View } from 'react-native';

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
          height: 84,
          borderTopWidth: 0,
          paddingTop: 10,
          paddingBottom: 24,
          ...Shadows.card,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => <View style={{ flex: 1, backgroundColor: 'transparent' }} />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="protocols"
        options={{
          title: 'Track',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="chart.line.uptrend.xyaxis" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: 'Calculator',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="function" color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="books.vertical" color={color} />,
        }}
      />
    </Tabs>
  );
}
