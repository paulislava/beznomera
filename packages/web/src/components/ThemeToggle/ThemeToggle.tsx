'use client';

import React from 'react';
import { useContext } from 'react';
import { ThemeContext } from '@/context/Theme/Theme.context';

export const ThemeToggle = () => {
  const { setTheme } = useContext(ThemeContext);

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setTheme(theme);
  };

  return (
    <div className='flex gap-2'>
      <button
        onClick={() => handleThemeChange('light')}
        className='px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600'
      >
        Светлая
      </button>
      <button
        onClick={() => handleThemeChange('dark')}
        className='px-3 py-1 rounded bg-gray-800 text-white hover:bg-gray-900'
      >
        Темная
      </button>
      <button
        onClick={() => handleThemeChange('system')}
        className='px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600'
      >
        Системная
      </button>
    </div>
  );
}; 