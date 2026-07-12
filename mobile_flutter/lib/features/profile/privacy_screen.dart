import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/localization/app_localizations.dart';
import '../../shared/widgets/top_bar.dart';

class PrivacyScreen extends StatefulWidget {
  const PrivacyScreen({
    super.key,
    required this.onBack,
    required this.onDeleteAccount,
  });

  final VoidCallback onBack;
  final VoidCallback onDeleteAccount;

  @override
  State<PrivacyScreen> createState() => _PrivacyScreenState();
}

class _PrivacyScreenState extends State<PrivacyScreen> {
  bool _notifs = true;
  bool _location = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          TopBar(
            title: AppLocalizations.t('privacy_title'),
            onBack: widget.onBack,
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                // Data protection info card
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.ink100),
                    boxShadow: AppShadows.card,
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: AppColors.teal50,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        alignment: Alignment.center,
                        child: const Icon(
                          Icons.shield_outlined,
                          color: AppColors.teal700,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              AppLocalizations.t('data_protection'),
                              style: const TextStyle(
                                color: AppColors.ink500,
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              AppLocalizations.t('data_protection_desc'),
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
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Permissions section
                Text(
                  AppLocalizations.t('permissions').toUpperCase(),
                  style: const TextStyle(
                    color: AppColors.ink500,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 10),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.ink100),
                    boxShadow: AppShadows.card,
                  ),
                  child: Column(
                    children: [
                      _PermissionRow(
                        icon: Icons.notifications_outlined,
                        label: AppLocalizations.t('notif_perms'),
                        value: _notifs,
                        onChanged: (v) => setState(() => _notifs = v),
                      ),
                      const Divider(height: 1, color: AppColors.ink100),
                      _PermissionRow(
                        icon: Icons.location_on_outlined,
                        label: AppLocalizations.t('loc_perms'),
                        value: _location,
                        onChanged: (v) => setState(() => _location = v),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Legal section
                const Text(
                  'LEGAL',
                  style: TextStyle(
                    color: AppColors.ink500,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 10),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.ink100),
                    boxShadow: AppShadows.card,
                  ),
                  child: Column(
                    children: [
                      _LegalTile(
                        icon: Icons.article_outlined,
                        label: 'Terms of service',
                        onTap: () {},
                      ),
                      const Divider(height: 1, color: AppColors.ink100),
                      _LegalTile(
                        icon: Icons.lock_outline_rounded,
                        label: 'Privacy policy',
                        onTap: () {},
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Danger zone
                GestureDetector(
                  onTap: () => _confirmDelete(context),
                  child: Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF5F5),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0x0FFF0000)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: AppColors.red100,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          alignment: Alignment.center,
                          child: const Icon(
                            Icons.delete_outline_rounded,
                            color: AppColors.red500,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                AppLocalizations.t('delete_account'),
                                style: const TextStyle(
                                  color: AppColors.red500,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              Text(
                                AppLocalizations.t('delete_warning'),
                                style: const TextStyle(
                                  color: AppColors.red500,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  height: 1.3,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmDelete(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(AppLocalizations.t('delete_account')),
        content: Text(
          '${AppLocalizations.t('delete_warning')} Are you sure?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(AppLocalizations.t('cancel_btn_text')),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.red500),
            child: Text(AppLocalizations.t('yes')),
          ),
        ],
      ),
    );
    if (confirmed == true) widget.onDeleteAccount();
  }
}

class _PermissionRow extends StatelessWidget {
  const _PermissionRow({
    required this.icon,
    required this.label,
    required this.value,
    required this.onChanged,
  });

  final IconData icon;
  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: AppColors.teal50,
              borderRadius: BorderRadius.circular(12),
            ),
            alignment: Alignment.center,
            child: Icon(icon, color: AppColors.teal700, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(
                color: AppColors.ink900,
                fontWeight: FontWeight.w700,
                fontSize: 14,
              ),
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: AppColors.teal700,
            activeTrackColor: AppColors.teal100,
            inactiveThumbColor: AppColors.ink400,
            inactiveTrackColor: AppColors.ink200,
          ),
        ],
      ),
    );
  }
}

class _LegalTile extends StatelessWidget {
  const _LegalTile({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
      leading: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: AppColors.teal50,
          borderRadius: BorderRadius.circular(12),
        ),
        alignment: Alignment.center,
        child: Icon(icon, color: AppColors.teal700, size: 20),
      ),
      title: Text(
        label,
        style: const TextStyle(
          color: AppColors.ink900,
          fontWeight: FontWeight.w700,
          fontSize: 14,
        ),
      ),
      trailing: Icon(
        AppLocalizations.isRtl
            ? Icons.chevron_left_rounded
            : Icons.chevron_right_rounded,
        color: AppColors.ink400,
      ),
    );
  }
}
