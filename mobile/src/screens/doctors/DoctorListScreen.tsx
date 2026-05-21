import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Filter } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { MainStackParamList } from '../../types/navigation';
import { colors } from '../../theme';
import { Doctor } from '../../data';
import { supabase } from '../../lib/supabase';
import TopBar from '../../components/TopBar';
import DoctorCard from '../../components/DoctorCard';

type Props = NativeStackScreenProps<MainStackParamList, 'DoctorList'>;

export default function DoctorListScreen({ route, navigation }: Props) {
  const { specialty } = route.params;
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('doctors')
      .select('*')
      .eq('is_active', true)
      .in('specialty', specialty.dbNames || [])
      .then(({ data }) => {
        const mapped: Doctor[] = (data ?? []).map(d => ({
          id: d.id,
          name: d.name,
          specialty: d.specialty,
          rating: Number(d.rating) || 0,
          reviews: d.reviews || 0,
          price: d.price || 0,
          today: d.today ?? false,
          exp: d.exp || '1 yrs',
          loc: d.loc || '',
          initials: d.initials || d.name.slice(0, 2).toUpperCase(),
          hue: d.hue || 175,
          registration_id: d.registration_id || null,
          location_address: d.location_address || null,
          location_lat: d.location_lat || null,
          location_lng: d.location_lng || null,
        }));
        setDoctors(mapped);
        setLoading(false);
      });
  }, []);

  const FILTERS = [
    { id: 'all',   label: t('all_doctors') },
    { id: 'today', label: t('available_today') },
    { id: 'top',   label: t('top_rated') },
    { id: 'near',  label: t('nearby') },
  ];

  const filtered = useMemo(() => {
    let list = [...doctors];
    if (filter === 'today') {
      list = list.filter(d => d.today);
    } else if (filter === 'top') {
      list = list.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
    } else if (filter === 'near') {
      list = list.sort((a, b) => (parseInt(b.exp) || 0) - (parseInt(a.exp) || 0));
    }

    if (sortOrder === 'asc') {
      list = list.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    } else if (sortOrder === 'desc') {
      list = list.sort((a, b) => b.name.localeCompare(a.name, 'tr'));
    }
    return list;
  }, [doctors, filter, sortOrder]);

  const handleFilterPress = () => {
    Alert.alert(
      'Sıralama Seçenekleri',
      'Doktorları nasıl sıralamak istersiniz?',
      [
        { text: 'Varsayılan', onPress: () => setSortOrder('none') },
        { text: 'A - Z (İsim)', onPress: () => setSortOrder('asc') },
        { text: 'Z - A (İsim)', onPress: () => setSortOrder('desc') },
        { text: t('cancel') || 'İptal', style: 'cancel' }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar
        title={specialty.name}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity style={styles.filterBtn} onPress={handleFilterPress}>
            <Filter size={18} color={colors.ink700} />
          </TouchableOpacity>
        }
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filterContent}>
        {FILTERS.map(c => (
          <TouchableOpacity key={c.id} onPress={() => setFilter(c.id)} style={[styles.chip, filter === c.id && styles.chipActive]}>
            <Text style={[styles.chipText, filter === c.id && styles.chipTextActive]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.teal700} size="large" />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.count}>{t('doctors_count', { count: filtered.length })}</Text>
          {filtered.map(d => (
            <DoctorCard key={d.id} doctor={d} onPress={() => navigation.navigate('DoctorDetail', { doctor: d })} />
          ))}
          {filtered.length === 0 && (
            <Text style={{ textAlign: 'center', color: colors.ink400, marginTop: 40 }}>Henüz kayıtlı doktor yok.</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  filterBtn: { width: 40, height: 40, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.ink100, alignItems: 'center', justifyContent: 'center' },
  filterBar: { flexGrow: 0 },
  filterContent: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.ink200 },
  chipActive: { backgroundColor: colors.teal700, borderWidth: 0 },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.ink700 },
  chipTextActive: { color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 12 },
  count: { fontSize: 13, fontWeight: '500', color: colors.ink500, marginBottom: 2 },
});
