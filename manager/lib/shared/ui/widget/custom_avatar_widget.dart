// ignore_for_file: use_super_parameters, deprecated_member_use

import 'package:flutter/material.dart';

class CustomAvatarWidget extends StatelessWidget {
  final String? avatarUrl;
  final String? fullname;
  final double radius;

  const CustomAvatarWidget({
    Key? key,
    this.avatarUrl,
    this.fullname,
    this.radius = 26,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final String fallbackText =
        (fullname != null && fullname!.trim().isNotEmpty)
        ? fullname!.trim()[0].toUpperCase()
        : 'U';

    final bool hasValidUrl = avatarUrl != null && avatarUrl!.startsWith('http');

    return Container(
      width: radius * 2,
      height: radius * 2,
      decoration: BoxDecoration(
        color: const Color(0xFFF5A623).withOpacity(0.15),
        shape: BoxShape.circle,
      ),
      clipBehavior: Clip.antiAlias,
      alignment: Alignment.center,
      child: hasValidUrl
          ? Image.network(
              avatarUrl!,
              width: radius * 2,
              height: radius * 2,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return _buildFallbackText(fallbackText);
              },
            )
          : _buildFallbackText(fallbackText),
    );
  }

  Widget _buildFallbackText(String text) {
    return Text(
      text,
      style: TextStyle(
        fontSize: radius * 0.9,
        fontWeight: FontWeight.bold,
        color: const Color(0xFFF5A623),
      ),
    );
  }
}
