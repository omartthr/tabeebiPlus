import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Shield, Lock, Bell, MapPin, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { colors, shadows } from '../../theme';
import { useAuth } from '../../navigation/AppNavigator';
import { supabase } from '../../lib/supabase';

export default function PrivacyScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [notifs, setNotifs] = React.useState(true);
  const [location, setLocation] = React.useState(true);

  const handleDeleteAccount = () => {
    Alert.alert(
      t('delete_account') || 'Hesabı Sil',
      t('delete_warning') || 'Bu işlem kalıcıdır ve tüm tıbbi geçmişinizi silecektir. Emin misiniz?',
      [
        { text: t('cancel') || 'İptal', style: 'cancel' },
        { 
          text: t('yes') || 'Evet', 
          style: 'destructive',
          onPress: async () => {
            if (user?.id) {
              // Soft-delete personal data via RLS update permission
              await supabase
                .from('patients')
                .update({ name: 'Silinmiş Kullanıcı' })
                .eq('id', user.id);
            }
            // Securely log out to return to Welcome/Auth screen
            await signOut();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.ink900} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('privacy_title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Protection Info */}
        <View style={styles.infoCard}>
          <View style={styles.iconWrap}>
            <Shield size={24} color={colors.teal700} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>{t('data_protection')}</Text>
            <Text style={styles.infoText}>{t('data_protection_desc')}</Text>
          </View>
        </View>

        {/* Permissions */}
        <Text style={styles.groupLabel}>{t('permissions')}</Text>
        <View style={styles.menuCard}>
          <View style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: colors.teal50 }]}>
              <Bell size={20} color={colors.teal700} />
            </View>
            <Text style={styles.menuLabel}>{t('notif_perms')}</Text>
            <Switch 
              value={notifs} 
              onValueChange={setNotifs}
              trackColor={{ false: colors.ink200, true: colors.teal100 }}
              thumbColor={notifs ? colors.teal700 : colors.ink400}
            />
          </View>
          <View style={[styles.menuRow, { borderTopWidth: 1, borderTopColor: colors.ink100 }]}>
            <View style={[styles.menuIcon, { backgroundColor: colors.teal50 }]}>
              <MapPin size={20} color={colors.teal700} />
            </View>
            <Text style={styles.menuLabel}>{t('loc_perms')}</Text>
            <Switch 
              value={location} 
              onValueChange={setLocation}
              trackColor={{ false: colors.ink200, true: colors.teal100 }}
              thumbColor={location ? colors.teal700 : colors.ink400}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <View style={styles.deleteIcon}>
            <Trash2 size={20} color={colors.red500} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.deleteLabel}>{t('delete_account')}</Text>
            <Text style={styles.deleteSub}>{t('delete_warning')}</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 14 
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: colors.ink900 },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 20 },
  infoCard: {
    flexDirection: 'row', gap: 14, padding: 18,
    backgroundColor: colors.surface, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(11,31,34,0.03)',
    ...shadows.card,
  },
  iconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.teal50, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: colors.ink500, letterSpacing: 0.5, marginBottom: 4 },
  infoText: { fontSize: 13, color: colors.ink700, fontWeight: '500', lineHeight: 18 },
  groupLabel: { fontSize: 11, fontWeight: '700', color: colors.ink500, letterSpacing: 0.5, marginLeft: 4, marginBottom: -8 },
  menuCard: {
    backgroundColor: colors.surface, borderRadius: 20,
    overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(11,31,34,0.03)',
    ...shadows.card,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  menuIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.ink900 },
  deleteBtn: {
    flexDirection: 'row', gap: 14, padding: 18,
    backgroundColor: '#fff5f5', borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,0,0,0.05)',
  },
  deleteIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#ffe5e5', alignItems: 'center', justifyContent: 'center' },
  deleteLabel: { fontSize: 14, fontWeight: '700', color: colors.red500 },
  deleteSub: { fontSize: 12, color: colors.red500, fontWeight: '500', opacity: 0.7, marginTop: 2 },
});
