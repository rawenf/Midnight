import { motion, AnimatePresence } from 'motion/react';
import { Download, Share2, MoreHorizontal, Bookmark, Heart, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Pin } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface PinCardProps {
  pin: Pin;
  onCardClick?: () => void;
}

export default function PinCard({ pin, onCardClick }: PinCardProps) {
  const { user, profileData } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isFlickering, setIsFlickering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronized Identity Override for local pins
  const isOwnPin = user && pin.userId === user.uid;
  const authorAvatar = isOwnPin ? (profileData?.photoURL || pin.author?.avatar) : pin.author?.avatar;
  const authorHandle = isOwnPin ? (profileData?.handle || pin.author?.handle) : pin.author?.handle;

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsFlickering(true);
    setTimeout(() => setIsFlickering(false), 80);
  };

  const getAspectRatioClass = () => {
    // Replaced by natural scaling for authentic Masonry experience
    return 'h-auto';
  };

  return (
    <div 
      className={`relative group mb-6 flex flex-col cursor-pointer overflow-hidden rounded-3xl bg-surface border border-white/5 transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onCardClick}
    >
      <div className={`relative overflow-hidden w-full h-auto`}>
        {isLoading && (
          <div className="absolute inset-0 bg-stone-900/50 animate-pulse flex items-center justify-center min-h-[200px]">
             <div className="w-1/2 h-0.5 bg-accent/20 overflow-hidden">
               <motion.div 
                 animate={{ x: [-100, 200] }}
                 transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                 className="w-full h-full bg-accent/60"
               />
             </div>
          </div>
        )}
        <motion.div
          animate={
            isLoading 
              ? { opacity: 0 } 
              : isFlickering 
                ? { opacity: 0.3, scale: 0.99, filter: 'brightness(1.5) contrast(1.1)' } 
                : { opacity: 1, scale: 1, filter: 'brightness(1) contrast(1)' }
          }
          transition={{ duration: 0.05 }}
          className="w-full pointer-events-none"
        >
          <img 
            src={pin.imageUrl} 
            alt={pin.title} 
            referrerPolicy="no-referrer"
            onLoad={() => setIsLoading(false)}
            loading="lazy"
            className="w-full h-auto block transform transition-all duration-700 group-hover:scale-105"
          />
        </motion.div>
        
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px] p-4 flex flex-col justify-between z-10"
            >
              <div className="flex justify-end">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="bg-white text-midnight px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-all transform active:scale-90"
                >
                  Save
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-white">
                    <Heart className="w-3.5 h-3.5 text-white fill-white" />
                    {pin.likesCount || 0}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-white">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {pin.commentsCount || 0}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border border-white/20 overflow-hidden ring-2 ring-white/10 shrink-0">
                    <img src={authorAvatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-bold tracking-tight text-white/90 truncate">
                    @{authorHandle || pin.author?.name?.toLowerCase().replace(/\s+/g, '') || 'void'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
