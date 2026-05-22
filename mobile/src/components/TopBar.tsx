import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '../theme';
import { useRTL } from '../context/RTLContext';

interface Props {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export default function TopBar({ title, onBack, right }: Props) {
  const { isRTL } = useRTL();

  // In RTL mode: back arrow flips to ChevronRight, layout reverses
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  return (
    <View style={[styles.container, isRTL && styles.containerRTL]}>
      <View style={styles.side}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <BackIcon size={20} color={colors.ink900} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={[styles.side, isRTL ? styles.leftSide : styles.rightSide]}>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.bg,
  },
  containerRTL: {
    flexDirection: 'row-reverse',
  },
  side: {
    width: 44,
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  leftSide: {
    alignItems: 'flex-start',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.ink100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0b1f22',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink900,
    letterSpacing: -0.3,
  },
});
