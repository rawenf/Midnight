import React from 'react';
import { motion } from 'motion/react';
import { Settings, Plus, MoveUp, Edit2, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Pin } from '../types';
import MasonryGrid from './MasonryGrid';
import { doc, onSnapshot, setDoc, deleteDoc, serverTimestamp, increment, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import LoadingScreen from './LoadingScreen';

interface ProfileViewProps {
  userId?: string; // Optional target user ID
  createdPins: Pin[];
  savedPins: Pin[];
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
  onEditProfile, 
  onSettingsClick, 
  onPinClick,
  onFollowersClick,
  onFollowingClick,
  onMessageClick,
}: ProfileViewProps) {
  const { user, profileData: currentUserProfile } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'created' | 'saved'>('created');
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [targetProfile, setTargetProfile] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);

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
      className="flex flex-col items-center pt-20 px-6 max-w-4xl mx-auto"
    >
      {/* Profile Header */}
      <div className="relative group cursor-pointer" onClick={isOwnProfile ? onEditProfile : undefined}>
        <div 
          className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface shadow-2xl relative transition-all duration-700"
          style={{ 
            boxShadow: profile?.accentColor ? `0 0 60px ${profile.accentColor}22` : '0 10px 40px rgba(0,0,0,0.4)',
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
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-midnight px-3 py-1 rounded">Change</span>
          </div>
        )}
      </div>

      <h1 className="mt-6 text-4xl font-display font-bold text-text-main tracking-tight">
        {profile?.displayName || 'void'}
      </h1>
      <p className="mt-1 text-sm text-text-muted font-medium tracking-tight">
        @{profile?.handle || email?.split('@')[0]}
      </p>

      {/* Profile Actions */}
      <div className="mt-8 flex gap-3">
        {isOwnProfile ? (
          <>
            <button 
              onClick={onEditProfile}
              className="bg-surface-hover hover:bg-white/10 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all border border-border"
            >
              Edit Profile
            </button>
            <button 
              onClick={onSettingsClick}
              className="bg-transparent hover:bg-white/5 text-white p-2.5 rounded-xl border border-border transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="flex gap-3">
            <button 
              onClick={handleFollowToggle}
              className={`px-12 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${isFollowing ? 'bg-surface border border-white/10 text-white' : 'bg-white text-midnight hover:bg-accent hover:text-white shadow-[0_10px_30px_rgba(255,255,255,0.1)]'}`}
            >
              {isFollowing ? 'Tracking Source' : 'Link Source'}
            </button>
            <button 
              onClick={() => onMessageClick?.(userId!)}
              className="w-12 h-12 rounded-full bg-surface border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-all group"
            >
              <Mail className="w-5 h-5 group-hover:scale-110 transition-all" />
            </button>
          </div>
        )}
      </div>

      {/* Main Tabs */}
      <div className="mt-16 w-full flex justify-center border-b border-white/5 mb-8">
        <button 
          onClick={() => setActiveTab('created')}
          className={`px-8 py-4 text-sm font-bold tracking-widest uppercase transition-all relative ${activeTab === 'created' ? 'text-white' : 'text-text-muted hover:text-white'}`}
        >
          Created
          {activeTab === 'created' && (
            <motion.div 
              layoutId="tab-underline" 
              className="absolute bottom-0 left-0 right-0 h-0.5" 
              style={{ backgroundColor: profile?.accentColor || 'var(--color-accent)' }}
            />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('saved')}
          className={`px-8 py-4 text-sm font-bold tracking-widest uppercase transition-all relative ${activeTab === 'saved' ? 'text-white' : 'text-text-muted hover:text-white'}`}
        >
          Saved
          {activeTab === 'saved' && (
            <motion.div 
              layoutId="tab-underline" 
              className="absolute bottom-0 left-0 right-0 h-0.5" 
              style={{ backgroundColor: profile?.accentColor || 'var(--color-accent)' }}
            />
          )}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="w-full flex justify-center gap-12 text-sm text-text-muted mb-12">
        <div 
          onClick={() => setActiveTab('created')}
          className="flex gap-2 items-center cursor-pointer hover:text-text-main transition-colors"
        >
          <span className="font-bold text-text-main">{pins.length}</span>
          <span className="font-medium tracking-tight">Created</span>
        </div>
        {isOwnProfile && (
          <div 
            onClick={() => setActiveTab('saved')}
            className="flex gap-2 items-center cursor-pointer hover:text-text-main transition-colors"
          >
            <span className="font-bold text-text-main">{saves.length}</span>
            <span className="font-medium tracking-tight">Saved</span>
          </div>
        )}
        <div 
          onClick={() => onFollowersClick?.(userId || user?.uid || '')}
          className="flex gap-2 items-center cursor-pointer hover:text-text-main transition-colors"
        >
          <span className="font-bold text-text-main">
            {profile?.followersCount || 0}
          </span>
          <span className="font-medium tracking-tight">Followers</span>
        </div>
        <div 
          onClick={() => onFollowingClick?.(userId || user?.uid || '')}
          className="flex gap-2 items-center cursor-pointer hover:text-text-main transition-colors"
        >
          <span className="font-bold text-text-main">
            {profile?.followingCount || 0}
          </span>
          <span className="font-medium tracking-tight">Following</span>
        </div>
      </div>

      {/* Pin Grid or Empty State */}
      <div className="w-full mt-2">
        {activeTab === 'created' ? (
          pins.length > 0 ? (
            <div className="px-4">
              <MasonryGrid pins={pins} onPinClick={onPinClick} />
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
                <button className="mt-4 bg-white text-midnight px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-all shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                  Transmit First Signal
                </button>
              )}
            </div>
          )
        ) : (
          saves.length > 0 ? (
            <div className="px-4">
              <MasonryGrid pins={saves} onPinClick={onPinClick} />
            </div>
          ) : (
            <div className="mt-24 flex flex-col items-center gap-6 text-center text-text-muted">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/10 blur-3xl rounded-full" />
                <div className="relative w-24 h-24 rounded-full border border-white/5 flex items-center justify-center bg-black/20">
                  <MoveUp className="w-6 h-6 text-white/10 rotate-45" />
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
        )}
      </div>

      {/* Floating Action Buttons hidden here as we moved them to App for global access */}
    </motion.div>
  );
}
