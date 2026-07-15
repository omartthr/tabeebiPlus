import 'dart:ui';

import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

class _Message {
  const _Message({required this.role, required this.text});
  final String role; // 'user' or 'assistant'
  final String text;
}

const _suggestions = [
  'What are common symptoms of diabetes?',
  'How do I prepare for a dental appointment?',
  'What vitamins should I take daily?',
];

class AiChatScreen extends StatefulWidget {
  const AiChatScreen({super.key});

  @override
  State<AiChatScreen> createState() => _AiChatScreenState();
}

class _AiChatScreenState extends State<AiChatScreen> {
  final List<_Message> messages = [];
  final _inputCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  bool _sending = false;

  @override
  void dispose() {
    _inputCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 350),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _send(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || _sending) return;
    _inputCtrl.clear();
    setState(() {
      messages.add(_Message(role: 'user', text: trimmed));
      _sending = true;
    });
    _scrollToBottom();
    // Simulate AI response delay
    await Future.delayed(const Duration(milliseconds: 800));
    if (!mounted) return;
    setState(() {
      messages.add(const _Message(
        role: 'assistant',
        text:
            'Thank you for your question. Our AI assistant is currently being set up. '
            'For medical advice, please consult a qualified doctor through the booking screen.',
      ));
      _sending = false;
    });
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          Container(
            margin: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.82),
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: AppColors.ink100),
              boxShadow: [
                BoxShadow(
                  color: AppColors.ink900.withValues(alpha: 0.035),
                  blurRadius: 16,
                  offset: const Offset(0, 7),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.76),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: AppColors.teal800.withValues(alpha: 0.10),
                    ),
                  ),
                  alignment: Alignment.center,
                  child: const _TabeebiIconMark(
                    size: 28,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'AI Health Assistant',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: AppColors.ink900,
                          fontSize: 17,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.3,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        _sending ? 'Typing...' : 'Powered by Tabeebi AI',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: AppColors.ink400,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              controller: _scrollCtrl,
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
              children: [
                if (messages.isEmpty)
                  _EmptyState(
                    onSuggestion: _send,
                  ),
                for (final msg in messages)
                  _Bubble(message: msg),
                if (_sending)
                  const _TypingBubble(),
              ],
            ),
          ),
          SafeArea(
            top: false,
            minimum: const EdgeInsets.fromLTRB(16, 0, 16, 10),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(26),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.76),
                    borderRadius: BorderRadius.circular(26),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.62)),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.teal800.withValues(alpha: 0.055),
                        blurRadius: 18,
                        offset: const Offset(0, 7),
                      ),
                    ],
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Expanded(
                        child: Container(
                          constraints: const BoxConstraints(maxHeight: 100),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.78),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppColors.ink100),
                          ),
                          child: TextField(
                            controller: _inputCtrl,
                            maxLines: null,
                            onChanged: (_) => setState(() {}),
                            onSubmitted: _send,
                            style: const TextStyle(
                              color: AppColors.ink900,
                              fontSize: 14,
                            ),
                            decoration: const InputDecoration(
                              hintText: 'Ask about symptoms, medications...',
                              hintStyle: TextStyle(color: AppColors.ink400),
                              contentPadding: EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 10,
                              ),
                              border: InputBorder.none,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: _inputCtrl.text.trim().isEmpty
                            ? null
                            : () => _send(_inputCtrl.text),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            color: _inputCtrl.text.trim().isEmpty
                                ? AppColors.ink200
                                : AppColors.teal800,
                            shape: BoxShape.circle,
                            boxShadow: _inputCtrl.text.trim().isEmpty
                                ? null
                                : [
                                    BoxShadow(
                                      color: AppColors.teal800.withValues(alpha: 0.18),
                                      blurRadius: 12,
                                      offset: const Offset(0, 5),
                                    ),
                                  ],
                          ),
                          alignment: Alignment.center,
                          child: const Icon(
                            Icons.send_rounded,
                            color: Colors.white,
                            size: 18,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.onSuggestion});
  final ValueChanged<String> onSuggestion;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 28, 4, 0),
      child: Column(
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.78),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.teal800.withValues(alpha: 0.10)),
              boxShadow: [
                BoxShadow(
                  color: AppColors.teal800.withValues(alpha: 0.045),
                  blurRadius: 16,
                  offset: const Offset(0, 7),
                ),
              ],
            ),
            alignment: Alignment.center,
            child: const _TabeebiIconMark(
              size: 42,
            ),
          ),
          const SizedBox(height: 14),
          const Text(
            'How can I help?',
            style: TextStyle(
              color: AppColors.ink900,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Ask me about symptoms, medications,\nor general health questions.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppColors.ink500,
              fontSize: 13,
              height: 1.45,
            ),
          ),
          const SizedBox(height: 20),
          for (final s in _suggestions)
            GestureDetector(
              onTap: () => onSuggestion(s),
              child: Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.86),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.ink100),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.ink900.withValues(alpha: 0.025),
                      blurRadius: 12,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        s,
                        style: const TextStyle(
                          color: AppColors.ink700,
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Icon(
                      Icons.chevron_right_rounded,
                      color: AppColors.teal800,
                      size: 18,
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _Bubble extends StatelessWidget {
  const _Bubble({required this.message});
  final _Message message;

  @override
  Widget build(BuildContext context) {
    final isUser = message.role == 'user';
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.78,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isUser
              ? AppColors.teal800
              : Colors.white.withValues(alpha: 0.86),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(18),
            topRight: const Radius.circular(18),
            bottomLeft: Radius.circular(isUser ? 18 : 4),
            bottomRight: Radius.circular(isUser ? 4 : 18),
          ),
          border: isUser ? null : Border.all(color: AppColors.ink100),
          boxShadow: [
            BoxShadow(
              color: (isUser ? AppColors.teal800 : AppColors.ink900)
                  .withValues(alpha: isUser ? 0.12 : 0.03),
              blurRadius: isUser ? 14 : 12,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Text(
          message.text,
          style: TextStyle(
            color: isUser ? Colors.white : AppColors.ink900,
            fontSize: 14,
            fontWeight: FontWeight.w500,
            height: 1.4,
          ),
        ),
      ),
    );
  }
}

class _TypingBubble extends StatelessWidget {
  const _TypingBubble();

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      alignment: Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.86),
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(18),
            topRight: Radius.circular(18),
            bottomLeft: Radius.circular(4),
            bottomRight: Radius.circular(18),
          ),
          border: Border.all(color: AppColors.ink100),
          boxShadow: [
            BoxShadow(
              color: AppColors.ink900.withValues(alpha: 0.03),
              blurRadius: 12,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (final delay in [0, 150, 300])
              _Dot(delay: delay),
          ],
        ),
      ),
    );
  }
}

class _Dot extends StatefulWidget {
  const _Dot({required this.delay});
  final int delay;

  @override
  State<_Dot> createState() => _DotState();
}

class _DotState extends State<_Dot> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _anim = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
    );
    Future.delayed(Duration(milliseconds: widget.delay), () {
      if (mounted) _ctrl.repeat(reverse: true);
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) => Container(
        width: 7,
        height: 7,
        margin: const EdgeInsets.symmetric(horizontal: 2),
        decoration: BoxDecoration(
          color: AppColors.ink400.withValues(alpha: 0.4 + 0.6 * _anim.value),
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}

class _TabeebiIconMark extends StatelessWidget {
  const _TabeebiIconMark({required this.size});

  final double size;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: Center(
        child: ClipRect(
          child: Align(
            alignment: Alignment.centerLeft,
            widthFactor: 0.82,
            child: Image.asset(
              'assets/images/logo_icon_dark.png',
              width: size,
              height: size,
              fit: BoxFit.contain,
              color: AppColors.teal800,
              colorBlendMode: BlendMode.srcIn,
              errorBuilder: (_, _, _) => Icon(
                Icons.medical_services_outlined,
                color: AppColors.teal800,
                size: size * 0.72,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
