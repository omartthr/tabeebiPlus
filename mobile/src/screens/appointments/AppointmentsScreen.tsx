import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, Modal, TextInput, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors, shadows } from '../../theme';
import DocAvatar from '../../components/DocAvatar';
import StatusBadge from '../../components/StatusBadge';
import CustomAlert from '../../components/CustomAlert';
import { TabeebiAPI } from '../../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { Appointment, DAYS } from '../../data';
import { MainStackParamList } from '../../types/navigation';
import { isAppointmentPast } from '../../utils/date';

export default function AppointmentsScreen({ navigation }: any) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [apts, setApts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState<{
    visible: boolean; title: string; message: string; type: 'info' | 'warning' | 'danger' | 'success';
    confirmText?: string; cancelText?: string; onConfirm: () => void;
  }>({
    visible: false, title: '', message: '', type: 'info', onConfirm: () => { },
  });

  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [ratingApt, setRatingApt] = useState<Appointment | null>(null);
  const [selectedStars, setSelectedStars] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const handleOpenRateModal = (a: Appointment) => {
    setRatingApt(a);
    setSelectedStars(5);
    setReviewText('');
    setRateModalVisible(true);
  };

  const handleSubmitRating = async () => {
    if (!ratingApt) return;
    setSubmittingRating(true);

    try {
      const { error } = await TabeebiAPI.updateAppointment(ratingApt.id, {
        rating: selectedStars,
        review: reviewText || null
      });

      if (error) {
        Alert.alert(t('error'), t('rating_save_error') + error);
      } else {
        setRateModalVisible(false);
        fetchApts();
        setAlert({
          visible: true,
          title: t('thanks'),
          message: t('rating_success'),
          type: 'success',
          confirmText: t('ok'),
          onConfirm: () => setAlert(p => ({ ...p, visible: false })),
        });
      }
    } catch (err: any) {
      Alert.alert(t('error'), t('something_went_wrong') + err.message);
    }
    setSubmittingRating(false);
  };

  const fetchApts = useCallback(async () => {
    if (!user?.id) return;
    
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) return;

    const { data, error } = await TabeebiAPI.getMyAppointments(token);

    if (error) {
      console.error('Fetch appointments error:', error);
    } else {
      const appointmentsData = Array.isArray(data) ? data : (data?.appointments || []);
      const mapped: Appointment[] = appointmentsData.map((a: any) => {
        const dayMatch = DAYS.find(d => d.key === a.date);
        
        const isPastTime = isAppointmentPast(a.date, a.time);
        const finalStatus = (isPastTime && (a.status === 'pending' || a.status === 'confirmed')) ? 'completed' : a.status;

        return {
          id: a.id,
          doctor: a.doctor?.name || t('unknown_doctor'),
          specialty: a.doctor?.specialty || '-',
          date: dayMatch ? dayMatch.full : a.date,
          time: a.time,
          status: finalStatus,
          initials: a.doctor?.initials || '??',
          hue: a.doctor?.hue || 175,
          price: a.price || a.doctor?.price || 0,
          doctorId: a.doctor_id,
          rating: a.rating,
          review: a.review,
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

  const handleReschedule = (a: Appointment) => {
    if (a.status === 'confirmed') {
      setAlert({
        visible: true,
        title: t('reschedule_denied_title'),
        message: t('reschedule_denied_message'),
        type: 'warning',
        confirmText: t('ok') || 'Tamam',
        onConfirm: () => setAlert(p => ({ ...p, visible: false })),
      });
      return;
    }
    // Reconstruct doctor object for BookingScreen
    navigation.navigate('Booking', {
      doctor: {
        id: a.doctorId || '',
        name: a.doctor,
        specialty: a.specialty,
        initials: a.initials,
        hue: a.hue,
        price: a.price || 35000,
        rating: 4.8,
        reviews: 120,
        today: true,
        exp: '10 yrs',
        loc: '',
      }
    });
  };

  const handleCancel = (aptId: string, status: string) => {
    const isConfirmed = status === 'confirmed';
    setAlert({
      visible: true,
      title: t('cancel_confirm_title'),
      message: isConfirmed ? t('cancel_confirmed_warning') : t('cancel_confirm_message'),
      type: 'danger',
      confirmText: t('yes'),
      cancelText: t('no'),
      onConfirm: async () => {
        setAlert(p => ({ ...p, visible: false }));
        
        const { error } = await TabeebiAPI.updateAppointment(aptId, { status: 'cancelled' });
        
        if (!error) {
          fetchApts();
        } else {
          setAlert({
            visible: true,
            title: t('error'),
            message: error,
            type: 'danger',
            onConfirm: () => setAlert(p => ({ ...p, visible: false })),
          });
        }
      },
    });
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
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleReschedule(a)}>
                  <Text style={styles.actionBtnText}>{t('reschedule')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => handleCancel(a.id, a.status)}>
                  <Text style={[styles.actionBtnText, styles.cancelText]}>{t('cancel')}</Text>
                </TouchableOpacity>
              </View>
            )}
            {tab === 'past' && a.status === 'completed' && (
              <View style={styles.actions}>
                {a.rating && a.rating > 0 ? (
                  <View style={styles.ratedBadge}>
                    <Text style={styles.ratedText}>{t('rated_x_out_of_5', { rating: a.rating })}</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={[styles.actionBtn, styles.rateBtn]} onPress={() => handleOpenRateModal(a)}>
                    <Text style={styles.rateBtnText}>{t('rate_btn')}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Results' })}>
                  <Text style={styles.actionBtnText}>{t('view_result')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleReschedule(a)}>
                  <Text style={styles.actionBtnText}>{t('book_again')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        onConfirm={alert.onConfirm}
        onCancel={() => setAlert(p => ({ ...p, visible: false }))}
      />

      {/* Değerlendirme Modalı */}
      <Modal
        visible={rateModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRateModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('rate_doctor_title')}</Text>
            <Text style={styles.modalSub}>{t('rate_doctor_sub', { doctor: ratingApt?.doctor })}</Text>

            {/* Yıldız Seçimi */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => setSelectedStars(star)}>
                  <Text style={{ fontSize: 36, color: star <= selectedStars ? '#e6a63b' : '#ccd6dd', marginHorizontal: 4 }}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Yorum Input */}
            <TextInput
              style={styles.reviewInput}
              placeholder={t('rate_doctor_placeholder')}
              placeholderTextColor={colors.ink400}
              multiline
              numberOfLines={4}
              value={reviewText}
              onChangeText={setReviewText}
            />

            {/* Butonlar */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setRateModalVisible(false)}
                disabled={submittingRating}
              >
                <Text style={styles.cancelBtnText}>{t('cancel_btn_text')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSubmitBtn]}
                onPress={handleSubmitRating}
                disabled={submittingRating}
              >
                <Text style={styles.submitBtnText}>
                  {submittingRating ? t('saving') : t('submit_btn_text')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalBg: { flex: 1, backgroundColor: 'rgba(11,31,34,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: colors.surface, borderRadius: 24, padding: 24, gap: 16, ...shadows.card },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.ink900, textAlign: 'center' },
  modalSub: { fontSize: 13, color: colors.ink500, textAlign: 'center', fontWeight: '500' },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10 },
  reviewInput: {
    height: 100,
    backgroundColor: colors.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.ink100,
    padding: 12,
    fontSize: 13,
    color: colors.ink900,
    textAlignVertical: 'top'
  },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtn: { flex: 1, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  modalCancelBtn: { backgroundColor: colors.ink100 },
  modalSubmitBtn: { backgroundColor: colors.teal700 },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: colors.ink700 },
  submitBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  ratedBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.teal50, justifyContent: 'center', flex: 1, alignItems: 'center' },
  ratedText: { fontSize: 11, fontWeight: '700', color: colors.teal700 },
  rateBtn: { backgroundColor: colors.amber50, borderColor: colors.amber100, borderWidth: 1 },
  rateBtnText: { fontSize: 12, fontWeight: '700', color: '#b37d1f' },
});
