import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { analyzeAudioBlob, searchSoundsByFeatureVector, AudioSearchResult } from '../../utils/audioFeatureExtractor';
import { SoundCard } from '../sound/SoundCard';
import { Sound } from '../../types';
import { Mic, Upload, X, Sparkles, Volume2, Radio, CheckCircle, RefreshCw } from 'lucide-react';

interface AudioSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDetail?: (sound: Sound) => void;
}

export const AudioSearchModal: React.FC<AudioSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectDetail
}) => {
  const { sounds, addToast } = useStore();

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchResults, setSearchResults] = useState<AudioSearchResult[]>([]);
  const [audioInputType, setAudioInputType] = useState<'mic' | 'file'>('mic');
  const [analyzedInfo, setAnalyzedInfo] = useState<{ bpm: number; duration: number } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        stream.getTracks().forEach(t => t.stop());
        await processAudio(audioBlob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      setSearchResults([]);
      setAnalyzedInfo(null);

      timerRef.current = window.setInterval(() => {
        setRecordSeconds(prev => {
          if (prev >= 14) {
            stopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      addToast('Microphone access denied. You can upload an audio file instead.', 'error');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('audio') && !file.name.endsWith('.wav') && !file.name.endsWith('.mp3')) {
      addToast('Please upload a valid audio file (WAV or MP3)', 'error');
      return;
    }

    await processAudio(file);
  };

  const processAudio = async (blob: Blob) => {
    setIsAnalyzing(true);
    addToast('Extracting acoustic spectral vector & estimated BPM in-browser...', 'info');

    try {
      const { featureVector, bpm, duration } = await analyzeAudioBlob(blob);
      setAnalyzedInfo({ bpm, duration });

      // Run cosine similarity across catalog
      const matches = searchSoundsByFeatureVector(featureVector, sounds, 12);
      setSearchResults(matches);
      addToast(`Found ${matches.length} matching sounds in SoundVault!`, 'success');
    } catch (err) {
      console.error('Audio analysis error:', err);
      addToast('Could not analyze audio clip. Try another sample.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col y2k-glass rounded-3xl p-4 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-white/20 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00f0ff] to-[#ff7700] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <div className="w-full h-full bg-[#0d111d] rounded-2xl flex items-center justify-center">
                <Radio className="w-5 h-5 text-[#00f0ff]" />
              </div>
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-xl text-white tracking-tight flex items-center gap-2">
                Search by Audio
                <span className="text-[11px] font-sans font-semibold px-2 py-0.5 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
                  Browser FFT AI
                </span>
              </h3>
              <p className="text-xs text-white/60">
                Record or upload a 5–15s clip to discover sounds with matching timbre, BPM, and harmonics.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Methods: Mic vs File */}
        <div className="py-4 shrink-0">
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={() => setAudioInputType('mic')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                audioInputType === 'mic'
                  ? 'bg-[#00f0ff] text-black shadow-[0_0_15px_rgba(0,240,255,0.5)]'
                  : 'bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Record with Microphone</span>
            </button>

            <button
              onClick={() => setAudioInputType('file')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                audioInputType === 'file'
                  ? 'bg-[#00f0ff] text-black shadow-[0_0_15px_rgba(0,240,255,0.5)]'
                  : 'bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Audio Clip</span>
            </button>
          </div>

          {/* Record Section */}
          {audioInputType === 'mic' ? (
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-black/40 border border-white/10 text-center">
              {isRecording ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 animate-ping absolute inset-0" />
                    <button
                      onClick={stopRecording}
                      className="relative w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.8)] hover:scale-105 transition-all"
                    >
                      <div className="w-6 h-6 bg-white rounded-sm" />
                    </button>
                  </div>
                  <div className="font-mono-num font-bold text-lg text-white">
                    0:{recordSeconds < 10 ? '0' : ''}{recordSeconds} / 0:15
                  </div>
                  <span className="text-xs text-red-400 font-medium animate-pulse">
                    Recording audio... Tap stop when finished.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={startRecording}
                    disabled={isAnalyzing}
                    className="w-18 h-18 rounded-full y2k-btn-primary flex items-center justify-center hover:scale-105 transition-all"
                  >
                    <Mic className="w-8 h-8 text-black" />
                  </button>
                  <div>
                    <h5 className="font-bold text-sm text-white">Tap to record a sample (5–15 seconds)</h5>
                    <p className="text-xs text-white/50 mt-1">Play an instrument, beatbox, or hum a bassline</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* File Upload Section */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-8 rounded-2xl bg-black/40 border-2 border-dashed border-white/20 hover:border-[#00f0ff]/50 cursor-pointer text-center transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.wav,.mp3"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-10 h-10 text-[#00f0ff] mb-2" />
              <h5 className="font-bold text-sm text-white">Click or drag & drop an audio file</h5>
              <p className="text-xs text-white/50 mt-1">Supports WAV or MP3 clips up to 15 seconds</p>
            </div>
          )}
        </div>

        {/* Loading Indicator */}
        {isAnalyzing && (
          <div className="flex items-center justify-center gap-3 py-8 text-sm text-[#00f0ff]">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Computing spectral centroid, rolloff, RMS, and zero-crossing vector...</span>
          </div>
        )}

        {/* Results Showcase */}
        {searchResults.length > 0 && (
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="flex items-center justify-between mb-3 text-xs text-white/60">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#ff7700]" />
                Top 12 Timbral Matches
              </span>
              {analyzedInfo && (
                <span className="font-mono-num text-[#00f0ff]">
                  Detected Tempo: ~{analyzedInfo.bpm} BPM
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
              {searchResults.map((result) => (
                <div key={result.sound.id} className="relative">
                  <div className="absolute top-2 right-12 z-20 px-2 py-0.5 rounded-full text-[10px] font-mono-num font-extrabold bg-[#00f0ff] text-black shadow-[0_0_10px_rgba(0,240,255,0.7)] pointer-events-none">
                    {result.matchPercentage}% Match
                  </div>
                  <SoundCard
                    sound={result.sound}
                    playlist={searchResults.map(r => r.sound)}
                    onOpenDetail={onSelectDetail}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
