import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { User, Shield } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../types/navigation';
import TopBar from '../../components/TopBar';
import { colors } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const valid = name.trim().length >= 2 && phone.replace(/\D/g, '').length >= 10;

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title={t('create_account')} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t('lets_know_you')}</Text>
            <Text style={styles.subtitle}>{t('register_subtitle')}</Text>
          </View>

          <View style={styles.fields}>
            <View>
              <Text style={styles.label}>{t('full_name')}</Text>
              <View style={styles.inputWrap}>
                <User size={20} color={colors.ink400} />
                <TextInput
                  style={styles.input}
                  placeholder={t('name_placeholder')}
                  placeholderTextColor={colors.ink400}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View>
              <Text style={styles.label}>{t('phone_number')}</Text>
              <View style={styles.inputWrap}>
                <View style={styles.prefixRow}>
                  <Text style={styles.flag}>🇮🇶</Text>
                  <Text style={styles.prefix}>+964</Text>
                </View>
                <View style={styles.divider} />
                <TextInput
                  style={styles.input}
                  placeholder="750 123 4567"
                  placeholderTextColor={colors.ink400}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            <View style={styles.notice}>
              <Shield size={18} color={colors.teal700} />
              <Text style={styles.noticeText}>{t('privacy_notice')}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btnPrimary, !valid && styles.btnDisabled]}
            disabled={!valid}
            onPress={() => navigation.navigate('OTP', { name, phone })}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>{t('continue_btn')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 24 },
  header: { gap: 8 },
  title: { fontSize: 28, fontWeight: '700', color: colors.ink900, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 22, fontWeight: '500', color: colors.ink700 },
  fields: { gap: 14 },
  label: { fontSize: 11, fontWeight: '600', color: colors.ink500, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.ink200,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: { flex: 1, fontSize: 16, fontWeight: '500', color: colors.ink900 },
  prefixRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flag: { fontSize: 18 },
  prefix: { fontSize: 15, fontWeight: '600', color: colors.ink900 },
  divider: { width: 1, height: 22, backgroundColor: colors.ink200, marginRight: 4 },
  notice: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.teal50,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(13,115,119,0.08)',
  },
  noticeText: { flex: 1, fontSize: 13, color: colors.teal800, fontWeight: '500', lineHeight: 18 },
  footer: { padding: 20, paddingBottom: 24, backgroundColor: colors.bg },
  btnPrimary: {
    height: 54,
    borderRadius: 100,
    backgroundColor: colors.teal700,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0d7377',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  btnDisabled: { backgroundColor: colors.ink200, shadowOpacity: 0 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
