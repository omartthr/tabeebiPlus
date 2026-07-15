import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../data/models/tabeebi_models.dart';
import '../../data/repositories/tabeebi_repository.dart';
import '../../shared/widgets/status_badge.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({
    super.key,
    required this.repository,
    required this.onBookAgain,
    required this.onResults,
  });

  final TabeebiRepository repository;
  final ValueChanged<Doctor> onBookAgain;
  final VoidCallback onResults;

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> {
  bool upcoming = true;
  late Future<List<Appointment>> future;

  @override
  void initState() {
    super.initState();
    future = widget.repository.getMyAppointments();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.fromLTRB(20, 20, 20, 8),
            child: Text(
              'My bookings',
              style: TextStyle(
                color: AppColors.ink900,
                fontSize: 28,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          FutureBuilder<List<Appointment>>(
            future: future,
            builder: (context, snapshot) {
              final all = snapshot.data ?? const <Appointment>[];
              final upcomingList = all
                  .where((a) => a.status == 'pending' || a.status == 'confirmed')
                  .toList();
              final pastList = all
                  .where((a) => a.status == 'completed' || a.status == 'cancelled')
                  .toList();

              return Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 14),
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.72),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.teal800.withValues(alpha: 0.10)),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.teal800.withValues(alpha: 0.045),
                        blurRadius: 14,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      _TabButton(
                        label: 'Upcoming (${upcomingList.length})',
                        active: upcoming,
                        onTap: () => setState(() => upcoming = true),
                      ),
                      _TabButton(
                        label: 'Past (${pastList.length})',
                        active: !upcoming,
                        onTap: () => setState(() => upcoming = false),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          Expanded(
            child: FutureBuilder<List<Appointment>>(
              future: future,
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(
                    child: CircularProgressIndicator(color: AppColors.teal800),
                  );
                }
                final all = snapshot.data!;
                final upcomingList = all
                    .where(
                      (a) => a.status == 'pending' || a.status == 'confirmed',
                    )
                    .toList();
                final pastList = all
                    .where(
                      (a) => a.status == 'completed' || a.status == 'cancelled',
                    )
                    .toList();
                final list = upcoming ? upcomingList : pastList;

                return RefreshIndicator(
                  color: AppColors.teal800,
                  onRefresh: () async => setState(
                    () => future = widget.repository.getMyAppointments(),
                  ),
                  child: list.isEmpty
                      ? ListView(
                          padding: const EdgeInsets.fromLTRB(20, 20, 20, 118),
                          children: [
                            const SizedBox(height: 40),
                            Center(
                              child: Column(
                                children: [
                                  Container(
                                    width: 72,
                                    height: 72,
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(24),
                                      border: Border.all(color: AppColors.teal800.withValues(alpha: 0.10)),
                                    ),
                                    child: const Icon(
                                      Icons.calendar_month_rounded,
                                      color: AppColors.teal800,
                                      size: 32,
                                    ),
                                  ),
                                  const SizedBox(height: 14),
                                  Text(
                                    upcoming
                                        ? 'No upcoming appointments'
                                        : 'No past appointments',
                                    style: const TextStyle(
                                      color: AppColors.ink900,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 16,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    upcoming
                                        ? 'Book an appointment to get started.'
                                        : 'Your completed appointments will appear here.',
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(
                                      color: AppColors.ink400,
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        )
                      : ListView(
                          padding: const EdgeInsets.fromLTRB(20, 0, 20, 118),
                          children: [
                            for (final appointment in list)
                              _AppointmentCard(
                                appointment: appointment,
                                isUpcoming: upcoming,
                                onCancel: () => _cancel(appointment.id),
                                onRate: () => _openRatingModal(appointment),
                                onResults: widget.onResults,
                              ),
                          ],
                        ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _cancel(String id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cancel appointment'),
        content: const Text(
          'Are you sure you want to cancel this appointment?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('No'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.red500),
            child: const Text('Yes, cancel'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    final ok = await widget.repository.cancelAppointment(id);
    if (!mounted) return;
    if (ok) setState(() => future = widget.repository.getMyAppointments());
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          ok ? 'Appointment cancelled.' : 'Could not cancel appointment.',
        ),
        backgroundColor: ok ? AppColors.teal800 : AppColors.red500,
      ),
    );
  }

  Future<void> _openRatingModal(Appointment appointment) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _RatingModal(
        appointment: appointment,
        onSubmit: (rating, review) async {
          final ok = await widget.repository.submitRating(
            appointment.id,
            rating,
            review,
          );
          if (!ctx.mounted) return;
          Navigator.pop(ctx);
          if (ok) setState(() => future = widget.repository.getMyAppointments());
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(ok ? 'Rating submitted!' : 'Could not submit rating.'),
              backgroundColor: ok ? AppColors.teal800 : AppColors.red500,
            ),
          );
        },
      ),
    );
  }
}

class _TabButton extends StatelessWidget {
  const _TabButton({
    required this.label,
    required this.active,
    required this.onTap,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: active
                ? Colors.white.withValues(alpha: 0.86)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: active
                  ? AppColors.teal800.withValues(alpha: 0.10)
                  : Colors.transparent,
            ),
            boxShadow: active
                ? [
                    BoxShadow(
                      color: AppColors.teal800.withValues(alpha: 0.04),
                      blurRadius: 12,
                      offset: const Offset(0, 5),
                    ),
                  ]
                : null,
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              color: active ? AppColors.teal800 : AppColors.ink500,
              fontSize: 13,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
      ),
    );
  }
}

class _AppointmentCard extends StatelessWidget {
  const _AppointmentCard({
    required this.appointment,
    required this.isUpcoming,
    required this.onCancel,
    required this.onRate,
    required this.onResults,
  });

  final Appointment appointment;
  final bool isUpcoming;
  final VoidCallback onCancel;
  final VoidCallback onRate;
  final VoidCallback onResults;

  @override
  Widget build(BuildContext context) {
    final isPast = !isUpcoming;
    final canRate = isPast &&
        appointment.status == 'completed' &&
        appointment.rating == null;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.88),
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
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.82),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.ink100),
                ),
                alignment: Alignment.center,
                child: Text(
                  appointment.initials,
                  style: const TextStyle(
                    color: AppColors.ink500,
                    fontSize: 15,
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
                      appointment.doctor,
                      style: const TextStyle(
                        color: AppColors.ink900,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    Text(
                      appointment.specialty,
                      style: const TextStyle(
                        color: AppColors.ink500,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              StatusBadge(status: appointment.status),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.62),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.ink100),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.calendar_today_rounded,
                  size: 16,
                  color: AppColors.teal800,
                ),
                const SizedBox(width: 8),
                Text(
                  appointment.date,
                  style: const TextStyle(
                    color: AppColors.ink700,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const Spacer(),
                const Icon(
                  Icons.schedule_rounded,
                  size: 16,
                  color: AppColors.teal800,
                ),
                const SizedBox(width: 8),
                Text(
                  appointment.time,
                  style: const TextStyle(
                    color: AppColors.ink700,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
          if (appointment.clinic != null && appointment.clinic!.isNotEmpty) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(
                  Icons.location_on_outlined,
                  size: 14,
                  color: AppColors.ink400,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    appointment.clinic!,
                    style: const TextStyle(
                      color: AppColors.ink500,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: 10),
          if (isUpcoming) ...[
            Row(
              children: [
                Expanded(
                  child: _ActionBtn(
                    label: 'Reschedule',
                    color: AppColors.teal800,
                    outline: true,
                    onTap: onCancel,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _ActionBtn(
                    label: 'Cancel',
                    color: AppColors.red500,
                    outline: true,
                    onTap: onCancel,
                  ),
                ),
              ],
            ),
          ] else ...[
            Row(
              children: [
                if (canRate)
                  Expanded(
                    child: _ActionBtn(
                      label: 'Rate visit',
                      color: AppColors.teal800,
                      outline: true,
                      onTap: onRate,
                    ),
                  ),
                if (canRate) const SizedBox(width: 8),
                Expanded(
                  child: _ActionBtn(
                    label: 'View result',
                    color: AppColors.teal800,
                    outline: true,
                    onTap: onResults,
                  ),
                ),
              ],
            ),
            if (appointment.rating != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.72),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: AppColors.teal800.withValues(alpha: 0.10),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.star_rounded,
                      color: AppColors.teal800,
                      size: 16,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Your rating: ${appointment.rating!.toStringAsFixed(1)}',
                      style: const TextStyle(
                        color: AppColors.teal800,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ],
      ),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  const _ActionBtn({
    required this.label,
    required this.color,
    required this.outline,
    required this.onTap,
  });

  final String label;
  final Color color;
  final bool outline;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: outline
              ? Colors.white.withValues(alpha: 0.66)
              : color.withValues(alpha: 0.92),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: outline
                ? color.withValues(alpha: 0.46)
                : color.withValues(alpha: 0.10),
          ),
          boxShadow: [
            BoxShadow(
              color: color.withValues(alpha: outline ? 0.035 : 0.10),
              blurRadius: outline ? 8 : 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            color: outline ? color : Colors.white,
            fontSize: 13,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _RatingModal extends StatefulWidget {
  const _RatingModal({
    required this.appointment,
    required this.onSubmit,
  });

  final Appointment appointment;
  final void Function(int rating, String? review) onSubmit;

  @override
  State<_RatingModal> createState() => _RatingModalState();
}

class _RatingModalState extends State<_RatingModal> {
  int _rating = 5;
  final _reviewCtrl = TextEditingController();

  @override
  void dispose() {
    _reviewCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 36,
            height: 4,
            margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(
              color: AppColors.ink200,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const Text(
            'Rate your visit',
            style: TextStyle(
              color: AppColors.ink900,
              fontSize: 20,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            widget.appointment.doctor,
            style: const TextStyle(color: AppColors.ink500, fontSize: 14),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(5, (i) {
              final star = i + 1;
              return GestureDetector(
                onTap: () => setState(() => _rating = star),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: Icon(
                    Icons.star_rounded,
                    size: 40,
                    color: star <= _rating
                        ? AppColors.teal800
                        : AppColors.ink200,
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 18),
          TextField(
            controller: _reviewCtrl,
            minLines: 3,
            maxLines: 5,
            decoration: InputDecoration(
              hintText: 'Leave a review (optional)',
              hintStyle: const TextStyle(color: AppColors.ink400),
              filled: true,
              fillColor: Colors.white.withValues(alpha: 0.72),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide.none,
              ),
            ),
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: () =>
                widget.onSubmit(_rating, _reviewCtrl.text.trim().isEmpty
                    ? null
                    : _reviewCtrl.text.trim()),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                color: AppColors.teal800,
                borderRadius: BorderRadius.circular(100),
                boxShadow: AppShadows.button,
              ),
              alignment: Alignment.center,
              child: const Text(
                'Submit rating',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'Skip',
              style: TextStyle(color: AppColors.ink500),
            ),
          ),
        ],
      ),
    );
  }
}
