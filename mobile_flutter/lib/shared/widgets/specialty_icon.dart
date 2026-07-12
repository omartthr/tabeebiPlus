import 'package:flutter/material.dart';

IconData specialtyIcon(String kind) {
  return switch (kind) {
    'tooth' => Icons.medical_services_outlined,
    'flask' => Icons.science_outlined,
    'user-round' => Icons.person_outline_rounded,
    'layers' => Icons.layers_outlined,
    'wind' => Icons.air_rounded,
    'eye' => Icons.visibility_outlined,
    'heart' => Icons.favorite_border_rounded,
    'brain' => Icons.psychology_outlined,
    'bone' => Icons.accessibility_new_rounded,
    'baby' => Icons.child_care_rounded,
    _ => Icons.local_hospital_outlined,
  };
}
