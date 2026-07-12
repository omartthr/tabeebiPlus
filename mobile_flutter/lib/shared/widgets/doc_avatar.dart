import 'package:flutter/material.dart';

class DocAvatar extends StatelessWidget {
  const DocAvatar({
    super.key,
    required this.initials,
    required this.hue,
    this.size = 48,
    this.rounded = 12,
  });

  final String initials;
  final int hue;
  final double size;
  final double rounded;

  @override
  Widget build(BuildContext context) {
    final color = HSVColor.fromAHSV(1, hue.toDouble(), 0.45, 0.78).toColor();

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(rounded),
        border: Border.all(color: color.withValues(alpha: 0.28)),
      ),
      alignment: Alignment.center,
      child: Text(
        initials,
        style: TextStyle(
          color: color,
          fontSize: size * 0.34,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}
