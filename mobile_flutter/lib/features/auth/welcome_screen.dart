import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/localization/app_localizations.dart';
import '../../shared/widgets/app_logo.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({
    super.key,
    required this.currentLanguage,
    required this.onLanguageChanged,
    required this.onLogin,
    required this.onRegister,
  });

  final String currentLanguage;
  final ValueChanged<String> onLanguageChanged;
  final VoidCallback onLogin;
  final VoidCallback onRegister;

  @override
  Widget build(BuildContext context) {
    // For RTL languages like Arabic and Kurdish, standard MaterialApp does it, but we can ensure layout direction if needed.
    return Scaffold(
      backgroundColor: AppColors.teal700,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(28, 20, 28, 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const AppLogo(
                    variant: AppLogoVariant.dark,
                    width: 140,
                    height: 34,
                  ),
                  _LanguagePill(
                    currentLanguage: currentLanguage,
                    onLanguageChanged: onLanguageChanged,
                  ),
                ],
              ),
              const Spacer(),
              Text(
                AppLocalizations.t('welcome_title'),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 34,
                  height: 1.12,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                AppLocalizations.t('welcome_subtitle'),
                style: const TextStyle(
                  color: Color(0xC9FFFFFF),
                  fontSize: 14.5,
                  height: 1.45,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 34),
              _Feature(
                icon: Icons.verified_outlined,
                text: AppLocalizations.t('feature_verified'),
              ),
              _Feature(
                icon: Icons.shield_outlined,
                text: AppLocalizations.t('feature_private'),
              ),
              _Feature(
                icon: Icons.schedule_rounded,
                text: AppLocalizations.t('feature_same_day'),
              ),
              const Spacer(),
              FilledButton(
                onPressed: onRegister,
                style: FilledButton.styleFrom(
                  minimumSize: const Size.fromHeight(54),
                  backgroundColor: AppColors.amber500,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
                child: Text(
                  AppLocalizations.t('btn_start'),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: AppColors.teal900,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: onLogin,
                style: TextButton.styleFrom(
                  minimumSize: const Size.fromHeight(54),
                ),
                child: Text(
                  AppLocalizations.t('btn_login'),
                  style: const TextStyle(
                    color: Color(0xDDFFFFFF),
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(height: 6),
              Center(
                child: Text(
                  AppLocalizations.t('terms_agree'),
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Color(0x80FFFFFF),
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
}

class _LanguagePill extends StatelessWidget {
  const _LanguagePill({
    required this.currentLanguage,
    required this.onLanguageChanged,
  });

  final String currentLanguage;
  final ValueChanged<String> onLanguageChanged;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _showLanguagePicker(context),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withValues(alpha: 0.18)),
        ),
        child: Row(
          children: [
            Text(
              currentLanguage.toUpperCase(),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 13,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(width: 6),
            const Icon(
              Icons.keyboard_arrow_down_rounded,
              color: Colors.white,
              size: 16,
            ),
          ],
        ),
      ),
    );
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
                  onLanguageChanged(lang.$2);
                  Navigator.pop(ctx);
                },
              ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}

class _Feature extends StatelessWidget {
  const _Feature({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AppColors.amber500, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                color: Color(0xEAFFFFFF),
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
