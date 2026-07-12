import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/network/tabeebi_api_client.dart';
import '../../core/theme/app_colors.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/utils/error_handler.dart';
import '../../data/models/tabeebi_models.dart';
import '../../shared/widgets/top_bar.dart';

class OtpScreen extends StatefulWidget {
  const OtpScreen({
    super.key,
    required this.onBack,
    required this.api,
    required this.phone,
    required this.onVerified,
    this.name,
    this.isLogin = false,
  });

  final VoidCallback onBack;
  final TabeebiApiClient api;
  final String phone;
  final String? name;
  final bool isLogin;
  final void Function(UserData user, String token) onVerified;

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final digits = List.generate(4, (_) => TextEditingController());
  final nodes = List.generate(4, (_) => FocusNode());
  int seconds = 60;
  bool submitting = false;
  bool sending = false;

  String get cleanPhone => widget.phone
      .replaceAll(RegExp(r'\D'), '')
      .replaceFirst(RegExp(r'^0'), '');
  String get full => digits.map((d) => d.text).join();
  bool get valid => full.length == 4;

  @override
  void initState() {
    super.initState();
    _sendOtp();
    _tick();
  }

  @override
  void dispose() {
    for (final controller in digits) {
      controller.dispose();
    }
    for (final node in nodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _tick() {
    Future<void>.delayed(const Duration(seconds: 1), () {
      if (!mounted || seconds <= 0) return;
      setState(() => seconds--);
      _tick();
    });
  }

  Future<void> _sendOtp() async {
    setState(() => sending = true);
    final result = await widget.api.sendOtp(cleanPhone);
    if (!mounted) return;
    setState(() => sending = false);
    if (result.error != null) {
      ErrorHandler.showError(
        context,
        result.error ?? 'WhatsApp code could not be sent. Try again.',
      );
    }
  }

  Future<void> _resend() async {
    for (final controller in digits) {
      controller.clear();
    }
    setState(() => seconds = 60);
    nodes.first.requestFocus();
    _tick();
    await _sendOtp();
  }

  Future<void> _verify() async {
    if (!valid || submitting) return;
    setState(() => submitting = true);
    final result = await widget.api.verifyOtp(cleanPhone, full);
    if (!mounted) return;

    final data = result.data;
    final token = data is Map ? data['token']?.toString() : null;
    final patient = data is Map ? data['patient'] : null;

    if (result.error != null || token == null || patient is! Map) {
      setState(() {
        submitting = false;
        for (final controller in digits) {
          controller.clear();
        }
      });
      nodes.first.requestFocus();
      ErrorHandler.showError(
        context,
        result.error ?? 'The code is wrong or expired.',
      );
      return;
    }

    widget.onVerified(
      UserData(
        id: patient['id']?.toString(),
        phone: patient['phone']?.toString() ?? cleanPhone,
        name: patient['name']?.toString().isNotEmpty == true
            ? patient['name'].toString()
            : widget.name ?? '',
        avatarHue: int.tryParse(patient['avatar_hue']?.toString() ?? ''),
        isRegistered:
            patient['is_registered'] == true ||
            patient['is_registered']?.toString() == '1',
        token: token,
      ),
      token,
    );
  }

  void _setDigit(int index, String value) {
    final clean = value.replaceAll(RegExp(r'\D'), '');
    final digit = clean.isEmpty ? '' : clean.substring(clean.length - 1);
    digits[index].text = digit;
    digits[index].selection = TextSelection.collapsed(offset: digit.length);
    if (digit.isNotEmpty && index < 3) {
      nodes[index + 1].requestFocus();
    }
    setState(() {});
    if (full.length == 4) {
      FocusScope.of(context).unfocus();
      Future<void>.delayed(const Duration(milliseconds: 350), _verify);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            TopBar(
              title: AppLocalizations.t('verify_number'),
              onBack: widget.onBack,
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  const SizedBox(height: 8),
                  Text(
                    AppLocalizations.t('check_messages'),
                    style: const TextStyle(
                      color: AppColors.ink900,
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text.rich(
                    TextSpan(
                      text: '${AppLocalizations.t('otp_subtitle')} ',
                      children: [
                        TextSpan(
                          text: '+964 ${widget.phone}',
                          style: const TextStyle(
                            color: AppColors.ink900,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const TextSpan(text: '.'),
                      ],
                    ),
                    style: const TextStyle(
                      color: AppColors.ink700,
                      fontSize: 15,
                      height: 1.45,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  if (sending) ...[
                    const SizedBox(height: 8),
                    Text(
                      '${AppLocalizations.t('loading')}...',
                      style: const TextStyle(
                        color: AppColors.teal700,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                  const SizedBox(height: 28),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      for (var i = 0; i < 4; i++) ...[
                        SizedBox(
                          width: 64,
                          height: 72,
                          child: KeyboardListener(
                            focusNode: FocusNode(skipTraversal: true),
                            onKeyEvent: (event) {
                              if (event is KeyDownEvent &&
                                  event.logicalKey ==
                                      LogicalKeyboardKey.backspace &&
                                  digits[i].text.isEmpty &&
                                  i > 0) {
                                nodes[i - 1].requestFocus();
                              }
                            },
                            child: TextField(
                              controller: digits[i],
                              focusNode: nodes[i],
                              keyboardType: TextInputType.number,
                              maxLength: 1,
                              textAlign: TextAlign.center,
                              inputFormatters: [
                                FilteringTextInputFormatter.digitsOnly,
                              ],
                              onChanged: (value) => _setDigit(i, value),
                              decoration: InputDecoration(
                                counterText: '',
                                filled: true,
                                fillColor: digits[i].text.isEmpty
                                    ? AppColors.surface
                                    : AppColors.teal50,
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  borderSide: BorderSide(
                                    color: digits[i].text.isEmpty
                                        ? AppColors.ink200
                                        : AppColors.teal700,
                                    width: 1.5,
                                  ),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  borderSide: const BorderSide(
                                    color: AppColors.teal700,
                                    width: 1.5,
                                  ),
                                ),
                              ),
                              style: const TextStyle(
                                color: AppColors.ink900,
                                fontSize: 28,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ),
                        if (i != 3) const SizedBox(width: 12),
                      ],
                    ],
                  ),
                  const SizedBox(height: 24),
                  Center(
                    child: seconds > 0
                        ? Text.rich(
                            TextSpan(
                              text: '${AppLocalizations.t('resend_code_in')} ',
                              children: [
                                TextSpan(
                                  text:
                                      '0:${seconds.toString().padLeft(2, '0')}',
                                  style: const TextStyle(
                                    color: AppColors.ink700,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ],
                            ),
                            style: const TextStyle(
                              color: AppColors.ink500,
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          )
                        : TextButton(
                            onPressed: sending ? null : _resend,
                            child: Text(AppLocalizations.t('resend_code')),
                          ),
                  ),
                ],
              ),
            ),
            SafeArea(
              top: false,
              minimum: const EdgeInsets.fromLTRB(20, 0, 20, 24),
              child: FilledButton(
                onPressed: valid && !submitting ? _verify : null,
                style: FilledButton.styleFrom(
                  minimumSize: const Size.fromHeight(54),
                  backgroundColor: AppColors.teal700,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
                child: Text(
                  submitting
                      ? AppLocalizations.t('processing')
                      : AppLocalizations.t('verify_continue'),
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
