import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/anime';
import { storage } from '../utils/storage';
import axios from 'axios';

interface AuthContextType {
  user: UserProfile;
  isLoading: boolean;
  loginWithAniListToken: (token: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserStats: (episodesIncrement?: number, minutesIncrement?: number) => Promise<void>;
}

const DEFAULT_GUEST_USER: UserProfile = {
  id: 'guest_user',
  username: 'Otaku Explorer',
  avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80',
  banner: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
  isAniListAuthed: false,
  totalAnimeWatched: 12,
  totalEpisodesWatched: 148,
  minutesWatched: 3552,
  meanScore: 8.4,
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_GUEST_USER,
  isLoading: true,
  loginWithAniListToken: async () => false,
  logout: async () => {},
  updateUserStats: async () => {},
});

const AUTH_STORAGE_KEY = '@animenext_user_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(DEFAULT_GUEST_USER);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const saved = await storage.get<UserProfile>(AUTH_STORAGE_KEY, DEFAULT_GUEST_USER);
      setUser(saved);
    } catch (e) {
      console.warn('Failed to load user profile:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithAniListToken = async (token: string): Promise<boolean> => {
    try {
      const query = `
        query {
          Viewer {
            id
            name
            avatar {
              large
              medium
            }
            bannerImage
            statistics {
              anime {
                count
                episodesWatched
                minutesWatched
                meanScore
              }
            }
          }
        }
      `;

      const res = await axios.post(
        'https://graphql.anilist.co',
        { query },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          timeout: 10000,
        }
      );

      const viewer = res.data?.data?.Viewer;
      if (!viewer) return false;

      const newUser: UserProfile = {
        id: viewer.id,
        username: viewer.name,
        avatar: viewer.avatar?.large || viewer.avatar?.medium || DEFAULT_GUEST_USER.avatar,
        banner: viewer.bannerImage || DEFAULT_GUEST_USER.banner,
        isAniListAuthed: true,
        anilistToken: token,
        totalAnimeWatched: viewer.statistics?.anime?.count || 0,
        totalEpisodesWatched: viewer.statistics?.anime?.episodesWatched || 0,
        minutesWatched: viewer.statistics?.anime?.minutesWatched || 0,
        meanScore: viewer.statistics?.anime?.meanScore || 0,
      };

      setUser(newUser);
      await storage.set(AUTH_STORAGE_KEY, newUser);
      return true;
    } catch (e) {
      console.error('AniList authentication error:', e);
      return false;
    }
  };

  const logout = async () => {
    setUser(DEFAULT_GUEST_USER);
    await storage.set(AUTH_STORAGE_KEY, DEFAULT_GUEST_USER);
  };

  const updateUserStats = async (episodesIncrement = 1, minutesIncrement = 24) => {
    setUser((prev) => {
      const updated: UserProfile = {
        ...prev,
        totalEpisodesWatched: prev.totalEpisodesWatched + episodesIncrement,
        minutesWatched: prev.minutesWatched + minutesIncrement,
      };
      storage.set(AUTH_STORAGE_KEY, updated);
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginWithAniListToken,
        logout,
        updateUserStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
