import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { CommunityPost, ReactionType } from '../../types/community';
import { USER_ROLE_CONFIG } from '../../api/community/communityEngine';
import { useCommunity } from '../../context/CommunityContext';
import { ModerationModal } from './ModerationModal';

interface PostCardProps {
  post: CommunityPost;
  onPressAnime?: (animeId: string) => void;
  onPressUser?: (userId: string) => void;
}

const EMOJI_LIST: ReactionType[] = ['❤️', '🔥', '👑', '😱', '👏', '💀'];

export const PostCard: React.FC<PostCardProps> = ({ post, onPressAnime, onPressUser }) => {
  const { currentUser, toggleReaction, addReply, deleteReply, editPost } = useCommunity();
  const [showReplies, setShowReplies] = useState(false);
  const [replyInput, setReplyInput] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const [showModeration, setShowModeration] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(post.content);

  const authorRole = USER_ROLE_CONFIG[post.author.role] || USER_ROLE_CONFIG.MEMBER;

  const handleSendReply = () => {
    if (!replyInput.trim()) return;
    addReply(post.id, replyInput.trim());
    setReplyInput('');
    setShowReplies(true);
  };

  const handleSaveEdit = () => {
    if (editedText.trim()) {
      editPost(post.id, editedText.trim());
      setIsEditing(false);
    }
  };

  return (
    <View style={[styles.card, post.isPinned && styles.pinnedCard]}>
      {/* Pinned Ribbon */}
      {post.isPinned && (
        <View style={styles.pinnedHeader}>
          <Ionicons name="pin" size={13} color="#FFD700" />
          <Text style={styles.pinnedText}>PINNED BY MODERATORS</Text>
        </View>
      )}

      {/* Author Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.authorGroup}
          onPress={() => onPressUser?.(post.author.id)}
        >
          <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
          <View>
            <View style={styles.nameBadgesRow}>
              <Text style={styles.displayName}>{post.author.displayName}</Text>
              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: authorRole.bg, borderColor: authorRole.border },
                ]}
              >
                <Text style={styles.roleIcon}>{authorRole.icon}</Text>
                <Text style={[styles.roleText, { color: authorRole.color }]}>
                  {authorRole.label}
                </Text>
              </View>
            </View>
            <View style={styles.timeTagRow}>
              <Text style={styles.username}>@{post.author.username}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.timestamp}>{post.timestamp}</Text>
              {post.editedAt && <Text style={styles.editedText}>(edited)</Text>}
            </View>
          </View>
        </TouchableOpacity>

        {/* Options / Moderation Trigger */}
        <TouchableOpacity
          style={styles.moreBtn}
          onPress={() => setShowModeration(true)}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Post Body (With Spoiler protection) */}
      <View style={styles.contentContainer}>
        {isEditing ? (
          <View style={styles.editWrapper}>
            <TextInput
              style={styles.editTextInput}
              value={editedText}
              onChangeText={setEditedText}
              multiline
            />
            <View style={styles.editActionRow}>
              <TouchableOpacity
                style={styles.cancelEditBtn}
                onPress={() => {
                  setEditedText(post.content);
                  setIsEditing(false);
                }}
              >
                <Text style={styles.cancelEditText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveEditBtn} onPress={handleSaveEdit}>
                <Text style={styles.saveEditText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {post.isSpoiler && !spoilerRevealed ? (
              <TouchableOpacity
                style={styles.spoilerCover}
                onPress={() => setSpoilerRevealed(true)}
              >
                <Ionicons name="eye-off" size={24} color="#FF9500" />
                <Text style={styles.spoilerWarningTitle}>Potential Spoiler</Text>
                <Text style={styles.spoilerWarningSub}>Tap to reveal content</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.postContent}>{post.content}</Text>
            )}
          </>
        )}

        {/* Attached GIF */}
        {post.gifUrl && (!post.isSpoiler || spoilerRevealed) && (
          <View style={styles.mediaWrapper}>
            <Image source={{ uri: post.gifUrl }} style={styles.postGif} />
          </View>
        )}

        {/* Attached Anime Recommendation Card */}
        {post.attachedAnime && (!post.isSpoiler || spoilerRevealed) && (
          <TouchableOpacity
            style={styles.attachedAnimeCard}
            onPress={() => onPressAnime?.(post.attachedAnime!.id)}
          >
            <Image
              source={{ uri: post.attachedAnime.coverUrl }}
              style={styles.attachedAnimeCover}
            />
            <View style={styles.attachedAnimeInfo}>
              <View style={styles.recommendationBadge}>
                <Ionicons name="sparkles" size={11} color={theme.colors.accent} />
                <Text style={styles.recommendationText}>RECOMMENDED ANIME</Text>
              </View>
              <Text style={styles.attachedAnimeTitle} numberOfLines={1}>
                {post.attachedAnime.title}
              </Text>
              {post.attachedAnime.rating && (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={13} color="#FFD700" />
                  <Text style={styles.ratingValue}>{post.attachedAnime.rating} / 10</Text>
                </View>
              )}
            </View>
            <Ionicons name="play-circle" size={26} color={theme.colors.accent} />
          </TouchableOpacity>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {post.tags.map((tag, idx) => (
              <Text key={idx} style={styles.tagText}>
                #{tag}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Reaction Chips Display */}
      <View style={styles.reactionBar}>
        <View style={styles.activeReactionsRow}>
          {Object.entries(post.reactions || {}).map(([emoji, userIds]) => {
            if (!userIds || userIds.length === 0) return null;
            const hasUserReacted = userIds.includes(currentUser.id);
            return (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.reactionChip,
                  hasUserReacted && styles.reactionChipActive,
                ]}
                onPress={() => toggleReaction(post.id, emoji as ReactionType)}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
                <Text
                  style={[
                    styles.reactionCount,
                    hasUserReacted && { color: theme.colors.accent, fontWeight: 'bold' },
                  ]}
                >
                  {userIds.length}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Add Reaction Button */}
          <TouchableOpacity
            style={styles.addReactionBtn}
            onPress={() => setShowReactionPicker(!showReactionPicker)}
          >
            <Ionicons name="happy-outline" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Reply Count Button */}
        <TouchableOpacity
          style={styles.repliesCountBtn}
          onPress={() => setShowReplies(!showReplies)}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={16}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.repliesCountText}>{post.replies?.length || 0} Replies</Text>
        </TouchableOpacity>
      </View>

      {/* Animated Emoji Reaction Picker */}
      {showReactionPicker && (
        <View style={styles.emojiPickerContainer}>
          {EMOJI_LIST.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.emojiPickItem}
              onPress={() => {
                toggleReaction(post.id, emoji);
                setShowReactionPicker(false);
              }}
            >
              <Text style={styles.emojiLarge}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Nested Replies Section */}
      {showReplies && (
        <View style={styles.repliesSection}>
          {post.replies && post.replies.length > 0 && (
            <View style={styles.repliesList}>
              {post.replies.map((reply) => {
                const replyRole =
                  USER_ROLE_CONFIG[reply.author.role] || USER_ROLE_CONFIG.MEMBER;
                const isReplyAuthor = currentUser.id === reply.author.id;
                return (
                  <View key={reply.id} style={styles.replyItem}>
                    <Image source={{ uri: reply.author.avatar }} style={styles.replyAvatar} />
                    <View style={styles.replyBubble}>
                      <View style={styles.replyHeaderRow}>
                        <Text style={styles.replyAuthorName}>{reply.author.displayName}</Text>
                        <View
                          style={[
                            styles.replyRoleBadge,
                            { backgroundColor: replyRole.bg, borderColor: replyRole.border },
                          ]}
                        >
                          <Text style={styles.replyRoleIcon}>{replyRole.icon}</Text>
                        </View>
                        <Text style={styles.replyTimestamp}>{reply.timestamp}</Text>
                        {isReplyAuthor && (
                          <TouchableOpacity
                            onPress={() => deleteReply(post.id, reply.id)}
                            style={{ marginLeft: 'auto' }}
                          >
                            <Ionicons name="trash-outline" size={14} color="#FF3B30" />
                          </TouchableOpacity>
                        )}
                      </View>
                      <Text style={styles.replyContentText}>{reply.content}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Quick Reply Input */}
          <View style={styles.replyInputRow}>
            <Image source={{ uri: currentUser.avatar }} style={styles.myReplyAvatar} />
            <TextInput
              style={styles.replyTextInput}
              placeholder="Write a reply or mention @username..."
              placeholderTextColor={theme.colors.textMuted}
              value={replyInput}
              onChangeText={setReplyInput}
              onSubmitEditing={handleSendReply}
            />
            <TouchableOpacity
              style={[
                styles.replySendBtn,
                !replyInput.trim() && styles.replySendBtnDisabled,
              ]}
              disabled={!replyInput.trim()}
              onPress={handleSendReply}
            >
              <Ionicons name="send" size={14} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Moderation Modal */}
      <ModerationModal
        visible={showModeration}
        onClose={() => setShowModeration(false)}
        post={post}
        onEdit={() => setIsEditing(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 18,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  pinnedCard: {
    borderColor: 'rgba(255, 215, 0, 0.4)',
    backgroundColor: '#16140d',
  },
  pinnedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  pinnedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E1E28',
  },
  nameBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleIcon: {
    fontSize: 9,
  },
  roleText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  timeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  username: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  dot: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginHorizontal: 4,
  },
  timestamp: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  editedText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    marginLeft: 4,
  },
  moreBtn: {
    padding: 6,
  },
  contentContainer: {
    marginTop: 12,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.textPrimary,
  },
  spoilerCover: {
    backgroundColor: 'rgba(255, 149, 0, 0.08)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
    borderStyle: 'dashed',
  },
  spoilerWarningTitle: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 6,
  },
  spoilerWarningSub: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  mediaWrapper: {
    marginTop: 12,
    borderRadius: 14,
    overflow: 'hidden',
    maxHeight: 240,
    backgroundColor: '#0E0E14',
  },
  postGif: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  attachedAnimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.06)',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
    gap: 12,
  },
  attachedAnimeCover: {
    width: 48,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#1E1E28',
  },
  attachedAnimeInfo: {
    flex: 1,
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recommendationText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.accent,
  },
  attachedAnimeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.accent,
    fontWeight: '500',
  },
  reactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  activeReactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  reactionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  reactionChipActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: theme.colors.accent,
  },
  reactionEmoji: {
    fontSize: 13,
  },
  reactionCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  addReactionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repliesCountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  repliesCountText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  emojiPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1E1E28',
    borderRadius: 16,
    paddingVertical: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emojiPickItem: {
    padding: 6,
  },
  emojiLarge: {
    fontSize: 20,
  },
  repliesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  repliesList: {
    gap: 10,
    marginBottom: 10,
  },
  replyItem: {
    flexDirection: 'row',
    gap: 10,
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E1E28',
  },
  replyBubble: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 8,
  },
  replyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  replyAuthorName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  replyRoleBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  replyRoleIcon: {
    fontSize: 8,
  },
  replyTimestamp: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  replyContentText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  replyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  myReplyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  replyTextInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 13,
    height: 36,
  },
  replySendBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replySendBtnDisabled: {
    opacity: 0.3,
  },
  editWrapper: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 10,
  },
  editTextInput: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 80,
  },
  editActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  cancelEditBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cancelEditText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  saveEditBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveEditText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
