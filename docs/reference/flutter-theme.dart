import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Cohesive High-End Modern Color Palette
  static const Color primaryColor = Color(0xFF4F46E5); // Electric Indigo 600
  static const Color primaryDark = Color(0xFF6366F1);  // Electric Indigo 500
  static const Color primaryHover = Color(0xFF4338CA); // Indigo 700
  static const Color accentBlue = Color(0xFF0284C7);   // Vivid Ocean Sky
  static const Color accentCyan = Color(0xFF06B6D4);   // Electric Cyan
  static const Color successGreen = Color(0xFF059669); // Emerald 600
  static const Color karmaEmerald = Color(0xFF10B981); // Emerald 500
  static const Color warningOrange = Color(0xFFD97706);// Amber 600
  static const Color errorRed = Color(0xFFE11D48);     // Rose 600
  static const Color purpleAccent = Color(0xFF7C3AED); // Deep Violet 600

  // ☀️ Light Mode Theme (High-Contrast, Crisp & Ultra-Readable)
  static ThemeData get lightTheme {
    const bgLight = Color(0xFFF8FAFC);       // Pure Slate Canvas
    const cardLight = Color(0xFFFFFFFF);     // Crisp White Card
    const surfaceLight = Color(0xFFF1F5F9);  // Subtle Slate Surface
    const textPrimary = Color(0xFF090D16);   // Deep High-Contrast Slate Black
    const textSecondary = Color(0xFF334155); // Rich Slate 700 (Clear, Readable)
    const textMuted = Color(0xFF475569);     // Slate 600 (High-Contrast Secondary)
    const borderLight = Color(0xFFE2E8F0);   // Crisp Divider Border

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        primary: primaryColor,
        secondary: accentBlue,
        tertiary: karmaEmerald,
        surface: cardLight,
        onSurface: textPrimary,
        onSurfaceVariant: textSecondary,
        outline: borderLight,
        brightness: Brightness.light,
      ),
      scaffoldBackgroundColor: bgLight,
      appBarTheme: const AppBarTheme(
        backgroundColor: cardLight,
        elevation: 0,
        scrolledUnderElevation: 1,
        shadowColor: Color(0x0F000000),
        iconTheme: IconThemeData(color: textPrimary),
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.3,
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: cardLight,
        indicatorColor: primaryColor.withValues(alpha: 0.14),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const TextStyle(color: primaryColor, fontWeight: FontWeight.w800, fontSize: 12);
          }
          return const TextStyle(color: textSecondary, fontWeight: FontWeight.w600, fontSize: 12);
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: primaryColor, size: 24);
          }
          return const IconThemeData(color: textSecondary, size: 24);
        }),
      ),
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.w900, color: textPrimary, letterSpacing: -1.1),
        titleLarge: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w800, color: textPrimary, letterSpacing: -0.5),
        titleMedium: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700, color: textPrimary, letterSpacing: -0.2),
        titleSmall: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: textPrimary),
        bodyLarge: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w500, color: textPrimary, height: 1.5),
        bodyMedium: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, color: textSecondary, height: 1.45),
        bodySmall: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500, color: textMuted, height: 1.4),
        labelLarge: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: textPrimary),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: cardLight,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: borderLight, width: 1.2),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 14, letterSpacing: -0.1),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: textPrimary,
          side: const BorderSide(color: borderLight, width: 1.4),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primaryColor,
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 14),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: cardLight,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: borderLight, width: 1.2),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: borderLight, width: 1.2),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: primaryColor, width: 2.0),
        ),
        labelStyle: const TextStyle(color: textSecondary, fontSize: 14, fontWeight: FontWeight.w600),
        hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 14, fontWeight: FontWeight.w400),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: surfaceLight,
        selectedColor: primaryColor,
        labelStyle: const TextStyle(color: textPrimary, fontSize: 12, fontWeight: FontWeight.w700),
        secondaryLabelStyle: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide.none),
      ),
    );
  }

  // 🌙 Slate Dark Mode Theme (Modern Dark Glass & Deep Electric Indigo)
  static ThemeData get darkTheme {
    const bgDark = Color(0xFF080D18);         // Deep Midnight Obsidian
    const cardDark = Color(0xFF111928);       // Rich Dark Indigo Slate
    const surfaceDark = Color(0xFF1E293B);    // Slate 800 Surface
    const textPrimary = Color(0xFFFFFFFF);    // Pure Bright White
    const textSecondary = Color(0xFFE2E8F0);  // Crisp Slate 200 (Highly Visible)
    const textMuted = Color(0xFF94A3B8);      // Slate 400 (Clear Subtitle)
    const borderDark = Color(0xFF1F293D);     // Dark Card Border

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryDark,
        primary: primaryDark,
        secondary: accentBlue,
        tertiary: karmaEmerald,
        surface: cardDark,
        onSurface: textPrimary,
        onSurfaceVariant: textSecondary,
        outline: borderDark,
        brightness: Brightness.dark,
      ),
      scaffoldBackgroundColor: bgDark,
      appBarTheme: const AppBarTheme(
        backgroundColor: cardDark,
        elevation: 0,
        scrolledUnderElevation: 1,
        shadowColor: Color(0x40000000),
        iconTheme: IconThemeData(color: textPrimary),
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.3,
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: cardDark,
        indicatorColor: primaryDark.withValues(alpha: 0.25),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const TextStyle(color: primaryDark, fontWeight: FontWeight.w800, fontSize: 12);
          }
          return const TextStyle(color: textSecondary, fontWeight: FontWeight.w600, fontSize: 12);
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: primaryDark, size: 24);
          }
          return const IconThemeData(color: textSecondary, size: 24);
        }),
      ),
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
        displayLarge: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.w900, color: textPrimary, letterSpacing: -1.1),
        titleLarge: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w800, color: textPrimary, letterSpacing: -0.5),
        titleMedium: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700, color: textPrimary, letterSpacing: -0.2),
        titleSmall: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: textPrimary),
        bodyLarge: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w500, color: textPrimary, height: 1.5),
        bodyMedium: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, color: textSecondary, height: 1.45),
        bodySmall: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500, color: textMuted, height: 1.4),
        labelLarge: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: textPrimary),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: cardDark,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: borderDark, width: 1.2),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: primaryDark,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 14, letterSpacing: -0.1),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: textPrimary,
          side: const BorderSide(color: borderDark, width: 1.4),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primaryDark,
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 14),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: cardDark,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: borderDark, width: 1.2),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: borderDark, width: 1.2),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: primaryDark, width: 2.0),
        ),
        labelStyle: const TextStyle(color: textSecondary, fontSize: 14, fontWeight: FontWeight.w600),
        hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14, fontWeight: FontWeight.w400),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: surfaceDark,
        selectedColor: primaryDark,
        labelStyle: const TextStyle(color: textPrimary, fontSize: 12, fontWeight: FontWeight.w700),
        secondaryLabelStyle: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide.none),
      ),
    );
  }

  // 🌌 OLED Night Mode Theme (True Obsidian / Cyberpunk Midnight)
  static ThemeData get nightTheme {
    const bgNight = Color(0xFF000000);         // Pure OLED Black
    const cardNight = Color(0xFF0D1117);       // Deep Obsidian Carbon
    const surfaceNight = Color(0xFF161B22);    // Carbon Slate Surface
    const textPrimary = Color(0xFFFFFFFF);     // Pure Brilliant White
    const textSecondary = Color(0xFFE6EDF3);   // Crisp High-Contrast White-Slate
    const textMuted = Color(0xFFA1A1AA);       // Clear Neutral Zinc
    const borderNight = Color(0xFF21262D);     // Crisp Dark Border

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryDark,
        primary: primaryDark,
        secondary: accentBlue,
        tertiary: karmaEmerald,
        surface: cardNight,
        onSurface: textPrimary,
        onSurfaceVariant: textSecondary,
        outline: borderNight,
        brightness: Brightness.dark,
      ),
      scaffoldBackgroundColor: bgNight,
      appBarTheme: const AppBarTheme(
        backgroundColor: bgNight,
        elevation: 0,
        scrolledUnderElevation: 1,
        shadowColor: Color(0x66000000),
        iconTheme: IconThemeData(color: textPrimary),
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.3,
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: cardNight,
        indicatorColor: primaryDark.withValues(alpha: 0.28),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const TextStyle(color: primaryDark, fontWeight: FontWeight.w800, fontSize: 12);
          }
          return const TextStyle(color: textSecondary, fontWeight: FontWeight.w600, fontSize: 12);
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: primaryDark, size: 24);
          }
          return const IconThemeData(color: textSecondary, size: 24);
        }),
      ),
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
        displayLarge: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.w900, color: textPrimary, letterSpacing: -1.1),
        titleLarge: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w800, color: textPrimary, letterSpacing: -0.5),
        titleMedium: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700, color: textPrimary, letterSpacing: -0.2),
        titleSmall: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: textPrimary),
        bodyLarge: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w500, color: textPrimary, height: 1.5),
        bodyMedium: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, color: textSecondary, height: 1.45),
        bodySmall: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500, color: textMuted, height: 1.4),
        labelLarge: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: textPrimary),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: cardNight,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: borderNight, width: 1.2),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: primaryDark,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 14, letterSpacing: -0.1),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: textPrimary,
          side: const BorderSide(color: borderNight, width: 1.4),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primaryDark,
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 14),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: cardNight,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: borderNight, width: 1.2),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: borderNight, width: 1.2),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: primaryDark, width: 2.0),
        ),
        labelStyle: const TextStyle(color: textSecondary, fontSize: 14, fontWeight: FontWeight.w600),
        hintStyle: const TextStyle(color: Color(0xFF8B949E), fontSize: 14, fontWeight: FontWeight.w400),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: surfaceNight,
        selectedColor: primaryDark,
        labelStyle: const TextStyle(color: textPrimary, fontSize: 12, fontWeight: FontWeight.w700),
        secondaryLabelStyle: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide.none),
      ),
    );
  }
}
