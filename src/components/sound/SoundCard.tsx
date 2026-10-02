import React, { useState } from 'react';
import { Sound } from '../../types';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { useStore } from '../../context/StoreContext';
import { StaticWaveform } from '../waveform/StaticWaveform';
import { ThreeDotMenu } from './ThreeDotMenu';
import { Play, Pause, Heart, MoreVertical, Download, Sparkles, UserCheck } from 'lucide-react';

interface SoundCardProps {
  sound: Sound;
  playlist?: Sound[];
  onOpenDetail?: (sound: Sound) => void;
}

export const SoundCard: React.FC<SoundCardProps> = ({ sound, playlist, onOpenDetail }) => {
  const { currentSound, isPlaying, playSound, togglePlayPause, currentTime, duration, isLoading } = useAudioPlayer();
  const { isLiked, toggleLike, recordDownload } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const isCurrent = currentSound?.id === sound.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;
  const liked = isLiked(sound.id);

  // Calculate playback progress on card
  const progress = isCurrent && duration > 0 ? currentTime / duration : 0;

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlayPause();
    } else {
      playSound(sound, playlist);
    }
  };

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(sound.id);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordDownload(sound);
  };

  const formatDuration = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:15';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      onClick={() => onOpenDetail && onOpenDetail(sound)}
      className={`relative group y2k-card-bubble p-4 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
        isCurrent ? 'ring-1 ring-[#00f0ff] shadow-[0_0_25px_rgba(0,240,255,0.25)]' : ''
      }`}
    >
      <div>
        {/* Top Header: Type badge & Menu & Like */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-white/10 text-white/90 border border-white/15">
              {sound.type}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
              {sound.instrument}
            </span>
            {sound.source === 'user' && sound.uploaded_by && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#ff7700]/15 text-[#ff8c00] border border-[#ff7700]/30">
                <UserCheck className="w-3 h-3" />
                <span className="truncate max-w-[80px]">{sound.uploaded_by}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleLikeToggle}
              className={`p-1.5 rounded-full transition-colors ${
                liked
                  ? 'text-[#ff3b30] hover:bg-[#ff3b30]/15'
                  : 'text-white/40 hover:text-white hover:bg-white/10'
              }`}
              title={liked ? 'Unlike sound' : 'Like sound'}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-[#ff3b30]' : ''}`} />
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              <ThreeDotMenu
                sound={sound}
                isOpen={menuOpen}
                onClose={() => setMenuOpen(false)}
                onSelectDetail={onOpenDetail}
              />
            </div>
          </div>
        </div>

        {/* Title and metadata */}
        <h4 className="font-bold text-base text-white tracking-tight line-clamp-1 group-hover:text-[#00f0ff] transition-colors">
          {sound.title}
        </h4>

        {/* Key, BPM & Genre tags */}
        <div className="flex items-center gap-3 mt-1.5 text-xs text-white/60">
          <span className="font-mono-num font-semibold text-white/80">{sound.key}</span>
          <span>•</span>
          <span className="font-mono-num font-semibold text-white/80">{sound.bpm} BPM</span>
          <span>•</span>
          <span className="font-mono-num">{formatDuration(sound.duration)}</span>
        </div>
      </div>

      {/* Middle: Waveform and Play Button */}
      <div className="my-3 flex items-center gap-3">
        <button
          onClick={handlePlayToggle}
          className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
            isCurrentlyPlaying
              ? 'bg-[#00f0ff] text-black shadow-[0_0_20px_rgba(0,240,255,0.8)] scale-105'
              : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105 border border-white/20'
          }`}
          title={isCurrentlyPlaying ? 'Pause' : 'Play preview'}
        >
          {isCurrent && isLoading ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : isCurrentlyPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Small Static Waveform with Spectral Energy */}
        <div className="flex-1 bg-black/40 rounded-xl p-1.5 border border-white/5">
          <StaticWaveform
            soundId={sound.id}
            isPlaying={isCurrentlyPlaying}
            progress={progress}
            barsCount={34}
            height={26}
          />
        </div>
      </div>

      {/* Bottom Footer: Tags & Download */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {sound.genre.slice(0, 2).map((g, i) => (
            <span
              key={i}
              className="text-[11px] text-white/50 hover:text-white truncate"
            >
              #{g}
            </span>
          ))}
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white/90 bg-white/10 hover:bg-[#ff7700] hover:text-white border border-white/15 hover:border-[#ff7700] transition-all hover:shadow-[0_0_15px_rgba(255,119,0,0.5)] shrink-0"
          title="Download WAV"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="font-mono-num">{sound.downloads}</span>
        </button>
      </div>
    </div>
  );
};
