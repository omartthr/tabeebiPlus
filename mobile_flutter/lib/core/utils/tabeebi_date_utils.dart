import '../../data/models/tabeebi_models.dart';

List<Day> generateDays({DateTime? from}) {
  final now = from ?? DateTime.now();
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return List.generate(7, (index) {
    final date = DateTime(now.year, now.month, now.day + index);
    final dayName = weekDays[date.weekday % 7];
    final monthName = months[date.month - 1];
    final monthNum = date.month.toString().padLeft(2, '0');
    final dayNum = date.day.toString().padLeft(2, '0');

    return Day(
      day: dayName,
      num: date.day,
      month: monthName,
      full: '$dayName $monthName ${date.day}',
      key: '${date.year}-$monthNum-$dayNum',
    );
  });
}

bool isAppointmentPast(String date, String time) {
  final parsedDate = DateTime.tryParse(date);
  if (parsedDate == null) return false;

  final parts = time.split(':');
  if (parts.length < 2) return false;

  final hour = int.tryParse(parts[0]) ?? 0;
  final minute = int.tryParse(parts[1].replaceAll(RegExp(r'\D'), '')) ?? 0;
  final appointmentDate = DateTime(
    parsedDate.year,
    parsedDate.month,
    parsedDate.day,
    hour,
    minute,
  );

  return appointmentDate.isBefore(DateTime.now());
}

String iqd(int value) {
  final raw = value.toString();
  final buffer = StringBuffer();
  for (var i = 0; i < raw.length; i++) {
    final remaining = raw.length - i;
    buffer.write(raw[i]);
    if (remaining > 1 && remaining % 3 == 1) {
      buffer.write(',');
    }
  }
  return buffer.toString();
}
