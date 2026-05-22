import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BadgeCheck, Shield, Clock, ChevronDown, Check, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../theme';
import Logo from '../../components/Logo';
import { changeLanguage, ALL_LANGUAGES } from '../../i18n';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;



export default function WelcomeScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'en').slice(0, 2).toLowerCase();

  const [langModalVisible, setLangModalVisible] = useState(false);
  const currentLangMeta = ALL_LANGUAGES.find((l) => l.code === currentLang) || ALL_LANGUAGES[0];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.inner}>

        {/* Header (Logo + Language Pill Selector) */}
        <View style={styles.headerRow}>
          <Logo variant="dark" width={220} height={50} />

          {/* Language Selector Dropdown Button */}
          <TouchableOpacity
            style={styles.langSelectorBtn}
            onPress={() => setLangModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.langSelectorBtnText}>{currentLangMeta.code.toUpperCase()}</Text>
            <ChevronDown size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Headline — textAlign auto-handled by root direction */}
        <View style={styles.heroSection}>
          <Text style={styles.headline}>{t('welcome_title')}</Text>
          <Text style={styles.subheadline}>{t('welcome_subtitle')}</Text>
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
          <Text style={styles.terms}>{t('terms_agree')}</Text>
        </View>
      </View>

      {/* Language Selection Modal */}
      <Modal visible={langModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLangModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('language', 'Language')}</Text>
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
                    onPress={async () => {
                      if (lang.code !== currentLang) {
                        await changeLanguage(lang.code);
                      }
                      setLangModalVisible(false);
                    }}
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
              EN | TR | العربية | کوردی
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
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
  // Header always row (logo left, lang right) — not affected by global RTL
  // because the pill itself is a separate element that stays put
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  langSelectorBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },

  // Hero — textAlign inherited from root direction
  heroSection: { gap: 12 },
  headline: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  subheadline: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },

  // Features — row direction inherited from root
  features: { gap: 14 },
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
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
  },

  // CTAs
  ctas: { gap: 10 },
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
  btnAmberText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  btnGhost: {
    height: 54,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhostText: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  terms: {
    fontSize: 11,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 16,
  },
  
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(11,31,34,0.4)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: colors.surface, borderRadius: 28, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width:0, height: 4}, elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.ink900, letterSpacing: -0.5 },
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
    textAlign: 'center',
    fontSize: 12,
    color: colors.ink400,
    fontWeight: '600',
    marginTop: 20,
    letterSpacing: 0.5,
  },
});
