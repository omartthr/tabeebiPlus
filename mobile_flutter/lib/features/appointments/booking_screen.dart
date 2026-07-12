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
  String? time;
  String payment = 'Cash';
  bool loadingSlots = false;
  List<String> availableSlots = [];
  Set<String> bookedTimes = {};

  @override
  void initState() {
    super.initState();
    _loadSlotsForDay(day);
  }

  /// Replicates the React Native gen10MinSlots function:
  /// Takes a schedule from the API and generates 10-minute slots
  List<String> _gen10MinSlots(Map<String, dynamic>? daySched) {
    if (daySched == null) return [];
    final isOpen = daySched['isOpen'] == true || daySched['isOpen'] == 1;
    if (!isOpen) return [];
    final raw = daySched['slots'];
    if (raw is! List || raw.isEmpty) return [];

    final slots = <String>[];
    for (final slotStr in raw) {
      final parts = slotStr.toString().split(':');
      if (parts.length < 2) continue;
      final h = int.tryParse(parts[0]);
      if (h == null) continue;
      for (int m = 0; m < 60; m += 10) {
        final mStr = m.toString().padLeft(2, '0');
        final ampm = h < 12 ? 'AM' : 'PM';
        final displayH = h == 0 ? 12 : (h > 12 ? h - 12 : h);
        slots.add('$displayH:$mStr $ampm');
      }
    }
    return slots;
  }

  Future<void> _loadSlotsForDay(Day selectedDay) async {
    setState(() {
      loadingSlots = true;
      availableSlots = [];
      bookedTimes = {};
    });

    try {
      final schedule = await widget.repository.getDoctorSchedule(widget.doctor.id);
      final dayKey = selectedDay.key.toLowerCase();
      // Map day names to schedule keys
      final dayMap = {
        'Mon': 'mon', 'Tue': 'tue', 'Wed': 'wed',
        'Thu': 'thu', 'Fri': 'fri', 'Sat': 'sat', 'Sun': 'sun',
      };
      final schedKey = dayMap[selectedDay.day] ?? dayKey;
      final daySched = schedule?[schedKey] as Map<String, dynamic>?;
      final slots = _gen10MinSlots(daySched);

      // Fetch booked times for this specific date
      final booked = await widget.repository.getBookedTimes(
        widget.doctor.id,
        selectedDay.key,
      );

      if (mounted) {
        setState(() {
          availableSlots = slots;
          bookedTimes = booked.toSet();
          loadingSlots = false;
          // Reset selected time if it's no longer in available slots
          if (time != null && !slots.contains(time)) {
            time = null;
          }
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => loadingSlots = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final days = generateDays();
    return Scaffold(
      body: Column(
        children: [
          TopBar(title: 'Book appointment', onBack: widget.onBack),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                // Doctor info header
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.teal50,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: AppColors.teal200.withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    children: [
                      _AvatarCircle(
                        initials: widget.doctor.initials,
                        hue: widget.doctor.hue,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.doctor.name,
                              style: const TextStyle(
                                color: AppColors.ink900,
                                fontSize: 16,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            Text(
                              widget.doctor.specialty,
                              style: const TextStyle(
                                color: AppColors.ink500,
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 5,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.amber50,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          'IQD ${iqd(widget.doctor.price)}',
                          style: const TextStyle(
                            color: AppColors.amber700,
                            fontWeight: FontWeight.w900,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 22),
                const Text(
                  'Select day',
                  style: TextStyle(
                    color: AppColors.ink900,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 84,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: days.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 10),
                    itemBuilder: (context, index) {
                      final d = days[index];
                      final active = d.key == day.key;
                      return GestureDetector(
                        onTap: () {
                          setState(() => day = d);
                          _loadSlotsForDay(d);
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          width: 64,
                          decoration: BoxDecoration(
                            color: active ? AppColors.teal700 : Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(
                              color: active
                                  ? AppColors.teal700
                                  : AppColors.ink200,
                            ),
                            boxShadow: active ? AppShadows.button : null,
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                d.day,
                                style: TextStyle(
                                  color: active
                                      ? Colors.white.withValues(alpha: 0.8)
                                      : AppColors.ink500,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${d.num}',
                                style: TextStyle(
                                  color: active ? Colors.white : AppColors.ink900,
                                  fontSize: 22,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              Text(
                                d.month,
                                style: TextStyle(
                                  color: active
                                      ? Colors.white.withValues(alpha: 0.8)
                                      : AppColors.ink400,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 22),
                const Text(
                  'Select time',
                  style: TextStyle(
                    color: AppColors.ink900,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 12),
                if (loadingSlots)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(20),
                      child: CircularProgressIndicator(color: AppColors.teal700),
                    ),
                  )
                else if (availableSlots.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.ink100,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Center(
                      child: Text(
                        'No slots available for this day.',
                        style: TextStyle(color: AppColors.ink500),
                      ),
                    ),
                  )
                else
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: availableSlots.map((slot) {
                      final isBooked = bookedTimes.contains(slot);
                      final isSelected = time == slot;
                      return GestureDetector(
                        onTap: isBooked ? null : () => setState(() => time = slot),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 120),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 10,
                          ),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.teal700
                                : isBooked
                                ? AppColors.ink100
                                : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected
                                  ? AppColors.teal700
                                  : isBooked
                                  ? AppColors.ink200
                                  : AppColors.ink200,
                            ),
                          ),
                          child: Text(
                            slot,
                            style: TextStyle(
                              color: isSelected
                                  ? Colors.white
                                  : isBooked
                                  ? AppColors.ink400
                                  : AppColors.ink900,
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              decoration: isBooked
                                  ? TextDecoration.lineThrough
                                  : null,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                const SizedBox(height: 22),
                const Text(
                  'Payment method',
                  style: TextStyle(
                    color: AppColors.ink900,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _PaymentOption(
                      label: 'Pay at clinic',
                      icon: Icons.payments_outlined,
                      selected: payment == 'Cash',
                      onTap: () => setState(() => payment = 'Cash'),
                    ),
                    const SizedBox(width: 10),
                    _PaymentOption(
                      label: 'Online payment',
                      icon: Icons.credit_card_rounded,
                      selected: payment == 'Card',
                      onTap: () => setState(() => payment = 'Card'),
                    ),
                  ],
                ),
                const SizedBox(height: 110),
              ],
            ),
          ),
          SafeArea(
            top: false,
            minimum: const EdgeInsets.all(20),
            child: GestureDetector(
              onTap: time == null ? null : _confirm,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                height: 54,
                decoration: BoxDecoration(
                  color: time == null ? AppColors.ink200 : AppColors.teal700,
                  borderRadius: BorderRadius.circular(999),
                  boxShadow: time == null ? null : AppShadows.button,
                ),
                alignment: Alignment.center,
                child: const Text(
                  'Confirm booking',
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
    );
  }

  Future<void> _confirm() async {
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

class _AvatarCircle extends StatelessWidget {
  const _AvatarCircle({required this.initials, required this.hue});
  final String initials;
  final int hue;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: HSLColor.fromAHSL(1.0, hue.toDouble(), 0.5, 0.82).toColor(),
        borderRadius: BorderRadius.circular(14),
      ),
      alignment: Alignment.center,
      child: Text(
        initials,
        style: TextStyle(
          color: HSLColor.fromAHSL(1.0, hue.toDouble(), 0.55, 0.28).toColor(),
          fontWeight: FontWeight.w900,
          fontSize: 16,
        ),
      ),
    );
  }
}

class _PaymentOption extends StatelessWidget {
  const _PaymentOption({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
          decoration: BoxDecoration(
            color: selected ? AppColors.teal50 : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: selected ? AppColors.teal700 : AppColors.ink200,
              width: selected ? 1.5 : 1,
            ),
          ),
          child: Column(
            children: [
              Icon(
                icon,
                color: selected ? AppColors.teal700 : AppColors.ink400,
                size: 22,
              ),
              const SizedBox(height: 6),
              Text(
                label,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: selected ? AppColors.teal700 : AppColors.ink700,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
