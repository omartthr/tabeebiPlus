import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, FileText, Check, Bell, Inbox, Star } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme';
import { useAuth } from '../../navigation/AppNavigator';
import { supabase } from '../../lib/supabase';

const TYPE_CONFIG: Record<string, { bg: string; fg: string; Icon: any }> = {
  reminder: { bg: colors.teal50,    fg: colors.teal700,  Icon: Clock },
  result:   { bg: colors.amber50,   fg: '#b37d1f',        Icon: FileText },
  confirm:  { bg: colors.green100,  fg: '#0d6b4a',        Icon: Check },
  block:    { bg: colors.orange100, fg: '#8f4a0d',        Icon: Bell },
  rating:   { bg: colors.amber50,   fg: '#b37d1f',        Icon: Star },
};

function formatRelativeTime(dateStr: string | null) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} sa önce`;
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = useCallback(async (showIndicator = false) => {
    if (!user?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (showIndicator) setLoading(true);
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch notifications error:', error.message);
    } else {
      setNotifications(data ?? []);
    }
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(false);
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    if (!user?.id || notifications.length === 0) return;
    
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

    const { error } = await supabase
      .from('notifications')
      .update({ unread: false })
      .eq('patient_id', user.id)
      .eq('unread', true);

    if (error) {
      console.error('Mark all as read error:', error.message);
      // Rollback on error
      fetchNotifications(false);
    }
  };

  const handleMarkOneRead = async (id: string, currentlyUnread: boolean) => {
    if (!currentlyUnread) return;

    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));

    const { error } = await supabase
      .from('notifications')
      .update({ unread: false })
      .eq('id', id);

    if (error) {
      console.error('Mark notification as read error:', error.message);
      fetchNotifications(false);
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.title}>{t('notif_title')}</Text>
          <Text style={styles.subtitle}>{t('new_alerts', { count: unreadCount })}</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={{ padding: 4 }}>
            <Text style={styles.markAll}>{t('mark_all_read')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.teal700} />
        </View>
      ) : notifications.length === 0 ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.teal700]} tintColor={colors.teal700} />}
        >
          <Inbox size={48} color={colors.ink300} style={{ marginBottom: 12 }} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink600 }}>{t('no_notifications')}</Text>
          <Text style={{ fontSize: 13, color: colors.ink400, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 }}>
            {t('no_notifications_sub')}
          </Text>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.teal700]} tintColor={colors.teal700} />}
        >
          {notifications.map(n => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.reminder;
            const Icon = cfg.Icon;
            return (
              <TouchableOpacity
                key={n.id}
                activeOpacity={n.unread ? 0.7 : 1}
                onPress={() => {
                  handleMarkOneRead(n.id, n.unread);
                  if (n.type === 'rating') {
                    navigation.navigate('MainTabs', { screen: 'Appointments' });
                  }
                }}
                style={[styles.card, n.unread && styles.cardUnread]}
              >
                <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
                  <Icon size={20} color={cfg.fg} />
                </View>
                <View style={styles.body}>
                  <View style={styles.top}>
                    <Text style={styles.notifTitle}>{n.title}</Text>
                    <Text style={styles.time}>{formatRelativeTime(n.created_at || n.time)}</Text>
                  </View>
                  <Text style={styles.notifBody}>{n.body}</Text>
                </View>
                {n.unread && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
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
