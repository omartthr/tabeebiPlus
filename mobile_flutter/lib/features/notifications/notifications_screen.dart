import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/localization/app_localizations.dart';
import '../../data/repositories/tabeebi_repository.dart';
import '../../shared/widgets/top_bar.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({
    super.key,
    required this.repository,
    required this.onBack,
  });

  final TabeebiRepository repository;
  final VoidCallback onBack;

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  late Future<List<AppNotificationItem>> future;

  @override
  void initState() {
    super.initState();
    future = widget.repository.getNotifications();
  }

  String _formatRelative(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return '';
    try {
      final d = DateTime.tryParse(dateStr);
      if (d == null) return dateStr;
      final now = DateTime.now();
      final diff = now.difference(d);
      if (diff.inMinutes < 1) return 'Just now';
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      if (diff.inDays == 1) return 'Yesterday';
      if (diff.inDays < 7) return '${diff.inDays}d ago';
      return '${d.day}/${d.month}';
    } catch (_) {
      return dateStr;
    }
  }

  Future<void> _markAllRead() async {
    await widget.repository.markNotificationsRead();
    if (mounted) {
      setState(() {
        future = widget.repository.getNotifications();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          TopBar(
            title: AppLocalizations.t('notif_title'),
            onBack: widget.onBack,
          ),
          Expanded(
            child: FutureBuilder<List<AppNotificationItem>>(
              future: future,
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(
                    child: CircularProgressIndicator(color: AppColors.teal700),
                  );
                }

                final notifications = snapshot.data!;
                final unreadCount = notifications.where((n) => n.unread).length;

                return RefreshIndicator(
                  color: AppColors.teal700,
                  onRefresh: () async => setState(
                    () => future = widget.repository.getNotifications(),
                  ),
                  child: notifications.isEmpty
                      ? ListView(
                          padding: const EdgeInsets.all(40),
                          children: [
                            const SizedBox(height: 40),
                            Center(
                              child: Column(
                                children: [
                                  Container(
                                    width: 72,
                                    height: 72,
                                    decoration: BoxDecoration(
                                      color: AppColors.teal50,
                                      borderRadius: BorderRadius.circular(24),
                                    ),
                                    child: const Icon(
                                      Icons.inbox_rounded,
                                      color: AppColors.teal700,
                                      size: 32,
                                    ),
                                  ),
                                  const SizedBox(height: 14),
                                  Text(
                                    AppLocalizations.t('no_notifications'),
                                    style: const TextStyle(
                                      color: AppColors.ink900,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 16,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    AppLocalizations.t('no_notifications_sub'),
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(
                                      color: AppColors.ink400,
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        )
                      : ListView(
                          padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                          children: [
                            if (unreadCount > 0)
                              Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      AppLocalizations.t('new_alerts', {
                                        'count': unreadCount,
                                      }),
                                      style: const TextStyle(
                                        color: AppColors.ink500,
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    GestureDetector(
                                      onTap: _markAllRead,
                                      child: Text(
                                        AppLocalizations.t('mark_all_read'),
                                        style: const TextStyle(
                                          color: AppColors.teal700,
                                          fontSize: 13,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            for (final item in notifications)
                              _NotificationCard(
                                item: item,
                                timeText: _formatRelative(item.time),
                              ),
                          ],
                        ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

// Notification type visual config
_NotifConfig _configFor(String type) {
  switch (type) {
    case 'result':
      return const _NotifConfig(
        bg: AppColors.amber50,
        fg: AppColors.amber700,
        icon: Icons.description_outlined,
      );
    case 'confirm':
      return const _NotifConfig(
        bg: AppColors.green100,
        fg: AppColors.green500,
        icon: Icons.check_circle_outline_rounded,
      );
    case 'block':
      return const _NotifConfig(
        bg: AppColors.orange100,
        fg: AppColors.orange500,
        icon: Icons.block_rounded,
      );
    case 'rating':
      return const _NotifConfig(
        bg: AppColors.amber50,
        fg: AppColors.amber600,
        icon: Icons.star_outline_rounded,
      );
    default: // reminder
      return const _NotifConfig(
        bg: AppColors.teal50,
        fg: AppColors.teal700,
        icon: Icons.access_time_rounded,
      );
  }
}

class _NotifConfig {
  const _NotifConfig({
    required this.bg,
    required this.fg,
    required this.icon,
  });
  final Color bg;
  final Color fg;
  final IconData icon;
}

class _NotificationCard extends StatelessWidget {
  const _NotificationCard({
    required this.item,
    required this.timeText,
  });

  final AppNotificationItem item;
  final String timeText;

  @override
  Widget build(BuildContext context) {
    final cfg = _configFor(item.type.isEmpty ? 'reminder' : item.type);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: item.unread ? Colors.white : AppColors.bg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: item.unread
              ? AppColors.teal200.withValues(alpha: 0.4)
              : AppColors.ink100,
        ),
        boxShadow: item.unread ? AppShadows.card : null,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: cfg.bg,
              borderRadius: BorderRadius.circular(12),
            ),
            alignment: Alignment.center,
            child: Icon(cfg.icon, color: cfg.fg, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        item.title,
                        style: const TextStyle(
                          color: AppColors.ink900,
                          fontWeight: FontWeight.w900,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    Text(
                      timeText,
                      style: const TextStyle(
                        color: AppColors.ink400,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  item.body,
                  style: const TextStyle(
                    color: AppColors.ink700,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
          if (item.unread) ...[
            const SizedBox(width: 10),
            Container(
              width: 8,
              height: 8,
              margin: const EdgeInsets.only(top: 6),
              decoration: const BoxDecoration(
                color: AppColors.amber500,
                shape: BoxShape.circle,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
