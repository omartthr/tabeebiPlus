import 'package:flutter/material.dart';

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
  String get initials {
    final parts = displayName.trim().split(RegExp(r'\s+'));
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
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _fetchCounts,
        color: AppColors.teal700,
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
            // Profile details card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.teal700, AppColors.teal800],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: AppShadows.float,
              ),
              child: Row(
                children: [
                  // Avatar
                  GestureDetector(
                    onTap: _openEditName,
                    child: Stack(
                      children: [
                        Container(
                          width: 58,
                          height: 58,
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            initials,
                            style: const TextStyle(
                              color: AppColors.teal700,
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                        Positioned(
                          right: 0,
                          bottom: 0,
                          child: Container(
                            width: 20,
                            height: 20,
                            decoration: BoxDecoration(
                              color: AppColors.amber500,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 1.5),
                            ),
                            child: const Icon(
                              Icons.edit_rounded,
                              size: 11,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          displayName,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        Text(
                          '+964 ${widget.user?.phone ?? '7501234567'}',
                          style: const TextStyle(
                            color: Color(0xCCFFFFFF),
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                          ),
                        ),
                        if (widget.user?.patientCode != null) ...[
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.16),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '#${widget.user!.patientCode}',
                              style: const TextStyle(
                                color: Colors.white,
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

            // Patient Stats / Visits & Reports
            _MenuCard(
              tiles: [
                _Tile(
                  icon: Icons.calendar_month_rounded,
                  iconColor: AppColors.teal700,
                  tileBg: AppColors.teal50,
                  title: AppLocalizations.t('my_bookings'),
                  subtitle: _loadingCounts
                      ? AppLocalizations.t('loading')
                      : '${_counts?.appointments ?? 0} ${AppLocalizations.t('upcoming')}',
                  onTap: () => widget.onNavigateToTab(MainTab.appointments),
                ),
                _Tile(
                  icon: Icons.file_copy_rounded,
                  iconColor: const Color(0xFFB37D1F),
                  tileBg: const Color(0xFFFFF8E1),
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
                'Tabeebi+ v1.0.0 • Kirkuk, Iraq',
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
                    color: AppColors.teal700,
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
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.ink100),
        boxShadow: AppShadows.card,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Column(
          children: tiles.map((tile) {
            final isLast = tiles.last == tile;
            return Column(
              children: [
                _TileWidget(tile: tile),
                if (!isLast) const Divider(height: 1, color: AppColors.ink100),
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
    this.iconColor,
    this.tileBg,
    this.rightLabel,
    this.danger = false,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final Color? iconColor;
  final Color? tileBg;
  final String? rightLabel;
  final bool danger;
  final VoidCallback onTap;
}

class _TileWidget extends StatelessWidget {
  const _TileWidget({required this.tile});
  final _Tile tile;

  @override
  Widget build(BuildContext context) {
    final ArrowIcon = AppLocalizations.isRtl
        ? const Icon(Icons.chevron_left_rounded)
        : const Icon(Icons.chevron_right_rounded);

    return ListTile(
      onTap: tile.onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: tile.danger
              ? AppColors.red100
              : (tile.tileBg ?? AppColors.teal50),
          borderRadius: BorderRadius.circular(14),
        ),
        alignment: Alignment.center,
        child: Icon(
          tile.icon,
          size: 20,
          color: tile.danger
              ? AppColors.red500
              : (tile.iconColor ?? AppColors.teal700),
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
                color: AppColors.teal700,
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
