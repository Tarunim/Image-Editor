
import React, { useState } from 'react';

interface AnimatePanelProps {
  onAnimate: (prompt: string) => void;
  isLoading: boolean;
  disabled: boolean;
}

export default function AnimatePanel({
  onAnimate,
  isLoading,
  disabled,
}: AnimatePanelProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onAnimate(prompt.trim());
      setPrompt('');
    }
  };

  return (
    <div className="p-4 bg-[var(--color-background-secondary)] h-full flex flex-col space-y-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Animate Image</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="animation-prompt" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Animation Prompt
          </label>
          <textarea
            id="animation-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={disabled ? "Select an image first" : "e.g., gentle steam rising, clouds drifting slowly, hair blowing in the wind..."}
            disabled={isLoading || disabled}
            rows={4}
            className="w-full bg-[var(--color-background-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || disabled || !prompt.trim()}
          className="w-full bg-[var(--color-accent)] hover:opacity-90 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Animating...' : 'Animate Image'}
        </button>
      </form>
      
      <div className="flex-grow flex items-center">
        <p className="text-sm text-[var(--color-text-secondary)] text-center">
          Describe the motion you want to see in the selected input image. Video generation can take several minutes.
        </p>
      </div>
    </div>
  );
}
