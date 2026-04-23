import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Calendar, ChevronDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors, shadows } from '../../theme';
import { RESULTS } from '../../data';

export default function ResultsScreen() {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('my_results_title')}</Text>
        <Text style={styles.subtitle}>{t('results_subtitle')}</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {RESULTS.map(r => {
          const open = openId === r.id;
          return (
            <View key={r.id} style={styles.card}>
              <TouchableOpacity onPress={() => setOpenId(open ? null : r.id)} style={styles.cardHeader} activeOpacity={0.8}>
                <View style={styles.iconWrap}>
                  <FileText size={20} color={colors.teal700} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text style={styles.resultTitle}>{r.title}</Text>
                    {r.unread && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.doctorMeta}>{r.doctor} · {r.specialty}</Text>
                </View>
                <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
                  <ChevronDown size={20} color={colors.ink400} />
                </View>
              </TouchableOpacity>

              <Text style={styles.diagnosis}>{r.diagnosis}</Text>
              <View style={styles.dateRow}>
                <Calendar size={14} color={colors.ink400} />
                <Text style={styles.date}>{r.date}</Text>
              </View>

              {open && (
                <View style={styles.expanded}>
                  <View style={styles.expandDivider} />
                  <Text style={styles.expandLabel}>{t('clinical_notes')}</Text>
                  <Text style={styles.expandText}>{r.notes}</Text>

                  {r.meds.length > 0 && (
                    <>
                      <Text style={[styles.expandLabel, { marginTop: 14 }]}>{t('medications')}</Text>
                      {r.meds.map((m, i) => (
                        <View key={i} style={styles.medItem}>
                          <Text style={styles.medText}>{m}</Text>
                        </View>
                      ))}
                    </>
                  )}

                  <Text style={[styles.expandLabel, { marginTop: 14 }]}>{t('next_steps')}</Text>
                  <View style={styles.nextSteps}>
                    <Text style={styles.nextText}>{r.next}</Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { padding: 20, paddingBottom: 14 },
  title: { fontSize: 28, fontWeight: '700', color: colors.ink900, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontWeight: '500', color: colors.ink500, marginTop: 4 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  card: { backgroundColor: colors.surface, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(11,31,34,0.03)', ...shadows.card },
  cardHeader: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.teal50, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resultTitle: { fontSize: 15, fontWeight: '700', color: colors.ink900, letterSpacing: -0.2, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.amber500 },
  doctorMeta: { fontSize: 12, color: colors.ink500, fontWeight: '500', marginTop: 2 },
  diagnosis: { fontSize: 13, color: colors.ink700, fontWeight: '500', lineHeight: 20, paddingHorizontal: 16 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, paddingTop: 8 },
  date: { fontSize: 12, color: colors.ink500, fontWeight: '600' },
  expanded: { paddingHorizontal: 16, paddingBottom: 16 },
  expandDivider: { height: 1, backgroundColor: colors.ink100, marginBottom: 14, marginTop: 4 },
  expandLabel: { fontSize: 11, fontWeight: '600', color: colors.ink500, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 },
  expandText: { fontSize: 13, color: colors.ink700, fontWeight: '500', lineHeight: 20 },
  medItem: { padding: 10, backgroundColor: colors.teal50, borderRadius: 10, marginBottom: 6 },
  medText: { fontSize: 13, fontWeight: '600', color: colors.teal800 },
  nextSteps: { padding: 12, backgroundColor: colors.amber50, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(230,166,59,0.15)' },
  nextText: { fontSize: 13, color: '#8a5a0d', fontWeight: '600', lineHeight: 20 },
});
