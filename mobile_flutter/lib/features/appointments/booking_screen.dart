import 'dart:ui';

import 'package:flutter/material.dart';

import '../../app/app_route.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/tabeebi_date_utils.dart';
import '../../data/models/tabeebi_models.dart';
import '../../data/repositories/tabeebi_repository.dart';
import '../../shared/widgets/top_bar.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({
    super.key,
    required this.doctor,
    required this.repository,
    this.patientId,
    required this.onBack,
    required this.onConfirmed,
  });

  final Doctor doctor;
  final TabeebiRepository repository;
  final String? patientId;
  final VoidCallback onBack;
  final ValueChanged<BookingDraft> onConfirmed;

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  late Day day = generateDays().first;
  String payment = 'Card';
  bool loadingSlots = false;
  List<String> hourBlocks = [];
  Set<String> bookedTimes = {};
  String? selectedHour;
  String? time;

  @override
  void initState() {
    super.initState();
    _loadSlotsForDay(day);
  }

  List<String> _gen10MinSlots(String hourStart) {
    final parts = hourStart.split(':');
    if (parts.length < 2) return const [];
    final h = int.tryParse(parts[0]);
    final m = int.tryParse(parts[1].replaceAll(RegExp(r'\D'), ''));
    if (h == null || m == null) return const [];

    return List.generate(6, (index) {
      final total = m + index * 10;
      final hh = h + total ~/ 60;
      final mm = total % 60;
      return '${hh.toString().padLeft(2, '0')}:${mm.toString().padLeft(2, '0')}';
    });
  }

  Future<void> _loadSlotsForDay(Day selectedDay) async {
    setState(() {
      loadingSlots = true;
      hourBlocks = [];
      bookedTimes = {};
      selectedHour = null;
      time = null;
    });

    try {
      final schedule = await widget.repository.getDoctorSchedule(
        widget.doctor.id,
      );
      final dayMap = {
        'Mon': 'mon',
        'Tue': 'tue',
        'Wed': 'wed',
        'Thu': 'thu',
        'Fri': 'fri',
        'Sat': 'sat',
        'Sun': 'sun',
      };
      final schedKey = dayMap[selectedDay.day] ?? selectedDay.key.toLowerCase();
      final daySched = schedule?[schedKey] as Map<String, dynamic>?;
      final blocks = _hourBlocksFromSchedule(daySched);
      final booked = await widget.repository.getBookedTimes(
        widget.doctor.id,
        selectedDay.key,
      );

      if (!mounted) return;
      setState(() {
        hourBlocks = blocks;
        bookedTimes = booked.map(_normalizeBookedTime).toSet();
        loadingSlots = false;
      });
    } catch (_) {
      if (mounted) setState(() => loadingSlots = false);
    }
  }

  List<String> _hourBlocksFromSchedule(Map<String, dynamic>? daySched) {
    if (daySched == null) return const [];
    final isOpen = daySched['isOpen'] == true || daySched['isOpen'] == 1;
    if (!isOpen) return const [];
    final raw = daySched['slots'];
    if (raw is! List || raw.isEmpty) return const [];

    return raw
        .map((slot) => slot.toString().split(' - ').first.trim())
        .where((slot) => slot.contains(':'))
        .toList();
  }

  bool _isHourFull(String hour) {
    return _gen10MinSlots(hour).every(_isSlotUnavailable);
  }

  bool _isSlotUnavailable(String slot) {
    return bookedTimes.contains(_normalizeBookedTime(slot)) ||
        isAppointmentPast(day.key, slot);
  }

  String _normalizeBookedTime(String raw) {
    final trimmed = raw.trim();
    final match = RegExp(r'^(\d{1,2}):(\d{2})').firstMatch(trimmed);
    if (match == null) return trimmed;
    final hour = int.tryParse(match.group(1) ?? '') ?? 0;
    final minute = int.tryParse(match.group(2) ?? '') ?? 0;
    return '${hour.toString().padLeft(2, '0')}:${minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final days = generateDays();
    final tenMinSlots = selectedHour == null
        ? const <String>[]
        : _gen10MinSlots(selectedHour!);
    final canBook = time != null;

    return Scaffold(
      backgroundColor: AppColors.bg,
      body: Stack(
        children: [
          Column(
            children: [
              TopBar(title: 'Book appointment', onBack: widget.onBack),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 128),
                  children: [
                    _DoctorRecap(doctor: widget.doctor),
                    const SizedBox(height: 20),
                    const _SectionLabel('CHOOSE DAY'),
                    const SizedBox(height: 10),
                    SizedBox(
                      height: 84,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: days.length,
                        separatorBuilder: (_, _) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final d = days[index];
                          return _DayButton(
                            day: d,
                            active: d.key == day.key,
                            onTap: () {
                              setState(() => day = d);
                              _loadSlotsForDay(d);
                            },
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 20),
                    const _SectionLabel('AVAILABLE TIME'),
                    const SizedBox(height: 10),
                    if (loadingSlots)
                      const Padding(
                        padding: EdgeInsets.all(20),
                        child: Center(
                          child: CircularProgressIndicator(
                            color: AppColors.teal700,
                          ),
                        ),
                      )
                    else if (hourBlocks.isEmpty)
                      const _EmptyState('No slots available for this day.')
                    else
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          for (final hour in hourBlocks)
                            _HourButton(
                              hour: hour,
                              active: selectedHour == hour,
                              full: _isHourFull(hour),
                              onTap: () => setState(() {
                                selectedHour = hour;
                                time = null;
                              }),
                            ),
                        ],
                      ),
                    if (selectedHour != null) ...[
                      const SizedBox(height: 20),
                      _SectionLabel('$selectedHour - SELECT TIME'),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          for (final slot in tenMinSlots)
                            _SlotButton(
                              slot: slot,
                              active: time == slot,
                              disabled: _isSlotUnavailable(slot),
                              onTap: () => setState(() => time = slot),
                            ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      const _Legend(),
                    ],
                    const SizedBox(height: 20),
                    const _SectionLabel('PAYMENT METHOD'),
                    const SizedBox(height: 10),
                    Column(
                      children: [
                        _PaymentOption(
                          title: 'Pay online',
                          subtitle: 'Reserve now with card payment',
                          icon: Icons.credit_card_outlined,
                          selected: payment == 'Card',
                          onTap: () => setState(() => payment = 'Card'),
                        ),
                        const SizedBox(height: 10),
                        _PaymentOption(
                          title: 'Pay at clinic',
                          subtitle: 'Pay when you arrive',
                          icon: Icons.account_balance_wallet_outlined,
                          selected: payment == 'Cash',
                          onTap: () => setState(() => payment = 'Cash'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    _SummaryCard(price: widget.doctor.price),
                  ],
                ),
              ),
            ],
          ),
          _FooterBar(
            day: day,
            price: widget.doctor.price,
            time: time,
            enabled: canBook,
            onConfirm: _confirm,
          ),
        ],
      ),
    );
  }

  Future<void> _confirm() async {
    if (time == null) return;
    final result = await widget.repository.createAppointment({
      'doctor_id': widget.doctor.id,
      'patient_id': widget.patientId,
      'date': day.key,
      'time': time,
      'payment': payment.toLowerCase(),
      'status': 'pending',
      'price': widget.doctor.price,
    });
    if (!mounted) return;
    if (result.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Booking failed: ${result.error}'),
          backgroundColor: AppColors.red500,
        ),
      );
      return;
    }
    widget.onConfirmed(
      BookingDraft(
        doctor: widget.doctor,
        day: day.full,
        time: time!,
        payment: payment,
      ),
    );
  }
}

class _DoctorRecap extends StatelessWidget {
  const _DoctorRecap({required this.doctor});

  final Doctor doctor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.82),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.ink100),
        boxShadow: [
          BoxShadow(
            color: AppColors.ink900.withValues(alpha: 0.04),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.86),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.ink100),
            ),
            alignment: Alignment.center,
            child: Text(
              doctor.initials,
              style: const TextStyle(
                color: AppColors.ink500,
                fontSize: 16,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  doctor.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppColors.ink900,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  doctor.specialty,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppColors.ink500,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
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

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: const TextStyle(
        color: AppColors.ink500,
        fontSize: 11,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.3,
      ),
    );
  }
}

class _DayButton extends StatelessWidget {
  const _DayButton({
    required this.day,
    required this.active,
    required this.onTap,
  });

  final Day day;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        width: 66,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 11),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: active ? 0.90 : 0.78),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: active ? AppColors.ink700 : AppColors.ink100,
            width: active ? 1.4 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.ink900.withValues(alpha: active ? 0.07 : 0.035),
              blurRadius: active ? 18 : 12,
              offset: Offset(0, active ? 8 : 5),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              day.day.toUpperCase(),
              style: TextStyle(
                color: active ? AppColors.ink900 : AppColors.ink500,
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.3,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              '${day.num}',
              style: TextStyle(
                color: AppColors.ink900,
                fontSize: 20,
                fontWeight: FontWeight.w800,
                height: 1.05,
              ),
            ),
            Text(
              day.month,
              style: TextStyle(
                color: active ? AppColors.ink700 : AppColors.ink500,
                fontSize: 10,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HourButton extends StatelessWidget {
  const _HourButton({
    required this.hour,
    required this.active,
    required this.full,
    required this.onTap,
  });

  final String hour;
  final bool active;
  final bool full;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: full ? null : onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: full
              ? AppColors.ink100.withValues(alpha: 0.78)
              : Colors.white.withValues(alpha: active ? 0.90 : 0.80),
          borderRadius: BorderRadius.circular(100),
          border: Border.all(
            color: full
                ? AppColors.ink100
                : active
                ? AppColors.ink700
                : AppColors.ink100,
            width: active ? 1.35 : 1,
          ),
          boxShadow: full
              ? null
              : [
                  BoxShadow(
                    color: AppColors.ink900.withValues(alpha: active ? 0.06 : 0.03),
                    blurRadius: active ? 16 : 10,
                    offset: const Offset(0, 6),
                  ),
                ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              hour,
              style: TextStyle(
                color: active
                    ? AppColors.ink900
                    : full
                    ? AppColors.ink400
                    : AppColors.ink900,
                fontSize: 14,
                fontWeight: FontWeight.w800,
                decoration: full ? TextDecoration.lineThrough : null,
              ),
            ),
            if (!full) ...[
              const SizedBox(width: 6),
              Icon(
                Icons.chevron_right_rounded,
                size: 16,
                color: active ? AppColors.ink700 : AppColors.ink400,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _SlotButton extends StatelessWidget {
  const _SlotButton({
    required this.slot,
    required this.active,
    required this.disabled,
    required this.onTap,
  });

  final String slot;
  final bool active;
  final bool disabled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: disabled ? null : onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 120),
        width: 96,
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: disabled
              ? AppColors.ink100.withValues(alpha: 0.78)
              : Colors.white.withValues(alpha: active ? 0.90 : 0.80),
          borderRadius: BorderRadius.circular(100),
          border: Border.all(
            color: disabled
                ? AppColors.ink100
                : active
                ? AppColors.ink700
                : AppColors.ink100,
            width: active ? 1.35 : 1,
          ),
          boxShadow: disabled
              ? null
              : [
                  BoxShadow(
                    color: AppColors.ink900.withValues(alpha: active ? 0.06 : 0.03),
                    blurRadius: active ? 16 : 10,
                    offset: const Offset(0, 6),
                  ),
                ],
        ),
        alignment: Alignment.center,
        child: Text(
          slot,
          style: TextStyle(
            color: active
                ? AppColors.ink900
                : disabled
                ? AppColors.ink400
                : AppColors.ink900,
            fontSize: 13,
            fontWeight: FontWeight.w700,
            decoration: disabled ? TextDecoration.lineThrough : null,
          ),
        ),
      ),
    );
  }
}

class _Legend extends StatelessWidget {
  const _Legend();

  @override
  Widget build(BuildContext context) {
    return const Row(
      children: [
        _LegendItem(color: AppColors.ink700, label: 'Selected'),
        SizedBox(width: 14),
        _LegendItem(color: AppColors.surface, label: 'Available', bordered: true),
        SizedBox(width: 14),
        _LegendItem(color: AppColors.ink200, label: 'Unavailable'),
      ],
    );
  }
}

class _LegendItem extends StatelessWidget {
  const _LegendItem({
    required this.color,
    required this.label,
    this.bordered = false,
  });

  final Color color;
  final String label;
  final bool bordered;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            border: bordered ? Border.all(color: AppColors.ink200, width: 1.5) : null,
          ),
        ),
        const SizedBox(width: 5),
        Text(
          label,
          style: const TextStyle(
            color: AppColors.ink500,
            fontSize: 11,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}

class _PaymentOption extends StatelessWidget {
  const _PaymentOption({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: selected ? 0.88 : 0.78),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? AppColors.ink700 : AppColors.ink100,
            width: selected ? 1.35 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.ink900.withValues(alpha: selected ? 0.06 : 0.035),
              blurRadius: selected ? 18 : 12,
              offset: const Offset(0, 7),
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: selected ? AppColors.ink900 : AppColors.ink500,
              size: 24,
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: AppColors.ink900,
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: AppColors.ink500,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                color: selected ? AppColors.ink900 : Colors.white.withValues(alpha: 0.80),
                shape: BoxShape.circle,
                border: Border.all(
                  color: selected ? AppColors.ink900 : AppColors.ink300,
                  width: 2,
                ),
              ),
              child: selected
                  ? const Icon(Icons.check_rounded, color: Colors.white, size: 14)
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({required this.price});

  final int price;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.82),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.ink100),
        boxShadow: [
          BoxShadow(
            color: AppColors.ink900.withValues(alpha: 0.04),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SectionLabel('SUMMARY'),
          const SizedBox(height: 10),
          _SummaryRow(label: 'Consultation', value: 'IQD ${iqd(price)}'),
          const SizedBox(height: 10),
          _SummaryRow(
            label: 'Total',
            value: 'IQD ${iqd(price)}',
            strong: true,
          ),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({
    required this.label,
    required this.value,
    this.strong = false,
  });

  final String label;
  final String value;
  final bool strong;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: strong ? AppColors.ink900 : AppColors.ink700,
            fontSize: strong ? 15 : 13,
            fontWeight: strong ? FontWeight.w800 : FontWeight.w700,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            color: AppColors.ink900,
            fontSize: strong ? 15 : 13,
            fontWeight: strong ? FontWeight.w800 : FontWeight.w700,
          ),
        ),
      ],
    );
  }
}

class _FooterBar extends StatelessWidget {
  const _FooterBar({
    required this.day,
    required this.price,
    required this.time,
    required this.enabled,
    required this.onConfirm,
  });

  final Day day;
  final int price;
  final String? time;
  final bool enabled;
  final VoidCallback onConfirm;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: 20,
      right: 20,
      bottom: 14,
      child: SafeArea(
        top: false,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(30),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
            child: Container(
              height: 78,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.82),
                borderRadius: BorderRadius.circular(30),
                border: Border.all(color: AppColors.ink100),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.ink900.withValues(alpha: 0.07),
                    blurRadius: 28,
                    offset: const Offset(0, 12),
                  ),
                ],
              ),
              child: Row(
                children: [
                  SizedBox(
                    width: 110,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'CONSULTATION',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: AppColors.ink500,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.25,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'IQD ${iqd(price)}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: AppColors.ink900,
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: GestureDetector(
                      onTap: enabled ? onConfirm : null,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 150),
                        height: 54,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: enabled ? AppColors.teal700 : AppColors.ink200,
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: enabled ? AppShadows.button : null,
                        ),
                        child: const Text(
                          'Confirm booking',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState(this.message);

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.80),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.ink100),
        boxShadow: [
          BoxShadow(
            color: AppColors.ink900.withValues(alpha: 0.035),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      alignment: Alignment.center,
      child: Text(
        message,
        style: const TextStyle(color: AppColors.ink500),
      ),
    );
  }
}
