import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { MainStackParamList } from '../../types/navigation';
import { colors, shadows } from '../../theme';
import { TICKETS } from '../../data';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/StatusBadge';

type Props = NativeStackScreenProps<MainStackParamList, 'Help'>;

export default function HelpScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('booking');
  const [sent, setSent] = useState(false);

  const CATEGORIES = [
    { id: 'booking', label: t('cat_booking') },
    { id: 'payment', label: t('cat_payment') },
    { id: 'result',  label: t('cat_results') },
    { id: 'other',   label: t('cat_other') },
  ];

  const submit = () => {
    if (!subject.trim() || !message.trim()) return;
    setSent(true);
    setTimeout(() => { setSent(false); setSubject(''); setMessage(''); }, 1800);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title={t('help_center_title')} onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{t('new_ticket')}</Text>

          <Text style={styles.fieldLabel}>{t('category')}</Text>
          <View style={styles.chips}>
            {CATEGORIES.map(c => (
              <TouchableOpacity key={c.id} onPress={() => setCategory(c.id)} style={[styles.chip, category === c.id && styles.chipActive]}>
                <Text style={[styles.chipText, category === c.id && styles.chipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputWrap}>
            <TextInput style={styles.input} placeholder={t('subject_placeholder')} placeholderTextColor={colors.ink400} value={subject} onChangeText={setSubject} />
          </View>

          <View style={[styles.inputWrap, styles.textareaWrap]}>
            <TextInput style={[styles.input, styles.textarea]} placeholder={t('message_placeholder')} placeholderTextColor={colors.ink400} multiline numberOfLines={4} textAlignVertical="top" value={message} onChangeText={setMessage} />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, (!subject.trim() || !message.trim() || sent) && styles.submitBtnDisabled]}
            disabled={!subject.trim() || !message.trim() || sent}
            onPress={submit}
            activeOpacity={0.85}
          >
            <Text style={styles.submitText}>{sent ? t('ticket_submitted') : t('submit_ticket')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>{t('your_tickets')}</Text>
        {TICKETS.map(ticket => (
          <View key={ticket.id} style={styles.ticketCard}>
            <View style={styles.ticketTop}>
              <Text style={styles.ticketSubject} numberOfLines={1}>{ticket.subject}</Text>
              <StatusBadge status={ticket.status} />
            </View>
            <Text style={styles.ticketTime}>{ticket.time}</Text>
            <View style={styles.ticketMsg}>
              <Text style={styles.ticketMsgText}>{ticket.last}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 12, paddingBottom: 40 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: colors.ink500, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(11,31,34,0.03)', ...shadows.card, gap: 10, marginBottom: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.ink500 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, backgroundColor: colors.ink100 },
  chipActive: { backgroundColor: colors.teal700 },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.ink700 },
  chipTextActive: { color: '#fff' },
  inputWrap: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.ink200, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14 },
  textareaWrap: { minHeight: 100 },
  input: { flex: 1, fontSize: 16, fontWeight: '500', color: colors.ink900 },
  textarea: { minHeight: 80 },
  submitBtn: { height: 54, borderRadius: 100, backgroundColor: colors.teal700, alignItems: 'center', justifyContent: 'center', shadowColor: '#0d7377', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  submitBtnDisabled: { backgroundColor: colors.ink200, shadowOpacity: 0 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  ticketCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: 'rgba(11,31,34,0.03)', ...shadows.card, gap: 6 },
  ticketTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  ticketSubject: { fontSize: 14, fontWeight: '700', color: colors.ink900, flex: 1 },
  ticketTime: { fontSize: 12, color: colors.ink500, fontWeight: '500' },
  ticketMsg: { padding: 10, backgroundColor: colors.bg, borderRadius: 10 },
  ticketMsgText: { fontSize: 13, color: colors.ink700, fontWeight: '500', lineHeight: 18 },
});
