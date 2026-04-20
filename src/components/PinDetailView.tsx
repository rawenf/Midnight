import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'motion/react';
import { 
  ArrowLeft, Share2, Download, MoreHorizontal, MessageSquare, 
  Heart, Bookmark, Send, Trash2, Edit2, Check, X, Smile, 
  Image as ImageIcon, Reply, CornerDownRight, Loader2,
  Info, Search, Info as InfoIcon, Eye, Plus, ExternalLink
} from 'lucide-react';
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import { Pin } from '../types';
import MasonryGrid from './MasonryGrid';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from './ConfirmationModal';
import { db, auth } from '../lib/firebase';
import { followUser, unfollowUser } from '../services/followService';
import { 
  doc, 
  collection, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  setDoc, 
  getDoc,
  updateDoc,
  increment,
  where
} from 'firebase/firestore';

interface PinDetailViewProps {
  pin: Pin;
  allPins: Pin[];
  onBack: () => void;
  onPinClick: (pin: Pin) => void;
  onSearch?: (query: string) => void;
  onDelete?: () => void;
  onProfileClick?: (userId: string) => void;
}

interface Comment {
  id: string;
  userId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  text: string;
  imageUrl?: string;
  parentId?: string;
  createdAt: any;
}

export default function PinDetailView({ pin, allPins, onBack, onPinClick, onSearch, onDelete, onProfileClick }: PinDetailViewProps) {
  const { user, profileData } = useAuth();
  const { theme } = useTheme();
  const isOwner = user?.uid === pin.userId;
  const [isFollowing, setIsFollowing] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentImage, setCommentImage] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(pin.title);
  const [editDesc, setEditDesc] = useState(pin.description);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [likers, setLikers] = useState<{uid: string, photoURL: string}[]>([]);
  const [spectators, setSpectators] = useState<{uid: string, photoURL: string}[]>([]);
  const [livePinData, setLivePinData] = useState<Pin | null>(null);
  const [authorProfile, setAuthorProfile] = useState<any | null>(null);
  const [imgDims, setImgDims] = useState({ width: 0, height: 0 });
  const [zoomScale, setZoomScale] = useState(1);
  const [isZooming, setIsZooming] = useState(false);
  
  // New UI states
  const [showComments, setShowComments] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [isMouseOverComments, setIsMouseOverComments] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  
  const commentInputRef = useRef<HTMLInputElement>(null);
  const commentFileRef = useRef<HTMLInputElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const zoomImageRef = useRef<HTMLImageElement>(null);
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const zoomPointerStart = useRef({ x: 0, y: 0 });

  // Recommendation Algorithm: Neural Proximity
  const recommendedPins = React.useMemo(() => {
    if (!pin.archetypes || pin.archetypes.length === 0) {
      return allPins
        .filter(p => p.id !== pin.id)
        .filter(p => p.category === pin.category || p.tags.some(tag => pin.tags.includes(tag)))
        .slice(0, 15);
    }
    
    return allPins
      .filter(p => p.id !== pin.id)
      .map(p => {
        // Calculate neural proximity based on archetype intersection
        const intersection = p.archetypes?.filter(a => pin.archetypes?.includes(a)) || [];
        const proximity = intersection.length / Math.max(pin.archetypes?.length || 1, p.archetypes?.length || 1);
        
        // Weight same category as secondary boost
        const categoryBoost = p.category === pin.category ? 0.2 : 0;
        
        return { ...p, proximity: proximity + categoryBoost };
      })
      .sort((a, b) => ((b as any).proximity || 0) - ((a as any).proximity || 0))
      .slice(0, 24);
  }, [allPins, pin.id, pin.archetypes, pin.category, pin.tags]);

  useEffect(() => {
    if (!user || !pin.id) return;

    // Presence System: Register / Update current user
    const presenceRef = doc(db, 'pins', pin.id, 'presence', user.uid);
    setDoc(presenceRef, {
      uid: user.uid,
      photoURL: profileData?.photoURL || user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
      lastSeen: serverTimestamp()
    }, { merge: true });

    // Cleanup presence on unmount
    return () => {
      deleteDoc(presenceRef).catch(() => {});
    };
  }, [pin.id, user?.uid, profileData?.photoURL]);

  useEffect(() => {
    // Initial scroll to top
    if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
    
    // Listen for comments
    const q = query(collection(db, 'pins', pin.id, 'comments'), orderBy('createdAt', 'asc'));
    const unsubscribeComments = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[]);
    }, (error) => {
      console.warn("Comments listener error:", error);
    });

    // Listen for author's current profile (Synchronized Identity)
    const authorRef = doc(db, 'users', pin.userId);
    const unsubscribeAuthor = onSnapshot(authorRef, (doc) => {
      if (doc.exists()) {
        setAuthorProfile(doc.data());
      }
    });

    // Increment Views
    const incrementViews = async () => {
      try {
        await updateDoc(doc(db, 'pins', pin.id), {
          viewsCount: increment(1)
        });

        // Record in User History (Neural Log)
        if (user) {
          const historyRef = doc(db, 'users', user.uid, 'history', pin.id);
          await setDoc(historyRef, {
            viewedAt: serverTimestamp()
          });
        }
      } catch (e) {
        console.warn("View record error:", e);
      }
    };
    incrementViews();

    // Detect image dimensions
    const img = new Image();
    img.src = pin.imageUrl;
    img.onload = () => {
      setImgDims({ width: img.naturalWidth, height: img.naturalHeight });
    };

    // Listen for likers
    const likersQ = query(collection(db, 'pins', pin.id, 'likes'), orderBy('createdAt', 'desc'));
    const unsubscribeLikers = onSnapshot(likersQ, (snapshot) => {
      setLikers(snapshot.docs.map(doc => ({ 
        uid: doc.id, 
        photoURL: doc.data().photoURL || `https://i.pravatar.cc/150?u=${doc.id}`
      })));
    }, (error) => {
      console.warn("Likers listener error:", error);
    });

    let unsubscribeLike: any;
    let unsubscribeSave: any;
    let unsubscribeFollow: any;

    const unsubscribePinData = onSnapshot(doc(db, 'pins', pin.id), (doc) => {
      if (doc.exists()) {
        setLivePinData({ id: doc.id, ...doc.data() } as Pin);
      }
    });

    if (user) {
      const likeRef = doc(db, 'pins', pin.id, 'likes', user.uid);
      unsubscribeLike = onSnapshot(likeRef, (doc) => {
        setIsLiked(doc.exists());
      }, (error) => {
        console.warn("Like listener error:", error);
      });
      
      const saveRef = doc(db, 'users', user.uid, 'saves', pin.id);
      unsubscribeSave = onSnapshot(saveRef, (doc) => {
        setIsSaved(doc.exists());
      }, (error) => {
        console.warn("Save listener error:", error);
      });

      const followRef = doc(db, 'users', user.uid, 'following', pin.userId);
      unsubscribeFollow = onSnapshot(followRef, (doc) => {
        setIsFollowing(doc.exists());
      }, (error) => {
        console.warn("Follow listener error:", error);
      });

      // Listen for other spectators
      const spectatorsQ = query(collection(db, 'pins', pin.id, 'presence'), orderBy('lastSeen', 'desc'));
      const unsubscribeSpectators = onSnapshot(spectatorsQ, (snapshot) => {
        setSpectators(snapshot.docs.map(doc => ({ 
          uid: doc.id, 
          photoURL: doc.data().photoURL 
        })).filter(s => s.uid !== user.uid).slice(0, 5));
      }, (error) => {
        console.warn("Spectators listener error:", error);
      });

      return () => {
        unsubscribeComments();
        unsubscribeAuthor();
        if (unsubscribeLikers) unsubscribeLikers();
        if (unsubscribeLike) unsubscribeLike();
        if (unsubscribeSave) unsubscribeSave();
        if (unsubscribeFollow) unsubscribeFollow();
        unsubscribeSpectators();
        unsubscribePinData();
      };
    }

    return () => {
      unsubscribeComments();
      if (unsubscribeLikers) unsubscribeLikers();
      unsubscribePinData();
    };
  }, [pin.id, user, pin.userId, profileData]);

  useEffect(() => {
    if (zoomScale <= 1.01 && zoomScale > 1) {
      setZoomScale(1);
    }
  }, [zoomScale]);

  useEffect(() => {
    const el = zoomContainerRef.current;
    if (!el) return;

    const handleNativeWheel = (e: WheelEvent) => {
      // Prioritize zoom over scroll when interacting with the signal
      e.preventDefault();
      const delta = -e.deltaY;
      const factor = 0.002; // Fine-tuned for smooth inspection
      setZoomScale(prev => {
        const next = prev + delta * factor;
        return Math.min(Math.max(next, 1), 5);
      });
    };

    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleNativeWheel);
  }, []);

  // Spatial Navigation Logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing || showEmojiPicker) return; 

      const currentIndex = allPins.findIndex(p => p.id === pin.id);
      if (e.key === 'ArrowRight' && currentIndex < allPins.length - 1) {
        onPinClick(allPins[currentIndex + 1]);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onPinClick(allPins[currentIndex - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin.id, allPins, onPinClick, isEditing, showEmojiPicker]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const st = e.currentTarget.scrollTop;
    if (!isMouseOverComments) {
      if (st > lastScrollTop && st > 50) {
        setShowComments(false);
      } else {
        setShowComments(true);
      }
    }
    setLastScrollTop(st <= 0 ? 0 : st);
  };

  const handleLike = async () => {
    if (!user) return;
    const likeRef = doc(db, 'pins', pin.id, 'likes', user.uid);
    const pinRef = doc(db, 'pins', pin.id);
    
    if (isLiked) {
      await deleteDoc(likeRef);
      await updateDoc(pinRef, { likesCount: increment(-1) });
    } else {
      await setDoc(likeRef, { 
        createdAt: serverTimestamp(),
        photoURL: profileData?.photoURL || user.photoURL || null,
        displayName: profileData?.displayName || user.displayName || null
      });
      await updateDoc(pinRef, { likesCount: increment(1) });
      
      if (pin.userId !== user.uid) {
        await addDoc(collection(db, 'users', pin.userId, 'notifications'), {
          userId: pin.userId,
          type: 'like',
          message: `${profileData?.displayName || user.displayName || 'Someone'} liked your frequency: ${pin.title}`,
          read: false,
          createdAt: serverTimestamp(),
          fromUser: {
            uid: user.uid,
            name: profileData?.displayName || user.displayName || 'Anonymous',
            avatar: profileData?.photoURL || user.photoURL || ''
          },
          pinId: pin.id
        });
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    const saveRef = doc(db, 'users', user.uid, 'saves', pin.id);
    if (isSaved) {
      await deleteDoc(saveRef);
    } else {
      await setDoc(saveRef, { savedAt: serverTimestamp() });
      if (pin.userId !== user.uid) {
        await addDoc(collection(db, 'users', pin.userId, 'notifications'), {
          userId: pin.userId,
          type: 'save',
          message: `${profileData?.displayName || user.displayName || 'Someone'} saved your signal: ${pin.title}`,
          read: false,
          createdAt: serverTimestamp(),
          fromUser: {
            uid: user.uid,
            name: profileData?.displayName || user.displayName || 'Anonymous',
            avatar: profileData?.photoURL || user.photoURL || ''
          },
          pinId: pin.id
        });
      }
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!commentText.trim() && !commentImage) || isSending) return;
    
    setIsSending(true);
    try {
      await addDoc(collection(db, 'pins', pin.id, 'comments'), {
        userId: user.uid,
        authorName: profileData?.displayName || user.displayName || 'Anonymous',
        authorHandle: profileData?.handle || user.email?.split('@')[0].toLowerCase() || 'void',
        authorAvatar: profileData?.photoURL || user.photoURL || 'https://i.pravatar.cc/150',
        text: commentText,
        imageUrl: commentImage || null,
        parentId: replyTo?.id || null,
        createdAt: serverTimestamp()
      });
      
      await updateDoc(doc(db, 'pins', pin.id), { commentsCount: increment(1) });

      if (pin.userId !== user.uid) {
        await addDoc(collection(db, 'users', pin.userId, 'notifications'), {
          userId: pin.userId,
          type: 'comment',
          message: `${profileData?.displayName || user.displayName || 'Someone'} commented: "${commentText.substring(0, 30)}..."`,
          read: false,
          createdAt: serverTimestamp(),
          fromUser: {
            uid: user.uid,
            name: profileData?.displayName || user.displayName || 'Anonymous',
            avatar: profileData?.photoURL || user.photoURL || ''
          },
          pinId: pin.id
        });
      }
      setCommentText('');
      setCommentImage(null);
      setReplyTo(null);
      setShowEmojiPicker(false);
    } catch (e) {
      console.error("Comment error:", e);
    } finally {
      setIsSending(false);
    }
  };

  const handleCommentImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1000000) {
        alert("Dialogue attachment must be under 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX = 600;
          if (width > MAX) { height *= MAX / width; width = MAX; }
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
          setCommentImage(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(pin.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pin.title.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed:", e);
      alert("Download restricted by source host. Attempting browser internal open.");
      window.open(pin.imageUrl, '_blank');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: pin.title,
      text: pin.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Signal URL copied to clipboard.");
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  const handleReport = async () => {
    const reason = window.prompt("State the nature of the transmission violation:");
    if (reason) {
      try {
        await addDoc(collection(db, 'reports'), {
          pinId: pin.id,
          reporterUid: user?.uid || 'anonymous',
          reason,
          createdAt: serverTimestamp()
        });
        alert("Report submitted. Moderator surveillance activated.");
      } catch (e) {
        console.error("Report error:", e);
        alert("Failed to transmit report.");
      }
    }
  };

  const handleSearchTrigger = () => {
    if (onSearch) {
      const firstTag = pin.tags?.[0] || pin.category;
      onSearch(firstTag);
      onBack();
    }
  };

  const handleUpdate = async () => {
    await updateDoc(doc(db, 'pins', pin.id), {
      title: editTitle,
      description: editDesc,
      updatedAt: serverTimestamp()
    });
    setIsEditing(false);
  };

  const handleFollow = async () => {
    if (!user || isOwner) return;
    try {
      if (isFollowing) {
        await unfollowUser(user.uid, pin.userId);
      } else {
        await followUser(user.uid, pin.userId);
        // Create notification
        await addDoc(collection(db, 'users', pin.userId, 'notifications'), {
          userId: pin.userId,
          type: 'follow',
          message: `${profileData?.displayName || user.displayName || 'Someone'} started following your frequency.`,
          read: false,
          createdAt: serverTimestamp()
        });
      }
    } catch (e) {
      console.error("Follow error:", e);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Terminate Dialogue',
      message: 'Are you sure you want to erase this archival signal from the discourse? This action is irreversible.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'pins', pin.id, 'comments', commentId));
          await updateDoc(doc(db, 'pins', pin.id), { commentsCount: increment(-1) });
        } catch (e) {
          console.error("Comment delete error:", e);
        }
      }
    });
  };

  const handleDeletePin = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'Absolute Termination',
      message: 'You are about to permanently erase this signal and all associated archival data. Proceed with caution.',
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          await deleteDoc(doc(db, 'pins', pin.id));
          onBack();
          onDelete?.();
        } catch (e: any) {
          console.error("Critical Deletion Failure:", e);
          setIsDeleting(false);
        }
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-midnight flex flex-col overflow-hidden text-text-main"
    >
      {/* Top Navigation Bar */}
      <div className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-midnight/80 backdrop-blur-md sticky top-0 z-[120] isolate">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 text-text-muted hover:text-text-main transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          {/* Real People who liked this signal */}
          <div className="hidden sm:flex items-center -space-x-2">
            {[...new Set([...likers, ...spectators])].slice(0, 5).map(person => (
              <img 
                key={person.uid} 
                src={person.photoURL} 
                className="w-8 h-8 rounded-full border-2 border-midnight ring-1 ring-white/5 object-cover" 
                alt="spectator"
              />
            ))}
            {likers.length + spectators.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-surface border-2 border-midnight flex items-center justify-center text-[10px] font-bold text-text-muted">
                +{likers.length + spectators.length - 5}
              </div>
            )}
            {likers.length === 0 && spectators.length === 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Live Stream</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleSave}
            className={`px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${isSaved ? 'bg-accent text-white' : 'bg-white text-midnight hover:scale-105'}`}
          >
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <div className="h-8 w-px bg-white/5 mx-2" />
          <div className="flex gap-1">
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className={`p-3 transition-colors ${showInfo ? 'text-accent' : 'text-text-muted hover:text-white'}`}
            >
              <InfoIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSearchTrigger}
              className="p-3 text-text-muted hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <button onClick={handleDownload} className="p-3 text-text-muted hover:text-white transition-colors"><Download className="w-5 h-5" /></button>
            <div className="relative group/menu">
              <button className="p-3 text-text-muted hover:text-white transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <div className="absolute right-0 top-full pt-2 w-48 opacity-0 group-hover/menu:opacity-100 pointer-events-none group-hover/menu:pointer-events-auto transition-all z-[130]">
                <div className="bg-surface border border-white/10 rounded-2xl shadow-2xl p-2">
                  <button onClick={handleShare} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold hover:bg-white/5 rounded-xl transition-colors">
                    <Share2 className="w-4 h-4" /> Share Frequency
                  </button>
                  <button onClick={handleReport} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                    <Info className="w-4 h-4" /> Report Violation
                  </button>
                  {isOwner && (
                    <button onClick={handleDeletePin} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors border-t border-white/5 mt-1">
                      <Trash2 className="w-4 h-4" /> Delete Signal
                    </button>
                  )}
                </div>
              </div>
            </div>
            {isOwner && (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-3 text-text-muted hover:text-accent transition-colors"
                title="Edit Details"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div 
          ref={mainScrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto no-scrollbar relative bg-black/40"
        >
          <div className="max-w-[1200px] mx-auto py-12 px-6 flex flex-col items-center">
            {/* Focal Image */}
            <div className="relative mb-20">
              <div className="absolute -top-6 left-0 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                <div className={`w-1.5 h-1.5 rounded-full ${zoomScale > 1 ? 'bg-accent animate-pulse' : 'bg-white/20'}`} />
                {zoomScale > 1 ? `Inspection Mode Active (${zoomScale}x)` : 'Standard Signal View'}
              </div>
              
              <motion.div 
                ref={zoomContainerRef}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setZoomScale(1);
                }}
                className={`w-fit max-w-full mx-auto relative shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden group cursor-zoom-in active:cursor-grabbing transition-all ${zoomScale > 1 ? 'ring-2 ring-accent/50' : 'ring-1 ring-white/10'}`}
              >
                <motion.div
                  drag={zoomScale > 1}
                  x={dragX}
                  y={dragY}
                  dragConstraints={{
                    left: -imgDims.width * (zoomScale - 1) / 2,
                    right: imgDims.width * (zoomScale - 1) / 2,
                    top: -imgDims.height * (zoomScale - 1) / 2,
                    bottom: imgDims.height * (zoomScale - 1) / 2,
                  }}
                  animate={{ 
                    scale: zoomScale,
                    x: zoomScale === 1 ? 0 : undefined,
                    y: zoomScale === 1 ? 0 : undefined,
                    transition: { type: 'spring', damping: 25, stiffness: 200 }
                  }}
                  onPointerDown={(e) => {
                    zoomPointerStart.current = { x: e.clientX, y: e.clientY };
                  }}
                  onPointerUp={(e) => {
                    const dist = Math.sqrt(
                      Math.pow(e.clientX - zoomPointerStart.current.x, 2) + 
                      Math.pow(e.clientY - zoomPointerStart.current.y, 2)
                    );
                    // Only toggle if the pointer didn't move significantly (it's a click, not a drag)
                    if (dist < 5) {
                      setZoomScale(zoomScale === 1 ? 2.5 : 1);
                    }
                  }}
                  className="flex items-center justify-center origin-center"
                >
                  <img 
                    ref={zoomImageRef}
                    src={pin.imageUrl} 
                    alt={pin.title} 
                    draggable={false}
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      setImgDims({ width: img.clientWidth, height: img.clientHeight });
                    }}
                    className="max-w-full max-h-[85vh] block select-none pointer-events-none rounded-3xl"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                
                {zoomScale > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setZoomScale(1); }}
                    className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 backdrop-blur-md p-2 rounded-full text-white transition-all shadow-xl"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl pointer-events-none" />
              </motion.div>

              {zoomScale === 1 && (
                <div className="absolute -bottom-6 right-0 text-[8px] font-bold uppercase tracking-[2px] text-white/30 animate-pulse text-right">
                  Click to Toggle • Scroll to Inspect
                </div>
              )}
            </div>

            {/* Related Signals */}
            <div className="w-full mb-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-white/5" />
                <h3 className="text-[10px] font-bold uppercase tracking-[4px] text-text-muted whitespace-nowrap">Synchronized Signals</h3>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <MasonryGrid pins={recommendedPins} onPinClick={onPinClick} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <motion.aside 
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          onMouseEnter={() => setIsMouseOverComments(true)}
          onMouseLeave={() => setIsMouseOverComments(false)}
          className="w-96 border-l border-white/5 bg-midnight flex flex-col z-[80] shadow-[-20px_0_40px_rgba(0,0,0,0.4)]"
        >
          <div className="p-8 flex-1 overflow-y-auto no-scrollbar space-y-10">
            {showInfo && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4"
              >
                <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-accent">Technical Diagnostics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] uppercase text-text-muted tracking-widest">Resolution</p>
                    <p className="text-[10px] font-mono">{imgDims.width} x {imgDims.height}</p>
                  </div>
                  <div>
                    <p className="text-[8px] uppercase text-text-muted tracking-widest">Magnification</p>
                    <p className="text-[10px] font-mono">{zoomScale.toFixed(1)}x</p>
                  </div>
                  <div>
                    <p className="text-[8px] uppercase text-text-muted tracking-widest">Focal Point</p>
                    <p className="text-[10px] font-mono">
                      {Math.floor((pin.id.charCodeAt(0) % 50) + 20)}mm f/{(1.4 + (pin.id.charCodeAt(1) % 4) * 0.4).toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] uppercase text-text-muted tracking-widest">Intensity</p>
                    <p className="text-[10px] font-mono">ISO {100 * Math.pow(2, (pin.id.charCodeAt(2) % 6))}</p>
                  </div>
                  <div>
                    <p className="text-[8px] uppercase text-text-muted tracking-widest">Spectral Key</p>
                    <p className="text-[10px] font-mono text-accent">RAW_SIG_{(pin.id + pin.userId).substring(0,8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-[8px] uppercase text-text-muted tracking-widest">Shutter</p>
                    <p className="text-[10px] font-mono">1/{Math.floor(50 * (pin.id.charCodeAt(3) % 40) + 100)}s</p>
                  </div>
                </div>
              </motion.div>
            )}

            {isEditing ? (
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold text-accent uppercase tracking-[2px]">Edit Signal</h2>
                    <button onClick={() => setIsEditing(false)} className="text-text-muted hover:text-white"><X className="w-5 h-5" /></button>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold tracking-[3px] text-text-muted">Title</label>
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent/40 focus:outline-none"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold tracking-[3px] text-text-muted">Description</label>
                      <textarea 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs h-32 focus:border-accent/40 focus:outline-none resize-none"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                        <button 
                          onClick={handleUpdate}
                          className="flex-1 bg-white text-midnight py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white/90 hover:scale-105 transition-all flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" /> Update
                        </button>
                        <button 
                          onClick={handleDeletePin}
                          className="px-6 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                          title="Erase Signal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                 </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <h2 className="text-sm font-bold text-text-muted uppercase tracking-[2px]">Info</h2>
                  <button className="text-text-muted hover:text-white"><InfoIcon className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 py-2">
                    <img 
                      src={authorProfile?.photoURL || pin.author?.avatar || 'https://i.pravatar.cc/150'} 
                      className="w-10 h-10 rounded-full border border-white/10 ring-4 ring-white/5" 
                      alt={authorProfile?.displayName || pin.author?.name}
                    />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[2px] text-accent">Source Identity</p>
                      <button 
                        onClick={() => onProfileClick?.(pin.userId)}
                        className="text-sm font-bold hover:text-accent transition-colors flex items-center gap-1.5"
                      >
                        {authorProfile?.displayName || pin.author?.name}
                        <span className="text-[10px] text-text-muted opacity-60 font-medium">@{authorProfile?.handle || pin.author?.handle || 'void'}</span>
                      </button>
                    </div>
                    {!isOwner && (
                      <button 
                        onClick={handleFollow}
                        className={`ml-auto px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${isFollowing ? 'bg-white/5 text-text-muted border border-white/10' : 'bg-white text-midnight hover:bg-white/90 hover:scale-105'}`}
                      >
                        {isFollowing ? 'Linked' : 'Link'}
                      </button>
                    )}
                  </div>
                  
                  <a 
                    href={pin.source || "#"} 
                    className="text-white/30 hover:text-accent text-[10px] flex items-center gap-2 transition-colors"
                  >
                    View Primary Source
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  
                  <h1 className="text-2xl font-display font-medium leading-tight">{pin.title}</h1>
                  <p className="text-text-muted text-xs leading-relaxed opacity-70">{pin.description || "Silent masterpiece."}</p>
                  
                  <div className="flex items-center gap-6 pt-4">
                    <button onClick={handleLike} className="flex items-center gap-2 group">
                      <Heart className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-red-500' : 'text-white/40 group-hover:text-red-500'}`} />
                      <span className="text-[10px] font-mono text-text-muted">{livePinData?.likesCount ?? pin.likesCount ?? 0}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-white/40" />
                      <span className="text-[10px] font-mono text-text-muted uppercase tracking-tighter">
                        {(livePinData?.viewsCount ?? pin.viewsCount ?? 0).toLocaleString()} SPECTATORS
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[2px] text-text-muted mb-4">Neural Archetypes</p>
                  <div className="flex flex-wrap gap-2">
                    {pin.archetypes && pin.archetypes.length > 0 ? pin.archetypes.map(arch => (
                      <span key={arch} className="px-3 py-1 bg-accent/5 border border-accent/10 rounded-full text-[10px] text-accent font-bold tracking-wider">
                        {arch}
                      </span>
                    )) : (
                      <span className="text-[10px] text-text-muted opacity-40 italic">Uncategorized frequency</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[2px] text-text-muted mb-4">Spectral Analysis</p>
                  <div className="flex gap-2">
                    {pin.colorSpectrum && pin.colorSpectrum.length > 0 ? pin.colorSpectrum.map((spec, i) => (
                      <div 
                        key={i} 
                        className="h-8 rounded-full border border-white/10 transition-all hover:scale-110" 
                        style={{ 
                          backgroundColor: `rgb(${spec.r}, ${spec.g}, ${spec.b})`,
                          width: `${spec.weight * 100}px`,
                          minWidth: '20px'
                        }} 
                        title={`R:${spec.r} G:${spec.g} B:${spec.b} (${Math.round(spec.weight * 100)}%)`}
                      />
                    )) : (
                      <div className="w-8 h-8 rounded-full border border-white/10" style={{ backgroundColor: pin.accentColor || pin.color || '#888888' }} />
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[2px] text-text-muted mb-4">Frequency Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {(pin.tags || []).map(tag => (
                      <span key={tag} className="px-3 py-1 bg-surface border border-white/5 rounded-full text-[10px] text-text-muted">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold text-text-main">Comments</span>
                    <button 
                      onClick={() => setShowComments(!showComments)}
                      className={`w-10 h-5 rounded-full transition-colors relative flex items-center px-1 ${showComments ? 'bg-accent' : 'bg-white/10'}`}
                    >
                      <motion.div animate={{ x: showComments ? 20 : 0 }} className="w-3 h-3 bg-white rounded-full" />
                    </button>
                  </div>

                  <AnimatePresence>
                    {showComments && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        {comments.length === 0 ? (
                          <p className="text-[10px] text-white/5 uppercase font-bold tracking-[4px] py-10 text-center">Static Silence</p>
                        ) : (
                          comments.filter(c => !c.parentId).map(parent => (
                            <div key={parent.id} className="space-y-4">
                              <div className="group flex gap-3">
                                <img src={parent.authorAvatar} className="w-7 h-7 rounded-full shrink-0 border border-white/5" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-[11px] font-bold">{parent.authorName}</p>
                                    <span className="text-[9px] text-text-muted opacity-40">@{parent.authorHandle || 'archived'}</span>
                                  </div>
                                  <p className="text-xs text-text-muted mt-0.5">{parent.text}</p>
                                  {parent.imageUrl && (
                                    <div className="mt-2 rounded-xl overflow-hidden border border-white/10 max-w-[200px]">
                                      <img src={parent.imageUrl} alt="Comment attachment" className="w-full h-auto" />
                                    </div>
                                  )}
                                  <div className="flex items-center gap-4 mt-2">
                                    <button 
                                      onClick={() => {
                                        setReplyTo(parent);
                                        setCommentText(`@${parent.authorHandle || parent.authorName.replace(/\s+/g, '')} `);
                                        commentInputRef.current?.focus();
                                      }}
                                      className="text-[9px] font-bold uppercase tracking-widest text-text-muted hover:text-accent flex items-center gap-1.5 transition-colors"
                                    >
                                      <Reply className="w-3 h-3" /> Reply
                                    </button>
                                    {(user?.uid === parent.userId || isOwner) && (
                                      <button onClick={() => handleDeleteComment(parent.id)} className="text-[9px] font-bold uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors">Delete</button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Threaded Replies */}
                              {comments.filter(child => child.parentId === parent.id).map(child => (
                                <div key={child.id} className="flex gap-3 pl-8 group">
                                  <CornerDownRight className="w-4 h-4 text-white/10 shrink-0 mt-1" />
                                  <img src={child.authorAvatar} className="w-6 h-6 rounded-full shrink-0 border border-white/5" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="text-[10px] font-bold">{child.authorName}</p>
                                      <span className="text-[8px] text-text-muted opacity-40">@{child.authorHandle || 'sync'}</span>
                                    </div>
                                    <p className="text-[11px] text-text-muted mt-0.5">{child.text}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                      <button 
                                        onClick={() => {
                                          setReplyTo(parent); // Still reply to main parent for now
                                          setCommentText(`@${child.authorHandle || child.authorName.replace(/\s+/g, '')} `);
                                          commentInputRef.current?.focus();
                                        }}
                                        className="text-[9px] font-bold uppercase tracking-widest text-text-muted hover:text-accent transition-colors"
                                      >
                                        Reply
                                      </button>
                                      {(user?.uid === child.userId || isOwner) && (
                                        <button onClick={() => handleDeleteComment(child.id)} className="text-[9px] font-bold uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors">Delete</button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          <div className="p-6 bg-surface border-t border-white/5">
            <form onSubmit={handleComment} className="flex flex-col gap-3">
              <AnimatePresence>
                {replyTo && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex justify-between items-center px-4 py-2 bg-accent/5 border border-accent/10 rounded-xl mb-1"
                  >
                    <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Replying to @{replyTo.authorName}</p>
                    <button onClick={() => setReplyTo(null)} className="text-text-muted hover:text-white"><X className="w-3 h-3" /></button>
                  </motion.div>
                )}
              </AnimatePresence>
              {commentImage && (
                <div className="relative inline-block self-start">
                  <img src={commentImage} className="w-16 h-16 rounded-lg object-cover" />
                  <button onClick={() => setCommentImage(null)} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                </div>
              )}
              <div className="flex items-center gap-3">
                <img src={profileData?.photoURL || user?.photoURL || ''} className="w-8 h-8 rounded-full border border-white/5" />
                <input 
                  ref={commentInputRef}
                  className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-text-muted text-text-main"
                  placeholder={replyTo ? "Synchronize reply..." : "Broadcast signal..."}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-2 rounded-xl transition-all ${showEmojiPicker ? 'bg-accent text-white' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                >
                  <Smile className="w-4 h-4" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-4 z-[150]">
                    <EmojiPicker 
                      theme={theme === 'abyss' ? EmojiTheme.DARK : EmojiTheme.AUTO}
                      onEmojiClick={(emojiData) => {
                        setCommentText(prev => prev + emojiData.emoji);
                        setShowEmojiPicker(false);
                      }}
                    />
                  </div>
                )}
                <button type="button" onClick={() => commentFileRef.current?.click()} className="text-text-muted hover:text-white transition-colors"><ImageIcon className="w-4 h-4" /></button>
                <button disabled={!commentText.trim() && !commentImage} className="text-xs font-bold text-accent disabled:opacity-30 uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Post</button>
              </div>
              <input type="file" className="hidden" ref={commentFileRef} accept="image/*" onChange={handleCommentImage} />
            </form>
          </div>
        </motion.aside>
      </div>
      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </motion.div>
  );
}
