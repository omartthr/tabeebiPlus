import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors, shadows } from '../../theme';
import DocAvatar from '../../components/DocAvatar';
import StatusBadge from '../../components/StatusBadge';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../navigation/AppNavigator';
import { Appointment, getDays } from '../../data';
import { useNavigation } from '@react-navigation/native';
import { MainStackParamList } from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ConfirmModal from '../../components/ConfirmModal';

export default function AppointmentsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [apts, setApts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);

  const fetchApts = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('appointments')
      .select('*, doctors(id, name, specialty, initials, hue, price)')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch appointments error:', error);
    } else {
      const mapped: Appointment[] = (data ?? []).map(a => {
        const dayMatch = getDays().find(d => d.key === a.date);
        return {
          id: a.id,
          doctor: a.doctors?.name || 'Unknown',
          specialty: a.doctors?.specialty || '-',
          date: dayMatch ? dayMatch.full : a.date,
          time: a.time,
          status: a.status,
          initials: a.doctors?.initials || '??',
          hue: a.doctors?.hue || 175,
          price: a.price,
          doctorObj: a.doctors, // Navigation için lazım
        };
      });
      setApts(mapped);
    }
  }, [user?.id]);

  useEffect(() => {
    setLoading(true);
    fetchApts().finally(() => setLoading(false));
  }, [fetchApts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchApts();
    setRefreshing(false);
  }, [fetchApts]);

  const handleCancelPress = (id: string) => {
    setSelectedAptId(id);
    setCancelModalVisible(true);
  };

  const confirmCancel = async () => {
    if (!selectedAptId) return;
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', selectedAptId);
    
    setCancelModalVisible(false);
    setSelectedAptId(null);
    
    if (error) {
      Alert.alert('Hata', 'İptal işlemi başarısız oldu.');
    } else {
      fetchApts();
    }
  };

  const upcoming = apts.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const past = apts.filter(a => a.status === 'completed' || a.status === 'cancelled');
  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('my_bookings')}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        <View style={styles.tabs}>
          {[
            { id: 'upcoming' as const, label: `${t('tab_upcoming')} (${upcoming.length})` },
            { id: 'past' as const,    label: `${t('tab_past')} (${past.length})` },
          ].map(tabItem => (
            <TouchableOpacity
              key={tabItem.id}
              onPress={() => setTab(tabItem.id)}
              style={[styles.tabBtn, tab === tabItem.id && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, tab === tabItem.id && styles.tabTextActive]}>
                {tabItem.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.teal700]} tintColor={colors.teal700} />}>
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator color={colors.teal700} />
          </View>
        ) : list.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {t('no_appointments', { tab: tab === 'upcoming' ? t('tab_upcoming').toLowerCase() : t('tab_past').toLowerCase() })}
            </Text>
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
                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => navigation.navigate('Booking', { 
                    doctor: (a as any).doctorObj, 
                    appointmentId: a.id 
                  })}
                >
                  <Text style={styles.actionBtnText}>{t('reschedule')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.cancelBtn]}
                  onPress={() => handleCancelPress(a.id)}
                >
                  <Text style={[styles.actionBtnText, styles.cancelText]}>{t('cancel')}</Text>
                </TouchableOpacity>
              </View>
            )}

            {tab === 'past' && a.status === 'completed' && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>{t('view_result')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>{t('book_again')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <ConfirmModal
        visible={cancelModalVisible}
        title={t('cancel_confirm_title')}
        message={t('cancel_confirm_msg')}
        confirmText={t('yes')}
        cancelText={t('no')}
        onConfirm={confirmCancel}
        onCancel={() => setCancelModalVisible(false)}
        type="danger"
      />
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
