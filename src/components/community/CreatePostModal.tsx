import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useCommunity } from '../../context/CommunityContext';
import { GifPickerModal } from './GifPickerModal';
import { USER_ROLE_CONFIG } from '../../api/community/communityEngine';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ visible, onClose }) => {
  const { currentUser, createPost } = useCommunity();
  const [content, setContent] = useState('');
  const [gifUrl, setGifUrl] = useState<string | undefined>(undefined);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Anzo']);
  const [showGifModal, setShowGifModal] = useState(false);

  const roleConfig = USER_ROLE_CONFIG[currentUser.role] || USER_ROLE_CONFIG.MEMBER;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim().replace(/^#/, '')]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handlePublish = () => {
    if (!content.trim() && !gifUrl) return;

    createPost({
      content: content.trim(),
      gifUrl,
      isSpoiler,
      tags,
    });

    // Reset & close
    setContent('');
    setGifUrl(undefined);
    setIsSpoiler(false);
    setTags(['Anzo']);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Post</Text>
            <TouchableOpacity
              style={[
                styles.publishBtn,
                (!content.trim() && !gifUrl) && styles.publishBtnDisabled,
              ]}
              disabled={!content.trim() && !gifUrl}
              onPress={handlePublish}
            >
              <Text style={styles.publishBtnText}>Post</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Author Row */}
            <View style={styles.authorRow}>
              <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
              <View>
                <View style={styles.nameRow}>
                  <Text style={styles.displayName}>{currentUser.displayName}</Text>
                  <View
                    style={[
                      styles.roleBadge,
                      { backgroundColor: roleConfig.bg, borderColor: roleConfig.border },
                    ]}
                  >
                    <Text style={styles.roleIcon}>{roleConfig.icon}</Text>
                    <Text style={[styles.roleText, { color: roleConfig.color }]}>
                      {roleConfig.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.username}>@{currentUser.username}</Text>
              </View>
            </View>

            {/* Post Content Input */}
            <TextInput
              style={styles.contentInput}
              placeholder="What's on your mind? Share theories, episode reviews, recommendations..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              value={content}
              onChangeText={setContent}
              maxLength={800}
            />

            {/* Selected GIF Preview */}
            {gifUrl && (
              <View style={styles.gifPreviewWrapper}>
                <Image source={{ uri: gifUrl }} style={styles.gifPreview} />
                <TouchableOpacity
                  style={styles.removeGifBtn}
                  onPress={() => setGifUrl(undefined)}
                >
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}

            {/* Tags Section */}
            <View style={styles.tagSection}>
              <View style={styles.tagsRow}>
                {tags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.tagChip}
                    onPress={() => handleRemoveTag(tag)}
                  >
                    <Text style={styles.tagText}>#{tag}</Text>
                    <Ionicons name="close" size={12} color={theme.colors.accent} />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.tagInputRow}>
                <Ionicons name="pricetag-outline" size={16} color={theme.colors.textMuted} />
                <TextInput
                  style={styles.tagInput}
                  placeholder="Add a tag (e.g. SoloLeveling, JJK)..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={handleAddTag}
                />
                {tagInput.length > 0 && (
                  <TouchableOpacity onPress={handleAddTag} style={styles.addTagBtn}>
                    <Text style={styles.addTagBtnText}>Add</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Spoiler Toggle */}
            <View style={styles.spoilerRow}>
              <View style={styles.spoilerInfo}>
                <Ionicons name="eye-off-outline" size={20} color="#FF9500" />
                <View>
                  <Text style={styles.spoilerTitle}>Mark as Spoiler</Text>
                  <Text style={styles.spoilerSubtitle}>Blurs post content for other members</Text>
                </View>
              </View>
              <Switch
                value={isSpoiler}
                onValueChange={setIsSpoiler}
                trackColor={{ false: '#3A3A3C', true: theme.colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Quick Action Toolbar */}
            <View style={styles.toolbar}>
              <TouchableOpacity
                style={styles.toolBtn}
                onPress={() => setShowGifModal(true)}
              >
                <Ionicons name="images-outline" size={20} color={theme.colors.accent} />
                <Text style={styles.toolBtnText}>Add GIF</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* GIF Picker Modal */}
      <GifPickerModal
        visible={showGifModal}
        onClose={() => setShowGifModal(false)}
        onSelectGif={(url) => setGifUrl(url)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    backgroundColor: theme.colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  publishBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 18,
  },
  publishBtnDisabled: {
    opacity: 0.4,
  },
  publishBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 30,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E28',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  displayName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleIcon: {
    fontSize: 10,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  contentInput: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  gifPreviewWrapper: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  gifPreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeGifBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagSection: {
    marginTop: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.25)',
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
  },
  tagInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 13,
    marginLeft: 8,
  },
  addTagBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.accent,
  },
  addTagBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  spoilerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  spoilerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  spoilerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  spoilerSubtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  toolBtnText: {
    fontSize: 13,
    color: theme.colors.accent,
    fontWeight: '600',
  },
});
