'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem('metro_theme') as 'light' | 'dark') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('metro_theme', nextTheme);
  }

  if (!mounted) {
    return (
      <div 
        style={{ width: '36px', height: '36px', borderRadius: '4px', border: '1px solid var(--border)' }} 
        aria-hidden="true" 
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      type="button"
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      aria-label="Toggle color theme"
    >
      {theme === 'light' ? (
        <Moon size={16} />
      ) : (
        <Sun size={16} />
      )}
      <span className="theme-toggle-text">{theme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  );
}
