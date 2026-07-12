import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

class StatusBadge extends StatelessWidget {
  const StatusBadge({super.key, required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final normalized = status.toLowerCase();
    final colors = switch (normalized) {
      'confirmed' => (AppColors.green100, AppColors.green500),
      'pending' => (AppColors.amber100, AppColors.amber700),
      'cancelled' => (AppColors.red100, AppColors.red500),
      'completed' => (AppColors.teal50, AppColors.teal700),
      _ => (AppColors.ink100, AppColors.ink500),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: colors.$1,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        normalized,
        style: TextStyle(
          color: colors.$2,
          fontSize: 10,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}
