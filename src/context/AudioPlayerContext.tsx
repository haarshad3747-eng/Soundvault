import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Sound } from '../types';
import { useStore } from './StoreContext';

interface AudioPlayerContextType {
  currentSound: Sound | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLooping: boolean;
  volume: number;
  isMuted: boolean;
  frequencyData: Uint8Array | null;
  audioBuffer: AudioBuffer | null;
  isLoading: boolean;
  playSound: (sound: Sound, playlist?: Sound[]) => Promise<void>;
  togglePlayPause: () => void;
  seekTo: (timeInSeconds: number) => void;
  toggleLoop: () => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrevious: () => void;
  stopPlayback: () => void;
  cleanup: () => void;
  activeMenuSound: Sound | null;
  setActiveMenuSound: (sound: Sound | null) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ensureAudioLoaded, sounds } = useStore();
  const [currentSound, setCurrentSound] = useState<Sound | null>(null);
  const [playlist, setPlaylist] = useState<Sound[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const [activeMenuSound, setActiveMenuSound] = useState<Sound | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize Audio & Web Audio nodes
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
    };

    const onEnded = () => {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        setIsPlaying(false);
        playNext();
      }
    };

    const onError = (e: Event) => {
      console.warn('Audio playback error', e);
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [isLooping]);

  const initWebAudioNodes = () => {
    if (!audioRef.current) return;
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const gainNode = ctx.createGain();
      gainNode.gain.value = isMuted ? 0 : volume;
      gainNodeRef.current = gainNode;

      try {
        const source = ctx.createMediaElementSource(audioRef.current);
        sourceNodeRef.current = source;
        source.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(ctx.destination);
      } catch (err) {
        console.warn('MediaElementSource initialization notice:', err);
      }
    }

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Live analyser animation loop
  useEffect(() => {
    const updateAnalyser = () => {
      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        setFrequencyData(dataArray);
      }
      animFrameRef.current = requestAnimationFrame(updateAnalyser);
    };

    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(updateAnalyser);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setFrequencyData(null);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  const playSound = async (sound: Sound, newPlaylist?: Sound[]) => {
    if (newPlaylist) {
      setPlaylist(newPlaylist);
    } else if (!playlist.some(s => s.id === sound.id)) {
      setPlaylist(sounds);
    }

    initWebAudioNodes();

    // If same sound is clicked and playing, toggle pause
    if (currentSound?.id === sound.id && audioRef.current?.src) {
      togglePlayPause();
      return;
    }

    setCurrentSound(sound);
    setIsLoading(true);
    setAudioBuffer(null);

    try {
      const audioUrl = await ensureAudioLoaded(sound);
      if (!audioRef.current) return;

      audioRef.current.src = audioUrl;
      audioRef.current.currentTime = 0;
      audioRef.current.loop = isLooping;
      audioRef.current.volume = isMuted ? 0 : volume;

      // Decode audio for full waveform canvas
      fetch(audioUrl)
        .then(res => res.arrayBuffer())
        .then(buf => {
          if (!audioCtxRef.current) return null;
          return audioCtxRef.current.decodeAudioData(buf);
        })
        .then(decodedBuf => {
          if (decodedBuf) {
            setAudioBuffer(decodedBuf);
            if (!duration || isNaN(duration)) {
              setDuration(decodedBuf.duration);
            }
          }
        })
        .catch(e => console.warn('Could not decode audio data for waveform:', e));

      await audioRef.current.play();
      setIsPlaying(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Audio play failure:', err);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentSound) return;
    initWebAudioNodes();

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(err => console.warn('Play error:', err));
    }
  };

  const seekTo = (timeInSeconds: number) => {
    if (!audioRef.current) return;
    const target = Math.max(0, Math.min(timeInSeconds, duration || 60));
    audioRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const toggleLoop = () => {
    setIsLooping(prev => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.loop = next;
      }
      return next;
    });
  };

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = clamped;
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.volume = next ? 0 : volume;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = next ? 0 : volume;
      }
      return next;
    });
  };

  const playNext = useCallback(() => {
    if (!currentSound || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(s => s.id === currentSound.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    playSound(playlist[nextIndex], playlist);
  }, [currentSound, playlist]);

  const playPrevious = useCallback(() => {
    if (!currentSound || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(s => s.id === currentSound.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playSound(playlist[prevIndex], playlist);
  }, [currentSound, playlist]);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setCurrentSound(null);
    setAudioBuffer(null);
    setFrequencyData(null);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const cleanup = stopPlayback;

  // Global spacebar listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement;
        const isInputField =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable;
        if (!isInputField && currentSound) {
          e.preventDefault();
          togglePlayPause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSound, isPlaying]);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentSound,
        isPlaying,
        currentTime,
        duration,
        isLooping,
        volume,
        isMuted,
        frequencyData,
        audioBuffer,
        isLoading,
        playSound,
        togglePlayPause,
        seekTo,
        toggleLoop,
        setVolume,
        toggleMute,
        playNext,
        playPrevious,
        stopPlayback,
        cleanup,
        activeMenuSound,
        setActiveMenuSound
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  return ctx;
};
