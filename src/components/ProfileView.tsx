import React from 'react';
import { motion } from 'motion/react';
import { Settings, Plus, MoveUp, Edit2, Mail, Bookmark, Clock, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Pin } from '../types';
import MasonryGrid from './MasonryGrid';
import { doc, onSnapshot, setDoc, deleteDoc, serverTimestamp, increment, updateDoc, collection, addDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import LoadingScreen from './LoadingScreen';
import ConfirmationModal from './ConfirmationModal';
import NeuralActivityChart from './NeuralActivityChart';

interface ProfileViewProps {
  userId?: string; // Optional target user ID
  createdPins: Pin[];
  savedPins: Pin[];
  recentPins: Pin[];
  onEditProfile: () => void;
  onSettingsClick: () => void;
  onPinClick?: (pin: Pin) => void;
  onFollowersClick?: (uid: string) => void;
  onFollowingClick?: (uid: string) => void;
  onMessageClick?: (uid: string) => void;
}

export default function ProfileView({ 
  userId, 
  createdPins, 
  savedPins, 
  recentPins,
  onEditProfile, 
  onSettingsClick, 
  onPinClick,
  onFollowersClick,
  onFollowingClick,
  onMessageClick,
}: ProfileViewProps) {
  const { user, profileData: currentUserProfile } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'created' | 'saved' | 'history'>('created');
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [targetProfile, setTargetProfile] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);
  
  // Bulk selection states
  const [selectionMode, setSelectionMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // If viewing someone else, fetch their profile
  React.useEffect(() => {
    if (userId && userId !== user?.uid) {
      setLoading(true);
      const userRef = doc(db, 'users', userId);
      const unsubscribe = onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          setTargetProfile(snapshot.data());
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      setTargetProfile(null);
      setLoading(false);
    }
  }, [userId, user?.uid]);

  // Check if current user follows this target
  React.useEffect(() => {
    if (!user || !userId || userId === user.uid) {
      setIsFollowing(false);
      return;
    }
    const followRef = doc(db, 'users', user.uid, 'following', userId);
    const unsubscribe = onSnapshot(followRef, (snapshot) => {
      setIsFollowing(snapshot.exists());
    });
    return unsubscribe;
  }, [user, userId]);

  const handleFollowToggle = async () => {
    if (!user || !userId || userId === user.uid) return;
    
    const followerRef = doc(db, 'users', userId, 'followers', user.uid);
    const followingRef = doc(db, 'users', user.uid, 'following', userId);
    const targetUserRef = doc(db, 'users', userId);
    const currentUserRef = doc(db, 'users', user.uid);

    try {
      if (isFollowing) {
        await deleteDoc(followerRef);
        await deleteDoc(followingRef);
        await updateDoc(targetUserRef, { followersCount: increment(-1) });
        await updateDoc(currentUserRef, { followingCount: increment(-1) });
      } else {
        await setDoc(followerRef, { 
          createdAt: serverTimestamp(),
          photoURL: currentUserProfile?.photoURL || user.photoURL || null,
          displayName: currentUserProfile?.displayName || user.displayName || null,
          handle: currentUserProfile?.handle || null
        });
        await setDoc(followingRef, { 
          createdAt: serverTimestamp(),
          photoURL: targetProfile?.photoURL || null,
          displayName: targetProfile?.displayName || null,
          handle: targetProfile?.handle || null
        });
        await updateDoc(targetUserRef, { followersCount: increment(1) });
        await updateDoc(currentUserRef, { followingCount: increment(1) });
        
        // Push notification to target
        await addDoc(collection(db, 'users', userId, 'notifications'), {
          type: 'follow',
          message: `${currentUserProfile?.displayName || user.displayName || 'A new signal'} is now tracking your frequency.`,
          read: false,
          createdAt: serverTimestamp(),
          fromUser: {
            name: currentUserProfile?.displayName || user.displayName || 'Anonymous',
            avatar: currentUserProfile?.photoURL || user.photoURL || ''
          }
        });
      }
    } catch (e) {
      console.error("Transmission relay error (Follow failing):", e);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    setIsProcessing(true);
    try {
      const batch = writeBatch(db);
      selectedIds.forEach(id => {
        batch.delete(doc(db, 'pins', id));
      });
      await batch.commit();
      
      setSelectionMode(false);
      setSelectedIds([]);
    } catch (e) {
      console.error("Neural purge error (Bulk delete failed):", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const isOwnProfile = !userId || userId === user?.uid;
  const profile = isOwnProfile ? currentUserProfile : targetProfile;
  const email = isOwnProfile ? user?.email : profile?.email;
  const pins = isOwnProfile ? createdPins : createdPins.filter(p => p.userId === userId);
  const saves = isOwnProfile ? savedPins : []; // Can't view other people's saves for privacy

  if (loading) return (
    <LoadingScreen 
      fullScreen={false} 
      message="Hydrating Profile..." 
      subMessage="Fetching archival identity and transmitted signal history" 
    />
  );

  if (!profile && !loading) {
    if (isOwnProfile && !user) return null;
    if (!isOwnProfile) return <div className="text-center py-20 text-text-muted">User not found</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center pt-20 px-6 max-w-5xl mx-auto w-full pb-32"
    >
      {/* Profile Header: Centralized Identity Node */}
      <div className="flex flex-col items-center w-full max-w-2xl px-4">
        <div className="relative group cursor-pointer mb-8" onClick={isOwnProfile ? onEditProfile : undefined}>
          <div 
            className="w-36 h-36 rounded-full overflow-hidden border-4 border-surface shadow-2xl relative transition-all duration-700 ring-1 ring-white/10"
            style={{ 
              boxShadow: profile?.accentColor ? `0 0 60px ${profile.accentColor}22` : '0 20px 80px rgba(0,0,0,0.5)',
              borderColor: profile?.accentColor || 'var(--color-surface)'
            }}
          >
            <img 
              src={profile?.photoURL || 'https://i.pravatar.cc/150'} 
              alt={profile?.displayName || ''} 
              className="w-full h-full object-cover"
            />
          </div>
          {isOwnProfile && (
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-1">
                <Edit2 className="w-5 h-5 text-white" />
                <span className="text-[10px] font-bold uppercase tracking-[2px] text-white">Modify</span>
              </div>
            </div>
          )}
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-text-main tracking-tight px-4">
            {profile?.displayName || 'void'}
          </h1>
          <p className="text-sm text-text-muted font-medium tracking-[3px] uppercase opacity-60">
            @{profile?.handle || email?.split('@')[0]}
          </p>
        </div>

        {/* Neural Metrics: Signal Synchronization Data */}
        <div className="mt-10 mb-8 w-full flex justify-center items-center gap-2 sm:gap-8 text-center border-y border-white/5 py-6">
          <div className="flex-1 flex flex-col items-center px-4 group cursor-pointer" onClick={() => setActiveTab('created')}>
            <span className="text-2xl font-bold text-text-main group-hover:text-accent transition-colors">{pins.length}</span>
            <span className="text-[9px] uppercase font-bold tracking-[3px] text-text-muted opacity-40 group-hover:opacity-100 transition-all">Signals</span>
          </div>
          <div className="h-8 w-px bg-white/5" />
          <div className="flex-1 flex flex-col items-center px-4 group cursor-pointer" onClick={() => onFollowersClick?.(userId || user?.uid || '')}>
            <span className="text-2xl font-bold text-text-main group-hover:text-accent transition-colors">{profile?.followersCount || 0}</span>
            <span className="text-[9px] uppercase font-bold tracking-[3px] text-text-muted opacity-40 group-hover:opacity-100 transition-all">Followers</span>
          </div>
          <div className="h-8 w-px bg-white/5" />
          <div className="flex-1 flex flex-col items-center px-4 group cursor-pointer" onClick={() => onFollowingClick?.(userId || user?.uid || '')}>
            <span className="text-2xl font-bold text-text-main group-hover:text-accent transition-colors">{profile?.followingCount || 0}</span>
            <span className="text-[9px] uppercase font-bold tracking-[3px] text-text-muted opacity-40 group-hover:opacity-100 transition-all">Following</span>
          </div>
        </div>

        {/* Profile Actions: Frequency Linkage */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
          {isOwnProfile ? (
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={onEditProfile}
                className="flex-1 sm:flex-none sm:px-10 bg-white text-midnight h-12 rounded-2xl text-[11px] font-bold uppercase tracking-[2px] transition-all hover:bg-white/90 hover:scale-105 shadow-xl flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" /> Modify Profile
              </button>
              <button 
                onClick={onSettingsClick}
                className="w-12 h-12 rounded-2xl bg-surface border border-white/10 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-white/5 transition-all"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-4 w-full sm:w-auto">
              <button 
                onClick={handleFollowToggle}
                className={`flex-1 sm:flex-none sm:px-12 h-12 rounded-2xl text-[11px] font-bold uppercase tracking-[2px] transition-all shadow-xl ${isFollowing ? 'bg-surface border border-white/10 text-white hover:bg-white/5' : 'bg-white text-midnight hover:bg-white/90 hover:scale-105'}`}
              >
                {isFollowing ? 'Frequency Synced' : 'Sync Identity'}
              </button>
              <button 
                onClick={() => onMessageClick?.(userId!)}
                className="w-12 h-12 rounded-2xl bg-surface border border-white/10 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-white/5 transition-all"
              >
                <Mail className="w-5 h-5" />
              </button>
            </div>
          )}

          {isOwnProfile && activeTab === 'created' && (
            <button 
              onClick={() => {
                setSelectionMode(!selectionMode);
                setSelectedIds([]);
              }}
              className={`h-12 px-6 rounded-2xl text-[10px] font-bold uppercase tracking-[2px] transition-all border flex items-center gap-2 ${selectionMode ? 'bg-accent/10 border-accent text-accent shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-white/5 border-white/10 text-text-muted hover:text-text-main hover:bg-white/10'}`}
            >
              {selectionMode ? 'Neural Lock' : 'Batch Orchestrate'}
            </button>
          )}
        </div>

        {pins.length > 0 && (
          <div className="w-full mt-12">
            <NeuralActivityChart pins={pins} />
          </div>
        )}
      </div>

      {/* Neural Hub Tabs: Stream Selection */}
      <div className="mt-20 w-full max-w-md">
        <div className="relative bg-white/5 border border-white/5 p-1.5 rounded-2xl flex items-center backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('created')}
            className={`relative flex-1 z-10 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-500 ${activeTab === 'created' ? 'text-midnight' : 'text-text-muted hover:text-text-main'}`}
          >
            <Plus className={`w-3.5 h-3.5 ${activeTab === 'created' ? 'text-midnight' : 'text-text-muted'}`} />
            <span className="text-[10px] font-bold uppercase tracking-[2px]">Created</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('saved')}
            className={`relative flex-1 z-10 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-500 ${activeTab === 'saved' ? 'text-midnight' : 'text-text-muted hover:text-text-main'}`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${activeTab === 'saved' ? 'text-midnight' : 'text-text-muted'}`} />
            <span className="text-[10px] font-bold uppercase tracking-[2px]">Saved</span>
          </button>

          {isOwnProfile && (
            <button 
              onClick={() => setActiveTab('history')}
              className={`relative flex-1 z-10 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-500 ${activeTab === 'history' ? 'text-midnight' : 'text-text-muted hover:text-text-main'}`}
            >
              <Clock className={`w-3.5 h-3.5 ${activeTab === 'history' ? 'text-midnight' : 'text-text-muted'}`} />
              <span className="text-[10px] font-bold uppercase tracking-[2px]">History</span>
            </button>
          )}

          {/* Active Tab Highlight Animation */}
          <motion.div 
            className="absolute top-1.5 bottom-1.5 left-1.5 bg-white rounded-xl shadow-[0_4px_20px_rgba(255,255,255,0.2)]"
            initial={false}
            animate={{
              x: activeTab === 'created' ? 0 : activeTab === 'saved' ? (isOwnProfile ? '100.5%' : '100%') : '201%',
              width: isOwnProfile ? 'calc(33.333% - 4px)' : 'calc(50% - 3px)'
            }}
            transition={{ 
              type: "spring", 
              stiffness: 450, 
              damping: 38 
            }}
          />
        </div>
      </div>

      {/* Pin Grid or Empty State: Sub-archival Manifestation */}
      <div className="w-full mt-16 px-4">
        {selectionMode && activeTab === 'created' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 glass rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-main uppercase tracking-widest">{selectedIds.length} Signals Captured</p>
                  <p className="text-[10px] text-text-muted opacity-60">Neural orchestration in progress</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedIds(pins.map(p => p.id))}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all"
                >
                  Sync All
                </button>
                <button 
                  onClick={() => setSelectedIds([])}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all text-text-muted"
                >
                  Clear Signal
                </button>
              </div>
            </div>

            <button 
              disabled={selectedIds.length === 0 || isProcessing}
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="w-full sm:w-auto px-10 py-4 bg-red-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-[0_10px_30px_rgba(239,68,68,0.2)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Purge Synced Signals
            </button>
          </motion.div>
        )}

        {activeTab === 'created' ? (
          pins.length > 0 ? (
            <div className="px-4">
              <MasonryGrid 
                pins={pins} 
                onPinClick={onPinClick} 
                isSelectionMode={selectionMode}
                selectedIds={selectedIds}
                onToggleSelection={toggleSelection}
              />
            </div>
          ) : (
            <div className="mt-24 flex flex-col items-center gap-6 text-center text-text-muted">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/10 blur-3xl rounded-full" />
                <div className="relative w-24 h-24 rounded-full border border-white/5 flex items-center justify-center bg-black/20">
                  <Plus className="w-6 h-6 text-white/10" />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[3px] text-text-main">Frequency Offline</p>
                <p className="text-xs mt-2 text-white/20">The source has not yet shared its light.</p>
              </div>
              {isOwnProfile && (
                <button className="mt-4 bg-white text-midnight px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 hover:scale-105 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                  Transmit First Signal
                </button>
              )}
            </div>
          )
        ) : activeTab === 'saved' ? (
          saves.length > 0 ? (
            <div className="px-4">
              <MasonryGrid pins={saves} onPinClick={onPinClick} />
            </div>
          ) : (
            <div className="mt-24 flex flex-col items-center gap-6 text-center text-text-muted">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/10 blur-3xl rounded-full" />
                <div className="relative w-24 h-24 rounded-full border border-white/5 flex items-center justify-center bg-black/20">
                  <Bookmark className="w-6 h-6 text-white/10" />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[3px] text-text-main">No Echoes Found</p>
                <p className="text-xs mt-2 text-white/20">No external signals have been synchronized yet.</p>
              </div>
              {isOwnProfile && (
                <button className="mt-4 bg-white/5 border border-white/10 text-white px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl">
                  Synchronize Feed
                </button>
              )}
            </div>
          )
        ) : (
          recentPins.length > 0 ? (
            <div className="px-4">
              <MasonryGrid pins={recentPins} onPinClick={onPinClick} />
            </div>
          ) : (
            <div className="mt-24 flex flex-col items-center gap-6 text-center text-text-muted">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/10 blur-3xl rounded-full" />
                <div className="relative w-24 h-24 rounded-full border border-white/5 flex items-center justify-center bg-black/20">
                  <Clock className="w-6 h-6 text-white/10" />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[3px] text-text-main">Neural Logs Clear</p>
                <p className="text-xs mt-2 text-white/20">No recent interactions have been archival logged.</p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Floating Action Buttons hidden here as we moved them to App for global access */}
      
      <ConfirmationModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title="Neural Purge Initiation"
        message={`You are about to permanently erase ${selectedIds.length} signal transmission(s) from the archival core. This operation is irreversible.`}
        confirmText="Execute Purge"
        variant="danger"
      />
    </motion.div>
  );
}
