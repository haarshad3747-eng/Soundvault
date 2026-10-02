import React from 'react';
import { ArrowLeft, Shield, FileText, CheckCircle2 } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
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
          <div className="w-12 h-12 rounded-2xl bg-[#ff7700]/20 border border-[#ff7700]/40 flex items-center justify-center text-[#ff7700]">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Community Sound Upload Terms
            </h1>
            <p className="text-xs text-white/60">
              Guidelines and legal warranty required when uploading sounds to SoundVault.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-white/80 leading-relaxed">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h3 className="font-bold text-sm text-white">1. Warranty of Originality</h3>
            <p>
              By uploading any sound, sample, recording, MIDI data, or preset to SoundVault, you warrant and represent that:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-white/70">
              <li>You are the sole author and copyright owner of the uploaded work, or have obtained explicit written authorization.</li>
              <li>The audio does not contain unauthorized samples from copyrighted commercial records, films, television broadcasts, or video games.</li>
              <li>The material does not infringe upon any intellectual property rights, trademarks, or privacy rights of any third party.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h3 className="font-bold text-sm text-white">2. Grant of Royalty-Free Community License</h3>
            <p>
              You grant SoundVault and all SoundVault users a perpetual, irrevocable, worldwide, royalty-free license to use, reproduce, modify, and distribute your sound within musical and multimedia creations. You retain ownership of your original sound files.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h3 className="font-bold text-sm text-white">3. Moderation & Removal</h3>
            <p>
              SoundVault administrators reserve the unconditional right to approve, reject, or remove any sound from the catalog at any time if it fails to meet fidelity standards or if copyright ownership is contested.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
