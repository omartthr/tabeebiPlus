import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, 
  ActivityIndicator, LayoutAnimation, Platform, UIManager, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { MessageSquare, ChevronDown, Info } from 'lucide-react-native';
import { MainStackParamList } from '../../types/navigation';
import { colors, shadows } from '../../theme';
import { Ticket } from '../../data';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/StatusBadge';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../navigation/AppNavigator';
import CustomAlert from '../../components/CustomAlert';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<MainStackParamList, 'Help'>;

export default function HelpScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [view, setView] = useState<'main' | 'form'>('main');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('booking');
  const [sent, setSent] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        const mapped: Ticket[] = data.map(t => ({
          id: t.id,
          subject: t.subject,
          status: t.status,
          time: new Date(t.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }),
          last: t.last_response || t.message
        }));
        setTickets(mapped);
      }
    } catch (e) {
      console.error('Fetch tickets error:', e);
    }
  }, [user?.id]);

  useEffect(() => {
    setLoading(true);
    fetchTickets().finally(() => setLoading(false));
  }, [fetchTickets]);

  const CATEGORIES = [
    { id: 'booking', label: t('cat_booking') },
    { id: 'payment', label: t('cat_payment') },
    { id: 'result',  label: t('cat_results') },
    { id: 'other',   label: t('cat_other') },
  ];

  const submit = async () => {
    if (!subject.trim() || !message.trim() || !user?.id) return;
    setSent(true);
    
    try {
      const { error } = await supabase.from('support_tickets').insert({
        patient_id: user.id,
        category,
        subject: subject.trim(),
        message: message.trim(),
        status: 'open'
      });

      if (!error) {
        setSent(false); 
        setSubject(''); 
        setMessage(''); 
        await fetchTickets();
        setAlertVisible(true);
      } else {
        throw error;
      }
    } catch (error: any) {
      setSent(false);
      Alert.alert('Hata', error.message || 'Şikayet gönderilemedi.');
    }
  };

  const toggleFaq = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenFaq(openFaq === id ? null : id);
  };

  const FAQS = [
    { id: 1, q: t('faq_q1', 'Nasıl randevu alabilirim?'), a: t('faq_a1', 'Ana sayfadan istediğiniz uzmanlık alanını seçip, doktorunuzu ve uygun saati belirleyerek randevunuzu kolayca oluşturabilirsiniz.') },
    { id: 2, q: t('faq_q2', 'Randevumu iptal edebilir miyim?'), a: t('faq_a2', 'Onaylanmamış randevuları serbestçe iptal edebilirsiniz. Ancak onaylanmış randevuların sık iptal edilmesi durumunda hesabınız geçici olarak bloklanabilir.') },
    { id: 3, q: t('faq_q3', 'Sonuçlarımı nerede görebilirim?'), a: t('faq_a3', '"Sonuçlarım" sekmesinden tüm geçmiş tıbbi raporlarınıza ve AI özetlerinize ulaşabilirsiniz.') },
    { id: 4, q: t('faq_q4', 'Ödeme nasıl yapılır?'), a: t('faq_a4', 'Hem online (kart veya Zain Cash) hem de klinikte nakit ödeme seçeneklerimiz mevcuttur.') },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar 
        title={view === 'form' ? t('new_ticket') : t('help_center_title')} 
        onBack={() => view === 'form' ? setView('main') : navigation.goBack()} 
      />
      
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {view === 'form' ? (
          /* FORM VIEW */
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>{t('category')}</Text>
            <View style={styles.chips}>
              {CATEGORIES.map(c => (
                <TouchableOpacity 
                  key={c.id} 
                  onPress={() => setCategory(c.id)} 
                  style={[styles.chip, category === c.id && styles.chipActive]}
                >
                  <Text style={[styles.chipText, category === c.id && styles.chipTextActive]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputWrap}>
              <TextInput 
                style={styles.input} 
                placeholder={t('subject_placeholder')} 
                placeholderTextColor={colors.ink400} 
                value={subject} 
                onChangeText={setSubject} 
              />
            </View>

            <View style={[styles.inputWrap, styles.textareaWrap]}>
              <TextInput 
                style={[styles.input, styles.textarea]} 
                placeholder={t('message_placeholder')} 
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
              {sent ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitText}>{t('submit_ticket')}</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* MAIN VIEW */
          <>
            <TouchableOpacity style={styles.complaintEntry} onPress={() => setView('form')} activeOpacity={0.8}>
              <View style={styles.complaintIcon}>
                <MessageSquare size={24} color={colors.teal700} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.complaintTitle}>{t('submit_complaint_title', 'Bize Ulaşın / Şikayet Bildir')}</Text>
                <Text style={styles.complaintSub}>{t('submit_complaint_sub', 'Sorunlarınızı doğrudan bize iletin.')}</Text>
              </View>
              <ChevronDown size={20} color={colors.ink400} style={{ transform: [{ rotate: '-90deg' }] }} />
            </TouchableOpacity>

            <Text style={styles.sectionLabel}>{t('faqs', 'SIKÇA SORULAN SORULAR')}</Text>
            <View style={styles.faqList}>
              {FAQS.map(f => (
                <TouchableOpacity key={f.id} style={styles.faqItem} onPress={() => toggleFaq(f.id)} activeOpacity={0.7}>
                  <View style={styles.faqHeader}>
                    <Text style={styles.faqQ}>{f.q}</Text>
                    <ChevronDown size={18} color={colors.ink400} style={{ transform: [{ rotate: openFaq === f.id ? '180deg' : '0deg' }] }} />
                  </View>
                  {openFaq === f.id && (
                    <Text style={styles.faqA}>{f.a}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>{t('about_us_label', 'BİZ KİMİZ')}</Text>
            <View style={styles.aboutCard}>
              <View style={styles.aboutHeader}>
                <Info size={20} color={colors.teal700} />
                <Text style={styles.aboutTitle}>Tabeebi+</Text>
              </View>
              <Text style={styles.aboutText}>
                {t('about_us_text', 'Tabeebi+, Kerkük genelinde uzman doktorlara kolayca ulaşmanızı sağlayan modern bir sağlık platformudur. Amacımız, hasta ve doktor arasındaki iletişimi dijitalleştirerek sağlık süreçlerini hızlandırmaktır.')}
              </Text>
            </View>

            <Text style={styles.sectionLabel}>{t('your_tickets')}</Text>
            {loading ? (
              <ActivityIndicator color={colors.teal700} style={{ marginTop: 20 }} />
            ) : tickets.length === 0 ? (
              <Text style={styles.emptyText}>Henüz bir şikayetiniz yok.</Text>
            ) : tickets.map(ticket => (
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
          </>
        )}
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={t('ticket_submitted')}
        message={t('complaint_success_msg', 'Şikayetiniz başarıyla iletildi. En kısa sürede inceleyip size dönüş yapacağız.')}
        onConfirm={() => {
          setAlertVisible(false);
          setView('main');
        }}
        confirmText={t('ok', 'Tamam')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 12, paddingBottom: 40 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: colors.ink500, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4, marginTop: 8 },
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(11,31,34,0.03)', ...shadows.card, gap: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.ink500 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'space-between' },
  chip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 100, backgroundColor: colors.ink100, minWidth: '23%', alignItems: 'center' },
  chipActive: { backgroundColor: colors.teal700 },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.ink700 },
  chipTextActive: { color: '#fff' },
  inputWrap: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.ink200, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14 },
  textareaWrap: { minHeight: 120 },
  input: { flex: 1, fontSize: 16, fontWeight: '500', color: colors.ink900 },
  textarea: { minHeight: 100 },
  submitBtn: { height: 54, borderRadius: 100, backgroundColor: colors.teal700, alignItems: 'center', justifyContent: 'center', ...shadows.button },
  submitBtnDisabled: { backgroundColor: colors.ink200, shadowOpacity: 0 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  ticketCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(11,31,34,0.03)', ...shadows.card, gap: 8, marginBottom: 4 },
  ticketTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  ticketSubject: { fontSize: 14, fontWeight: '700', color: colors.ink900, flex: 1 },
  ticketTime: { fontSize: 12, color: colors.ink500, fontWeight: '500' },
  ticketMsg: { padding: 12, backgroundColor: colors.bg, borderRadius: 12 },
  ticketMsgText: { fontSize: 13, color: colors.ink700, fontWeight: '500', lineHeight: 20 },
  complaintEntry: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 20, backgroundColor: colors.surface, borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(11,31,34,0.03)', ...shadows.card,
    marginBottom: 10,
  },
  complaintIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: colors.teal50, alignItems: 'center', justifyContent: 'center' },
  complaintTitle: { fontSize: 16, fontWeight: '700', color: colors.ink900 },
  complaintSub: { fontSize: 13, color: colors.ink500, fontWeight: '500', marginTop: 3 },
  faqList: { backgroundColor: colors.surface, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(11,31,34,0.03)', ...shadows.card, marginBottom: 10 },
  faqItem: { padding: 18, borderBottomWidth: 1, borderBottomColor: colors.ink100 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  faqQ: { fontSize: 14, fontWeight: '700', color: colors.ink900, flex: 1 },
  faqA: { fontSize: 13, color: colors.ink600, fontWeight: '500', lineHeight: 20, marginTop: 14 },
  aboutCard: { 
    backgroundColor: colors.surface, borderRadius: 24, padding: 20, 
    borderWidth: 1, borderColor: 'rgba(11,31,34,0.03)', ...shadows.card, 
    gap: 12, marginBottom: 10 
  },
  aboutHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aboutTitle: { fontSize: 18, fontWeight: '800', color: colors.teal700 },
  aboutText: { fontSize: 14, color: colors.ink700, fontWeight: '500', lineHeight: 22 },
  emptyText: { fontSize: 13, color: colors.ink400, textAlign: 'center', marginTop: 10 },
});
