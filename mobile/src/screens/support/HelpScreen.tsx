import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types/navigation';
import { colors, shadows } from '../../theme';
import { TICKETS } from '../../data';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/StatusBadge';

type Props = NativeStackScreenProps<MainStackParamList, 'Help'>;

const CATEGORIES = [
  { id: 'booking', label: 'Booking' },
  { id: 'payment', label: 'Payment' },
  { id: 'result',  label: 'Results' },
  { id: 'other',   label: 'Other' },
];

export default function HelpScreen({ navigation }: Props) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('booking');
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!subject.trim() || !message.trim()) return;
    setSent(true);
    setTimeout(() => {
      setSent(false); setSubject(''); setMessage('');
    }, 1800);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title="Help center" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* New ticket */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>NEW TICKET</Text>

          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.chips}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setCategory(c.id)}
                style={[styles.chip, category === c.id && styles.chipActive]}
              >
                <Text style={[styles.chipText, category === c.id && styles.chipTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Subject"
              placeholderTextColor={colors.ink400}
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          <View style={[styles.inputWrap, styles.textareaWrap]}>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Describe your issue..."
              placeholderTextColor={colors.ink400}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, (!subject.trim() || !message.trim() || sent) && styles.submitBtnDisabled]}
            disabled={!subject.trim() || !message.trim() || sent}
            onPress={submit}
            activeOpacity={0.85}
          >
            <Text style={styles.submitText}>
              {sent ? '✓ Ticket submitted' : 'Submit ticket'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ticket history */}
        <Text style={styles.sectionLabel}>YOUR TICKETS</Text>
        {TICKETS.map(t => (
          <View key={t.id} style={styles.ticketCard}>
            <View style={styles.ticketTop}>
              <Text style={styles.ticketSubject} numberOfLines={1}>{t.subject}</Text>
              <StatusBadge status={t.status} />
            </View>
            <Text style={styles.ticketTime}>{t.time}</Text>
            <View style={styles.ticketMsg}>
              <Text style={styles.ticketMsgText}>{t.last}</Text>
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
  sectionLabel: {
    fontSize: 11, fontWeight: '600', color: colors.ink500,
    textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 10,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: 'rgba(11,31,34,0.03)',
    ...shadows.card, gap: 10, marginBottom: 8,
  },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.ink500 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100,
    backgroundColor: colors.ink100,
  },
  chipActive: { backgroundColor: colors.teal700 },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.ink700 },
  chipTextActive: { color: '#fff' },
  inputWrap: {
    backgroundColor: colors.surface, borderWidth: 1.5,
    borderColor: colors.ink200, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  textareaWrap: { minHeight: 100 },
  input: { flex: 1, fontSize: 16, fontWeight: '500', color: colors.ink900 },
  textarea: { minHeight: 80 },
  submitBtn: {
    height: 54, borderRadius: 100, backgroundColor: colors.teal700,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#0d7377', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
  },
  submitBtnDisabled: { backgroundColor: colors.ink200, shadowOpacity: 0 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  ticketCard: {
    backgroundColor: colors.surface, borderRadius: 20, padding: 14,
    borderWidth: 1, borderColor: 'rgba(11,31,34,0.03)',
    ...shadows.card, gap: 6,
  },
  ticketTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  ticketSubject: { fontSize: 14, fontWeight: '700', color: colors.ink900, flex: 1 },
  ticketTime: { fontSize: 12, color: colors.ink500, fontWeight: '500' },
  ticketMsg: {
    padding: 10, backgroundColor: colors.bg, borderRadius: 10,
  },
  ticketMsgText: { fontSize: 13, color: colors.ink700, fontWeight: '500', lineHeight: 18 },
});
