import React, { useState, useMemo } from 'react';
import { ALL_GENRES } from '../types';
import { useStore } from '../context/StoreContext';
import { Search, Disc3, Sparkles, ArrowLeft } from 'lucide-react';

interface AllGenresPageProps {
  onSelectGenre: (genre: string) => void;
  onBack: () => void;
}

export const AllGenresPage: React.FC<AllGenresPageProps> = ({ onSelectGenre, onBack }) => {
  const { sounds } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const approvedSounds = sounds.filter(s => s.status === 'approved');

  const filteredGenres = useMemo(() => {
    if (!searchTerm.trim()) return ALL_GENRES;
    const term = searchTerm.toLowerCase();
    return ALL_GENRES.filter(g => g.toLowerCase().includes(term));
  }, [searchTerm]);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2">
              All Genres ({ALL_GENRES.length})
              <Sparkles className="w-4 h-4 text-[#00f0ff]" />
            </h1>
            <p className="text-xs text-white/60">
              Browse the entire catalog of electronic, urban, acoustic, and underground soundscapes.
            </p>
          </div>
        </div>

        {/* Filter Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search genre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full y2k-glass-subtle border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#00f0ff]"
          />
        </div>
      </div>

      {/* Grid of All 90+ Genres as Y2K Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredGenres.map(genre => {
          const count = approvedSounds.filter(s => s.genre.includes(genre)).length;
          return (
            <div
              key={genre}
              onClick={() => onSelectGenre(genre)}
              className="group y2k-card-bubble p-4 cursor-pointer hover:border-[#00f0ff] transition-all relative overflow-hidden"
            >
              <div className="flex flex-col justify-between h-20">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/80 group-hover:bg-[#00f0ff] group-hover:text-black transition-colors">
                  <Disc3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-[#00f0ff] transition-colors truncate">
                    {genre}
                  </h4>
                  <span className="text-[11px] font-mono-num text-white/40">
                    {count} {count === 1 ? 'sound' : 'sounds'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGenres.length === 0 && (
        <div className="text-center py-16 y2k-glass rounded-3xl border border-white/10 space-y-2">
          <p className="text-base text-white/70 font-semibold">No genres match "{searchTerm}"</p>
          <p className="text-xs text-white/40">Try searching for house, dnb, ambient, or trap</p>
        </div>
      )}
    </div>
  );
};
