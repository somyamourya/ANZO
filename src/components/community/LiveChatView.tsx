import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useCommunity } from '../../context/CommunityContext';
import { USER_ROLE_CONFIG } from '../../api/community/communityEngine';
import { GifPickerModal } from './GifPickerModal';
import { ChatMessage } from '../../types/community';

export const LiveChatView: React.FC = () => {
  const {
    chatRooms,
    activeRoomId,
    setActiveRoomId,
    chatMessages,
    sendChatMessage,
    currentUser,
  } = useCommunity();

  const [messageText, setMessageText] = useState('');
  const [showGifModal, setShowGifModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const activeRoom = chatRooms.find((r) => r.id === activeRoomId) || chatRooms[0];
  const messages = chatMessages[activeRoomId] || [];

  const handleSendMessage = (gifUrl?: string) => {
    if (!messageText.trim() && !gifUrl) return;

    sendChatMessage(activeRoomId, messageText.trim(), gifUrl);
    setMessageText('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Channel Switcher Tabs */}
      <View style={styles.channelsBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={chatRooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isActive = activeRoomId === item.id;
            return (
              <TouchableOpacity
                style={[styles.channelTab, isActive && styles.channelTabActive]}
                onPress={() => setActiveRoomId(item.id)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={15}
                  color={isActive ? theme.colors.accent : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.channelName,
                    isActive && { color: theme.colors.accent, fontWeight: 'bold' },
                  ]}
                >
                  {item.name}
                </Text>
                <View style={styles.userCountBadge}>
                  <View style={styles.greenDot} />
                  <Text style={styles.userCountText}>{item.activeUsersCount}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Room Topic Header */}
      <View style={styles.topicHeader}>
        <Text style={styles.topicText}>{activeRoom.topic}</Text>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }: { item: ChatMessage }) => {
          const isMe = item.author.id === currentUser.id;
          const roleConfig =
            USER_ROLE_CONFIG[item.author.role] || USER_ROLE_CONFIG.MEMBER;

          return (
            <View style={[styles.messageRow, isMe && styles.myMessageRow]}>
              {!isMe && (
                <Image source={{ uri: item.author.avatar }} style={styles.chatAvatar} />
              )}
              <View style={[styles.bubbleWrapper, isMe && styles.myBubbleWrapper]}>
                {!isMe && (
                  <View style={styles.authorRow}>
                    <Text style={styles.chatAuthorName}>{item.author.displayName}</Text>
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
                )}

                <View
                  style={[
                    styles.messageBubble,
                    isMe ? styles.myBubble : styles.otherBubble,
                  ]}
                >
                  {item.content.length > 0 && (
                    <Text style={[styles.messageText, isMe && styles.myMessageText]}>
                      {item.content}
                    </Text>
                  )}

                  {item.gifUrl && (
                    <View style={styles.chatGifWrapper}>
                      <Image source={{ uri: item.gifUrl }} style={styles.chatGif} />
                    </View>
                  )}

                  <Text style={[styles.chatTime, isMe && styles.myChatTime]}>
                    {item.timestamp}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* Live Input Bar */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.gifBtn}
          onPress={() => setShowGifModal(true)}
        >
          <Ionicons name="images-outline" size={20} color={theme.colors.accent} />
        </TouchableOpacity>

        <TextInput
          style={styles.chatInput}
          placeholder={`Message in ${activeRoom.name}...`}
          placeholderTextColor={theme.colors.textMuted}
          value={messageText}
          onChangeText={setMessageText}
          onSubmitEditing={() => handleSendMessage()}
        />

        <TouchableOpacity
          style={[
            styles.sendBtn,
            !messageText.trim() && styles.sendBtnDisabled,
          ]}
          disabled={!messageText.trim()}
          onPress={() => handleSendMessage()}
        >
          <Ionicons name="send" size={16} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* GIF Picker Modal */}
      <GifPickerModal
        visible={showGifModal}
        onClose={() => setShowGifModal(false)}
        onSelectGif={(url) => handleSendMessage(url)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  channelsBar: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  channelTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  channelTabActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    borderColor: theme.colors.accent,
  },
  channelName: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  userCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF66',
  },
  userCountText: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  topicHeader: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  topicText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    gap: 10,
    maxWidth: '85%',
  },
  myMessageRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  chatAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1E28',
  },
  bubbleWrapper: {
    flex: 1,
  },
  myBubbleWrapper: {
    alignItems: 'flex-end',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  chatAuthorName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleIcon: {
    fontSize: 8,
  },
  roleText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  otherBubble: {
    backgroundColor: theme.colors.cardBackground,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  myBubble: {
    backgroundColor: theme.colors.accent,
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textPrimary,
  },
  myMessageText: {
    color: '#000000',
    fontWeight: '500',
  },
  chatGifWrapper: {
    marginTop: 6,
    borderRadius: 10,
    overflow: 'hidden',
    width: 200,
    height: 140,
  },
  chatGif: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  chatTime: {
    fontSize: 10,
    color: theme.colors.textMuted,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  myChatTime: {
    color: 'rgba(0,0,0,0.6)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  gifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    paddingHorizontal: 14,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
