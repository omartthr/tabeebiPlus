import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/localization/app_localizations.dart';
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
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            TopBar(
              title: AppLocalizations.t('create_account'),
              onBack: widget.onBack,
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        AppLocalizations.t('lets_know_you'),
                        style: const TextStyle(
                          color: AppColors.ink900,
                          fontSize: 28,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        AppLocalizations.t('register_subtitle'),
                        style: const TextStyle(
                          color: AppColors.ink700,
                          fontSize: 15,
                          height: 1.45,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Text(
                    AppLocalizations.t('full_name'),
                    style: const TextStyle(
                      color: AppColors.ink500,
                      fontSize: 11,
                      letterSpacing: 0.3,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
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
                  const SizedBox(height: 18),
                  Text(
                    AppLocalizations.t('phone_number'),
                    style: const TextStyle(
                      color: AppColors.ink500,
                      fontSize: 11,
                      letterSpacing: 0.3,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  _InputWrap(
                    leading: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'IQ',
                          style: TextStyle(
                            color: AppColors.ink700,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        SizedBox(width: 6),
                        Text(
                          '+964',
                          style: TextStyle(
                            color: AppColors.ink900,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        SizedBox(width: 10),
                        SizedBox(
                          height: 22,
                          child: VerticalDivider(
                            width: 1,
                            color: AppColors.ink200,
                          ),
                        ),
                      ],
                    ),
                    child: TextField(
                      controller: phone,
                      onChanged: (_) => setState(() {}),
                      keyboardType: TextInputType.phone,
                      decoration: _plainInputDecoration('750 123 4567'),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.teal50,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: AppColors.teal700.withValues(alpha: 0.08),
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.shield_outlined,
                          color: AppColors.teal700,
                          size: 18,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            AppLocalizations.t('privacy_notice'),
                            style: const TextStyle(
                              color: AppColors.teal800,
                              fontSize: 13,
                              height: 1.35,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),
                  FilledButton(
                    onPressed: valid
                        ? () => widget.onOtp(
                            name.text.trim(),
                            phone.text.replaceAll(RegExp(r'\D'), ''),
                          )
                        : null,
                    style: FilledButton.styleFrom(
                      minimumSize: const Size.fromHeight(54),
                      backgroundColor: AppColors.teal700,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                    child: Text(
                      AppLocalizations.t('continue_btn'),
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  const SizedBox(height: 22),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        AppLocalizations.t('no_account'),
                        style: const TextStyle(color: AppColors.ink500),
                      ),
                      TextButton(
                        onPressed: widget.onLogin,
                        child: Text(AppLocalizations.t('btn_login')),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
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
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.ink200, width: 1.5),
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

class _InputDecoration extends InputDecoration {
  const _InputDecoration({super.hintText});
}

InputDecoration _plainInputDecoration(String hint) {
  return const InputDecoration(
    hintStyle: TextStyle(color: AppColors.ink400),
    border: InputBorder.none,
    isDense: true,
  ).copyWith(hintText: hint);
}
