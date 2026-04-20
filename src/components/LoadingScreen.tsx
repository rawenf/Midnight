import React from 'react';
import { motion } from 'motion/react';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export default function LoadingScreen({ 
  message = "Synchronizing Signals", 
  subMessage = "Establishing connection to the midnight archive...", 
  fullScreen = true 
}: LoadingScreenProps) {
  return (
    <div className={`${fullScreen ? 'fixed inset-0 z-[200] bg-midnight' : 'w-full h-full min-h-[300px] bg-transparent'} flex flex-col items-center justify-center p-6`}>
      <div className="relative">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-accent/20 blur-[80px] rounded-full animate-pulse" />
        
        {/* Core Loading Element */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Pulsating Rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 1.5], 
                opacity: [0, 0.2, 0] 
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeOut"
              }}
              className="absolute inset-0 border border-accent rounded-full"
            />
          ))}
          
          {/* Inner Orb */}
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-16 h-16 bg-white rounded-full shadow-[0_0_40px_rgba(255,255,255,0.4)]"
          />
          
          {/* Logo Text Overlay (Subtle) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-display font-black text-midnight mix-blend-difference tracking-tighter">MID</span>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center space-y-4">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-bold uppercase tracking-[4px] text-text-main"
        >
          {message}
        </motion.p>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.5 }}
          className="text-[9px] uppercase tracking-[2px] text-text-muted"
        >
          {subMessage}
        </motion.p>
      </div>

      {/* Grid Background Effect (Subtle) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }} />
      </div>
    </div>
  );
}
