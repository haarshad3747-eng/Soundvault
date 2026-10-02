import React from 'react';
import { Sound } from '../types';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { useStore } from '../context/StoreContext';
import { CanvasWaveform } from '../components/waveform/CanvasWaveform';
import { SoundCard } from '../components/sound/SoundCard';
import {
  ArrowLeft,
  Play,
  Pause,
  Download,
  Heart,
  Bookmark,
  Disc3,
  Share2,
  ShieldCheck,
  Tag,
  Radio,
  Clock,
  Sparkles
} from 'lucide-react';

interface SoundDetailPageProps {
  sound: Sound;
  onBack: () => void;
  onSelectRelatedSound: (sound: Sound) => void;
  onNavigateToGenre?: (genre: string) => void;
}

export const SoundDetailPage: React.FC<SoundDetailPageProps> = ({
  sound,
  onBack,
  onSelectRelatedSound,
  onNavigateToGenre
}) => {
  const { currentSound, isPlaying, playSound, togglePlayPause, currentTime, duration, isLoading } = useAudioPlayer();
  const { isLiked, isInLibrary, toggleLike, toggleLibrary, recordDownload, sounds, addToast } = useStore();

  const isCurrent = currentSound?.id === sound.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;
  const liked = isLiked(sound.id);
  const inLibrary = isInLibrary(sound.id);

  // Related sounds in same genre or instrument
  const relatedSounds = sounds
    .filter(
      s =>
        s.id !== sound.id &&
        s.status === 'approved' &&
        (s.instrument === sound.instrument || s.genre.some(g => sound.genre.includes(g)))
    )
    .slice(0, 4);

  const formatDuration = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:15';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopyShare = () => {
    const url = `${window.location.origin}/#sound-${sound.id}`;
    navigator.clipboard?.writeText(url).then(() => {
      addToast('Sound link copied to clipboard!', 'success');
    }).catch(() => {
      addToast('Sound link: ' + url, 'info');
    });
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full y2k-glass-subtle text-xs font-semibold text-white/70 hover:text-white hover:border-[#00f0ff] transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </button>

      {/* Main Sound Player Showcase */}
      <div className="y2k-glass rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6">
        
        {/* Top Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00f0ff] to-[#a855f7] flex items-center justify-center p-0.5 shadow-[0_0_25px_rgba(0,240,255,0.4)]">
              <div className="w-full h-full bg-[#0a0d16] rounded-2xl flex items-center justify-center">
                <Disc3 className={`w-8 h-8 text-[#00f0ff] ${isCurrentlyPlaying ? 'animate-spin' : ''}`} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-white/10 text-white/90">
                  {sound.type}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30">
                  {sound.instrument}
                </span>
                {sound.source === 'user' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ff7700]/15 text-[#ff8c00]">
                    Uploaded by {sound.uploaded_by || 'User'}
                  </span>
                )}
              </div>

              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                {sound.title}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleLike(sound.id)}
              className={`p-2.5 rounded-full border transition-all ${
                liked
                  ? 'bg-[#ff3b30]/15 border-[#ff3b30]/40 text-[#ff3b30]'
                  : 'bg-white/5 border-white/15 text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={liked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-[#ff3b30]' : ''}`} />
            </button>

            <button
              onClick={() => toggleLibrary(sound.id)}
              className={`p-2.5 rounded-full border transition-all ${
                inLibrary
                  ? 'bg-[#00f0ff]/15 border-[#00f0ff]/40 text-[#00f0ff]'
                  : 'bg-white/5 border-white/15 text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={inLibrary ? 'In Vault Library' : 'Save to Vault'}
            >
              <Bookmark className={`w-5 h-5 ${inLibrary ? 'fill-[#00f0ff]' : ''}`} />
            </button>

            <button
              onClick={handleCopyShare}
              className="p-2.5 rounded-full bg-white/5 border border-white/15 text-white/70 hover:text-white hover:bg-white/10 transition-all"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => recordDownload(sound)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full y2k-btn-accent text-xs font-bold uppercase tracking-wider shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Download WAV</span>
            </button>
          </div>
        </div>

        {/* Interactive Waveform Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono-num text-white/60">
            <span className="text-[#00f0ff] font-bold">
              {isCurrent ? formatDuration(currentTime) : '0:00'}
            </span>
            <span className="text-white/40">
              Interactive Canvas Waveform • Scrub or Click to Seek
            </span>
            <span>{formatDuration(isCurrent && duration ? duration : sound.duration)}</span>
          </div>

          <div className="p-2 rounded-2xl bg-black/60 border border-white/15 shadow-inner">
            <CanvasWaveform
              height={70}
              barWidth={3.5}
              barGap={2}
              className="rounded-xl overflow-hidden"
            />
          </div>

          {/* Large Play/Pause Toggle */}
          <div className="flex items-center justify-center pt-2">
            <button
              onClick={() => {
                if (isCurrent) {
                  togglePlayPause();
                } else {
                  playSound(sound);
                }
              }}
              className="w-16 h-16 rounded-full bg-[#00f0ff] text-black hover:bg-[#60f5ff] flex items-center justify-center shadow-[0_0_35px_rgba(0,240,255,0.7)] hover:scale-105 transition-all"
            >
              {isCurrent && isLoading ? (
                <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
              ) : isCurrentlyPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current ml-1" />
              )}
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs">
          <div className="y2k-glass-subtle p-3 rounded-2xl border border-white/10">
            <span className="text-white/40 block mb-1">Musical Key</span>
            <span className="font-mono-num font-bold text-base text-white">{sound.key}</span>
          </div>

          <div className="y2k-glass-subtle p-3 rounded-2xl border border-white/10">
            <span className="text-white/40 block mb-1">BPM Tempo</span>
            <span className="font-mono-num font-bold text-base text-white">{sound.bpm} BPM</span>
          </div>

          <div className="y2k-glass-subtle p-3 rounded-2xl border border-white/10">
            <span className="text-white/40 block mb-1">Duration</span>
            <span className="font-mono-num font-bold text-base text-white">{formatDuration(sound.duration)}</span>
          </div>

          <div className="y2k-glass-subtle p-3 rounded-2xl border border-white/10">
            <span className="text-white/40 block mb-1">Downloads</span>
            <span className="font-mono-num font-bold text-base text-white">{sound.downloads}</span>
          </div>
        </div>

        {/* Genres & Tags */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-white/60">Genres & Tags</span>
          <div className="flex flex-wrap gap-2">
            {sound.genre.map(g => (
              <button
                key={g}
                onClick={() => onNavigateToGenre && onNavigateToGenre(g)}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 hover:bg-[#00f0ff] hover:text-black transition-all"
              >
                {g}
              </button>
            ))}
            {sound.tags.map(t => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-full text-xs bg-white/5 text-white/70 border border-white/10"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* License clearance badge */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/70">
          <ShieldCheck className="w-5 h-5 text-[#00f0ff] shrink-0" />
          <div>
            <strong className="text-white">100% Royalty-Free License:</strong> This sound can be used in commercial and non-commercial music releases, streams, broadcast, podcasts, and game audio without attribution or royalty payments.
          </div>
        </div>
      </div>

      {/* Related Sounds */}
      {relatedSounds.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-xl text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#ff7700]" />
            Similar Sounds & Stems
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedSounds.map(rel => (
              <SoundCard
                key={rel.id}
                sound={rel}
                playlist={relatedSounds}
                onOpenDetail={onSelectRelatedSound}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
