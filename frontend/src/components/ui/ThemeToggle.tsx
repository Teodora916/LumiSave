import React from 'react';
import { useUiStore } from '@/stores/uiStore';
import { Sun, Moon } from 'lucide-react';
import { Button } from './button';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useUiStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative overflow-hidden"
    >
      <div 
        className={`transition-all duration-300 transform ${
          theme === 'dark' ? '-translate-y-10 opacity-0' : 'translate-y-0 opacity-100'
        } absolute`}
      >
        <Sun className="h-5 w-5" />
      </div>
      <div 
        className={`transition-all duration-300 transform ${
          theme === 'light' ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'
        } absolute`}
      >
        <Moon className="h-5 w-5" />
      </div>
    </Button>
  );
};
