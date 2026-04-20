import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import MasonryGrid from './components/MasonryGrid';
import UploadModal from './components/UploadModal';
import ProfileView from './components/ProfileView';
import NotificationsPanel from './components/NotificationsPanel';
import SettingsModal from './components/SettingsModal';
import PinDetailView from './components/PinDetailView';
import LoadingScreen from './components/LoadingScreen';
import BottomNav from './components/BottomNav';
import UsersModal from './components/UsersModal';
import MessagesPanel from './components/MessagesPanel';
import { Category, Pin } from './types';
import { collection, query, orderBy, onSnapshot, where, getDocs, limit } from 'firebase/firestore';
import { db } from './lib/firebase';
import { useAuth } from './contexts/AuthContext';
import { Plus, MoveUp, Search, TrendingUp, Clock, Filter } from 'lucide-react';

export default function App() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'trending'>('newest');
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [displayCount, setDisplayCount] = useState(15);
  const [isSyncing, setIsSyncing] = useState(false);
  const observerTarget = useRef(null);

  // Reset pagination on filter change
  useEffect(() => {
    setDisplayCount(15);
  }, [activeCategory, activeColor, debouncedSearch, sortOrder]);

  // Social Modal States
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [usersModalTitle, setUsersModalTitle] = useState('');
  const [usersModalData, setUsersModalData] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setDebouncedSearch(searchQuery);
      
      // User search logic
      if (searchQuery.trim().length >= 2) {
        const uRef = collection(db, 'users');
        const searchLower = searchQuery.toLowerCase().trim();
        const q = query(uRef, limit(20)); 
        const snap = await getDocs(q);
        const users = snap.docs
          .map(d => ({ uid: d.id, ...d.data() }))
          .filter((u: any) => 
            u.displayName?.toLowerCase().includes(searchLower) || 
            u.handle?.toLowerCase().includes(searchLower)
          );
        setSearchedUsers(users);
      } else {
        setSearchedUsers([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [currentView, setCurrentView] = useState<'feed' | 'profile' | 'detail' | 'notifications'>('feed');
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [chatTargetUserId, setChatTargetUserId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditProfileMode, setIsEditProfileMode] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [realPins, setRealPins] = useState<Pin[]>([]);
  const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [savedPinIds, setSavedPinIds] = useState<string[]>([]);

  useEffect(() => {
    const pinsRef = collection(db, 'pins');
    const q = sortOrder === 'newest' 
      ? query(pinsRef, orderBy('createdAt', 'desc'))
      : query(pinsRef, orderBy('likesCount', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pinsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Pin[];
      setRealPins(pinsData);
      setIsInitialLoading(false);
    }, (error) => {
      console.warn("Pins listener error:", error);
      setIsInitialLoading(false);
    });

    return unsubscribe;
  }, [sortOrder]);

  useEffect(() => {
    if (!user) {
      setSavedPinIds([]);
      return;
    }
    const q = query(collection(db, 'users', user.uid, 'saves'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSavedPinIds(snapshot.docs.map(doc => doc.id));
    }, (error) => {
      console.warn("Saves listener error:", error);
    });
    return unsubscribe;
  }, [user]);

  const createdPins = user ? realPins.filter(pin => pin.userId === user.uid) : [];
  const savedPins = realPins.filter(pin => savedPinIds.includes(pin.id));

  const filteredPins = realPins.filter(pin => {
    const categoryMatch = activeCategory === 'All' || 
                         pin.category === activeCategory || 
                         pin.tags?.includes(activeCategory);
    
    // Normalize color matching
    const colorMatch = !activeColor || 
                      (pin.color?.toLowerCase() === activeColor?.toLowerCase());
    
    const searchLower = debouncedSearch.toLowerCase().trim();
    if (!searchLower) return categoryMatch && colorMatch;

    const titleMatch = pin.title?.toLowerCase().includes(searchLower);
    const descMatch = pin.description?.toLowerCase().includes(searchLower);
    const tagMatch = pin.tags?.some(t => t.toLowerCase().includes(searchLower));

    return categoryMatch && colorMatch && (titleMatch || descMatch || tagMatch);
  });

  const visiblePins = filteredPins.slice(0, displayCount);

  // Infinite Scroll Trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && filteredPins.length > displayCount) {
          setIsSyncing(true);
          setTimeout(() => {
            setDisplayCount(prev => prev + 10);
            setIsSyncing(false);
          }, 800);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [filteredPins.length, displayCount]);

  const handlePinClick = (pin: Pin) => {
    setSelectedPin(pin);
    setCurrentView('detail');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPin) {
          setSelectedPin(null);
          setCurrentView('feed');
        }
        setIsUploadModalOpen(false);
        setIsNotificationsOpen(false);
        setIsSettingsOpen(false);
        setIsUsersModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPin]);

  return (
    <div className="min-h-screen pt-24 flex flex-col relative overflow-x-hidden">
      <div className="atmos-bg" />
      <div className="scan-line" />
      
      <Navbar 
        onUploadClick={() => setIsUploadModalOpen(true)} 
        onColorChange={(color) => {
          setActiveColor(color);
          if (currentView !== 'feed') setCurrentView('feed');
        }}
        onSearchChange={(query) => {
          setSearchQuery(query);
          if (currentView !== 'feed') setCurrentView('feed');
        }}
        onProfileClick={() => { setTargetUserId(user?.uid || null); setCurrentView('profile'); }}
        onFeedClick={() => { setCurrentView('feed'); setSelectedPin(null); setTargetUserId(null); }}
        onNotificationsClick={() => setIsNotificationsOpen(true)}
        onMessagesClick={() => setIsMessagesOpen(true)}
        activeColor={activeColor}
        searchQuery={searchQuery}
        currentView={currentView === 'detail' ? 'feed' : currentView}
      />
      
      <main className="max-w-[1400px] mx-auto flex-1 w-full relative">
        <AnimatePresence mode="wait">
          {currentView === 'feed' ? (
            <motion.div
              key="feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CategoryBar 
                activeCategory={activeCategory} 
                onCategoryChange={setActiveCategory} 
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
              />
              
              <div className="mt-4 px-10">
                {isInitialLoading ? (
                  <LoadingScreen 
                    fullScreen={false} 
                    message="Acquiring Discovery Stream" 
                    subMessage="Scanning all frequencies for high-fidelity signals..." 
                  />
                ) : (
                  <>
                    {searchedUsers.length > 0 && (
                      <div className="mb-12">
                        <h4 className="text-[10px] uppercase font-bold tracking-[3px] text-text-muted mb-6 px-2">Identities Found</h4>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                          {searchedUsers.map(u => (
                            <div 
                              key={u.uid}
                              onClick={() => { setTargetUserId(u.uid); setCurrentView('profile'); }}
                              className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-surface border border-border min-w-[120px] hover:border-white/20 transition-all cursor-pointer group"
                            >
                              <div className="w-16 h-16 rounded-full border border-border overflow-hidden group-hover:scale-105 transition-transform">
                                <img src={u.photoURL || 'https://i.pravatar.cc/150'} className="w-full h-full object-cover" />
                              </div>
                              <div className="text-center">
                                <p className="text-[10px] font-bold truncate max-w-[100px]">{u.displayName}</p>
                                <p className="text-[8px] text-text-muted">@{u.handle || 'void'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {visiblePins.length > 0 ? (
                      <>
                        <MasonryGrid pins={visiblePins} onPinClick={handlePinClick} />
                        
                        {/* Intersection Observer Target */}
                        <div ref={observerTarget} className="h-20 flex items-center justify-center">
                          {isSyncing && (
                            <div className="flex items-center gap-2 text-text-muted">
                              <div className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
                              <div className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                              <div className="w-1 h-1 bg-accent rounded-full animate-bounce" />
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-40 text-text-muted space-y-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full" />
                          <div className="relative w-32 h-32 rounded-full border border-white/5 flex items-center justify-center bg-black/40">
                             <div className="w-16 h-16 border border-accent/30 rounded-full animate-ping opacity-20" />
                             <Search className="w-8 h-8 text-accent animate-pulse" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-display font-bold text-text-main tracking-tight">No signals found</p>
                          <p className="text-xs mt-2 uppercase tracking-[3px] text-white/20">Scanning the static... try a different frequency</p>
                        </div>
                        {debouncedSearch && (
                          <button 
                            onClick={() => setSearchQuery('')}
                            className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 transition-all"
                          >
                            Reset Signal Filter
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ) : currentView === 'detail' && selectedPin ? (
            <PinDetailView 
              pin={selectedPin} 
              allPins={realPins}
              onBack={() => {
                setSelectedPin(null);
                setCurrentView('feed');
              }}
              onPinClick={handlePinClick}
              onSearch={setSearchQuery}
              onDelete={() => {
                setSelectedPin(null);
                setCurrentView('feed');
              }}
              onProfileClick={(uid) => { setTargetUserId(uid); setCurrentView('profile'); }}
            />
          ) : (
            <ProfileView 
              userId={targetUserId || user?.uid}
              createdPins={createdPins}
              savedPins={savedPins}
              onEditProfile={() => { setIsEditProfileMode(true); setIsSettingsOpen(true); }}
              onSettingsClick={() => { setIsEditProfileMode(false); setIsSettingsOpen(true); }}
              onPinClick={handlePinClick}
              onFollowersClick={async (uid) => {
                setUsersModalTitle('Followers');
                setIsUsersModalOpen(true);
                const q = query(collection(db, 'users', uid, 'followers'), limit(50));
                const snap = await getDocs(q);
                setUsersModalData(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
              }}
              onFollowingClick={async (uid) => {
                setUsersModalTitle('Following');
                setIsUsersModalOpen(true);
                const q = query(collection(db, 'users', uid, 'following'), limit(50));
                const snap = await getDocs(q);
                setUsersModalData(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
              }}
              onMessageClick={(uid) => {
                setChatTargetUserId(uid);
                setIsMessagesOpen(true);
              }}
            />
          )}
        </AnimatePresence>

        <div className="fixed bottom-24 md:bottom-10 right-6 sm:right-10 flex flex-col gap-4 z-40">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="w-12 h-12 bg-white text-midnight rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all md:flex hidden"
          >
            <Plus className="w-6 h-6" />
          </button>
          <button 
            onClick={scrollToTop}
            className="w-12 h-12 bg-surface border border-border rounded-full flex items-center justify-center text-text-muted hover:text-text-main hover:border-white/30 transition-all shadow-xl"
          >
            <MoveUp className="w-6 h-6" />
          </button>
        </div>
      </main>

      <BottomNav 
        currentView={currentView}
        onViewChange={(view) => {
          if (view === 'search') {
            setCurrentView('feed');
            // Trigger search focus if possible or just show feed
          } else {
            if (view === 'profile') setTargetUserId(user?.uid || null);
            setCurrentView(view);
          }
        }}
        onUploadClick={() => setIsUploadModalOpen(true)}
      />

      <UsersModal 
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
        title={usersModalTitle}
        users={usersModalData}
        onUserClick={(uid) => { setTargetUserId(uid); setCurrentView('profile'); }}
      />

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />

      <NotificationsPanel 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <MessagesPanel 
        isOpen={isMessagesOpen}
        onClose={() => {
          setIsMessagesOpen(false);
          setChatTargetUserId(null);
        }}
        initialChatUserId={chatTargetUserId}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isEditProfile={isEditProfileMode}
      />

      <footer className="py-20 px-10 border-t border-border mt-20 flex flex-col items-center">
        <div className="font-display text-2xl font-extrabold tracking-[-0.04em] uppercase mb-8">
          Midnight
        </div>
        <div className="flex gap-12 text-[10px] font-medium tracking-[2px] text-text-muted uppercase mb-12">
          <a href="#" className="hover:text-text-main transition-colors">Discovery</a>
          <a href="#" className="hover:text-text-main transition-colors">Ethereal</a>
          <a href="#" className="hover:text-text-main transition-colors">Nocturnal Architecture</a>
          <a href="#" className="hover:text-text-main transition-colors">Dark Minimal</a>
        </div>
        <p className="text-[10px] text-white/10 tracking-[3px] uppercase">
          &copy; 2026 Midnight &bull; Designed for the void
        </p>
      </footer>
    </div>
  );
}
