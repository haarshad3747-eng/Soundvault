import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { Sound, SoundType } from '../types';
import {
  Shield,
  Check,
  X,
  Play,
  Pause,
  Upload,
  Layers,
  Sparkles,
  AlertCircle,
  FileAudio,
  Info
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { sounds, approveSound, rejectSound, bulkUploadAdmin, addToast } = useStore();
  const { currentSound, isPlaying, playSound, togglePlayPause } = useAudioPlayer();

  const [bulkInput, setBulkInput] = useState(
    `Trap_808_140bpm_Cmin.wav\nHouse_Kick_126bpm_Amaj.wav\nBreaks_Amen_174bpm_Fmin.wav\nAmbient_Pad_90bpm_Dmaj.wav\nAcid_303_138bpm_Gmin.wav`
  );
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  const pendingSounds = sounds.filter(s => s.status === 'pending');

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkInput.trim()) return;

    setIsProcessingBulk(true);
    const lines = bulkInput
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const generatedSounds: Sound[] = [];

    lines.forEach((line, idx) => {
      // Filename parser e.g. "Trap_808_140bpm_Cmin.wav"
      const clean = line.replace(/\.[^/.]+$/, '');
      const parts = clean.split('_');

      let parsedGenre = 'Trap';
      let parsedInst = '808';
      let parsedBpm = 130;
      let parsedKey = 'C min';

      if (parts.length >= 1) parsedGenre = parts[0];
      if (parts.length >= 2) parsedInst = parts[1];
      if (parts.length >= 3) {
        const bpmMatch = parts[2].match(/\d+/);
        if (bpmMatch) parsedBpm = parseInt(bpmMatch[0]);
      }
      if (parts.length >= 4) {
        const keyRaw = parts[3];
        if (keyRaw.toLowerCase().includes('min')) {
          parsedKey = `${keyRaw.replace(/min/i, '')} min`;
        } else if (keyRaw.toLowerCase().includes('maj')) {
          parsedKey = `${keyRaw.replace(/maj/i, '')} maj`;
        }
      }

      const newSnd: Sound = {
        id: `bulk-${Date.now()}-${idx}`,
        title: clean.replace(/_/g, ' '),
        audio: '',
        genre: [parsedGenre],
        instrument: parsedInst,
        type: clean.toLowerCase().includes('loop') ? 'Loop' : 'One-shot',
        key: parsedKey,
        bpm: parsedBpm,
        tags: [parsedGenre, parsedInst, `${parsedBpm}bpm`],
        duration: clean.toLowerCase().includes('loop') ? 32 : 12,
        downloads: 0,
        source: 'admin',
        status: 'approved',
        feature_vector: [0.7, 0.4, 0.5, 0.6, 0.4, parsedBpm / 200, 0.6, 0.5],
        created_at: new Date().toISOString()
      };

      generatedSounds.push(newSnd);
    });

    bulkUploadAdmin(generatedSounds);
    setIsProcessingBulk(false);
    setBulkInput('');
    addToast(`Successfully parsed and published ${generatedSounds.length} sounds from filenames!`, 'success');
  };

  return (
    <div className="space-y-10 pb-24 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 y2k-glass rounded-3xl border border-[#ff7700]/30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#ff7700]/20 border border-[#ff7700]/40 flex items-center justify-center text-[#ff7700]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-white tracking-tight flex items-center gap-2">
              Admin Moderation & Bulk Tools
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff7700] text-black">
                Authorized
              </span>
            </h1>
            <p className="text-xs text-white/60">
              Review community sound submissions and bulk generate catalog items from filenames.
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-black/40 border border-white/10 text-xs text-white/70 flex items-center gap-2">
          <Info className="w-4 h-4 text-[#00f0ff] shrink-0" />
          <span>Uploaded audio is preserved for the active session.</span>
        </div>
      </div>

      {/* Moderation Queue */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#ff7700]" />
            <h2 className="font-heading font-bold text-xl text-white tracking-tight">
              Sound Moderation Queue ({pendingSounds.length} Pending)
            </h2>
          </div>
        </div>

        {pendingSounds.length > 0 ? (
          <div className="space-y-3">
            {pendingSounds.map(sound => {
              const isCurrent = currentSound?.id === sound.id;
              const isCurrentlyPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={sound.id}
                  className="y2k-glass p-4 rounded-2xl border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/30 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => {
                        if (isCurrent) {
                          togglePlayPause();
                        } else {
                          playSound(sound);
                        }
                      }}
                      className="w-10 h-10 rounded-full bg-[#00f0ff] text-black flex items-center justify-center shrink-0 shadow-md hover:scale-105 transition-transform"
                    >
                      {isCurrentlyPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold text-sm text-white truncate">{sound.title}</h4>
                        <span className="px-2 py-0.2 rounded-full text-[10px] bg-white/10 text-white/70">
                          {sound.type}
                        </span>
                      </div>
                      <p className="text-xs text-white/50">
                        {sound.instrument} • {sound.genre.join(', ')} • {sound.key} • {sound.bpm} BPM • By {sound.uploaded_by || 'User'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => approveSound(sound.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#10b981] text-black hover:bg-[#34d399] font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => rejectSound(sound.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40 font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="y2k-glass-subtle p-8 rounded-3xl border border-white/10 text-center space-y-2">
            <Check className="w-8 h-8 text-[#10b981] mx-auto" />
            <h4 className="font-bold text-white text-base">Moderation Queue Clear</h4>
            <p className="text-xs text-white/50">All community submissions have been approved or reviewed.</p>
          </div>
        )}
      </section>

      {/* Bulk Upload Filename Parser */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#00f0ff]" />
          <h2 className="font-heading font-bold text-xl text-white tracking-tight">
            Bulk Filename Importer
          </h2>
        </div>

        <form onSubmit={handleBulkSubmit} className="y2k-glass p-6 sm:p-8 rounded-3xl border border-white/15 space-y-4">
          <div>
            <label className="text-xs font-bold text-white/80 block mb-1.5">
              Paste filenames (one per line) in standard format: <code className="text-[#00f0ff] font-mono-num">Genre_Instrument_140bpm_Key.wav</code>
            </label>
            <textarea
              rows={6}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="Trap_808_140bpm_Cmin.wav&#10;House_Kick_126bpm_Amaj.wav&#10;Breaks_Amen_174bpm_Fmin.wav"
              className="w-full p-4 rounded-2xl bg-black/40 border border-white/15 text-xs font-mono-num text-white placeholder-white/40 focus:outline-none focus:border-[#00f0ff]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-white/50">
              Each line creates an approved sound with synthesized high-fidelity audio stems and features.
            </span>

            <button
              type="submit"
              disabled={isProcessingBulk || !bulkInput.trim()}
              className="px-6 py-2.5 rounded-full y2k-btn-primary font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition-all"
            >
              {isProcessingBulk ? 'Processing...' : 'Bulk Import to Vault'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
