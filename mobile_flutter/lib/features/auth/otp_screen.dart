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
  bool registeredForOtp = false;
  bool verified = false;
  int errorTick = 0;

  String get cleanPhone => widget.phone
      .replaceAll(RegExp(r'\D'), '')
      .replaceFirst(RegExp(r'^0'), '');
  String get full => digits.map((d) => d.text).join();
  bool get valid => full.length == 4;

  @override
  void initState() {
    super.initState();
    for (final node in nodes) {
      node.addListener(_refreshOtpState);
    }
    _sendOtp();
    _tick();
  }

  @override
  void dispose() {
    for (final controller in digits) {
      controller.dispose();
    }
    for (final node in nodes) {
      node.removeListener(_refreshOtpState);
      node.dispose();
    }
    super.dispose();
  }

  void _refreshOtpState() {
    if (mounted) setState(() {});
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
    final result = await _requestOtp();
    if (!mounted) return;
    setState(() => sending = false);
    if (result.error != null) {
      ErrorHandler.showError(
        context,
        result.error ?? 'WhatsApp code could not be sent. Try again.',
      );
    }
  }

  Future<ApiResult<dynamic>> _requestOtp() async {
    if (widget.isLogin) {
      return widget.api.login(cleanPhone);
    }
    final name = widget.name?.trim();
    if (name != null && name.isNotEmpty && !registeredForOtp) {
      final result = await widget.api.register(cleanPhone, name);
      if (result.error == null) {
        registeredForOtp = true;
      }
      return result;
    }
    return widget.api.sendOtp(cleanPhone);
  }

  Future<void> _resend() async {
    for (final controller in digits) {
      controller.clear();
    }
    setState(() {
      seconds = 60;
      errorTick = 0;
    });
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
        verified = false;
        errorTick++;
      });
      await Future<void>.delayed(const Duration(milliseconds: 520));
      if (!mounted) return;
      for (final controller in digits) {
        controller.clear();
      }
      nodes.first.requestFocus();
      setState(() => errorTick = 0);
      return;
    }

    final user = UserData(
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
    );

    FocusScope.of(context).unfocus();
    setState(() => verified = true);
    await Future<void>.delayed(const Duration(milliseconds: 920));
    if (!mounted) return;
    widget.onVerified(user, token);
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
      Future<void>.delayed(const Duration(milliseconds: 350), _verify);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;
    final keyboardOpen = bottomInset > 0;

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
                keyboardDismissBehavior:
                    ScrollViewKeyboardDismissBehavior.manual,
                padding: EdgeInsets.fromLTRB(
                  20,
                  keyboardOpen ? 8 : 16,
                  20,
                  keyboardOpen ? 12 : 20,
                ),
                children: [
                  TweenAnimationBuilder<double>(
                    tween: Tween(begin: 0, end: 1),
                    duration: const Duration(milliseconds: 520),
                    curve: Curves.easeOutCubic,
                    builder: (context, value, child) {
                      return Opacity(
                        opacity: value,
                        child: Transform.translate(
                          offset: Offset(0, 18 * (1 - value)),
                          child: child,
                        ),
                      );
                    },
                    child: _VerificationIntroCard(
                      sending: sending,
                      compact: keyboardOpen,
                    ),
                  ),
                  SizedBox(height: keyboardOpen ? 18 : 30),
                  _OtpCodeMorph(
                    controllers: digits,
                    focusNodes: nodes,
                    verified: verified,
                    errorTick: errorTick,
                    onBackspace: (index) {
                      if (digits[index].text.isEmpty && index > 0) {
                        nodes[index - 1].requestFocus();
                      }
                    },
                    onChanged: _setDigit,
                  ),
                  SizedBox(height: keyboardOpen ? 14 : 24),
                  Center(
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 180),
                      child: errorTick > 0 && !submitting
                          ? const Text(
                              'The code is incorrect. Try again.',
                              key: ValueKey('otp-error'),
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: AppColors.red500,
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                              ),
                            )
                          : seconds > 0
                          ? Text.rich(
                              TextSpan(
                                text:
                                    '${AppLocalizations.t('resend_code_in')} ',
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
                              key: const ValueKey('otp-timer'),
                              style: const TextStyle(
                                color: AppColors.ink500,
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            )
                          : TextButton(
                              key: const ValueKey('otp-resend'),
                              onPressed: sending ? null : _resend,
                              child: Text(AppLocalizations.t('resend_code')),
                            ),
                    ),
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

class _VerificationIntroCard extends StatelessWidget {
  const _VerificationIntroCard({required this.sending, required this.compact});

  final bool sending;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
        20,
        compact ? 16 : 22,
        20,
        compact ? 16 : 20,
      ),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.74),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppColors.teal200.withValues(alpha: 0.42)),
        boxShadow: [
          BoxShadow(
            color: AppColors.teal700.withValues(alpha: 0.10),
            blurRadius: 22,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          TweenAnimationBuilder<double>(
            tween: Tween(begin: 0.94, end: sending ? 1.04 : 1),
            duration: const Duration(milliseconds: 720),
            curve: Curves.easeInOut,
            builder: (context, scale, child) {
              return Transform.scale(scale: scale, child: child);
            },
            child: Container(
              width: compact ? 56 : 72,
              height: compact ? 56 : 72,
              decoration: BoxDecoration(
                color: AppColors.teal700.withValues(alpha: 0.08),
                shape: BoxShape.circle,
                border: Border.all(
                  color: AppColors.teal700.withValues(alpha: 0.18),
                ),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: compact ? 36 : 46,
                    height: compact ? 36 : 46,
                    decoration: const BoxDecoration(
                      color: AppColors.teal50,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const Icon(
                    Icons.mark_chat_unread_outlined,
                    color: AppColors.teal700,
                    size: 25,
                  ),
                ],
              ),
            ),
          ),
          SizedBox(height: compact ? 12 : 18),
          Text(
            AppLocalizations.t('check_messages'),
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppColors.ink900,
              fontSize: compact ? 21 : 24,
              height: 1.12,
              fontWeight: FontWeight.w900,
            ),
          ),
          SizedBox(height: compact ? 6 : 9),
          const Text(
            'We sent a 4-digit code to your phone.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppColors.ink500,
              fontSize: 14,
              height: 1.45,
              fontWeight: FontWeight.w600,
            ),
          ),
          AnimatedSize(
            duration: const Duration(milliseconds: 220),
            curve: Curves.easeOutCubic,
            child: sending
                ? Padding(
                    padding: const EdgeInsets.only(top: 14),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(
                            color: AppColors.teal700,
                            strokeWidth: 2,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${AppLocalizations.t('loading')}...',
                          style: const TextStyle(
                            color: AppColors.teal700,
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                  )
                : const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }
}

class _OtpCodeMorph extends StatelessWidget {
  const _OtpCodeMorph({
    required this.controllers,
    required this.focusNodes,
    required this.verified,
    required this.errorTick,
    required this.onBackspace,
    required this.onChanged,
  });

  final List<TextEditingController> controllers;
  final List<FocusNode> focusNodes;
  final bool verified;
  final int errorTick;
  final ValueChanged<int> onBackspace;
  final void Function(int index, String value) onChanged;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final gap = constraints.maxWidth < 330 ? 8.0 : 12.0;
        final boxWidth = ((constraints.maxWidth - (gap * 3)) / 4)
            .clamp(48.0, 64.0)
            .toDouble();
        final boxHeight = boxWidth + 8;
        final totalWidth = (boxWidth * 4) + (gap * 3);
        final successSize = boxHeight;

        return TweenAnimationBuilder<double>(
          key: ValueKey(errorTick),
          tween: Tween(begin: errorTick == 0 ? 0 : 1, end: 0),
          duration: const Duration(milliseconds: 520),
          curve: Curves.easeOutCubic,
          builder: (context, shake, child) {
            final x = errorTick == 0 ? 0.0 : shake * 10;
            return Transform.translate(
              offset: Offset(x * (shake > 0.5 ? -1 : 1), 0),
              child: child,
            );
          },
          child: Center(
            child: SizedBox(
              width: totalWidth,
              height: boxHeight,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  for (var i = 0; i < 4; i++)
                    AnimatedPositioned(
                      duration: const Duration(milliseconds: 420),
                      curve: Curves.easeInOutCubic,
                      left: verified
                          ? (totalWidth - successSize) / 2
                          : i * (boxWidth + gap),
                      top: verified ? (boxHeight - successSize) / 2 : 0,
                      width: verified ? successSize : boxWidth,
                      height: successSize,
                      child: AnimatedOpacity(
                        duration: const Duration(milliseconds: 180),
                        opacity: verified && i != 0 ? 0 : 1,
                        child: verified
                            ? const _OtpSuccessBubble()
                            : _OtpDigitBox(
                                controller: controllers[i],
                                focusNode: focusNodes[i],
                                index: i,
                                width: boxWidth,
                                height: boxHeight,
                                error: errorTick > 0,
                                onBackspace: () => onBackspace(i),
                                onChanged: (value) => onChanged(i, value),
                              ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _OtpSuccessBubble extends StatelessWidget {
  const _OtpSuccessBubble();

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: const Duration(milliseconds: 360),
      curve: Curves.easeOutBack,
      builder: (context, value, child) {
        return Transform.scale(scale: 0.82 + (0.18 * value), child: child);
      },
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.green500,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: AppColors.green500.withValues(alpha: 0.28),
              blurRadius: 22,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: const Icon(Icons.check_rounded, color: Colors.white, size: 34),
      ),
    );
  }
}

class _OtpDigitBox extends StatelessWidget {
  const _OtpDigitBox({
    required this.controller,
    required this.focusNode,
    required this.index,
    required this.width,
    required this.height,
    required this.error,
    required this.onBackspace,
    required this.onChanged,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final int index;
  final double width;
  final double height;
  final bool error;
  final VoidCallback onBackspace;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final active = focusNode.hasFocus;
    final filled = controller.text.isNotEmpty;
    final borderColor = error
        ? AppColors.red500
        : active
        ? AppColors.teal700
        : filled
        ? AppColors.teal500
        : AppColors.ink200;
    final fillColor = error
        ? AppColors.red100
        : active || filled
        ? AppColors.teal50
        : AppColors.surface;

    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 280 + index * 60),
      curve: Curves.easeOutBack,
      builder: (context, value, child) {
        return Opacity(
          opacity: value.clamp(0, 1).toDouble(),
          child: Transform.translate(
            offset: Offset(0, 12 * (1 - value)),
            child: Transform.scale(scale: 0.96 + (0.04 * value), child: child),
          ),
        );
      },
      child: TweenAnimationBuilder<double>(
        tween: Tween(begin: filled ? 1.08 : 1, end: active ? 1.045 : 1),
        duration: const Duration(milliseconds: 210),
        curve: Curves.easeOutCubic,
        builder: (context, scale, child) {
          return Transform.scale(scale: scale, child: child);
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeOutCubic,
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: fillColor,
            borderRadius: BorderRadius.circular(active ? 20 : 18),
            border: Border.all(color: borderColor, width: active ? 2 : 1.5),
            boxShadow: error || active || filled
                ? [
                    BoxShadow(
                      color: (error ? AppColors.red500 : AppColors.teal700)
                          .withValues(
                            alpha: error
                                ? 0.20
                                : active
                                ? 0.22
                                : 0.12,
                          ),
                      blurRadius: active ? 18 : 12,
                      offset: Offset(0, active ? 8 : 5),
                    ),
                    if (filled && !error)
                      BoxShadow(
                        color: AppColors.teal200.withValues(alpha: 0.34),
                        blurRadius: 18,
                        spreadRadius: 1,
                      ),
                  ]
                : null,
          ),
          child: Focus(
            onKeyEvent: (node, event) {
              if (event is KeyDownEvent &&
                  event.logicalKey == LogicalKeyboardKey.backspace) {
                onBackspace();
              }
              return KeyEventResult.ignored;
            },
            child: TextField(
              controller: controller,
              focusNode: focusNode,
              keyboardType: TextInputType.number,
              maxLength: 1,
              textAlign: TextAlign.center,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              onChanged: onChanged,
              decoration: const InputDecoration(
                counterText: '',
                border: InputBorder.none,
                focusedBorder: InputBorder.none,
                enabledBorder: InputBorder.none,
                contentPadding: EdgeInsets.only(top: 14),
              ),
              style: TextStyle(
                color: filled ? AppColors.teal900 : AppColors.ink900,
                fontSize: 28,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
