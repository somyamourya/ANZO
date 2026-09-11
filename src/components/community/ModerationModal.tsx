import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { CommunityPost } from '../../types/community';
import { useCommunity } from '../../context/CommunityContext';

interface ModerationModalProps {
  visible: boolean;
  onClose: () => void;
  post: CommunityPost | null;
  onEdit?: () => void;
}

export const ModerationModal: React.FC<ModerationModalProps> = ({
  visible,
  onClose,
  post,
  onEdit,
}) => {
  const { currentUser, pinPost, flagSpoiler, deletePost, muteUser, reportPost } = useCommunity();

  if (!post) return null;

  const isAuthor = currentUser.id === post.author.id;
  const isPrivileged = ['OWNER', 'ADMIN', 'MODERATOR'].includes(currentUser.role);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={20} color={theme.colors.accent} />
            <Text style={styles.headerTitle}>Post Options & Moderation</Text>
          </View>

          {/* Edit (Author Only) */}
          {isAuthor && onEdit && (
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                onClose();
                onEdit();
              }}
            >
              <Ionicons name="create-outline" size={20} color={theme.colors.textPrimary} />
              <Text style={styles.optionText}>Edit Post</Text>
            </TouchableOpacity>
          )}

          {/* Pin / Unpin (Admin / Owner / Mod) */}
          {isPrivileged && (
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                pinPost(post.id);
                onClose();
              }}
            >
              <Ionicons
                name={post.isPinned ? 'pin' : 'pin-outline'}
                size={20}
                color="#FFD700"
              />
              <Text style={styles.optionText}>{post.isPinned ? 'Unpin Post' : 'Pin to Top'}</Text>
            </TouchableOpacity>
          )}

          {/* Flag as Spoiler */}
          {!post.isSpoiler && (
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                flagSpoiler(post.id);
                onClose();
              }}
            >
              <Ionicons name="eye-off-outline" size={20} color="#FF9500" />
              <Text style={styles.optionText}>Flag as Spoiler</Text>
            </TouchableOpacity>
          )}

          {/* Mute User */}
          {!isAuthor && (
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                muteUser(post.author.id);
                onClose();
              }}
            >
              <Ionicons name="volume-mute-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.optionText}>Mute @{post.author.username}</Text>
            </TouchableOpacity>
          )}

          {/* Report Post */}
          {!isAuthor && (
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                reportPost(post.id, 'Inappropriate or spoiler content');
                onClose();
              }}
            >
              <Ionicons name="flag-outline" size={20} color="#FF4D4D" />
              <Text style={[styles.optionText, { color: '#FF4D4D' }]}>Report Post</Text>
            </TouchableOpacity>
          )}

          {/* Delete Post (Author or Privileged) */}
          {(isAuthor || isPrivileged) && (
            <TouchableOpacity
              style={[styles.optionRow, styles.deleteRow]}
              onPress={() => {
                deletePost(post.id);
                onClose();
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={[styles.optionText, { color: '#FF3B30' }]}>Delete Post</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  optionText: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  deleteRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    marginTop: 4,
    paddingTop: 14,
  },
});
