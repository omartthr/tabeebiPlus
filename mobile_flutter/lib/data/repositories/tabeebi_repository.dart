import 'package:flutter/material.dart';

import '../../core/network/tabeebi_api_client.dart';
import '../../core/utils/tabeebi_date_utils.dart';
import '../models/tabeebi_models.dart';
import 'demo_data.dart' as demo;

class TabeebiRepository {
  const TabeebiRepository(this.api);

  final TabeebiApiClient api;

  Future<List<Doctor>> getDoctors(Specialty specialty) async {
    final result = await api.getDoctors(specialties: specialty.dbNames);
    final raw = _listFrom(result.data, 'doctors');
    if (result.error != null || raw.isEmpty) return demo.doctors;
    return raw
        .whereType<Map>()
        .map(doctorFromJson)
        .where(
          (doctor) =>
              specialty.dbNames.isEmpty ||
              specialty.dbNames.contains(doctor.specialty),
        )
        .toList();
  }

  Future<List<Doctor>> getRecommendedDoctors() async {
    final result = await api.getRecommendedDoctors();
    final raw = _listFrom(result.data, 'doctors');
    if (result.error != null || raw.isEmpty) return demo.doctors;
    return raw.whereType<Map>().map(doctorFromJson).toList();
  }

  Future<Appointment?> getNextAppointment() async {
    final result = await api.getNextAppointment();
    if (result.error != null || result.data == null) return null;
    final data = result.data;
    final raw = data is Map && data['appointment'] != null
        ? data['appointment']
        : data;
    if (raw is! Map) return null;
    return appointmentFromJson(raw);
  }

  Future<List<Appointment>> getMyAppointments() async {
    final result = await api.getMyAppointments();
    final raw = _listFrom(result.data, 'appointments');
    if (result.error != null || raw.isEmpty) return demo.upcomingAppointments;
    return raw.whereType<Map>().map(appointmentFromJson).toList();
  }

  Future<bool> cancelAppointment(String id) async {
    final result = await api.updateAppointment(id, {'status': 'cancelled'});
    return result.error == null;
  }

  Future<bool> submitRating(String id, int rating, String? review) async {
    final result = await api.updateAppointment(id, {
      'rating': rating,
      'review': review,
    });
    return result.error == null;
  }

  Future<Map<String, dynamic>?> getDoctorSchedule(String doctorId) async {
    final result = await api.getDoctorSchedule(doctorId);
    if (result.data is! Map) return null;
    return Map<String, dynamic>.from(result.data as Map);
  }

  Future<List<String>> getBookedTimes(String doctorId, String date) async {
    final result = await api.getBookedTimes(doctorId, date);
    return _listFrom(
      result.data,
      'booked_times',
    ).map((item) => item.toString()).toList();
  }

  Future<ApiResult<dynamic>> createAppointment(
    Map<String, dynamic> appointment,
  ) {
    return api.createAppointment(appointment);
  }

  Future<List<PatientResultItem>> getResults() async {
    final result = await api.getPatientResults();
    final raw = _listFrom(result.data, 'results');
    return raw.whereType<Map>().map(resultFromJson).toList();
  }

  Future<List<AppNotificationItem>> getNotifications() async {
    final result = await api.getNotifications();
    final raw = _listFrom(result.data, 'notifications');
    return raw.whereType<Map>().map(notificationFromJson).toList();
  }

  Future<bool> markNotificationsRead({String? id}) async {
    final result = await api.markNotificationsRead(id: id);
    return result.error == null;
  }

  Future<List<SupportTicket>> getSupportTickets() async {
    final result = await api.get('/support_tickets');
    final raw = _listFrom(result.data, 'tickets');
    return raw.whereType<Map>().map(ticketFromJson).toList();
  }

  Future<bool> createSupportTicket(String subject, String message) async {
    final result = await api.createSupportTicket({
      'subject': subject,
      'message': message,
    });
    return result.error == null;
  }

  Future<PatientCounts?> getPatientCounts() async {
    final result = await api.getPatientCounts();
    if (result.data is! Map) return null;
    final map = result.data as Map;
    return PatientCounts(
      appointments: _int(map['appointments'] ?? map['appointments_count']),
      results: _int(map['results'] ?? map['results_count']),
      notifications: _int(map['notifications'] ?? map['notifications_count']),
    );
  }
}

@immutable
class PatientResultItem {
  const PatientResultItem({
    required this.id,
    required this.date,
    required this.doctorName,
    required this.specialty,
    this.aiSummary,
    this.pdfUrl,
  });

  final String id;
  final String date;
  final String doctorName;
  final String specialty;
  final String? aiSummary;
  final String? pdfUrl;
}

@immutable
class AppNotificationItem {
  const AppNotificationItem({
    required this.id,
    required this.title,
    required this.body,
    required this.time,
    required this.unread,
    this.type = 'reminder',
  });

  final String id;
  final String title;
  final String body;
  final String time;
  final bool unread;
  final String type;
}

@immutable
class PatientCounts {
  const PatientCounts({
    required this.appointments,
    required this.results,
    required this.notifications,
  });

  final int appointments;
  final int results;
  final int notifications;
}

Doctor doctorFromJson(Map raw) {
  final name = raw['name']?.toString() ?? 'Unknown';
  return Doctor(
    id: raw['id']?.toString() ?? '',
    name: name,
    specialty: raw['specialty']?.toString() ?? '-',
    rating: double.tryParse(raw['rating']?.toString() ?? '') ?? 0,
    reviews: _int(raw['reviews']),
    price: _int(raw['price']),
    today: raw['today'] == true || raw['today']?.toString() == '1',
    exp: raw['exp']?.toString() ?? '1 yrs',
    loc: raw['loc']?.toString() ?? raw['location_address']?.toString() ?? '',
    initials: raw['initials']?.toString() ?? _initials(name),
    hue: _int(raw['hue'], fallback: 175),
    registrationId: raw['registration_id']?.toString(),
    locationAddress: raw['location_address']?.toString(),
    locationLat: double.tryParse(raw['location_lat']?.toString() ?? ''),
    locationLng: double.tryParse(raw['location_lng']?.toString() ?? ''),
  );
}

Appointment appointmentFromJson(Map raw) {
  final doctor = raw['doctor'] is Map ? raw['doctor'] as Map : const {};
  final date = raw['date']?.toString() ?? '';
  final day = _firstDay(date);
  final name = doctor['name']?.toString() ?? 'Unknown';
  final time = raw['time']?.toString() ?? '';
  final status = raw['status']?.toString() ?? 'pending';
  final finalStatus =
      isAppointmentPast(date, time) &&
          (status == 'pending' || status == 'confirmed')
      ? 'completed'
      : status;
  return Appointment(
    id: raw['id']?.toString() ?? '',
    doctor: name,
    specialty: doctor['specialty']?.toString() ?? '-',
    date: day?.full ?? date,
    time: time,
    status: finalStatus,
    initials: doctor['initials']?.toString() ?? _initials(name),
    hue: _int(doctor['hue'], fallback: 175),
    clinic: doctor['loc']?.toString(),
    price: _int(raw['price'] ?? doctor['price']),
    doctorId: raw['doctor_id']?.toString(),
    rating: double.tryParse(raw['rating']?.toString() ?? ''),
    review: raw['review']?.toString(),
  );
}

PatientResultItem resultFromJson(Map raw) {
  final doctor = raw['doctor'] is Map ? raw['doctor'] as Map : const {};
  return PatientResultItem(
    id: raw['id']?.toString() ?? '',
    date: raw['date']?.toString() ?? '',
    doctorName: doctor['name']?.toString() ?? 'Unknown doctor',
    specialty: doctor['specialty']?.toString() ?? '-',
    aiSummary: raw['diagnosis']?.toString().isNotEmpty == true
        ? raw['diagnosis'].toString()
        : raw['notes']?.toString(),
    pdfUrl: raw['pdf_url']?.toString(),
  );
}

AppNotificationItem notificationFromJson(Map raw) {
  return AppNotificationItem(
    id: raw['id']?.toString() ?? '',
    title: raw['title']?.toString() ?? '',
    body: raw['body']?.toString() ?? '',
    time: raw['created_at']?.toString() ?? raw['time']?.toString() ?? '',
    unread: raw['unread'] == true || raw['unread']?.toString() == '1',
    type: raw['type']?.toString() ?? 'reminder',
  );
}

SupportTicket ticketFromJson(Map raw) {
  return SupportTicket(
    id: raw['id']?.toString() ?? '',
    subject: raw['subject']?.toString() ?? '',
    status: raw['status']?.toString() ?? '',
    time: raw['time']?.toString() ?? '',
    last: raw['last']?.toString() ?? raw['message']?.toString() ?? '',
  );
}

List<dynamic> _listFrom(dynamic data, String key) {
  if (data is List) return data;
  if (data is Map && data[key] is List) return data[key] as List;
  return const [];
}

int _int(dynamic value, {int fallback = 0}) {
  return int.tryParse(value?.toString() ?? '') ?? fallback;
}

String _initials(String name) {
  final parts = name
      .trim()
      .split(RegExp(r'\s+'))
      .where((p) => p.isNotEmpty)
      .toList();
  if (parts.isEmpty) {
    return '??';
  }
  if (parts.length == 1)
    return parts.first.characters.take(2).join().toUpperCase();
  return '${parts.first.characters.first}${parts.last.characters.first}'
      .toUpperCase();
}

Day? _firstDay(String key) {
  for (final day in generateDays()) {
    if (day.key == key) return day;
  }
  return null;
}
