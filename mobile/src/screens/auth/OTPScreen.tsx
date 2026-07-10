import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, Keyboard, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import TopBar from '../../components/TopBar';
import { colors } from '../../theme';
import { TabeebiAPI } from '../../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

export default function OTPScreen({ route, navigation }: Props) {
  const { name, phone, isLogin } = route.params;
  const { signIn } = useAuth();
  const { t } = useTranslation();

  const [digits, setDigits] = useState(['', '', '', '']);
  const [seconds, setSeconds] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState(false);
  const refs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    sendOtp();
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const sendOtp = async () => {
    setSending(true);
    try {
      const cleanedPhone = phone.replace(/\D/g, '').replace(/^0/, '');
      const { error } = await TabeebiAPI.sendOtp(cleanedPhone);
      if (error) Alert.alert('Hata', 'WhatsApp kodu gönderilemedi. Tekrar dene.');
    } catch {
      Alert.alert('Hata', 'Bağlantı hatası.');
    } finally {
      setSending(false);
    }
  };

  const handleResend = () => {
    setSeconds(60);
    setDigits(['', '', '', '']);
    refs.current[0]?.focus();
    sendOtp();
  };

  const full = digits.join('');
  const valid = full.length === 4;

  const handleVerify = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const cleanedPhone = phone.replace(/\D/g, '').replace(/^0/, '');
      const { data, error } = await TabeebiAPI.verifyOtp(cleanedPhone, full);

      // Backend'den token geldi mi kontrol et
      if (error || !data?.token) {
        Alert.alert('Hatalı Kod', 'Girdiğin kod yanlış veya süresi dolmuş.');
        setDigits(['', '', '', '']);
        refs.current[0]?.focus();
        setSubmitting(false);
        return;
      }

      // verifyOtp'den gelen token ve kullanıcıyı direkt kaydet (ikinci istek yok!)
      await AsyncStorage.setItem('auth_token', data.token);
      const p = data.patient;
      await signIn({
        id: p.id,
        phone: p.phone,
        name: p.name || name || '',
        avatar_hue: p.avatar_hue,
        is_registered: p.is_registered,
        token: data.token,
      });

    } catch (e: any) {
      Alert.alert('Hata', 'Doğrulama sırasında bir hata oluştu: ' + e?.message);
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (valid && !submitting) {
      Keyboard.dismiss();
      const timer = setTimeout(() => handleVerify(), 500);
      return () => clearTimeout(timer);
    }
  }, [valid]);

  const setDigit = (i: number, v: string) => {
    const c = v.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = c;
    setDigits(next);
    if (c && i < 3) refs.current[i + 1]?.focus();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title={t('verify_number')} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('check_messages')}</Text>
            <Text style={styles.subtitle}>
              WhatsApp üzerinden{' '}
              <Text style={styles.phone}>+964 {phone}</Text>
              {'\n'}numarasına 4 haneli kod gönderdik.
            </Text>
            {sending && (
              <Text style={styles.sendingText}>Kod gönderiliyor...</Text>
            )}
          </View>

          <View style={styles.pinRow}>
            {digits.map((d, i) => (
              <TextInput
                key={i}
                ref={el => { refs.current[i] = el; }}
                value={d}
                onChangeText={v => setDigit(i, v)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && !d && i > 0) {
                    refs.current[i - 1]?.focus();
                  }
                }}
                keyboardType="number-pad"
                maxLength={1}
                style={[styles.pinInput, d ? styles.pinFilled : {}]}
              />
            ))}
          </View>

          <View style={styles.resendRow}>
            {seconds > 0 ? (
              <Text style={styles.resendTimer}>
                {t('resend_code_in')}{' '}
                <Text style={styles.resendSec}>
                  0:{seconds.toString().padStart(2, '0')}
                </Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendBtn}>{t('resend_code')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btnPrimary, (!valid || submitting) && styles.btnDisabled]}
            disabled={!valid || submitting}
            onPress={handleVerify}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>{t('verify_continue')}</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: 20 },
  header: { gap: 8, marginBottom: 28 },
  title: { fontSize: 28, fontWeight: '700', color: colors.ink900, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 22, fontWeight: '500', color: colors.ink700 },
  phone: { fontWeight: '700', color: colors.ink900 },
  sendingText: { fontSize: 13, color: colors.teal700, fontWeight: '500' },
  pinRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 24,
  },
  pinInput: {
    width: 64,
    height: 72,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.ink200,
    backgroundColor: colors.surface,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: colors.ink900,
  },
  pinFilled: {
    borderColor: colors.teal700,
    backgroundColor: colors.teal50,
  },
  resendRow: { alignItems: 'center', marginBottom: 20 },
  resendTimer: { fontSize: 13, fontWeight: '500', color: colors.ink500 },
  resendSec: { color: colors.ink700, fontWeight: '700' },
  resendBtn: { fontSize: 14, fontWeight: '700', color: colors.teal700 },
  footer: { padding: 20, paddingBottom: 24, backgroundColor: colors.bg },
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
});
