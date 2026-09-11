import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../../theme';

interface GenreBadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'surface';
  size?: 'sm' | 'md';
}

export const GenreBadge: React.FC<GenreBadgeProps> = ({
  label,
  variant = 'surface',
  size = 'md',
}) => {
  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.sizeSm : styles.sizeMd,
        variant === 'primary' && styles.variantPrimary,
        variant === 'secondary' && styles.variantSecondary,
        variant === 'outline' && styles.variantOutline,
        variant === 'surface' && styles.variantSurface,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'sm' ? styles.textSm : styles.textMd,
          variant === 'primary' && styles.textPrimary,
          variant === 'secondary' && styles.textSecondary,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 6,
  },
  sizeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sizeMd: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  variantSurface: {
    backgroundColor: colors.surfaceLight,
  },
  variantPrimary: {
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderColor: colors.primary,
    borderWidth: 1,
  },
  variantSecondary: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: colors.secondary,
    borderWidth: 1,
  },
  variantOutline: {
    backgroundColor: 'transparent',
    borderColor: colors.borderLight,
    borderWidth: 1,
  },
  text: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 11,
  },
  textMd: {
    fontSize: 12,
  },
  textPrimary: {
    color: '#D8B4FE',
  },
  textSecondary: {
    color: '#67E8F9',
  },
});
