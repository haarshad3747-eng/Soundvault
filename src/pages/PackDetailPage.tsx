import React from 'react';
import { Pack, Sound } from '../types';
import { useStore } from '../context/StoreContext';
import { SoundCard } from '../components/sound/SoundCard';
import { ArrowLeft, Download, Disc3, ShieldCheck, Sparkles } from 'lucide-react';

interface PackDetailPageProps {
  pack: Pack;
  onBack: () => void;
  onSelectSoundDetail?: (sound: Sound) => void;
}

export const PackDetailPage: React.FC<PackDetailPageProps> = ({
  pack,
  onBack,
  onSelectSoundDetail
}) => {
  const { sounds, recordDownload, user, addToast } = useStore();

  const packSounds = sounds.filter(s => s.pack_id === pack.id && s.status === 'approved');

  const handleDownloadAll = async () => {
    if (!user) {
      addToast('Please sign in to download sounds', 'info');
      return;
    }
    addToast(`Queuing ${packSounds.length} sounds for pack "${pack.title}"...`, 'info');
    for (const sound of packSounds) {
      await recordDownload(sound);
    }
    addToast(`Successfully downloaded all stems from ${pack.title}!`, 'success');
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full y2k-glass-subtle text-xs font-semibold text-white/70 hover:text-white hover:border-[#00f0ff] transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Packs</span>
      </button>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-white/20 y2k-glass p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-48 sm:w-60 aspect-square rounded-2xl overflow-hidden shadow-2xl shrink-0 border border-white/20">
          <img
            src={pack.coverImage}
            alt={pack.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-[#00f0ff] border border-[#00f0ff]/30">
            {pack.genre}
          </div>
        </div>

        <div className="space-y-4 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#00f0ff] border border-white/15">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SoundVault Curated Pack</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            {pack.title}
          </h1>

          <p className="text-sm text-white/70 leading-relaxed max-w-2xl">
            {pack.description}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {pack.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/40 text-white/80 border border-white/10"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-2 px-6 py-3 rounded-full y2k-btn-accent text-xs uppercase tracking-wider font-extrabold shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Download All Stems ({packSounds.length})</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <ShieldCheck className="w-4 h-4 text-[#00f0ff]" />
              <span>100% Royalty-Free</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sounds inside pack */}
      <div className="space-y-4">
        <h3 className="font-heading font-bold text-xl text-white tracking-tight flex items-center gap-2">
          <Disc3 className="w-5 h-5 text-[#00f0ff]" />
          Sounds in this Pack ({packSounds.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {packSounds.map(sound => (
            <SoundCard
              key={sound.id}
              sound={sound}
              playlist={packSounds}
              onOpenDetail={onSelectSoundDetail}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
