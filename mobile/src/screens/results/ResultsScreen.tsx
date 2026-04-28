import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Calendar, ExternalLink, ChevronDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors, shadows } from '../../theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../navigation/AppNavigator';

interface Result {
  id: string;
  date: string;
  doctorName: string;
  specialty: string;
  aiSummary: string | null;
  pdfUrl: string | null;
}

export default function ResultsScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchResults = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('appointments')
      .select('id, date, ai_summary, pdf_url, doctors(name, specialty)')
      .eq('patient_id', user.id)
      .eq('status', 'completed')
      .eq('report_uploaded', true)
      .order('created_at', { ascending: false });

    const mapped: Result[] = (data ?? []).map((a: any) => ({
      id: a.id,
      date: a.date,
      doctorName: a.doctors?.name ?? 'Bilinmeyen Doktor',
      specialty: a.doctors?.specialty ?? '-',
      aiSummary: a.ai_summary ?? null,
      pdfUrl: a.pdf_url ?? null,
    }));
    setResults(mapped);
  }, [user?.id]);

  useEffect(() => {
    setLoading(true);
    fetchResults().finally(() => setLoading(false));
  }, [fetchResults]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchResults();
    setRefreshing(false);
  }, [fetchResults]);

  const formatDate = (d: string) => {
    if (!d) return '-';
    if (d.includes('-')) {
      const dt = new Date(d);
      return dt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    return d;
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('my_results_title')}</Text>
        <Text style={styles.subtitle}>{results.length} rapor mevcut</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.teal700]} tintColor={colors.teal700} />}
      >
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator color={colors.teal700} />
          </View>
        ) : results.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: colors.ink500 }}>Henüz yüklenmiş rapor yok.</Text>
          </View>
        ) : results.map(r => {
          const open = openId === r.id;
          return (
            <View key={r.id} style={styles.card}>
              <TouchableOpacity onPress={() => setOpenId(open ? null : r.id)} style={styles.cardHeader} activeOpacity={0.8}>
                <View style={styles.iconWrap}>
                  <FileText size={20} color={colors.teal700} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.doctorName}>{r.doctorName}</Text>
                  <Text style={styles.specialty}>{r.specialty}</Text>
                </View>
                <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
                  <ChevronDown size={20} color={colors.ink400} />
                </View>
              </TouchableOpacity>

              <View style={styles.dateRow}>
                <Calendar size={14} color={colors.ink400} />
                <Text style={styles.date}>{formatDate(r.date)}</Text>
              </View>

              {open && (
                <View style={styles.expanded}>
                  <View style={styles.expandDivider} />

                  {r.aiSummary ? (
                    <>
                      <Text style={styles.expandLabel}>AI Özeti</Text>
                      <View style={styles.summaryBox}>
                        <Text style={styles.summaryText}>{r.aiSummary}</Text>
                      </View>
                    </>
                  ) : (
                    <Text style={{ fontSize: 13, color: colors.ink400, marginBottom: 10 }}>Özet henüz oluşturulmadı.</Text>
                  )}

                  {r.pdfUrl && (
                    <TouchableOpacity style={styles.pdfBtn} onPress={() => Linking.openURL(r.pdfUrl!)} activeOpacity={0.8}>
                      <ExternalLink size={16} color={colors.teal700} />
                      <Text style={styles.pdfBtnText}>Raporu Görüntüle (PDF)</Text>
                    </TouchableOpacity>
                  )}
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
  doctorName: { fontSize: 15, fontWeight: '700', color: colors.ink900, letterSpacing: -0.2 },
  specialty: { fontSize: 12, color: colors.ink500, fontWeight: '500', marginTop: 2 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  date: { fontSize: 12, color: colors.ink500, fontWeight: '600' },
  expanded: { paddingHorizontal: 16, paddingBottom: 16 },
  expandDivider: { height: 1, backgroundColor: colors.ink100, marginBottom: 14 },
  expandLabel: { fontSize: 11, fontWeight: '600', color: colors.ink500, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 8 },
  summaryBox: { backgroundColor: colors.teal50, borderRadius: 14, padding: 14, marginBottom: 12 },
  summaryText: { fontSize: 13, color: colors.ink700, fontWeight: '500', lineHeight: 20 },
  pdfBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: colors.teal700, justifyContent: 'center' },
  pdfBtnText: { fontSize: 14, fontWeight: '700', color: colors.teal700 },
});
