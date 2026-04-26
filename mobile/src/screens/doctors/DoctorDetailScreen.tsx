import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapPin, CreditCard, Clock, ExternalLink } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { MainStackParamList } from '../../types/navigation';
import { colors, shadows } from '../../theme';
import { iqd, DAYS } from '../../data';
import TopBar from '../../components/TopBar';
import DocAvatar from '../../components/DocAvatar';
import Rating from '../../components/Rating';
import { supabase } from '../../lib/supabase';

type Props = NativeStackScreenProps<MainStackParamList, 'DoctorDetail'>;

// PREVIEW_SLOTS removed — now using real schedule from DB


export default function DoctorDetailScreen({ route, navigation }: Props) {
  const { doctor } = route.params;
  const { t } = useTranslation();
  const [scheduleLoading, setScheduleLoading] = React.useState(true);
  const [schedule, setSchedule] = React.useState<any>(null);
  const [nextSlots, setNextSlots] = React.useState<string[]>([]);
  const [nextDay, setNextDay] = React.useState<any>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setScheduleLoading(true);

      const regId = doctor.registration_id;
      if (!regId) {
        setScheduleLoading(false);
        return;
      }

      // Get schedule directly using registration_id
      const { data: sched } = await supabase
        .from('doctor_schedules')
        .select('schedule')
        .eq('doctor_registration_id', regId)
        .maybeSingle();

      if (cancelled) return;

      if (sched?.schedule) {
        setSchedule(sched.schedule);

        // Find next available day with slots
        for (const day of DAYS) {
          const dayKey = day.day.toLowerCase();
          const daySched = sched.schedule[dayKey];
          if (daySched && daySched.isOpen && daySched.slots.length > 0) {
            setNextDay(day);
            setNextSlots(daySched.slots.slice(0, 6));
            break;
          }
        }
      }

      setScheduleLoading(false);
    })();
    return () => { cancelled = true; };
  }, [doctor.id]);

  const openInMaps = () => {
    if (!doctor.location_lat || !doctor.location_lng) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${doctor.location_lat},${doctor.location_lng}`;
    Linking.openURL(url);
  };

  const getHoursText = (dayKey: string) => {
    if (scheduleLoading) return '...';
    if (!schedule || !schedule[dayKey]) return t('hours_closed');
    const dayData = schedule[dayKey];
    if (!dayData.isOpen || !dayData.slots || dayData.slots.length === 0) return t('hours_closed');
    const first = dayData.slots[0];
    const last = dayData.slots[dayData.slots.length - 1];
    return `${first} – ${last}`;
  };

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title={t('doctor_title')} onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.hero}>
          <DocAvatar initials={doctor.initials} hue={doctor.hue} size={88} rounded={22} />
          <View style={styles.heroInfo}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.specialty}>{doctor.specialty}</Text>
            <View style={styles.ratingRow}>
              <Rating rating={doctor.rating} count={doctor.reviews} size={14} />
              {doctor.today && (
                <View style={styles.todayBadge}>
                  <View style={[styles.badgeDot, { backgroundColor: '#17a673' }]} />
                  <Text style={styles.todayText}>{t('today_badge')}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.chips}>
          <View style={[styles.chip, { backgroundColor: colors.ink100 }]}>
            <MapPin size={14} color={colors.ink700} />
            <Text style={[styles.chipText, { color: colors.ink700 }]} numberOfLines={1}>{doctor.loc}</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: colors.amber50 }]}>
            <CreditCard size={14} color="#8a5a0d" />
            <Text style={[styles.chipText, { color: '#8a5a0d' }]}>IQD {iqd(doctor.price)}</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: colors.teal50 }]}>
            <Clock size={14} color={colors.teal800} />
            <Text style={[styles.chipText, { color: colors.teal800 }]}>{doctor.exp} {t('experience_suffix')}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('about')}</Text>
          <Text style={styles.aboutText}>{t('about_text', { exp: doctor.exp })}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('working_hours')}</Text>
          <View style={styles.hoursCard}>
            {[
              { id: 'mon', label: 'Pazartesi' },
              { id: 'tue', label: 'Salı' },
              { id: 'wed', label: 'Çarşamba' },
              { id: 'thu', label: 'Perşembe' },
              { id: 'fri', label: 'Cuma' },
              { id: 'sat', label: 'Cumartesi' },
              { id: 'sun', label: 'Pazar' },
            ].map(d => {
              const text = getHoursText(d.id);
              const isClosed = text === t('hours_closed');
              return (
                <View key={d.id} style={styles.hoursRow}>
                  <Text style={styles.hoursDay}>{d.label}</Text>
                  <Text style={[styles.hoursTime, isClosed && { color: colors.red500 }]}>{text}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('location_map')}</Text>
          {doctor.location_lat && doctor.location_lng ? (
            <View style={styles.locationCard}>
              <TouchableOpacity activeOpacity={0.85} onPress={openInMaps} style={styles.locationMapBanner}>
                <View style={styles.locationIconCircle}>
                  <MapPin size={28} color={colors.teal700} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.locationCoords}>
                    {Number(doctor.location_lat).toFixed(5)}, {Number(doctor.location_lng).toFixed(5)}
                  </Text>
                  <Text style={styles.locationOpenText}>Google Maps'te görüntüle →</Text>
                </View>
                <ExternalLink size={18} color={colors.teal700} />
              </TouchableOpacity>
              {doctor.location_address ? (
                <View style={styles.addressBox}>
                  <MapPin size={14} color={colors.ink500} />
                  <Text style={styles.addressText}>{doctor.location_address}</Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={[styles.locationCard, { padding: 16 }]}>
              <Text style={{ fontSize: 13, color: colors.ink400 }}>Konum bilgisi bulunmuyor.</Text>
            </View>
          )}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>{t('consultation_label')}</Text>
          <Text style={styles.footerPrice}>IQD {iqd(doctor.price)}</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('Booking', { doctor })} activeOpacity={0.85}>
          <Text style={styles.bookBtnText}>{t('book_appointment_btn')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  hero: { flexDirection: 'row', gap: 14, alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8 },
  heroInfo: { flex: 1, minWidth: 0, gap: 4 },
  doctorName: { fontSize: 20, fontWeight: '700', color: colors.ink900, letterSpacing: -0.3, lineHeight: 24 },
  specialty: { fontSize: 13, color: colors.ink500, fontWeight: '500' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  todayBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.green100, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  todayText: { fontSize: 12, fontWeight: '600', color: '#0d6b4a' },
  chips: { paddingHorizontal: 20, paddingVertical: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  chipText: { fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.ink100, marginHorizontal: 20 },
  section: { padding: 20, paddingBottom: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: colors.ink500, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 8 },
  aboutText: { fontSize: 14, lineHeight: 22, color: colors.ink700, fontWeight: '500' },
  hoursCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.ink100, gap: 8 },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between' },
  hoursDay: { fontSize: 13, fontWeight: '600', color: colors.ink700 },
  hoursTime: { fontSize: 13, fontWeight: '600', color: colors.ink900 },
  slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  seeAll: { fontSize: 12, color: colors.teal700, fontWeight: '700' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotItem: { width: '30%', paddingVertical: 10, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.ink200, alignItems: 'center' },
  slotText: { fontSize: 13, fontWeight: '600', color: colors.ink900 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, paddingBottom: 24, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.ink100 },
  footerLabel: { fontSize: 11, fontWeight: '600', color: colors.ink500, textTransform: 'uppercase', letterSpacing: 0.3 },
  footerPrice: { fontSize: 18, fontWeight: '700', color: colors.ink900 },
  bookBtn: { flex: 1, height: 54, borderRadius: 100, backgroundColor: colors.teal700, alignItems: 'center', justifyContent: 'center', shadowColor: '#0d7377', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  bookBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  locationCard: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.ink100, overflow: 'hidden' },
  locationMapBanner: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: colors.teal50 },
  locationIconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  locationCoords: { fontSize: 13, fontWeight: '700', color: colors.teal700, marginBottom: 3 },
  locationOpenText: { fontSize: 11, color: colors.teal800, fontWeight: '600' },
  addressBox: { padding: 14, flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: colors.ink100 },
  addressText: { flex: 1, fontSize: 13, color: colors.ink700, fontWeight: '500', lineHeight: 18 },
});
