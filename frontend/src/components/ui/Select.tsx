import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Izaberite...',
  error,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full text-sm", className)} ref={containerRef}>
      <div 
        className={cn(
          "flex items-center justify-between min-h-10 w-full rounded-md border bg-surface-card px-3 py-2 cursor-pointer transition-all duration-200 outline-none",
          isOpen ? "border-primary ring-1 ring-primary" : "border-surface-border",
          error && "border-red-500 animate-[shake_0.4s_ease-in-out]",
          !value && "text-text-muted"
        )}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setIsOpen(!isOpen);
        }}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 text-text-muted transition-transform duration-200", isOpen && "rotate-180")} />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-surface-border bg-surface-card shadow-md max-h-60 overflow-auto animate-in fade-in zoom-in-95">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-text-muted">Nema opcija</div>
          ) : (
            options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex flex-col px-3 py-2 cursor-pointer hover:bg-surface-subtle transition-colors",
                  option.value === value && "bg-surface-subtle text-primary font-medium"
                )}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span>{option.label}</span>
                {option.description && (
                  <span className="text-xs text-text-muted mt-0.5">{option.description}</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
