import 'package:flutter/material.dart';

import '../../app/app_route.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/theme/app_colors.dart';
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
      backgroundColor: AppColors.bg,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final compact = constraints.maxHeight < 760;
            return Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Align(
                    alignment: Alignment.centerRight,
                    child: _CloseButton(onTap: () => onDone(MainTab.home)),
                  ),
                  SizedBox(height: compact ? 12 : 20),
                  _HeroCheck(compact: compact),
                  SizedBox(height: compact ? 16 : 24),
                  Text(
                    AppLocalizations.t('youre_booked'),
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppColors.ink900,
                      fontSize: compact ? 24 : 28,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    AppLocalizations.t('booking_confirmed_sub'),
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: AppColors.ink700,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      height: 1.35,
                    ),
                  ),
                  SizedBox(height: compact ? 18 : 24),
                  Expanded(
                    child: Center(
                      child: _TicketCard(
                        booking: booking,
                        compact: compact,
                      ),
                    ),
                  ),
                  SizedBox(height: compact ? 16 : 24),
                  _PrimaryButton(
                    label: AppLocalizations.t('view_my_bookings'),
                    onTap: () => onDone(MainTab.appointments),
                  ),
                  const SizedBox(height: 10),
                  _OutlineButton(
                    label: AppLocalizations.t('back_to_home'),
                    onTap: () => onDone(MainTab.home),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class _CloseButton extends StatelessWidget {
  const _CloseButton({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
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
    );
  }
}

class _HeroCheck extends StatelessWidget {
  const _HeroCheck({required this.compact});

  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: compact ? 84 : 96,
      height: compact ? 84 : 96,
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
      child: Icon(
        Icons.check_rounded,
        color: Colors.white,
        size: compact ? 42 : 48,
      ),
    );
  }
}

class _TicketCard extends StatelessWidget {
  const _TicketCard({required this.booking, required this.compact});

  final BookingDraft booking;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(maxHeight: 320),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.ink100),
        boxShadow: AppShadows.card,
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: EdgeInsets.all(compact ? 14 : 16),
            child: Row(
              children: [
                DocAvatar(
                  initials: booking.doctor.initials,
                  hue: booking.doctor.hue,
                  size: compact ? 48 : 52,
                  rounded: 14,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        booking.doctor.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: AppColors.ink900,
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      Text(
                        booking.doctor.specialty,
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
          ),
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
          Padding(
            padding: EdgeInsets.all(compact ? 14 : 16),
            child: LayoutBuilder(
              builder: (context, constraints) {
                final width = (constraints.maxWidth - 16) / 2;
                return Wrap(
                  spacing: 16,
                  runSpacing: compact ? 12 : 14,
                  children: [
                    _TicketCell(
                      width: width,
                      label: AppLocalizations.t('ticket_date'),
                      value: booking.day,
                    ),
                    _TicketCell(
                      width: width,
                      label: AppLocalizations.t('ticket_time'),
                      value: booking.time,
                    ),
                    _TicketCell(
                      width: width,
                      label: AppLocalizations.t('ticket_location'),
                      value: booking.doctor.loc.isNotEmpty
                          ? booking.doctor.loc
                          : 'Clinic',
                    ),
                    _TicketCell(
                      width: width,
                      label: AppLocalizations.t('ticket_payment'),
                      value: booking.payment == 'Card'
                          ? AppLocalizations.t('paid_online')
                          : AppLocalizations.t('pay_at_clinic'),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
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
    var startX = 0.0;
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
  const _TicketCell({
    required this.width,
    required this.label,
    required this.value,
  });

  final double width;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
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
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
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

class _PrimaryButton extends StatelessWidget {
  const _PrimaryButton({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 54,
        decoration: BoxDecoration(
          color: AppColors.teal700,
          borderRadius: BorderRadius.circular(100),
          boxShadow: AppShadows.button,
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }
}

class _OutlineButton extends StatelessWidget {
  const _OutlineButton({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 54,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(100),
          border: Border.all(color: AppColors.ink200, width: 1.5),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: const TextStyle(
            color: AppColors.ink900,
            fontSize: 16,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}
