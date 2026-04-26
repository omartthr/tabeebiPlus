import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CreditCard, Banknote, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { MainStackParamList } from '../../types/navigation';
import { colors, shadows } from '../../theme';
import { DAYS, TIME_SLOTS, iqd } from '../../data';
import TopBar from '../../components/TopBar';
import DocAvatar from '../../components/DocAvatar';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'Booking'>;

export default function BookingScreen({ route, navigation }: Props) {
  const { doctor } = route.params;
  const { user } = useAuth();
  const { t } = useTranslation();
  const [dayIdx, setDayIdx] = useState(1);
  const [slotIdx, setSlotIdx] = useState(3);
  const [payment, setPayment] = useState<'online' | 'cash'>('online');
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [slots, setSlots] = useState<{ t: string; state: 'available' | 'unavailable' }[]>([]);
  const [schedule, setSchedule] = useState<any>(null);

  const day = DAYS[dayIdx];
  const slot = slots[slotIdx];
  const canBook = slot && slot.state === 'available' && !bookingLoading;

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // 1. Get registration ID for this doctor
      const { data: reg } = await supabase
        .from('doctor_registrations')
        .select('id')
        .eq('doctors_id', doctor.id)
        .maybeSingle();
      
      if (cancelled || !reg) {
        setLoading(false);
        return;
      }

      // 2. Get schedule
      const { data: sched } = await supabase
        .from('doctor_schedules')
        .select('schedule')
        .eq('doctor_registration_id', reg.id)
        .maybeSingle();
      
      if (sched) setSchedule(sched.schedule);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [doctor.id]);

  React.useEffect(() => {
    if (!schedule) return;
    let cancelled = false;

    (async () => {
      const dayKey = day.day.toLowerCase(); // 'mon', 'tue', etc.
      const daySched = schedule[dayKey];
      
      if (!daySched || !daySched.isOpen) {
        setSlots([]);
        return;
      }

      // 3. Get booked slots for this day
      const { data: booked } = await supabase
        .from('appointments')
        .select('time')
        .eq('doctor_id', doctor.id)
        .eq('date', day.key)
        .neq('status', 'cancelled');

      if (cancelled) return;

      const bookedTimes = booked?.map(b => b.time) || [];
      const newSlots = daySched.slots.map((t: string) => ({
        t,
        state: bookedTimes.includes(t) ? 'unavailable' : 'available'
      }));

      setSlots(newSlots);
    })();

    return () => { cancelled = true; };
  }, [dayIdx, schedule]);

  const confirm = async () => {
    if (!user?.id) {
      alert('Oturum hatası. Lütfen tekrar giriş yapın.');
      return;
    }

    setBookingLoading(true);
    const { error } = await supabase
      .from('appointments')
      .insert({
        patient_id: user.id,
        doctor_id: doctor.id,
        date: day.key,
        time: slot.t,
        payment: payment,
        status: 'pending',
        price: doctor.price
      });

    setBookingLoading(false);

    if (error) {
      console.error('Booking error:', error);
      alert('Randevu alınırken bir hata oluştu: ' + error.message);
      return;
    }

    navigation.navigate('Confirmed', { booking: { doctor, day: day.full, time: slot.t, payment } });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title={t('book_appointment')} onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.doctorRecap}>
          <DocAvatar initials={doctor.initials} hue={doctor.hue} size={48} rounded={12} />
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.specialty}>{doctor.specialty}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>{t('choose_day')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll} contentContainerStyle={styles.dayContent}>
          {DAYS.map((d, i) => {
            const active = i === dayIdx;
            return (
              <TouchableOpacity key={i} onPress={() => setDayIdx(i)} style={[styles.dayBtn, active && styles.dayBtnActive]} activeOpacity={0.8}>
                <Text style={[styles.dayName, active && styles.dayTextActive]}>{d.day}</Text>
                <Text style={[styles.dayNum, active && styles.dayTextActive]}>{d.num}</Text>
                <Text style={[styles.dayMonth, active && styles.dayTextActive]}>{d.month}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>{t('available_time')}</Text>
        <View style={styles.slotGrid}>
          {loading ? (
            <Text style={{ fontSize: 13, color: colors.ink400 }}>{t('loading')}...</Text>
          ) : slots.length > 0 ? (
            slots.map((s, i) => {
              const active = i === slotIdx && s.state === 'available';
              const disabled = s.state === 'unavailable';
              return (
                <TouchableOpacity key={i} disabled={disabled} onPress={() => setSlotIdx(i)} style={[styles.slotBtn, active && styles.slotBtnActive, disabled && styles.slotBtnDisabled]} activeOpacity={0.8}>
                  <Text style={[styles.slotText, active && styles.slotTextActive, disabled && styles.slotTextDisabled]}>{s.t}</Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={{ fontSize: 13, color: colors.ink400 }}>{t('no_available_slots')}</Text>
          )}
        </View>

        <View style={styles.legend}>
          {[
            { color: colors.teal700, label: t('legend_selected'), border: false },
            { color: colors.surface, label: t('legend_available'), border: true },
            { color: colors.ink200, label: t('legend_unavailable'), border: false },
          ].map(l => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color }, l.border ? { borderWidth: 1.5, borderColor: colors.ink200 } : {}]} />
              <Text style={styles.legendText}>{l.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>{t('payment_method')}</Text>
        <View style={styles.paymentOptions}>
          {[
            { id: 'online' as const, Icon: CreditCard, title: t('pay_online'), sub: t('pay_online_sub'), badge: t('instant_confirm') },
            { id: 'cash' as const, Icon: Banknote, title: t('pay_clinic'), sub: t('pay_clinic_sub'), badge: null },
          ].map(opt => {
            const active = payment === opt.id;
            return (
              <TouchableOpacity key={opt.id} onPress={() => setPayment(opt.id)} style={[styles.payOpt, active && styles.payOptActive]} activeOpacity={0.8}>
                <View style={[styles.payIcon, active && styles.payIconActive]}>
                  <opt.Icon size={20} color={active ? '#fff' : colors.ink700} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payTitle}>{opt.title}</Text>
                  <Text style={styles.paySub}>{opt.sub}</Text>
                </View>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active && <Check size={14} color="#fff" strokeWidth={3} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.summary}>
          <Text style={styles.sectionLabel}>{t('summary')}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>{t('consultation')}</Text>
            <Text style={styles.summaryVal}>IQD {iqd(doctor.price)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>{t('service_fee')}</Text>
            <Text style={styles.summaryVal}>IQD 2,000</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalKey}>{t('total')}</Text>
            <Text style={styles.totalVal}>IQD {iqd(doctor.price + 2000)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.bookBtn, !canBook && styles.bookBtnDisabled]} disabled={!canBook} onPress={confirm} activeOpacity={0.85}>
          <Text style={styles.bookBtnText}>{bookingLoading ? t('processing') : t('confirm_booking')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 10 },
  doctorRecap: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.ink100, marginBottom: 8 },
  doctorName: { fontSize: 14, fontWeight: '700', color: colors.ink900 },
  specialty: { fontSize: 12, color: colors.ink500, fontWeight: '500' },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: colors.ink500, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 10 },
  dayScroll: { flexGrow: 0 },
  dayContent: { gap: 8 },
  dayBtn: { minWidth: 62, paddingVertical: 10, paddingHorizontal: 6, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.ink200, alignItems: 'center', gap: 2 },
  dayBtnActive: { backgroundColor: colors.teal700, borderWidth: 0, shadowColor: '#0d7377', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 5 },
  dayName: { fontSize: 11, fontWeight: '600', color: colors.ink500, textTransform: 'uppercase', letterSpacing: 0.3 },
  dayNum: { fontSize: 20, fontWeight: '700', color: colors.ink900, letterSpacing: -0.3 },
  dayMonth: { fontSize: 10, fontWeight: '600', color: colors.ink500 },
  dayTextActive: { color: '#fff' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotBtn: { width: '30%', paddingVertical: 12, borderRadius: 100, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.ink200, alignItems: 'center' },
  slotBtnActive: { backgroundColor: colors.teal700, borderWidth: 0 },
  slotBtnDisabled: { backgroundColor: colors.ink100, borderWidth: 0 },
  slotText: { fontSize: 13, fontWeight: '600', color: colors.ink900 },
  slotTextActive: { color: '#fff' },
  slotTextDisabled: { color: colors.ink400, textDecorationLine: 'line-through' },
  legend: { flexDirection: 'row', gap: 14, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: colors.ink500, fontWeight: '600' },
  paymentOptions: { gap: 10, marginBottom: 8 },
  payOpt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.ink200 },
  payOptActive: { backgroundColor: colors.teal50, borderColor: colors.teal700 },
  payIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.ink100, alignItems: 'center', justifyContent: 'center' },
  payIconActive: { backgroundColor: colors.teal700 },
  payTitle: { fontSize: 14, fontWeight: '700', color: colors.ink900 },
  paySub: { fontSize: 12, color: colors.ink500, fontWeight: '500', marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.ink300, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  radioActive: { backgroundColor: colors.teal700, borderColor: colors.teal700 },
  summary: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.ink100, gap: 10, marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryKey: { fontSize: 13, fontWeight: '600', color: colors.ink700 },
  summaryVal: { fontSize: 13, fontWeight: '600', color: colors.ink900 },
  divider: { height: 1, backgroundColor: colors.ink100 },
  totalKey: { fontSize: 15, fontWeight: '700', color: colors.ink900 },
  totalVal: { fontSize: 15, fontWeight: '700', color: colors.ink900 },
  footer: { padding: 20, paddingBottom: 24, backgroundColor: colors.bg },
  bookBtn: { height: 54, borderRadius: 100, backgroundColor: colors.teal700, alignItems: 'center', justifyContent: 'center', shadowColor: '#0d7377', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  bookBtnDisabled: { backgroundColor: colors.ink200, shadowOpacity: 0 },
  bookBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
