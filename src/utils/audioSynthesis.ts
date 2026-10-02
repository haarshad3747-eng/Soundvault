/**
 * Procedural Audio Synthesis and Feature Extraction using Web Audio API
 */

// Convert AudioBuffer to 16-bit PCM WAV Blob
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const numSamples = buffer.length * numChannels;
  const byteRate = (sampleRate * numChannels * bitDepth) / 8;
  const blockAlign = (numChannels * bitDepth) / 8;
  const dataSize = numSamples * 2;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // RIFF identifier
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  // fmt sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample
  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM samples (interleaved)
  let offset = 44;
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channels[ch][i];
      // Clamp between -1 and 1
      sample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

// Map musical keys to base frequencies
export function keyToFrequency(key: string): number {
  const noteMap: Record<string, number> = {
    'C': 130.81, 'C#': 138.59, 'D': 146.83, 'D#': 155.56,
    'E': 164.81, 'F': 174.61, 'F#': 185.00, 'G': 196.00,
    'G#': 207.65, 'A': 220.00, 'A#': 233.08, 'B': 246.94
  };
  const parts = key.split(' ');
  const root = parts[0] || 'C';
  return noteMap[root] || 130.81;
}

// Generate scale frequencies (Minor or Major)
export function getScaleFrequencies(key: string): number[] {
  const baseFreq = keyToFrequency(key);
  const isMinor = key.toLowerCase().includes('min');
  // Intervals in semitones:
  const intervals = isMinor ? [0, 3, 5, 7, 10, 12, 15] : [0, 4, 7, 9, 12, 14, 16];
  return intervals.map(st => baseFreq * Math.pow(2, st / 12));
}

// Extract audio feature vector for similarity search
export function extractAudioFeatures(buffer: AudioBuffer, bpmGuess?: number): number[] {
  const data = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  const length = data.length;

  if (length === 0) return [0, 0, 0, 0, 0, 0, 0, 0];

  let sumSquares = 0;
  let zeroCrossings = 0;
  let peak = 0;

  for (let i = 0; i < length; i++) {
    const val = data[i];
    sumSquares += val * val;
    const absVal = Math.abs(val);
    if (absVal > peak) peak = absVal;

    if (i > 0 && ((data[i] >= 0 && data[i - 1] < 0) || (data[i] < 0 && data[i - 1] >= 0))) {
      zeroCrossings++;
    }
  }

  const rms = Math.sqrt(sumSquares / length);
  const zcr = zeroCrossings / length;

  // Simple spectral estimation via FFT windows
  const fftSize = 1024;
  const numSlices = Math.min(32, Math.floor(length / fftSize));
  let totalCentroid = 0;
  let totalBassEnergy = 0;
  let totalHighEnergy = 0;

  for (let slice = 0; slice < numSlices; slice++) {
    const start = Math.floor((slice * (length - fftSize)) / Math.max(1, numSlices - 1));
    let weightedFreqSum = 0;
    let magnitudeSum = 0;
    let bassMag = 0;
    let highMag = 0;

    for (let k = 0; k < fftSize / 2; k++) {
      // Discrete windowed approximation
      const freq = (k * sampleRate) / fftSize;
      const sampleVal = Math.abs(data[start + k * 2] || 0);

      weightedFreqSum += freq * sampleVal;
      magnitudeSum += sampleVal;

      if (freq < 200) bassMag += sampleVal;
      if (freq > 3000) highMag += sampleVal;
    }

    if (magnitudeSum > 0.001) {
      totalCentroid += weightedFreqSum / magnitudeSum;
      totalBassEnergy += bassMag / magnitudeSum;
      totalHighEnergy += highMag / magnitudeSum;
    }
  }

  const avgCentroid = numSlices > 0 ? totalCentroid / numSlices : 1200;
  const avgBassRatio = numSlices > 0 ? totalBassEnergy / numSlices : 0.3;
  const avgHighRatio = numSlices > 0 ? totalHighEnergy / numSlices : 0.2;

  // Normalize into standard 8-dimensional feature vector [0 .. 1]
  const normRms = Math.min(1, rms * 3.5);
  const normZcr = Math.min(1, zcr * 15);
  const normCentroid = Math.min(1, avgCentroid / 6000);
  const normBass = Math.min(1, avgBassRatio);
  const normHigh = Math.min(1, avgHighRatio);
  const normBpm = bpmGuess ? Math.min(1, bpmGuess / 200) : 0.65;
  const crestFactor = peak > 0 && rms > 0 ? Math.min(1, (peak / rms) / 8) : 0.5;
  const spectralRolloff = Math.min(1, (avgCentroid * 1.6) / 8000);

  return [
    normRms,
    normZcr,
    normCentroid,
    normBass,
    normHigh,
    normBpm,
    crestFactor,
    spectralRolloff
  ];
}

// Calculate Cosine Similarity between two feature vectors
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const len = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  if (magA === 0 || magB === 0) return 0;
  const sim = dotProduct / (magA * magB);
  return Math.max(0, Math.min(1, sim));
}

// Procedural sound synthesizer for demo sounds
export async function synthesizeSoundAudio(
  type: string,
  instrument: string,
  key: string,
  bpm: number,
  durationSeconds: number
): Promise<{ blob: Blob; url: string; buffer: AudioBuffer; featureVector: number[] }> {
  const sampleRate = 44100;
  // Ensure duration is accurate (loops 30-60s, one shots 10-18s)
  const duration = Math.max(10, Math.min(60, durationSeconds));
  const ctx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

  const baseFreq = keyToFrequency(key);
  const scale = getScaleFrequencies(key);
  const beatDuration = 60 / bpm;

  // Master Gain & Limiter
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.7, 0);

  // Subtle Stereo Reverb
  const convolver = ctx.createConvolver();
  const revLength = Math.floor(sampleRate * 2.0);
  const revBuffer = ctx.createBuffer(2, revLength, sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const revData = revBuffer.getChannelData(ch);
    for (let i = 0; i < revLength; i++) {
      const decay = Math.exp(-i / (sampleRate * 0.5));
      revData[i] = (Math.random() * 2 - 1) * decay * 0.2;
    }
  }
  convolver.buffer = revBuffer;

  const wetGain = ctx.createGain();
  wetGain.gain.value = 0.25;
  masterGain.connect(wetGain);
  wetGain.connect(convolver);
  convolver.connect(ctx.destination);
  masterGain.connect(ctx.destination);

  // Route sound generator based on instrument and type
  const instLower = instrument.toLowerCase();
  const isLoop = type.toLowerCase() === 'loop';

  if (instLower.includes('808') || (instLower.includes('bass') && !isLoop)) {
    // 808 Sub glide one-shot with pitch drop and distortion
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    
    // Initial punch pitch dive
    osc.frequency.setValueAtTime(baseFreq * 2.2, 0);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, 0.08);
    osc.frequency.setValueAtTime(baseFreq * 0.5, 0.08);

    gain.gain.setValueAtTime(0.0, 0);
    gain.gain.linearRampToValueAtTime(0.9, 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, duration - 0.5);

    // Warm soft-clip waveshaper
    const shaper = ctx.createWaveShaper();
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = (Math.PI + 3) * x / (Math.PI + 3 * Math.abs(x));
    }
    shaper.curve = curve;

    osc.connect(shaper);
    shaper.connect(gain);
    gain.connect(masterGain);

    osc.start(0);
    osc.stop(duration);

  } else if (instLower.includes('kick')) {
    // Punchy Kick Drum
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, 0);
    osc.frequency.exponentialRampToValueAtTime(45, 0.12);

    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(1.0, 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, 1.2);

    // Click transient
    const click = ctx.createBufferSource();
    const clickBuf = ctx.createBuffer(1, Math.floor(sampleRate * 0.02), sampleRate);
    const clickData = clickBuf.getChannelData(0);
    for (let i = 0; i < clickBuf.length; i++) {
      clickData[i] = (Math.random() * 2 - 1) * Math.exp(-i / 100);
    }
    click.buffer = clickBuf;
    const clickGain = ctx.createGain();
    clickGain.gain.value = 0.4;
    click.connect(clickGain);
    clickGain.connect(masterGain);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(0);
    osc.stop(duration);
    click.start(0);

  } else if (instLower.includes('snare') || instLower.includes('hat') || instLower.includes('perc')) {
    // Crisp percussion / snare
    const isHat = instLower.includes('hat');
    const noise = ctx.createBufferSource();
    const noiseBuf = ctx.createBuffer(1, Math.floor(sampleRate * (isHat ? 1.5 : 2.5)), sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseBuf.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    noise.buffer = noiseBuf;

    const filter = ctx.createBiquadFilter();
    filter.type = isHat ? 'highpass' : 'bandpass';
    filter.frequency.value = isHat ? 7000 : 1800;
    filter.Q.value = 2.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.8, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, isHat ? 0.35 : 1.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    noise.start(0);
    noise.stop(duration);

  } else if (instLower.includes('pad') || instLower.includes('strings') || instLower.includes('ambient')) {
    // Lush atmospheric chords / Ambient pad
    const chord = [scale[0], scale[2], scale[4], scale[6] || scale[1] * 2];
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const panner = ctx.createStereoPanner();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq * 0.5, 0);

      // Slow filter sweep
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, 0);
      filter.frequency.linearRampToValueAtTime(2200, duration * 0.5);
      filter.frequency.linearRampToValueAtTime(500, duration);

      panner.pan.value = (idx - 1.5) * 0.4;

      gain.gain.setValueAtTime(0, 0);
      gain.gain.linearRampToValueAtTime(0.25, 2.0);
      gain.gain.setValueAtTime(0.25, duration - 3.0);
      gain.gain.linearRampToValueAtTime(0.001, duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(panner);
      panner.connect(masterGain);

      osc.start(0);
      osc.stop(duration);
    });

  } else if (isLoop) {
    // Full Musical Beat / Groove / Bassline Loop (30-60 seconds)
    const numBars = Math.floor(duration / (beatDuration * 4));
    const totalBeats = numBars * 4;

    for (let bar = 0; bar < numBars; bar++) {
      const barStartTime = bar * 4 * beatDuration;

      // 1. Kick on beats 0, 2 (or 4-on-the-floor for house/techno)
      for (let b = 0; b < 4; b++) {
        const beatTime = barStartTime + b * beatDuration;
        if (beatTime + 0.5 > duration) break;

        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(140, beatTime);
        kickOsc.frequency.exponentialRampToValueAtTime(42, beatTime + 0.1);

        kickGain.gain.setValueAtTime(0, beatTime);
        kickGain.gain.linearRampToValueAtTime(0.7, beatTime + 0.005);
        kickGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.35);

        kickOsc.connect(kickGain);
        kickGain.connect(masterGain);

        kickOsc.start(beatTime);
        kickOsc.stop(beatTime + 0.4);
      }

      // 2. Offbeat Hi-hats
      for (let b = 0; b < 8; b++) {
        const hatTime = barStartTime + b * (beatDuration / 2) + (beatDuration / 4);
        if (hatTime + 0.15 > duration) break;

        const hatOsc = ctx.createBufferSource();
        const hatBuf = ctx.createBuffer(1, Math.floor(sampleRate * 0.1), sampleRate);
        const hData = hatBuf.getChannelData(0);
        for (let i = 0; i < hatBuf.length; i++) hData[i] = (Math.random() * 2 - 1);
        hatOsc.buffer = hatBuf;

        const hatFilter = ctx.createBiquadFilter();
        hatFilter.type = 'highpass';
        hatFilter.frequency.value = 8500;

        const hatGain = ctx.createGain();
        hatGain.gain.setValueAtTime(0.25, hatTime);
        hatGain.gain.exponentialRampToValueAtTime(0.001, hatTime + 0.08);

        hatOsc.connect(hatFilter);
        hatFilter.connect(hatGain);
        hatGain.connect(masterGain);

        hatOsc.start(hatTime);
        hatOsc.stop(hatTime + 0.1);
      }

      // 3. Melodic Bassline Progression
      for (let step = 0; step < 8; step++) {
        const stepTime = barStartTime + step * (beatDuration / 2);
        if (stepTime + 0.3 > duration) break;

        const noteIndex = (step + bar) % scale.length;
        const noteFreq = scale[noteIndex] * 0.5;

        const bassOsc = ctx.createOscillator();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(noteFreq, stepTime);

        const bassFilter = ctx.createBiquadFilter();
        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(1400, stepTime);
        bassFilter.frequency.exponentialRampToValueAtTime(250, stepTime + 0.25);
        bassFilter.Q.value = 5.0;

        const bassGain = ctx.createGain();
        bassGain.gain.setValueAtTime(0, stepTime);
        bassGain.gain.linearRampToValueAtTime(0.4, stepTime + 0.02);
        bassGain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.28);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(masterGain);

        bassOsc.start(stepTime);
        bassOsc.stop(stepTime + 0.3);
      }
    }

  } else {
    // Synth Lead / Keys / Arpeggios (10-25 seconds)
    const noteSteps = Math.floor(duration / (beatDuration / 2));
    for (let step = 0; step < noteSteps; step++) {
      const stepTime = step * (beatDuration / 2);
      if (stepTime + 0.4 > duration) break;

      const noteFreq = scale[(step * 2) % scale.length] * 1.0;
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(noteFreq, stepTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, stepTime);
      filter.frequency.exponentialRampToValueAtTime(600, stepTime + 0.3);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, stepTime);
      gain.gain.linearRampToValueAtTime(0.3, stepTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(stepTime);
      osc.stop(stepTime + 0.4);
    }
  }

  // Render complete buffer
  const renderedBuffer = await ctx.startRendering();
  const wavBlob = audioBufferToWav(renderedBuffer);
  const blobUrl = URL.createObjectURL(wavBlob);
  const featureVector = extractAudioFeatures(renderedBuffer, bpm);

  return {
    blob: wavBlob,
    url: blobUrl,
    buffer: renderedBuffer,
    featureVector
  };
}

// Memory cache for synthesized AudioBuffers & URLs
const audioBufferCache = new Map<string, { buffer: AudioBuffer; url: string }>();

export function getCachedAudio(soundId: string) {
  return audioBufferCache.get(soundId);
}

export function setCachedAudio(soundId: string, data: { buffer: AudioBuffer; url: string }) {
  audioBufferCache.set(soundId, data);
}
