import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { SoundCard } from '../components/sound/SoundCard';
import { Sound } from '../types';
import { Bookmark, Search, FolderPlus, Sparkles } from 'lucide-react';

interface MyLibraryPageProps {
  onSelectSoundDetail?: (sound: Sound) => void;
  onNavigateToCatalog: () => void;
}

export const MyLibraryPage: React.FC<MyLibraryPageProps> = ({
  onSelectSoundDetail,
  onNavigateToCatalog
}) => {
  const { sounds, myLibraryIds, user, setShowLoginModal } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const librarySounds = useMemo(() => {
    return sounds.filter(s => myLibraryIds.has(s.id));
  }, [sounds, myLibraryIds]);

  const filteredSounds = useMemo(() => {
    if (!searchQuery.trim()) return librarySounds;
    const q = searchQuery.toLowerCase();
    return librarySounds.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        s.instrument.toLowerCase().includes(q) ||
        s.genre.some(g => g.toLowerCase().includes(q))
    );
  }, [librarySounds, searchQuery]);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2">
            My Sound Vault ({librarySounds.length})
            <Bookmark className="w-5 h-5 text-[#00f0ff] fill-[#00f0ff]" />
          </h1>
          <p className="text-xs text-white/60 mt-1">
            Your personal saved curation of loops, one-shots, and stems ready for production.
          </p>
        </div>

        {librarySounds.length > 0 && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search saved library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full y2k-glass-subtle border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#00f0ff]"
            />
          </div>
        )}
      </div>

      {!user ? (
        <div className="y2k-glass rounded-3xl p-12 text-center border border-white/15 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center mx-auto text-[#00f0ff]">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-extrabold text-xl text-white">Log in to save sounds</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Create your personalized library of royalty-free samples and access them anywhere.
          </p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-6 py-2.5 rounded-full y2k-btn-primary text-xs font-bold uppercase tracking-wider"
          >
            Sign In with Google
          </button>
        </div>
      ) : filteredSounds.length > 0 ? (
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
        <div className="y2k-glass rounded-3xl p-12 text-center border border-white/10 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto text-white/40">
            <FolderPlus className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-extrabold text-xl text-white">Your vault is empty</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Browse the catalog and tap the "⋮" menu on any sound to save it directly into your library.
          </p>
          <button
            onClick={onNavigateToCatalog}
            className="px-6 py-2.5 rounded-full y2k-btn-primary text-xs font-bold uppercase tracking-wider"
          >
            Explore Sounds
          </button>
        </div>
      )}
    </div>
  );
};
