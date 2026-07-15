class Specialty {
  const Specialty({
    required this.id,
    required this.name,
    required this.sub,
    required this.icon,
    required this.tint,
    required this.accent,
    this.dbNames = const [],
    this.disabled = false,
  });

  final String id;
  final String name;
  final String sub;
  final String icon;
  final int tint;
  final int accent;
  final List<String> dbNames;
  final bool disabled;
}

class Doctor {
  const Doctor({
    required this.id,
    required this.name,
    required this.specialty,
    required this.rating,
    required this.reviews,
    required this.price,
    required this.today,
    required this.exp,
    required this.loc,
    required this.initials,
    required this.hue,
    this.registrationId,
    this.locationAddress,
    this.locationLat,
    this.locationLng,
  });

  final String id;
  final String name;
  final String specialty;
  final double rating;
  final int reviews;
  final int price;
  final bool today;
  final String exp;
  final String loc;
  final String initials;
  final int hue;
  final String? registrationId;
  final String? locationAddress;
  final double? locationLat;
  final double? locationLng;
}

class Appointment {
  const Appointment({
    required this.id,
    required this.doctor,
    required this.specialty,
    required this.date,
    required this.time,
    required this.status,
    required this.initials,
    required this.hue,
    this.clinic,
    this.price,
    this.doctorId,
    this.rating,
    this.review,
  });

  final String id;
  final String doctor;
  final String specialty;
  final String date;
  final String time;
  final String status;
  final String initials;
  final int hue;
  final String? clinic;
  final int? price;
  final String? doctorId;
  final double? rating;
  final String? review;
}

class PatientResult {
  const PatientResult({
    required this.id,
    required this.doctor,
    required this.specialty,
    required this.date,
    required this.title,
    required this.diagnosis,
    required this.notes,
    required this.meds,
    required this.next,
    required this.unread,
  });

  final String id;
  final String doctor;
  final String specialty;
  final String date;
  final String title;
  final String diagnosis;
  final String notes;
  final List<String> meds;
  final String next;
  final bool unread;
}

class TabeebiNotification {
  const TabeebiNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    required this.time,
    required this.unread,
  });

  final String id;
  final String type;
  final String title;
  final String body;
  final String time;
  final bool unread;
}

class SupportTicket {
  const SupportTicket({
    required this.id,
    required this.subject,
    required this.status,
    required this.time,
    required this.last,
  });

  final String id;
  final String subject;
  final String status;
  final String time;
  final String last;
}

class TimeSlot {
  const TimeSlot({required this.t, required this.state});

  final String t;
  final String state;
}

class Day {
  const Day({
    required this.day,
    required this.num,
    required this.month,
    required this.full,
    required this.key,
  });

  final String day;
  final int num;
  final String month;
  final String full;
  final String key;
}

class UserData {
  const UserData({
    required this.phone,
    this.id,
    this.name,
    this.isLogin,
    this.patientCode,
    this.token,
    this.avatarHue,
    this.isRegistered,
  });

  final String phone;
  final String? id;
  final String? name;
  final bool? isLogin;
  final String? patientCode;
  final String? token;
  final int? avatarHue;
  final bool? isRegistered;

  factory UserData.fromJson(Map<String, dynamic> json) {
    return UserData(
      id: json['id']?.toString(),
      phone: json['phone']?.toString() ?? '',
      name: json['name']?.toString(),
      isLogin: json['is_login'] == true || json['is_login']?.toString() == '1',
      patientCode: json['patient_code']?.toString(),
      token: json['token']?.toString(),
      avatarHue: int.tryParse(json['avatar_hue']?.toString() ?? ''),
      isRegistered:
          json['is_registered'] == true ||
          json['is_registered']?.toString() == '1',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'phone': phone,
      'name': name,
      'is_login': isLogin,
      'patient_code': patientCode,
      'token': token,
      'avatar_hue': avatarHue,
      'is_registered': isRegistered,
    };
  }

  UserData copyWith({
    String? phone,
    String? id,
    String? name,
    bool? isLogin,
    String? patientCode,
    String? token,
    int? avatarHue,
    bool? isRegistered,
  }) {
    return UserData(
      phone: phone ?? this.phone,
      id: id ?? this.id,
      name: name ?? this.name,
      isLogin: isLogin ?? this.isLogin,
      patientCode: patientCode ?? this.patientCode,
      token: token ?? this.token,
      avatarHue: avatarHue ?? this.avatarHue,
      isRegistered: isRegistered ?? this.isRegistered,
    );
  }
}
