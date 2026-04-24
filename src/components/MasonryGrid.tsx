import { Pin } from '../types';
import PinCard from './PinCard';
import { motion } from 'motion/react';
import { memo } from 'react';

interface MasonryItemProps {
  pin: Pin;
  index: number;
  onPinClick?: (pin: Pin) => void;
  isSelectionMode?: boolean;
  isSelected: boolean;
  onToggleSelection?: (id: string) => void;
}

// ⚡ Bolt: Memoize individual grid items to prevent unnecessary re-renders of all pins
// when new pins are loaded via infinite scroll or when parent state changes.
const MasonryItem = memo(
  ({ pin, index, onPinClick, isSelectionMode, isSelected, onToggleSelection }: MasonryItemProps) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="break-inside-avoid"
    >
      <PinCard
        pin={pin}
        onCardClick={() => onPinClick?.(pin)}
        isSelectionMode={isSelectionMode}
        isSelected={isSelected}
        onToggleSelection={onToggleSelection}
      />
    </motion.div>
  ),
  (prev, next) =>
    prev.pin === next.pin &&
    prev.isSelectionMode === next.isSelectionMode &&
    prev.isSelected === next.isSelected &&
    prev.onPinClick === next.onPinClick &&
    prev.onToggleSelection === next.onToggleSelection
);

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
          <MasonryItem
            key={pin.id}
            pin={pin}
            index={index}
            onPinClick={onPinClick}
            isSelectionMode={isSelectionMode}
            isSelected={selectedIds.includes(pin.id)}
            onToggleSelection={onToggleSelection}
          />
        ))}
      </div>
    </div>
  );
}
