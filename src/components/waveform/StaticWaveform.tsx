import React, { useMemo } from 'react';

interface StaticWaveformProps {
  soundId: string;
  isPlaying?: boolean;
  progress?: number; // 0 to 1
  barsCount?: number;
  height?: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const StaticWaveform: React.FC<StaticWaveformProps> = ({
  soundId,
  isPlaying = false,
  progress = 0,
  barsCount = 36,
  height = 28,
  className = '',
  onClick
}) => {
  // Deterministic pseudo-random peaks based on soundId hash
  const bars = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < soundId.length; i++) {
      hash = (hash << 5) - hash + soundId.charCodeAt(i);
      hash |= 0;
    }

    const items = [];
    for (let i = 0; i < barsCount; i++) {
      const seed = Math.sin(hash + i * 0.45) * 10000;
      const rand = seed - Math.floor(seed);
      const wave = Math.sin((i / barsCount) * Math.PI * 2) * 0.25 + 0.55;
      const peak = Math.max(0.2, Math.min(1.0, wave + (rand - 0.5) * 0.4));

      // Spectral energy coloring:
      // Beginning: low end (warm orange/amber), Middle: green/teal, End: cyan/violet
      const norm = i / barsCount;
      let colorClass = 'from-[#ff7700] to-[#ffaa00]';
      if (norm > 0.35 && norm < 0.7) {
        colorClass = 'from-[#10b981] to-[#06b6d4]';
      } else if (norm >= 0.7) {
        colorClass = 'from-[#00f0ff] to-[#a855f7]';
      }

      items.push({ peak, colorClass });
    }
    return items;
  }, [soundId, barsCount]);

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center gap-[2px] w-full h-[${height}px] px-1 overflow-hidden select-none ${className}`}
      style={{ height }}
    >
      {bars.map((bar, idx) => {
        const barProgress = idx / barsCount;
        const isPlayed = barProgress <= progress;

        return (
          <div
            key={idx}
            className="flex-1 flex items-center justify-center h-full"
          >
            <div
              className={`w-full rounded-full transition-all duration-150 ${
                isPlayed
                  ? 'bg-gradient-to-t ' + bar.colorClass + ' shadow-[0_0_8px_rgba(0,240,255,0.6)]'
                  : 'bg-white/15'
              }`}
              style={{
                height: `${Math.max(15, bar.peak * 100)}%`,
                transform: isPlaying && isPlayed ? 'scaleY(1.15)' : 'scaleY(1.0)'
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
