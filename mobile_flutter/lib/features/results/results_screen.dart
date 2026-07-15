import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/theme/app_colors.dart';
import '../../data/repositories/tabeebi_repository.dart';

class ResultsScreen extends StatefulWidget {
  const ResultsScreen({super.key, required this.repository});

  final TabeebiRepository repository;

  @override
  State<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends State<ResultsScreen> {
  String? openId;
  late Future<List<PatientResultItem>> future;

  @override
  void initState() {
    super.initState();
    future = widget.repository.getResults();
  }

  String _formatDate(String d) {
    if (d.isEmpty) return '-';
    try {
      final date = DateTime.parse(d);
      final months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      return '${date.day} ${months[date.month - 1]} ${date.year}';
    } catch (_) {
      return d;
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        statusBarBrightness: Brightness.light,
        systemNavigationBarColor: Colors.white,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
      child: SafeArea(
        child: FutureBuilder<List<PatientResultItem>>(
          future: future,
          builder: (context, snapshot) {
            final results = snapshot.data ?? const <PatientResultItem>[];
            return RefreshIndicator(
              color: AppColors.teal800,
              onRefresh: () async =>
                  setState(() => future = widget.repository.getResults()),
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 118),
                children: [
                  const Text(
                    'My results',
                    style: TextStyle(
                      color: AppColors.ink900,
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${results.length} reports available',
                    style: const TextStyle(
                      color: AppColors.ink500,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 18),
                  if (!snapshot.hasData)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(40),
                        child: CircularProgressIndicator(
                          color: AppColors.teal800,
                        ),
                      ),
                    ),
                  if (snapshot.hasData && results.isEmpty)
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.all(40),
                        child: Column(
                          children: [
                            Container(
                              width: 72,
                              height: 72,
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.88),
                                borderRadius: BorderRadius.circular(22),
                                border: Border.all(
                                  color: AppColors.teal800.withValues(alpha: 0.10),
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.ink900.withValues(alpha: 0.035),
                                    blurRadius: 16,
                                    offset: const Offset(0, 7),
                                  ),
                                ],
                              ),
                              child: const Icon(
                                Icons.description_outlined,
                                color: AppColors.teal800,
                                size: 32,
                              ),
                            ),
                            const SizedBox(height: 14),
                            const Text(
                              'No reports yet',
                              style: TextStyle(
                                color: AppColors.ink900,
                                fontWeight: FontWeight.w800,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Your medical reports will appear here after appointments.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: AppColors.ink400, fontSize: 13),
                            ),
                          ],
                        ),
                      ),
                    ),
                  for (final result in results)
                    _ResultCard(
                      result: result,
                      open: openId == result.id,
                      formatDate: _formatDate,
                      onToggle: () => setState(
                        () => openId = openId == result.id ? null : result.id,
                      ),
                    ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class _ResultCard extends StatelessWidget {
  const _ResultCard({
    required this.result,
    required this.open,
    required this.onToggle,
    required this.formatDate,
  });

  final PatientResultItem result;
  final bool open;
  final VoidCallback onToggle;
  final String Function(String) formatDate;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.88),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.ink100),
        boxShadow: [
          BoxShadow(
            color: AppColors.ink900.withValues(alpha: 0.03),
            blurRadius: 16,
            offset: const Offset(0, 7),
          ),
        ],
      ),
      child: Column(
        children: [
          InkWell(
            onTap: onToggle,
            borderRadius: BorderRadius.circular(22),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.72),
                      borderRadius: BorderRadius.circular(13),
                      border: Border.all(
                        color: AppColors.teal800.withValues(alpha: 0.10),
                      ),
                    ),
                    child: const Icon(
                      Icons.description_outlined,
                      color: AppColors.teal800,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          result.doctorName,
                          style: const TextStyle(
                            color: AppColors.ink900,
                            fontSize: 15,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        Text(
                          result.specialty,
                          style: const TextStyle(
                            color: AppColors.ink500,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  AnimatedRotation(
                    turns: open ? 0.5 : 0,
                    duration: const Duration(milliseconds: 200),
                    child: const Icon(
                      Icons.keyboard_arrow_down_rounded,
                      color: AppColors.teal800,
                    ),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Row(
              children: [
                const Icon(
                  Icons.calendar_today_rounded,
                  size: 14,
                  color: AppColors.teal800,
                ),
                const SizedBox(width: 8),
                Text(
                  formatDate(result.date),
                  style: const TextStyle(
                    color: AppColors.ink500,
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
          if (open)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Column(
                children: [
                  const Divider(color: AppColors.ink100),
                  if (result.aiSummary?.isNotEmpty == true) ...[
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.72),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: AppColors.teal800.withValues(alpha: 0.10),
                        ),
                      ),
                      child: Text(
                        result.aiSummary!,
                        style: const TextStyle(
                          color: AppColors.ink700,
                          height: 1.4,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                  GestureDetector(
                    onTap: result.pdfUrl == null
                        ? null
                        : () async {
                            final uri = Uri.parse(result.pdfUrl!);
                            if (await canLaunchUrl(uri)) {
                              launchUrl(uri, mode: LaunchMode.externalApplication);
                            }
                          },
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: result.pdfUrl != null
                              ? AppColors.teal800
                              : AppColors.ink200,
                          width: 1.5,
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.open_in_new_rounded,
                            size: 16,
                            color: result.pdfUrl != null
                                ? AppColors.teal800
                                : AppColors.ink400,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            result.pdfUrl == null
                                ? 'No report PDF available'
                                : 'View report PDF',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: result.pdfUrl != null
                                  ? AppColors.teal800
                                  : AppColors.ink400,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
