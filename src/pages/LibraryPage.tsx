import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { SoundCard } from '../components/sound/SoundCard';
import {
  ALL_GENRES,
  ALL_INSTRUMENTS,
  ALL_TYPES,
  MUSICAL_KEYS,
  Sound,
  SortOption,
  SoundType
} from '../types';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  X
} from 'lucide-react';

interface LibraryPageProps {
  initialGenre?: string;
  initialInstrument?: string;
  initialSearchQuery?: string;
  onSelectSoundDetail?: (sound: Sound) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  initialGenre = '',
  initialInstrument = '',
  initialSearchQuery = '',
  onSelectSoundDetail
}) => {
  const { sounds } = useStore();

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedInstrument, setSelectedInstrument] = useState(initialInstrument);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [minBpm, setMinBpm] = useState<number>(60);
  const [maxBpm, setMaxBpm] = useState<number>(200);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [genreSearch, setGenreSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Sync initial props
  useEffect(() => {
    if (initialGenre) setSelectedGenre(initialGenre);
  }, [initialGenre]);

  useEffect(() => {
    if (initialInstrument) setSelectedInstrument(initialInstrument);
  }, [initialInstrument]);

  useEffect(() => {
    if (initialSearchQuery) setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  const approvedSounds = useMemo(() => {
    return sounds.filter(s => s.status === 'approved');
  }, [sounds]);

  const filteredGenresList = useMemo(() => {
    if (!genreSearch.trim()) return ALL_GENRES;
    return ALL_GENRES.filter(g => g.toLowerCase().includes(genreSearch.toLowerCase()));
  }, [genreSearch]);

  // Combined instant filter
  const filteredSounds = useMemo(() => {
    return approvedSounds.filter(sound => {
      // Text search in title or tags
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = sound.title.toLowerCase().includes(q);
        const matchesTag = sound.tags.some(t => t.toLowerCase().includes(q));
        const matchesGenre = sound.genre.some(g => g.toLowerCase().includes(q));
        const matchesInstrument = sound.instrument.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTag && !matchesGenre && !matchesInstrument) {
          return false;
        }
      }

      // Genre filter
      if (selectedGenre && !sound.genre.includes(selectedGenre)) {
        return false;
      }

      // Instrument filter
      if (selectedInstrument && sound.instrument !== selectedInstrument) {
        return false;
      }

      // Type filter
      if (selectedType && sound.type !== selectedType) {
        return false;
      }

      // Key filter
      if (selectedKey && sound.key !== selectedKey) {
        return false;
      }

      // BPM Range filter (60 - 200)
      if (sound.bpm < minBpm || sound.bpm > maxBpm) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'popular') {
        return b.downloads * 1.5 - a.downloads * 1.5;
      }
      if (sortBy === 'downloads') {
        return b.downloads - a.downloads;
      }
      return 0;
    });
  }, [
    approvedSounds,
    searchQuery,
    selectedGenre,
    selectedInstrument,
    selectedType,
    selectedKey,
    minBpm,
    maxBpm,
    sortBy
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSelectedInstrument('');
    setSelectedType('');
    setSelectedKey('');
    setMinBpm(60);
    setMaxBpm(200);
    setSortBy('newest');
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedGenre ||
    selectedInstrument ||
    selectedType ||
    selectedKey ||
    minBpm > 60 ||
    maxBpm < 200
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2">
            SoundVault Catalog
            <span className="text-xs font-mono-num font-semibold px-2.5 py-0.5 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
              {filteredSounds.length} results
            </span>
          </h1>
          <p className="text-xs text-white/60 mt-1">
            Browse all royalty-free loops, one-shots, MIDI files, and presets with live waveform preview.
          </p>
        </div>

        {/* Search input & Mobile toggle */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, tag, instrument..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-full y2k-glass border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#00f0ff]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full y2k-glass border text-xs font-bold transition-all ${
              filtersOpen || hasActiveFilters
                ? 'border-[#00f0ff] text-[#00f0ff]'
                : 'border-white/20 text-white/80'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#00f0ff]" />
            )}
          </button>

          {/* Sort selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none px-4 py-2.5 pr-8 rounded-full y2k-glass border border-white/20 text-xs font-bold text-white focus:outline-none focus:border-[#00f0ff] cursor-pointer"
            >
              <option value="newest" className="bg-[#0b0e17] text-white">Newest First</option>
              <option value="popular" className="bg-[#0b0e17] text-white">Popular</option>
              <option value="downloads" className="bg-[#0b0e17] text-white">Most Downloaded</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-white/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      <div
        className={`y2k-glass rounded-3xl p-5 border border-white/15 space-y-5 transition-all duration-200 ${
          filtersOpen ? 'block' : 'hidden lg:block'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="font-heading font-bold text-sm text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#00f0ff]" />
            Sound Filters
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-xs text-[#ff7700] hover:underline font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Searchable Scrollable Genre Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/70">
              Genre ({selectedGenre || 'All'})
            </label>
            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="Filter 90+ genres..."
                value={genreSearch}
                onChange={(e) => setGenreSearch(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#00f0ff]"
              />
              <div className="h-32 overflow-y-auto space-y-1 pr-1 bg-black/20 rounded-xl p-1.5 border border-white/5">
                <button
                  onClick={() => setSelectedGenre('')}
                  className={`w-full text-left px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    !selectedGenre ? 'bg-[#00f0ff] text-black font-bold' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  All Genres
                </button>
                {filteredGenresList.map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g === selectedGenre ? '' : g)}
                    className={`w-full text-left px-2.5 py-1 rounded-lg text-xs truncate transition-colors ${
                      selectedGenre === g ? 'bg-[#00f0ff] text-black font-bold' : 'text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Instrument & Type Filter */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-white/70 block mb-1.5">
                Instrument
              </label>
              <select
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#00f0ff]"
              >
                <option value="" className="bg-[#0b0e17]">All Instruments</option>
                {ALL_INSTRUMENTS.map(inst => (
                  <option key={inst} value={inst} className="bg-[#0b0e17]">{inst}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-white/70 block mb-1.5">
                Type
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {ALL_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(selectedType === type ? '' : type)}
                    className={`px-2 py-1.5 rounded-xl text-xs font-semibold text-center border transition-all ${
                      selectedType === type
                        ? 'bg-[#00f0ff] text-black border-[#00f0ff]'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Key Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/70 block">
              Musical Key ({selectedKey || 'Any'})
            </label>
            <div className="h-44 overflow-y-auto grid grid-cols-2 gap-1.5 pr-1 bg-black/20 rounded-xl p-1.5 border border-white/5">
              <button
                onClick={() => setSelectedKey('')}
                className={`col-span-2 text-left px-2 py-1 rounded-lg text-xs transition-colors ${
                  !selectedKey ? 'bg-[#00f0ff] text-black font-bold' : 'text-white/70 hover:bg-white/10'
                }`}
              >
                Any Key
              </button>
              {MUSICAL_KEYS.map(k => (
                <button
                  key={k}
                  onClick={() => setSelectedKey(k === selectedKey ? '' : k)}
                  className={`text-left px-2 py-1 rounded-lg text-xs font-mono-num truncate transition-colors ${
                    selectedKey === k ? 'bg-[#00f0ff] text-black font-bold' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* 4. BPM Range Slider (60 - 200) */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-white/70 mb-2">
                <span>BPM Range</span>
                <span className="font-mono-num text-[#00f0ff]">
                  {minBpm} - {maxBpm} BPM
                </span>
              </div>
              <div className="space-y-3 pt-1">
                <div>
                  <div className="text-[10px] text-white/40 mb-1">Min BPM: {minBpm}</div>
                  <input
                    type="range"
                    min="60"
                    max="200"
                    value={minBpm}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setMinBpm(Math.min(val, maxBpm));
                    }}
                    className="w-full accent-[#00f0ff] h-1.5 rounded-lg cursor-pointer bg-white/20"
                  />
                </div>
                <div>
                  <div className="text-[10px] text-white/40 mb-1">Max BPM: {maxBpm}</div>
                  <input
                    type="range"
                    min="60"
                    max="200"
                    value={maxBpm}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setMaxBpm(Math.max(val, minBpm));
                    }}
                    className="w-full accent-[#ff7700] h-1.5 rounded-lg cursor-pointer bg-white/20"
                  />
                </div>
              </div>
            </div>

            {/* Quick preset buttons */}
            <div className="pt-1">
              <span className="text-[10px] text-white/40 block mb-1.5">Common Tempos</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { label: 'Hip Hop (90)', min: 80, max: 98 },
                  { label: 'House (126)', min: 120, max: 130 },
                  { label: 'Trap (140)', min: 135, max: 150 },
                  { label: 'DnB (174)', min: 170, max: 180 }
                ].map(tempo => (
                  <button
                    key={tempo.label}
                    onClick={() => {
                      setMinBpm(tempo.min);
                      setMaxBpm(tempo.max);
                    }}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono-num text-white/70"
                  >
                    {tempo.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-white/40">Active filters:</span>
          {searchQuery && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/10 text-white border border-white/15">
              <span>"{searchQuery}"</span>
              <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => setSearchQuery('')} />
            </span>
          )}
          {selectedGenre && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30">
              <span>Genre: {selectedGenre}</span>
              <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => setSelectedGenre('')} />
            </span>
          )}
          {selectedInstrument && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#ff7700]/15 text-[#ff8c00] border border-[#ff7700]/30">
              <span>Instrument: {selectedInstrument}</span>
              <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => setSelectedInstrument('')} />
            </span>
          )}
          {selectedType && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/10 text-white border border-white/15">
              <span>Type: {selectedType}</span>
              <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => setSelectedType('')} />
            </span>
          )}
          {selectedKey && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/10 text-white border border-white/15">
              <span>Key: {selectedKey}</span>
              <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => setSelectedKey('')} />
            </span>
          )}
          {(minBpm > 60 || maxBpm < 200) && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/10 text-white border border-white/15">
              <span>BPM: {minBpm}-{maxBpm}</span>
              <X
                className="w-3.5 h-3.5 cursor-pointer"
                onClick={() => {
                  setMinBpm(60);
                  setMaxBpm(200);
                }}
              />
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-xs text-[#00f0ff] hover:underline font-semibold ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results Grid */}
      {filteredSounds.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSounds.map(sound => (
            <SoundCard
              key={sound.id}
              sound={sound}
              playlist={filteredSounds}
              onOpenDetail={onSelectSoundDetail}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="y2k-glass rounded-3xl p-12 text-center border border-white/10 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center mx-auto text-white/40">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-extrabold text-xl text-white">No sounds found</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            We couldn't find any samples matching your active filters. Try broadening your BPM range or removing specific tags.
          </p>
          <button
            onClick={resetFilters}
            className="px-6 py-2.5 rounded-full y2k-btn-primary text-xs font-bold uppercase tracking-wider"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
