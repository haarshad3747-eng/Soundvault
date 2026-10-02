import React from 'react';
import { Shield, Check, ArrowLeft, AlertCircle } from 'lucide-react';

export const UploadTermsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full y2k-glass-subtle text-xs font-semibold text-white/70 hover:text-white hover:border-[#00f0ff] transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="y2k-glass rounded-3xl p-6 sm:p-10 border border-white/20 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#ff7700]/10 border border-[#ff7700]/30 flex items-center justify-center text-[#ff7700]">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Community Upload Terms of Service
            </h1>
            <p className="text-xs text-white/60">
              Guidelines and requirements for producers sharing original sounds on SoundVault.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-white/80 leading-relaxed">
          <section className="space-y-2">
            <h3 className="font-bold text-base text-white">1. Ownership and Originality Warranty</h3>
            <p>
              By uploading any sound, sample, loop, MIDI, or preset to SoundVault, you warrant that you are the sole creator and copyright owner of the work, or have obtained all necessary licenses to publish the material under SoundVault's Royalty-Free License.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-base text-white">2. No Uncleared Copyrighted Samples</h3>
            <p>
              You may not upload uncleared samples extracted from copyrighted songs, movies, TV shows, video games, or third-party commercial sample libraries. Any infringing content will be immediately removed from the catalog.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-base text-white">3. Irrevocable Community License Grant</h3>
            <p>
              Upon moderation approval, you grant SoundVault users a perpetual, worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute the audio as part of musical compositions.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-base text-white">4. Moderation & Removal</h3>
            <p>
              SoundVault administrators reserve the right to review, approve, reject, or remove any upload that fails to meet audio quality standards, metadata accuracy, or legal compliance.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
