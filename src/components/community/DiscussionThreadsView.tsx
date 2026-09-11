import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCommunity } from '../../context/CommunityContext';
import { DiscussionThread } from '../../types/community';
import { theme, borderRadius, shadows } from '../../theme';

interface DiscussionThreadsViewProps {
  onSelectMedia?: (mediaType: 'ANIME' | 'MANGA' | 'NOVEL', mediaId: string | number) => void;
}

export const DiscussionThreadsView: React.FC<DiscussionThreadsViewProps> = ({ onSelectMedia }) => {
  const { discussionThreads, addThreadReply, lockThread, currentUser } = useCommunity();
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});
  const [replyInput, setReplyInput] = useState('');

  const isAdminOrMod = currentUser.role === 'OWNER' || currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR';

  const toggleSpoiler = (id: string) => {
    setRevealedSpoilers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendReply = (threadId: string) => {
    if (!replyInput.trim()) return;
    addThreadReply(threadId, replyInput.trim());
    setReplyInput('');
  };

  const getMediaBadgeColor = (type: 'ANIME' | 'MANGA' | 'NOVEL') => {
    switch (type) {
      case 'ANIME':
        return '#3B82F6';
      case 'MANGA':
        return '#8B5CF6';
      case 'NOVEL':
        return '#F59E0B';
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={discussionThreads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isExpanded = expandedThreadId === item.id;
          const isSpoilerRevealed = revealedSpoilers[item.id];

          return (
            <View style={[styles.threadCard, shadows.sm]}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={styles.metaRow}>
                  <View style={[styles.typeBadge, { backgroundColor: getMediaBadgeColor(item.mediaType) }]}>
                    <Text style={styles.typeBadgeText}>{item.mediaType}</Text>
                  </View>
                  <Text style={styles.mediaTitleText}>{item.mediaTitle}</Text>
                  <Text style={styles.unitBadgeText}>• {item.unitLabel}</Text>
                </View>

                {isAdminOrMod && (
                  <TouchableOpacity onPress={() => lockThread(item.id)} style={styles.lockActionBtn}>
                    <Ionicons
                      name={item.isLocked ? 'lock-closed' : 'lock-open-outline'}
                      size={14}
                      color={item.isLocked ? '#EF4444' : theme.colors.textMuted}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Thread Title */}
              <Text style={styles.threadTitle}>{item.threadTitle}</Text>

              {/* Author Row */}
              <View style={styles.authorRow}>
                <Image source={{ uri: item.author.avatar }} style={styles.authorAvatar} />
                <Text style={styles.authorName}>{item.author.displayName}</Text>
                <Text style={styles.timestampText}>• {item.createdAt}</Text>
                {item.isLocked && (
                  <View style={styles.lockedBadge}>
                    <Ionicons name="lock-closed" size={10} color="#EF4444" />
                    <Text style={styles.lockedBadgeText}>Locked</Text>
                  </View>
                )}
              </View>

              {/* Content / Spoiler Shield */}
              {item.isSpoiler && !isSpoilerRevealed ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => toggleSpoiler(item.id)}
                  style={styles.spoilerShield}
                >
                  <Ionicons name="eye-off" size={16} color="#FBBF24" />
                  <Text style={styles.spoilerShieldText}>
                    Contains Spoilers for {item.unitLabel} • Tap to Reveal
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.threadContent}>{item.content}</Text>
              )}

              {/* Footer / Reply Toggle */}
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  onPress={() => setExpandedThreadId(isExpanded ? null : item.id)}
                  style={styles.replyCountBtn}
                >
                  <Ionicons name="chatbubbles-outline" size={15} color={theme.colors.accent} />
                  <Text style={styles.replyCountText}>
                    {item.replyCount || item.replies.length} Discussion Replies
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={theme.colors.textMuted}
                  />
                </TouchableOpacity>

                {onSelectMedia && (
                  <TouchableOpacity
                    onPress={() => onSelectMedia(item.mediaType, item.mediaId)}
                    style={styles.jumpMediaBtn}
                  >
                    <Text style={styles.jumpMediaText}>Open Media ›</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Expanded Replies Section */}
              {isExpanded && (
                <View style={styles.repliesSection}>
                  <View style={styles.repliesDivider} />
                  {item.replies.length === 0 ? (
                    <Text style={styles.noRepliesText}>No replies yet. Be the first to share your thoughts!</Text>
                  ) : (
                    item.replies.map((reply) => (
                      <View key={reply.id} style={styles.replyItem}>
                        <Image source={{ uri: reply.author.avatar }} style={styles.replyAvatar} />
                        <View style={styles.replyBubble}>
                          <View style={styles.replyHeader}>
                            <Text style={styles.replyAuthor}>{reply.author.displayName}</Text>
                            <Text style={styles.replyTime}>{reply.timestamp}</Text>
                          </View>
                          <Text style={styles.replyBody}>{reply.content}</Text>
                        </View>
                      </View>
                    ))
                  )}

                  {/* Reply Composer */}
                  {!item.isLocked ? (
                    <View style={styles.composerRow}>
                      <TextInput
                        style={styles.composerInput}
                        placeholder="Write a reply..."
                        placeholderTextColor={theme.colors.textMuted}
                        value={replyInput}
                        onChangeText={setReplyInput}
                      />
                      <TouchableOpacity
                        onPress={() => handleSendReply(item.id)}
                        style={styles.sendReplyBtn}
                      >
                        <Ionicons name="send" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.lockedNotice}>
                      <Ionicons name="lock-closed" size={12} color="#EF4444" />
                      <Text style={styles.lockedNoticeText}>This discussion thread has been locked.</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
    gap: 14,
  },
  threadCard: {
    backgroundColor: theme.colors.card,
    borderRadius: borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  mediaTitleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  unitBadgeText: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  lockActionBtn: {
    padding: 4,
  },
  threadTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  authorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  authorName: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  timestampText: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  lockedBadgeText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '800',
  },
  spoilerShield: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    padding: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 10,
  },
  spoilerShieldText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  threadContent: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 10,
  },
  replyCountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  replyCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  jumpMediaBtn: {
    paddingVertical: 2,
  },
  jumpMediaText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '700',
  },
  repliesSection: {
    marginTop: 10,
  },
  repliesDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: 10,
  },
  noRepliesText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 6,
  },
  replyItem: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginTop: 2,
  },
  replyBubble: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: 8,
    borderRadius: borderRadius.md,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  replyAuthor: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  replyTime: {
    color: theme.colors.textMuted,
    fontSize: 10,
  },
  replyBody: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  composerRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  composerInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    color: '#FFFFFF',
    borderRadius: borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sendReplyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  lockedNoticeText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '600',
  },
});
