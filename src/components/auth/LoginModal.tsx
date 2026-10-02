import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Sparkles, ShieldCheck, UserCheck, KeyRound, User } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { showLoginModal, setShowLoginModal, signInWithGoogle } = useStore();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');

  if (!showLoginModal) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    signInWithGoogle(email.trim(), displayName.trim() || 'Producer');
    setEmail('');
    setDisplayName('');
  };

  const handleQuickAdmin = () => {
    signInWithGoogle('haarahad3747@gmail.com', 'Vault Admin');
  };

  const handleQuickProducer = () => {
    signInWithGoogle('producer@soundvault.fm', 'CyberProducer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md y2k-glass rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-white/20">
        
        {/* Close Button */}
        <button
          onClick={() => setShowLoginModal(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00f0ff] via-[#cbd5e1] to-[#ff7700] mb-3 shadow-[0_0_25px_rgba(0,240,255,0.5)]">
            <Sparkles className="w-7 h-7 text-black" />
          </div>
          <h3 className="font-heading font-extrabold text-2xl text-white tracking-tight">
            Sign In to SoundVault
          </h3>
          <p className="text-xs text-white/60 mt-1.5">
            Enter any username to create or resume your local session. All saved sounds, likes, downloads, and uploads will be stored in your browser.
          </p>
        </div>

        {/* Quick Google Sign In Buttons */}
        <div className="space-y-2.5 mb-5">
          <button
            onClick={handleQuickAdmin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full bg-white text-gray-900 font-bold hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.01]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            <span className="text-xs sm:text-sm">Sign In as haarahad3747@gmail.com (Admin)</span>
          </button>

          <button
            onClick={handleQuickProducer}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-white/10 text-white font-semibold hover:bg-white/15 border border-white/15 transition-all text-xs"
          >
            <User className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Sign In as CyberProducer (Member)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 py-1 mb-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] uppercase tracking-wider text-white/40">or enter custom email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-white/80 block mb-1">
              Producer Name
            </label>
            <input
              type="text"
              placeholder="e.g. MetroBeat or StudioX"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#00f0ff]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-white/80 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="producer@studio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#00f0ff]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full y2k-btn-primary font-bold text-xs uppercase tracking-wider shadow-lg"
          >
            Sign In with Email
          </button>
        </form>

        {/* Quick Profiles */}
        <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
          <span className="text-[11px] text-white/40 block text-center uppercase tracking-wider">
            Quick 1-Click Demo Profiles
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleQuickAdmin}
              className="px-3 py-2 rounded-xl bg-[#ff7700]/15 hover:bg-[#ff7700]/25 border border-[#ff7700]/30 text-[11px] font-bold text-[#ff8c00] flex items-center justify-center gap-1.5 transition-all"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>haarahad3747 (Admin)</span>
            </button>
            <button
              onClick={handleQuickProducer}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-white/80 flex items-center justify-center gap-1.5 transition-all"
            >
              <User className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>CyberProducer</span>
            </button>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5 text-xs text-white/60">
          <ShieldCheck className="w-4 h-4 text-[#00f0ff] shrink-0 mt-0.5" />
          <span>
            Browser-local storage enabled (localStorage + IndexedDB). Your session persists across page reloads.
          </span>
        </div>
      </div>
    </div>
  );
};
