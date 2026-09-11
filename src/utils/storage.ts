import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const item = await AsyncStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item) as T;
      }
    } catch (e) {
      console.warn(`[Storage] Failed to read key: ${key}`, e);
    }
    return defaultValue;
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[Storage] Failed to save key: ${key}`, e);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn(`[Storage] Failed to remove key: ${key}`, e);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.warn('[Storage] Failed to clear storage', e);
    }
  },
};
