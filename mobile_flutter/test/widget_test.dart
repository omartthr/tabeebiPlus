import 'package:flutter_test/flutter_test.dart';
import 'package:tabeebi_flutter/app/tabeebi_app.dart';

void main() {
  testWidgets('Tabeebi Flutter app starts at welcome screen', (tester) async {
    await tester.pumpWidget(const TabeebiApp());

    expect(find.text('Your trusted health companion'), findsOneWidget);
    expect(find.text('Get started'), findsOneWidget);
  });
}
