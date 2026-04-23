import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme';

interface Props {
  status: string;
}

const map: Record<string, { bg: string; dot: string; fg: string; key: string }> = {
  confirmed: { bg: colors.green100, dot: '#17a673', fg: '#0d6b4a', key: 'status_confirmed' },
  pending:   { bg: colors.amber100, dot: '#d59528', fg: '#8a5a0d', key: 'status_pending' },
  cancelled: { bg: colors.red100,   dot: '#d9534a', fg: '#912a23', key: 'status_cancelled' },
  completed: { bg: colors.teal100,  dot: '#0d7377', fg: colors.teal800, key: 'status_completed' },
  blocked:   { bg: colors.orange100,dot: '#e88a3b', fg: '#8f4a0d', key: 'status_pending' },
  open:      { bg: colors.amber100, dot: '#d59528', fg: '#8a5a0d', key: 'status_open' },
  resolved:  { bg: colors.green100, dot: '#17a673', fg: '#0d6b4a', key: 'status_resolved' },
};

export default function StatusBadge({ status }: Props) {
  const { t } = useTranslation();
  const m = map[status] || map.pending;
  return (
    <View style={[styles.badge, { backgroundColor: m.bg }]}>
      <View style={[styles.dot, { backgroundColor: m.dot }]} />
      <Text style={[styles.label, { color: m.fg }]}>{t(m.key)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 100,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});
