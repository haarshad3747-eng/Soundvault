import { extractAudioFeatures, cosineSimilarity } from './audioSynthesis';
import { Sound } from '../types';

export interface AudioSearchResult {
  sound: Sound;
  similarity: number; // 0 - 1
  matchPercentage: number; // 0 - 100
}

/**
 * Estimate BPM from AudioBuffer using peak autocorrelation
 */
export function estimateBPM(buffer: AudioBuffer): number {
  const data = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  // Downsample to ~2205Hz for fast beat detection
  const downsampleRatio = Math.max(1, Math.floor(sampleRate / 2205));
  const downsampledLength = Math.floor(data.length / downsampleRatio);
  const energy = new Float32Array(downsampledLength);

  for (let i = 0; i < downsampledLength; i++) {
    const rawVal = data[i * downsampleRatio];
    energy[i] = rawVal * rawVal;
  }

  // Look for periodic peaks between 60 BPM and 200 BPM
  const minInterval = Math.floor((60 / 200) * (sampleRate / downsampleRatio));
  const maxInterval = Math.floor((60 / 60) * (sampleRate / downsampleRatio));

  let bestLag = minInterval;
  let maxCorr = -1;

  for (let lag = minInterval; lag <= maxInterval; lag += 2) {
    let corr = 0;
    const testLength = Math.min(2000, downsampledLength - lag);
    for (let i = 0; i < testLength; i++) {
      corr += energy[i] * energy[i + lag];
    }
    if (corr > maxCorr) {
      maxCorr = corr;
      bestLag = lag;
    }
  }

  const estimatedBpm = Math.round((60 * (sampleRate / downsampleRatio)) / bestLag);
  return Math.min(200, Math.max(60, estimatedBpm));
}

/**
 * Extract feature vector and BPM from an uploaded audio File or recorded Blob
 */
export async function analyzeAudioBlob(blob: Blob): Promise<{
  featureVector: number[];
  bpm: number;
  duration: number;
  buffer: AudioBuffer;
}> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } finally {
    if (audioCtx.state !== 'closed') {
      audioCtx.close();
    }
  }

  const bpm = estimateBPM(audioBuffer);
  const featureVector = extractAudioFeatures(audioBuffer, bpm);

  return {
    featureVector,
    bpm,
    duration: audioBuffer.duration,
    buffer: audioBuffer
  };
}

/**
 * Search sounds by feature vector similarity
 */
export function searchSoundsByFeatureVector(
  queryVector: number[],
  sounds: Sound[],
  topN: number = 12
): AudioSearchResult[] {
  const scored = sounds.map(sound => {
    const sim = cosineSimilarity(queryVector, sound.feature_vector);
    return {
      sound,
      similarity: sim,
      matchPercentage: Math.round(sim * 100)
    };
  });

  // Sort descending by similarity
  scored.sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, topN);
}
