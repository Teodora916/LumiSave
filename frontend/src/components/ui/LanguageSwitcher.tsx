import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'sr', name: 'Srpski', flag: '🇷🇸' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ];

  const currentLanguage = languages.find((lang) => lang.code === (i18n.language || 'sr')) || languages[0];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            "group flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 outline-none",
            "bg-surface-subtle border border-surface-border hover:border-primary/50 hover:bg-surface-card shadow-sm"
          )}
          aria-label="Change language"
        >
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Globe className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            {currentLanguage.code}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          asChild
          sideOffset={8}
          align="end"
          className="z-50 min-w-[160px] p-1 bg-surface-card/80 backdrop-blur-xl border border-surface-border rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200"
        >
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
          >
            {languages.map((lang) => (
              <DropdownMenu.Item
                key={lang.code}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer outline-none transition-colors",
                  currentLanguage.code === lang.code
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
                )}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg leading-none">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {currentLanguage.code === lang.code && (
                  <Check className="w-4 h-4" />
                )}
              </DropdownMenu.Item>
            ))}
          </motion.div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
