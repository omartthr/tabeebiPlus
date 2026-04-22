import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';

interface Props {
  rating: number;
  count?: number;
  size?: number;
}

export default function Rating({ rating, count, size = 13 }: Props) {
  return (
    <View style={styles.container}>
      <Star size={size} color="#E6A63B" fill="#E6A63B" />
      <Text style={[styles.rating, { fontSize: size }]}>{rating.toFixed(1)}</Text>
      {count != null && (
        <Text style={[styles.count, { fontSize: size }]}>({count})</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontWeight: '700',
    color: '#0b1f22',
  },
  count: {
    color: '#5c6f73',
    fontWeight: '500',
  },
});
