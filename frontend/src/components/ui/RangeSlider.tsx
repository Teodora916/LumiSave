import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  error?: boolean;
  className?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  error,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const calculateValue = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    let newValue = min + percent * (max - min);
    
    // Snapping to step
    if (step) {
      newValue = Math.round(newValue / step) * step;
    }
    
    // Ensure boundaries
    newValue = Math.max(min, Math.min(max, newValue));
    onChange(newValue);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    if (trackRef.current) {
      trackRef.current.setPointerCapture(e.pointerId);
    }
    calculateValue(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      calculateValue(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    if (trackRef.current) {
      trackRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div 
      className={cn(
        "relative w-full h-8 flex items-center cursor-pointer select-none touch-none",
        error && "animate-[shake_0.4s_ease-in-out]",
        className
      )}
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Background track */}
      <div className="absolute w-full h-2 rounded-full overflow-hidden bg-surface-border">
        {/* Fill track with gradient */}
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-100 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Thumb */}
      <div 
        className={cn(
          "absolute h-5 w-5 -ml-2.5 rounded-full bg-white border-2 border-primary shadow-sm transition-transform duration-100",
          isDragging ? "scale-110 shadow-md" : "hover:scale-110",
          error && "border-red-500"
        )}
        style={{ left: `${percentage}%` }}
      />
    </div>
  );
};
