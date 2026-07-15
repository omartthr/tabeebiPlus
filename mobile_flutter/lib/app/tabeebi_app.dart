import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import '../core/theme/app_colors.dart';
import '../core/auth/auth_session_store.dart';
import '../core/localization/app_localizations.dart';
import '../core/network/tabeebi_api_client.dart';
import '../data/models/tabeebi_models.dart';
import '../data/repositories/demo_data.dart';
import '../data/repositories/tabeebi_repository.dart';
import '../features/ai/ai_chat_screen.dart';
import '../features/appointments/appointments_screen.dart';
import '../features/appointments/booking_screen.dart';
import '../features/appointments/confirmed_screen.dart';
import '../features/auth/login_screen.dart';
import '../features/auth/otp_screen.dart';
import '../features/auth/register_screen.dart';
import '../features/auth/welcome_screen.dart';
import '../features/doctors/doctor_detail_screen.dart';
import '../features/doctors/doctor_list_screen.dart';
import '../features/home/home_screen.dart';
import '../features/notifications/notifications_screen.dart';
import '../features/profile/privacy_screen.dart';
import '../features/profile/profile_screen.dart';
import '../features/results/results_screen.dart';
import '../features/support/help_screen.dart';
import 'app_route.dart';
import 'main_shell.dart';

class TabeebiApp extends StatefulWidget {
  const TabeebiApp({super.key});

  @override
  State<TabeebiApp> createState() => _TabeebiAppState();
}

class _TabeebiAppState extends State<TabeebiApp> {
  String _locale = 'en';

  void _changeLocale(String lang) {
    setState(() {
      _locale = lang;
      AppLocalizations.currentLanguage = lang;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Tabeebi',
      locale: Locale(_locale),
      supportedLocales: const [
        Locale('en'),
        Locale('tr'),
        Locale('ar'),
        Locale('ku'),
      ],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: AppColors.bg,
        colorScheme: ColorScheme.fromSeed(seedColor: AppColors.teal700),
        fontFamily: 'Roboto',
      ),
      home: TabeebiRoot(
        currentLanguage: _locale,
        onLanguageChanged: _changeLocale,
      ),
    );
  }
}

class TabeebiRoot extends StatefulWidget {
  const TabeebiRoot({
    super.key,
    required this.currentLanguage,
    required this.onLanguageChanged,
  });

  final String currentLanguage;
  final ValueChanged<String> onLanguageChanged;

  @override
  State<TabeebiRoot> createState() => _TabeebiRootState();
}

class _TabeebiRootState extends State<TabeebiRoot> {
  RootFlow flow = RootFlow.welcome;
  MainTab tab = MainTab.home;
  StackScreen stack = StackScreen.main;
  UserData? user;
  Specialty? selectedSpecialty;
  Doctor? selectedDoctor;
  BookingDraft? confirmedBooking;
  String? pendingName;
  String? pendingPhone;
  bool pendingIsLogin = false;
  String? authToken;
  bool restoringSession = true;

  final AuthSessionStore _sessionStore = AuthSessionStore();
  late final TabeebiApiClient api = TabeebiApiClient(
    tokenProvider: () async => authToken,
  );
  late final TabeebiRepository repository = TabeebiRepository(api);

  @override
  void initState() {
    super.initState();
    _restoreSession();
  }

  Future<void> _restoreSession() async {
    AuthSession? session;
    try {
      session = await _sessionStore.load();
    } catch (_) {
      session = null;
    }
    if (!mounted) return;
    setState(() {
      user = session?.user;
      authToken = session?.token;
      flow = session == null ? RootFlow.welcome : RootFlow.main;
      restoringSession = false;
    });
  }

  Future<void> _saveSession(UserData verifiedUser, String token) async {
    await _sessionStore.save(verifiedUser, token);
  }

  Future<void> _clearSession() async {
    await _sessionStore.clear();
    if (!mounted) return;
    setState(() {
      user = null;
      authToken = null;
      flow = RootFlow.welcome;
      stack = StackScreen.main;
      tab = MainTab.home;
    });
  }

  void _goMain({MainTab? nextTab}) {
    setState(() {
      flow = RootFlow.main;
      stack = StackScreen.main;
      if (nextTab != null) tab = nextTab;
    });
  }

  void _openStack(
    StackScreen next, {
    Specialty? specialty,
    Doctor? doctor,
    BookingDraft? booking,
  }) {
    setState(() {
      stack = next;
      selectedSpecialty = specialty ?? selectedSpecialty;
      selectedDoctor = doctor ?? selectedDoctor;
      confirmedBooking = booking ?? confirmedBooking;
    });
  }

  void _backToMain() => setState(() => stack = StackScreen.main);

  @override
  Widget build(BuildContext context) {
    if (restoringSession) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: AppColors.teal700),
        ),
      );
    }

    if (flow == RootFlow.welcome) {
      return WelcomeScreen(
        currentLanguage: widget.currentLanguage,
        onLanguageChanged: widget.onLanguageChanged,
        onLogin: () => setState(() => flow = RootFlow.login),
        onRegister: () => setState(() => flow = RootFlow.register),
      );
    }
    if (flow == RootFlow.login) {
      return LoginScreen(
        onBack: () => setState(() => flow = RootFlow.welcome),
        api: api,
        onOtp: (phone) => setState(() {
          pendingPhone = phone;
          pendingName = null;
          pendingIsLogin = true;
          flow = RootFlow.otp;
        }),
        onRegister: () => setState(() => flow = RootFlow.register),
      );
    }
    if (flow == RootFlow.register) {
      return RegisterScreen(
        onBack: () => setState(() => flow = RootFlow.welcome),
        onOtp: (name, phone) => setState(() {
          pendingName = name;
          pendingPhone = phone;
          pendingIsLogin = false;
          flow = RootFlow.otp;
        }),
        onLogin: () => setState(() => flow = RootFlow.login),
      );
    }
    if (flow == RootFlow.otp) {
      return OtpScreen(
        onBack: () => setState(
          () => flow = pendingIsLogin ? RootFlow.login : RootFlow.register,
        ),
        api: api,
        name: pendingName,
        phone: pendingPhone ?? '',
        isLogin: pendingIsLogin,
        onVerified: (verifiedUser, token) async {
          await _saveSession(verifiedUser, token);
          authToken = token;
          user = verifiedUser;
          _goMain();
        },
      );
    }

    return switch (stack) {
      StackScreen.main => MainShell(
        selectedTab: tab,
        onTabChanged: (next) => setState(() => tab = next),
        home: HomeScreen(
          repository: repository,
          userName: user?.name ?? 'User',
          onNotifications: () => _openStack(StackScreen.notifications),
          onSpecialty: (specialty) =>
              _openStack(StackScreen.doctorList, specialty: specialty),
          onAi: () => setState(() => tab = MainTab.ai),
        ),
        appointments: AppointmentsScreen(
          repository: repository,
          onBookAgain: (doctor) =>
              _openStack(StackScreen.booking, doctor: doctor),
          onResults: () => setState(() => tab = MainTab.results),
        ),
        ai: const AiChatScreen(),
        results: ResultsScreen(repository: repository),
        profile: ProfileScreen(
          user: user,
          repository: repository,
          currentLanguage: widget.currentLanguage,
          onLanguageChanged: widget.onLanguageChanged,
          onNavigateToTab: (nextTab) => setState(() => tab = nextTab),
          onHelp: () => _openStack(StackScreen.help),
          onPrivacy: () => _openStack(StackScreen.privacy),
          onSignOut: _clearSession,
        ),
      ),
      StackScreen.notifications => NotificationsScreen(
        repository: repository,
        onBack: _backToMain,
      ),
      StackScreen.doctorList => DoctorListScreen(
        specialty: selectedSpecialty ?? specialties.first,
        repository: repository,
        onBack: _backToMain,
        onDoctor: (doctor) =>
            _openStack(StackScreen.doctorDetail, doctor: doctor),
      ),
      StackScreen.doctorDetail => DoctorDetailScreen(
        doctor: selectedDoctor ?? doctors.first,
        repository: repository,
        onBack: () => _openStack(StackScreen.doctorList),
        onBook: (doctor) => _openStack(StackScreen.booking, doctor: doctor),
      ),
      StackScreen.booking => BookingScreen(
        doctor: selectedDoctor ?? doctors.first,
        repository: repository,
        patientId: user?.id,
        onBack: () => _openStack(StackScreen.doctorDetail),
        onConfirmed: (booking) =>
            _openStack(StackScreen.confirmed, booking: booking),
      ),
      StackScreen.confirmed => ConfirmedScreen(
        booking:
            confirmedBooking ??
            BookingDraft(
              doctor: selectedDoctor ?? doctors.first,
              day: 'Today',
              time: '10:30 AM',
              payment: 'Cash',
            ),
        onDone: (nextTab) => _goMain(nextTab: nextTab),
      ),
      StackScreen.help => HelpScreen(
        repository: repository,
        onBack: _backToMain,
      ),
      StackScreen.privacy => PrivacyScreen(
        onBack: _backToMain,
        onDeleteAccount: _clearSession,
      ),
    };
  }
}
