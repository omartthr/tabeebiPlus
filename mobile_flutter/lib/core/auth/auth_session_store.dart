import 'dart:async';
import 'dart:convert';

import 'package:flutter/services.dart';

import '../../data/models/tabeebi_models.dart';

class AuthSession {
  const AuthSession({
    required this.user,
    required this.token,
    required this.savedAt,
  });

  final UserData user;
  final String token;
  final DateTime savedAt;
}

class AuthSessionStore {
  const AuthSessionStore();

  static const sessionDuration = Duration(days: 30);
  static const _platformTimeout = Duration(seconds: 2);
  static const _channel = MethodChannel('tabeebi/session_store');
  static const _sessionKey = 'auth_session_v1';

  Future<AuthSession?> load() async {
    final raw = await _getString(_sessionKey);
    if (raw == null || raw.isEmpty) return null;

    try {
      final decoded = jsonDecode(raw);
      if (decoded is! Map<String, dynamic>) {
        await clear();
        return null;
      }

      final token = decoded['token']?.toString();
      final savedAtRaw = decoded['saved_at']?.toString();
      final userRaw = decoded['user'];
      final savedAt = savedAtRaw == null ? null : DateTime.tryParse(savedAtRaw);

      if (token == null ||
          token.isEmpty ||
          savedAt == null ||
          userRaw is! Map<String, dynamic>) {
        await clear();
        return null;
      }

      if (DateTime.now().difference(savedAt) >= sessionDuration) {
        await clear();
        return null;
      }

      return AuthSession(
        user: UserData.fromJson(userRaw).copyWith(token: token),
        token: token,
        savedAt: savedAt,
      );
    } catch (_) {
      await clear();
      return null;
    }
  }

  Future<void> save(UserData user, String token) async {
    await _setString(
      _sessionKey,
      jsonEncode({
        'token': token,
        'saved_at': DateTime.now().toIso8601String(),
        'user': user.copyWith(token: token).toJson(),
      }),
    );
  }

  Future<void> clear() async {
    await _remove(_sessionKey);
  }

  Future<String?> _getString(String key) async {
    try {
      return await _channel
          .invokeMethod<String>('getString', {'key': key})
          .timeout(_platformTimeout, onTimeout: () => null);
    } on MissingPluginException {
      return null;
    } on PlatformException {
      return null;
    }
  }

  Future<void> _setString(String key, String value) async {
    try {
      await _channel
          .invokeMethod<void>('setString', {'key': key, 'value': value})
          .timeout(_platformTimeout);
    } on MissingPluginException {
      return;
    } on PlatformException {
      return;
    } on TimeoutException {
      return;
    }
  }

  Future<void> _remove(String key) async {
    try {
      await _channel
          .invokeMethod<void>('remove', {'key': key})
          .timeout(_platformTimeout);
    } on MissingPluginException {
      return;
    } on PlatformException {
      return;
    } on TimeoutException {
      return;
    }
  }
}
