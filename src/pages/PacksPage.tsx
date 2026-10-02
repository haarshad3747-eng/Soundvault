import React from 'react';
import { useStore } from '../context/StoreContext';
import { Pack } from '../types';
import { Disc, Download, ArrowRight, Sparkles } from 'lucide-react';

interface PacksPageProps {
  onSelectPack: (pack: Pack) => void;
}

export const PacksPage: React.FC<PacksPageProps> = ({ onSelectPack }) => {
  const { packs } = useStore();

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2">
          Sample Packs & Toolkits ({packs.length})
          <Sparkles className="w-5 h-5 text-[#a855f7]" />
        </h1>
        <p className="text-xs text-white/60 mt-1">
          Hand-crafted sonic toolkits packaged for electronic, trap, hip hop, garage, ambient, and dance producers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {packs.map(pack => (
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

            <div className="p-5 space-y-3">
              <h4 className="font-heading font-bold text-lg text-white group-hover:text-[#00f0ff] transition-colors">
                {pack.title}
              </h4>
              <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                {pack.description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {pack.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/60 border border-white/10"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-white/50">
                <div className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#ff7700]" />
                  <span className="font-mono-num">{pack.downloadCount} downloads</span>
                </div>
                <span className="flex items-center gap-1 font-semibold text-[#00f0ff] group-hover:translate-x-1 transition-transform">
                  Open Pack <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
