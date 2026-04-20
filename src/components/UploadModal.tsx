import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Check, Image as ImageIcon } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Category, Pin } from '../types';
import LoadingScreen from './LoadingScreen';
import { GoogleGenAI, Type } from "@google/genai";
import { Sparkles, Brain, Cpu, Zap } from 'lucide-react';
import { COLORS, CATEGORIES } from '../constants';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES_PLACEHOLDER = []; // Replaced by constants

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const { user, profileData } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [detectedAspectRatio, setDetectedAspectRatio] = useState<'portrait' | 'landscape' | 'square'>('portrait');
  const [category, setCategory] = useState<Category>('Architecture');
  const [color, setColor] = useState('#FFFFFF');
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeImage = async (base64: string) => {
    if (!process.env.GEMINI_API_KEY) return;
    setIsAnalyzing(true);
    setAnalysisStatus('Initializing Neural Core...');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      setAnalysisStatus('Scanning Visual Vectors...');
      
      const hexList = COLORS.map(c => c.hex);
      const categoryList = CATEGORIES.join(', ');

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { data: base64.split(',')[1], mimeType: "image/jpeg" } },
            { text: `Analyze this image for dominant color vibes. Pick the one CLOSEST hex color from this specific list: [${hexList.join(', ')}]. Return a JSON object with: 'suggestedColor' (one of the hex codes) and 'category' (best fit from: ${categoryList}).` }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              suggestedColor: { type: Type.STRING }
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      // No longer auto-setting title and description based on user request
      if (CATEGORIES.includes(data.category as Category)) {
        setCategory(data.category as Category);
      }
      if (data.suggestedColor) {
        setColor(data.suggestedColor);
      }
    } catch (e) {
      console.warn("AI Analysis failed:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2000000) { // Check for reasonable input size first
        alert("Original image must be under 2MB for standard transmission.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200; // Optimal for high-res Pinterest-style feed
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Calculate high-fidelity aspect ratio
          const ratio = width / height;
          if (ratio > 1.1) {
            setDetectedAspectRatio('landscape');
          } else if (ratio < 0.9) {
            setDetectedAspectRatio('portrait');
          } else {
            setDetectedAspectRatio('square');
          }
          
          // Compress significantly to stay under 1MB base64
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setImageUrl(compressedBase64);
          analyzeImage(compressedBase64);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !imageUrl) return;

    setIsUploading(true);
    try {
      await addDoc(collection(db, 'pins'), {
        userId: user.uid,
        author: {
          name: profileData?.displayName || user.displayName || 'Anonymous',
          handle: profileData?.handle || user.email?.split('@')[0].toLowerCase() || 'void',
          avatar: profileData?.photoURL || user.photoURL || 'https://i.pravatar.cc/150'
        },
        title,
        description,
        imageUrl,
        category,
        color,
        aspectRatio: detectedAspectRatio,
        createdAt: serverTimestamp(),
        tags: [category],
        likesCount: 0,
        commentsCount: 0
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setTitle('');
        setDescription('');
        setImageUrl('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading. Check console.");
    } finally {
      setIsUploading(false);
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
            className="absolute inset-0 bg-midnight/80 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="font-display font-bold text-2xl text-text-main pb-1 border-b border-white/5">
                    Contribute to the Void
                  </h2>
                </div>
                {!isUploading && (
                  <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main">
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>

              {isUploading ? (
                <div className="py-12">
                  <LoadingScreen 
                    fullScreen={false} 
                    message="Encoding Signal..." 
                    subMessage="Compressing visual vectors and synchronizing frequency with the void archive" 
                  />
                </div>
              ) : isSuccess ? (
                <div className="py-20 flex flex-col items-center gap-4 text-center">
                  <div className="w-16 h-16 bg-white text-midnight rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8" />
                  </div>
                  <p className="font-display font-medium text-xl text-text-main">Signal Received</p>
                  <p className="text-xs text-text-muted tracking-widest uppercase">Your pin has been added to the network</p>
                </div>
              ) : (
                <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Side: Upload Zone */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-[2px] text-text-muted mb-3">Visual Media</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-[3/4] sm:aspect-square bg-midnight rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all overflow-hidden relative group"
                    >
                      {imageUrl ? (
                        <>
                          <img src={imageUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest text-text-muted">
                            {detectedAspectRatio}
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-midnight px-3 py-1 rounded">Change</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center text-text-muted">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div className="text-center px-6">
                            <p className="text-xs font-bold text-text-main mb-1">Upload from computer</p>
                            <p className="text-[10px] text-text-muted">Max size: 800KB</p>
                          </div>
                        </>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                  </div>

                  {/* Right Side: Details */}
                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[2px] text-text-muted mb-2">Title</label>
                      <input 
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Give it a name..."
                        className="w-full bg-midnight border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-white/30 transition-all text-text-main"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[2px] text-text-muted mb-2">Description</label>
                      <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Tell the void about this signal..."
                        rows={3}
                        className="w-full bg-midnight border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-white/30 transition-all text-text-main resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[2px] text-text-muted mb-2">Frequency (Category)</label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-tight border transition-all ${
                              category === cat 
                                ? 'bg-white text-midnight border-white' 
                                : 'border-border text-text-muted hover:text-text-main hover:border-white/20'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[2px] text-text-muted mb-2">Visual Spectrum (Color)</label>
                      <div className="flex flex-wrap gap-2">
                        {COLORS.map(c => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setColor(c.hex)}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${color === c.hex ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-transparent shadow-xl'}`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto">
                      <button 
                        disabled={isUploading || !imageUrl}
                        className="w-full bg-white text-midnight py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-accent transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {isUploading ? 'Transmitting...' : <><Upload className="w-4 h-4" /> Transmit Pin</>}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
