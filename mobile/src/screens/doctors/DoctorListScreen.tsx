import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Filter } from 'lucide-react-native';
import { MainStackParamList } from '../../types/navigation';
import { colors } from '../../theme';
import { DOCTORS } from '../../data';
import TopBar from '../../components/TopBar';
import DoctorCard from '../../components/DoctorCard';

type Props = NativeStackScreenProps<MainStackParamList, 'DoctorList'>;

const FILTERS = [
  { id: 'all',   label: 'All doctors' },
  { id: 'today', label: 'Available today' },
  { id: 'top',   label: 'Top rated' },
  { id: 'near',  label: 'Nearby' },
];

export default function DoctorListScreen({ route, navigation }: Props) {
  const { specialty } = route.params;
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'today' ? DOCTORS.filter(d => d.today) : DOCTORS;

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar
        title={specialty.name}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity style={styles.filterBtn}>
            <Filter size={18} color={colors.ink700} />
          </TouchableOpacity>
        }
      />

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map(c => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setFilter(c.id)}
            style={[styles.chip, filter === c.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === c.id && styles.chipTextActive]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.count}>{filtered.length} doctors</Text>
        {filtered.map(d => (
          <DoctorCard
            key={d.id}
            doctor={d}
            onPress={() => navigation.navigate('DoctorDetail', { doctor: d })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  filterBtn: {
    width: 40, height: 40, borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.ink100,
    alignItems: 'center', justifyContent: 'center',
  },
  filterBar: { flexGrow: 0 },
  filterContent: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.ink200,
  },
  chipActive: { backgroundColor: colors.teal700, borderWidth: 0 },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.ink700 },
  chipTextActive: { color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 12 },
  count: { fontSize: 13, fontWeight: '500', color: colors.ink500, marginBottom: 2 },
});
