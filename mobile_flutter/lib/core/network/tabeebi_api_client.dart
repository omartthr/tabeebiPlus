import 'dart:convert';
import 'dart:io';

class ApiResult<T> {
  const ApiResult({this.data, this.error});

  final T? data;
  final String? error;

  bool get ok => error == null;
}

class TabeebiApiClient {
  TabeebiApiClient({
    String? baseUrl,
    HttpClient? httpClient,
    this.tokenProvider,
  }) : baseUrl = baseUrl ?? 'https://tabeebiplus-production.up.railway.app/api',
       _httpClient = httpClient ?? HttpClient();

  final String baseUrl;
  final HttpClient _httpClient;
  final Future<String?> Function()? tokenProvider;

  Future<ApiResult<dynamic>> get(
    String path, {
    Map<String, String>? query,
    Map<String, List<String>>? queryAll,
  }) {
    return _send('GET', path, query: query, queryAll: queryAll);
  }

  Future<ApiResult<dynamic>> post(String path, Map<String, dynamic> body) {
    return _send('POST', path, body: body);
  }

  Future<ApiResult<dynamic>> patch(String path, Map<String, dynamic> body) {
    return _send('PATCH', path, body: body);
  }

  Future<ApiResult<dynamic>> delete(String path) {
    return _send('DELETE', path);
  }

  Future<ApiResult<dynamic>> getPatient(String phone) {
    return get('/patients/$phone');
  }

  Future<ApiResult<dynamic>> sendOtp(String phone) {
    return post('/auth/send-otp', {'phone': phone});
  }

  Future<ApiResult<dynamic>> verifyOtp(String phone, String code) {
    return post('/auth/verify-otp', {'phone': phone, 'code': code});
  }

  Future<ApiResult<dynamic>> getMe() {
    return get('/auth/me');
  }

  Future<ApiResult<dynamic>> getDoctors({List<String>? specialties}) {
    final queryAll = specialties == null || specialties.isEmpty
        ? null
        : {'specialties[]': specialties};
    return get('/doctors', queryAll: queryAll);
  }

  Future<ApiResult<dynamic>> getDoctorSchedule(String doctorId) {
    return get('/doctors/$doctorId/schedule');
  }

  Future<ApiResult<dynamic>> getBookedTimes(String doctorId, String date) {
    return get(
      '/appointments/booked-times',
      query: {'doctor_id': doctorId, 'date': date},
    );
  }

  Future<ApiResult<dynamic>> getNextAppointment() {
    return get('/appointments/next');
  }

  Future<ApiResult<dynamic>> getRecommendedDoctors({
    List<String>? specialties,
  }) {
    final queryAll = specialties == null || specialties.isEmpty
        ? null
        : {'specialties[]': specialties};
    return get('/doctors/recommended', queryAll: queryAll);
  }

  Future<ApiResult<dynamic>> getPatientCounts() {
    return get('/patient/counts');
  }

  Future<ApiResult<dynamic>> getMyAppointments() {
    return get('/appointments/my-appointments');
  }

  Future<ApiResult<dynamic>> createAppointment(
    Map<String, dynamic> appointment,
  ) {
    return post('/appointments', appointment);
  }

  Future<ApiResult<dynamic>> updateAppointment(
    String id,
    Map<String, dynamic> updates,
  ) {
    return patch('/appointments/$id', updates);
  }

  Future<ApiResult<dynamic>> getNotifications() {
    return get('/notifications');
  }

  Future<ApiResult<dynamic>> markNotificationsRead({String? id}) {
    return patch('/notifications/mark-read', id != null ? {'id': id} : const {});
  }

  Future<ApiResult<dynamic>> getPatientResults() {
    return get('/results');
  }

  Future<ApiResult<dynamic>> createSupportTicket(Map<String, dynamic> ticket) {
    return post('/support_tickets', ticket);
  }

  Future<ApiResult<dynamic>> deleteAccount() {
    return delete('/account');
  }

  Future<ApiResult<dynamic>> _send(
    String method,
    String path, {
    Map<String, String>? query,
    Map<String, List<String>>? queryAll,
    Map<String, dynamic>? body,
  }) async {
    try {
      final baseUri = Uri.parse('$baseUrl$path');
      final uri = queryAll == null
          ? baseUri.replace(queryParameters: query)
          : baseUri.replace(query: _queryString(query, queryAll));
      final request = await _httpClient.openUrl(method, uri);
      request.headers.contentType = ContentType.json;
      final token = await tokenProvider?.call();
      if (token != null && token.isNotEmpty) {
        request.headers.set(HttpHeaders.authorizationHeader, 'Bearer $token');
      }
      if (body != null) {
        request.write(jsonEncode(body));
      }

      final response = await request.close().timeout(
        const Duration(seconds: 12),
      );
      final raw = await response.transform(utf8.decoder).join();
      final decoded = raw.isEmpty ? null : jsonDecode(raw);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return ApiResult(data: decoded);
      }
      return ApiResult(error: 'HTTP ${response.statusCode}');
    } catch (error) {
      return ApiResult(error: error.toString());
    }
  }
}

String _queryString(
  Map<String, String>? query,
  Map<String, List<String>> queryAll,
) {
  final parts = <String>[];
  query?.forEach((key, value) {
    parts.add('${Uri.encodeQueryComponent(key)}=${Uri.encodeQueryComponent(value)}');
  });
  queryAll.forEach((key, values) {
    for (final value in values) {
      parts.add('${Uri.encodeQueryComponent(key)}=${Uri.encodeQueryComponent(value)}');
    }
  });
  return parts.join('&');
}
