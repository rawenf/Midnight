import { Pin } from '../types';
import PinCard from './PinCard';
import { motion } from 'motion/react';

interface MasonryGridProps {
  pins: Pin[];
  onPinClick?: (pin: Pin) => void;
  isSelectionMode?: boolean;
  selectedIds?: string[];
  onToggleSelection?: (id: string) => void;
}

export default function MasonryGrid({ 
  pins, 
  onPinClick, 
  isSelectionMode, 
  selectedIds = [], 
  onToggleSelection 
}: MasonryGridProps) {
  return (
    <div className="px-4 py-4 w-full">
      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 2xl:columns-7 gap-4 space-y-4">
        {pins.map((pin, index) => (
          <motion.div
            key={pin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            className="break-inside-avoid"
          >
            <PinCard 
              pin={pin} 
              onCardClick={() => onPinClick?.(pin)}
              isSelectionMode={isSelectionMode}
              isSelected={selectedIds.includes(pin.id)}
              onToggleSelection={onToggleSelection}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
