import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../../domain/models/skill_model.dart';
import 'theme.dart';

class PulsingBadge extends StatefulWidget {
  final Widget child;

  const PulsingBadge({super.key, required this.child});

  @override
  State<PulsingBadge> createState() => _PulsingBadgeState();
}

class _PulsingBadgeState extends State<PulsingBadge> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.05).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scaleAnimation,
      child: widget.child,
    );
  }
}

class KarmaBadge extends StatelessWidget {
  final int karmaBalance;
  final VoidCallback? onTap;

  const KarmaBadge({
    super.key,
    required this.karmaBalance,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return PulsingBadge(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
            ),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFF59E0B).withValues(alpha: 0.4),
                blurRadius: 10,
                offset: const Offset(0, 4),
              )
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.bolt, color: Colors.white, size: 18),
              const SizedBox(width: 4),
              Text(
                '$karmaBalance Karma',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                  letterSpacing: 0.2,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class MatchScoreBadge extends StatelessWidget {
  final int percentage;
  final bool isMutual;

  const MatchScoreBadge({
    super.key,
    required this.percentage,
    required this.isMutual,
  });

  @override
  Widget build(BuildContext context) {
    final bgColor = isMutual ? const Color(0xFF10B981) : AppTheme.primaryColor;

    return PulsingBadge(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 6),
        decoration: BoxDecoration(
          color: bgColor.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: bgColor.withValues(alpha: 0.5), width: 1.2),
          boxShadow: [
            BoxShadow(
              color: bgColor.withValues(alpha: 0.2),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isMutual ? Icons.swap_horizontal_circle : Icons.star_rounded,
              color: bgColor,
              size: 16,
            ),
            const SizedBox(width: 4),
            Text(
              isMutual ? '🔥 $percentage% Mutual' : '✨ $percentage% Match',
              style: TextStyle(
                color: bgColor,
                fontWeight: FontWeight.w800,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SkillTagChip extends StatelessWidget {
  final Skill skill;
  final VoidCallback? onDelete;

  const SkillTagChip({
    super.key,
    required this.skill,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final isOffering = skill.isOffering;
    final color = isOffering ? const Color(0xFF10B981) : AppTheme.primaryColor;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _getCategoryIcon(skill.category),
            size: 14,
            color: color,
          ),
          const SizedBox(width: 6),
          Flexible(
            child: Text(
              skill.title,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.w600,
                fontSize: 12,
              ),
            ),
          ),
          const SizedBox(width: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.25),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              skill.level.displayName[0],
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.bold,
                fontSize: 10,
              ),
            ),
          ),
          if (onDelete != null) ...[
            const SizedBox(width: 4),
            GestureDetector(
              onTap: onDelete,
              child: Icon(Icons.close, size: 14, color: color),
            ),
          ]
        ],
      ),
    );
  }

  IconData _getCategoryIcon(SkillCategory cat) {
    switch (cat) {
      case SkillCategory.tech:
        return Icons.code;
      case SkillCategory.music:
        return Icons.music_note;
      case SkillCategory.arts:
        return Icons.palette;
      case SkillCategory.cooking:
        return Icons.restaurant;
      case SkillCategory.languages:
        return Icons.translate;
      case SkillCategory.fitness:
        return Icons.fitness_center;
      case SkillCategory.academics:
        return Icons.school;
    }
  }
}

class UserAvatar extends StatelessWidget {
  final String name;
  final String avatarUrl;
  final double radius;

  const UserAvatar({
    super.key,
    required this.name,
    required this.avatarUrl,
    this.radius = 24,
  });

  @override
  Widget build(BuildContext context) {
    final imageProvider = _getImageProvider(avatarUrl);

    return CircleAvatar(
      radius: radius,
      backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.2),
      backgroundImage: imageProvider,
      child: imageProvider == null
          ? Text(
              name.isNotEmpty ? name[0].toUpperCase() : 'U',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryColor,
                fontSize: radius * 0.8,
              ),
            )
          : null,
    );
  }

  ImageProvider? _getImageProvider(String url) {
    final clean = url.trim();
    if (clean.isEmpty) return null;

    if (clean.startsWith('data:image')) {
      try {
        final base64Str = clean.split(',').last;
        final bytes = base64Decode(base64Str);
        return MemoryImage(bytes);
      } catch (_) {
        return null;
      }
    }

    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      return NetworkImage(clean);
    }

    if (!kIsWeb) {
      try {
        final file = File(clean);
        if (file.existsSync()) {
          return FileImage(file);
        }
      } catch (_) {
        return null;
      }
    }

    return null;
  }
}

class SectionHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget? trailing;

  const SectionHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final colorScheme = Theme.of(context).colorScheme;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: textTheme.titleLarge?.copyWith(fontSize: 18, fontWeight: FontWeight.w800),
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    subtitle!,
                    style: TextStyle(
                      color: colorScheme.onSurfaceVariant,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ],
            ),
          ),
          if (trailing case final Widget t) t,
        ],
      ),
    );
  }
}

class ProfessionalEmptyState extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;

  const ProfessionalEmptyState({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Center(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                shape: BoxShape.circle,
                border: Border.all(color: colorScheme.outline.withValues(alpha: 0.3), width: 1.5),
              ),
              child: Icon(icon, size: 48, color: AppTheme.primaryColor),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18, letterSpacing: -0.3),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: TextStyle(color: colorScheme.onSurfaceVariant, fontSize: 14, height: 1.45, fontWeight: FontWeight.w500),
            ),
          ],
        ),
      ),
    );
  }
}
