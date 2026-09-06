'use client';

import * as React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { setTheme } from '@/lib/redux/slices/uiSlice';
import { Button } from '@/components/ui/button';
import { ThemeType } from '@/types';

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('wm_theme') as ThemeType | null;
    const initialTheme: ThemeType = savedTheme || 'dark';
    dispatch(setTheme(initialTheme));
    applyTheme(initialTheme);
  }, [dispatch]);

  const applyTheme = (newTheme: ThemeType) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (newTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
      }
    } else {
      root.classList.add(newTheme);
    }
  };

  const handleToggle = () => {
    const nextTheme: ThemeType =
      theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    dispatch(setTheme(nextTheme));
    localStorage.setItem('wm_theme', nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleToggle}
      title={`Current theme: ${theme}. Click to switch.`}
      className="text-muted-foreground hover:text-foreground"
    >
      {theme === 'light' && <Sun className="h-4 w-4 text-amber-500" />}
      {theme === 'dark' && <Moon className="h-4 w-4 text-blue-400" />}
      {theme === 'system' && <Laptop className="h-4 w-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
