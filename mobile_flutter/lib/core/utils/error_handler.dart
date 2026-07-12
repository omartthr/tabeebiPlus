import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../localization/app_localizations.dart';

class ErrorHandler {
  ErrorHandler._();

  static void showSuccess(BuildContext context, String message) {
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: AppColors.green500,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  static void showError(BuildContext context, String rawError) {
    if (!context.mounted) return;
    
    // Convert generic system/network errors to user-friendly messages in current language
    String friendlyMessage;
    final lowerErr = rawError.toLowerCase();
    
    if (lowerErr.contains('socketexception') || lowerErr.contains('handshake') || lowerErr.contains('network')) {
      friendlyMessage = AppLocalizations.t('something_went_wrong') + 'Network connection error. Please check your internet.';
    } else if (lowerErr.contains('timeout')) {
      friendlyMessage = AppLocalizations.t('something_went_wrong') + 'Request timeout. Please try again.';
    } else if (lowerErr.contains('http 401') || lowerErr.contains('unauthorized')) {
      friendlyMessage = AppLocalizations.t('something_went_wrong') + 'Session expired. Please log in again.';
    } else if (lowerErr.contains('http 404')) {
      friendlyMessage = AppLocalizations.t('something_went_wrong') + 'Requested source not found.';
    } else if (lowerErr.contains('http 50')) {
      friendlyMessage = AppLocalizations.t('something_went_wrong') + 'Server error. Please try again later.';
    } else {
      friendlyMessage = AppLocalizations.t('something_went_wrong') + rawError;
    }

    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                friendlyMessage,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: AppColors.red500,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        duration: const Duration(seconds: 4),
      ),
    );
  }
}
