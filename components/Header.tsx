import React from 'react';
import { Theme } from '../types';

interface HeaderProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    editorLayout: 'vertical' | 'horizontal';
    onToggleLayout: () => void;
}

export default function Header({ theme, setTheme, editorLayout, onToggleLayout }: HeaderProps) {
  return (
    <header className="p-4 bg-[var(--color-background-secondary)] border-b border-[var(--color-border)] h-20 flex items-center justify-between z-10">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Gemini AI Image Editor</h1>
        <p className="text-[var(--color-text-secondary)]">Advanced image editing powered by Gemini</p>
      </div>
      <div className="flex items-center space-x-4">
        <button 
          onClick={onToggleLayout}
          title="Toggle Layout"
          className="p-2 rounded-md hover:bg-[var(--color-background-tertiary)] transition-colors text-[var(--color-text-primary)]"
        >
          {editorLayout === 'vertical' ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 14v-2m-5 2v-2m-5 2v-2m15 5H3a2 2 0 01-2-2V7a2 2 0 012-2h18a2 2 0 012 2v10a2 2 0 01-2 2z" />
            </svg>
          )}
        </button>
        <div className="relative">
          <label htmlFor="theme-select" className="sr-only">Select Theme</label>
          <select
              id="theme-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
              className="bg-[var(--color-background-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-md py-2 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
              <option value={Theme.DARK}>Dark</option>
              <option value={Theme.LIGHT}>Light</option>
              <option value={Theme.BLUE}>Blue</option>
              <option value={Theme.FOREST}>Forest</option>
              <option value={Theme.SUNSET}>Sunset</option>
              <option value={Theme.MONOCHROME}>Monochrome</option>
              <option value={Theme.RETRO}>Retro</option>
          </select>
        </div>
      </div>
    </header>
  );
}