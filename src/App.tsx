import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AudioPlayerProvider, useAudioPlayer } from './context/AudioPlayerContext';
import { Navbar } from './components/nav/Navbar';
import { MiniPlayer } from './components/player/MiniPlayer';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginModal } from './components/auth/LoginModal';
import { AudioSearchModal } from './components/search/AudioSearchModal';

// Pages
import { DiscoverPage } from './pages/DiscoverPage';
import { LibraryPage } from './pages/LibraryPage';
import { PacksPage } from './pages/PacksPage';
import { PackDetailPage } from './pages/PackDetailPage';
import { SoundDetailPage } from './pages/SoundDetailPage';
import { AllGenresPage } from './pages/AllGenresPage';
import { MyLibraryPage } from './pages/MyLibraryPage';
import { LikedSoundsPage } from './pages/LikedSoundsPage';
import { UploadPage } from './pages/UploadPage';
import { AdminPage } from './pages/AdminPage';
import { LicensePage } from './pages/LicensePage';
import { TermsPage } from './pages/TermsPage';

import { Sound, Pack } from './types';

function MainApp() {
  const { user } = useStore();
  const [currentTab, setCurrentTab] = useState<string>('discover');
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [selectedSoundDetail, setSelectedSoundDetail] = useState<Sound | null>(null);
  const [libraryGenreFilter, setLibraryGenreFilter] = useState<string>('');
  const [libraryInstrumentFilter, setLibraryInstrumentFilter] = useState<string>('');
  const [librarySearchQuery, setLibrarySearchQuery] = useState<string>('');
  const [isAudioSearchOpen, setIsAudioSearchOpen] = useState<boolean>(false);

  // Handle URL hash changes or routing
  const navigateTo = (tab: string) => {
    // If tab contains query params e.g. "library?q=trap"
    if (tab.includes('?')) {
      const [t, queryPart] = tab.split('?');
      const params = new URLSearchParams(queryPart);
      const q = params.get('q') || '';
      setLibrarySearchQuery(q);
      setCurrentTab(t);
    } else {
      setCurrentTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectGenreFromAnywhere = (genre: string) => {
    setLibraryGenreFilter(genre);
    setLibraryInstrumentFilter('');
    setLibrarySearchQuery('');
    setCurrentTab('library');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectInstrumentFromAnywhere = (instrument: string) => {
    setLibraryInstrumentFilter(instrument);
    setLibraryGenreFilter('');
    setLibrarySearchQuery('');
    setCurrentTab('library');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPack = (pack: Pack) => {
    setSelectedPack(pack);
    setCurrentTab('pack-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSoundDetail = (sound: Sound) => {
    setSelectedSoundDetail(sound);
    setCurrentTab('sound-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-[#e2e8f0] flex flex-col relative selection:bg-[#00f0ff] selection:text-black font-sans">
      
      {/* Top Ambient Glow Accents (Y2K Neon) */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#00f0ff]/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/3 right-10 w-80 h-80 bg-[#ff7700]/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-[#c084fc]/10 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={navigateTo}
        onOpenAudioSearch={() => setIsAudioSearchOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 relative z-10">
        {currentTab === 'discover' && (
          <DiscoverPage
            onSelectGenre={handleSelectGenreFromAnywhere}
            onSelectInstrument={handleSelectInstrumentFromAnywhere}
            onSelectPack={handleOpenPack}
            onSelectSoundDetail={handleOpenSoundDetail}
            onNavigate={navigateTo}
            onOpenAudioSearch={() => setIsAudioSearchOpen(true)}
          />
        )}

        {currentTab === 'library' && (
          <LibraryPage
            initialGenre={libraryGenreFilter}
            initialInstrument={libraryInstrumentFilter}
            initialSearchQuery={librarySearchQuery}
            onSelectSoundDetail={handleOpenSoundDetail}
          />
        )}

        {currentTab === 'genres' && (
          <AllGenresPage
            onSelectGenre={handleSelectGenreFromAnywhere}
            onBack={() => navigateTo('discover')}
          />
        )}

        {currentTab === 'packs' && (
          <PacksPage onSelectPack={handleOpenPack} />
        )}

        {currentTab === 'pack-detail' && selectedPack && (
          <PackDetailPage
            pack={selectedPack}
            onBack={() => navigateTo('packs')}
            onSelectSoundDetail={handleOpenSoundDetail}
          />
        )}

        {currentTab === 'sound-detail' && selectedSoundDetail && (
          <SoundDetailPage
            sound={selectedSoundDetail}
            onBack={() => navigateTo('library')}
            onSelectRelatedSound={handleOpenSoundDetail}
            onNavigateToGenre={handleSelectGenreFromAnywhere}
          />
        )}

        {currentTab === 'my-library' && (
          <MyLibraryPage
            onSelectSoundDetail={handleOpenSoundDetail}
            onNavigateToCatalog={() => navigateTo('library')}
          />
        )}

        {currentTab === 'liked' && (
          <LikedSoundsPage
            onSelectSoundDetail={handleOpenSoundDetail}
            onNavigateToCatalog={() => navigateTo('library')}
          />
        )}

        {currentTab === 'upload' && (
          <UploadPage
            onNavigateToLicense={() => navigateTo('license')}
            onNavigateToTerms={() => navigateTo('terms')}
          />
        )}

        {currentTab === 'admin' && <AdminPage />}

        {currentTab === 'license' && (
          <LicensePage onBack={() => navigateTo('discover')} />
        )}

        {currentTab === 'terms' && (
          <TermsPage onBack={() => navigateTo('discover')} />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 y2k-glass-subtle py-8 px-4 sm:px-6 relative z-10 text-xs text-white/50 mb-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-sm text-white">SoundVault</span>
            <span>•</span>
            <span>Royalty-Free Audio Catalog</span>
          </div>

          <div className="flex items-center gap-4 text-white/60">
            <button onClick={() => navigateTo('discover')} className="hover:text-white">Discover</button>
            <button onClick={() => navigateTo('library')} className="hover:text-white">Library</button>
            <button onClick={() => navigateTo('genres')} className="hover:text-white">All Genres</button>
            <button onClick={() => navigateTo('license')} className="hover:text-white">License</button>
            <button onClick={() => navigateTo('terms')} className="hover:text-white">Terms</button>
          </div>

          <div className="font-mono-num text-[11px] text-white/40">
            Client-Side Web Audio • 100% Royalty Free
          </div>
        </div>
      </footer>

      {/* Floating Bottom Mini Player with Canvas Waveform */}
      <MiniPlayer onOpenDetail={handleOpenSoundDetail} />

      {/* Modals & Toasts */}
      <LoginModal />
      <AudioSearchModal
        isOpen={isAudioSearchOpen}
        onClose={() => setIsAudioSearchOpen(false)}
        onSelectDetail={handleOpenSoundDetail}
      />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AudioPlayerProvider>
        <MainApp />
      </AudioPlayerProvider>
    </StoreProvider>
  );
}
