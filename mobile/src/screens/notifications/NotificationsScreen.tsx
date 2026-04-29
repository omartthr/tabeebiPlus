import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, FileText, Check, Bell } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors, shadows } from '../../theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../navigation/AppNavigator';
import { Notification } from '../../data';

const TYPE_CONFIG: Record<string, { bg: string; fg: string; Icon: any }> = {
  reminder: { bg: colors.teal50,    fg: colors.teal700,  Icon: Clock },
  result:   { bg: colors.amber50,   fg: '#b37d1f',        Icon: FileText },
  confirm:  { bg: colors.green100,  fg: '#0d6b4a',        Icon: Check },
  block:    { bg: colors.orange100, fg: '#8f4a0d',        Icon: Bell },
};

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifs = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch notifications error:', error.message);
    } else {
      const mapped: Notification[] = (data ?? []).map(n => ({
        id: n.id,
        type: n.data?.type || 'reminder',
        title: n.title,
        body: n.body,
        time: new Date(n.created_at).toLocaleDateString() === new Date().toLocaleDateString() 
          ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date(n.created_at).toLocaleDateString(),
        unread: !n.is_read
      }));
      setNotifs(mapped);
    }
  }, [user?.id]);

  useEffect(() => {
    setLoading(true);
    fetchNotifs().finally(() => setLoading(false));
  }, [fetchNotifs]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifs();
    setRefreshing(false);
  }, [fetchNotifs]);

  const markAllRead = async () => {
    if (!user?.id) return;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('patient_id', user.id)
      .eq('is_read', false);
    
    if (!error) fetchNotifs();
  };

  const unreadCount = notifs.filter(n => n.unread).length;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('notif_title')}</Text>
          <Text style={styles.subtitle}>{t('new_alerts', { count: unreadCount })}</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAll}>{t('mark_all_read')}</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.teal700]} tintColor={colors.teal700} />}>
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator color={colors.teal700} />
          </View>
        ) : notifs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('no_notifications') || 'Henüz bildiriminiz yok.'}</Text>
          </View>
        ) : (
          notifs.map(n => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.reminder;
            const Icon = cfg.Icon;
            return (
              <View key={n.id} style={[styles.card, n.unread && styles.cardUnread]}>
                <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
                  <Icon size={20} color={cfg.fg} />
                </View>
                <View style={styles.body}>
                  <View style={styles.top}>
                    <Text style={styles.notifTitle}>{n.title}</Text>
                    <Text style={styles.time}>{n.time}</Text>
                  </View>
                  <Text style={styles.notifBody}>{n.body}</Text>
                </View>
                {n.unread && <View style={styles.unreadDot} />}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { padding: 20, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 28, fontWeight: '700', color: colors.ink900, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontWeight: '500', color: colors.ink500, marginTop: 4 },
  markAll: { fontSize: 13, fontWeight: '700', color: colors.teal700 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 20, gap: 8 },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, backgroundColor: colors.bg, borderRadius: 20, borderWidth: 1, borderColor: colors.ink100 },
  cardUnread: { backgroundColor: colors.surface, borderColor: 'rgba(13,115,119,0.12)' },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  body: { flex: 1 },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' },
  notifTitle: { fontSize: 14, fontWeight: '700', color: colors.ink900, flex: 1 },
  time: { fontSize: 11, fontWeight: '600', color: colors.ink400, flexShrink: 0 },
  notifBody: { fontSize: 13, color: colors.ink700, fontWeight: '500', lineHeight: 18, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.amber500, marginTop: 6 },
});
