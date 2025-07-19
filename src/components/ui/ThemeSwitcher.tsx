'use client';

import { useEffect, useState } from 'react';
import { RiPaletteLine } from 'react-icons/ri';

const themes = [
  { value: '', label: 'Dark', icon: '🌙' },
  { value: 'theme-light', label: 'Light', icon: '☀️' },
];

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') || '';
    setCurrentTheme(savedTheme);
    
    // Apply theme to html element
    const htmlElement = document.documentElement;
    htmlElement.className = savedTheme;
  }, []);

  const handleThemeChange = (themeValue: string) => {
    setCurrentTheme(themeValue);
    localStorage.setItem('theme', themeValue);
    
    // Apply theme to html element
    const htmlElement = document.documentElement;
    htmlElement.className = themeValue;
    
    setIsOpen(false);
  };

  const currentThemeData = themes.find(t => t.value === currentTheme) || themes[0];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        {/* Theme Switcher Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-3 bg-background-card border border-border rounded-lg shadow-lg hover:bg-background-hover transition-colors"
          title="Switch theme"
        >
          <RiPaletteLine className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-text-primary">{currentThemeData.label}</span>
        </button>

        {/* Theme Options */}
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-64 bg-background-card border border-border rounded-lg shadow-xl overflow-hidden">
            <div className="p-2">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider px-2 py-1">
                Choose Theme
              </h3>
              {themes.map((theme) => {
                const isActive = theme.value === currentTheme;
                
                return (
                  <button
                    key={theme.value}
                    onClick={() => handleThemeChange(theme.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-background-hover text-text-primary'
                    }`}
                  >
                    <span className="text-xl flex-shrink-0">{theme.icon}</span>
                    <div className="text-left">
                      <div className="font-medium text-sm">{theme.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
