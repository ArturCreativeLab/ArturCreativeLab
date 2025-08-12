import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslations } from '../context/LanguageContext';
import { LogoutIcon } from './icons/LogoutIcon';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useTranslations();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <header className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 md:px-8 py-3 flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <div className="flex items-center space-x-4">
        <button
            onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
            className="text-xs font-bold text-gray-500 hover:text-orange-600 transition-colors bg-gray-200/80 rounded-md w-8 h-8 flex items-center justify-center"
        >
            {language.toUpperCase()}
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 rounded-full hover:bg-gray-200/80 p-1 pr-3 transition-colors"
          >
            <img
              src={user.picture}
              alt={user.name}
              className="w-9 h-9 rounded-full"
            />
            <span className="text-gray-800 font-medium text-sm hidden sm:block">{user.name}</span>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
              <button
                onClick={logout}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogoutIcon />
                <span className="ml-3">{t.header.logout}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};