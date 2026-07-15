import 'dart:async';
import 'dart:ui';

import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../data/models/tabeebi_models.dart';
import '../../data/repositories/demo_data.dart';
import '../../data/repositories/tabeebi_repository.dart';
import '../../shared/widgets/specialty_icon.dart';

const _aiCardBackground = AssetImage('assets/images/ai_card_bg.png');

class HomeScreen extends StatefulWidget {
  const HomeScreen({
    super.key,
    required this.repository,
    required this.userName,
    required this.onNotifications,
    required this.onSpecialty,
    required this.onAi,
  });

  final TabeebiRepository repository;
  final String userName;
  final VoidCallback onNotifications;
  final ValueChanged<Specialty> onSpecialty;
  final VoidCallback onAi;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Timer? _heroTimer;
  int _heroIndex = 0;
  Appointment? _nextAppointment;

  @override
  void initState() {
    super.initState();
    _loadNextAppointment();
    _startHeroAutoplay();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    precacheImage(_aiCardBackground, context);
  }

  @override
  void dispose() {
    _heroTimer?.cancel();
    super.dispose();
  }

  void _startHeroAutoplay() {
    _heroTimer?.cancel();
    _heroTimer = Timer.periodic(const Duration(milliseconds: 5600), (_) {
      if (!mounted) return;
      final heroCount = _nextAppointment == null ? 1 : 2;
      setState(() => _heroIndex = (_heroIndex + 1) % heroCount);
    });
  }

  Future<void> _loadNextAppointment() async {
    final appointment = await widget.repository.getNextAppointment();
    if (!mounted) return;
    setState(() {
      _nextAppointment = appointment;
      if (appointment == null) _heroIndex = 0;
    });
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.sizeOf(context).width;
    final heroHeight = (screenWidth - 40) / 1.79;

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 118),
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Good morning,',
                      style: TextStyle(
                        color: AppColors.ink500,
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      widget.userName,
                      style: const TextStyle(
                        color: AppColors.ink900,
                        fontSize: 28,
                        height: 1.18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
              _CircleButton(
                icon: Icons.notifications_none_rounded,
                onTap: widget.onNotifications,
                dot: true,
              ),
              const SizedBox(width: 12),
              _AvatarCircle(name: widget.userName),
            ],
          ),
          const SizedBox(height: 16),
          _HeroCarousel(
            height: heroHeight,
            index: _heroIndex,
            onIndexChanged: (index) => setState(() => _heroIndex = index),
            onAi: widget.onAi,
            nextAppointment: _nextAppointment,
          ),
          const SizedBox(height: 28),
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Browse by specialty',
                  style: TextStyle(
                    color: AppColors.ink900,
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              Text(
                '${specialties.length} areas',
                style: const TextStyle(
                  color: AppColors.teal900,
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          LayoutBuilder(
            builder: (context, constraints) {
              final w = (constraints.maxWidth - 10) / 2;
              return Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  for (final specialty in specialties)
                    SizedBox(
                      width: w,
                      child: _SpecialtyCard(
                        specialty: specialty,
                        onTap: () => !specialty.disabled
                            ? widget.onSpecialty(specialty)
                            : null,
                      ),
                    ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

class _CircleButton extends StatelessWidget {
  const _CircleButton({
    required this.icon,
    required this.onTap,
    this.dot = false,
  });

  final IconData icon;
  final VoidCallback onTap;
  final bool dot;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Stack(
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white.withValues(alpha: 0.76),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.62),
                width: 1.2,
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.teal800.withValues(alpha: 0.07),
                  blurRadius: 14,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Icon(icon, color: AppColors.teal800, size: 21),
          ),
          if (dot)
            Positioned(
              right: 12,
              top: 12,
              child: Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: AppColors.teal800,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 1.5),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _AvatarCircle extends StatelessWidget {
  const _AvatarCircle({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    final letter = name.trim().isEmpty ? 'U' : name.trim()[0].toUpperCase();

    return Container(
      width: 46,
      height: 46,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.white.withValues(alpha: 0.56),
        border: Border.all(
          color: AppColors.teal800.withValues(alpha: 0.12),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.teal800.withValues(alpha: 0.045),
            blurRadius: 16,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      alignment: Alignment.center,
      child: Text(
        letter,
        style: const TextStyle(
          color: AppColors.teal800,
          fontSize: 18,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

class _HeroCarousel extends StatelessWidget {
  const _HeroCarousel({
    required this.height,
    required this.index,
    required this.onIndexChanged,
    required this.onAi,
    required this.nextAppointment,
  });

  final double height;
  final int index;
  final ValueChanged<int> onIndexChanged;
  final VoidCallback onAi;
  final Appointment? nextAppointment;

  @override
  Widget build(BuildContext context) {
    final hasAppointment = nextAppointment != null;
    final selectedIndex = hasAppointment ? index : 0;
    final child = selectedIndex == 0
        ? RepaintBoundary(
            key: const ValueKey('ai-card'),
            child: _AiHeroCard(height: height, onTap: onAi),
          )
        : RepaintBoundary(
            key: const ValueKey('appointment-card'),
            child: _UpcomingAppointmentCard(
              height: height,
              appointment: nextAppointment,
            ),
          );

    return Column(
      children: [
        GestureDetector(
          onHorizontalDragEnd: (details) {
            if (!hasAppointment) return;
            final velocity = details.primaryVelocity ?? 0;
            if (velocity.abs() < 120) return;
            onIndexChanged(selectedIndex == 0 ? 1 : 0);
          },
          child: Container(
            height: height,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(28),
              boxShadow: [
                BoxShadow(
                  color: AppColors.ink900.withValues(alpha: 0.035),
                  blurRadius: 18,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            clipBehavior: Clip.antiAlias,
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 980),
              reverseDuration: const Duration(milliseconds: 820),
              switchInCurve: Curves.easeInOutCubic,
              switchOutCurve: Curves.easeInOutCubic,
              layoutBuilder: (currentChild, previousChildren) {
                return Stack(
                  fit: StackFit.expand,
                  children: [...previousChildren, ?currentChild],
                );
              },
              transitionBuilder: (child, animation) {
                final curved = CurvedAnimation(
                  parent: animation,
                  curve: Curves.easeInOutCubic,
                );
                final offset = Tween<Offset>(
                  begin: const Offset(0.018, 0),
                  end: Offset.zero,
                ).animate(curved);
                final scale = Tween<double>(
                  begin: 0.992,
                  end: 1,
                ).animate(curved);

                return FadeTransition(
                  opacity: curved,
                  child: SlideTransition(
                    position: offset,
                    child: ScaleTransition(scale: scale, child: child),
                  ),
                );
              },
              child: child,
            ),
          ),
        ),
        if (hasAppointment) ...[
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              GestureDetector(
                onTap: () => onIndexChanged(0),
                child: _HeroDot(active: selectedIndex == 0),
              ),
              const SizedBox(width: 6),
              GestureDetector(
                onTap: () => onIndexChanged(1),
                child: _HeroDot(active: selectedIndex == 1),
              ),
            ],
          ),
        ],
      ],
    );
  }
}

class _HeroDot extends StatelessWidget {
  const _HeroDot({required this.active});

  final bool active;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      width: active ? 20 : 6,
      height: 6,
      decoration: BoxDecoration(
        color: active
            ? AppColors.ink700
            : AppColors.ink300.withValues(alpha: 0.70),
        borderRadius: BorderRadius.circular(3),
      ),
    );
  }
}

class _AiHeroCard extends StatelessWidget {
  const _AiHeroCard({required this.height, required this.onTap});

  final double height;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final textTop = height < 185 ? 45.0 : 54.0;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: height,
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(28)),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image(
              image: _aiCardBackground,
              fit: BoxFit.cover,
              gaplessPlayback: true,
              filterQuality: FilterQuality.medium,
            ),
            Positioned(
              left: 52,
              top: textTop,
              right: 132,
              child: const _AiHeroCopy(),
            ),
            Positioned(
              left: 52,
              bottom: 18,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(22),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.78),
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.60),
                        width: 1.1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.teal800.withValues(alpha: 0.08),
                          blurRadius: 12,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.chat_bubble_outline_rounded,
                          color: AppColors.teal800,
                          size: 15,
                        ),
                        SizedBox(width: 7),
                        Text(
                          'Ask AI',
                          style: TextStyle(
                            color: AppColors.teal800,
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
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
      ),
    );
  }
}

class _AiHeroCopy extends StatelessWidget {
  const _AiHeroCopy();

  @override
  Widget build(BuildContext context) {
    return const Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'AI Health Assistant',
          style: TextStyle(
            color: Colors.white,
            fontSize: 14.5,
            fontWeight: FontWeight.w800,
            height: 1.12,
          ),
        ),
        SizedBox(height: 4),
        Text(
          'Ask about symptoms, appointments, and next steps.',
          style: TextStyle(
            color: Color(0xDDFFFFFF),
            fontSize: 10.5,
            fontWeight: FontWeight.w500,
            height: 1.26,
          ),
        ),
      ],
    );
  }
}

class _UpcomingAppointmentCard extends StatelessWidget {
  const _UpcomingAppointmentCard({
    required this.height,
    required this.appointment,
  });

  final double height;
  final Appointment? appointment;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.teal900,
        borderRadius: BorderRadius.circular(28),
      ),
      child: appointment == null
          ? const _NoUpcomingAppointment()
          : _AppointmentSummary(appointment: appointment!),
    );
  }
}

class _NoUpcomingAppointment extends StatelessWidget {
  const _NoUpcomingAppointment();

  @override
  Widget build(BuildContext context) {
    return const Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.calendar_month_rounded, color: AppColors.amber500, size: 30),
        SizedBox(height: 10),
        Text(
          'Upcoming appointment',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Color(0xA6FFFFFF),
            fontSize: 11,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.6,
          ),
        ),
        SizedBox(height: 8),
        Text(
          'No upcoming appointments yet',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Color(0x80FFFFFF),
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _AppointmentSummary extends StatelessWidget {
  const _AppointmentSummary({required this.appointment});

  final Appointment appointment;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Expanded(
              child: Text(
                'UPCOMING APPOINTMENT',
                style: TextStyle(
                  color: Color(0xA6FFFFFF),
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.6,
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: AppColors.amber500.withValues(alpha: 0.20),
                borderRadius: BorderRadius.circular(100),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    decoration: const BoxDecoration(
                      color: AppColors.amber500,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    appointment.date,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: AppColors.amber500,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            _MiniDocAvatar(
              initials: appointment.initials,
              hue: appointment.hue,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    appointment.doctor,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    appointment.specialty,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Color(0xB3FFFFFF),
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 12,
                    runSpacing: 6,
                    children: [
                      _AppointmentMeta(
                        icon: Icons.schedule_rounded,
                        label: appointment.time,
                      ),
                      _AppointmentMeta(
                        icon: Icons.location_on_rounded,
                        label: appointment.clinic ?? 'Clinic',
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right_rounded,
              color: Color(0x80FFFFFF),
              size: 20,
            ),
          ],
        ),
      ],
    );
  }
}

class _MiniDocAvatar extends StatelessWidget {
  const _MiniDocAvatar({required this.initials, required this.hue});

  final String initials;
  final int hue;

  @override
  Widget build(BuildContext context) {
    final color = HSVColor.fromAHSV(1, hue.toDouble(), 0.45, 0.78).toColor();
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.22),
        borderRadius: BorderRadius.circular(12),
      ),
      alignment: Alignment.center,
      child: Text(
        initials,
        style: TextStyle(
          color: Colors.white.withValues(alpha: 0.92),
          fontSize: 15,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

class _AppointmentMeta extends StatelessWidget {
  const _AppointmentMeta({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: const Color(0xDDFFFFFF), size: 12),
        const SizedBox(width: 4),
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 118),
          child: Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: Color(0xE6FFFFFF),
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }
}

class _SpecialtyCard extends StatelessWidget {
  const _SpecialtyCard({required this.specialty, required this.onTap});

  final Specialty specialty;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final active = !specialty.disabled;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 92,
        padding: const EdgeInsets.fromLTRB(9, 12, 8, 12),
        decoration: BoxDecoration(
          color: active
              ? Colors.white.withValues(alpha: 0.94)
              : Colors.white.withValues(alpha: 0.72),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(
            color: active
                ? AppColors.teal800.withValues(alpha: 0.12)
                : AppColors.ink100.withValues(alpha: 0.80),
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.ink900.withValues(alpha: active ? 0.035 : 0.018),
              blurRadius: active ? 14 : 8,
              offset: Offset(0, active ? 5 : 3),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: active
                    ? AppColors.teal800.withValues(alpha: 0.055)
                    : Colors.white.withValues(alpha: 0.60),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: active
                      ? AppColors.teal800.withValues(alpha: 0.12)
                      : AppColors.ink100.withValues(alpha: 0.54),
                ),
              ),
              child: Icon(
                specialtyIcon(specialty.icon),
                color: active ? AppColors.teal800 : AppColors.ink300,
                size: 19,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    height: 16,
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: FittedBox(
                        fit: BoxFit.scaleDown,
                        alignment: Alignment.centerLeft,
                        child: Text(
                          specialty.name,
                          maxLines: 1,
                          softWrap: false,
                          style: TextStyle(
                            color: active
                                ? AppColors.ink900
                                : AppColors.ink400,
                            fontSize: 12.5,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Flexible(
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: active
                                ? AppColors.teal800.withValues(alpha: 0.045)
                                : Colors.white.withValues(alpha: 0.58),
                            borderRadius: BorderRadius.circular(7),
                            border: Border.all(
                              color: active
                                  ? AppColors.teal800.withValues(alpha: 0.08)
                                  : AppColors.ink100,
                            ),
                          ),
                          child: Text(
                            active ? 'Active' : 'Soon',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: active
                                  ? AppColors.teal800
                                  : AppColors.ink400,
                              fontSize: 8.5,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  if (active) ...[
                    const SizedBox(height: 1),
                    const Text(
                      'Kerkuk',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: AppColors.ink400,
                        fontSize: 10.5,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 3),
            Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                color: active
                    ? Colors.white.withValues(alpha: 0.76)
                    : Colors.white.withValues(alpha: 0.42),
                shape: BoxShape.circle,
                border: Border.all(
                  color: active
                      ? AppColors.teal800.withValues(alpha: 0.08)
                      : AppColors.ink100.withValues(alpha: 0.54),
                ),
              ),
              child: Icon(
                Icons.chevron_right_rounded,
                color: active ? AppColors.teal800 : AppColors.ink300,
                size: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
