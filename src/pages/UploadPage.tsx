import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { ALL_GENRES, ALL_INSTRUMENTS, ALL_TYPES, MUSICAL_KEYS, SoundType } from '../types';
import { analyzeAudioBlob } from '../utils/audioFeatureExtractor';
import {
  Upload,
  Music,
  CheckCircle,
  Clock,
  XCircle,
  FileAudio,
  Sparkles,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

interface UploadPageProps {
  onNavigateToLicense: () => void;
  onNavigateToTerms: () => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({
  onNavigateToLicense,
  onNavigateToTerms
}) => {
  const { user, sounds, uploadSound, addToast, setShowLoginModal } = useStore();

  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState<string>('Trap');
  const [secondaryGenre, setSecondaryGenre] = useState<string>('');
  const [instrument, setInstrument] = useState<string>('808');
  const [type, setType] = useState<SoundType>('One-shot');
  const [key, setKey] = useState<string>('C min');
  const [bpm, setBpm] = useState<number>(140);
  const [tagsInput, setTagsInput] = useState('');
  const [duration, setDuration] = useState<number>(15);
  const [featureVector, setFeatureVector] = useState<number[]>([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rightsAgreed, setRightsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter user's uploads
  const myUploads = sounds.filter(s => s.source === 'user' && s.uploaded_by_email === user?.email);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      addToast('File exceeds 10 MB limit', 'error');
      return;
    }

    setFile(selectedFile);
    // Suggest title from filename
    const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    if (!title) setTitle(cleanName);

    // Auto-detect BPM and audio properties via Web Audio API
    if (selectedFile.type.includes('audio') || selectedFile.name.endsWith('.wav') || selectedFile.name.endsWith('.mp3')) {
      setIsAnalyzing(true);
      try {
        const { bpm: detectedBpm, duration: dur, featureVector: vec } = await analyzeAudioBlob(selectedFile);
        setBpm(detectedBpm);
        setDuration(dur);
        setFeatureVector(vec);
        const url = URL.createObjectURL(selectedFile);
        setAudioUrl(url);
        addToast(`Audio analyzed: auto-detected ~${detectedBpm} BPM (${Math.round(dur)}s)`, 'success');
      } catch (err) {
        console.warn('Audio analysis notice:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!file) {
      addToast('Please select an audio file (WAV, MP3, or MIDI)', 'error');
      return;
    }

    if (!title.trim()) {
      addToast('Please provide a sound title', 'error');
      return;
    }

    if (!rightsAgreed) {
      addToast('You must confirm ownership and release under royalty-free terms', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const genres = [genre];
      if (secondaryGenre && secondaryGenre !== genre) {
        genres.push(secondaryGenre);
      }

      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await uploadSound({
        title: title.trim(),
        audio: audioUrl,
        genre: genres,
        instrument,
        type,
        key,
        bpm,
        tags: tags.length > 0 ? tags : [instrument, genre],
        duration: Math.max(10, Math.min(60, duration)),
        uploaded_by: user.displayName,
        uploaded_by_email: user.email,
        feature_vector: featureVector
      });

      // Reset form
      setFile(null);
      setTitle('');
      setTagsInput('');
      setRightsAgreed(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pb-24 max-w-4xl mx-auto">
      
      {/* Page Title */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2">
          Upload Sounds & Stems
          <Sparkles className="w-5 h-5 text-[#ff7700]" />
        </h1>
        <p className="text-xs text-white/60 mt-1">
          Share your high quality samples with the producer community. All uploads undergo verification before catalog publication.
        </p>
      </div>

      {/* Upload Form */}
      {!user ? (
        <div className="y2k-glass rounded-3xl p-12 text-center border border-white/15 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center mx-auto text-[#00f0ff]">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-extrabold text-xl text-white">Sign In Required</h3>
          <p className="text-xs text-white/60 leading-relaxed max-w-sm mx-auto">
            You must be signed in to upload sounds to SoundVault and manage your submissions.
          </p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-6 py-2.5 rounded-full y2k-btn-primary text-xs font-bold uppercase tracking-wider"
          >
            Sign In with Google
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="y2k-glass rounded-3xl p-6 sm:p-8 border border-white/20 space-y-6">
          
          {/* File Dropzone */}
          <div>
            <label className="text-xs font-bold text-white/80 block mb-2">
              Audio File (WAV, MP3, or MIDI • Max 10 MB) <span className="text-[#ff7700]">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                file
                  ? 'border-[#00f0ff] bg-[#00f0ff]/5'
                  : 'border-white/20 hover:border-[#00f0ff]/50 bg-black/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".wav,.mp3,.mid,.midi,audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center gap-3 text-center">
                  <FileAudio className="w-8 h-8 text-[#00f0ff]" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">{file.name}</p>
                    <p className="text-xs text-white/50">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {isAnalyzing ? 'Analyzing BPM...' : `${bpm} BPM`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <Upload className="w-8 h-8 text-[#00f0ff] mx-auto" />
                  <p className="text-sm font-semibold text-white">Click or drag & drop audio here</p>
                  <p className="text-xs text-white/40">Studio quality 24-bit/44.1kHz WAV preferred</p>
                </div>
              )}
            </div>
          </div>

          {/* Title & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-white/80 block mb-1.5">
                Sound Title <span className="text-[#ff7700]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Chrome Reese Bassline 140"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#00f0ff]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white/80 block mb-1.5">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SoundType)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
              >
                {ALL_TYPES.map(t => (
                  <option key={t} value={t} className="bg-[#0b0e17]">{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Instrument, Primary Genre, Secondary Genre */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-white/80 block mb-1.5">
                Instrument
              </label>
              <select
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
              >
                {ALL_INSTRUMENTS.map(inst => (
                  <option key={inst} value={inst} className="bg-[#0b0e17]">{inst}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-white/80 block mb-1.5">
                Primary Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
              >
                {ALL_GENRES.map(g => (
                  <option key={g} value={g} className="bg-[#0b0e17]">{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-white/80 block mb-1.5">
                Secondary Genre (Optional)
              </label>
              <select
                value={secondaryGenre}
                onChange={(e) => setSecondaryGenre(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
              >
                <option value="" className="bg-[#0b0e17]">None</option>
                {ALL_GENRES.map(g => (
                  <option key={g} value={g} className="bg-[#0b0e17]">{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Key & BPM (auto-detected, editable) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-white/80 block mb-1.5">
                Key
              </label>
              <select
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
              >
                {MUSICAL_KEYS.map(k => (
                  <option key={k} value={k} className="bg-[#0b0e17]">{k}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-white/80">
                  BPM (Tempo)
                </label>
                {isAnalyzing && (
                  <span className="text-[11px] text-[#00f0ff] animate-pulse">Auto-detecting...</span>
                )}
              </div>
              <input
                type="number"
                min="60"
                max="220"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm font-mono-num text-white focus:outline-none focus:border-[#00f0ff]"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-bold text-white/80 block mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="punchy, sub, glide, distorted, vintage"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#00f0ff]"
            />
          </div>

          {/* Required Copyright Checkbox */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rightsAgreed}
                onChange={(e) => setRightsAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded accent-[#00f0ff] cursor-pointer"
              />
              <span className="text-xs text-white/80 leading-relaxed">
                <strong className="text-white">Required:</strong> I own the full rights to this sound and release it 100% royalty-free for commercial and personal music production under the SoundVault Community License.
              </span>
            </label>

            <div className="flex items-center gap-4 text-[11px] text-[#00f0ff] pt-1 pl-7">
              <button
                type="button"
                onClick={onNavigateToLicense}
                className="hover:underline"
              >
                Royalty-Free License Details
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={onNavigateToTerms}
                className="hover:underline"
              >
                Upload Terms of Service
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !rightsAgreed || !file}
            className="w-full py-3.5 rounded-full y2k-btn-primary font-bold text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? 'Uploading to Vault...' : 'Submit Sound for Moderation'}
          </button>
        </form>
      )}

      {/* My Uploads Section */}
      {user && (
        <div className="space-y-4">
          <h2 className="font-heading font-extrabold text-xl text-white tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#00f0ff]" />
            My Uploads ({myUploads.length})
          </h2>

          {myUploads.length > 0 ? (
            <div className="space-y-2.5">
              {myUploads.map(upload => (
                <div
                  key={upload.id}
                  className="y2k-glass-subtle p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/80 shrink-0">
                      <Music className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-white truncate">{upload.title}</h4>
                      <p className="text-xs text-white/50">
                        {upload.instrument} • {upload.key} • {upload.bpm} BPM
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {upload.status === 'pending' && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Moderation</span>
                      </span>
                    )}
                    {upload.status === 'approved' && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approved & Live</span>
                      </span>
                    )}
                    {upload.status === 'rejected' && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Rejected</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-white/50">
              You haven't uploaded any sounds yet. Fill out the form above to submit your first sample.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
