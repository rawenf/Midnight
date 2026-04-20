import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, Check } from 'lucide-react';

interface UsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: {
    uid: string;
    photoURL: string;
    displayName?: string;
    handle?: string;
  }[];
  onUserClick?: (uid: string) => void;
}

export default function UsersModal({ isOpen, onClose, title, users, onUserClick }: UsersModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
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
            className="relative w-full max-w-md bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[500px]"
          >
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h3 className="text-sm font-display font-bold uppercase tracking-[3px] text-text-muted">{title}</h3>
              <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {users.length > 0 ? (
                users.map((u) => (
                  <div 
                    key={u.uid}
                    onClick={() => { onUserClick?.(u.uid); onClose(); }}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5 active:scale-95 group"
                  >
                    <div className="w-10 h-10 rounded-full border border-border overflow-hidden">
                      <img src={u.photoURL || 'https://i.pravatar.cc/150'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{u.displayName || 'Unknown Signal'}</p>
                      <p className="text-[10px] text-text-muted truncate">@{u.handle || 'void'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-10 opacity-20">
                  <UserPlus className="w-12 h-12 mb-4" />
                  <p className="text-xs uppercase tracking-widest">The void is silent here</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
