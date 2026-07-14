import 'dart:ui';

import 'package:flutter/material.dart';

import '../core/localization/app_localizations.dart';
import '../core/theme/app_colors.dart';
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
    final items = [
      (MainTab.home, Icons.home_rounded, AppLocalizations.t('home')),
      (
        MainTab.appointments,
        Icons.calendar_month_rounded,
        AppLocalizations.t('bookings'),
      ),
      (MainTab.ai, Icons.auto_awesome_rounded, AppLocalizations.t('ai_tab')),
      (MainTab.results, Icons.science_rounded, AppLocalizations.t('results')),
      (MainTab.profile, Icons.person_rounded, AppLocalizations.t('profile')),
    ];
    final activeIndex = items.indexWhere((item) => item.$1 == selectedTab);

    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: AppColors.teal700.withValues(alpha: 0.16),
            blurRadius: 22,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(30),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
          child: Container(
            height: 68,
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(30),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.white.withValues(alpha: 0.82),
                  AppColors.teal50.withValues(alpha: 0.64),
                  Colors.white.withValues(alpha: 0.70),
                ],
              ),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.72),
                width: 1.2,
              ),
            ),
            child: LayoutBuilder(
              builder: (context, constraints) {
                final itemWidth = constraints.maxWidth / items.length;
                return Stack(
                  children: [
                    AnimatedPositioned(
                      duration: const Duration(milliseconds: 360),
                      curve: Curves.easeOutCubic,
                      left: itemWidth * activeIndex + 2,
                      top: 6,
                      width: itemWidth - 4,
                      height: 44,
                      child: const _LiquidActiveBlob(),
                    ),
                    Row(
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
                  ],
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}

class _LiquidActiveBlob extends StatelessWidget {
  const _LiquidActiveBlob();

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white.withValues(alpha: 0.58),
            AppColors.teal50.withValues(alpha: 0.42),
            Colors.white.withValues(alpha: 0.50),
          ],
        ),
        border: Border.all(
          color: AppColors.teal200.withValues(alpha: 0.34),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.teal700.withValues(alpha: 0.07),
            blurRadius: 18,
            offset: const Offset(0, 7),
          ),
          BoxShadow(
            color: Colors.white.withValues(alpha: 0.48),
            blurRadius: 12,
            offset: const Offset(-2, -2),
          ),
        ],
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
    final activeColor = AppColors.teal700;
    final inactiveColor = AppColors.ink300;

    return AnimatedScale(
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOutCubic,
      scale: active ? 1.04 : 1,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 240),
            curve: Curves.easeOutCubic,
            width: 30,
            height: 28,
            decoration: BoxDecoration(
              color: Colors.transparent,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: Colors.transparent,
              ),
            ),
            child: Icon(
              icon,
              color: active ? activeColor : inactiveColor,
              size: isCenter ? 20 : 18,
            ),
          ),
          const SizedBox(height: 1),
          AnimatedDefaultTextStyle(
            duration: const Duration(milliseconds: 220),
            curve: Curves.easeOutCubic,
            style: TextStyle(
              color: active ? activeColor : AppColors.ink400,
              fontSize: 9,
              fontWeight: active ? FontWeight.w900 : FontWeight.w800,
            ),
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
