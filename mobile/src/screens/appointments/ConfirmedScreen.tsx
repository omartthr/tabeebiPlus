import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check, X } from 'lucide-react-native';
import { MainStackParamList } from '../../types/navigation';
import { colors, shadows } from '../../theme';
import TopBar from '../../components/TopBar';
import DocAvatar from '../../components/DocAvatar';

type Props = NativeStackScreenProps<MainStackParamList, 'Confirmed'>;

export default function ConfirmedScreen({ route, navigation }: Props) {
  const { booking } = route.params;

  const goHome = () => navigation.navigate('MainTabs');
  const goAppts = () => navigation.navigate('MainTabs');

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Close button */}
        <View style={styles.closeRow}>
          <TouchableOpacity style={styles.closeBtn} onPress={goHome}>
            <X size={18} color={colors.ink700} />
          </TouchableOpacity>
        </View>

        {/* Success hero */}
        <View style={styles.hero}>
          <View style={styles.checkCircle}>
            <Check size={44} color="#fff" strokeWidth={3} />
          </View>
          <Text style={styles.headline}>You're booked!</Text>
          <Text style={styles.subheadline}>
            We sent a confirmation to your phone. Please arrive 10 minutes early.
          </Text>
        </View>

        {/* Ticket */}
        <View style={styles.ticket}>
          <View style={styles.ticketTop}>
            <DocAvatar initials={booking.doctor.initials} hue={booking.doctor.hue} size={52} rounded={14} />
            <View style={{ flex: 1 }}>
              <Text style={styles.ticketDoctor}>{booking.doctor.name}</Text>
              <Text style={styles.ticketSpec}>{booking.doctor.specialty}</Text>
            </View>
          </View>

          {/* Perforation */}
          <View style={styles.perforation}>
            <View style={styles.perfLeft} />
            <View style={styles.perfLine} />
            <View style={styles.perfRight} />
          </View>

          <View style={styles.ticketBody}>
            <View style={styles.ticketCell}>
              <Text style={styles.cellLabel}>DATE</Text>
              <Text style={styles.cellValue}>{booking.day}</Text>
            </View>
            <View style={styles.ticketCell}>
              <Text style={styles.cellLabel}>TIME</Text>
              <Text style={styles.cellValue}>{booking.time}</Text>
            </View>
            <View style={styles.ticketCell}>
              <Text style={styles.cellLabel}>LOCATION</Text>
              <Text style={styles.cellValue}>{booking.doctor.loc}</Text>
            </View>
            <View style={styles.ticketCell}>
              <Text style={styles.cellLabel}>PAYMENT</Text>
              <Text style={styles.cellValue}>
                {booking.payment === 'online' ? 'Paid online' : 'Pay at clinic'}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnPrimary} onPress={goAppts} activeOpacity={0.85}>
            <Text style={styles.btnPrimaryText}>View my bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutline} onPress={goHome} activeOpacity={0.8}>
            <Text style={styles.btnOutlineText}>Back to home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  closeRow: { alignItems: 'flex-end', marginBottom: 20 },
  closeBtn: {
    width: 40, height: 40, borderRadius: 999,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.ink100,
    alignItems: 'center', justifyContent: 'center',
  },
  hero: { alignItems: 'center', marginBottom: 28 },
  checkCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: colors.teal700,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#0d7377', shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35, shadowRadius: 24, elevation: 10,
  },
  headline: { fontSize: 28, fontWeight: '700', color: colors.ink900, letterSpacing: -0.5, marginBottom: 8 },
  subheadline: { fontSize: 15, lineHeight: 22, fontWeight: '500', color: colors.ink700, textAlign: 'center', maxWidth: 280 },
  ticket: {
    backgroundColor: colors.surface, borderRadius: 20,
    borderWidth: 1, borderColor: colors.ink100,
    overflow: 'hidden', marginBottom: 24,
    ...shadows.card,
  },
  ticketTop: {
    padding: 16, flexDirection: 'row', gap: 12, alignItems: 'center',
  },
  ticketDoctor: { fontSize: 15, fontWeight: '700', color: colors.ink900 },
  ticketSpec: { fontSize: 12, color: colors.ink500, fontWeight: '500' },
  perforation: {
    height: 16, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8,
  },
  perfLeft: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.bg, marginLeft: -16 },
  perfLine: { flex: 1, borderTopWidth: 1.5, borderColor: colors.ink200, borderStyle: 'dashed' },
  perfRight: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.bg, marginRight: -16 },
  ticketBody: { padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  ticketCell: { width: '46%' },
  cellLabel: {
    fontSize: 11, fontWeight: '600', color: colors.ink500,
    textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4,
  },
  cellValue: { fontSize: 13, fontWeight: '700', color: colors.ink900 },
  actions: { gap: 10 },
  btnPrimary: {
    height: 54, borderRadius: 100, backgroundColor: colors.teal700,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#0d7377', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
  },
  btnPrimaryText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  btnOutline: {
    height: 54, borderRadius: 100, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.ink200, alignItems: 'center', justifyContent: 'center',
  },
  btnOutlineText: { fontSize: 16, fontWeight: '700', color: colors.ink900 },
});
