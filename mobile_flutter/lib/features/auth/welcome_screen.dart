import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/theme/app_colors.dart';
import '../../core/localization/app_localizations.dart';
import '../../shared/widgets/app_logo.dart';

const _welcomeHeroImage = AssetImage('assets/images/welcome_hero.png');

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
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light.copyWith(
        statusBarColor: Colors.transparent,
        systemNavigationBarColor: AppColors.teal900,
        systemNavigationBarIconBrightness: Brightness.light,
      ),
      child: Scaffold(
        extendBody: true,
        extendBodyBehindAppBar: true,
        backgroundColor: AppColors.teal900,
        body: Stack(
          fit: StackFit.expand,
          children: [
            const Image(
              image: _welcomeHeroImage,
              fit: BoxFit.cover,
              alignment: Alignment.topCenter,
            ),
            DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    AppColors.teal900.withValues(alpha: 0.10),
                    AppColors.teal900.withValues(alpha: 0.22),
                    AppColors.teal900.withValues(alpha: 0.96),
                  ],
                  stops: const [0, 0.48, 1],
                ),
              ),
            ),
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(22, 18, 22, 20),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const AppLogo(
                          variant: AppLogoVariant.dark,
                          width: 142,
                          height: 36,
                        ),
                        _LanguagePill(
                          currentLanguage: currentLanguage,
                          onLanguageChanged: onLanguageChanged,
                        ),
                      ],
                    ),
                    const Spacer(),
                    _WelcomeCopyPanel(onRegister: onRegister, onLogin: onLogin),
                  ],
                ),
              ),
            ),
          ],
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

class _WelcomeCopyPanel extends StatelessWidget {
  const _WelcomeCopyPanel({required this.onRegister, required this.onLogin});

  final VoidCallback onRegister;
  final VoidCallback onLogin;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 20, 18, 16),
      decoration: BoxDecoration(
        color: AppColors.teal900.withValues(alpha: 0.76),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.white.withValues(alpha: 0.14)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.24),
            blurRadius: 26,
            offset: const Offset(0, 16),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            AppLocalizations.t('welcome_title'),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              height: 1.08,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 9),
          Text(
            AppLocalizations.t('welcome_subtitle'),
            style: const TextStyle(
              color: Color(0xD9FFFFFF),
              fontSize: 13.5,
              height: 1.42,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 18),
          FilledButton(
            onPressed: onRegister,
            style: FilledButton.styleFrom(
              minimumSize: const Size.fromHeight(52),
              backgroundColor: AppColors.amber500,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(999),
              ),
            ),
            child: Text(
              AppLocalizations.t('btn_start'),
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w900,
                color: AppColors.teal900,
              ),
            ),
          ),
          const SizedBox(height: 10),
          Center(
            child: TextButton(
              onPressed: onLogin,
              child: Text(
                AppLocalizations.t('btn_login'),
                style: const TextStyle(
                  color: Color(0xE6FFFFFF),
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
          Center(
            child: Text(
              AppLocalizations.t('terms_agree'),
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Color(0x8FFFFFFF),
                fontSize: 10.5,
                height: 1.25,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
