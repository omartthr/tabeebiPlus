import 'package:flutter/material.dart';

class AppColors {
  const AppColors._();

  static const teal900 = Color(0xFF0D4A46);
  static const teal800 = Color(0xFF135E59);
  static const teal700 = Color(0xFF1A7A73);
  static const teal600 = Color(0xFF22968D);
  static const teal500 = Color(0xFF2EB8AE);
  static const teal200 = Color(0xFF99E1D9);
  static const teal100 = Color(0xFFC2EDE9);
  static const teal50 = Color(0xFFEDFAF8);

  static const amber700 = Color(0xFFB37D1F);
  static const amber600 = Color(0xFFD59528);
  static const amber500 = Color(0xFFE6A63B);
  static const amber100 = Color(0xFFFCEFD3);
  static const amber50 = Color(0xFFFDF6E6);

  static const ink900 = Color(0xFF0C1E1D);
  static const ink700 = Color(0xFF244947);
  static const ink500 = Color(0xFF4D706D);
  static const ink400 = Color(0xFF7FA09D);
  static const ink300 = Color(0xFFAECBC9);
  static const ink200 = Color(0xFFD5E8E7);
  static const ink100 = Color(0xFFEAF3F3);

  static const bg = Color(0xFFFFFFFF);
  static const surface = Color(0xFFFFFFFF);

  static const green500 = Color(0xFF17A673);
  static const green100 = Color(0xFFD6F1E4);
  static const red500 = Color(0xFFD9534A);
  static const red100 = Color(0xFFFADFDC);
  static const orange500 = Color(0xFFE88A3B);
  static const orange100 = Color(0xFFFBE6D1);
}

class AppShadows {
  const AppShadows._();

  static List<BoxShadow> card = [
    BoxShadow(
      color: AppColors.teal700.withValues(alpha: 0.08),
      blurRadius: 10,
      offset: const Offset(0, 2),
    ),
  ];

  static List<BoxShadow> float = [
    BoxShadow(
      color: AppColors.teal700.withValues(alpha: 0.16),
      blurRadius: 20,
      offset: const Offset(0, 8),
    ),
  ];

  static List<BoxShadow> button = [
    BoxShadow(
      color: AppColors.teal700.withValues(alpha: 0.30),
      blurRadius: 10,
      offset: const Offset(0, 4),
    ),
  ];
}
