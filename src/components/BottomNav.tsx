import React from 'react';
import { motion } from 'motion/react';
import { Home, Compass, Plus, Bell, User } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onViewChange: (view: any) => void;
  onUploadClick: () => void;
  hasNotifications?: boolean;
}

export default function BottomNav({ 
  currentView, 
  onViewChange, 
  onUploadClick,
  hasNotifications = false 
}: BottomNavProps) {
  const tabs = [
    { id: 'feed', icon: Home, label: 'Signals' },
    { id: 'search', icon: Compass, label: 'Discover' },
    { id: 'upload', icon: Plus, label: 'Transmit', action: onUploadClick },
    { id: 'notifications', icon: Bell, label: 'Frequency', hasDot: hasNotifications },
    { id: 'profile', icon: User, label: 'Identity' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-midnight/80 backdrop-blur-xl border-t border-white/5 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = currentView === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => tab.action ? tab.action() : onViewChange(tab.id)}
              className="relative flex flex-col items-center justify-center w-full h-full gap-1 group"
            >
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-white text-midnight' : 'text-text-muted active:scale-90'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
              </div>
              
              <span className={`text-[8px] uppercase font-bold tracking-widest transition-opacity duration-300 ${isActive ? 'opacity-100 text-white' : 'opacity-40 text-text-muted'}`}>
                {tab.label}
              </span>

              {tab.hasDot && (
                <div className="absolute top-3 right-1/2 translate-x-3 w-1.5 h-1.5 bg-accent rounded-full border border-midnight" />
              )}

              {isActive && (
                <motion.div 
                  layoutId="bottomTabBg"
                  className="absolute -top-px left-1/4 right-1/4 h-0.5 bg-accent shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
