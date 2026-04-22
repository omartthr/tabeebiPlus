import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock } from 'lucide-react-native';
import { colors, shadows } from '../../theme';
import { APPOINTMENTS_UPCOMING, APPOINTMENTS_PAST } from '../../data';
import DocAvatar from '../../components/DocAvatar';
import StatusBadge from '../../components/StatusBadge';

export default function AppointmentsScreen() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const list = tab === 'upcoming' ? APPOINTMENTS_UPCOMING : APPOINTMENTS_PAST;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>My bookings</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        <View style={styles.tabs}>
          {[
            { id: 'upcoming' as const, label: `Upcoming (${APPOINTMENTS_UPCOMING.length})` },
            { id: 'past' as const,    label: `Past (${APPOINTMENTS_PAST.length})` },
          ].map(t => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setTab(t.id)}
              style={[styles.tabBtn, tab === t.id && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {list.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No {tab} appointments yet.</Text>
          </View>
        )}
        {list.map(a => (
          <View key={a.id} style={styles.card}>
            <View style={styles.cardTop}>
              <DocAvatar initials={a.initials} hue={a.hue} size={48} rounded={12} />
              <View style={{ flex: 1 }}>
                <Text style={styles.doctorName}>{a.doctor}</Text>
                <Text style={styles.specialty}>{a.specialty}</Text>
              </View>
              <StatusBadge status={a.status} />
            </View>

            <View style={styles.dateRow}>
              <Calendar size={16} color={colors.teal700} />
              <Text style={styles.dateText}>{a.date}</Text>
              <View style={styles.sep} />
              <Clock size={16} color={colors.teal700} />
              <Text style={styles.dateText}>{a.time}</Text>
            </View>

            {tab === 'upcoming' && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>Reschedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]}>
                  <Text style={[styles.actionBtnText, styles.cancelText]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
            {tab === 'past' && a.status === 'completed' && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>View result</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>Book again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: colors.ink900, letterSpacing: -0.5 },
  tabsWrap: { paddingHorizontal: 20, paddingBottom: 14 },
  tabs: {
    flexDirection: 'row', backgroundColor: colors.ink100,
    borderRadius: 12, padding: 4,
  },
  tabBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: '#0b1f22', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  tabText: { fontSize: 13, fontWeight: '700', color: colors.ink500 },
  tabTextActive: { color: colors.ink900 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: colors.ink500 },
  card: {
    backgroundColor: colors.surface, borderRadius: 20,
    padding: 14, borderWidth: 1, borderColor: 'rgba(11,31,34,0.03)',
    ...shadows.card,
  },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 },
  doctorName: { fontSize: 14, fontWeight: '700', color: colors.ink900 },
  specialty: { fontSize: 12, color: colors.ink500, fontWeight: '500' },
  dateRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, backgroundColor: colors.bg, borderRadius: 12,
  },
  dateText: { fontSize: 13, fontWeight: '600', color: colors.ink700 },
  sep: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.ink300 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: {
    flex: 1, height: 42, borderRadius: 100,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.ink200,
    alignItems: 'center', justifyContent: 'center',
  },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: colors.ink900 },
  cancelBtn: { borderColor: colors.red100 },
  cancelText: { color: colors.red500 },
});
