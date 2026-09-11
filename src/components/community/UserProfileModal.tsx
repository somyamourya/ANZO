import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { UserProfile } from '../../types/community';
import { USER_ROLE_CONFIG } from '../../api/community/communityEngine';
import { useCommunity } from '../../context/CommunityContext';

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: UserProfile | null;
  isCurrentUser?: boolean;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  visible,
  onClose,
  user,
  isCurrentUser,
}) => {
  const { updateUserProfile } = useCommunity();
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(user?.displayName || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editStatus, setEditStatus] = useState(user?.customStatus || '');

  if (!user) return null;

  const roleConfig = USER_ROLE_CONFIG[user.role] || USER_ROLE_CONFIG.MEMBER;

  const handleSaveProfile = () => {
    updateUserProfile({
      displayName: editDisplayName,
      bio: editBio,
      customStatus: editStatus,
    });
    setIsEditing(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Close Button Header */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconCircle} onPress={onClose}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {isCurrentUser && (
              <TouchableOpacity
                style={[styles.editBtn, isEditing && styles.saveBtn]}
                onPress={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
              >
                <Ionicons
                  name={isEditing ? 'checkmark' : 'create-outline'}
                  size={16}
                  color={isEditing ? '#000000' : '#FFFFFF'}
                />
                <Text style={[styles.editBtnText, isEditing && { color: '#000000' }]}>
                  {isEditing ? 'Save' : 'Edit Profile'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Banner Image */}
            <View style={styles.bannerContainer}>
              <Image source={{ uri: user.bannerUrl }} style={styles.bannerImage} />
              <View style={styles.bannerGradient} />
            </View>

            {/* Avatar & Role Header */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                {user.isOnline && <View style={styles.onlineBadge} />}
              </View>

              <View style={styles.roleBadgeContainer}>
                <View
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor: roleConfig.bg,
                      borderColor: roleConfig.border,
                    },
                  ]}
                >
                  <Text style={styles.roleIcon}>{roleConfig.icon}</Text>
                  <Text style={[styles.roleLabel, { color: roleConfig.color }]}>
                    {roleConfig.label}
                  </Text>
                </View>

                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>LVL {user.level || 1}</Text>
                </View>
              </View>
            </View>

            {/* User Names & Status */}
            <View style={styles.userInfoSection}>
              {isEditing ? (
                <View style={styles.editSection}>
                  <Text style={styles.fieldLabel}>Display Name</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editDisplayName}
                    onChangeText={setEditDisplayName}
                    placeholder="Enter display name..."
                    placeholderTextColor={theme.colors.textMuted}
                  />

                  <Text style={styles.fieldLabel}>Custom Status</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editStatus}
                    onChangeText={setEditStatus}
                    placeholder="What are you doing? (e.g. Arise...)"
                    placeholderTextColor={theme.colors.textMuted}
                  />

                  <Text style={styles.fieldLabel}>Bio</Text>
                  <TextInput
                    style={[styles.editInput, styles.bioInput]}
                    value={editBio}
                    onChangeText={setEditBio}
                    multiline
                    placeholder="Tell us about yourself..."
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>
              ) : (
                <>
                  <Text style={styles.displayName}>{user.displayName}</Text>
                  <Text style={styles.username}>@{user.username}</Text>

                  {user.customStatus && (
                    <View style={styles.statusBubble}>
                      <Ionicons name="chatbubble-ellipses-outline" size={14} color={theme.colors.accent} />
                      <Text style={styles.statusText}>{user.customStatus}</Text>
                    </View>
                  )}

                  <Text style={styles.bioText}>{user.bio}</Text>
                </>
              )}
            </View>

            {/* Badges Section */}
            {user.badges && user.badges.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Badges & Accolades</Text>
                <View style={styles.badgesGrid}>
                  {user.badges.map((badge) => (
                    <View key={badge.id} style={[styles.badgeCard, { borderColor: badge.color + '40' }]}>
                      <Text style={styles.badgeIcon}>{badge.icon}</Text>
                      <View style={styles.badgeInfo}>
                        <Text style={[styles.badgeLabel, { color: badge.color }]}>{badge.label}</Text>
                        <Text style={styles.badgeDesc} numberOfLines={2}>
                          {badge.description}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Favorite Anime Grid */}
            {user.favoriteAnime && user.favoriteAnime.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Favorite Anime Showcase</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.favAnimeScroll}>
                  {user.favoriteAnime.map((anime) => (
                    <View key={anime.id} style={styles.favAnimeCard}>
                      <Image source={{ uri: anime.coverUrl }} style={styles.favAnimeCover} />
                      <Text style={styles.favAnimeTitle} numberOfLines={1}>
                        {anime.title}
                      </Text>
                      {anime.rating && (
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={12} color="#FFD700" />
                          <Text style={styles.ratingText}>{anime.rating}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Activity Stream */}
            {user.activities && user.activities.length > 0 && (
              <View style={[styles.section, { marginBottom: 40 }]}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                {user.activities.map((act) => (
                  <View key={act.id} style={styles.activityItem}>
                    <View style={styles.activityIconCircle}>
                      <Ionicons
                        name={act.type.includes('WATCH') ? 'play' : 'book'}
                        size={14}
                        color={theme.colors.accent}
                      />
                    </View>
                    <View style={styles.activityDetails}>
                      <Text style={styles.activityTitle}>{act.title}</Text>
                      <Text style={styles.activitySubtitle}>{act.subtitle}</Text>
                    </View>
                    <Text style={styles.activityTime}>{act.timestamp}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '88%',
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  topBar: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  saveBtn: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  editBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  bannerContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#1a1a24',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: -40,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00FF66',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  roleBadgeContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  roleIcon: {
    fontSize: 12,
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  levelText: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: 'bold',
  },
  userInfoSection: {
    paddingHorizontal: 18,
    marginTop: 12,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  username: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.accent,
    fontWeight: '500',
  },
  bioText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginTop: 10,
  },
  editSection: {
    marginTop: 8,
  },
  fieldLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 10,
    marginBottom: 4,
    fontWeight: '600',
  },
  editInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bioInput: {
    height: 70,
    textAlignVertical: 'top',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  badgesGrid: {
    gap: 8,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
  },
  badgeIcon: {
    fontSize: 22,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeLabel: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  badgeDesc: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  favAnimeScroll: {
    marginLeft: -4,
  },
  favAnimeCard: {
    width: 100,
    marginRight: 12,
  },
  favAnimeCover: {
    width: 100,
    height: 140,
    borderRadius: 10,
    backgroundColor: '#1E1E28',
  },
  favAnimeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  activityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  activitySubtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
});
