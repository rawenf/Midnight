import { motion } from 'motion/react';
import { Category } from '../types';
import { Clock, TrendingUp } from 'lucide-react';

interface CategoryBarProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  sortOrder: 'newest' | 'trending';
  onSortChange: (order: 'newest' | 'trending') => void;
  feedMode: 'discovery' | 'for-you';
  onFeedModeChange: (mode: 'discovery' | 'for-you') => void;
}

const CATEGORIES: Category[] = ['All', 'Architecture', 'Cyberpunk', 'Street', 'Interior', 'Neon'];

export default function CategoryBar({ 
  activeCategory, 
  onCategoryChange, 
  sortOrder, 
  onSortChange, 
  feedMode, 
  onFeedModeChange
}: CategoryBarProps) {
  return (
    <div className="flex flex-col gap-6 px-6 sm:px-10 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {/* Feed Mode Switcher */}
        <div className="flex items-center bg-white/5 border border-white/5 rounded-2xl p-1.5 self-start">
          <button 
            onClick={() => onFeedModeChange('discovery')}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${feedMode === 'discovery' ? 'bg-white text-midnight shadow-lg' : 'text-text-muted hover:text-white'}`}
          >
            Discovery
          </button>
          <button 
            onClick={() => onFeedModeChange('for-you')}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${feedMode === 'for-you' ? 'bg-white text-midnight shadow-lg' : 'text-text-muted hover:text-white'}`}
          >
            For You
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-surface border border-border rounded-full p-1 shrink-0">
            <button 
              onClick={() => onSortChange('newest')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${sortOrder === 'newest' ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white/60'}`}
            >
              <Clock className="w-3 h-3" /> New
            </button>
            <button 
              onClick={() => onSortChange('trending')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${sortOrder === 'trending' ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white/60'}`}
            >
              <TrendingUp className="w-3 h-3" /> Trending
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar -mx-2 px-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-5 py-2.5 rounded-full text-[13px] font-medium tracking-tight border transition-all duration-200 relative whitespace-nowrap ${
              activeCategory === category
                ? 'bg-text-main text-midnight border-text-main shadow-lg shadow-white/10'
                : 'border-border text-text-muted hover:border-white/20 hover:text-text-main'
            }`}
          >
            {category === 'All' ? 'Frequencies' : category}
          </button>
        ))}
      </div>
    </div>
  );
}
