import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/utils/error_handler.dart';
import '../../core/network/tabeebi_api_client.dart';
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
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            TopBar(
              title: AppLocalizations.t('login_title'),
              onBack: widget.onBack,
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(24),
                children: [
                  const SizedBox(height: 54),
                  const Center(child: AppLogo(width: 240, height: 60)),
                  const SizedBox(height: 12),
                  Text(
                    AppLocalizations.t('login_subtitle'),
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: AppColors.ink500, fontSize: 15),
                  ),
                  const SizedBox(height: 40),
                  Text(
                    AppLocalizations.t('phone_number'),
                    style: const TextStyle(
                      color: AppColors.ink700,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: phone,
                    onChanged: (_) => setState(() {}),
                    keyboardType: TextInputType.phone,
                    decoration: _inputDecoration('750 123 4567'),
                  ),
                  const SizedBox(height: 28),
                  FilledButton(
                    onPressed: valid && !checking ? _continue : null,
                    style: FilledButton.styleFrom(
                      minimumSize: const Size.fromHeight(54),
                      backgroundColor: AppColors.teal700,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                    child: checking
                        ? const CircularProgressIndicator(color: Colors.white)
                        : Text(
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
                        onPressed: widget.onRegister,
                        child: Text(AppLocalizations.t('register_link')),
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
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Text(AppLocalizations.t('account_not_found')),
          content: Text(
            AppLocalizations.t('account_not_found_desc'),
          ),
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

InputDecoration _inputDecoration(String hint) {
  return InputDecoration(
    hintText: hint,
    hintStyle: const TextStyle(color: AppColors.ink400),
    filled: true,
    fillColor: AppColors.surface,
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 17),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: const BorderSide(color: AppColors.ink200, width: 1.5),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: const BorderSide(color: AppColors.teal700, width: 1.5),
    ),
  );
}
