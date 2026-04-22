import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  initials: string;
  hue?: number;
  size?: number;
  rounded?: number;
}

function hslBg(hue: number) {
  const backgrounds: Record<number, { bg: string; fg: string }> = {
    175: { bg: '#c8eaea', fg: '#0a5d60' },
    190: { bg: '#bce4ea', fg: '#0a4d60' },
    40:  { bg: '#f0dfc0', fg: '#7a5c10' },
    160: { bg: '#c0e8d8', fg: '#1a6b50' },
    15:  { bg: '#f0d0c8', fg: '#7a2a20' },
    210: { bg: '#c0d8f0', fg: '#2a4a7a' },
  };
  return backgrounds[hue] || { bg: '#c8eaea', fg: '#0a5d60' };
}

export default function DocAvatar({ initials, hue = 175, size = 64, rounded = 14 }: Props) {
  const colors = hslBg(hue);
  return (
    <View style={[
      styles.container,
      { width: size, height: size, borderRadius: rounded, backgroundColor: colors.bg },
    ]}>
      <Text style={[styles.text, { color: colors.fg, fontSize: size * 0.36 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(11,31,34,0.05)',
  },
  text: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
