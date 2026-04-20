import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Search, Image as ImageIcon, ChevronLeft, User, Phone, Video, MoreVertical, MessageSquare } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment, getDocs, limit, getDoc, setDoc } from 'firebase/firestore';

import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Mail } from 'lucide-react';

interface MessagesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialChatUserId?: string | null;
}

interface Chat {
  id: string;
  uids: string[];
  lastMessage: string;
  lastMessageAt: any;
  unreadCount?: { [uid: string]: number };
  participants?: {
    [uid: string]: {
      name: string;
      avatar: string;
    };
  };
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: any;
  imageUrl?: string;
}

export default function MessagesPanel({ isOpen, onClose, initialChatUserId }: MessagesPanelProps) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 0. Handle initial chat request
  useEffect(() => {
    if (!user || !isOpen || !initialChatUserId) return;

    const findOrCreateChat = async () => {
      // Look for existing chat
      const q = query(
        collection(db, 'chats'),
        where('uids', 'array-contains', user.uid)
      );
      const snap = await getDocs(q);
      const existingChat = snap.docs.find(d => {
        const uids = d.data().uids as string[];
        return uids.includes(initialChatUserId);
      });

      if (existingChat) {
        setActiveChat({ id: existingChat.id, ...existingChat.data() } as Chat);
      } else {
        // Fetch users info to build participant map
        const [meSnap, targetSnap] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getDoc(doc(db, 'users', initialChatUserId))
        ]);

        const meData = meSnap.data();
        const targetData = targetSnap.data();

        const newChatData = {
          uids: [user.uid, initialChatUserId],
          lastMessage: '',
          lastMessageAt: serverTimestamp(),
          participants: {
            [user.uid]: {
              name: meData?.displayName || user.displayName || 'Anonymous',
              avatar: meData?.photoURL || user.photoURL || ''
            },
            [initialChatUserId]: {
              name: targetData?.displayName || 'Anonymous',
              avatar: targetData?.photoURL || ''
            }
          }
        };

        const docRef = await addDoc(collection(db, 'chats'), newChatData);
        setActiveChat({ id: docRef.id, ...newChatData } as Chat);
      }
    };

    findOrCreateChat();
  }, [initialChatUserId, user, isOpen]);

  // 1. Fetch Chats list
  useEffect(() => {
    if (!user || !isOpen) return;

    const q = query(
      collection(db, 'chats'),
      where('uids', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Chat[];
      setChats(chatList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, isOpen]);

  // 2. Fetch Messages for active chat
  useEffect(() => {
    if (!activeChat || !isOpen) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, 'chats', activeChat.id, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgList);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    });

    return () => unsubscribe();
  }, [activeChat, isOpen]);

  // 3. Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeChat || !newMessage.trim()) return;

    const text = newMessage.trim();
    setNewMessage('');

    try {
      await addDoc(collection(db, 'chats', activeChat.id, 'messages'), {
        text,
        senderId: user.uid,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'chats', activeChat.id), {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        [`unreadCount.${activeChat.uids.find(id => id !== user.uid)}`]: increment(1)
      });
    } catch (err) {
      console.error("Transmission failed:", err);
    }
  };

  const getOtherParticipant = (chat: Chat) => {
    const otherUid = chat.uids.find(id => id !== user?.uid);
    return chat.participants?.[otherUid || ''] || { name: 'Void Signal', avatar: 'https://i.pravatar.cc/150' };
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
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-midnight border-l border-white/5 z-[90] shadow-2xl overflow-hidden flex"
          >
            {/* Sidebar: Chat List */}
            <div className={`w-full ${activeChat ? 'hidden md:flex' : 'flex'} flex-col border-r border-white/5`}>
              <div className="p-8 border-b border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold tracking-tight">Signal Channels</h2>
                  <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input 
                    type="text" 
                    placeholder="Search archives..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
                {chats.map(chat => {
                  const other = getOtherParticipant(chat);
                  return (
                    <div 
                      key={chat.id}
                      onClick={() => setActiveChat(chat)}
                      className={`flex gap-4 p-4 rounded-3xl transition-all cursor-pointer group border ${activeChat?.id === chat.id ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                    >
                      <div className="relative shrink-0">
                        <img src={other.avatar} className="w-12 h-12 rounded-full border border-white/10 object-cover" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-midnight" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-bold truncate">{other.name}</p>
                          <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest mt-1">
                            {chat.lastMessageAt?.toDate ? chat.lastMessageAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted truncate leading-relaxed">
                          {chat.lastMessage || 'Establish connection...'}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {chats.length === 0 && !isLoading && (
                  <div className="py-20 text-center opacity-30 px-8">
                    <MessageSquare className="w-8 h-8 mx-auto mb-4 text-white/20" />
                    <p className="text-[10px] uppercase font-bold tracking-[3px]">Void Hub Empty</p>
                    <p className="text-[8px] mt-2 uppercase tracking-[2px]">No archival signals detected in your private frequency</p>
                  </div>
                )}
              </div>
            </div>

            {/* Content: Chat Window */}
            <div className={`flex-1 flex flex-col bg-surface/30 backdrop-blur-3xl ${activeChat ? 'flex' : 'hidden md:flex items-center justify-center'}`}>
              {activeChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-6 border-b border-white/5 flex items-center justify-between bg-surface/50">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setActiveChat(null)} className="md:hidden p-2 -ml-2 text-text-muted hover:text-white">
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <div className="relative">
                        <img src={getOtherParticipant(activeChat).avatar} className="w-10 h-10 rounded-full border border-white/10" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-midnight" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{getOtherParticipant(activeChat).name}</p>
                        <p className="text-[9px] text-accent uppercase font-bold tracking-widest mt-0.5 animate-pulse">Syncing Connection</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="p-2.5 text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-all"><Phone className="w-4 h-4" /></button>
                       <button className="p-2.5 text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-all"><Video className="w-4 h-4" /></button>
                       <button className="p-2.5 text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-all"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-6">
                    <div className="flex flex-col items-center py-10 opacity-20">
                       <div className="w-12 h-px bg-white/20 mb-4" />
                       <p className="text-[9px] uppercase font-bold tracking-[4px]">Neural Bridge Established</p>
                       <p className="text-[7px] uppercase tracking-[2px] mt-1">End-to-end encrypted archival synchronization</p>
                    </div>

                    {messages.map((msg, idx) => {
                      const isMe = msg.senderId === user?.uid;
                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          key={msg.id} 
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] px-5 py-3.5 rounded-3xl text-sm leading-relaxed ${
                            isMe 
                              ? 'bg-accent text-white rounded-tr-none shadow-[0_10px_20px_rgba(var(--color-accent-rgb),0.2)]' 
                              : 'bg-white/10 text-text-main rounded-tl-none border border-white/5'
                          }`}>
                            <p>{msg.text}</p>
                            <span className={`text-[8px] mt-2 block opacity-40 font-bold uppercase tracking-widest ${isMe ? 'text-right' : 'text-left'}`}>
                               {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Syncing'}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Input Area */}
                  <div className="p-6 bg-surface/50 border-t border-white/5">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-midnight border border-white/10 rounded-3xl p-2.5 pr-4 pl-6 transition-all focus-within:border-accent">
                      <button type="button" className="text-text-muted hover:text-white transition-colors">
                        <ImageIcon className="w-4 h-4" />
                      </button>
                      <input 
                        className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-text-muted py-2"
                        placeholder="Broadcast message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <button 
                        type="submit" 
                        disabled={!newMessage.trim()}
                        className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all shadow-lg"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="text-center p-12 max-w-sm">
                  <div className="relative w-24 h-24 mx-auto mb-8">
                     <div className="absolute inset-0 bg-accent/20 blur-3xl animate-pulse rounded-full" />
                     <div className="relative w-full h-full rounded-full border border-white/5 bg-midnight/80 flex items-center justify-center">
                        <Mail className="w-8 h-8 text-white/10" />
                     </div>
                  </div>
                  <h3 className="text-lg font-display font-medium mb-3 tracking-tight">Signal Transmission Hub</h3>
                  <p className="text-xs text-text-muted leading-relaxed uppercase tracking-wider">Select a channel to begin secure archival synchronization with other identities in the void.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
