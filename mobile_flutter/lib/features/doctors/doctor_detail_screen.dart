import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/theme/app_colors.dart';
import '../../core/utils/tabeebi_date_utils.dart';
import '../../data/models/tabeebi_models.dart';
import '../../data/repositories/tabeebi_repository.dart';
import '../../shared/widgets/doc_avatar.dart';
import '../../shared/widgets/top_bar.dart';

class DoctorDetailScreen extends StatefulWidget {
  const DoctorDetailScreen({
    super.key,
    required this.doctor,
    required this.repository,
    required this.onBack,
    required this.onBook,
  });

  final Doctor doctor;
  final TabeebiRepository repository;
  final VoidCallback onBack;
  final ValueChanged<Doctor> onBook;

  @override
  State<DoctorDetailScreen> createState() => _DoctorDetailScreenState();
}

class _DoctorDetailScreenState extends State<DoctorDetailScreen> {
  Map<String, dynamic>? schedule;
  bool scheduleLoading = true;

  static const _days = [
    ('mon', 'Monday'),
    ('tue', 'Tuesday'),
    ('wed', 'Wednesday'),
    ('thu', 'Thursday'),
    ('fri', 'Friday'),
    ('sat', 'Saturday'),
    ('sun', 'Sunday'),
  ];

  @override
  void initState() {
    super.initState();
    _loadSchedule();
  }

  Future<void> _loadSchedule() async {
    if (widget.doctor.registrationId == null) {
      setState(() => scheduleLoading = false);
      return;
    }
    final sched = await widget.repository.getDoctorSchedule(widget.doctor.id);
    if (mounted) {
      setState(() {
        schedule = sched;
        scheduleLoading = false;
      });
    }
  }

  String _hoursText(String dayKey) {
    if (scheduleLoading) return '...';
    if (schedule == null || schedule![dayKey] == null) return 'Closed';
    final d = schedule![dayKey] as Map?;
    if (d == null) return 'Closed';
    final isOpen = d['isOpen'] == true || d['isOpen'] == 1;
    if (!isOpen) return 'Closed';
    final slots = d['slots'];
    if (slots is! List || slots.isEmpty) return 'Closed';
    final first = slots.first.toString();
    final last = slots.last.toString();
    return '$first – $last';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          TopBar(title: 'Doctor profile', onBack: widget.onBack),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
              children: [
                // Hero section
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    DocAvatar(
                      initials: widget.doctor.initials,
                      hue: widget.doctor.hue,
                      size: 88,
                      rounded: 22,
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.doctor.name,
                            style: const TextStyle(
                              color: AppColors.ink900,
                              fontSize: 20,
                              fontWeight: FontWeight.w900,
                              height: 1.2,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            widget.doctor.specialty,
                            style: const TextStyle(
                              color: AppColors.ink500,
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(
                                Icons.star_rounded,
                                color: AppColors.amber500,
                                size: 16,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '${widget.doctor.rating.toStringAsFixed(1)} (${widget.doctor.reviews})',
                                style: const TextStyle(
                                  color: AppColors.ink700,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13,
                                ),
                              ),
                              if (widget.doctor.today) ...[
                                const SizedBox(width: 10),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 3,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.green100,
                                    borderRadius: BorderRadius.circular(100),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Container(
                                        width: 6,
                                        height: 6,
                                        decoration: const BoxDecoration(
                                          color: AppColors.green500,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      const Text(
                                        'Today',
                                        style: TextStyle(
                                          color: Color(0xFF0d6b4a),
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                // Info chips
                Wrap(
                  spacing: 8,
                  children: [
                    _InfoChip(
                      icon: Icons.payments_outlined,
                      label: 'IQD ${iqd(widget.doctor.price)}',
                      bg: AppColors.amber50,
                      fg: AppColors.amber700,
                    ),
                    _InfoChip(
                      icon: Icons.access_time_rounded,
                      label: '${widget.doctor.exp} experience',
                      bg: AppColors.teal50,
                      fg: AppColors.teal700,
                    ),
                  ],
                ),
                const Divider(height: 32, color: AppColors.ink100),
                // Location
                if (widget.doctor.locationLat != null &&
                    widget.doctor.locationLng != null) ...[
                  GestureDetector(
                    onTap: () async {
                      final url =
                          'https://www.google.com/maps/search/?api=1&query=${widget.doctor.locationLat},${widget.doctor.locationLng}';
                      final uri = Uri.parse(url);
                      if (await canLaunchUrl(uri)) {
                        launchUrl(uri, mode: LaunchMode.externalApplication);
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.teal50,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: AppColors.ink100),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              boxShadow: AppShadows.card,
                            ),
                            alignment: Alignment.center,
                            child: const Icon(
                              Icons.location_on_rounded,
                              color: AppColors.teal700,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${widget.doctor.locationLat!.toStringAsFixed(4)}, ${widget.doctor.locationLng!.toStringAsFixed(4)}',
                                  style: const TextStyle(
                                    color: AppColors.teal700,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 13,
                                  ),
                                ),
                                Text(
                                  widget.doctor.locationAddress ??
                                      'Tap to view on maps',
                                  style: const TextStyle(
                                    color: AppColors.teal800,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          const Icon(
                            Icons.open_in_new_rounded,
                            color: AppColors.teal700,
                            size: 16,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                ] else if (widget.doctor.loc.isNotEmpty) ...[
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.teal50,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppColors.ink100),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.location_on_rounded,
                          color: AppColors.ink400,
                          size: 20,
                        ),
                        const SizedBox(width: 10),
                        Text(
                          widget.doctor.loc,
                          style: const TextStyle(
                            color: AppColors.ink700,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                ],
                // Working hours
                const Text(
                  'WORKING HOURS',
                  style: TextStyle(
                    color: AppColors.ink500,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 10),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.ink100),
                    boxShadow: AppShadows.card,
                  ),
                  child: Column(
                    children: _days.map((d) {
                      final hoursText = _hoursText(d.$1);
                      final isClosed = hoursText == 'Closed';
                      final isLast = d == _days.last;
                      return Column(
                        children: [
                          Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 10,
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    d.$2,
                                    style: const TextStyle(
                                      color: AppColors.ink700,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 13,
                                    ),
                                  ),
                                ),
                                Text(
                                  hoursText,
                                  style: TextStyle(
                                    color: isClosed
                                        ? AppColors.red500
                                        : AppColors.ink900,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (!isLast)
                            const Divider(height: 1, color: AppColors.ink100),
                        ],
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 110),
              ],
            ),
          ),
          SafeArea(
            top: false,
            minimum: const EdgeInsets.fromLTRB(20, 0, 20, 20),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'CONSULTATION',
                        style: TextStyle(
                          color: AppColors.ink500,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.5,
                        ),
                      ),
                      Text(
                        'IQD ${iqd(widget.doctor.price)}',
                        style: const TextStyle(
                          color: AppColors.ink900,
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: GestureDetector(
                    onTap: () => widget.onBook(widget.doctor),
                    child: Container(
                      height: 54,
                      decoration: BoxDecoration(
                        color: AppColors.teal700,
                        borderRadius: BorderRadius.circular(999),
                        boxShadow: AppShadows.button,
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        'Book appointment',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  const _InfoChip({
    required this.icon,
    required this.label,
    required this.bg,
    required this.fg,
  });

  final IconData icon;
  final String label;
  final Color bg;
  final Color fg;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: fg, size: 14),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: fg,
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
