import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/localization/app_localizations.dart';
import '../../core/network/tabeebi_api_client.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/error_handler.dart';
import '../../shared/widgets/app_logo.dart';
import '../../shared/widgets/top_bar.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({
    super.key,
    required this.onBack,
    required this.api,
    required this.onOtp,
    required this.onRegister,
  });

  final VoidCallback onBack;
  final TabeebiApiClient api;
  final ValueChanged<String> onOtp;
  final VoidCallback onRegister;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final phone = TextEditingController();
  bool checking = false;

  bool get valid => phone.text.replaceAll(RegExp(r'\D'), '').length >= 10;

  @override
  void dispose() {
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
                title: AppLocalizations.t('login_title'),
                onBack: widget.onBack,
              ),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(22, 34, 22, 24),
                  children: [
                    const Center(child: AppLogo(width: 230, height: 72)),
                    const SizedBox(height: 14),
                    Text(
                      AppLocalizations.t('login_subtitle'),
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: AppColors.ink500,
                        fontSize: 15,
                        height: 1.38,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 42),
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
                    const SizedBox(height: 30),
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      curve: Curves.easeOutCubic,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(999),
                        boxShadow: valid && !checking
                            ? AppShadows.button
                            : null,
                      ),
                      child: FilledButton(
                        onPressed: valid && !checking ? _continue : null,
                        style: FilledButton.styleFrom(
                          minimumSize: const Size.fromHeight(56),
                          backgroundColor: AppColors.teal700,
                          disabledBackgroundColor: const Color(0xFFE2E4E4),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                        child: checking
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2.5,
                                ),
                              )
                            : Text(
                                AppLocalizations.t('continue_btn'),
                                style: TextStyle(
                                  color: valid
                                      ? Colors.white
                                      : AppColors.ink400,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 16,
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(height: 28),
                    _RegisterSwitch(onRegister: widget.onRegister),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _continue() async {
    setState(() => checking = true);
    final cleanPhone = phone.text.replaceAll(RegExp(r'\D'), '');
    final result = await widget.api.getPatient(cleanPhone);
    if (!mounted) return;
    setState(() => checking = false);

    if (result.error != null && !result.error!.contains('HTTP 404')) {
      ErrorHandler.showError(context, result.error!);
      return;
    }

    if (result.data == null || result.error?.contains('HTTP 404') == true) {
      await showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          title: Text(AppLocalizations.t('account_not_found')),
          content: Text(AppLocalizations.t('account_not_found_desc')),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(AppLocalizations.t('ok')),
            ),
            FilledButton(
              onPressed: () {
                Navigator.pop(context);
                widget.onRegister();
              },
              child: Text(AppLocalizations.t('register_link')),
            ),
          ],
        ),
      );
      return;
    }

    widget.onOtp(cleanPhone);
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

class _RegisterSwitch extends StatelessWidget {
  const _RegisterSwitch({required this.onRegister});

  final VoidCallback onRegister;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      alignment: WrapAlignment.center,
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 2,
      children: [
        Text(
          AppLocalizations.t('no_account'),
          style: const TextStyle(
            color: AppColors.ink500,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
        TextButton(
          onPressed: onRegister,
          style: TextButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            minimumSize: const Size(0, 42),
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          child: Text(
            AppLocalizations.t('register_link'),
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
