import React from 'react';
import { ArrowLeft, ShieldCheck, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface LicensePageProps {
  onBack: () => void;
}

export const LicensePage: React.FC<LicensePageProps> = ({ onBack }) => {
  return (
    <div className="space-y-8 pb-24 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full y2k-glass-subtle text-xs font-semibold text-white/70 hover:text-white hover:border-[#00f0ff] transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="y2k-glass rounded-3xl p-6 sm:p-10 border border-white/20 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#00f0ff]/20 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff]">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              SoundVault Royalty-Free Master License
            </h1>
            <p className="text-xs text-white/60">
              Clear, transparent, zero-royalty license for music producers and sound designers.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-sm text-white/80 leading-relaxed space-y-2">
          <p>
            All audio files, samples, loops, one-shots, MIDI files, and presets available on SoundVault are <strong>100% Royalty-Free</strong> for both commercial and personal use.
          </p>
          <p>
            When you download a sound from SoundVault, you are granted a non-exclusive, worldwide, perpetual license to use, modify, edit, reproduce, and distribute the sound within your musical compositions, video productions, multimedia projects, and broadcasts.
          </p>
        </div>

        {/* Permitted vs Prohibited */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Permitted */}
          <div className="p-5 rounded-2xl bg-[#10b981]/5 border border-[#10b981]/25 space-y-3">
            <h3 className="font-bold text-sm text-[#10b981] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              What You CAN Do:
            </h3>
            <ul className="space-y-2 text-xs text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-[#10b981] font-bold">✓</span>
                Use in commercial music releases (Spotify, Apple Music, YouTube Music, Vinyl, CD).
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#10b981] font-bold">✓</span>
                Sell instrumental beats on BeatStars, Airbit, or direct to artists.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#10b981] font-bold">✓</span>
                Use in TV, radio, film sync, video games, trailers, and advertisements.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#10b981] font-bold">✓</span>
                Keep 100% of your master recording and publishing royalties. No splits required.
              </li>
            </ul>
          </div>

          {/* Prohibited */}
          <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/25 space-y-3">
            <h3 className="font-bold text-sm text-red-400 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              What You CANNOT Do:
            </h3>
            <ul className="space-y-2 text-xs text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✗</span>
                Re-distribute or re-sell individual samples as a sample pack, sound library, or virtual instrument.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✗</span>
                Upload raw, isolated audio stems to stock audio libraries or file-sharing websites.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✗</span>
                Claim copyright or file Content ID over isolated, un-modified SoundVault sounds.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
