import React, { useState } from 'react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { useStore } from '../../context/StoreContext';
import { CanvasWaveform } from '../waveform/CanvasWaveform';
import { ThreeDotMenu } from '../sound/ThreeDotMenu';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
  Heart,
  MoreVertical,
  Download,
  Disc3,
  Maximize2,
  X
} from 'lucide-react';

interface MiniPlayerProps {
  onOpenDetail?: (sound: any) => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onOpenDetail }) => {
  const {
    currentSound,
    isPlaying,
    currentTime,
    duration,
    isLooping,
    volume,
    isMuted,
    isLoading,
    togglePlayPause,
    toggleLoop,
    setVolume,
    toggleMute,
    playNext,
    playPrevious,
    stopPlayback,
    cleanup: contextCleanup
  } = useAudioPlayer();

  const { isLiked, toggleLike, recordDownload } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  // Cleanup function to stop playback, set currentSound to null, and hide the player UI
  const cleanup = () => {
    if (contextCleanup) {
      contextCleanup();
    } else if (stopPlayback) {
      stopPlayback();
    }
  };

  if (!currentSound) return null;

  const liked = isLiked(currentSound.id);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 pointer-events-none">
      <div className="relative max-w-7xl mx-auto pointer-events-auto y2k-glass rounded-3xl p-3 md:p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] border border-white/20">
        
        {/* Small Close 'X' Button in corner */}
        <button
          onClick={cleanup}
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors z-20 focus:outline-none focus:ring-1 focus:ring-[#00f0ff]"
          title="Close player"
          aria-label="Close player"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Top Waveform Bar (Interactive Seek) */}
        <div className="mb-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono-num text-white/50 mb-1 px-1 pr-6 sm:pr-7">
            <span className="text-[#00f0ff] font-semibold">{formatTime(currentTime)}</span>
            <span className="truncate max-w-[200px] text-center text-white/40 hidden sm:inline">
              Interactive Spectral Waveform • Drag or Tap to Seek
            </span>
            <span>{formatTime(duration || currentSound.duration)}</span>
          </div>

          <CanvasWaveform
            height={44}
            barWidth={3}
            barGap={2}
            className="rounded-xl bg-black/40 border border-white/10"
          />
        </div>

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Sound metadata & Cover */}
          <div
            onClick={() => onOpenDetail && onOpenDetail(currentSound)}
            className="flex items-center gap-3 min-w-0 flex-1 md:flex-initial md:w-72 cursor-pointer group"
          >
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#00f0ff]/30 to-[#a855f7]/30 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
              <Disc3
                className={`w-6 h-6 text-[#00f0ff] ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '4s' }}
              />
            </div>

            <div className="min-w-0">
              <h5 className="font-bold text-sm text-white truncate group-hover:text-[#00f0ff] transition-colors">
                {currentSound.title}
              </h5>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span className="truncate">{currentSound.instrument}</span>
                <span>•</span>
                <span className="font-mono-num text-white/80">{currentSound.key}</span>
                <span>•</span>
                <span className="font-mono-num text-white/80">{currentSound.bpm} BPM</span>
              </div>
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button
              onClick={toggleLoop}
              className={`p-2 rounded-full hidden sm:flex items-center justify-center transition-colors ${
                isLooping
                  ? 'text-[#00f0ff] bg-[#00f0ff]/15'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
              title={isLooping ? 'Disable Loop' : 'Enable Loop'}
            >
              <Repeat className="w-4 h-4" />
            </button>

            <button
              onClick={playPrevious}
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Previous sound"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-12 h-12 rounded-full bg-[#00f0ff] text-black hover:bg-[#60f5ff] flex items-center justify-center shadow-[0_0_25px_rgba(0,240,255,0.7)] hover:scale-105 transition-all"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Next sound"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Right: Actions, Volume & Menu */}
          <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
            {/* Volume Slider (desktop) */}
            <div className="hidden lg:flex items-center gap-2 w-32 px-2 py-1 rounded-full bg-white/5 border border-white/10">
              <button
                onClick={toggleMute}
                className="text-white/60 hover:text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-[#00f0ff] h-1.5 rounded-lg cursor-pointer bg-white/20"
              />
            </div>

            {/* Like button */}
            <button
              onClick={() => toggleLike(currentSound.id)}
              className={`p-2 rounded-full transition-colors ${
                liked
                  ? 'text-[#ff3b30] bg-[#ff3b30]/15'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
              title={liked ? 'Unlike sound' : 'Like sound'}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-[#ff3b30]' : ''}`} />
            </button>

            {/* Download button */}
            <button
              onClick={() => recordDownload(currentSound)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-[#ff7700] text-white hover:bg-[#ff8800] shadow-[0_0_15px_rgba(255,119,0,0.5)] transition-all"
              title="Download 100% Royalty Free WAV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Expand / Details */}
            {onOpenDetail && (
              <button
                onClick={() => onOpenDetail(currentSound)}
                className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
                title="Sound Details"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}

            {/* More Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                title="More actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              <ThreeDotMenu
                sound={currentSound}
                isOpen={menuOpen}
                onClose={() => setMenuOpen(false)}
                onSelectDetail={onOpenDetail}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
