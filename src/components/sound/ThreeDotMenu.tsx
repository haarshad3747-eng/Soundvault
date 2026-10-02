import React, { useEffect, useRef } from 'react';
import { Sound } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Bookmark, Heart, Download, Share2, Info, X } from 'lucide-react';

interface ThreeDotMenuProps {
  sound: Sound;
  isOpen: boolean;
  onClose: () => void;
  onSelectDetail?: (sound: Sound) => void;
}

export const ThreeDotMenu: React.FC<ThreeDotMenuProps> = ({
  sound,
  isOpen,
  onClose,
  onSelectDetail
}) => {
  const { user, isLiked, isInLibrary, toggleLike, toggleLibrary, recordDownload, addToast } = useStore();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const liked = isLiked(sound.id);
  const inLibrary = isInLibrary(sound.id);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#sound-${sound.id}`;
    navigator.clipboard?.writeText(url).then(() => {
      addToast('Share link copied to clipboard!', 'success');
    }).catch(() => {
      addToast('Link copied: ' + url, 'info');
    });
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
        onClick={onClose}
      />

      {/* Menu / Bottom Sheet */}
      <div
        ref={menuRef}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:absolute md:bottom-auto md:top-full md:right-0 md:left-auto md:w-64 md:p-2 bg-[#0e121e]/95 border border-white/20 rounded-t-3xl md:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4 duration-200"
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 md:hidden">
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-white truncate max-w-[240px]">
              {sound.title}
            </span>
            <span className="text-xs text-white/50">
              {sound.instrument} • {sound.key} • {sound.bpm} BPM
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1">
          {/* Library action */}
          <button
            onClick={() => {
              toggleLibrary(sound.id);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Bookmark className={`w-4 h-4 ${inLibrary ? 'text-[#00f0ff] fill-[#00f0ff]' : 'text-white/60'}`} />
            <span>{inLibrary ? 'Remove from library' : 'Add to your library'}</span>
          </button>

          {/* Likes action */}
          <button
            onClick={() => {
              toggleLike(sound.id);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Heart className={`w-4 h-4 ${liked ? 'text-[#ff3b30] fill-[#ff3b30]' : 'text-white/60'}`} />
            <span>{liked ? 'Remove from likes' : 'Add to likes'}</span>
          </button>

          {/* Download action */}
          <button
            onClick={() => {
              recordDownload(sound);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Download className="w-4 h-4 text-[#ff7700]" />
            <span>Download sound (WAV)</span>
          </button>

          {/* Details view */}
          {onSelectDetail && (
            <button
              onClick={() => {
                onSelectDetail(sound);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Info className="w-4 h-4 text-white/60" />
              <span>View sound details</span>
            </button>
          )}

          {/* Share */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Share2 className="w-4 h-4 text-white/60" />
            <span>Share sound link</span>
          </button>
        </div>

        {!user && (
          <div className="mt-3 pt-2 px-2 text-[11px] text-white/40 border-t border-white/10 text-center">
            Sign in to sync your library across devices
          </div>
        )}
      </div>
    </>
  );
};
