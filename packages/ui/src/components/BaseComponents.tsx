import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useThemeColors, useThemeTypography, useThemeSpacing } from '../theme/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  titleStyle,
}: ButtonProps) {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const spacing = useThemeSpacing();

  const variantStyles: Record<string, ViewStyle> = {
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.secondary },
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
    ghost: { backgroundColor: 'transparent' },
    destructive: { backgroundColor: colors.error },
  };

  const sizeStyles: Record<string, ViewStyle> = {
    sm: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: spacing.xs },
    md: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: spacing.sm },
    lg: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: spacing.md },
  };

  const titleColors: Record<string, string> = {
    primary: colors.white,
    secondary: colors.white,
    outline: colors.primary,
    ghost: colors.primary,
    destructive: colors.white,
  };

  const titleSizeStyles: Record<string, TextStyle> = {
    sm: typography.caption,
    md: typography.button,
    lg: { ...typography.button, fontSize: 18 },
  };

  const baseStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...sizeStyles[size],
    ...variantStyles[variant],
    opacity: disabled || loading ? 0.6 : 1,
  };

  const titleColor = titleColors[variant] || colors.white;

  return (
    <TouchableOpacity
      style={[{ width: fullWidth ? '100%' : undefined }, baseStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={titleColor} size="small" />
      ) : (
        <Text style={[titleSizeStyles[size], { color: titleColor }, titleStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric' | 'decimal-pad';
  autoComplete?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  dir?: 'ltr' | 'rtl';
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoComplete,
  error,
  disabled = false,
  required = false,
  style,
  inputStyle,
  labelStyle,
  dir = 'ltr',
}: InputProps) {
  const colors = useThemeColors();
  const typography = useThemeTypography();
  const spacing = useThemeSpacing();

  const hasError = !!error;
  const borderColor = hasError ? colors.error : colors.border;
  const focusedBorderColor = hasError ? colors.error : colors.primary;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[
          styles.label,
          { color: hasError ? colors.error : colors.textSecondary },
          labelStyle,
        ]}>
          {label} {required && <Text style={{ color: colors.error }}>*</Text>}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            borderColor,
            color: colors.text,
            backgroundColor: disabled ? colors.surfaceVariant : colors.background,
          },
          inputStyle,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoComplete={autoComplete}
        disabled={disabled}
        dir={dir}
        onFocus={() => {}}
        onBlur={() => {}}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 6,
  },
  label: {
    ...{} as any, // Will be overridden by typography
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
  },
});

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevation?: number;
}

export function Card({ children, style, onPress, elevation = 1 }: CardProps) {
  const colors = useThemeColors();
  const shadows = useTheme()?.theme?.shadows || {};

  const containerStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    ...shadows[elevation === 1 ? 'sm' : elevation === 2 ? 'md' : 'lg'],
    ...style,
  };

  if (onPress) {
    return (
      <TouchableOpacity style={containerStyle} onPress={onPress} activeOpacity={0.9}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({ children, variant = 'default', size = 'md', style }: BadgeProps) {
  const colors = useThemeColors();
  const spacing = useThemeSpacing();

  const variantColors: Record<string, { bg: string; text: string }> = {
    default: { bg: colors.surfaceVariant, text: colors.text },
    success: { bg: colors.success + '20', text: colors.success },
    warning: { bg: colors.warning + '20', text: colors.warning },
    error: { bg: colors.error + '20', text: colors.error },
    info: { bg: colors.primary + '20', text: colors.primary },
  };

  const variantStyle = variantColors[variant] || variantColors.default;
  const sizePadding = size === 'sm' ? spacing.xs : spacing.sm;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: variantStyle.bg, paddingHorizontal: sizePadding, paddingVertical: 2 },
        style,
      ]}
    >
      <Text style={[styles.badgeText, { color: variantStyle.text, fontSize: size === 'sm' ? 10 : 12 }]}>
        {children}
      </Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '600',
  },
});

export function LoadingScreen() {
  const colors = useThemeColors();
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});