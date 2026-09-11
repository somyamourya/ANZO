import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { searchAnimeGifs, getGifCategories, AnimeGifItem } from '../../api/community/gifService';

interface GifPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectGif: (gifUrl: string) => void;
}

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 2;

export const GifPickerModal: React.FC<GifPickerModalProps> = ({
  visible,
  onClose,
  onSelectGif,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [gifs, setGifs] = useState<AnimeGifItem[]>([]);
  const [categories] = useState<string[]>(getGifCategories());

  useEffect(() => {
    if (visible) {
      loadGifs();
    }
  }, [visible, selectedCategory, searchQuery]);

  const loadGifs = async () => {
    const results = await searchAnimeGifs(searchQuery, selectedCategory);
    setGifs(results);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="sparkles" size={20} color={theme.colors.accent} />
              <Text style={styles.headerTitle}>Select Anime GIF</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search hype, fight, reactions..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Categories Horizontal Chips */}
          <View style={styles.categoriesContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = selectedCategory === item;
                return (
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      isSelected && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
                    ]}
                    onPress={() => setSelectedCategory(item)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        isSelected && { color: '#000000', fontWeight: 'bold' },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* GIF Grid */}
          <FlatList
            data={gifs}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gifGridRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gifGridContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.gifCard}
                activeOpacity={0.8}
                onPress={() => {
                  onSelectGif(item.url);
                  onClose();
                }}
              >
                <Image source={{ uri: item.previewUrl }} style={styles.gifImage} />
                <View style={styles.gifTitleBadge}>
                  <Text style={styles.gifTitleText} numberOfLines={1}>
                    {item.title}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
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
    height: '75%',
    backgroundColor: theme.colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
    marginLeft: 8,
  },
  categoriesContainer: {
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  gifGridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gifGridContent: {
    paddingBottom: 24,
  },
  gifCard: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 0.9,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  gifImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gifTitleBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  gifTitleText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
});
