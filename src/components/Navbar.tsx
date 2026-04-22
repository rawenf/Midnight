import { Search, Plus, Bell, LogIn, LogOut, Menu, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogle, logOut } from '../lib/firebase';
import { useState } from 'react';
import { COLORS } from '../constants';

interface NavbarProps {
  onUploadClick: () => void;
  onColorChange: (color: string | null) => void;
  onSearchChange: (query: string) => void;
  onProfileClick: () => void;
  onFeedClick: () => void;
  onNotificationsClick: () => void;
  onMessagesClick: () => void;
  activeColor: string | null;
  searchQuery: string;
  currentView: 'feed' | 'profile';
}

const COLORS_PLACEHOLDER = []; // Removed old local colors

export default function Navbar({ 
  onUploadClick, 
  onColorChange, 
  onSearchChange, 
  onProfileClick,
  onFeedClick,
  onNotificationsClick,
  onMessagesClick,
  activeColor, 
  searchQuery,
  currentView
}: NavbarProps) {
  const { user, profileData } = useAuth();
  const [showColors, setShowColors] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-midnight/90 backdrop-blur-xl border-b border-border flex flex-col">
      <div className="flex items-center justify-between px-6 sm:px-10 py-5 w-full">
        <div className="flex items-center gap-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center cursor-pointer"
            onClick={onFeedClick}
          >
            <div className="font-display text-xl sm:text-2xl font-extrabold tracking-[-0.04em] uppercase hover:glitch-text transition-all duration-300">
              Midnight
            </div>
          </motion.div>
        </div>

        <div className="flex-1 max-w-xl mx-8 hidden md:flex items-center gap-3">
          <div className="relative group flex-1">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search the silence..." 
              className="w-full bg-surface border border-border rounded-full py-2.5 px-6 text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-text-muted text-text-main"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowColors(!showColors)}
              className={`w-10 h-10 rounded-full border border-border flex items-center justify-center transition-all ${activeColor ? 'border-text-main' : 'hover:border-white/30'}`}
              style={activeColor ? { backgroundColor: activeColor } : {}}
            >
              {!activeColor && <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-stone-800 to-stone-400" />}
            </button>
            
            <AnimatePresence>
              {showColors && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-3 p-3 bg-surface border border-border rounded-2xl grid grid-cols-4 gap-2 shadow-2xl min-w-[160px]"
                >
                  <button 
                    onClick={() => { onColorChange(null); setShowColors(false); }}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-[10px] text-text-muted hover:text-text-main bg-midnight"
                  >
                    X
                  </button>
                  {COLORS.map(c => (
                    <button
                      key={c.name}
                      onClick={() => { onColorChange(c.hex); setShowColors(false); }}
                      className="w-8 h-8 rounded-full border border-white/10 transition-transform hover:scale-110 shadow-sm"
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-2 text-text-muted hover:text-text-main transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {user && (
            <>
              <button 
                onClick={onNotificationsClick}
                className="relative p-2 text-text-muted hover:text-text-main transition-colors group"
              >
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-midnight" />
              </button>
              
              <button 
                onClick={onMessagesClick}
                className="p-2 text-text-muted hover:text-text-main transition-colors group"
              >
                <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </>
          )}
          
          {user ? (
            <>
              <button 
                onClick={onUploadClick}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-midnight flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <img 
                  src={profileData?.photoURL || user.photoURL || ''} 
                  alt="User" 
                  className={`w-8 h-8 rounded-full border border-border cursor-pointer hover:border-white transition-all ${currentView === 'profile' ? 'border-white ring-2 ring-white/10' : ''}`} 
                  onClick={onProfileClick}
                />
              </div>
            </>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="flex items-center gap-2 bg-white text-midnight px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-accent transition-all"
            >
              <LogIn className="w-4 h-4" /> Enter
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border bg-midnight/50 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <input 
                type="text" 
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search frequencies..." 
                className="w-full bg-surface border border-border rounded-xl py-3 px-6 text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-text-muted text-text-main"
              />
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button 
                  onClick={() => onColorChange(null)}
                  className={`w-8 h-8 shrink-0 rounded-full border border-border flex items-center justify-center text-[10px] ${!activeColor ? 'bg-white text-midnight' : 'text-text-muted'}`}
                >
                  X
                </button>
                {COLORS.map(c => (
                  <button
                    key={c.name}
                    onClick={() => onColorChange(c.hex)}
                    className={`w-8 h-8 shrink-0 rounded-full border transition-all ${activeColor === c.hex ? 'border-white scale-110' : 'border-white/10'}`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
