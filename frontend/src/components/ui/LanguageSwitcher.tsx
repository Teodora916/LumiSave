import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="relative inline-flex items-center">
      <Globe className="absolute left-2 h-4 w-4 text-text-muted pointer-events-none" />
      <select
        value={i18n.language || 'sr'}
        onChange={changeLanguage}
        className="h-10 appearance-none bg-transparent pl-8 pr-4 text-sm font-medium text-text-primary outline-none hover:text-accent focus:ring-0 cursor-pointer"
        aria-label="Select Language"
      >
        <option value="sr">SR</option>
        <option value="en">EN</option>
      </select>
    </div>
  );
};
