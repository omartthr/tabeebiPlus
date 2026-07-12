import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../data/models/tabeebi_models.dart';
import '../../data/repositories/tabeebi_repository.dart';
import '../../shared/widgets/top_bar.dart';
import '../../shared/widgets/app_logo.dart';
import '../../shared/widgets/status_badge.dart';

class HelpScreen extends StatefulWidget {
  const HelpScreen({
    super.key,
    required this.repository,
    required this.onBack,
  });

  final TabeebiRepository repository;
  final VoidCallback onBack;

  @override
  State<HelpScreen> createState() => _HelpScreenState();
}

class _HelpScreenState extends State<HelpScreen> {
  String _view = 'main'; // 'main' or 'form'
  String _category = 'booking';
  final _subjectCtrl = TextEditingController();
  final _messageCtrl = TextEditingController();
  int? _openFaqIndex;
  bool _submitting = false;
  late Future<List<SupportTicket>> _ticketsFuture;

  final List<Map<String, String>> _categories = [
    {'id': 'booking', 'label': 'Booking'},
    {'id': 'payment', 'label': 'Payment'},
    {'id': 'result', 'label': 'Results'},
    {'id': 'other', 'label': 'Other'},
  ];

  final List<Map<String, String>> _faqs = [
    {
      'q': 'How can I book an appointment?',
      'a': 'You can easily book an appointment by selecting the desired specialty from the home page, choosing your doctor, and setting an available time.',
    },
    {
      'q': 'Can I cancel my appointment?',
      'a': 'You can freely cancel unconfirmed appointments. However, frequent cancellations of confirmed appointments may result in a temporary block of your account.',
    },
    {
      'q': 'Where can I see my results?',
      'a': 'You can access all your past medical reports and AI summaries from the "My Results" tab.',
    },
    {
      'q': 'How is the payment made?',
      'a': 'We offer both online (card or Zain Cash) and in-clinic cash payment options.',
    },
  ];

  @override
  void initState() {
    super.initState();
    _ticketsFuture = widget.repository.getSupportTickets();
  }

  @override
  void dispose() {
    _subjectCtrl.dispose();
    _messageCtrl.dispose();
    super.dispose();
  }

  void _refreshTickets() {
    setState(() {
      _ticketsFuture = widget.repository.getSupportTickets();
    });
  }

  Future<void> _submitTicket() async {
    final sub = _subjectCtrl.text.trim();
    final msg = _messageCtrl.text.trim();
    if (sub.isEmpty || msg.isEmpty) return;

    setState(() {
      _submitting = true;
    });

    try {
      final success = await widget.repository.createSupportTicket(sub, msg);
      if (!mounted) return;

      if (success) {
        _subjectCtrl.clear();
        _messageCtrl.clear();
        _refreshTickets();
        
        // Show success alert
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            title: const Row(
              children: [
                Icon(Icons.check_circle_rounded, color: AppColors.green500),
                SizedBox(width: 8),
                Text('Ticket Submitted'),
              ],
            ),
            content: const Text(
              'Your complaint has been submitted successfully. We will review it and get back to you as soon as possible.',
              style: TextStyle(color: AppColors.ink700),
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  setState(() {
                    _view = 'main';
                  });
                },
                child: const Text(
                  'OK',
                  style: TextStyle(
                    color: AppColors.teal700,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to submit ticket. Please try again.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _submitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: Column(
        children: [
          TopBar(
            title: _view == 'form' ? 'New complaint' : 'Help center',
            onBack: () {
              if (_view == 'form') {
                setState(() => _view = 'main');
              } else {
                widget.onBack();
              }
            },
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              children: [
                if (_view == 'main') ...[
                  // Complaint Entry Button
                  GestureDetector(
                    onTap: () => setState(() => _view = 'form'),
                    child: Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppColors.ink100),
                        boxShadow: AppShadows.card,
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 52,
                            height: 52,
                            decoration: BoxDecoration(
                              color: AppColors.teal50,
                              borderRadius: BorderRadius.circular(18),
                            ),
                            child: const Icon(
                              Icons.message_outlined,
                              color: AppColors.teal700,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 14),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Contact Us / Submit Complaint',
                                  style: TextStyle(
                                    color: AppColors.ink900,
                                    fontSize: 15,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                                SizedBox(height: 3),
                                Text(
                                  'Send your issues directly to us.',
                                  style: TextStyle(
                                    color: AppColors.ink500,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Icon(
                            Icons.chevron_right_rounded,
                            color: AppColors.ink400,
                            size: 20,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // FAQ Title
                  const Text(
                    'FREQUENTLY ASKED QUESTIONS',
                    style: TextStyle(
                      color: AppColors.ink500,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 10),

                  // FAQ Card/List
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppColors.ink100),
                      boxShadow: AppShadows.card,
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Column(
                      children: List.generate(_faqs.length, (idx) {
                        final isLast = idx == _faqs.length - 1;
                        final isOpen = _openFaqIndex == idx;
                        return Column(
                          children: [
                            InkWell(
                              onTap: () {
                                setState(() {
                                  _openFaqIndex = isOpen ? null : idx;
                                });
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(18),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        _faqs[idx]['q']!,
                                        style: const TextStyle(
                                          color: AppColors.ink900,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ),
                                    AnimatedRotation(
                                      turns: isOpen ? 0.5 : 0.0,
                                      duration: const Duration(milliseconds: 200),
                                      child: const Icon(
                                        Icons.keyboard_arrow_down_rounded,
                                        color: AppColors.ink400,
                                        size: 20,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            if (isOpen)
                              Padding(
                                padding: const EdgeInsets.fromLTRB(18, 0, 18, 18),
                                child: Text(
                                  _faqs[idx]['a']!,
                                  style: const TextStyle(
                                    color: AppColors.ink500,
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                    height: 1.45,
                                  ),
                                ),
                              ),
                            if (!isLast)
                              const Divider(height: 1, color: AppColors.ink100),
                          ],
                        );
                      }),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // About Us Section
                  const Text(
                    'ABOUT US',
                    style: TextStyle(
                      color: AppColors.ink500,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppColors.ink100),
                      boxShadow: AppShadows.card,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.info_outline_rounded,
                              color: AppColors.teal700,
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                            const AppLogo(
                              variant: AppLogoVariant.light,
                              width: 110,
                              height: 28,
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'Tabeebi+ is a modern health platform that provides easy access to specialist doctors across Kirkuk. Our goal is to accelerate healthcare processes by digitizing communication between patients and doctors.',
                          style: TextStyle(
                            color: AppColors.ink700,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            height: 1.45,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Tickets Section
                  const Text(
                    'YOUR COMPLAINTS',
                    style: TextStyle(
                      color: AppColors.ink500,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 10),
                  FutureBuilder<List<SupportTicket>>(
                    future: _ticketsFuture,
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Center(
                          child: Padding(
                            padding: EdgeInsets.symmetric(vertical: 20),
                            child: CircularProgressIndicator(color: AppColors.teal700),
                          ),
                        );
                      }
                      final tickets = snapshot.data ?? [];
                      if (tickets.isEmpty) {
                        return const Padding(
                          padding: EdgeInsets.symmetric(vertical: 12),
                          child: Center(
                            child: Text(
                              'You have no complaints yet.',
                              style: TextStyle(color: AppColors.ink400, fontSize: 13),
                            ),
                          ),
                        );
                      }
                      return Column(
                        children: tickets.map((t) => _TicketCard(ticket: t)).toList(),
                      );
                    },
                  ),
                ] else ...[
                  // FORM VIEW
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppColors.ink100),
                      boxShadow: AppShadows.card,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Category',
                          style: TextStyle(
                            color: AppColors.ink500,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 10),

                        // Categories chips
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: _categories.map((c) {
                            final isSel = _category == c['id'];
                            return Expanded(
                              child: GestureDetector(
                                onTap: () => setState(() => _category = c['id']!),
                                child: Container(
                                  margin: const EdgeInsets.symmetric(horizontal: 3),
                                  padding: const EdgeInsets.symmetric(vertical: 8),
                                  decoration: BoxDecoration(
                                    color: isSel ? AppColors.teal700 : AppColors.ink100,
                                    borderRadius: BorderRadius.circular(100),
                                  ),
                                  alignment: Alignment.center,
                                  child: Text(
                                    c['label']!,
                                    style: TextStyle(
                                      color: isSel ? Colors.white : AppColors.ink700,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 18),

                        // Subject Input
                        const Text(
                          'Subject',
                          style: TextStyle(
                            color: AppColors.ink500,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.ink200, width: 1.5),
                          ),
                          child: TextField(
                            controller: _subjectCtrl,
                            style: const TextStyle(
                              color: AppColors.ink900,
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                            decoration: const InputDecoration(
                              hintText: 'Enter ticket subject',
                              hintStyle: TextStyle(color: AppColors.ink400),
                              border: InputBorder.none,
                              contentPadding: EdgeInsets.symmetric(vertical: 14),
                            ),
                          ),
                        ),
                        const SizedBox(height: 18),

                        // Message Input
                        const Text(
                          'Describe your issue...',
                          style: TextStyle(
                            color: AppColors.ink500,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.ink200, width: 1.5),
                          ),
                          child: TextField(
                            controller: _messageCtrl,
                            maxLines: 5,
                            minLines: 4,
                            style: const TextStyle(
                              color: AppColors.ink900,
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                            decoration: const InputDecoration(
                              hintText: 'Enter your message',
                              hintStyle: TextStyle(color: AppColors.ink400),
                              border: InputBorder.none,
                              contentPadding: EdgeInsets.symmetric(vertical: 14),
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Submit Button
                        GestureDetector(
                          onTap: _submitting ? null : _submitTicket,
                          child: Container(
                            height: 54,
                            decoration: BoxDecoration(
                              color: _submitting ? AppColors.ink200 : AppColors.teal700,
                              borderRadius: BorderRadius.circular(999),
                              boxShadow: _submitting ? null : AppShadows.button,
                            ),
                            alignment: Alignment.center,
                            child: _submitting
                                ? const SizedBox(
                                    width: 22,
                                    height: 22,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2.5,
                                    ),
                                  )
                                : const Text(
                                    'Submit complaint',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 15,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _TicketCard extends StatelessWidget {
  const _TicketCard({required this.ticket});

  final SupportTicket ticket;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.ink100),
        boxShadow: AppShadows.card,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  ticket.subject,
                  style: const TextStyle(
                    color: AppColors.ink900,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              StatusBadge(status: ticket.status),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            ticket.time,
            style: const TextStyle(
              color: AppColors.ink400,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.bg,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              ticket.last,
              style: const TextStyle(
                color: AppColors.ink700,
                fontSize: 13,
                fontWeight: FontWeight.w500,
                height: 1.45,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
