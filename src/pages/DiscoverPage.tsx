import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { SoundCard } from '../components/sound/SoundCard';
import { POPULAR_GENRES, ALL_INSTRUMENTS, Sound, Pack } from '../types';
import heroImg from '../assets/images/y2k_hero_vault_1790972163673.jpg';
import {
  Search,
  Mic,
  Disc3,
  Layers,
  Download,
  Flame,
  ChevronRight,
  Sparkles,
  Music,
  ArrowRight
} from 'lucide-react';

interface DiscoverPageProps {
  onSelectGenre: (genre: string) => void;
  onSelectInstrument: (instrument: string) => void;
  onSelectPack: (pack: Pack) => void;
  onSelectSoundDetail: (sound: Sound) => void;
  onNavigate: (tab: string) => void;
  onOpenAudioSearch: () => void;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({
  onSelectGenre,
  onSelectInstrument,
  onSelectPack,
  onSelectSoundDetail,
  onNavigate,
  onOpenAudioSearch
}) => {
  const { sounds, packs, soundsCount, packsCount, totalDownloads } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const approvedSounds = sounds.filter(s => s.status === 'approved');
  const recentSounds = [...approvedSounds].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 8);

  const popularSounds = [...approvedSounds].sort((a, b) => b.downloads - a.downloads).slice(0, 6);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSelectGenre(''); // Clear genre if any
      onNavigate(`library?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      onNavigate('library');
    }
  };

  return (
    <div className="space-y-12 pb-24">
      
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* Background Image with Y2K holographic overlay */}
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="SoundVault Hero"
            className="w-full h-full object-cover object-center scale-105 filter brightness-75 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070910] via-[#070910]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-transparent to-black/30" />
          {/* Subtle Cyber Grid */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'linear-gradient(to right, #00f0ff 1px, transparent 1px), linear-gradient(to bottom, #00f0ff 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl p-6 sm:p-10 lg:p-14 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold text-[#00f0ff] shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#ff7700]" />
            <span>100% Free & Royalty-Free Sound Catalog for Producers</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]">
            Unlocked Audio. <br />
            <span className="y2k-holo-text">Pure Sonic Energy.</span>
          </h1>

          <p className="text-sm sm:text-base text-white/70 max-w-xl leading-relaxed">
            Download curated samples, 808s, breakbeats, MIDI, and synth patches. Live interactive spectral waveforms and in-browser AI audio search.
          </p>

          {/* Search Bar + Audio Search Mic */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 p-1.5 rounded-full y2k-glass border border-white/25 shadow-[0_10px_30px_rgba(0,240,255,0.2)] max-w-xl"
          >
            <div className="flex items-center gap-2.5 flex-1 pl-4">
              <Search className="w-5 h-5 text-white/40 shrink-0" />
              <input
                type="text"
                placeholder="Search by genre, BPM, key, 808, breakbeat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={onOpenAudioSearch}
              className="p-2.5 rounded-full bg-white/10 hover:bg-[#00f0ff] text-white/80 hover:text-black transition-all shrink-0"
              title="Search by Audio (Record or Upload)"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-full y2k-btn-primary text-xs uppercase tracking-wider font-extrabold shrink-0"
            >
              Browse
            </button>
          </form>

          {/* Live Real Database Stats (NO FAKE NUMBERS) */}
          <div className="pt-2 grid grid-cols-3 gap-3 max-w-lg">
            <div className="y2k-glass-subtle p-3 rounded-2xl border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-white/50 mb-0.5">
                <Music className="w-3.5 h-3.5 text-[#00f0ff]" />
                <span>Sounds</span>
              </div>
              <div className="font-mono-num font-extrabold text-lg sm:text-xl text-white">
                {soundsCount}
              </div>
            </div>

            <div className="y2k-glass-subtle p-3 rounded-2xl border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-white/50 mb-0.5">
                <Layers className="w-3.5 h-3.5 text-[#ff7700]" />
                <span>Packs</span>
              </div>
              <div className="font-mono-num font-extrabold text-lg sm:text-xl text-white">
                {packsCount}
              </div>
            </div>

            <div className="y2k-glass-subtle p-3 rounded-2xl border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-white/50 mb-0.5">
                <Download className="w-3.5 h-3.5 text-[#10b981]" />
                <span>Downloads</span>
              </div>
              <div className="font-mono-num font-extrabold text-lg sm:text-xl text-white">
                {totalDownloads.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Genres Row + "View all genres" button */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00f0ff]" />
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
              Popular Genres
            </h2>
          </div>
          <button
            onClick={() => onNavigate('genres')}
            className="flex items-center gap-1 text-xs font-bold text-[#00f0ff] hover:underline"
          >
            <span>View all genres (90+)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {POPULAR_GENRES.map(genre => {
            const count = approvedSounds.filter(s => s.genre.includes(genre)).length;
            return (
              <div
                key={genre}
                onClick={() => {
                  onSelectGenre(genre);
                  onNavigate('library');
                }}
                className="group y2k-card-bubble p-4 cursor-pointer hover:border-[#00f0ff] transition-all relative overflow-hidden"
              >
                <div className="relative z-10 flex flex-col justify-between h-20">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/80 group-hover:bg-[#00f0ff] group-hover:text-black transition-colors">
                    <Disc3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-[#00f0ff] transition-colors truncate">
                      {genre}
                    </h4>
                    <span className="text-[11px] font-mono-num text-white/40">
                      {count} sounds
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Instrument Categories Row */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-[#ff7700]" />
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
              Browse by Instrument
            </h2>
          </div>
          <button
            onClick={() => onNavigate('library')}
            className="flex items-center gap-1 text-xs font-bold text-white/60 hover:text-white"
          >
            <span>See all in Library</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {ALL_INSTRUMENTS.map(inst => (
            <button
              key={inst}
              onClick={() => {
                onSelectInstrument(inst);
                onNavigate('library');
              }}
              className="shrink-0 px-4 py-2.5 rounded-2xl y2k-glass-subtle border border-white/10 hover:border-[#ff7700] hover:bg-white/10 text-xs font-bold text-white transition-all flex items-center gap-2 group"
            >
              <span className="w-2 h-2 rounded-full bg-[#ff7700] group-hover:scale-125 transition-transform" />
              <span>{inst}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Packs Showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#a855f7]" />
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
              Featured Sample Packs
            </h2>
          </div>
          <button
            onClick={() => onNavigate('packs')}
            className="flex items-center gap-1 text-xs font-bold text-[#00f0ff] hover:underline"
          >
            <span>Explore all packs</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {packs.slice(0, 3).map(pack => (
            <div
              key={pack.id}
              onClick={() => onSelectPack(pack)}
              className="group y2k-card-bubble overflow-hidden cursor-pointer flex flex-col justify-between transition-all"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                <img
                  src={pack.coverImage}
                  alt={pack.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f1b] via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/70 backdrop-blur-md text-[#00f0ff] border border-white/20">
                  {pack.genre}
                </span>
                <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-mono-num font-bold bg-black/80 backdrop-blur-md text-white border border-white/10">
                  {pack.soundCount} Stems
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="font-heading font-bold text-lg text-white group-hover:text-[#00f0ff] transition-colors truncate">
                  {pack.title}
                </h4>
                <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                  {pack.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-white/50">
                  <div className="flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-[#ff7700]" />
                    <span className="font-mono-num">{pack.downloadCount} downloads</span>
                  </div>
                  <span className="flex items-center gap-1 font-semibold text-[#00f0ff] group-hover:translate-x-1 transition-transform">
                    View Pack <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Sounds Catalog Row */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#ff7700]" />
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
              New In SoundVault
            </h2>
          </div>
          <button
            onClick={() => onNavigate('library')}
            className="flex items-center gap-1 text-xs font-bold text-white/60 hover:text-white"
          >
            <span>View All Library</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentSounds.map(sound => (
            <SoundCard
              key={sound.id}
              sound={sound}
              playlist={recentSounds}
              onOpenDetail={onSelectSoundDetail}
            />
          ))}
        </div>
      </section>

      {/* Most Downloaded Bestsellers Row */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[#10b981]" />
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
              Most Downloaded Producer Favorites
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularSounds.map(sound => (
            <SoundCard
              key={sound.id}
              sound={sound}
              playlist={popularSounds}
              onOpenDetail={onSelectSoundDetail}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
