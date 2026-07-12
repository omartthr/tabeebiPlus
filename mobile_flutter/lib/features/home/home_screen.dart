import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../data/models/tabeebi_models.dart';
import '../../data/repositories/demo_data.dart';
import '../../data/repositories/tabeebi_repository.dart';
import '../../shared/widgets/app_logo.dart';
import '../../shared/widgets/specialty_icon.dart';

class HomeScreen extends StatelessWidget {
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
  Widget build(BuildContext context) {
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 118),
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
                      userName,
                      style: const TextStyle(
                        color: AppColors.ink900,
                        fontSize: 30,
                        height: 1.08,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ),
              _CircleButton(
                icon: Icons.notifications_none_rounded,
                onTap: onNotifications,
                dot: true,
              ),
              const SizedBox(width: 12),
              const _LogoCircle(),
            ],
          ),
          const SizedBox(height: 20),
          _AiHeroCard(onTap: onAi),
          const SizedBox(height: 24),
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
                  color: AppColors.teal700,
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          LayoutBuilder(
            builder: (context, constraints) {
              final w = (constraints.maxWidth - 12) / 2;
              return Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  for (final specialty in specialties)
                    SizedBox(
                      width: w,
                      child: _SpecialtyCard(
                        specialty: specialty,
                        onTap: () =>
                            !specialty.disabled ? onSpecialty(specialty) : null,
                      ),
                    ),
                ],
              );
            },
          ),
          const SizedBox(height: 22),
          FutureBuilder<Appointment?>(
            future: repository.getNextAppointment(),
            builder: (context, snapshot) =>
                _UpcomingCard(appointment: snapshot.data),
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
              color: Colors.white.withValues(alpha: 0.82),
              shape: BoxShape.circle,
              border: Border.all(
                color: AppColors.teal200.withValues(alpha: 0.55),
              ),
              boxShadow: AppShadows.card,
            ),
            child: Icon(icon, color: AppColors.ink700, size: 21),
          ),
          if (dot)
            Positioned(
              right: 12,
              top: 12,
              child: Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: AppColors.green500,
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

class _LogoCircle extends StatelessWidget {
  const _LogoCircle();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 46,
      height: 46,
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: AppColors.teal50,
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.teal200.withValues(alpha: 0.6)),
        boxShadow: AppShadows.card,
      ),
      child: const AppLogo(variant: AppLogoVariant.iconLight),
    );
  }
}

class _AiHeroCard extends StatelessWidget {
  const _AiHeroCard({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 208,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(28),
          boxShadow: AppShadows.float,
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset('assets/images/ai_card_bg.png', fit: BoxFit.cover),
            Container(color: const Color(0x33000000)),
            Positioned(
              left: 22,
              top: 22,
              right: 112,
              bottom: 18,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.16),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(
                      Icons.auto_awesome_rounded,
                      color: AppColors.amber500,
                      size: 22,
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'AI Health Assistant',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      height: 1.05,
                    ),
                  ),
                  const SizedBox(height: 7),
                  const Text(
                    'Ask about symptoms, appointments, and next steps.',
                    style: TextStyle(
                      color: Color(0xDDFFFFFF),
                      fontSize: 12.5,
                      height: 1.35,
                    ),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 9,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(22),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.chat_bubble_outline_rounded,
                          color: AppColors.teal700,
                          size: 15,
                        ),
                        SizedBox(width: 7),
                        Text(
                          'Ask AI',
                          style: TextStyle(
                            color: AppColors.teal700,
                            fontSize: 13,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
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
        height: 100,
        padding: const EdgeInsets.all(11),
        decoration: BoxDecoration(
          color: active ? Colors.white : const Color(0xFFF9FAFA),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: active
                ? AppColors.teal200.withValues(alpha: 0.35)
                : const Color(0xFFECEFF2),
          ),
          boxShadow: active ? AppShadows.card : null,
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Color(specialty.tint),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(
                specialtyIcon(specialty.icon),
                color: Color(specialty.accent),
                size: 22,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    specialty.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: active ? AppColors.ink900 : AppColors.ink400,
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 7,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: active
                          ? const Color(0xFFE6F9F0)
                          : const Color(0xFFFFF3E0),
                      borderRadius: BorderRadius.circular(7),
                    ),
                    child: Text(
                      active ? 'Active' : 'Soon',
                      style: TextStyle(
                        color: active
                            ? AppColors.green500
                            : const Color(0xFFF59E0B),
                        fontSize: 9,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                  if (active)
                    const Text(
                      'Kerkuk',
                      style: TextStyle(
                        color: AppColors.ink400,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                ],
              ),
            ),
            Container(
              width: 23,
              height: 23,
              decoration: BoxDecoration(
                color: active ? AppColors.teal50 : const Color(0xFFF1F3F5),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.chevron_right_rounded,
                color: active ? AppColors.ink700 : AppColors.ink300,
                size: 17,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _UpcomingCard extends StatelessWidget {
  const _UpcomingCard({this.appointment});

  final Appointment? appointment;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.teal900,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: [
          const Icon(Icons.calendar_month_rounded, color: AppColors.amber500),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Upcoming appointment',
                  style: TextStyle(
                    color: Color(0xAAFFFFFF),
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  appointment == null
                      ? 'No upcoming appointments yet'
                      : '${appointment!.doctor} - ${appointment!.time}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
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
