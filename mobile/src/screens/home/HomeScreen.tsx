import React, { useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl,
  Dimensions, Platform, Image, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Bell, ChevronRight, MessageSquare, Sparkles, Clock, MapPin,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';
import { MainStackParamList } from '../../types/navigation';
import { useAuth } from '../../navigation/AppNavigator';
import { colors } from '../../theme';
import { SPECIALTIES } from '../../data';
import SpecialtyIcon from '../../components/SpecialtyIcon';
import DocAvatar from '../../components/DocAvatar';
import { TabeebiAPI } from '../../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment, DAYS } from '../../data';
import { isAppointmentPast } from '../../utils/date';
import HeroCarousel from '../../components/HeroCarousel';

type Nav = NativeStackNavigationProp<MainStackParamList>;

const { width: SCREEN_W } = Dimensions.get('window');
const HP = 20; // horizontal padding
const GAP = 12;
const CARD_W = (SCREEN_W - HP * 2 - GAP) / 2;
const CARD_BG_W = SCREEN_W - HP * 2;
const CARD_BG_H = CARD_BG_W / 1.79; // Oran 1024x572 (1.79) olarak güncellendi

export default function HomeScreen() {
  const nav = useNavigation<Nav>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [nextAppt, setNextAppt] = useState<Appointment | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [recommendedDoctors, setRecommendedDoctors] = useState<any[]>([]);
  const [recsLoading, setRecsLoading] = useState(true);

  const fetchRecommendations = useCallback(async () => {
    if (!user?.id) { setRecsLoading(false); return; }
    setRecsLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        const { data } = await TabeebiAPI.getRecommendedDoctors(token);
        const docs = Array.isArray(data) ? data : (data?.doctors ?? []);
        setRecommendedDoctors(docs);
      }
    } catch (err) { console.error('Recs error:', err); }
    setRecsLoading(false);
  }, [user?.id]);

  const fetchNext = useCallback(async () => {
    if (!user?.id) return;
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        const { data } = await TabeebiAPI.getNextAppointment(token);
        const a = (data && (data.appointment || data.id)) ? (data.appointment || data) : null;
        if (a) {
          if (isAppointmentPast(a.date, a.time)) { setNextAppt(null); return; }
          const dayMatch = DAYS.find(d => d.key === a.date);
          setNextAppt({
            id: a.id, doctor: a.doctor?.name || 'Unknown',
            specialty: a.doctor?.specialty || '-',
            date: dayMatch ? dayMatch.full : a.date, time: a.time,
            status: a.status, initials: a.doctor?.initials || '??',
            hue: a.doctor?.hue || 175, clinic: a.doctor?.loc || 'Clinic',
          });
        } else { setNextAppt(null); }
      }
    } catch { setNextAppt(null); }
  }, [user?.id]);

  React.useEffect(() => {
    fetchNext();
    fetchRecommendations();
  }, [fetchNext, fetchRecommendations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchNext(), fetchRecommendations()]);
    setRefreshing(false);
  }, [fetchNext, fetchRecommendations]);

  const h = new Date().getHours();
  const greeting = h < 12 ? t('good_morning') : h < 17 ? t('good_afternoon') : t('good_evening');
  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <SafeAreaView style={S.safe}>
      {/* Subtle mesh blobs — keeps white feel with turquoise hint */}
      <View style={StyleSheet.absoluteFill}>
        <View style={[S.meshBlob, { backgroundColor: '#d4f4f0', top: -80, left: -60, width: 260, height: 260 }]} />
        <View style={[S.meshBlob, { backgroundColor: '#e0f8f5', top: 200, right: -100, width: 280, height: 280 }]} />
        <View style={[S.meshBlob, { backgroundColor: '#d4f4f0', bottom: 120, left: -100, width: 260, height: 260 }]} />
      </View>

      <ScrollView
        style={S.scroll}
        contentContainerStyle={S.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            colors={[colors.teal700]} tintColor={colors.teal700} />
        }
      >
        {/* ─── HEADER ─── */}
        <View style={S.header}>
          <View style={S.headerLeft}>
            <Text style={S.greetLine}>Good morning,</Text>
            <Text style={S.greetName}>{firstName} 👋</Text>
          </View>
          <View style={S.headerRight}>
            <TouchableOpacity style={S.iconBtn} activeOpacity={0.7}>
              <Bell size={20} color={colors.ink700} strokeWidth={1.8} />
              <View style={S.notifDot} />
            </TouchableOpacity>
            <View style={S.avatar}>
              <Text style={S.avatarLetter}>{firstName[0]?.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* ─── HERO CAROUSEL (AI Card + Upcoming Appointment) ─── */}
        <HeroCarousel
          height={CARD_BG_H}
          autoplay
          autoplayDelay={4500}
          loop
          items={[
            /* Slide 1: AI Health Assistant */
            <ImageBackground
              key="ai"
              source={require('../../../assets/images/ai_card_bg.png')}
              style={{
                width: CARD_BG_W,
                height: CARD_BG_H,
                paddingHorizontal: 20,
                paddingTop: 40,
                paddingBottom: 18,
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
              imageStyle={{ borderRadius: 28 }}
            >
              <View style={S.heroTextContainer}>
                <Text style={S.heroTitle}>{t('ai_health_assistant')}</Text>
                <Text style={S.heroSub}>{t('ai_companion')}</Text>
              </View>
              <TouchableOpacity style={S.heroCta} activeOpacity={0.9}>
                <MessageSquare size={14} color={colors.teal700} strokeWidth={2.4} />
                <Text style={S.heroCtaLabel}>{t('ask_ai_btn')}</Text>
              </TouchableOpacity>
            </ImageBackground>,

            /* Slide 2: Upcoming Appointment */
            <View
              key="appt"
              style={{
                width: CARD_BG_W,
                height: CARD_BG_H,
                borderRadius: 24,
                backgroundColor: colors.teal900,
                padding: 18,
                justifyContent: nextAppt ? 'flex-start' : 'center',
              }}
            >
              {nextAppt ? (
                <>
                  <View style={S.apptHeader}>
                    <Text style={S.apptLabel}>{t('upcoming_appt')}</Text>
                    <View style={S.apptDateBadge}>
                      <View style={S.apptDateDot} />
                      <Text style={S.apptDateText}>{nextAppt.date}</Text>
                    </View>
                  </View>
                  <View style={S.apptBody}>
                    <DocAvatar initials={nextAppt.initials} hue={nextAppt.hue} size={44} rounded={12} />
                    <View style={S.apptInfo}>
                      <Text style={S.apptDoc} numberOfLines={1}>{nextAppt.doctor}</Text>
                      <Text style={S.apptSpec} numberOfLines={1}>{nextAppt.specialty}</Text>
                      <View style={S.apptMeta}>
                        <View style={S.metaChip}>
                          <Clock size={11} color="rgba(255,255,255,0.85)" />
                          <Text style={S.metaChipText}>{nextAppt.time}</Text>
                        </View>
                        <View style={S.metaChip}>
                          <MapPin size={11} color="rgba(255,255,255,0.85)" />
                          <Text style={S.metaChipText} numberOfLines={1}>{nextAppt.clinic}</Text>
                        </View>
                      </View>
                    </View>
                    <ChevronRight size={18} color="rgba(255,255,255,0.5)" />
                  </View>
                </>
              ) : (
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <Text style={[S.apptLabel, { textAlign: 'center' }]}>{t('upcoming_appt')}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '500' }}>{t('no_upcoming_appts')}</Text>
                </View>
              )}
            </View>,
          ]}
        />

        {/* ─── BROWSE BY SPECIALTY ─── */}
        <View style={S.sectionRow}>
          <Text style={S.sectionTitle}>Browse by specialty</Text>
          <Text style={S.sectionCount}>{SPECIALTIES.length} areas</Text>
        </View>

        <View style={S.grid}>
          {SPECIALTIES.map(s => {
            const active = !s.disabled;
            return (
              <TouchableOpacity
                key={s.id}
                style={[S.specCard, !active && S.specCardOff]}
                onPress={() => active && nav.navigate('DoctorList', { specialty: s })}
                activeOpacity={active ? 0.75 : 1}
              >
                {/* Icon Container (Pastel backgrounds) */}
                <View style={[
                  S.specIcon,
                  { backgroundColor: active ? s.tint : '#F5F5F5' },
                  !active && { opacity: 0.6 },
                ]}>
                  <SpecialtyIcon kind={s.icon} size={22} color={active ? s.accent : '#999'} />
                </View>

                {/* Text Content Block (Compacted to prevent any line wrapping) */}
                <View style={S.specText}>
                  <Text style={[S.specName, !active && S.specNameOff]} numberOfLines={1}>
                    {s.name}
                  </Text>
                  {active ? (
                    <View style={S.badgeActive}>
                      <Text style={S.badgeActiveText} numberOfLines={1}>Active</Text>
                    </View>
                  ) : (
                    <View style={S.badgeSoon}>
                      <Text style={S.badgeSoonText} numberOfLines={1}>Coming Soon</Text>
                    </View>
                  )}
                  {active && <Text style={S.specCity} numberOfLines={1}>Kerkük</Text>}
                </View>

                {/* Circular Arrow Button */}
                <View style={[S.specArrow, !active && { backgroundColor: '#F5F5F5' }]}>
                  <ChevronRight size={12} color={active ? colors.ink700 : '#CCC'} strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Space for the bottom navigation bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFA' },
  scroll: { flex: 1 },
  content: { paddingBottom: 16 },

  // Subtle mesh blobs
  meshBlob: {
    position: 'absolute',
    borderRadius: 160,
    opacity: 0.35,
    transform: [{ scale: 1.1 }],
  },

  // Header Section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HP,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerLeft: {},
  greetLine: { fontSize: 15, fontWeight: '500', color: colors.ink500, lineHeight: 22 },
  greetName: { fontSize: 28, fontWeight: '800', color: colors.ink900, letterSpacing: -0.6, lineHeight: 36 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(153,225,217,0.4)',
    ...Platform.select({
      ios: { shadowColor: '#1a7a73', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 3 },
    }),
  },
  notifDot: {
    position: 'absolute', top: 12, right: 13,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#10B981', borderWidth: 1.5, borderColor: '#FFF',
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: colors.teal700,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: colors.teal700, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  avatarLetter: { fontSize: 18, fontWeight: '700', color: '#FFF' },

  heroCard: {
    borderRadius: 28,
    height: '100%',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 18,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    marginLeft: 32, // Aligns button with the text/star above
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  heroCtaLabel: { fontSize: 13, fontWeight: '700', color: colors.teal700, letterSpacing: -0.1 },
  heroTextContainer: {
    paddingLeft: 32, // Pushes text closer to the star (20 + 32 = 52)
    paddingRight: 95, // Leaves enough room for the robot on the right
  },
  heroTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 11.5,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 15,
  },

  // Upcoming Appointment Card
  apptCard: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: colors.teal900,
    padding: 18,
  },
  apptHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 14,
  },
  apptLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase' },
  apptDateBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(230,166,59,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100,
  },
  apptDateDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E6A63B' },
  apptDateText: { fontSize: 12, fontWeight: '600', color: '#E6A63B' },
  apptBody: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  apptInfo: { flex: 1 },
  apptDoc: { fontSize: 16, fontWeight: '700', color: '#FFF', letterSpacing: -0.2 },
  apptSpec: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginTop: 2 },
  apptMeta: { flexDirection: 'row', gap: 12, marginTop: 10 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaChipText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },

  // Section Header
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    paddingHorizontal: HP, marginBottom: 16,
  },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: colors.ink900, letterSpacing: -0.5 },
  sectionCount: { fontSize: 14, fontWeight: '700', color: colors.teal700 },

  // Specialty Grid
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: HP, gap: GAP,
  },
  specCard: {
    width: CARD_W,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(153, 225, 217, 0.3)',
    ...Platform.select({
      ios: { shadowColor: '#1a7a73', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 2 },
    }),
  },
  specCardOff: { backgroundColor: '#F9FAFA', borderColor: 'rgba(0,0,0,0.04)' },
  specIcon: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  specText: { flex: 1, marginHorizontal: 8, gap: 2 },
  specName: { fontSize: 14, fontWeight: '800', color: colors.ink900, letterSpacing: -0.2 },
  specNameOff: { color: colors.ink400 },
  badgeActive: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F9F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  badgeActiveText: { fontSize: 9, fontWeight: '800', color: '#10B981' },
  badgeSoon: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF3E0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  badgeSoonText: { fontSize: 9, fontWeight: '800', color: '#F59E0B' },
  specCity: { fontSize: 11, fontWeight: '600', color: colors.ink400 },
  specArrow: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(153,225,217,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
});
