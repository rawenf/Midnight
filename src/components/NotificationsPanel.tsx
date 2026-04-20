import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, User, Heart, MessageSquare, Mail, Users, Star, Link as LinkIcon, Trash2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  type: 'like' | 'follow' | 'comment' | 'message' | 'save' | 'system';
  message: string;
  read: boolean;
  createdAt: any;
  fromUser?: {
    uid?: string;
    name: string;
    avatar: string;
  };
  groupData?: {
    count: number;
    avatars: string[];
    uids: string[];
  };
  pinId?: string;
  link?: string;
}

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { user } = useAuth();
  const [rawNotifications, setRawNotifications] = useState<Notification[]>([]);

  const notifications = useMemo(() => {
    const grouped: Notification[] = [];
    const groupMap: { [key: string]: Notification } = {};

    rawNotifications.forEach(notif => {
      // Grouping logic for likes and saves on the same pin
      if ((notif.type === 'like' || notif.type === 'save') && notif.pinId) {
        const key = `${notif.type}_${notif.pinId}`;
        if (!groupMap[key]) {
          groupMap[key] = {
            ...notif,
            groupData: {
              count: 1,
              avatars: notif.fromUser ? [notif.fromUser.avatar] : [],
              uids: notif.fromUser?.uid ? [notif.fromUser.uid] : []
            }
          };
          grouped.push(groupMap[key]);
        } else {
          const group = groupMap[key];
          if (notif.fromUser && !group.groupData!.uids.includes(notif.fromUser.uid!)) {
            group.groupData!.count++;
            group.groupData!.uids.push(notif.fromUser.uid!);
            if (group.groupData!.avatars.length < 3) {
              group.groupData!.avatars.push(notif.fromUser.avatar);
            }
            
            // Update message
            const baseType = notif.type === 'like' ? 'liked' : 'saved';
            const count = group.groupData!.count;
            if (count === 2) {
               group.message = `${group.fromUser?.name} and ${notif.fromUser.name} ${baseType} your signal.`;
            } else if (count > 2) {
               group.message = `${group.fromUser?.name} and ${count - 1} others ${baseType} your signal.`;
            }
          }
        }
      } else {
        grouped.push(notif);
      }
    });

    return grouped;
  }, [rawNotifications]);

  useEffect(() => {
    if (!user || !isOpen) return;

    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      setRawNotifications(notifs);
    }, (error) => {
      console.warn("Notifications listener error:", error);
    });

    return () => unsubscribe();
  }, [user, isOpen]);

  const handleMarkAsRead = async (id: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'notifications', id), {
        read: true
      });
    } catch (e) {
      console.error("Failed to update notification state:", e);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'notifications', id));
    } catch (e) {
      console.error("Failed to terminate notification signal:", e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case 'follow': return <User className="w-4 h-4 text-blue-400" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-green-400" />;
      case 'message': return <Mail className="w-4 h-4 text-accent" />;
      case 'save': return <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />;
      default: return <Bell className="w-4 h-4 text-text-muted" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-midnight border-l border-white/5 z-[70] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-8 border-b border-white/5 bg-surface/50 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-display font-medium tracking-tight">Activity Feed</h2>
                  <p className="text-[10px] text-text-muted uppercase tracking-[2px] mt-1">Archival Signal History</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
              {notifications.map(n => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={n.id} 
                  onClick={() => !n.read && handleMarkAsRead(n.id)}
                  className={`relative group flex gap-4 p-5 rounded-3xl transition-all cursor-pointer border ${
                    n.read 
                      ? 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.2)]'
                  }`}
                >
                  <div className="relative shrink-0">
                    {n.fromUser ? (
                      <div className="relative">
                        <img 
                          src={n.fromUser.avatar} 
                          className="w-12 h-12 rounded-full border-2 border-midnight ring-1 ring-white/5 object-cover" 
                          alt=""
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-midnight border border-white/10 flex items-center justify-center">
                          {getIcon(n.type)}
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center border border-white/5">
                        {getIcon(n.type)}
                      </div>
                    )}
                    
                    {!n.read && (
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-accent rounded-full border-2 border-midnight animate-pulse shadow-[0_0_10px_#FFF]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${n.read ? 'text-text-muted' : 'text-text-main font-medium'}`}>
                      {n.message}
                    </p>
                    
                    {n.groupData && n.groupData.avatars.length > 0 && (
                      <div className="flex items-center -space-x-2 mt-3 pb-1">
                        {n.groupData.avatars.map((av, idx) => (
                          <img key={idx} src={av} className="w-6 h-6 rounded-full border-2 border-midnight ring-1 ring-white/5" />
                        ))}
                        {n.groupData.count > n.groupData.avatars.length && (
                          <div className="w-6 h-6 rounded-full bg-surface border-2 border-midnight flex items-center justify-center text-[8px] font-bold text-text-muted">
                            +{n.groupData.count - n.groupData.avatars.length}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[9px] text-white/20 uppercase font-bold tracking-[2px]">
                        {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active Sync'}
                      </span>
                      <div className="h-px w-4 bg-white/5" />
                      <button 
                        onClick={(e) => handleDeleteNotification(e, n.id)}
                        className="text-[9px] text-white/10 hover:text-red-500 font-bold uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Terminate
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {notifications.length === 0 && (
                <div className="py-24 text-center">
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 bg-accent/5 blur-3xl rounded-full" />
                    <div className="relative w-full h-full rounded-full border border-white/5 flex items-center justify-center bg-black/20">
                       <Bell className="w-8 h-8 text-white/5" />
                    </div>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[4px] text-text-muted">Digital Silence</p>
                  <p className="text-[9px] uppercase tracking-[2px] text-white/10 mt-3 max-w-[200px] mx-auto leading-relaxed"> No archival signals have crossed the event horizon for your source yet.</p>
                </div>
              )}
            </div>
            
            <div className="p-8 border-t border-white/5 bg-surface/30">
               <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[3px] text-text-muted hover:text-white hover:bg-white/10 transition-all">
                Clear All Signals
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
