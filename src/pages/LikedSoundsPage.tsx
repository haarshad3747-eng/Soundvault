import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { SoundCard } from '../components/sound/SoundCard';
import { Sound } from '../types';
import { Heart, Search, Sparkles } from 'lucide-react';

interface LikedSoundsPageProps {
  onSelectSoundDetail?: (sound: Sound) => void;
  onNavigateToCatalog: () => void;
}

export const LikedSoundsPage: React.FC<LikedSoundsPageProps> = ({
  onSelectSoundDetail,
  onNavigateToCatalog
}) => {
  const { sounds, likedIds, user, setShowLoginModal } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const likedSounds = useMemo(() => {
    return sounds.filter(s => likedIds.has(s.id));
  }, [sounds, likedIds]);

  const filteredSounds = useMemo(() => {
    if (!searchQuery.trim()) return likedSounds;
    const q = searchQuery.toLowerCase();
    return likedSounds.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        s.instrument.toLowerCase().includes(q) ||
        s.genre.some(g => g.toLowerCase().includes(q))
    );
  }, [likedSounds, searchQuery]);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2">
            Liked Sounds ({likedSounds.length})
            <Heart className="w-5 h-5 text-[#ff3b30] fill-[#ff3b30]" />
          </h1>
          <p className="text-xs text-white/60 mt-1">
            All samples and stems you've favorited with the heart button.
          </p>
        </div>

        {likedSounds.length > 0 && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search likes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full y2k-glass-subtle border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#00f0ff]"
            />
          </div>
        )}
      </div>

      {!user ? (
        <div className="y2k-glass rounded-3xl p-12 text-center border border-white/15 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-[#ff3b30]/10 border border-[#ff3b30]/30 flex items-center justify-center mx-auto text-[#ff3b30]">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <h3 className="font-heading font-extrabold text-xl text-white">Log in to like sounds</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Sign in with Google to sync your favorite sounds across sessions.
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
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-extrabold text-xl text-white">No liked sounds yet</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Hit the heart icon on any sound card or in the mini player to save your favorite stems here.
          </p>
          <button
            onClick={onNavigateToCatalog}
            className="px-6 py-2.5 rounded-full y2k-btn-primary text-xs font-bold uppercase tracking-wider"
          >
            Find Sounds
          </button>
        </div>
      )}
    </div>
  );
};
