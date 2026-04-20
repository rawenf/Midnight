import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-surface border border-border rounded-[2.5rem] overflow-hidden shadow-2xl p-8"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-accent/10 text-accent'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-display font-bold mb-3">{title}</h3>
            <p className="text-sm text-text-muted leading-relaxed mb-8">{message}</p>

            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-4 rounded-full text-xs font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 text-text-muted transition-all"
              >
                {cancelText}
              </button>
              <button 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-white text-midnight hover:bg-accent'}`}
              >
                {confirmText}
              </button>
            </div>

            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-text-muted hover:text-text-main">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
