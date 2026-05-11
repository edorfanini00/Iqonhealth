import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export function CircularProgress({ progress }: { progress: number }) {
  const SIZE = 180;
  const HALF = SIZE / 2;
  const THICKNESS = 14;

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: progress,
      duration: 30,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const deg = (progress / 100) * 360;
  const rightDeg = Math.min(deg, 180);
  const leftDeg = Math.max(0, deg - 180);

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      {/* Track */}
      <View style={{
        position: 'absolute', width: SIZE, height: SIZE,
        borderRadius: HALF, borderWidth: THICKNESS,
        borderColor: 'rgba(200,205,210,0.35)',
      }} />

      {/* Right half (0–180°) */}
      <View style={{
        position: 'absolute', top: 0, left: HALF,
        width: HALF, height: SIZE, overflow: 'hidden',
      }}>
        <View style={{
          position: 'absolute', top: 0, left: -HALF,
          width: SIZE, height: SIZE, borderRadius: HALF,
          borderWidth: THICKNESS, borderColor: '#1E2429',
          transform: [{ rotate: `${rightDeg - 180}deg` }],
        }} />
      </View>

      {/* Left half (180–360°) */}
      {deg > 180 && (
        <View style={{
          position: 'absolute', top: 0, left: 0,
          width: HALF, height: SIZE, overflow: 'hidden',
        }}>
          <View style={{
            position: 'absolute', top: 0, left: 0,
            width: SIZE, height: SIZE, borderRadius: HALF,
            borderWidth: THICKNESS, borderColor: '#1E2429',
            transform: [{ rotate: `${leftDeg}deg` }],
          }} />
        </View>
      )}

      {/* Center cutout */}
      <View style={{
        width: SIZE - THICKNESS * 2 - 4,
        height: SIZE - THICKNESS * 2 - 4,
        borderRadius: (SIZE - THICKNESS * 2 - 4) / 2,
        backgroundColor: Colors.bgPrimary,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 32, fontWeight: '800', color: Colors.textPrimary }}>
          {Math.round(progress)}%
        </Text>
      </View>
    </View>
  );
}
