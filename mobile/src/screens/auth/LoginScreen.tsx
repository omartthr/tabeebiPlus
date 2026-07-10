import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../theme';
import { TabeebiAPI } from '../../lib/api';
import TopBar from '../../components/TopBar';
import Logo from '../../components/Logo';
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [checking, setChecking] = useState(false);
  const valid = phone.replace(/\D/g, '').length >= 10;

  const handleContinue = async () => {
    setChecking(true);
    const cleanPhone = phone.replace(/\D/g, '');

    const { data: patient, error } = await TabeebiAPI.getPatient(cleanPhone);

    setChecking(false);

    if (error) {
      Alert.alert(t('error', 'Error'), t('something_went_wrong', 'Something went wrong: ') + error);
      return;
    }

    if (!patient) {
      Alert.alert(
        t('account_not_found'),
        t('account_not_found_desc'),
        [
          { text: t('register_link'), onPress: () => navigation.navigate('Register') },
          { text: t('ok'), style: 'cancel' },
        ]
      );
      return;
    }

    navigation.navigate('OTP', { phone: cleanPhone, isLogin: true });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title={t('login_title')} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Logo variant="light" width={240} height={60} />
              <Text style={styles.subtitle}>{t('login_subtitle')}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('phone_number')}</Text>
              <TextInput
                style={styles.input}
                placeholder="750 123 4567"
                keyboardType="phone-pad"
                placeholderTextColor={colors.ink400}
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.btnPrimary, (!valid || checking) && styles.btnDisabled]}
              disabled={!valid || checking}
              onPress={handleContinue}
            >
              {checking
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>{t('continue_btn')}</Text>
              }
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>{t('no_account')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>{t('register_link')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  subtitle: { fontSize: 15, color: colors.ink500, textAlign: 'center', paddingHorizontal: 20, marginTop: 12 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink700, marginBottom: 8, marginLeft: 4 },
  input: {
    height: 56,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.ink200,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.ink900,
  },
  footer: { padding: 24, backgroundColor: colors.bg },
  btnPrimary: {
    height: 54,
    borderRadius: 100,
    backgroundColor: colors.teal700,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1a7a73',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  btnDisabled: { backgroundColor: colors.ink200, shadowOpacity: 0 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText: { color: colors.ink500, fontSize: 14 },
  registerLink: { color: colors.teal700, fontWeight: '600', fontSize: 14 },
});
