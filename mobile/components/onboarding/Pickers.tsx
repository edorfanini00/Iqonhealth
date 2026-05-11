import React, { useRef, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ViewToken } from 'react-native';
import { Colors } from '@/constants/theme';

const ITEM_H = 50;

export function ScrollPicker({ items, value, onChange }: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<FlatList>(null);
  const padded = ['', '', ...items, '', ''];
  const idx = items.indexOf(value);

  useEffect(() => {
    if (idx >= 0) {
      setTimeout(() => {
        ref.current?.scrollToOffset({ offset: idx * ITEM_H, animated: false });
      }, 100);
    }
  }, []);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const mid = viewableItems[Math.floor(viewableItems.length / 2)];
    if (mid && mid.item && mid.item !== '' && mid.item !== value) {
      onChange(mid.item);
    }
  }).current;

  return (
    <View style={p.wrap}>
      <View style={p.highlight} pointerEvents="none" />
      <FlatList
        ref={ref}
        data={padded}
        keyExtractor={(_, i) => String(i)}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        getItemLayout={(_, i) => ({ length: ITEM_H, offset: ITEM_H * i, index: i })}
        renderItem={({ item }) => (
          <View style={p.item}>
            <Text style={[p.itemText, item === value && p.itemSelected]}>{item}</Text>
          </View>
        )}
      />
    </View>
  );
}

const p = StyleSheet.create({
  wrap: { height: ITEM_H * 3, overflow: 'hidden', position: 'relative' },
  highlight: {
    position: 'absolute', top: ITEM_H, height: ITEM_H, left: 0, right: 0,
    borderTopWidth: 1.5, borderBottomWidth: 1.5,
    borderColor: 'rgba(30,36,41,0.2)', zIndex: 1,
  },
  item: { height: ITEM_H, alignItems: 'center', justifyContent: 'center' },
  itemText: { fontSize: 18, color: 'rgba(30,36,41,0.35)', fontWeight: '500' },
  itemSelected: { color: '#1E2429', fontWeight: '700', fontSize: 20 },
});
