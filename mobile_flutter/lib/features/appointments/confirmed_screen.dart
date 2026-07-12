import 'package:flutter/material.dart';

import '../../app/app_route.dart';
import '../../core/theme/app_colors.dart';
import '../../core/localization/app_localizations.dart';
import '../../shared/widgets/doc_avatar.dart';

class ConfirmedScreen extends StatelessWidget {
  const ConfirmedScreen({
    super.key,
    required this.booking,
    required this.onDone,
  });

  final BookingDraft booking;
  final ValueChanged<MainTab> onDone;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // Close button
            Align(
              alignment: Alignment.centerRight,
              child: GestureDetector(
                onTap: () => onDone(MainTab.home),
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.ink100),
                    boxShadow: AppShadows.card,
                  ),
                  alignment: Alignment.center,
                  child: const Icon(
                    Icons.close_rounded,
                    color: AppColors.ink700,
                    size: 20,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
            // Hero
            Column(
              children: [
                Container(
                  width: 96,
                  height: 96,
                  decoration: BoxDecoration(
                    color: AppColors.teal700,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.teal700.withValues(alpha: 0.35),
                        blurRadius: 24,
                        offset: const Offset(0, 16),
                      ),
                    ],
                  ),
                  alignment: Alignment.center,
                  child: const Icon(
                    Icons.check_rounded,
                    color: Colors.white,
                    size: 48,
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  AppLocalizations.t('booked_title'),
                  style: const TextStyle(
                    color: AppColors.ink900,
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  AppLocalizations.t('booked_subtitle'),
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: AppColors.ink700,
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    height: 1.4,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 28),
            // Ticket card
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.ink100),
                boxShadow: AppShadows.card,
              ),
              clipBehavior: Clip.antiAlias,
              child: Column(
                children: [
                  // Doctor info
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        DocAvatar(
                          initials: booking.doctor.initials,
                          hue: booking.doctor.hue,
                          size: 52,
                          rounded: 14,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                booking.doctor.name,
                                style: const TextStyle(
                                  color: AppColors.ink900,
                                  fontSize: 15,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              Text(
                                booking.doctor.specialty,
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
                  ),
                  // Perforation line
                  Row(
                    children: [
                      Transform.translate(
                        offset: const Offset(-10, 0),
                        child: const CircleDecor(),
                      ),
                      Expanded(
                        child: CustomPaint(
                          painter: _DashedLinePainter(color: AppColors.ink200),
                          size: const Size(double.infinity, 1),
                        ),
                      ),
                      Transform.translate(
                        offset: const Offset(10, 0),
                        child: const CircleDecor(),
                      ),
                    ],
                  ),
                  // Details grid
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Wrap(
                      spacing: 16,
                      runSpacing: 14,
                      children: [
                        _TicketCell(
                          label: AppLocalizations.t('date').toUpperCase(),
                          value: booking.day,
                        ),
                        _TicketCell(
                          label: AppLocalizations.t('time').toUpperCase(),
                          value: booking.time,
                        ),
                        _TicketCell(
                          label: AppLocalizations.t('location').toUpperCase(),
                          value: booking.doctor.loc.isNotEmpty
                              ? booking.doctor.loc
                              : 'Clinic',
                        ),
                        _TicketCell(
                          label: AppLocalizations.t('payment').toUpperCase(),
                          value: booking.payment == 'Card'
                              ? AppLocalizations.t('card_later')
                              : AppLocalizations.t('pay_at_clinic'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Primary action
            GestureDetector(
              onTap: () => onDone(MainTab.appointments),
              child: Container(
                height: 54,
                decoration: BoxDecoration(
                  color: AppColors.teal700,
                  borderRadius: BorderRadius.circular(100),
                  boxShadow: AppShadows.button,
                ),
                alignment: Alignment.center,
                child: Text(
                  AppLocalizations.t('view_bookings'),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),
            GestureDetector(
              onTap: () => onDone(MainTab.home),
              child: Container(
                height: 54,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(100),
                  border: Border.all(color: AppColors.ink200, width: 1.5),
                ),
                alignment: Alignment.center,
                child: Text(
                  AppLocalizations.t('back_to_home'),
                  style: const TextStyle(
                    color: AppColors.ink900,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class CircleDecor extends StatelessWidget {
  const CircleDecor({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 20,
      height: 20,
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.ink100),
      ),
    );
  }
}

class _DashedLinePainter extends CustomPainter {
  const _DashedLinePainter({required this.color});
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;
    const dashWidth = 6.0;
    const dashGap = 4.0;
    double startX = 0;
    while (startX < size.width) {
      canvas.drawLine(
        Offset(startX, 0),
        Offset(startX + dashWidth, 0),
        paint,
      );
      startX += dashWidth + dashGap;
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _TicketCell extends StatelessWidget {
  const _TicketCell({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 140,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppColors.ink500,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.3,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              color: AppColors.ink900,
              fontSize: 13,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}
