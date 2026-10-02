import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

interface CanvasWaveformProps {
  height?: number;
  barWidth?: number;
  barGap?: number;
  className?: string;
  showTimeHover?: boolean;
}

export const CanvasWaveform: React.FC<CanvasWaveformProps> = ({
  height = 54,
  barWidth = 3,
  barGap = 2,
  className = '',
  showTimeHover = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  const {
    currentTime,
    duration,
    isPlaying,
    audioBuffer,
    frequencyData,
    seekTo
  } = useAudioPlayer();

  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  // Cached bar data: peak height & spectral balance
  const [barData, setBarData] = useState<Array<{ peak: number; bassRatio: number; midRatio: number; highRatio: number }>>([]);

  // Compute peaks and spectral energy across bar segments
  useEffect(() => {
    if (!audioBuffer) {
      // Fallback synthetic waveform if no buffer yet
      const fallbackBars = 90;
      const synthetic = Array.from({ length: fallbackBars }, (_, i) => {
        const norm = i / fallbackBars;
        const wave = Math.sin(norm * Math.PI * 4) * 0.3 + 0.5;
        const noise = (Math.random() - 0.5) * 0.25;
        const peak = Math.max(0.15, Math.min(1.0, wave + noise));
        return {
          peak,
          bassRatio: norm < 0.35 ? 0.8 : 0.2,
          midRatio: norm >= 0.35 && norm < 0.7 ? 0.7 : 0.3,
          highRatio: norm >= 0.7 ? 0.8 : 0.2
        };
      });
      setBarData(synthetic);
      return;
    }

    const channelData = audioBuffer.getChannelData(0);
    const totalSamples = channelData.length;
    const numBars = 120; // High resolution bars
    const samplesPerBar = Math.floor(totalSamples / numBars);

    const computed = [];
    for (let b = 0; b < numBars; b++) {
      const start = b * samplesPerBar;
      const end = Math.min(start + samplesPerBar, totalSamples);
      let sum = 0;
      let maxPeak = 0;
      let zeroCrossings = 0;

      for (let s = start; s < end; s++) {
        const val = Math.abs(channelData[s]);
        if (val > maxPeak) maxPeak = val;
        sum += val;
        if (s > start && ((channelData[s] >= 0 && channelData[s - 1] < 0) || (channelData[s] < 0 && channelData[s - 1] >= 0))) {
          zeroCrossings++;
        }
      }

      const avg = sum / (end - start);
      const zcr = zeroCrossings / (end - start);
      const peak = Math.max(0.12, Math.min(1.0, maxPeak * 0.85 + avg * 0.4));

      // Spectral energy estimation:
      // High ZCR indicates highs/percussion; low ZCR with high energy indicates sub-bass
      const highRatio = Math.min(1.0, zcr * 12);
      const bassRatio = Math.max(0, 1.0 - highRatio * 1.2);
      const midRatio = Math.max(0, 1.0 - bassRatio - highRatio);

      computed.push({
        peak,
        bassRatio,
        midRatio,
        highRatio
      });
    }

    setBarData(computed);
  }, [audioBuffer]);

  // Main canvas render routine
  const renderWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || barData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const h = rect.height;

    // Adjust canvas buffer resolution for crisp DPR
    if (canvas.width !== width * dpr || canvas.height !== h * dpr) {
      canvas.width = width * dpr;
      canvas.height = h * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, h);

    const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
    const totalBars = barData.length;
    const step = width / totalBars;
    const currentBarWidth = Math.max(1.5, step - barGap);

    // Live frequency boost from analyser node
    let liveBassBoost = 1;
    let liveHighBoost = 1;
    if (frequencyData && isPlaying) {
      const bassVal = frequencyData[2] || 0;
      const highVal = frequencyData[30] || 0;
      liveBassBoost = 1 + (bassVal / 255) * 0.35;
      liveHighBoost = 1 + (highVal / 255) * 0.35;
    }

    const centerY = h / 2;

    for (let i = 0; i < totalBars; i++) {
      const bar = barData[i];
      const barProgress = i / totalBars;
      const isPlayed = barProgress <= progress;

      // Dynamic bar height
      let barH = bar.peak * (h * 0.85);
      if (isPlayed && isPlaying) {
        barH *= (bar.bassRatio * liveBassBoost + bar.highRatio * liveHighBoost) * 0.5 + 0.5;
      }
      barH = Math.max(4, Math.min(h - 4, barH));

      const x = i * step;
      const y = centerY - barH / 2;

      // Color computation based on pre-computed spectral energy:
      // Bass: Warm Red/Orange (#ff3b00 / #ff7700)
      // Mids: Yellow-Green/Teal (#10b981 / #06b6d4)
      // Highs: Cool Cyan/Violet (#00f0ff / #a855f7)
      let r = Math.floor(bar.bassRatio * 255 + bar.midRatio * 16 + bar.highRatio * 0);
      let g = Math.floor(bar.bassRatio * 90 + bar.midRatio * 185 + bar.highRatio * 240);
      let b = Math.floor(bar.bassRatio * 10 + bar.midRatio * 129 + bar.highRatio * 255);

      if (isPlayed) {
        // Bright holographic/electric glow for played portion
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.7)`;
        ctx.shadowBlur = isPlaying ? 8 : 4;
      } else {
        // Unplayed: translucent sleek cyber shade
        ctx.fillStyle = `rgba(${Math.floor(r * 0.5 + 80)}, ${Math.floor(g * 0.5 + 90)}, ${Math.floor(b * 0.5 + 110)}, 0.28)`;
        ctx.shadowBlur = 0;
      }

      // Draw rounded bar
      const radius = currentBarWidth / 2;
      ctx.beginPath();
      ctx.roundRect(x, y, currentBarWidth, barH, radius);
      ctx.fill();
    }

    // Draw playhead cursor & electric glowing beam
    const playheadX = progress * width;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#00f0ff';
    ctx.fillStyle = '#ffffff';

    // Playhead line
    ctx.fillRect(Math.max(0, playheadX - 1.5), 2, 3, h - 4);

    // Glowing head pill
    ctx.beginPath();
    ctx.arc(playheadX, centerY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#00f0ff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(playheadX, centerY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }, [barData, currentTime, duration, isPlaying, barGap, frequencyData]);

  // Request animation frame for continuous smooth rendering
  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderWaveform();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderWaveform]);

  // Handle ResizeObserver for responsive full width
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      renderWaveform();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [renderWaveform]);

  // Seek logic for Click & Drag (Mouse & Touch)
  const handleSeekFromEvent = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !duration) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const ratio = clickX / rect.width;
    const targetSeconds = ratio * duration;
    seekTo(targetSeconds);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    handleSeekFromEvent(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const posX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setHoverX(posX);
    if (duration > 0) {
      setHoverTime((posX / rect.width) * duration);
    }
    if (isDraggingRef.current) {
      handleSeekFromEvent(e.clientX);
    }
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
    setHoverX(null);
    isDraggingRef.current = false;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Touch support for mobile seeking
  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    if (e.touches.length > 0) {
      handleSeekFromEvent(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingRef.current && e.touches.length > 0) {
      handleSeekFromEvent(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none cursor-pointer group ${className}`}
      style={{ height }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block rounded-xl overflow-hidden"
        style={{ height }}
      />

      {/* Hover Time Tooltip */}
      {showTimeHover && hoverTime !== null && hoverX !== null && (
        <div
          className="absolute -top-7 pointer-events-none transform -translate-x-1/2 px-2 py-0.5 rounded-full text-[11px] font-mono-num font-semibold bg-black/90 text-[#00f0ff] border border-[#00f0ff]/40 shadow-lg backdrop-blur-md"
          style={{ left: hoverX }}
        >
          {formatTime(hoverTime)}
        </div>
      )}
    </div>
  );
};
