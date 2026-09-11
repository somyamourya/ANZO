import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors, borderRadius, shadows } from '../../theme';

export type TabScreen = 'home' | 'manga' | 'novels' | 'community' | 'search' | 'watchlist' | 'downloads' | 'profile';

interface BottomTabsProps {
  activeTab: TabScreen;
  onTabChange: (tab: TabScreen) => void;
}

export const BottomTabs: React.FC<BottomTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: { key: TabScreen; label: string; icon: string }[] = [
    { key: 'home', label: 'Anime', icon: '🎬' },
    { key: 'manga', label: 'Manga', icon: '📖' },
    { key: 'novels', label: 'Novels', icon: '📚' },
    { key: 'community', label: 'Community', icon: '💬' },
    { key: 'watchlist', label: 'Library', icon: '📑' },
    { key: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <View style={[styles.container, shadows.lg]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.7}
            onPress={() => onTabChange(tab.key)}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
          >
            <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(18, 21, 31, 0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'android' ? 14 : 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: borderRadius.lg,
  },
  tabItemActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 3,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
