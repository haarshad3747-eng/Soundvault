import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sound, Pack, User } from '../types';
import { INITIAL_SEEDED_SOUNDS, SEED_PACKS } from '../data/seedData';
import { synthesizeSoundAudio, setCachedAudio, getCachedAudio } from '../utils/audioSynthesis';
import { saveAudioToIndexedDB, loadAudioFromIndexedDB } from '../utils/indexedDbAudio';

export interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface StoreContextType {
  sounds: Sound[];
  packs: Pack[];
  user: User | null;
  likedIds: Set<string>;
  myLibraryIds: Set<string>;
  toasts: ToastItem[];
  // Stats
  soundsCount: number;
  packsCount: number;
  totalDownloads: number;
  // Actions
  toggleLike: (soundId: string) => void;
  toggleLibrary: (soundId: string) => void;
  isLiked: (soundId: string) => boolean;
  isInLibrary: (soundId: string) => boolean;
  recordDownload: (sound: Sound) => Promise<boolean>;
  uploadSound: (
    soundData: Omit<Sound, 'id' | 'created_at' | 'downloads' | 'status' | 'source'>,
    audioBlob?: Blob
  ) => Promise<void>;
  approveSound: (soundId: string) => void;
  rejectSound: (soundId: string) => void;
  bulkUploadAdmin: (newSounds: Sound[]) => void;
  signInWithLocalUsername: (username: string, isAdmin?: boolean) => void;
  signInWithGoogle: (email?: string, displayName?: string) => void;
  signOut: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  ensureAudioLoaded: (sound: Sound) => Promise<string>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY_SOUNDS = 'soundvault_local_sounds_v2';
const STORAGE_KEY_USER = 'soundvault_local_user_v2';
const STORAGE_KEY_LIKES = 'soundvault_local_likes_v2';
const STORAGE_KEY_LIBRARY = 'soundvault_local_library_v2';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sounds state
  const [sounds, setSounds] = useState<Sound[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOUNDS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_SEEDED_SOUNDS;
  });

  // Packs state
  const [packs] = useState<Pack[]>(SEED_PACKS);

  // User state (local browser session)
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    // Default user logged in as haarahad3747 (Admin)
    return {
      uid: 'user-admin-01',
      email: 'haarahad3747@gmail.com',
      displayName: 'haarahad3747',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      role: 'admin'
    };
  });

  // Liked sounds (Set)
  const [likedIds, setLikedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LIKES);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // Fallback
    }
    return new Set(['snd-101', 'snd-201', 'snd-301']);
  });

  // Vault Library sounds (Set)
  const [myLibraryIds, setMyLibraryIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LIBRARY);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // Fallback
    }
    return new Set(['snd-101', 'snd-102', 'snd-202', 'snd-301', 'snd-401']);
  });

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Synchronize state with browser localStorage
  useEffect(() => {
    try {
      // Do not stringify huge base64 data to localStorage (handled by IndexedDB)
      const sanitized = sounds.map(s => ({
        ...s,
        audio: s.audio && s.audio.startsWith('blob:') ? '' : s.audio
      }));
      localStorage.setItem(STORAGE_KEY_SOUNDS, JSON.stringify(sanitized));
    } catch (e) {
      console.warn('LocalStorage notice for sounds', e);
    }
  }, [sounds]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify(Array.from(likedIds)));
  }, [likedIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LIBRARY, JSON.stringify(Array.from(myLibraryIds)));
  }, [myLibraryIds]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const isLiked = (soundId: string) => likedIds.has(soundId);
  const isInLibrary = (soundId: string) => myLibraryIds.has(soundId);

  const toggleLike = (soundId: string) => {
    if (!user) {
      addToast('Sign in to like sounds', 'info');
      setShowLoginModal(true);
      return;
    }

    const sound = sounds.find(s => s.id === soundId);
    const soundTitle = sound ? `"${sound.title}"` : 'Sound';

    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(soundId)) {
        next.delete(soundId);
        addToast(`Removed ${soundTitle} from likes`, 'info');
      } else {
        next.add(soundId);
        addToast(`Added ${soundTitle} to likes`, 'success');
      }
      return next;
    });
  };

  const toggleLibrary = (soundId: string) => {
    if (!user) {
      addToast('Sign in to save sounds to your library', 'info');
      setShowLoginModal(true);
      return;
    }

    const sound = sounds.find(s => s.id === soundId);
    const soundTitle = sound ? `"${sound.title}"` : 'Sound';

    setMyLibraryIds(prev => {
      const next = new Set(prev);
      if (next.has(soundId)) {
        next.delete(soundId);
        addToast(`Removed ${soundTitle} from library`, 'info');
      } else {
        next.add(soundId);
        addToast(`Added ${soundTitle} to your library`, 'success');
      }
      return next;
    });
  };

  // Ensure audio blob URL is generated on-demand with full duration and correct frequency profile
  const ensureAudioLoaded = async (sound: Sound): Promise<string> => {
    if (sound.audio && sound.audio.length > 0) {
      return sound.audio;
    }

    // Check memory cache
    const cached = getCachedAudio(sound.id);
    if (cached) {
      return cached.url;
    }

    // Check IndexedDB for user-uploaded audio
    const indexedDbUrl = await loadAudioFromIndexedDB(sound.id);
    if (indexedDbUrl) {
      return indexedDbUrl;
    }

    // Synthesize procedurally using Web Audio API
    try {
      const { blob, url, buffer, featureVector } = await synthesizeSoundAudio(
        sound.type,
        sound.instrument,
        sound.key,
        sound.bpm,
        sound.duration
      );

      setCachedAudio(sound.id, { buffer, url });

      // Update sound in state with real duration, url, and feature vector
      setSounds(prev =>
        prev.map(s =>
          s.id === sound.id
            ? { ...s, audio: url, duration: buffer.duration, feature_vector: featureVector }
            : s
        )
      );

      return url;
    } catch (err) {
      console.error('Audio synthesis failed for', sound.title, err);
      return '';
    }
  };

  const recordDownload = async (sound: Sound): Promise<boolean> => {
    if (!user) {
      addToast('Sign in to download royalty-free samples', 'info');
      setShowLoginModal(true);
      return false;
    }

    try {
      addToast(`Preparing download for "${sound.title}"...`, 'info');
      const audioUrl = await ensureAudioLoaded(sound);

      // Increment download counter
      setSounds(prev =>
        prev.map(s => (s.id === sound.id ? { ...s, downloads: s.downloads + 1 } : s))
      );

      // Trigger actual browser download of real audio file
      const link = document.createElement('a');
      link.href = audioUrl;
      const cleanTitle = sound.title.replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `SoundVault_${cleanTitle}_${sound.key}_${sound.bpm}BPM.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast(`Downloaded "${sound.title}" (100% Royalty-Free)`, 'success');
      return true;
    } catch (err) {
      console.error('Download error:', err);
      addToast('Could not download audio file', 'error');
      return false;
    }
  };

  const uploadSound = async (
    soundData: Omit<Sound, 'id' | 'created_at' | 'downloads' | 'status' | 'source'>,
    audioBlob?: Blob
  ) => {
    if (!user) {
      addToast('Please sign in to upload sounds', 'error');
      return;
    }

    const soundId = `usr-snd-${Date.now()}`;

    // If audioBlob provided, store in IndexedDB
    if (audioBlob) {
      await saveAudioToIndexedDB(soundId, audioBlob);
    }

    const newSound: Sound = {
      ...soundData,
      id: soundId,
      created_at: new Date().toISOString(),
      downloads: 0,
      source: 'user',
      uploaded_by: user.displayName || 'Producer',
      uploaded_by_email: user.email,
      status: 'pending' // pending until admin moderates
    };

    setSounds(prev => [newSound, ...prev]);
    addToast(`"${newSound.title}" uploaded! It is pending moderation.`, 'success');
  };

  const approveSound = (soundId: string) => {
    setSounds(prev =>
      prev.map(s => (s.id === soundId ? { ...s, status: 'approved' } : s))
    );
    addToast('Sound approved and published to catalog!', 'success');
  };

  const rejectSound = (soundId: string) => {
    setSounds(prev =>
      prev.map(s => (s.id === soundId ? { ...s, status: 'rejected' } : s))
    );
    addToast('Sound rejected from catalog', 'info');
  };

  const bulkUploadAdmin = (newSounds: Sound[]) => {
    setSounds(prev => [...newSounds, ...prev]);
    addToast(`Bulk added ${newSounds.length} sounds to the vault!`, 'success');
  };

  const signInWithLocalUsername = (username: string, isAdmin = false) => {
    const isAutoAdmin =
      isAdmin ||
      username.toLowerCase().includes('admin') ||
      username.toLowerCase().includes('haarahad3747');

    const newUser: User = {
      uid: `usr-${Date.now()}`,
      email: `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@soundvault.local`,
      displayName: username,
      photoURL: isAutoAdmin
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
      role: isAutoAdmin ? 'admin' : 'user'
    };

    setUser(newUser);
    setShowLoginModal(false);
    addToast(`Signed in as ${newUser.displayName} (${isAutoAdmin ? 'Admin' : 'Producer'})`, 'success');
  };

  const signInWithGoogle = (email = 'haarahad3747@gmail.com', displayName = 'Vault Admin') => {
    const isAdmin =
      email.toLowerCase().includes('haarahad3747') ||
      email.toLowerCase().includes('admin');

    const newUser: User = {
      uid: `usr-google-${Date.now()}`,
      email,
      displayName: displayName || (isAdmin ? 'Vault Admin' : 'Sound Designer'),
      photoURL: isAdmin
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
      role: isAdmin ? 'admin' : 'user'
    };

    setUser(newUser);
    setShowLoginModal(false);
    addToast(`Signed in as ${newUser.displayName} (${isAdmin ? 'Admin' : 'Member'})`, 'success');
  };

  const signOut = () => {
    setUser(null);
    addToast('Signed out of SoundVault', 'info');
  };

  // Real Database Live Counts (Never fake numbers)
  const approvedSounds = sounds.filter(s => s.status === 'approved');
  const soundsCount = approvedSounds.length;
  const packsCount = packs.length;
  const totalDownloads = sounds.reduce((sum, s) => sum + s.downloads, 0);

  return (
    <StoreContext.Provider
      value={{
        sounds,
        packs,
        user,
        likedIds,
        myLibraryIds,
        toasts,
        soundsCount,
        packsCount,
        totalDownloads,
        toggleLike,
        toggleLibrary,
        isLiked,
        isInLibrary,
        recordDownload,
        uploadSound,
        approveSound,
        rejectSound,
        bulkUploadAdmin,
        signInWithLocalUsername,
        signInWithGoogle,
        signOut,
        showLoginModal,
        setShowLoginModal,
        addToast,
        removeToast,
        ensureAudioLoaded
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
