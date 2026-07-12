import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/utils/tabeebi_date_utils.dart';
import '../../data/models/tabeebi_models.dart';
import 'doc_avatar.dart';

class DoctorCard extends StatelessWidget {
  const DoctorCard({super.key, required this.doctor, this.onTap});

  final Doctor doctor;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.ink100),
            boxShadow: AppShadows.card,
          ),
          child: Row(
            children: [
              DocAvatar(
                initials: doctor.initials,
                hue: doctor.hue,
                size: 54,
                rounded: 14,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      doctor.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: AppColors.ink900,
                        fontSize: 15,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      doctor.specialty,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: AppColors.ink500,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(
                          Icons.star_rounded,
                          color: AppColors.amber500,
                          size: 17,
                        ),
                        Text(
                          ' ${doctor.rating}',
                          style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            color: AppColors.ink900,
                            fontSize: 12,
                          ),
                        ),
                        Text(
                          ' (${doctor.reviews})',
                          style: const TextStyle(
                            color: AppColors.ink400,
                            fontSize: 12,
                          ),
                        ),
                        const Spacer(),
                        Text(
                          'IQD ${iqd(doctor.price)}',
                          style: const TextStyle(
                            color: AppColors.teal700,
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              const Icon(Icons.chevron_right_rounded, color: AppColors.ink300),
            ],
          ),
        ),
      ),
    );
  }
}
