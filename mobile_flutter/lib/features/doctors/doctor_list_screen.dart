import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../data/models/tabeebi_models.dart';
import '../../data/repositories/tabeebi_repository.dart';
import '../../shared/widgets/doctor_card.dart';
import '../../shared/widgets/top_bar.dart';

class DoctorListScreen extends StatefulWidget {
  const DoctorListScreen({
    super.key,
    required this.specialty,
    required this.repository,
    required this.onBack,
    required this.onDoctor,
  });

  final Specialty specialty;
  final TabeebiRepository repository;
  final VoidCallback onBack;
  final ValueChanged<Doctor> onDoctor;

  @override
  State<DoctorListScreen> createState() => _DoctorListScreenState();
}

class _DoctorListScreenState extends State<DoctorListScreen> {
  String filter = 'all';
  String sortOrder = 'none';
  late Future<List<Doctor>> doctorsFuture;

  @override
  void initState() {
    super.initState();
    doctorsFuture = widget.repository.getDoctors(widget.specialty);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: Column(
        children: [
          TopBar(
            title: widget.specialty.name,
            onBack: widget.onBack,
            trailing: _SortButton(onTap: _chooseSort),
          ),
          SizedBox(
            height: 54,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
              children: [
                _FilterPill(
                  label: 'All doctors',
                  active: filter == 'all',
                  onTap: () => setState(() => filter = 'all'),
                ),
                _FilterPill(
                  label: 'Available today',
                  active: filter == 'today',
                  onTap: () => setState(() => filter = 'today'),
                ),
                _FilterPill(
                  label: 'Top rated',
                  active: filter == 'top',
                  onTap: () => setState(() => filter = 'top'),
                ),
                _FilterPill(
                  label: 'Nearby',
                  active: filter == 'near',
                  onTap: () => setState(() => filter = 'near'),
                ),
              ],
            ),
          ),
          Expanded(
            child: FutureBuilder<List<Doctor>>(
              future: doctorsFuture,
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(
                    child: CircularProgressIndicator(color: AppColors.teal700),
                  );
                }
                final list = _filtered(snapshot.data!);
                return ListView(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 120),
                  children: [
                    Text(
                      '${list.length} doctors available in Kerkuk',
                      style: const TextStyle(
                        color: AppColors.ink500,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 14),
                    if (list.isEmpty)
                      const Padding(
                        padding: EdgeInsets.all(40),
                        child: Center(
                          child: Text(
                            'No registered doctors yet.',
                            style: TextStyle(color: AppColors.ink500),
                          ),
                        ),
                      ),
                    for (final doctor in list)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: DoctorCard(
                          doctor: doctor,
                          onTap: () => widget.onDoctor(doctor),
                        ),
                      ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  List<Doctor> _filtered(List<Doctor> doctors) {
    var list = [...doctors];
    if (filter == 'today') {
      list = list.where((doctor) => doctor.today).toList();
    } else if (filter == 'top') {
      list.sort((a, b) => b.rating.compareTo(a.rating));
    } else if (filter == 'near') {
      list.sort(
        (a, b) =>
            int.tryParse(
              b.exp.split(' ').first,
            )?.compareTo(int.tryParse(a.exp.split(' ').first) ?? 0) ??
            0,
      );
    }
    if (sortOrder == 'asc') list.sort((a, b) => a.name.compareTo(b.name));
    if (sortOrder == 'desc') list.sort((a, b) => b.name.compareTo(a.name));
    return list;
  }

  Future<void> _chooseSort() async {
    final selected = await showModalBottomSheet<String>(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('Default'),
              onTap: () => Navigator.pop(context, 'none'),
            ),
            ListTile(
              title: const Text('A - Z'),
              onTap: () => Navigator.pop(context, 'asc'),
            ),
            ListTile(
              title: const Text('Z - A'),
              onTap: () => Navigator.pop(context, 'desc'),
            ),
          ],
        ),
      ),
    );
    if (selected != null) setState(() => sortOrder = selected);
  }
}

class _SortButton extends StatelessWidget {
  const _SortButton({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Material(
        color: AppColors.surface,
        shape: const CircleBorder(),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onTap,
          child: Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.ink100),
              boxShadow: [
                BoxShadow(
                  color: AppColors.ink900.withValues(alpha: 0.04),
                  blurRadius: 2,
                  offset: const Offset(0, 1),
                ),
              ],
            ),
            child: const Icon(
              Icons.filter_list_rounded,
              color: AppColors.ink700,
              size: 20,
            ),
          ),
        ),
      ),
    );
  }
}

class _FilterPill extends StatelessWidget {
  const _FilterPill({
    required this.label,
    required this.active,
    required this.onTap,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppColors.teal700 : AppColors.surface,
          borderRadius: BorderRadius.circular(100),
          border: active ? null : Border.all(color: AppColors.ink200),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          maxLines: 1,
          style: TextStyle(
            color: active ? Colors.white : AppColors.ink700,
            fontSize: 13,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}
