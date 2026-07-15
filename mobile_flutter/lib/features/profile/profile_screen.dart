import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/theme/app_colors.dart';
import '../../core/localization/app_localizations.dart';
import '../../data/models/tabeebi_models.dart';
import '../../data/repositories/tabeebi_repository.dart';
import '../../app/app_route.dart'; // For MainTab enum

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({
    super.key,
    required this.user,
    required this.repository,
    required this.currentLanguage,
    required this.onLanguageChanged,
    required this.onNavigateToTab,
    required this.onHelp,
    required this.onPrivacy,
    required this.onSignOut,
  });

  final UserData? user;
  final TabeebiRepository repository;
  final String currentLanguage;
  final ValueChanged<String> onLanguageChanged;
  final ValueChanged<MainTab> onNavigateToTab;
  final VoidCallback onHelp;
  final VoidCallback onPrivacy;
  final VoidCallback onSignOut;

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  PatientCounts? _counts;
  String? _editedName;
  bool _loadingCounts = true;

  @override
  void initState() {
    super.initState();
    _editedName = widget.user?.name;
    _fetchCounts();
  }

  Future<void> _fetchCounts() async {
    if (widget.user == null) return;
    setState(() => _loadingCounts = true);
    try {
      final res = await widget.repository.getPatientCounts();
      if (mounted) {
        setState(() {
          _counts = res;
          _loadingCounts = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loadingCounts = false);
      }
    }
  }

  String get displayName => _editedName ?? widget.user?.name ?? 'User';
  String get displayPhone {
    final raw = widget.user?.phone.trim() ?? '';
    if (raw.isEmpty) return '+964 750 123 4567';

    final digits = raw.replaceAll(RegExp(r'\D'), '');
    if (digits.isEmpty) return raw;

    var local = digits;
    if (local.startsWith('00964')) {
      local = local.substring(5);
    }
    while (local.startsWith('964') && local.length > 10) {
      local = local.substring(3);
    }
    if (local.startsWith('0')) {
      local = local.substring(1);
    }

    return '+964 ${_formatLocalPhone(local)}';
  }

  String _formatLocalPhone(String digits) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return '${digits.substring(0, 3)} ${digits.substring(3)}';
    return '${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}';
  }

  String get initials {
    final cleanName = displayName.trim();
    if (cleanName.isEmpty) return '?';
    final parts = cleanName.split(RegExp(r'\s+'));
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts.first.characters.first.toUpperCase();
    return '${parts.first.characters.first}${parts.last.characters.first}'.toUpperCase();
  }

  String get nativeLanguageLabel {
    switch (widget.currentLanguage) {
      case 'tr':
        return 'Türkçe';
      case 'ar':
        return 'العربية';
      case 'ku':
        return 'کوردی';
      default:
        return 'English';
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        statusBarBrightness: Brightness.light,
        systemNavigationBarColor: Colors.white,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
      child: SafeArea(
        child: RefreshIndicator(
        onRefresh: _fetchCounts,
        color: AppColors.teal800,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 118),
          children: [
            Text(
              AppLocalizations.t('profile_title'),
              style: const TextStyle(
                color: AppColors.ink900,
                fontSize: 28,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 18),
            Container(
              clipBehavior: Clip.antiAlias,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.88),
                borderRadius: BorderRadius.circular(26),
                border: Border.all(color: AppColors.ink100),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.ink900.withValues(alpha: 0.035),
                    blurRadius: 18,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Row(
                children: [
                  // Avatar
                  GestureDetector(
                    onTap: _openEditName,
                    child: Stack(
                      children: [
                        Container(
                          width: 62,
                          height: 62,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.94),
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(
                              color: AppColors.teal800.withValues(alpha: 0.10),
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.teal800.withValues(alpha: 0.045),
                                blurRadius: 16,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            initials,
                            style: const TextStyle(
                              color: AppColors.teal800,
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                        Positioned(
                          right: 0,
                          bottom: 0,
                          child: Container(
                            width: 21,
                            height: 21,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.92),
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppColors.teal800.withValues(alpha: 0.16),
                                width: 1.2,
                              ),
                            ),
                            child: const Icon(
                              Icons.edit_rounded,
                              size: 11,
                              color: AppColors.teal800,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          displayName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: AppColors.ink900,
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        Text(
                          displayPhone,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: AppColors.ink500,
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                          ),
                        ),
                        if (widget.user?.patientCode != null) ...[
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.teal800.withValues(alpha: 0.05),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: AppColors.teal800.withValues(alpha: 0.10),
                              ),
                            ),
                            child: Text(
                              '#${widget.user!.patientCode}',
                              style: const TextStyle(
                                color: AppColors.teal800,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            _MenuCard(
              tiles: [
                _Tile(
                  icon: Icons.calendar_month_rounded,
                  title: AppLocalizations.t('my_bookings'),
                  subtitle: _loadingCounts
                      ? AppLocalizations.t('loading')
                      : '${_counts?.appointments ?? 0} ${AppLocalizations.t('upcoming')}',
                  onTap: () => widget.onNavigateToTab(MainTab.appointments),
                ),
                _Tile(
                  icon: Icons.file_copy_rounded,
                  title: AppLocalizations.t('my_results'),
                  subtitle: _loadingCounts
                      ? AppLocalizations.t('loading')
                      : '${_counts?.results ?? 0} ${AppLocalizations.t('reports')}',
                  onTap: () => widget.onNavigateToTab(MainTab.results),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Account section
            _SectionLabel(label: AppLocalizations.t('about').toUpperCase()),
            const SizedBox(height: 8),
            _MenuCard(
              tiles: [
                _Tile(
                  icon: Icons.support_agent_rounded,
                  title: AppLocalizations.t('help_center'),
                  onTap: widget.onHelp,
                ),
                _Tile(
                  icon: Icons.privacy_tip_outlined,
                  title: AppLocalizations.t('privacy'),
                  onTap: widget.onPrivacy,
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Preferences
            _SectionLabel(label: AppLocalizations.t('permissions').toUpperCase()),
            const SizedBox(height: 8),
            _MenuCard(
              tiles: [
                _Tile(
                  icon: Icons.language_rounded,
                  title: AppLocalizations.t('language'),
                  rightLabel: nativeLanguageLabel,
                  onTap: () => _showLanguagePicker(context),
                ),
                _Tile(
                  icon: Icons.notifications_outlined,
                  title: AppLocalizations.t('notif_title'),
                  onTap: () {},
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Session
            _MenuCard(
              tiles: [
                _Tile(
                  icon: Icons.logout_rounded,
                  title: AppLocalizations.t('logout'),
                  danger: true,
                  onTap: () => _confirmSignOut(context),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Center(
              child: Text(
                'Tabeebi+ v1.0.0 - Kirkuk, Iraq',
                style: TextStyle(
                  color: AppColors.ink400,
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        ),
      ),
    );
  }

  Future<void> _openEditName() async {
    final ctrl = TextEditingController(text: displayName);
    final result = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(AppLocalizations.t('edit_profile')),
        content: TextField(
          controller: ctrl,
          autofocus: true,
          decoration: InputDecoration(
            hintText: AppLocalizations.t('edit_name'),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(AppLocalizations.t('cancel_btn_text')),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, ctrl.text.trim()),
            child: Text(AppLocalizations.t('save_changes')),
          ),
        ],
      ),
    );
    if (result != null && result.isNotEmpty) {
      setState(() => _editedName = result);
    }
  }

  void _showLanguagePicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Select language',
              style: TextStyle(
                color: AppColors.ink900,
                fontSize: 18,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 16),
            for (final lang in [
              ('English', 'en', false),
              ('Türkçe', 'tr', false),
              ('العربية', 'ar', true),
              ('کوردی', 'ku', true),
            ])
              ListTile(
                title: Text(lang.$1),
                trailing: Text(
                  lang.$2.toUpperCase(),
                  style: const TextStyle(
                    color: AppColors.teal800,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                subtitle: lang.$3
                    ? const Text('RTL — right-to-left layout')
                    : null,
                onTap: () {
                  widget.onLanguageChanged(lang.$2);
                  Navigator.pop(ctx);
                },
              ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Future<void> _confirmSignOut(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(AppLocalizations.t('logout')),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(AppLocalizations.t('cancel_btn_text')),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.red500),
            child: Text(AppLocalizations.t('logout')),
          ),
        ],
      ),
    );
    if (confirmed == true) widget.onSignOut();
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: const TextStyle(
        color: AppColors.ink500,
        fontSize: 11,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.5,
      ),
    );
  }
}

class _MenuCard extends StatelessWidget {
  const _MenuCard({required this.tiles});
  final List<_Tile> tiles;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.88),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.ink100),
        boxShadow: [
          BoxShadow(
            color: AppColors.ink900.withValues(alpha: 0.03),
            blurRadius: 16,
            offset: const Offset(0, 7),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Column(
          children: tiles.map((tile) {
            final isLast = tiles.last == tile;
            return Column(
              children: [
                _TileWidget(tile: tile),
                if (!isLast)
                  Divider(
                    height: 1,
                    color: AppColors.ink100.withValues(alpha: 0.86),
                  ),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }
}

class _Tile {
  const _Tile({
    required this.icon,
    required this.title,
    required this.onTap,
    this.subtitle,
    this.rightLabel,
    this.danger = false,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final String? rightLabel;
  final bool danger;
  final VoidCallback onTap;
}

class _TileWidget extends StatelessWidget {
  const _TileWidget({required this.tile});
  final _Tile tile;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: tile.onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: tile.danger
              ? AppColors.red100.withValues(alpha: 0.62)
              : Colors.white.withValues(alpha: 0.72),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: tile.danger
                ? AppColors.red500.withValues(alpha: 0.16)
                : AppColors.teal800.withValues(alpha: 0.10),
          ),
        ),
        alignment: Alignment.center,
        child: Icon(
          tile.icon,
          size: 20,
          color: tile.danger
              ? AppColors.red500
              : AppColors.teal800,
        ),
      ),
      title: Text(
        tile.title,
        style: TextStyle(
          color: tile.danger ? AppColors.red500 : AppColors.ink900,
          fontWeight: FontWeight.w700,
          fontSize: 14,
        ),
      ),
      subtitle: tile.subtitle == null
          ? null
          : Text(
              tile.subtitle!,
              style: const TextStyle(
                color: AppColors.ink400,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (tile.rightLabel != null)
            Text(
              tile.rightLabel!,
              style: const TextStyle(
                color: AppColors.teal800,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          const SizedBox(width: 4),
          Icon(
            AppLocalizations.isRtl
                ? Icons.chevron_left_rounded
                : Icons.chevron_right_rounded,
            color: tile.danger ? AppColors.red500 : AppColors.ink400,
          ),
        ],
      ),
    );
  }
}
