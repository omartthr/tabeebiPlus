import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BadgeCheck, Shield, Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>✦</Text>
          </View>
          <Text style={styles.logoText}>
            Tabeebi<Text style={styles.logoPlus}>+</Text>
          </Text>
        </View>

        {/* Headline */}
        <View style={styles.heroSection}>
          <Text style={styles.headline}>{t('welcome_title')}</Text>
          <Text style={styles.subheadline}>
            {t('welcome_subtitle')}
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {[
            { Icon: BadgeCheck, label: t('feature_verified') },
            { Icon: Shield,     label: t('feature_private') },
            { Icon: Clock,      label: t('feature_same_day') },
          ].map(({ Icon, label }, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Icon size={20} color="#e6a63b" />
              </View>
              <Text style={styles.featureLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* CTAs */}
        <View style={styles.ctas}>
          <TouchableOpacity
            style={styles.btnAmber}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnAmberText}>{t('btn_start')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnGhost}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Text style={styles.btnGhostText}>{t('btn_login')}</Text>
          </TouchableOpacity>
          <Text style={styles.terms}>
            {t('terms_agree')}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0d7377',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoEmoji: {
    fontSize: 18,
    color: '#fff',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.4,
  },
  logoPlus: {
    color: '#e6a63b',
  },
  heroSection: {
    gap: 12,
  },
  headline: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 42,
    letterSpacing: -0.8,
  },
  subheadline: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    maxWidth: 280,
  },
  features: {
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
  },
  ctas: {
    gap: 10,
  },
  btnAmber: {
    height: 54,
    borderRadius: 100,
    backgroundColor: '#e6a63b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#d59528',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  btnAmberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  btnGhost: {
    height: 54,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhostText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  terms: {
    fontSize: 11,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    marginTop: 4,
  },
});
