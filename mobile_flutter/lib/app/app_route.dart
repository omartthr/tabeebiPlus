import '../data/models/tabeebi_models.dart';

enum RootFlow { welcome, login, register, otp, main }

enum MainTab { home, appointments, ai, results, profile }

enum StackScreen {
  main,
  notifications,
  doctorList,
  doctorDetail,
  booking,
  confirmed,
  help,
  privacy,
}

class BookingDraft {
  const BookingDraft({
    required this.doctor,
    required this.day,
    required this.time,
    required this.payment,
  });

  final Doctor doctor;
  final String day;
  final String time;
  final String payment;
}
