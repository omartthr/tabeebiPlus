import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl, Modal, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar, FileText, Bell, HelpCircle, Shield, Globe, ChevronRight, ChevronLeft, LogOut, Pencil, X, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainStackParamList, TabParamList } from '../../types/navigation';
import { useAuth } from '../../navigation/AppNavigator';
import { colors, shadows } from '../../theme';
import DocAvatar from '../../components/DocAvatar';
import { TabeebiAPI } from '../../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { changeLanguage, ALL_LANGUAGES } from '../../i18n';
import { useRTL } from '../../context/RTLContext';
import Logo from '../../components/Logo';
import { isAppointmentPast } from '../../utils/date';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<MainStackParamList>
>;

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, signOut, updateUser } = useAuth();
  const { t, i18n } = useTranslation();
  const { isRTL } = useRTL();
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;
  const [refreshing, setRefreshing] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [counts, setCounts] = useState({
    bookings: 0,
    results: 0,
    notifications: 0,
  });

  const fetchCounts = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        const [{ data: countData }, { data: aptData }] = await Promise.all([
          TabeebiAPI.getPatientCounts(token),
          TabeebiAPI.getMyAppointments(token)
        ]);
        
        if (countData) {
          let upcomingCount = countData.bookings || 0;
          
          if (aptData?.appointments) {
            upcomingCount = aptData.appointments.filter((a: any) => {
              return !isAppointmentPast(a.date, a.time) && (a.status === 'pending' || a.status === 'confirmed');
            }).length;
          }

          setCounts({
            bookings: upcomingCount,
            results: countData.results || 0,
            notifications: countData.notifications || 0,
          });
        }
      }
    } catch (e) {
      console.error('Fetch counts error:', e);
    }
  }, [user?.id]);

  React.useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const success = await updateUser({ name: newName.trim() });
    setSaving(false);
    if (success) setEditVisible(false);
  };

  const initials = (user?.name || 'Ahmed Rubaie').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();

  const [langModalVisible, setLangModalVisible] = useState(false);

  const currentLangMeta = ALL_LANGUAGES.find(l => l.code === (i18n.language || 'en').slice(0, 2))
    ?? ALL_LANGUAGES[0];

  const handleLangSelect = async (code: string) => {
    setLangModalVisible(false);
    await changeLanguage(code);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCounts();
    setRefreshing(false);
  }, [fetchCounts]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('profile_title')}</Text>
      </View>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.teal700]} />
        }
      >
        {/* Profile card */}
        <View style={styles.profileCard}>
          <DocAvatar initials={initials} hue={175} size={64} rounded={20} />
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user?.name || 'Ahmed Al-Rubaie'}</Text>
            <Text style={styles.profilePhone}>+964 {user?.phone || '750 123 4567'}</Text>
            {user?.patient_code && (
              <View style={styles.idBadge}>
                <Text style={styles.idText}>#{user.patient_code}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => { setNewName(user?.name || ''); setEditVisible(true); }}>
            <Pencil size={18} color={colors.ink700} />
          </TouchableOpacity>
        </View>


        {/* Menu group 1 */}
        <View style={styles.menuCard}>
          {[
            { Icon: Calendar,  bg: colors.teal50,    iconColor: colors.teal700, label: t('my_bookings'),     sub: `${counts.bookings} ${t('upcoming')}`,  screen: 'Appointments' as const },
            { Icon: FileText,  bg: colors.amber50,   iconColor: '#b37d1f',       label: t('my_results'),     sub: `${counts.results} ${t('reports')}`,   screen: 'Results' as const },
            { Icon: Bell,      bg: '#ede7f5',         iconColor: '#5b3b9f',       label: t('notifications'),  sub: `${counts.notifications} ${t('unread')}`,    screen: 'Notifications' as const },
          ].map((m, i, arr) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuRow, i < arr.length - 1 && styles.menuRowBorder]}
              onPress={() => navigation.navigate(m.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: m.bg }]}>
                <m.Icon size={20} color={m.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>{m.label}</Text>
                <Text style={styles.menuSub}>{m.sub}</Text>
              </View>
              <ArrowIcon size={18} color={colors.ink300} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Menu group 2 */}
        <View style={styles.menuCard}>
          {[
            { Icon: HelpCircle,    label: t('help_center'),       onPress: () => navigation.navigate('Help') },
            { Icon: Shield,        label: t('privacy'),            onPress: () => navigation.navigate('Privacy') },
            { Icon: Globe,         label: t('language'),           right: currentLangMeta.nativeLabel, onPress: () => setLangModalVisible(true) },
          ].map((m, i, arr) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuRow, i < arr.length - 1 && styles.menuRowBorder]}
              onPress={m.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.ink100 }]}>
                <m.Icon size={20} color={colors.ink700} />
              </View>
              <Text style={[styles.menuLabel, { flex: 1 }]}>{m.label}</Text>
              {m.right && <Text style={styles.menuRight}>{m.right}</Text>}
              <ArrowIcon size={18} color={colors.ink300} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={signOut} activeOpacity={0.8}>
          <LogOut size={18} color={colors.red500} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <Logo variant="light" width={120} height={28} showText={true} />
          <Text style={[styles.version, { marginTop: 4 }]}>v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('edit_profile')}</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <X size={24} color={colors.ink900} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('edit_name')}</Text>
              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                placeholder={t('name_placeholder')}
                placeholderTextColor={colors.ink300}
                autoFocus
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, saving && { opacity: 0.8 }]} 
              onPress={handleSaveName}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>{t('save_changes')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal visible={langModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLangModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('language')}</Text>
              <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                <X size={24} color={colors.ink900} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 8 }}>
              {ALL_LANGUAGES.map((lang) => {
                const isSelected = currentLangMeta.code === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.langRow, isSelected && styles.langRowActive]}
                    onPress={() => handleLangSelect(lang.code)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.langFlag}>{lang.flag}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.langNative, isSelected && styles.langNativeActive]}>
                        {lang.nativeLabel}
                      </Text>
                      <Text style={styles.langEnglish}>{lang.label}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.langCheck}>
                        <Check size={14} color="#fff" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.langNote}>
              {t('language')} · EN | TR | العربية | کوردی
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { padding: 20, paddingBottom: 14 },
  title: { fontSize: 28, fontWeight: '700', color: colors.ink900, letterSpacing: -0.5 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  content: { flex: 1, paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 18, backgroundColor: colors.surface, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(11,31,34,0.03)',
    ...shadows.card,
  },
  profileName: { fontSize: 17, fontWeight: '700', color: colors.ink900, letterSpacing: -0.2 },
  profilePhone: { fontSize: 13, color: colors.ink500, fontWeight: '500', marginTop: 2 },
  editBtn: {
    width: 40, height: 40, borderRadius: 999,
    backgroundColor: colors.ink100, alignItems: 'center', justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, padding: 14, backgroundColor: colors.surface, borderRadius: 20,
    alignItems: 'center', ...shadows.card,
    borderWidth: 1, borderColor: 'rgba(11,31,34,0.03)',
  },
  statNum: { fontSize: 22, fontWeight: '700', color: colors.teal700, letterSpacing: -0.5 },
  statLabel: {
    fontSize: 11, fontWeight: '600', color: colors.ink500,
    textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2,
  },
  menuCard: {
    backgroundColor: colors.surface, borderRadius: 20,
    overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(11,31,34,0.03)',
    ...shadows.card,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, backgroundColor: colors.surface,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.ink100 },
  menuIcon: {
    width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { fontSize: 14, fontWeight: '600', color: colors.ink900 },
  menuSub: { fontSize: 12, color: colors.ink500, fontWeight: '500' },
  menuRight: { fontSize: 13, color: colors.ink500, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 54, borderRadius: 100, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.red100,
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: colors.red500 },
  version: { textAlign: 'center', fontSize: 11, color: colors.ink400, fontWeight: '600' },
  idBadge: { marginTop: 4, alignSelf: 'flex-start', backgroundColor: colors.teal50, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  idText: { fontSize: 11, fontWeight: '700', color: colors.teal700, letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(11,31,34,0.4)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: colors.surface, borderRadius: 28, padding: 24, ...shadows.float },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.ink900, letterSpacing: -0.5 },
  inputGroup: { marginBottom: 24 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: colors.ink500, letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' },
  input: { 
    height: 54, backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 16,
    fontSize: 16, fontWeight: '600', color: colors.ink900, borderWidth: 1, borderColor: colors.ink100
  },
  saveBtn: { 
    height: 54, backgroundColor: colors.teal700, borderRadius: 100,
    alignItems: 'center', justifyContent: 'center', ...shadows.button
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Language modal
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: colors.ink100,
  },
  langRowActive: {
    borderColor: colors.teal700,
    backgroundColor: colors.teal50,
  },
  langFlag: { fontSize: 24 },
  langNative: { fontSize: 16, fontWeight: '700', color: colors.ink900 },
  langNativeActive: { color: colors.teal700 },
  langEnglish: { fontSize: 12, color: colors.ink400, fontWeight: '500', marginTop: 1 },
  langCheck: {
    width: 26,
    height: 26,
    borderRadius: 99,
    backgroundColor: colors.teal700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langNote: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 11,
    color: colors.ink400,
    fontWeight: '500',
  },
});
