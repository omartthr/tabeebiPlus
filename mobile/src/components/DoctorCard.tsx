import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import DocAvatar from './DocAvatar';
import Rating from './Rating';
import { colors, shadows } from '../theme';
import { Doctor, iqd } from '../data';

interface Props {
  doctor: Doctor;
  onPress: () => void;
}

export default function DoctorCard({ doctor, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <DocAvatar initials={doctor.initials} hue={doctor.hue} size={72} rounded={14} />
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{doctor.name}</Text>
          <ChevronRight size={18} color={colors.ink300} />
        </View>
        <Text style={styles.specialty}>{doctor.specialty}</Text>
        <View style={styles.meta}>
          <Rating rating={doctor.rating} count={doctor.reviews} />
          <View style={styles.dot} />
          <Text style={styles.price}>IQD {iqd(doctor.price)}</Text>
        </View>
        {doctor.today && (
          <View style={styles.availableBadge}>
            <View style={[styles.badgeDot, { backgroundColor: '#17a673' }]} />
            <Text style={styles.availableText}>Available today</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 14,
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(11,31,34,0.03)',
    ...shadows.card,
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink900,
    letterSpacing: -0.2,
    flex: 1,
  },
  specialty: {
    fontSize: 13,
    color: colors.ink500,
    fontWeight: '500',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.ink300,
  },
  price: {
    fontSize: 13,
    color: colors.ink700,
    fontWeight: '600',
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.green100,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    marginTop: 2,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availableText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0d6b4a',
  },
});
