import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../theme';
import TopBar from '../../components/TopBar';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const valid = phone.replace(/\D/g, '').length >= 10;

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title="Giriş Yap" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Tabeebi+</Text>
            <Text style={styles.subtitle}>Kliniğinize ve randevularınıza ulaşmak için giriş yapın.</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefon Numarası</Text>
            <TextInput 
              style={styles.input}
              placeholder="05XX XXX XX XX"
              keyboardType="phone-pad"
              placeholderTextColor={colors.ink400}
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.btnPrimary, !valid && styles.btnDisabled]}
            disabled={!valid}
            onPress={() => navigation.navigate('OTP', { phone, isLogin: true })}
          >
            <Text style={styles.btnText}>Devam Et</Text>
          </TouchableOpacity>
          
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Hesabınız yok mu? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 36, fontWeight: '700', color: colors.teal700, marginBottom: 8 },
  subtitle: { fontSize: 15, color: colors.ink500, textAlign: 'center', paddingHorizontal: 20 },
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
    shadowColor: '#0d7377',
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
