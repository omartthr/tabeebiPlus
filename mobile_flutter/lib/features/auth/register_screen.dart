import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/localization/app_localizations.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/top_bar.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({
    super.key,
    required this.onBack,
    required this.onOtp,
    required this.onLogin,
  });

  final VoidCallback onBack;
  final void Function(String name, String phone) onOtp;
  final VoidCallback onLogin;

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final name = TextEditingController();
  final phone = TextEditingController();

  bool get valid =>
      name.text.trim().length >= 2 &&
      phone.text.replaceAll(RegExp(r'\D'), '').length >= 10;

  @override
  void dispose() {
    name.dispose();
    phone.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark.copyWith(
        statusBarColor: Colors.white,
        systemNavigationBarColor: Colors.white,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Column(
            children: [
              TopBar(
                title: AppLocalizations.t('create_account'),
                onBack: widget.onBack,
              ),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(22, 24, 22, 24),
                  children: [
                    Text(
                      AppLocalizations.t('lets_know_you'),
                      style: const TextStyle(
                        color: AppColors.ink900,
                        fontSize: 28,
                        height: 1.12,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      AppLocalizations.t('register_subtitle'),
                      style: const TextStyle(
                        color: AppColors.ink700,
                        fontSize: 15,
                        height: 1.45,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 28),
                    _FieldLabel(AppLocalizations.t('full_name')),
                    const SizedBox(height: 8),
                    _InputWrap(
                      leading: const Icon(
                        Icons.person_outline_rounded,
                        color: AppColors.ink400,
                        size: 20,
                      ),
                      child: TextField(
                        controller: name,
                        onChanged: (_) => setState(() {}),
                        textInputAction: TextInputAction.next,
                        decoration: _plainInputDecoration(
                          AppLocalizations.t('name_placeholder'),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    _FieldLabel(AppLocalizations.t('phone_number')),
                    const SizedBox(height: 8),
                    _InputWrap(
                      leading: const _PhonePrefix(),
                      child: TextField(
                        controller: phone,
                        onChanged: (_) => setState(() {}),
                        keyboardType: TextInputType.phone,
                        decoration: _plainInputDecoration('750 123 4567'),
                      ),
                    ),
                    const SizedBox(height: 14),
                    const _PrivacyNotice(),
                    const SizedBox(height: 30),
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      curve: Curves.easeOutCubic,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(999),
                        boxShadow: valid ? AppShadows.button : null,
                      ),
                      child: FilledButton(
                        onPressed: valid
                            ? () => widget.onOtp(
                                name.text.trim(),
                                phone.text.replaceAll(RegExp(r'\D'), ''),
                              )
                            : null,
                        style: FilledButton.styleFrom(
                          minimumSize: const Size.fromHeight(56),
                          backgroundColor: AppColors.teal700,
                          disabledBackgroundColor: const Color(0xFFE2E4E4),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                        child: Text(
                          AppLocalizations.t('continue_btn'),
                          style: TextStyle(
                            color: valid ? Colors.white : AppColors.ink400,
                            fontWeight: FontWeight.w900,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 28),
                    _LoginSwitch(onLogin: widget.onLogin),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  const _FieldLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        color: AppColors.ink500,
        fontSize: 11,
        letterSpacing: 0.3,
        fontWeight: FontWeight.w800,
      ),
    );
  }
}

class _PhonePrefix extends StatelessWidget {
  const _PhonePrefix();

  @override
  Widget build(BuildContext context) {
    return const Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          'IQ',
          style: TextStyle(
            color: AppColors.ink700,
            fontWeight: FontWeight.w900,
          ),
        ),
        SizedBox(width: 6),
        Text(
          '+964',
          style: TextStyle(
            color: AppColors.ink900,
            fontWeight: FontWeight.w800,
          ),
        ),
        SizedBox(width: 10),
        SizedBox(
          height: 22,
          child: VerticalDivider(width: 1, color: AppColors.ink200),
        ),
      ],
    );
  }
}

class _PrivacyNotice extends StatelessWidget {
  const _PrivacyNotice();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.teal50.withValues(alpha: 0.90),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.teal200.withValues(alpha: 0.45)),
        boxShadow: [
          BoxShadow(
            color: AppColors.teal700.withValues(alpha: 0.06),
            blurRadius: 14,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.70),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.shield_outlined,
              color: AppColors.teal700,
              size: 18,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              AppLocalizations.t('privacy_notice'),
              style: const TextStyle(
                color: AppColors.teal800,
                fontSize: 13,
                height: 1.35,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LoginSwitch extends StatelessWidget {
  const _LoginSwitch({required this.onLogin});

  final VoidCallback onLogin;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      alignment: WrapAlignment.center,
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 2,
      children: [
        const Text(
          'Already have an account?',
          style: TextStyle(
            color: AppColors.ink500,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
        TextButton(
          onPressed: onLogin,
          style: TextButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            minimumSize: const Size(0, 42),
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          child: Text(
            AppLocalizations.t('btn_login'),
            style: const TextStyle(
              color: AppColors.teal700,
              fontSize: 14,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
      ],
    );
  }
}

class _InputWrap extends StatelessWidget {
  const _InputWrap({required this.leading, required this.child});

  final Widget leading;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.88),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.teal200.withValues(alpha: 0.50)),
        boxShadow: [
          BoxShadow(
            color: AppColors.teal700.withValues(alpha: 0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          leading,
          const SizedBox(width: 10),
          Expanded(child: child),
        ],
      ),
    );
  }
}

InputDecoration _plainInputDecoration(String hint) {
  return const InputDecoration(
    hintStyle: TextStyle(
      color: AppColors.ink400,
      fontSize: 16,
      fontWeight: FontWeight.w500,
    ),
    border: InputBorder.none,
    isDense: true,
  ).copyWith(hintText: hint);
}
