import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Compass,
  Library,
  Disc,
  Bookmark,
  Heart,
  Upload,
  Mic,
  Shield,
  Menu,
  X,
  LogOut,
  LogIn,
  Sliders,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenAudioSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenAudioSearch
}) => {
  const { user, signOut, setShowLoginModal, likedIds, myLibraryIds } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'packs', label: 'Packs', icon: Disc },
    { id: 'my-library', label: 'My Library', icon: Bookmark, badge: myLibraryIds.size },
    { id: 'liked', label: 'Liked Sounds', icon: Heart, badge: likedIds.size },
    { id: 'upload', label: 'Upload', icon: Upload }
  ];

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full y2k-glass border-b border-white/10 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Wordmark */}
        <div
          onClick={() => handleNavClick('discover')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          {/* Chrome Vault Waveform Icon */}
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00f0ff] via-[#cbd5e1] to-[#ff7700] p-[2px] shadow-[0_0_20px_rgba(0,240,255,0.4)] group-hover:shadow-[0_0_30px_rgba(0,240,255,0.8)] transition-all">
            <div className="w-full h-full bg-[#0a0d16] rounded-2xl flex items-center justify-center overflow-hidden">
              <div className="flex items-center gap-[2px] h-5">
                <span className="w-1 h-3 bg-[#00f0ff] rounded-full animate-pulse" />
                <span className="w-1 h-5 bg-white rounded-full" />
                <span className="w-1 h-4 bg-[#ff7700] rounded-full animate-pulse" />
                <span className="w-1 h-2 bg-[#00f0ff] rounded-full" />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
              Sound<span className="y2k-holo-text">Vault</span>
              <Sparkles className="w-3.5 h-3.5 text-[#00f0ff] animate-twinkle" />
            </span>
            <span className="text-[10px] tracking-widest uppercase text-white/50 font-mono-num -mt-1">
              Royalty-Free Audio
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 y2k-glass-subtle px-3 py-1.5 rounded-full border border-white/10 shadow-inner">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  active
                    ? 'y2k-btn-primary'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-black' : ''}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono-num font-bold ${
                      active ? 'bg-black text-white' : 'bg-white/20 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Audio Search Mic & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Audio Search Button with Mic */}
          <button
            onClick={onOpenAudioSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full y2k-btn-glass text-xs font-semibold text-white/90 hover:border-[#00f0ff] hover:text-[#00f0ff] group shadow-sm transition-all"
            title="Search by Audio (Record or Upload)"
          >
            <Mic className="w-3.5 h-3.5 text-[#00f0ff] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Audio Search</span>
          </button>

          {/* Admin Moderation Button (if user is admin) */}
          {user?.role === 'admin' && (
            <button
              onClick={() => handleNavClick('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                currentTab === 'admin'
                  ? 'bg-[#ff7700] text-white shadow-[0_0_15px_rgba(255,119,0,0.6)]'
                  : 'bg-[#ff7700]/20 text-[#ff8c00] border border-[#ff7700]/40 hover:bg-[#ff7700]/30'
              }`}
              title="Admin Moderation & Bulk Upload"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* User Profile / Login */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
              >
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt={user.displayName}
                  className="w-7 h-7 rounded-full object-cover border border-white/30"
                />
                <span className="text-xs font-medium text-white max-w-[90px] truncate hidden sm:inline">
                  {user.displayName.split(' ')[0]}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 y2k-glass rounded-2xl p-2 shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="p-2.5 border-b border-white/10">
                    <p className="font-bold text-xs text-white truncate">{user.displayName}</p>
                    <p className="text-[11px] text-white/50 truncate font-mono-num">{user.email}</p>
                    {user.role === 'admin' && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff7700]/20 text-[#ff8c00] border border-[#ff7700]/40">
                        Admin Rights
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleNavClick('my-library');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-white/80 hover:text-white hover:bg-white/10"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-[#00f0ff]" />
                      <span>My Vault Library</span>
                    </button>
                    <button
                      onClick={() => {
                        handleNavClick('liked');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-white/80 hover:text-white hover:bg-white/10"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#ff3b30]" />
                      <span>Liked Sounds</span>
                    </button>
                    <button
                      onClick={() => {
                        handleNavClick('upload');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-white/80 hover:text-white hover:bg-white/10"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#ff7700]" />
                      <span>My Uploads</span>
                    </button>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          handleNavClick('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-white/80 hover:text-white hover:bg-white/10"
                      >
                        <Shield className="w-3.5 h-3.5 text-[#ff7700]" />
                        <span>Admin Queue</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-white/10">
                    <button
                      onClick={() => {
                        signOut();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full y2k-btn-primary text-xs font-bold shadow-md"
            >
              <LogIn className="w-3.5 h-3.5 text-black" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 border-t border-white/10 space-y-1.5 bg-[#090b12]/95 backdrop-blur-3xl animate-in slide-in-from-top-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-[#00f0ff] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono-num font-bold bg-white/20">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {user?.role === 'admin' && (
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-[#ff8c00] bg-[#ff7700]/10 border border-[#ff7700]/30"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Moderation & Bulk Tools</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
