import React, { useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Clock, MapPin, ChevronRight, BadgeCheck, Activity, Plus, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { MainStackParamList } from '../../types/navigation';
import { useAuth } from '../../navigation/AppNavigator';
import { colors, shadows } from '../../theme';
import { SPECIALTIES, APPOINTMENTS_UPCOMING } from '../../data';
import DocAvatar from '../../components/DocAvatar';
import SpecialtyIcon from '../../components/SpecialtyIcon';
import DoctorCard from '../../components/DoctorCard';
import Logo from '../../components/Logo';

type Nav = NativeStackNavigationProp<MainStackParamList>;

import { supabase } from '../../lib/supabase';
import { Appointment, DAYS } from '../../data';

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [nextAppt, setNextAppt] = useState<Appointment | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [recommendedDoctors, setRecommendedDoctors] = useState<any[]>([]);
  const [recsLoading, setRecsLoading] = useState(true);

  const fetchRecommendations = useCallback(async () => {
    if (!user?.id) {
      setRecsLoading(false);
      return;
    }
    setRecsLoading(true);

    try {
      const { data: pastApts } = await supabase
        .from('appointments')
        .select('rating, doctors(specialty)')
        .eq('patient_id', user.id)
        .gte('rating', 4);

      const preferredSpecs = new Set<string>();
      if (pastApts) {
        pastApts.forEach((apt: any) => {
          if (apt.doctors?.specialty) {
            preferredSpecs.add(apt.doctors.specialty);
          }
        });
      }

      const { data: docs } = await supabase
        .from('doctors')
        .select('*')
        .eq('is_active', true);

      if (!docs) {
        setRecommendedDoctors([]);
        setRecsLoading(false);
        return;
      }

      const scored = docs.map((d: any) => {
        let score = (d.rating || 4.5) * 10;
        score += Math.log((d.reviews || 0) + 1) * 5;
        
        if (preferredSpecs.has(d.specialty)) {
          score += 30;
        }
        if (d.today) {
          score += 15;
        }

        return {
          id: d.id,
          name: d.name,
          specialty: d.specialty,
          initials: d.initials || d.name.slice(0, 2).toUpperCase(),
          hue: d.hue || 175,
          rating: Number(d.rating) || 4.5,
          reviews: d.reviews || 0,
          price: d.price || 35000,
          loc: d.loc || '',
          exp: d.exp || '10 Yıl',
          today: d.today,
          registration_id: d.registration_id,
          location_lat: d.location_lat,
          location_lng: d.location_lng,
          recommendationScore: score
        };
      });

      const top3 = scored
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, 3);

      setRecommendedDoctors(top3);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
    setRecsLoading(false);
  }, [user?.id]);

  const fetchNext = useCallback(async () => {
    if (!user?.id) return;
    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const { data } = await supabase
      .from('appointments')
      .select('*, doctors(name, specialty, initials, hue, loc)')
      .eq('patient_id', user.id)
      .in('status', ['pending', 'confirmed'])
      .gte('date', localDate)
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (data) {
      const dayMatch = DAYS.find(d => d.key === data.date);
      setNextAppt({
        id: data.id,
        doctor: data.doctors?.name || 'Unknown',
        specialty: data.doctors?.specialty || '-',
        date: dayMatch ? dayMatch.full : data.date,
        time: data.time,
        status: data.status,
        initials: data.doctors?.initials || '??',
        hue: data.doctors?.hue || 175,
        clinic: data.doctors?.loc || 'Clinic',
      });
    } else {
      setNextAppt(null);
    }
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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('good_morning') : hour < 17 ? t('good_afternoon') : t('good_evening');
  const firstName = user?.name?.split(' ')[0] || 'Ahmed';
  const next = nextAppt;

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greet}>{greeting},</Text>
          <Text style={styles.name}>{firstName} 👋</Text>
        </View>
        <Logo variant="light" width={160} height={36} showText={true} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.teal700]} tintColor={colors.teal700} />}>
        {/* Upcoming appointment card */}
        {next && (
          <TouchableOpacity style={styles.apptCard} activeOpacity={0.9}>
            <View style={styles.apptTop}>
              <Text style={styles.apptLabel}>{t('upcoming_appt')}</Text>
              <View style={styles.dateBadge}>
                <View style={[styles.badgeDot, { backgroundColor: '#e6a63b' }]} />
                <Text style={styles.dateBadgeText}>{next.date}</Text>
              </View>
            </View>
            <View style={styles.apptRow}>
              <DocAvatar initials={next.initials} hue={next.hue} size={52} rounded={14} />
              <View style={styles.apptInfo}>
                <Text style={styles.apptDoctor}>{next.doctor}</Text>
                <Text style={styles.apptSpec}>{next.specialty}</Text>
                <View style={styles.apptMeta}>
                  <View style={styles.metaItem}>
                    <Clock size={14} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.metaText}>{next.time}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MapPin size={14} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.metaText}>{next.clinic}</Text>
                  </View>
                </View>
              </View>
              <ChevronRight size={20} color="rgba(255,255,255,0.6)" />
            </View>
          </TouchableOpacity>
        )}

        {/* Specialty section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('browse_specialty')}</Text>
          <Text style={styles.sectionSub}>{t('areas_count')}</Text>
        </View>

        <View style={styles.grid}>
          {SPECIALTIES.map(s => (
            <TouchableOpacity
              key={s.id}
              style={[styles.specialtyCard, s.disabled && styles.specialtyCardDisabled]}
              onPress={() => !s.disabled && navigation.navigate('DoctorList', { specialty: s })}
              activeOpacity={s.disabled ? 1 : 0.8}
            >
              <View style={[styles.specialtyIcon, { backgroundColor: s.tint }, s.disabled && styles.iconDisabled]}>
                <SpecialtyIcon kind={s.icon} size={26} color={s.accent} />
              </View>
              <View style={styles.specialtyText}>
                <Text style={[styles.specialtyName, s.disabled && styles.textDisabled]}>{s.name}</Text>
                <Text style={[styles.specialtyCount, s.disabled && styles.textDisabled]}>{s.sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recommended Doctors section */}
        {recommendedDoctors.length > 0 && (
          <View style={{ marginTop: 24, paddingBottom: 16 }}>
            <View style={styles.recsHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={18} color={colors.teal700} strokeWidth={2.5} />
                <Text style={styles.sectionTitle}>{t('recommended_doctors')}</Text>
              </View>
              <Text style={styles.recsSub}>{t('recommended_subtitle')}</Text>
            </View>
            <View style={styles.recsList}>
              {recommendedDoctors.map(doc => (
                <DoctorCard
                  key={doc.id}
                  doctor={doc}
                  onPress={() => navigation.navigate('DoctorDetail', { doctor: doc })}
                />
              ))}
            </View>
          </View>
        )}
 
        {/* Trust strip */}
        <View style={styles.trustStrip}>
          <View style={styles.trustIcon}>
            <BadgeCheck size={22} color="#b37d1f" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.trustTitle}>{t('trust_title')}</Text>
            <Text style={styles.trustSub}>{t('trust_sub')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  greet: { fontSize: 13, color: colors.ink500, fontWeight: '600' },
  name: { fontSize: 20, fontWeight: '700', color: colors.ink900, letterSpacing: -0.4 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 0 },

  apptCard: {
    backgroundColor: '#0d7377',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#0d7377',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  apptTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  apptLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: 'rgba(255,255,255,0.7)',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(230,166,59,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  dateBadgeText: { fontSize: 12, fontWeight: '600', color: '#e6a63b' },
  apptRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  apptInfo: { flex: 1 },
  apptDoctor: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
  apptSpec: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginTop: 2 },
  apptMeta: { flexDirection: 'row', gap: 12, marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.ink900, letterSpacing: -0.2 },
  sectionSub: { fontSize: 13, fontWeight: '500', color: colors.ink400 },
  recsHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    marginBottom: 14,
  },
  recsSub: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.ink400,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  specialtyCard: {
    width: '47.5%',
    height: 140,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(11,31,34,0.04)',
    ...shadows.card,
  },
  specialtyCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#fafafa',
    borderColor: 'transparent',
  },
  iconDisabled: {
    backgroundColor: '#eee',
    opacity: 0.5,
  },
  textDisabled: {
    color: colors.ink400,
  },
  specialtyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialtyText: { marginTop: 'auto' },
  specialtyName: { fontSize: 15, fontWeight: '700', color: colors.ink900, letterSpacing: -0.2 },
  specialtyCount: { fontSize: 12, color: colors.ink500, fontWeight: '500', marginTop: 2 },

  recsList: { gap: 12, marginTop: 12 },
  trustStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  trustIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.amber50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustTitle: { fontSize: 13, fontWeight: '700', color: colors.ink900 },
  trustSub: { fontSize: 12, color: colors.ink500, fontWeight: '500' },
});
