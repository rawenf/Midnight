import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Shield, Palette, LogOut, Check, Loader2, Edit2, Moon, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { logOut, auth, db } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditProfile?: boolean;
}

export default function SettingsModal({ isOpen, onClose, isEditProfile = false }: SettingsModalProps) {
  const { user, profileData } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(isEditProfile ? 'profile' : 'account');
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [accentColor, setAccentColor] = useState('#FFFFFF');
  const [isSaving, setIsSaving] = useState(false);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setDisplayName(profileData?.displayName || user?.displayName || '');
      setHandle(profileData?.handle || '');
      setBio(profileData?.bio || '');
      setPhotoURL(profileData?.photoURL || user?.photoURL || '');
      setAccentColor(profileData?.accentColor || '#FFFFFF');
      setActiveTab(isEditProfile ? 'profile' : 'account');
    }
  }, [isOpen, profileData, user, isEditProfile]);

  if (!user) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1000000) { // Limit to 1MB for source
        alert("Original image must be under 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 200; // 200x200 is plenty for Firestore
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setPhotoURL(compressedBase64);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    
    // 0. Validation
    const cleanHandle = handle.toLowerCase().replace(/\s+/g, '');
    if (cleanHandle.length < 3 || cleanHandle.length > 20) {
      setErrorHeader("Handle must be between 3 and 20 characters.");
      setTimeout(() => setErrorHeader(null), 3000);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanHandle)) {
      setErrorHeader("Handle can only contain letters, numbers, and underscores.");
      setTimeout(() => setErrorHeader(null), 3000);
      return;
    }

    setIsSaving(true);
    try {
      // 1. Uniqueness check
      if (cleanHandle !== profileData?.handle) {
        const q = query(collection(db, 'users'), where('handle', '==', cleanHandle));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setErrorHeader("This identity handle is already synchronized to another user.");
          setIsSaving(false);
          setTimeout(() => setErrorHeader(null), 3000);
          return;
        }
      }

      // 2. Update Auth for basic sync
      try {
        await updateProfile(auth.currentUser, {
          displayName: displayName
        });
      } catch (e) {
        console.warn("Auth profile sync failed:", e);
      }

      // 3. Update Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        displayName: displayName,
        handle: cleanHandle,
        photoURL: photoURL,
        bio: bio,
        accentColor: accentColor
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Update profile error:", error);
      setErrorHeader("Archival synchronization failed. Please check connection.");
      setTimeout(() => setErrorHeader(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl flex h-[600px]"
          >
            {/* Sidebar */}
            <div className="w-64 border-r border-border bg-midnight/50 p-6 flex flex-col">
              <h2 className="text-sm font-display font-bold uppercase tracking-[3px] text-text-muted mb-8 px-2">Settings</h2>
              
              <nav className="flex flex-col gap-1">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-white text-midnight' : 'text-text-muted hover:text-text-main hover:bg-white/5'}`}
                >
                  <User className="w-4 h-4" /> Edit Profile
                </button>
                <button 
                  onClick={() => setActiveTab('account')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'account' ? 'bg-white text-midnight' : 'text-text-muted hover:text-text-main hover:bg-white/5'}`}
                >
                  <Shield className="w-4 h-4" /> Account
                </button>
                <button 
                  onClick={() => setActiveTab('appearance')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'appearance' ? 'bg-white text-midnight' : 'text-text-muted hover:text-text-main hover:bg-white/5'}`}
                >
                  <Palette className="w-4 h-4" /> Appearance
                </button>
              </nav>

              <button 
                onClick={() => { logOut(); onClose(); }}
                className="mt-auto flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-border">
                <h3 className="text-xl font-display font-bold">
                  {activeTab === 'profile' && 'Public Profile'}
                  {activeTab === 'account' && 'Account Settings'}
                  {activeTab === 'appearance' && 'Appearance'}
                </h3>
                <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {errorHeader && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest text-center"
                  >
                    {errorHeader}
                  </motion.div>
                )}
                {activeTab === 'profile' && (
                  <div className="flex flex-col gap-8 max-w-md">
                    <div className="flex items-center gap-6">
                      <div className="relative group overflow-hidden rounded-full border border-border">
                        <img src={photoURL || user.photoURL || ''} className="w-20 h-20 object-cover" />
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        >
                          <Edit2 className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-surface-hover hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-bold border border-border transition-all"
                      >
                        Change Avatar
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-text-muted mb-2">Display Name</label>
                        <input 
                          className="w-full bg-midnight border border-border rounded-xl px-4 py-3 text-sm focus:border-white/20 outline-none" 
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-text-muted mb-2">Unique Handle (@)</label>
                        <input 
                          className="w-full bg-midnight border border-border rounded-xl px-4 py-3 text-sm focus:border-white/20 outline-none" 
                          value={handle}
                          placeholder="yourname"
                          onChange={(e) => setHandle(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-text-muted mb-2">Short Bio</label>
                        <textarea 
                          rows={3} 
                          className="w-full bg-midnight border border-border rounded-xl px-4 py-3 text-sm focus:border-white/20 outline-none resize-none" 
                          placeholder="Write something about your signals..." 
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-text-muted mb-2">Identity Accent (Glow)</label>
                        <div className="flex gap-2">
                          {['#FFFFFF', '#FF3B30', '#007AFF', '#34C759', '#FFD60A', '#AF52DE'].map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setAccentColor(c)}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${accentColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
                              style={{ backgroundColor: c, boxShadow: accentColor === c ? `0 0 15px ${c}44` : 'none' }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`w-full py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${saveSuccess ? 'bg-green-500 text-white' : 'bg-white text-midnight hover:bg-accent'}`}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : saveSuccess ? (
                        <><Check className="w-4 h-4" /> Changes Saved</>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                )}

                {activeTab === 'account' && (
                  <div className="flex flex-col gap-6">
                    <div className="p-4 rounded-2xl bg-midnight border border-border">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-1">Email Address</p>
                      <p className="text-sm">{user.email}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-midnight border border-border flex justify-between items-center">
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-1">Password</p>
                        <p className="text-sm">Last changed 2 months ago</p>
                      </div>
                      <button className="text-xs font-bold text-text-muted hover:text-text-main underline">Reset</button>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="flex flex-col gap-8">
                    <div className="space-y-2">
                       <p className="text-[10px] uppercase font-bold tracking-[2px] text-text-muted">Current Theme</p>
                       <p className="text-text-muted text-xs italic">"The void is whatever shade of dark you choose."</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <button 
                        onClick={() => setTheme('midnight')}
                        className={`group relative p-6 rounded-3xl border-2 transition-all flex flex-col gap-4 text-left overflow-hidden ${theme === 'midnight' ? 'border-accent bg-midnight' : 'border-border bg-midnight/30 hover:border-white/20'}`}
                      >
                        <div className="flex justify-between items-start">
                          <Moon className={`w-6 h-6 ${theme === 'midnight' ? 'text-accent' : 'text-text-muted'}`} />
                          {theme === 'midnight' && <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
                        </div>
                        <div>
                          <span className="block text-sm font-bold uppercase tracking-tight">Midnight</span>
                          <span className="text-[10px] text-text-muted">The essential network atmosphere.</span>
                        </div>
                      </button>

                      <button 
                        onClick={() => setTheme('abyss')}
                        className={`group relative p-6 rounded-3xl border-2 transition-all flex flex-col gap-4 text-left overflow-hidden ${theme === 'abyss' ? 'border-accent bg-black shadow-[0_0_40px_rgba(255,255,255,0.05)]' : 'border-border bg-black/50 hover:border-white/20'}`}
                      >
                        <div className="flex justify-between items-start">
                          <Zap className={`w-6 h-6 ${theme === 'abyss' ? 'text-accent' : 'text-text-muted'}`} />
                          {theme === 'abyss' && <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
                        </div>
                        <div>
                          <span className="block text-sm font-bold uppercase tracking-tight">Abyss</span>
                          <span className="text-[10px] text-text-muted">High-contrast absolute zero.</span>
                        </div>
                        
                        <div className="absolute top-0 right-0 p-2">
                           <span className="text-[8px] font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/10 opacity-40">Unlocked</span>
                        </div>
                      </button>
                    </div>

                    <div className="p-6 rounded-3xl bg-midnight/50 border border-border mt-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                         Experimental Layers
                      </h4>
                      <p className="text-[10px] text-text-muted leading-relaxed">
                        Abyss mode optimizes high-contrast identity manifestation across the network. More archival layers are being synthesized.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
