import 'package:flutter/material.dart';

class AppLogo extends StatelessWidget {
  const AppLogo({
    super.key,
    this.variant = AppLogoVariant.light,
    this.width = 160,
    this.height = 44,
  });

  final AppLogoVariant variant;
  final double width;
  final double height;

  @override
  Widget build(BuildContext context) {
    final asset = switch (variant) {
      AppLogoVariant.dark => 'assets/images/logo_dark.png',
      AppLogoVariant.light => 'assets/images/logo_light.png',
      AppLogoVariant.iconDark => 'assets/images/logo_icon_dark.png',
      AppLogoVariant.iconLight => 'assets/images/logo_icon_light.png',
    };

    return Image.asset(
      asset,
      width: width,
      height: height,
      fit: BoxFit.contain,
      errorBuilder: (_, _, _) => Text(
        'Tabeebi',
        style: TextStyle(
          color: variant == AppLogoVariant.dark
              ? Colors.white
              : const Color(0xFF1A7A73),
          fontSize: 24,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

enum AppLogoVariant { light, dark, iconLight, iconDark }
