import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar, FileText, Bell, HelpCircle, Shield, MessageCircle, ChevronRight, LogOut, Pencil } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { MainStackParamList } from '../../types/navigation';
import { useAuth } from '../../navigation/AppNavigator';
import { colors, shadows } from '../../theme';
import DocAvatar from '../../components/DocAvatar';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const initials = (user?.name || 'Ahmed Rubaie').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'tr' : 'en';
    i18n.changeLanguage(newLang);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise<void>(r => setTimeout(r, 600));
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('profile_title')}</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.teal700]} tintColor={colors.teal700} />}>

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
          <TouchableOpacity style={styles.editBtn}>
            <Pencil size={18} color={colors.ink700} />
          </TouchableOpacity>
        </View>


        {/* Menu group 1 */}
        <View style={styles.menuCard}>
          {[
            { Icon: Calendar,  bg: colors.teal50,    iconColor: colors.teal700, label: t('my_bookings'),     sub: `2 ${t('upcoming')}`,  screen: 'MainTabs' as const },
            { Icon: FileText,  bg: colors.amber50,   iconColor: '#b37d1f',       label: t('my_results'),     sub: `3 ${t('reports')}`,   screen: 'MainTabs' as const },
            { Icon: Bell,      bg: '#ede7f5',         iconColor: '#5b3b9f',       label: t('notifications'),  sub: `2 ${t('unread')}`,    screen: 'MainTabs' as const },
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
              <ChevronRight size={18} color={colors.ink300} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Menu group 2 */}
        <View style={styles.menuCard}>
          {[
            { Icon: HelpCircle,    label: t('help_center'),       onPress: () => navigation.navigate('Help') },
            { Icon: Shield,        label: t('privacy'), onPress: undefined },
            { Icon: MessageCircle, label: t('language'),           right: i18n.language === 'tr' ? t('turkish') : t('english'), onPress: toggleLanguage },
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
              <ChevronRight size={18} color={colors.ink300} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={signOut} activeOpacity={0.8}>
          <LogOut size={18} color={colors.red500} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Tabeebi+ · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { padding: 20, paddingBottom: 14 },
  title: { fontSize: 28, fontWeight: '700', color: colors.ink900, letterSpacing: -0.5 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
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
});
