import 'dart:ui';

import 'package:flutter/material.dart';

import '../core/theme/app_colors.dart';
import '../core/localization/app_localizations.dart';
import 'app_route.dart';

class MainShell extends StatelessWidget {
  const MainShell({
    super.key,
    required this.selectedTab,
    required this.onTabChanged,
    required this.home,
    required this.appointments,
    required this.ai,
    required this.results,
    required this.profile,
  });

  final MainTab selectedTab;
  final ValueChanged<MainTab> onTabChanged;
  final Widget home;
  final Widget appointments;
  final Widget ai;
  final Widget results;
  final Widget profile;

  @override
  Widget build(BuildContext context) {
    final body = switch (selectedTab) {
      MainTab.home => home,
      MainTab.appointments => appointments,
      MainTab.ai => ai,
      MainTab.results => results,
      MainTab.profile => profile,
    };

    return Scaffold(
      body: Stack(
        children: [
          Positioned.fill(child: body),
          Align(
            alignment: Alignment.bottomCenter,
            child: SafeArea(
              minimum: const EdgeInsets.fromLTRB(20, 0, 20, 14),
              child: _GlassTabBar(
                selectedTab: selectedTab,
                onChanged: onTabChanged,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _GlassTabBar extends StatelessWidget {
  const _GlassTabBar({required this.selectedTab, required this.onChanged});

  final MainTab selectedTab;
  final ValueChanged<MainTab> onChanged;

  @override
  Widget build(BuildContext context) {
    // Note: Use AppLocalizations.t for dynamic translation of tabs
    final items = [
      (MainTab.home, Icons.home_rounded, AppLocalizations.t('home')),
      (MainTab.appointments, Icons.calendar_month_rounded, AppLocalizations.t('bookings')),
      (MainTab.ai, Icons.auto_awesome_rounded, AppLocalizations.t('ai_tab')),
      (MainTab.results, Icons.science_rounded, AppLocalizations.t('results')),
      (MainTab.profile, Icons.person_rounded, AppLocalizations.t('profile')),
    ];

    return ClipRRect(
      borderRadius: BorderRadius.circular(28),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
        child: Container(
          height: 64,
          padding: const EdgeInsets.symmetric(horizontal: 7),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.72),
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: Colors.white.withValues(alpha: 0.58)),
            boxShadow: AppShadows.float,
          ),
          child: Row(
            children: [
              for (final item in items)
                Expanded(
                  child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () => onChanged(item.$1),
                    child: _TabButton(
                      icon: item.$2,
                      label: item.$3,
                      active: selectedTab == item.$1,
                      isCenter: item.$1 == MainTab.ai,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TabButton extends StatelessWidget {
  const _TabButton({
    required this.icon,
    required this.label,
    required this.active,
    required this.isCenter,
  });

  final IconData icon;
  final String label;
  final bool active;
  final bool isCenter;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          width: isCenter
              ? 44
              : active
              ? 36
              : 30,
          height: isCenter ? 44 : 28,
          decoration: BoxDecoration(
            color: isCenter
                ? Colors.white.withValues(alpha: 0.58)
                : active
                ? AppColors.teal700.withValues(alpha: 0.10)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(isCenter ? 22 : 10),
            border: Border.all(
              color: active || isCenter
                  ? AppColors.teal200.withValues(alpha: 0.7)
                  : Colors.transparent,
            ),
          ),
          child: Icon(
            icon,
            color: active || isCenter ? AppColors.teal700 : AppColors.ink300,
            size: isCenter ? 20 : 18,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            color: active ? AppColors.teal700 : AppColors.ink400,
            fontSize: 9,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }
}
