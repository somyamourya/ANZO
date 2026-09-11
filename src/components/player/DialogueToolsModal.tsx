import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
} from 'react-native';
import { DialogueItem, CineTheme } from '../../types/cineplayer';
import { searchDialogue, translateSubtitleText } from '../../utils/dialogueEngine';
import { formatDuration } from '../../utils/formatters';
import { borderRadius } from '../../theme';

interface DialogueToolsModalProps {
  visible: boolean;
  dialogueItems: DialogueItem[];
  currentTime: number;
  theme: CineTheme;
  targetLanguage: string;
  onSelectTimestamp: (seconds: number) => void;
  onChangeTranslationLanguage: (lang: string) => void;
  onClose: () => void;
}

const LANGUAGES = [
  { code: 'en', label: 'English (Original)' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'es', label: 'Spanish (Español)' },
  { code: 'fr', label: 'French (Français)' },
  { code: 'de', label: 'German (Deutsch)' },
  { code: 'ja', label: 'Japanese (日本語)' },
  { code: 'ar', label: 'Arabic (العربية)' },
];

export const DialogueToolsModal: React.FC<DialogueToolsModalProps> = ({
  visible,
  dialogueItems,
  currentTime,
  theme,
  targetLanguage,
  onSelectTimestamp,
  onChangeTranslationLanguage,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'script' | 'translate'>('script');

  const filteredItems = searchDialogue(dialogueItems, searchQuery);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: 'rgba(18, 21, 31, 0.98)',
              borderColor: theme.hudBorder,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.headerTitle, { color: theme.accent }]}>
              💬 Subtitle & Dialogue Intelligence
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Mode Switcher (Script Search vs Translation) */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              onPress={() => setActiveTab('script')}
              style={[
                styles.modeTab,
                activeTab === 'script' && { backgroundColor: theme.accent },
              ]}
            >
              <Text
                style={[
                  styles.modeTabText,
                  activeTab === 'script' && styles.modeTabTextActive,
                ]}
              >
                🔍 Search Dialogue ({dialogueItems.length} lines)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('translate')}
              style={[
                styles.modeTab,
                activeTab === 'translate' && { backgroundColor: theme.accent },
              ]}
            >
              <Text
                style={[
                  styles.modeTabText,
                  activeTab === 'translate' && styles.modeTabTextActive,
                ]}
              >
                🌐 Auto-Translate Subtitles
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab 1: Script Search */}
          {activeTab === 'script' && (
            <View style={styles.tabBody}>
              <View style={styles.searchBox}>
                <Text style={styles.searchIcon}>🔎</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search dialogue phrases, words, quotes..."
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Text style={styles.clearIcon}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.scriptList}
                renderItem={({ item }) => {
                  const isCurrent =
                    currentTime >= item.start && currentTime <= item.end;
                  const translated = translateSubtitleText(
                    item.text,
                    targetLanguage
                  );
                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        onSelectTimestamp(item.start);
                        onClose();
                      }}
                      style={[
                        styles.dialogueRow,
                        isCurrent && {
                          borderColor: theme.accent,
                          backgroundColor: 'rgba(139, 92, 246, 0.15)',
                        },
                      ]}
                    >
                      <View style={styles.dialogueMeta}>
                        <Text
                          style={[
                            styles.timestampBadge,
                            { color: theme.accentSecondary },
                          ]}
                        >
                          ▶ {formatDuration(item.start)}
                        </Text>
                      </View>
                      <Text style={styles.dialogueText}>{translated}</Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          )}

          {/* Tab 2: Subtitle Translation */}
          {activeTab === 'translate' && (
            <View style={styles.tabBody}>
              <Text style={styles.translateSubtitle}>
                Select target language for real-time AI subtitle translation during playback:
              </Text>

              <FlatList
                data={LANGUAGES}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => {
                  const isSelected = targetLanguage === item.code;
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        onChangeTranslationLanguage(item.code);
                      }}
                      style={[
                        styles.langItem,
                        isSelected && {
                          borderColor: theme.accent,
                          backgroundColor: 'rgba(139, 92, 246, 0.25)',
                        },
                      ]}
                    >
                      <Text style={styles.langItemLabel}>{item.label}</Text>
                      {isSelected && (
                        <Text style={[styles.checkIcon, { color: theme.accent }]}>
                          ✓ Active
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: 16,
    maxHeight: '75%',
    borderTopWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: 12,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modeTabText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabBody: {
    flex: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  clearIcon: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    paddingHorizontal: 4,
  },
  scriptList: {
    paddingBottom: 20,
  },
  dialogueRow: {
    padding: 12,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dialogueMeta: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timestampBadge: {
    fontSize: 11,
    fontWeight: '800',
  },
  dialogueText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  translateSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 18,
  },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  langItemLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  checkIcon: {
    fontSize: 13,
    fontWeight: '700',
  },
});
